from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class EscalationLog(Base):
    """
    Records every escalation event, both automatic (system-triggered when
    deadline expires) and manual (officer-initiated).
    No officer at any level can suppress or delete escalation records.
    """
    __tablename__ = "escalation_logs"

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"), nullable=False, index=True)

    # Who escalated from → to
    from_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    to_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Hierarchy levels
    from_level = Column(Integer, nullable=False)
    to_level = Column(Integer, nullable=False)

    # Reason
    reason = Column(Text, nullable=False)
    # e.g., "Deadline expired — auto-escalation after 48 hours"
    # e.g., "Manual escalation — requires higher authority approval"

    # Timestamp
    escalated_at = Column(DateTime(timezone=True), server_default=func.now())

    # System vs Manual
    is_auto = Column(Boolean, default=False)
    # True = system escalated due to deadline expiry
    # False = officer manually escalated

    # Relationships
    grievance = relationship("Grievance", back_populates="escalation_logs")
    from_officer = relationship("User", foreign_keys=[from_officer_id])
    to_officer = relationship("User", foreign_keys=[to_officer_id])
