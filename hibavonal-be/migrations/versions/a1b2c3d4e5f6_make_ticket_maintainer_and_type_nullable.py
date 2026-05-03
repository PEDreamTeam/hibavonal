"""Make ticket maintainer_id and ticket_type_id nullable

Revision ID: a1b2c3d4e5f6
Revises: 643dcfc6b0cf
Create Date: 2026-05-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = '643dcfc6b0cf'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.alter_column('maintainer_id',
               existing_type=sa.Integer(),
               nullable=True)
        batch_op.alter_column('ticket_type_id',
               existing_type=sa.Integer(),
               nullable=True)


def downgrade():
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.alter_column('ticket_type_id',
               existing_type=sa.Integer(),
               nullable=False)
        batch_op.alter_column('maintainer_id',
               existing_type=sa.Integer(),
               nullable=False)
