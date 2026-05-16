"""将 SQLite 导出 JSON 导入到 Postgres，用于 Supabase 切库演练。"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import BASE_DIR, DATABASE_URL
from models.database import BusinessContact, Editor, Studio
from services.studio_pricing import infer_charging_method_from_row

MODEL_TABLES = (
    (Studio, "studios"),
    (Editor, "editors"),
    (BusinessContact, "business_contacts"),
)
DATETIME_FIELDS = {"created_at", "updated_at"}
JSON_FIELDS = {
    "equipment",
    "room_features",
    "portfolio_images",
    "portfolio_links",
    "tags",
    "skills",
    "software",
    "specialties",
    "cooperation_types",
    "case_images",
    "case_links",
    "reference_podcasts",
}


def parse_datetime(value: object) -> object:
    if not isinstance(value, str):
        return value

    candidate = value.strip()
    if not candidate:
        return None

    try:
        return datetime.fromisoformat(candidate.replace("Z", "+00:00"))
    except ValueError:
        return value


def parse_json_field(value: object) -> object:
    if not isinstance(value, str):
        return value

    candidate = value.strip()
    if not candidate:
        return None

    if not (candidate.startswith("[") or candidate.startswith("{")):
        return value

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return value


def normalize_row(row: dict[str, object]) -> dict[str, object]:
    normalized = dict(row)
    for field_name in DATETIME_FIELDS:
        if field_name in normalized:
            normalized[field_name] = parse_datetime(normalized[field_name])
    for field_name in JSON_FIELDS:
        if field_name in normalized:
            normalized[field_name] = parse_json_field(normalized[field_name])
    if "charging_method" not in normalized or normalized["charging_method"] in (None, ""):
        normalized["charging_method"] = infer_charging_method_from_row(normalized)
    return normalized


def reset_postgres_sequence(session: Session, table_name: str) -> None:
    session.execute(
        text(
            f"""
            SELECT setval(
                pg_get_serial_sequence(:table_name, 'id'),
                COALESCE((SELECT MAX(id) FROM ONLY {table_name}), 1),
                COALESCE((SELECT MAX(id) FROM ONLY {table_name}), 0) > 0
            )
            """
        ),
        {"table_name": table_name},
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Import exported SQLite data into Postgres")
    parser.add_argument(
        "--input",
        default=str(BASE_DIR / "data" / "sqlite_export.json"),
        help="Path to exported JSON payload",
    )
    parser.add_argument(
        "--database-url",
        default=DATABASE_URL,
        help="Target Postgres database URL",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Delete existing rows before import",
    )
    args = parser.parse_args()

    if not args.database_url.startswith("postgresql"):
        raise SystemExit("Refusing to import: target DATABASE_URL is not PostgreSQL")

    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    engine = create_engine(args.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with SessionLocal() as session:
        if args.truncate:
            for model, _ in reversed(MODEL_TABLES):
                session.query(model).delete()
            session.commit()

        for model, table_name in MODEL_TABLES:
            rows = payload["tables"].get(table_name, [])
            for row in rows:
                session.merge(model(**normalize_row(row)))

        session.commit()

        for _, table_name in MODEL_TABLES:
            reset_postgres_sequence(session, table_name)
        session.commit()

    print(f"Imported SQLite export into {args.database_url}")


if __name__ == "__main__":
    main()
