from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum
from sqlalchemy import Enum


# ─── 9-Level Government Hierarchy ────────────────────────────────────
class RoleEnum(str, enum.Enum):
    CITIZEN = "citizen"
    WARD_OFFICER = "ward_officer"
    JUNIOR_ENGINEER = "junior_engineer"
    ASSISTANT_ENGINEER = "assistant_engineer"
    EXECUTIVE_ENGINEER = "executive_engineer"
    MUNICIPAL_COMMISSIONER = "municipal_commissioner"
    DISTRICT_COLLECTOR = "district_collector"
    STATE_SECRETARY = "state_secretary"
    MINISTER = "minister"


# ─── Hierarchy Level Mapping ─────────────────────────────────────────
ROLE_HIERARCHY = {
    RoleEnum.CITIZEN: 0,
    RoleEnum.WARD_OFFICER: 1,
    RoleEnum.JUNIOR_ENGINEER: 2,
    RoleEnum.ASSISTANT_ENGINEER: 3,
    RoleEnum.EXECUTIVE_ENGINEER: 4,
    RoleEnum.MUNICIPAL_COMMISSIONER: 5,
    RoleEnum.DISTRICT_COLLECTOR: 6,
    RoleEnum.STATE_SECRETARY: 7,
    RoleEnum.MINISTER: 8,
}

# Human-readable labels for UI display
ROLE_LABELS = {
    RoleEnum.CITIZEN: "Citizen",
    RoleEnum.WARD_OFFICER: "Ward Officer",
    RoleEnum.JUNIOR_ENGINEER: "Junior Engineer",
    RoleEnum.ASSISTANT_ENGINEER: "Assistant Engineer",
    RoleEnum.EXECUTIVE_ENGINEER: "Executive Engineer",
    RoleEnum.MUNICIPAL_COMMISSIONER: "Municipal Commissioner",
    RoleEnum.DISTRICT_COLLECTOR: "District Collector",
    RoleEnum.STATE_SECRETARY: "State Secretary",
    RoleEnum.MINISTER: "Minister",
}


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # ── Identity ──
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # ── Role & Hierarchy ──
    role = Column(Enum(RoleEnum), default=RoleEnum.CITIZEN)
    hierarchy_level = Column(Integer, default=0)
    # 0=Citizen, 1=Ward Officer, ..., 8=Minister

    # ── Jurisdiction ──
    department = Column(String(50), nullable=True)
    # Only for officers — which department they belong to
    district_code = Column(String(10), nullable=True, default="BBSR")
    ward_number = Column(String(20), nullable=True)
    # Officers assigned to specific wards

    # ── Account ──
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──
    grievances = relationship("Grievance", foreign_keys="[Grievance.reporter_id]", back_populates="reporter")
