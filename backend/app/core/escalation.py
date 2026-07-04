import datetime
from sqlalchemy.orm import Session
from app.models.grievance import Grievance, GrievanceStatus
from app.models.grievance_timeline import GrievanceTimeline
from app.models.escalation_log import EscalationLog
from app.models.user import User, RoleEnum

def check_and_escalate(db: Session):
    """
    Scans all grievances, checks if their deadlines have expired, and automatically
    escalates them to the next supervisor in the hierarchy if unresolved.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # We check grievances that are not closed, completed, citizen_verified, rejected, duplicate, withdrawn or false_complaint
    active_statuses = [
        GrievanceStatus.SUBMITTED,
        GrievanceStatus.AI_VERIFIED,
        GrievanceStatus.ASSIGNED,
        GrievanceStatus.ACCEPTED,
        GrievanceStatus.INSPECTION,
        GrievanceStatus.WORK_ORDER,
        GrievanceStatus.IN_PROGRESS,
        GrievanceStatus.APPEALED
    ]
    
    overdue_grievances = db.query(Grievance).filter(
        Grievance.status.in_(active_statuses),
        Grievance.escalation_deadline < now
    ).all()
    
    for grievance in overdue_grievances:
        old_level = grievance.current_hierarchy_level
        new_level = min(old_level + 1, 8) # Max is level 8 (Minister)
        
        # Determine the target role enum for the escalated level
        role_map = {
            1: RoleEnum.WARD_OFFICER,
            2: RoleEnum.JUNIOR_ENGINEER,
            3: RoleEnum.ASSISTANT_ENGINEER,
            4: RoleEnum.EXECUTIVE_ENGINEER,
            5: RoleEnum.MUNICIPAL_COMMISSIONER,
            6: RoleEnum.DISTRICT_COLLECTOR,
            7: RoleEnum.STATE_SECRETARY,
            8: RoleEnum.MINISTER
        }
        
        target_role = role_map.get(new_level, RoleEnum.MINISTER)
        
        # Look for an officer in the same department and district/ward to assign
        new_officer = db.query(User).filter(
            User.role == target_role,
            User.department == grievance.department.value if grievance.department else True,
            User.district_code == grievance.district_code
        ).first()
        
        # If no specific officer found, assign to any officer of that role in the district
        if not new_officer:
            new_officer = db.query(User).filter(
                User.role == target_role,
                User.district_code == grievance.district_code
            ).first()
            
        old_officer_id = grievance.assigned_officer_id
        
        # Record the escalation log
        log = EscalationLog(
            grievance_id=grievance.id,
            from_officer_id=old_officer_id,
            to_officer_id=new_officer.id if new_officer else None,
            from_level=old_level,
            to_level=new_level,
            reason=f"Auto-escalation: Deadline expired on {grievance.escalation_deadline.strftime('%Y-%m-%d %H:%M:%S')}",
            is_auto=True
        )
        db.add(log)
        
        # Update the grievance assignment & level
        grievance.current_hierarchy_level = new_level
        grievance.assigned_officer_id = new_officer.id if new_officer else None
        
        # Extend the deadline by another 48 hours (or 4 hours if emergency)
        hours_to_add = 4 if grievance.is_emergency else 48
        grievance.escalation_deadline = now + datetime.timedelta(hours=hours_to_add)
        
        # Also mark status as ASSIGNED if it wasn't already
        old_status = grievance.status.value if grievance.status else None
        grievance.status = GrievanceStatus.ASSIGNED
        
        # Log this event in the timeline
        timeline = GrievanceTimeline(
            grievance_id=grievance.id,
            old_status=old_status,
            new_status=GrievanceStatus.ASSIGNED.value,
            action_type="escalation",
            notes=f"Auto-escalated to Level {new_level} ({target_role.value}) due to SLA deadline breach.",
            ip_address="127.0.0.1",
            device_info="JanMitra Escalation Daemon"
        )
        db.add(timeline)
        
    db.commit()
