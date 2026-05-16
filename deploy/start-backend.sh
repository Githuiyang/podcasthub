#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backend"
GUNICORN_BIN="${GUNICORN_BIN:-gunicorn}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"
WORKERS="${GUNICORN_WORKERS:-2}"
TIMEOUT="${GUNICORN_TIMEOUT:-60}"

cd "$BACKEND_DIR"

exec "$GUNICORN_BIN" \
  -k uvicorn.workers.UvicornWorker \
  --chdir "$BACKEND_DIR" \
  --bind "${HOST}:${PORT}" \
  --workers "$WORKERS" \
  --timeout "$TIMEOUT" \
  --access-logfile - \
  --error-logfile - \
  main:app

