"""add studio charging method

Revision ID: 20260410_000002
Revises: 20260410_000001
Create Date: 2026-04-10 00:02:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from services.studio_pricing import infer_charging_method


# revision identifiers, used by Alembic.
revision = "20260410_000002"
down_revision = "20260410_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("studios", sa.Column("charging_method", sa.String(length=100), nullable=True))

    connection = op.get_bind()
    studios = sa.table(
        "studios",
        sa.column("id", sa.Integer()),
        sa.column("price_note", sa.String()),
        sa.column("price_per_hour", sa.Integer()),
        sa.column("price_per_day", sa.Integer()),
        sa.column("charging_method", sa.String()),
    )

    rows = connection.execute(
        sa.select(
            studios.c.id,
            studios.c.price_note,
            studios.c.price_per_hour,
            studios.c.price_per_day,
        ).order_by(studios.c.id.asc())
    ).mappings().all()

    for row in rows:
        charging_method = infer_charging_method(
            row["price_note"],
            row["price_per_hour"],
            row["price_per_day"],
        )
        if charging_method:
            connection.execute(
                studios.update().where(studios.c.id == row["id"]).values(charging_method=charging_method)
            )


def downgrade() -> None:
    op.drop_column("studios", "charging_method")
