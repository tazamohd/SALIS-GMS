#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# SALIS AUTO GMS — Postgres restore (pg_restore from custom-format dump)
#
# Restores a dump produced by scripts/backup-db.sh into DATABASE_URL.
# Uses --clean --if-exists: existing objects are DROPPED and recreated,
# so the target database's current data is REPLACED by the dump contents.
#
# POSIX sh — runs inside the postgres container or anywhere pg_restore exists:
#   docker compose -f docker-compose.prod.yml --env-file .env.production \
#     exec postgres sh /scripts/restore-db.sh /backups/gms-20260611-020000.dump
#   DATABASE_URL=postgresql://... ./scripts/restore-db.sh backups/gms-....dump
#
# Environment:
#   DATABASE_URL  (required)  target database connection string
#   FORCE=1       (optional)  skip the interactive confirmation (for drills/CI)
# ═══════════════════════════════════════════════════════════════════════════
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <dump-file>" >&2
  echo "  e.g. $0 /backups/gms-20260611-020000.dump" >&2
  exit 64
fi

dump_file=$1

: "${DATABASE_URL:?DATABASE_URL is required (target postgres connection string)}"

if [ ! -f "$dump_file" ]; then
  echo "[restore] ERROR: dump file not found: $dump_file" >&2
  exit 66
fi

# Sanity-check it is a pg_dump custom-format archive (magic bytes "PGDMP").
case "$(head -c 5 "$dump_file" 2>/dev/null)" in
  PGDMP) ;;
  *)
    echo "[restore] ERROR: $dump_file is not a pg_dump custom-format archive" >&2
    exit 65
    ;;
esac

if [ "${FORCE:-0}" != "1" ]; then
  echo "[restore] About to restore: $dump_file"
  echo "[restore] Target:           $DATABASE_URL" | sed 's|://[^@]*@|://***@|'
  echo "[restore] This DROPS existing objects in the target DB and replaces them."
  printf "[restore] Type 'yes' to continue: "
  read -r answer
  if [ "$answer" != "yes" ]; then
    echo "[restore] aborted."
    exit 1
  fi
fi

echo "[restore] running pg_restore --clean --if-exists ..."
# --clean --if-exists : drop objects before recreating, tolerate first-run gaps
# --no-owner --no-acl : dumps were taken without owner/ACL; restore role-agnostic
pg_restore --clean --if-exists --no-owner --no-acl \
  --dbname="$DATABASE_URL" "$dump_file"

echo "[restore] done. Verify with the app's readiness probe:"
echo "[restore]   curl -fsS https://<your-domain>/api/health/ready"
