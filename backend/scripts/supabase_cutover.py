"""SQLite -> Supabase/Postgres 切库总入口。

Alembic 是 schema source-of-truth。
这个脚本负责把“建表 + 导数 + 验数”串成一条可执行路径。
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = BACKEND_DIR / "scripts"
DEFAULT_SQLITE_SOURCE = BACKEND_DIR / "data" / "podcasthub.db"
DEFAULT_EXPORT_OUTPUT = BACKEND_DIR / "data" / "sqlite_export.json"
DEFAULT_SEED_OUTPUT = BACKEND_DIR / "supabase" / "seed.sql"


def run_python_script(script_name: str, *args: str, env: dict[str, str] | None = None) -> None:
    command = [sys.executable, str(SCRIPTS_DIR / script_name), *args]
    subprocess.run(command, check=True, cwd=BACKEND_DIR, env=env)


def run_alembic_upgrade(database_url: str) -> None:
    env = os.environ.copy()
    env["DATABASE_URL"] = database_url
    env["AUTO_INIT_DB"] = "false"
    subprocess.run(
        [sys.executable, "-m", "alembic", "-c", str(BACKEND_DIR / "alembic.ini"), "upgrade", "head"],
        check=True,
        cwd=BACKEND_DIR,
        env=env,
    )


def read_export_counts(export_path: Path) -> dict[str, int]:
    payload = json.loads(export_path.read_text(encoding="utf-8"))
    tables = payload.get("tables", {})
    return {name: len(rows) for name, rows in tables.items()}


def verify_target(database_url: str, export_path: Path) -> None:
    os.environ["DATABASE_URL"] = database_url
    os.environ["AUTO_INIT_DB"] = "false"

    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from models.database import BusinessContact, Editor, Studio

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    source_counts = read_export_counts(export_path)

    with SessionLocal() as session:
        target_counts = {
            "studios": session.query(Studio).count(),
            "editors": session.query(Editor).count(),
            "business_contacts": session.query(BusinessContact).count(),
        }

        mismatches = {
            table_name: (source_counts.get(table_name, 0), target_counts.get(table_name, 0))
            for table_name in target_counts
            if source_counts.get(table_name, 0) != target_counts.get(table_name, 0)
        }
        if mismatches:
            raise SystemExit(f"Count mismatch after import: {mismatches}")

        tag_count = session.query(Studio).filter(Studio.tags.contains(["播客录音室"])).count()
        if tag_count != target_counts["studios"]:
            raise SystemExit(
                "JSONB contains check failed for Studio.tags; "
                f"expected {target_counts['studios']} rows, got {tag_count}"
            )

        equipment_count = session.query(Studio).filter(
            Studio.equipment.contains(["罗德Caster Pro调音台"])
        ).count()
        if equipment_count < 1:
            raise SystemExit("JSONB contains check failed for Studio.equipment")

        charging_method_count = session.query(Studio).filter(Studio.charging_method.isnot(None)).count()
        if charging_method_count != target_counts["studios"]:
            raise SystemExit(
                "Charging method backfill check failed for Studio.charging_method; "
                f"expected {target_counts['studios']} rows, got {charging_method_count}"
            )

        first_studio = session.query(Studio).order_by(Studio.id.asc()).first()
        if first_studio is None:
            raise SystemExit("No studios found after import")

        print(
            "Verified target DB:",
            {
                "counts": target_counts,
                "tag_contains_rows": tag_count,
                "equipment_contains_rows": equipment_count,
                "first_studio": {
                    "id": first_studio.id,
                    "name": first_studio.name,
                    "city": first_studio.city,
                    "charging_method": first_studio.charging_method,
                    "longitude": first_studio.longitude,
                    "latitude": first_studio.latitude,
                },
            },
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the full SQLite -> Supabase/Postgres cutover")
    parser.add_argument(
        "--database-url",
        required=True,
        help="Target PostgreSQL database URL, preferably the Supabase Session Pooler URL",
    )
    parser.add_argument(
        "--sqlite-source",
        default=str(DEFAULT_SQLITE_SOURCE),
        help="Source SQLite database path",
    )
    parser.add_argument(
        "--export-output",
        default=str(DEFAULT_EXPORT_OUTPUT),
        help="Where to write the exported SQLite JSON",
    )
    parser.add_argument(
        "--seed-output",
        default=str(DEFAULT_SEED_OUTPUT),
        help="Where to write the generated Supabase seed SQL",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        default=True,
        help="Delete existing rows in Postgres before importing",
    )
    parser.add_argument(
        "--no-truncate",
        action="store_false",
        dest="truncate",
        help="Keep existing rows and merge-by-id during import",
    )
    parser.add_argument(
        "--skip-schema",
        action="store_true",
        help="Skip alembic upgrade head",
    )
    args = parser.parse_args()

    database_url = args.database_url.strip()
    if not database_url.startswith("postgresql"):
        raise SystemExit("DATABASE_URL must point to PostgreSQL/Supabase")

    sqlite_source = Path(args.sqlite_source).expanduser().resolve()
    export_output = Path(args.export_output).expanduser().resolve()
    seed_output = Path(args.seed_output).expanduser().resolve()

    print(f"[1/4] Exporting SQLite seed from {sqlite_source}")
    run_python_script(
        "export_sqlite_seed.py",
        "--source",
        str(sqlite_source),
        "--output",
        str(export_output),
    )

    print(f"[2/4] Generating Supabase seed SQL at {seed_output}")
    run_python_script(
        "generate_supabase_seed_sql.py",
        "--input",
        str(export_output),
        "--output",
        str(seed_output),
    )

    if not args.skip_schema:
        print("[3/4] Applying Alembic schema to the target Postgres database")
        run_alembic_upgrade(database_url)
    else:
        print("[3/4] Skipping schema migration as requested")

    import_args = [
        "--input",
        str(export_output),
        "--database-url",
        database_url,
    ]
    if args.truncate:
        import_args.append("--truncate")

    print("[4/4] Importing data and verifying counts / JSONB behavior")
    run_python_script("import_postgres_seed.py", *import_args)
    verify_target(database_url, export_output)


if __name__ == "__main__":
    main()
