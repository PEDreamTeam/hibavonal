"""Add created ticket status

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-03 00:00:01.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.alter_column('status',
               existing_type=sa.Enum('in_progress', 'ready_to_done', 'done', name='ticketstatus'),
               type_=sa.Enum('created', 'in_progress', 'ready_to_done', 'done', name='ticketstatus'),
               existing_nullable=False)


def downgrade():
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.alter_column('status',
               existing_type=sa.Enum('created', 'in_progress', 'ready_to_done', 'done', name='ticketstatus'),
               type_=sa.Enum('in_progress', 'ready_to_done', 'done', name='ticketstatus'),
               existing_nullable=False)
