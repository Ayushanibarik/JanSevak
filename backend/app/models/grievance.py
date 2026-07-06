from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from sqlalchemy.dialects.postgresql import ARRAY
import enum


# ─── 13 Department Categories ────────────────────────────────────────
class Department(str, enum.Enum):
    WATER_SUPPLY = "water_supply"
    ELECTRICITY = "electricity"
    ROADS = "roads"
    DRAINAGE = "drainage"
    SANITATION = "sanitation"
    ENVIRONMENT = "environment"
    PUBLIC_SAFETY = "public_safety"
    GOVERNMENT_SERVICES = "government_services"
    DISASTER = "disaster"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    TRANSPORT = "transport"
    OTHER = "other"


# ─── Sub-category mapping (used for validation & AI classification) ──
DEPARTMENT_SUBCATEGORIES = {
    Department.WATER_SUPPLY: [
        "no_water_supply", "low_water_pressure", "dirty_drinking_water",
        "water_leakage", "pipeline_burst", "overflowing_water_tank",
        "illegal_water_connection",
    ],
    Department.ELECTRICITY: [
        "power_outage", "transformer_damaged", "electric_pole_damaged",
        "hanging_live_wire", "street_light_not_working", "meter_issue",
        "voltage_fluctuation",
    ],
    Department.ROADS: [
        "potholes", "road_collapse", "broken_divider", "road_blockage",
        "construction_debris", "dangerous_intersection",
    ],
    Department.DRAINAGE: [
        "drain_overflow", "sewer_blockage", "waterlogging",
        "open_manhole", "drain_damage",
    ],
    Department.SANITATION: [
        "garbage_not_collected", "overflowing_dustbin", "dead_animal",
        "public_toilet_issue", "waste_burning",
    ],
    Department.ENVIRONMENT: [
        "fallen_tree", "illegal_tree_cutting", "air_pollution",
        "noise_pollution",
    ],
    Department.PUBLIC_SAFETY: [
        "broken_traffic_signal", "missing_road_sign",
        "illegal_encroachment", "unsafe_building",
    ],
    Department.GOVERNMENT_SERVICES: [
        "delay_in_certificate", "pension_issue", "ration_issue",
        "aadhaar_issue", "municipal_tax_issue",
    ],
    Department.DISASTER: [
        "flood", "fire", "landslide", "cyclone", "building_collapse",
    ],
    Department.HEALTHCARE: [
        "hospital_sanitation", "medicine_unavailable",
        "ambulance_delay", "phc_closed",
    ],
    Department.EDUCATION: [
        "school_infrastructure", "mid_day_meal", "teacher_absent",
    ],
    Department.TRANSPORT: [
        "bus_stop_damage", "public_transport_complaint", "parking_issue",
    ],
    Department.OTHER: [
        "other",
    ],
}


# ─── Grievance Status — NO deletion, status-transition only ─────────
class GrievanceStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    AI_VERIFIED = "ai_verified"
    ASSIGNED = "assigned"
    ACCEPTED = "accepted"
    INSPECTION = "inspection"
    WORK_ORDER = "work_order"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CITIZEN_VERIFIED = "citizen_verified"
    CLOSED = "closed"
    REJECTED = "rejected"
    DUPLICATE = "duplicate"
    WITHDRAWN = "withdrawn"
    FALSE_COMPLAINT = "false_complaint"
    APPEALED = "appealed"


# ─── Priority Levels ─────────────────────────────────────────────────
class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"  # triggers emergency dispatch


# ─── Department Code Mapping (for token generation) ──────────────────
DEPT_CODES = {
    Department.WATER_SUPPLY: "WS",
    Department.ELECTRICITY: "EL",
    Department.ROADS: "RD",
    Department.DRAINAGE: "DR",
    Department.SANITATION: "SN",
    Department.ENVIRONMENT: "EN",
    Department.PUBLIC_SAFETY: "PS",
    Department.GOVERNMENT_SERVICES: "GS",
    Department.DISASTER: "DS",
    Department.HEALTHCARE: "HC",
    Department.EDUCATION: "ED",
    Department.TRANSPORT: "TR",
    Department.OTHER: "OT",
}


# ─── Grievance Model ─────────────────────────────────────────────────
class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)

    # ── Unique Public Token ──
    grievance_token = Column(String(30), unique=True, index=True, nullable=False)
    # Format: GR-2026-BBSR-WS-004512

    # ── Classification ──
    department = Column(SAEnum(Department), nullable=False, index=True)
    sub_category = Column(String(100), nullable=False)
    title = Column(String(500), index=True)
    description = Column(Text)

    # ── Status & Priority ──
    status = Column(SAEnum(GrievanceStatus), default=GrievanceStatus.SUBMITTED, index=True)
    priority = Column(SAEnum(Priority), default=Priority.MEDIUM, index=True)
    is_emergency = Column(Boolean, default=False)

    # ── Location (PostGIS) ──
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=True)
    ward_number = Column(String(20), nullable=True)
    district_code = Column(String(10), nullable=False, default="BBSR")
    state = Column(String(50), nullable=True, default="Odisha")
    pincode = Column(String(10), nullable=True)
    geom = Column(String(100), nullable=True)

    # ── Media ──
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    document_url = Column(String, nullable=True)

    # ── AI Analysis ──
    embedding = Column(ARRAY(Float), nullable=True)  # SBERT vector
    ai_department_suggestion = Column(String(50), nullable=True)
    ai_priority_suggestion = Column(String(20), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)

    # ── Assignment & Hierarchy ──
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    current_hierarchy_level = Column(Integer, default=1)
    # 1=Ward Officer, 2=JE, 3=AE, 4=EE, 5=Commissioner, 6=Collector, 7=Secretary, 8=Minister
    escalation_deadline = Column(DateTime(timezone=True), nullable=True)

    # ── Duplicate Detection ──
    is_duplicate_of = Column(Integer, ForeignKey("grievances.id"), nullable=True)

    # ── Privacy ──
    is_anonymous = Column(Boolean, default=False)

    # ── Citizen Feedback ──
    citizen_feedback_rating = Column(Integer, nullable=True)  # 1-5 stars
    citizen_feedback_text = Column(Text, nullable=True)

    # ── Resolution Proof ──
    resolution_proof_url = Column(String, nullable=True)  # officer before/after photos
    resolution_notes = Column(Text, nullable=True)

    # ── Reporter ──
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # nullable for anonymous complaints

    # ── Timestamps ──
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ── Relationships ──
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="grievances")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    timeline_entries = relationship("GrievanceTimeline", back_populates="grievance", order_by="GrievanceTimeline.changed_at")
    escalation_logs = relationship("EscalationLog", back_populates="grievance", order_by="EscalationLog.escalated_at")
    duplicate_parent = relationship("Grievance", remote_side=[id])
