"""add studio capacity, need_own_equipment_for_video, contact_info

Revision ID: 20260410_000003
Revises: 20260410_000002
Create Date: 2026-04-10 00:03:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260410_000003"
down_revision = "20260410_000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("studios", sa.Column("capacity", sa.Integer(), nullable=True))
    op.add_column("studios", sa.Column("need_own_equipment_for_video", sa.Boolean(), nullable=True))
    op.add_column("studios", sa.Column("contact_info", sa.String(length=200), nullable=True))


def downgrade() -> None:
    op.drop_column("studios", "contact_info")
    op.drop_column("studios", "need_own_equipment_for_video")
    op.drop_column("studios", "capacity")
