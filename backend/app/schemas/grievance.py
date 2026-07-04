from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.grievance import Department, GrievanceStatus, Priority


# ─── Grievance Creation (Citizen submits) ────────────────────────────
class GrievanceCreate(BaseModel):
    department: Department
    sub_category: str
    title: str = Field(..., max_length=500)
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    ward_number: Optional[str] = None
    district_code: str = "BBSR"
    pincode: Optional[str] = None
    is_emergency: bool = False
    is_anonymous: bool = False


# ─── Public Grievance Response (no PII) ──────────────────────────────
class GrievancePublicResponse(BaseModel):
    grievance_token: str
    department: Department
    sub_category: str
    title: str
    description: str
    status: GrievanceStatus
    priority: Priority
    is_emergency: bool
    district_code: str
    ward_number: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    # NO reporter name, phone, email — privacy by design

    class Config:
        from_attributes = True


# ─── Full Grievance Response (for officers) ──────────────────────────
class GrievanceOfficerResponse(GrievancePublicResponse):
    id: int
    reporter_id: Optional[int]
    assigned_officer_id: Optional[int]
    current_hierarchy_level: int
    escalation_deadline: Optional[datetime]
    latitude: float
    longitude: float
    address: Optional[str]
    pincode: Optional[str]
    image_url: Optional[str]
    video_url: Optional[str]
    audio_url: Optional[str]
    document_url: Optional[str]
    ai_department_suggestion: Optional[str]
    ai_priority_suggestion: Optional[str]
    ai_summary: Optional[str]
    ai_confidence: Optional[float]
    is_duplicate_of: Optional[int]
    citizen_feedback_rating: Optional[int]
    citizen_feedback_text: Optional[str]
    resolution_proof_url: Optional[str]
    resolution_notes: Optional[str]


# ─── Status Update (officer changes status) ──────────────────────────
class GrievanceStatusUpdate(BaseModel):
    new_status: GrievanceStatus
    notes: str = Field(..., min_length=5, description="Reason for status change (mandatory)")


# ─── Citizen Feedback ────────────────────────────────────────────────
class GrievanceFeedback(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    feedback_text: Optional[str] = None


# ─── Timeline Entry Response ─────────────────────────────────────────
class TimelineEntryResponse(BaseModel):
    id: int
    old_status: Optional[str]
    new_status: str
    action_type: str
    notes: Optional[str]
    changed_at: datetime
    changed_by_role: Optional[str] = None  # role label, not name

    class Config:
        from_attributes = True


# ─── Escalation Log Response ─────────────────────────────────────────
class EscalationLogResponse(BaseModel):
    id: int
    from_level: int
    to_level: int
    reason: str
    is_auto: bool
    escalated_at: datetime

    class Config:
        from_attributes = True


# ─── Token Tracking Response (what citizen sees) ─────────────────────
class GrievanceTrackingResponse(BaseModel):
    grievance_token: str
    department: Department
    sub_category: str
    title: str
    status: GrievanceStatus
    priority: Priority
    is_emergency: bool
    district_code: str
    created_at: datetime
    timeline: List[TimelineEntryResponse]


# ─── Dashboard Statistics ────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_grievances: int
    pending: int
    in_progress: int
    resolved: int
    overdue: int
    critical: int
    avg_resolution_hours: Optional[float]
    department_breakdown: dict  # {dept_name: count}
    today_count: int
