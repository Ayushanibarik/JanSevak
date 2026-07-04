"""
Role-Based Permission Matrix for the Grievance Management System.
Maps each government hierarchy role to the specific actions they are allowed to perform.
No role has delete permission — grievances are NEVER deleted.
"""
from app.models.user import RoleEnum


# ─── Action Definitions ──────────────────────────────────────────────
ACTIONS = [
    "register_grievance",   # Submit a new grievance
    "track_grievance",      # View grievance status by token
    "view_assigned",        # View cases assigned to self
    "accept_grievance",     # Accept an assigned case
    "add_notes",            # Add internal notes
    "upload_proof",         # Upload inspection/resolution photos
    "assign_staff",         # Assign field staff to a case
    "approve_action",       # Approve work orders / assignments
    "reject_grievance",     # Mark as rejected (with reason)
    "escalate",             # Manually escalate to superior
    "close_grievance",      # Mark as closed/resolved
    "reopen_grievance",     # Reopen a closed case
    "audit_access",         # View full audit trail
    "provide_feedback",     # Citizen feedback/rating
    "file_appeal",          # File appeal after poor feedback
    "view_analytics",       # View dashboard analytics
    "reassign_grievance",   # Reassign to different officer/dept
    "issue_notice",         # Issue notice to officer
    "mark_false",           # Mark as false complaint (senior only)
]


# ─── Permission Matrix ───────────────────────────────────────────────
PERMISSIONS = {
    RoleEnum.CITIZEN: {
        "register_grievance": True,
        "track_grievance": True,
        "view_assigned": False,
        "accept_grievance": False,
        "add_notes": False,
        "upload_proof": False,
        "assign_staff": False,
        "approve_action": False,
        "reject_grievance": False,
        "escalate": False,
        "close_grievance": False,
        "reopen_grievance": False,
        "audit_access": False,
        "provide_feedback": True,
        "file_appeal": True,
        "view_analytics": False,
        "reassign_grievance": False,
        "issue_notice": False,
        "mark_false": False,
    },
    RoleEnum.WARD_OFFICER: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": False,
        "approve_action": False,
        "reject_grievance": False,
        "escalate": True,
        "close_grievance": False,
        "reopen_grievance": False,
        "audit_access": False,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": False,
        "reassign_grievance": False,
        "issue_notice": False,
        "mark_false": False,
    },
    RoleEnum.JUNIOR_ENGINEER: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": True,
        "approve_action": False,
        "reject_grievance": False,
        "escalate": True,
        "close_grievance": False,
        "reopen_grievance": False,
        "audit_access": False,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": False,
        "issue_notice": False,
        "mark_false": False,
    },
    RoleEnum.ASSISTANT_ENGINEER: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": True,
        "approve_action": True,
        "reject_grievance": False,
        "escalate": True,
        "close_grievance": False,
        "reopen_grievance": False,
        "audit_access": False,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": False,
        "issue_notice": False,
        "mark_false": False,
    },
    RoleEnum.EXECUTIVE_ENGINEER: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": True,
        "approve_action": True,
        "reject_grievance": True,
        "escalate": True,
        "close_grievance": False,
        "reopen_grievance": False,
        "audit_access": False,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": True,
        "issue_notice": False,
        "mark_false": False,
    },
    RoleEnum.MUNICIPAL_COMMISSIONER: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": True,
        "approve_action": True,
        "reject_grievance": True,
        "escalate": True,
        "close_grievance": True,
        "reopen_grievance": True,
        "audit_access": False,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": True,
        "issue_notice": True,
        "mark_false": False,
    },
    RoleEnum.DISTRICT_COLLECTOR: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": True,
        "approve_action": True,
        "reject_grievance": True,
        "escalate": True,
        "close_grievance": True,
        "reopen_grievance": True,
        "audit_access": True,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": True,
        "issue_notice": True,
        "mark_false": True,
    },
    RoleEnum.STATE_SECRETARY: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": True,
        "accept_grievance": True,
        "add_notes": True,
        "upload_proof": True,
        "assign_staff": True,
        "approve_action": True,
        "reject_grievance": True,
        "escalate": True,
        "close_grievance": True,
        "reopen_grievance": True,
        "audit_access": True,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": True,
        "issue_notice": True,
        "mark_false": True,
    },
    RoleEnum.MINISTER: {
        "register_grievance": False,
        "track_grievance": True,
        "view_assigned": False,
        "accept_grievance": False,
        "add_notes": False,
        "upload_proof": False,
        "assign_staff": False,
        "approve_action": False,
        "reject_grievance": False,
        "escalate": False,
        "close_grievance": False,
        "reopen_grievance": False,
        "audit_access": True,
        "provide_feedback": False,
        "file_appeal": False,
        "view_analytics": True,
        "reassign_grievance": False,
        "issue_notice": False,
        "mark_false": False,
    },
}


def has_permission(role: RoleEnum, action: str) -> bool:
    """Check if a role has permission to perform a specific action."""
    role_perms = PERMISSIONS.get(role, {})
    return role_perms.get(action, False)


def get_permissions_for_role(role: RoleEnum) -> dict:
    """Get all permissions for a given role."""
    return PERMISSIONS.get(role, {})


def check_permission_or_raise(role: RoleEnum, action: str):
    """Check permission and raise HTTPException if denied."""
    from fastapi import HTTPException, status
    if not has_permission(role, action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{role.value}' does not have permission to '{action}'"
        )
