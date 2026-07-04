"""Grievance portal overhaul - new schema

Revision ID: b1234567890a
Revises: aaad793a638b
Create Date: 2026-07-01 23:54:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2
import pgvector.sqlalchemy

revision: str = 'b1234567890a'
down_revision: Union[str, None] = 'aaad793a638b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop old complaints table
    op.drop_table('complaints')

    # Temporarily drop enum dependency from users.role
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE varchar")

    # Drop old role enum and create new one
    op.execute("DROP TYPE IF EXISTS complaintstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS complainttype CASCADE")
    op.execute("DROP TYPE IF EXISTS roleenum CASCADE")
    op.execute("DROP TYPE IF EXISTS department CASCADE")
    op.execute("DROP TYPE IF EXISTS grievancestatus CASCADE")
    op.execute("DROP TYPE IF EXISTS priority CASCADE")

    # Create new enums
    new_role = sa.Enum(
        'CITIZEN', 'WARD_OFFICER', 'JUNIOR_ENGINEER', 'ASSISTANT_ENGINEER',
        'EXECUTIVE_ENGINEER', 'MUNICIPAL_COMMISSIONER', 'DISTRICT_COLLECTOR',
        'STATE_SECRETARY', 'MINISTER', name='roleenum'
    )
    new_role.create(op.get_bind(), checkfirst=True)

    department_enum = sa.Enum(
        'WATER_SUPPLY', 'ELECTRICITY', 'ROADS', 'DRAINAGE', 'SANITATION',
        'ENVIRONMENT', 'PUBLIC_SAFETY', 'GOVERNMENT_SERVICES', 'DISASTER',
        'HEALTHCARE', 'EDUCATION', 'TRANSPORT', 'OTHER', name='department'
    )
    department_enum.create(op.get_bind(), checkfirst=True)

    status_enum = sa.Enum(
        'SUBMITTED', 'AI_VERIFIED', 'ASSIGNED', 'ACCEPTED', 'INSPECTION',
        'WORK_ORDER', 'IN_PROGRESS', 'COMPLETED', 'CITIZEN_VERIFIED',
        'CLOSED', 'REJECTED', 'DUPLICATE', 'WITHDRAWN', 'FALSE_COMPLAINT',
        'APPEALED', name='grievancestatus'
    )
    status_enum.create(op.get_bind(), checkfirst=True)

    priority_enum = sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='priority')
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Update users table
    op.add_column('users', sa.Column('hierarchy_level', sa.Integer(), default=0))
    op.add_column('users', sa.Column('department', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('district_code', sa.String(10), nullable=True, server_default='BBSR'))
    op.add_column('users', sa.Column('ward_number', sa.String(20), nullable=True))

    # Alter role column to use new enum
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE roleenum USING role::text::roleenum")

    # Create grievances table
    op.create_table('grievances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('grievance_token', sa.String(30), nullable=False),
        sa.Column('department', postgresql.ENUM(
            'WATER_SUPPLY', 'ELECTRICITY', 'ROADS', 'DRAINAGE', 'SANITATION',
            'ENVIRONMENT', 'PUBLIC_SAFETY', 'GOVERNMENT_SERVICES', 'DISASTER',
            'HEALTHCARE', 'EDUCATION', 'TRANSPORT', 'OTHER', name='department', create_type=False
        ), nullable=False),
        sa.Column('sub_category', sa.String(100), nullable=False),
        sa.Column('title', sa.String(500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', postgresql.ENUM(
            'SUBMITTED', 'AI_VERIFIED', 'ASSIGNED', 'ACCEPTED', 'INSPECTION',
            'WORK_ORDER', 'IN_PROGRESS', 'COMPLETED', 'CITIZEN_VERIFIED',
            'CLOSED', 'REJECTED', 'DUPLICATE', 'WITHDRAWN', 'FALSE_COMPLAINT',
            'APPEALED', name='grievancestatus', create_type=False
        ), server_default='SUBMITTED'),
        sa.Column('priority', postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='priority', create_type=False), server_default='MEDIUM'),
        sa.Column('is_emergency', sa.Boolean(), default=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('ward_number', sa.String(20), nullable=True),
        sa.Column('district_code', sa.String(10), nullable=False, server_default='BBSR'),
        sa.Column('pincode', sa.String(10), nullable=True),
        sa.Column('geom', geoalchemy2.types.Geometry('POINT', srid=4326), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(), nullable=True),
        sa.Column('audio_url', sa.String(), nullable=True),
        sa.Column('document_url', sa.String(), nullable=True),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(384), nullable=True),
        sa.Column('ai_department_suggestion', sa.String(50), nullable=True),
        sa.Column('ai_priority_suggestion', sa.String(20), nullable=True),
        sa.Column('ai_summary', sa.Text(), nullable=True),
        sa.Column('ai_confidence', sa.Float(), nullable=True),
        sa.Column('assigned_officer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('current_hierarchy_level', sa.Integer(), default=1),
        sa.Column('escalation_deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_duplicate_of', sa.Integer(), sa.ForeignKey('grievances.id'), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), default=False),
        sa.Column('citizen_feedback_rating', sa.Integer(), nullable=True),
        sa.Column('citizen_feedback_text', sa.Text(), nullable=True),
        sa.Column('resolution_proof_url', sa.String(), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('reporter_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_grievances_id', 'grievances', ['id'])
    op.create_index('ix_grievances_token', 'grievances', ['grievance_token'], unique=True)
    op.create_index('ix_grievances_department', 'grievances', ['department'])
    op.create_index('ix_grievances_status', 'grievances', ['status'])
    op.create_index('ix_grievances_priority', 'grievances', ['priority'])
    op.create_index('ix_grievances_title', 'grievances', ['title'])

    # Create grievance_timeline table
    op.create_table('grievance_timeline',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('grievance_id', sa.Integer(), sa.ForeignKey('grievances.id'), nullable=False),
        sa.Column('old_status', sa.String(50), nullable=True),
        sa.Column('new_status', sa.String(50), nullable=False),
        sa.Column('changed_by_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('action_type', sa.String(50), nullable=False, server_default='status_change'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('device_info', sa.String(200), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_grievance_timeline_id', 'grievance_timeline', ['id'])
    op.create_index('ix_grievance_timeline_grievance_id', 'grievance_timeline', ['grievance_id'])

    # Create escalation_logs table
    op.create_table('escalation_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('grievance_id', sa.Integer(), sa.ForeignKey('grievances.id'), nullable=False),
        sa.Column('from_officer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('to_officer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('from_level', sa.Integer(), nullable=False),
        sa.Column('to_level', sa.Integer(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('escalated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('is_auto', sa.Boolean(), default=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_escalation_logs_id', 'escalation_logs', ['id'])
    op.create_index('ix_escalation_logs_grievance_id', 'escalation_logs', ['grievance_id'])


def downgrade() -> None:
    op.drop_table('escalation_logs')
    op.drop_table('grievance_timeline')
    op.drop_table('grievances')
    op.drop_column('users', 'hierarchy_level')
    op.drop_column('users', 'department')
    op.drop_column('users', 'district_code')
    op.drop_column('users', 'ward_number')
