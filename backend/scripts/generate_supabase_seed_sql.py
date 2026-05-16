"""Generate SQL seed statements for the linked Supabase/Postgres database."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from services.studio_pricing import infer_charging_method_from_row


def sql_string(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def sql_literal(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        return f"{sql_string(json.dumps(value, ensure_ascii=False))}::jsonb"
    return sql_string(str(value))


def build_upsert(table_name: str, rows: list[dict[str, object]]) -> list[str]:
    if not rows:
        return []

    if table_name == "studios":
        rows = [
            {
                **row,
                "charging_method": row.get("charging_method") or infer_charging_method_from_row(row),
            }
            for row in rows
        ]

    columns = list(rows[0].keys())
    update_columns = [column for column in columns if column != "id"]
    statements: list[str] = []

    for row in rows:
        values = ", ".join(sql_literal(row[column]) for column in columns)
        updates = ", ".join(
            f"{column} = EXCLUDED.{column}" for column in update_columns
        )
        statements.append(
            f"insert into public.{table_name} ({', '.join(columns)}) "
            f"values ({values}) "
            f"on conflict (id) do update set {updates};"
        )

    statements.append(
        "select setval("
        f"pg_get_serial_sequence('public.{table_name}', 'id'), "
        f"coalesce((select max(id) from public.{table_name}), 1), "
        f"coalesce((select max(id) from public.{table_name}), 0) > 0"
        ");"
    )
    return statements


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SQL seed file for Supabase")
    parser.add_argument(
        "--input",
        default="backend/data/sqlite_export.json",
        help="Path to exported SQLite JSON payload",
    )
    parser.add_argument(
        "--output",
        default="backend/supabase/seed.sql",
        help="Where to write generated SQL",
    )
    args = parser.parse_args()

    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    tables = payload["tables"]

    statements = [
        "-- Generated from SQLite export for Supabase/Postgres cutover.",
        "-- Alembic migrations are the schema source of truth.",
        "begin;",
    ]
    for table_name in ("studios", "editors", "business_contacts"):
        statements.extend(build_upsert(table_name, tables.get(table_name, [])))
    statements.append("commit;")

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(statements) + "\n", encoding="utf-8")
    print(f"Generated seed SQL at {output_path}")


if __name__ == "__main__":
    main()
