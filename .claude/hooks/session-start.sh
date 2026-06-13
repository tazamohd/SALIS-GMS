#!/usr/bin/env bash
# SessionStart hook for Claude Code (web & local).
# Ensures a fresh container/session can immediately type-check, lint, and run tests.
# Kept fast and idempotent: only installs when dependencies are actually missing.
set -euo pipefail

cd "$(dirname "$0")/../.."

# 1. Install dependencies if node_modules is absent (fresh clone / ephemeral container).
if [ ! -d node_modules ]; then
  echo "[session-start] node_modules missing — running npm ci…"
  npm ci --no-audit --no-fund
else
  echo "[session-start] dependencies already installed — skipping npm ci."
fi

# 2. Surface the DB situation. Server/integration tests need Postgres; when none is
#    configured the embedded-postgres binary is used automatically by the test setup.
if [ -z "${DATABASE_URL:-}" ] && [ -z "${TEST_DATABASE_URL:-}" ]; then
  echo "[session-start] No DATABASE_URL/TEST_DATABASE_URL set — DB-backed tests will use embedded-postgres."
fi

echo "[session-start] Ready. Useful: npm run check | npm run lint | npm test"
