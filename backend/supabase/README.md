# Supabase Cutover

Alembic is the schema source of truth for this repository.

Use `backend/alembic/versions/20260410_000001_initial_schema.py` as the canonical schema definition.
Use `backend/supabase/migrations/20260410_000001_initial_schema.sql` only as a mirror for Supabase SQL execution.
Do not edit both files independently.

The recommended cutover path is:

1. Run schema migration against the Supabase/Postgres target.
2. Export the current SQLite seed.
3. Generate Supabase seed SQL from that export.
4. Import the exported seed into Postgres.
5. Verify row counts and representative JSON queries.

One-command workflow:

```bash
python backend/scripts/supabase_cutover.py --database-url "$DATABASE_URL" --truncate
```

Required external input:

- A PostgreSQL `DATABASE_URL` for the Supabase project, preferably the Session Pooler URL.
- The database password for that URL.

The `backend/supabase/.temp/` directory is CLI scratch space and should not be treated as source data.
