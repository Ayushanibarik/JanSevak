from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.grievance import Grievance, Department, GrievanceStatus, Priority, DEPARTMENT_SUBCATEGORIES
from app.models.grievance_timeline import GrievanceTimeline
from app.models.user import User, RoleEnum
from app.schemas.grievance import (
    GrievanceCreate, GrievancePublicResponse, GrievanceOfficerResponse,
    GrievanceStatusUpdate, GrievanceFeedback, TimelineEntryResponse,
    GrievanceTrackingResponse,
)
from app.api.auth import get_current_user
from app.core.token_generator import generate_grievance_token
from app.core.permissions import check_permission_or_raise, has_permission
from app.core.ai_classifier import classify_grievance_text, run_image_yolo_inference, get_sbert_embeddings

router = APIRouter(prefix="/grievances", tags=["Grievances"])


# ─── POST /grievances/ — Register new grievance ─────────────────────
@router.post("/", response_model=GrievancePublicResponse)
async def create_grievance(
    department: Department = Form(...),
    sub_category: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    district_code: str = Form("BBSR"),
    ward_number: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    pincode: Optional[str] = Form(None),
    is_emergency: bool = Form(False),
    is_anonymous: bool = Form(False),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None,
):
    check_permission_or_raise(current_user.role, "register_grievance")

    # Validate sub_category belongs to department
    valid_subs = DEPARTMENT_SUBCATEGORIES.get(department, [])
    if sub_category not in valid_subs and sub_category != "other":
        raise HTTPException(400, f"Invalid sub_category '{sub_category}' for department '{department.value}'")

    # Generate unique token
    token = generate_grievance_token(db, department, district_code)

    # Handle image upload (save to local filesystem)
    image_url = None
    filepath = None
    if image:
        import uuid, os
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        ext = image.filename.split('.')[-1] if image.filename else "jpg"
        fname = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(upload_dir, fname)
        content = await image.read()
        with open(filepath, "wb") as f:
            f.write(content)
        image_url = f"/uploads/{fname}"

    # ── AI Auto-Classification & Analysis ──
    from app.core.ocr import perform_ocr
    from app.core.translation import detect_language, translate_to_english
    from app.core.spam_detection import is_spam, cross_check_gps_with_text
    from app.core.ner_sentiment import get_ner_entities, get_sentiment
    from app.core.vision import analyze_civic_image
    
    # 1. OCR (If image is provided and description is short)
    if filepath and len(description) < 20:
        ocr_text = perform_ocr(filepath)
        if ocr_text:
            description += f" [Extracted from image: {ocr_text}]"
            
    combined_text = f"{title} {description}"
    
    # 2. Spam Detection
    if is_spam(combined_text):
        raise HTTPException(400, "Submission flagged as spam.")
        
    # 3. Translation
    src_lang = detect_language(combined_text)
    english_text = translate_to_english(combined_text, src_lang)
    
    # 4. Topic Classification (DistilBERT)
    ai_result = await classify_grievance_text(english_text)
    
    # 5. NER & Sentiment
    entities = get_ner_entities(english_text)
    sentiment_scores = get_sentiment(english_text)
    
    # 6. GPS Cross-Check
    if latitude and longitude and not cross_check_gps_with_text((latitude, longitude), entities['locations']):
        # If it fails, maybe we just flag it instead of rejecting
        print(f"Warning: GPS mismatch for {title}")
        
    # 7. Vision (YOLOv8 + UNet)
    if filepath:
        vision_results = analyze_civic_image(filepath)
        if vision_results["potholes"] > 0:
            department = Department.ROADS
            sub_category = "potholes"
        elif vision_results["garbage_piles"] > 0:
            department = Department.SANITATION
            sub_category = "garbage_not_collected"
            
    # Merge emergency indicators from text, sentiment, and vision
    final_is_emergency = is_emergency or ai_result.get("is_emergency", False) or sentiment_scores["is_urgent"]
    priority = Priority.CRITICAL if final_is_emergency else Priority.MEDIUM

    # SBERT Embedding for semantic search and duplicate detection
    embeddings = get_sbert_embeddings(english_text)
    
    # Check for duplicate complaint using cosine similarity (threshold 0.85)
    is_duplicate_of = None
    if embeddings:
        try:
            # Query similar grievances in the same district using pgvector
            from sqlalchemy import select
            similar_grievance = db.query(Grievance).filter(
                Grievance.district_code == district_code,
                Grievance.embedding.cosine_distance(embeddings) < 0.15
            ).first()
            if similar_grievance:
                is_duplicate_of = similar_grievance.id
        except Exception as e:
            logger.warning(f"pgvector cosine similarity query failed: {e}")

    # Create grievance
    grievance = Grievance(
        grievance_token=token,
        department=department,
        sub_category=sub_category,
        title=title,
        description=description,
        status=GrievanceStatus.SUBMITTED,
        priority=priority,
        is_emergency=final_is_emergency,
        latitude=latitude,
        longitude=longitude,
        address=address,
        ward_number=ward_number,
        district_code=district_code,
        pincode=pincode,
        geom=f"SRID=4326;POINT({longitude} {latitude})",
        image_url=image_url,
        is_anonymous=is_anonymous,
        reporter_id=current_user.id if not is_anonymous else None,
        current_hierarchy_level=1,
        escalation_deadline=datetime.utcnow() + timedelta(hours=4 if final_is_emergency else 48),
        embedding=embeddings,
        ai_department_suggestion=ai_result.get("department"),
        ai_priority_suggestion=ai_result.get("priority"),
        ai_summary=ai_result.get("summary"),
        ai_confidence=ai_img_conf if filepath else 0.8,
        is_duplicate_of=is_duplicate_of
    )

    db.add(grievance)
    db.flush()  # get the ID

    # Create initial timeline entry
    timeline = GrievanceTimeline(
        grievance_id=grievance.id,
        old_status=None,
        new_status=GrievanceStatus.SUBMITTED.value,
        changed_by_id=current_user.id,
        action_type="status_change",
        notes="Grievance submitted by citizen. AI classification and duplicate check complete.",
        ip_address=request.client.host if request and request.client else None,
    )
    db.add(timeline)
    db.commit()
    db.refresh(grievance)
    return grievance


# ─── GET /grievances/{token} — Public tracking (no PII) ─────────────
@router.get("/{token}", response_model=GrievancePublicResponse)
def get_grievance_by_token(token: str, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.grievance_token == token).first()
    if not grievance:
        raise HTTPException(404, "Grievance not found. Please check your token ID.")
    return grievance


# ─── GET /grievances/{token}/timeline — Full audit trail ─────────────
@router.get("/{token}/timeline", response_model=List[TimelineEntryResponse])
def get_grievance_timeline(token: str, db: Session = Depends(get_db)):
    grievance = db.query(Grievance).filter(Grievance.grievance_token == token).first()
    if not grievance:
        raise HTTPException(404, "Grievance not found")
    entries = db.query(GrievanceTimeline).filter(
        GrievanceTimeline.grievance_id == grievance.id
    ).order_by(GrievanceTimeline.changed_at.asc()).all()
    return entries


# ─── GET /grievances/ — Officer dashboard list ──────────────────────
@router.get("/", response_model=List[GrievancePublicResponse])
def list_grievances(
    department: Optional[Department] = None,
    status_filter: Optional[GrievanceStatus] = None,
    priority_filter: Optional[Priority] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Grievance)
    if department:
        query = query.filter(Grievance.department == department)
    if status_filter:
        query = query.filter(Grievance.status == status_filter)
    if priority_filter:
        query = query.filter(Grievance.priority == priority_filter)
    if district:
        query = query.filter(Grievance.district_code == district)
    return query.order_by(Grievance.created_at.desc()).limit(200).all()


# ─── PATCH /grievances/{token}/status — Status transition ────────────
@router.patch("/{token}/status", response_model=GrievancePublicResponse)
def update_grievance_status(
    token: str,
    update: GrievanceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None,
):
    grievance = db.query(Grievance).filter(Grievance.grievance_token == token).first()
    if not grievance:
        raise HTTPException(404, "Grievance not found")

    # Permission check based on new status
    action_map = {
        GrievanceStatus.ACCEPTED: "accept_grievance",
        GrievanceStatus.REJECTED: "reject_grievance",
        GrievanceStatus.CLOSED: "close_grievance",
        GrievanceStatus.FALSE_COMPLAINT: "mark_false",
    }
    required_action = action_map.get(update.new_status, "add_notes")
    check_permission_or_raise(current_user.role, required_action)

    old_status = grievance.status.value if grievance.status else None

    # Create audit trail BEFORE changing status
    timeline = GrievanceTimeline(
        grievance_id=grievance.id,
        old_status=old_status,
        new_status=update.new_status.value,
        changed_by_id=current_user.id,
        action_type="status_change",
        notes=update.notes,
        ip_address=request.client.host if request and request.client else None,
    )
    db.add(timeline)

    grievance.status = update.new_status
    grievance.updated_at = datetime.utcnow()

    # Reset escalation deadline on status change
    if update.new_status in [GrievanceStatus.ASSIGNED, GrievanceStatus.ACCEPTED]:
        grievance.escalation_deadline = datetime.utcnow() + timedelta(
            hours=4 if grievance.is_emergency else 48
        )

    db.commit()
    db.refresh(grievance)
    return grievance


# ─── POST /grievances/{token}/feedback — Citizen rating ──────────────
@router.post("/{token}/feedback", response_model=GrievancePublicResponse)
def submit_feedback(
    token: str,
    feedback: GrievanceFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_permission_or_raise(current_user.role, "provide_feedback")

    grievance = db.query(Grievance).filter(Grievance.grievance_token == token).first()
    if not grievance:
        raise HTTPException(404, "Grievance not found")

    grievance.citizen_feedback_rating = feedback.rating
    grievance.citizen_feedback_text = feedback.feedback_text

    # Log feedback in timeline
    timeline = GrievanceTimeline(
        grievance_id=grievance.id,
        old_status=grievance.status.value,
        new_status=grievance.status.value,
        changed_by_id=current_user.id,
        action_type="feedback_received",
        notes=f"Rating: {feedback.rating}/5. {feedback.feedback_text or ''}",
    )
    db.add(timeline)

    # Auto-create appeal on poor rating (1 or 2 stars)
    if feedback.rating <= 2:
        grievance.status = GrievanceStatus.APPEALED
        appeal_timeline = GrievanceTimeline(
            grievance_id=grievance.id,
            old_status=grievance.status.value,
            new_status=GrievanceStatus.APPEALED.value,
            changed_by_id=current_user.id,
            action_type="appeal_filed",
            notes=f"Auto-appeal created due to poor citizen feedback ({feedback.rating}/5)",
        )
        db.add(appeal_timeline)

    db.commit()
    db.refresh(grievance)
    return grievance


# ─── POST /grievances/{token}/escalate — Manual escalation ───────────
@router.post("/{token}/escalate", response_model=GrievancePublicResponse)
def escalate_grievance(
    token: str,
    reason: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_permission_or_raise(current_user.role, "escalate")

    grievance = db.query(Grievance).filter(Grievance.grievance_token == token).first()
    if not grievance:
        raise HTTPException(404, "Grievance not found")

    from app.models.escalation_log import EscalationLog
    old_level = grievance.current_hierarchy_level
    new_level = min(old_level + 1, 8)

    esc_log = EscalationLog(
        grievance_id=grievance.id,
        from_officer_id=grievance.assigned_officer_id,
        to_officer_id=None,
        from_level=old_level,
        to_level=new_level,
        reason=reason,
        is_auto=False,
    )
    db.add(esc_log)

    grievance.current_hierarchy_level = new_level
    grievance.escalation_deadline = datetime.utcnow() + timedelta(
        hours=4 if grievance.is_emergency else 48
    )

    timeline = GrievanceTimeline(
        grievance_id=grievance.id,
        old_status=grievance.status.value,
        new_status=grievance.status.value,
        changed_by_id=current_user.id,
        action_type="escalation",
        notes=f"Manually escalated from level {old_level} to {new_level}. Reason: {reason}",
    )
    db.add(timeline)

    db.commit()
    db.refresh(grievance)
    return grievance
