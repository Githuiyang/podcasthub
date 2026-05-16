"""initial schema

Revision ID: 20260410_000001
Revises:
Create Date: 2026-04-10 00:00:01
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20260410_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "studios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("cover_image", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("district", sa.String(length=100), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("equipment", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("room_count", sa.Integer(), nullable=True, server_default="1"),
        sa.Column("room_features", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("price_per_hour", sa.Integer(), nullable=True),
        sa.Column("price_per_day", sa.Integer(), nullable=True),
        sa.Column("price_note", sa.String(length=500), nullable=True),
        sa.Column("booking_url", sa.String(length=500), nullable=True),
        sa.Column("booking_note", sa.String(length=200), nullable=True),
        sa.Column("contact_name", sa.String(length=100), nullable=True),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("contact_wechat", sa.String(length=100), nullable=True),
        sa.Column("portfolio_images", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("portfolio_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("true")),
    )
    op.create_index("ix_studios_id", "studios", ["id"], unique=False)
    op.create_index("ix_studios_city", "studios", ["city"], unique=False)
    op.create_index("ix_studios_is_active", "studios", ["is_active"], unique=False)

    op.create_table(
        "editors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("avatar", sa.String(length=500), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("skills", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("software", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("experience_years", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("specialties", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("price_per_episode", sa.Integer(), nullable=True),
        sa.Column("price_per_hour", sa.Integer(), nullable=True),
        sa.Column("price_note", sa.String(length=500), nullable=True),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("contact_wechat", sa.String(length=100), nullable=True),
        sa.Column("contact_email", sa.String(length=200), nullable=True),
        sa.Column("portfolio_url", sa.String(length=500), nullable=True),
        sa.Column("portfolio_images", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("portfolio_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("true")),
    )
    op.create_index("ix_editors_id", "editors", ["id"], unique=False)
    op.create_index("ix_editors_is_active", "editors", ["is_active"], unique=False)

    op.create_table(
        "business_contacts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("avatar", sa.String(length=500), nullable=True),
        sa.Column("company", sa.String(length=200), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("business_type", sa.String(length=100), nullable=True),
        sa.Column("industry", sa.String(length=100), nullable=True),
        sa.Column("budget_range", sa.String(length=100), nullable=True),
        sa.Column("cooperation_types", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("contact_phone", sa.String(length=50), nullable=True),
        sa.Column("contact_wechat", sa.String(length=100), nullable=True),
        sa.Column("contact_email", sa.String(length=200), nullable=True),
        sa.Column("case_images", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("case_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("reference_podcasts", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("true")),
    )
    op.create_index("ix_business_contacts_id", "business_contacts", ["id"], unique=False)
    op.create_index("ix_business_contacts_is_active", "business_contacts", ["is_active"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_business_contacts_is_active", table_name="business_contacts")
    op.drop_index("ix_business_contacts_id", table_name="business_contacts")
    op.drop_table("business_contacts")

    op.drop_index("ix_editors_is_active", table_name="editors")
    op.drop_index("ix_editors_id", table_name="editors")
    op.drop_table("editors")

    op.drop_index("ix_studios_is_active", table_name="studios")
    op.drop_index("ix_studios_city", table_name="studios")
    op.drop_index("ix_studios_id", table_name="studios")
    op.drop_table("studios")
