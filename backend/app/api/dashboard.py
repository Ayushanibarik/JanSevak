from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.grievance import Grievance, Department, GrievanceStatus, Priority
from app.models.user import User
from app.api.auth import get_current_user
from app.schemas.grievance import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Role-specific dashboard statistics."""
    base_query = db.query(Grievance)

    # Filter by officer's jurisdiction
    if current_user.role not in ["minister", "state_secretary", "district_collector"]:
        if current_user.department:
            base_query = base_query.filter(Grievance.department == current_user.department)
        if current_user.ward_number:
            base_query = base_query.filter(Grievance.ward_number == current_user.ward_number)

    total = base_query.count()
    pending = base_query.filter(Grievance.status.in_([
        GrievanceStatus.SUBMITTED, GrievanceStatus.AI_VERIFIED, GrievanceStatus.ASSIGNED
    ])).count()
    in_progress = base_query.filter(Grievance.status.in_([
        GrievanceStatus.ACCEPTED, GrievanceStatus.INSPECTION,
        GrievanceStatus.WORK_ORDER, GrievanceStatus.IN_PROGRESS
    ])).count()
    resolved = base_query.filter(Grievance.status.in_([
        GrievanceStatus.COMPLETED, GrievanceStatus.CITIZEN_VERIFIED, GrievanceStatus.CLOSED
    ])).count()
    overdue = base_query.filter(
        Grievance.escalation_deadline < datetime.utcnow(),
        Grievance.status.notin_([GrievanceStatus.CLOSED, GrievanceStatus.COMPLETED,
                                  GrievanceStatus.CITIZEN_VERIFIED, GrievanceStatus.REJECTED])
    ).count()
    critical = base_query.filter(Grievance.priority == Priority.CRITICAL).count()
    today = base_query.filter(
        func.date(Grievance.created_at) == datetime.utcnow().date()
    ).count()

    # Department breakdown
    dept_counts = db.query(
        Grievance.department, func.count(Grievance.id)
    ).group_by(Grievance.department).all()
    dept_breakdown = {d.value if hasattr(d, 'value') else str(d): c for d, c in dept_counts}

    return DashboardStats(
        total_grievances=total,
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        overdue=overdue,
        critical=critical,
        avg_resolution_hours=None,
        department_breakdown=dept_breakdown,
        today_count=today,
    )


def map_cpgrams_department(dept_name: str) -> str:
    mapping = {
        "Agriculture & Farmers Welfare": "government_services",
        "Water Resources": "water_supply",
        "Roads & Highways": "roads",
        "Communications": "government_services",
        "Railways": "transport",
        "Labour & Employment": "government_services",
        "Finance": "government_services",
        "Electronics & IT": "government_services",
        "Water Supply": "water_supply",
        "Petroleum & Gas": "other"
    }
    return mapping.get(dept_name, "other")


@router.get("/public")
def get_public_stats(db: Session = Depends(get_db)):
    """Public transparency dashboard — no auth required, no PII."""
    total = db.query(Grievance).count()
    resolved = db.query(Grievance).filter(Grievance.status.in_([
        GrievanceStatus.CLOSED, GrievanceStatus.COMPLETED, GrievanceStatus.CITIZEN_VERIFIED
    ])).count()

    dept_counts = db.query(
        Grievance.department, func.count(Grievance.id)
    ).group_by(Grievance.department).all()
    
    dept_breakdown = {}
    for d, c in dept_counts:
        key = d.value if hasattr(d, 'value') else str(d)
        dept_breakdown[key] = c

    priority_counts = db.query(
        Grievance.priority, func.count(Grievance.id)
    ).group_by(Grievance.priority).all()
    
    priority_breakdown = {}
    for p, c in priority_counts:
        key = p.value if hasattr(p, 'value') else str(p)
        priority_breakdown[key] = c

    # Sync with CPGRAMS by default
    try:
        from app.api.gis import get_cpgrams_grievances
        cpgrams = get_cpgrams_grievances()
    except Exception:
        cpgrams = []

    total += len(cpgrams)
    for g in cpgrams:
        # CPGRAMS status mapping (assume resolved if completed, citizen_verified, closed)
        status_val = g.get("status")
        if status_val in ["completed", "citizen_verified", "closed"]:
            resolved += 1
            
        # Map and update department count
        mapped_dept = map_cpgrams_department(g.get("department"))
        dept_breakdown[mapped_dept] = dept_breakdown.get(mapped_dept, 0) + 1
        
        # Map and update priority count
        prio_val = g.get("priority")
        if prio_val:
            priority_breakdown[prio_val] = priority_breakdown.get(prio_val, 0) + 1

    return {
        "total_grievances": total,
        "resolved": resolved,
        "resolution_rate": round(resolved / total * 100, 1) if total > 0 else 0,
        "department_breakdown": dept_breakdown,
        "priority_breakdown": priority_breakdown,
    }

