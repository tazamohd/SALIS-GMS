#!/usr/bin/env bash
#
# Fail if shared/schema.ts has drifted from migrations/meta — i.e. if
# `drizzle-kit generate` would produce a new migration.
#
# This is what silently broke before the baseline squash: the meta snapshots
# fell behind the schema, so `generate` diffed against a stale baseline and
# schema changes shipped with no migration. This guard makes that a hard CI
# failure: if the schema changed, a migration must be generated and committed.
#
# `drizzle-kit generate` for the postgres dialect diffs schema.ts against the
# meta snapshots and never connects to a database; DATABASE_URL only has to be
# set so drizzle.config.ts loads.
set -euo pipefail

: "${DATABASE_URL:=postgresql://drift:drift@localhost:5432/drift}"
export DATABASE_URL

if ! command -v git >/dev/null 2>&1; then
  echo "check-migration-drift: git is required." >&2
  exit 2
fi

# Only the drizzle artifacts matter — the .sql files and meta/ snapshots.
# (Non-migration files like this folder's README.md are ignored.)
migration_status() {
  git status --porcelain -- 'migrations/*.sql' migrations/meta 2>/dev/null || true
}

# Revert anything `drizzle-kit generate` produced, without disturbing other
# untracked files (e.g. migrations/README.md).
cleanup() {
  git checkout -- migrations/meta 2>/dev/null || true       # revert modified journal/snapshots
  git clean -fdq -- migrations/meta 2>/dev/null || true     # drop new untracked snapshot(s)
  rm -f migrations/*__drift_check__*.sql 2>/dev/null || true # drop the probe migration
}

if [ -n "$(migration_status)" ]; then
  echo "check-migration-drift: migrations/ has uncommitted .sql/meta changes before the check; commit or stash first." >&2
  exit 2
fi

npx drizzle-kit generate --name __drift_check__ >/tmp/drift-check.log 2>&1 || {
  cat /tmp/drift-check.log
  echo "check-migration-drift: drizzle-kit generate failed." >&2
  cleanup
  exit 2
}

drift="$(migration_status)"
if [ -n "$drift" ]; then
  echo "❌ Migration drift: shared/schema.ts is out of sync with migrations/meta."
  echo "   Run 'npx drizzle-kit generate', review the new migration, and commit it"
  echo "   (or adjust the schema). Uncommitted output produced by the check:"
  echo "$drift"
  cleanup
  exit 1
fi

echo "✅ No migration drift — migrations/meta matches shared/schema.ts."
