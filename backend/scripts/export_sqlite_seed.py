"""导出当前 SQLite 数据，供 Supabase/Postgres 迁移演练使用。"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import BASE_DIR, DATABASE_PATH

TABLES = ("studios", "editors", "business_contacts")


def fetch_table_rows(connection: sqlite3.Connection, table_name: str) -> list[dict]:
    rows = connection.execute(f"SELECT * FROM {table_name} ORDER BY id ASC").fetchall()
    return [dict(row) for row in rows]


def main() -> None:
    parser = argparse.ArgumentParser(description="Export current SQLite seed data to JSON")
    parser.add_argument(
        "--output",
        default=str(BASE_DIR / "data" / "sqlite_export.json"),
        help="JSON export path",
    )
    parser.add_argument(
        "--source",
        default=str(DATABASE_PATH),
        help="SQLite database path",
    )
    args = parser.parse_args()

    source_path = Path(args.source).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(source_path)
    connection.row_factory = sqlite3.Row
    try:
        payload = {
            "source": str(source_path),
            "tables": {table_name: fetch_table_rows(connection, table_name) for table_name in TABLES},
        }
    finally:
        connection.close()

    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Exported SQLite data to {output_path}")


if __name__ == "__main__":
    main()
