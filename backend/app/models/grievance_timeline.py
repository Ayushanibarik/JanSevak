from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class GrievanceTimeline(Base):
    """
    Immutable audit trail for every status change on a grievance.
    No record in this table is ever deleted or modified.
    Every action — assignment, escalation, note, status change — is permanently recorded.
    """
    __tablename__ = "grievance_timeline"

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"), nullable=False, index=True)

    # Status transition
    old_status = Column(String(50), nullable=True)   # null for initial submission
    new_status = Column(String(50), nullable=False)

    # Who made the change
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # nullable for system-initiated changes (auto-escalation)

    # When
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Details
    notes = Column(Text, nullable=True)  # mandatory for rejections/closures
    action_type = Column(String(50), nullable=False, default="status_change")
    # action_type values: status_change, assignment, escalation, note_added,
    #                     proof_uploaded, feedback_received, appeal_filed

    # Accountability metadata
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    device_info = Column(String(200), nullable=True)  # User-Agent string

    # Relationships
    grievance = relationship("Grievance", back_populates="timeline_entries")
    changed_by = relationship("User")
