#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# SALIS AUTO GMS — Postgres backup (pg_dump custom format)
#
# Creates a timestamped custom-format dump (restorable with pg_restore,
# supports parallel/selective restore), prunes old dumps beyond BACKUP_KEEP,
# and optionally uploads to S3 when AWS_S3_BUCKET is set and the aws CLI
# is available.
#
# POSIX sh — runs inside the postgres container or anywhere pg_dump exists:
#   docker compose -f docker-compose.prod.yml --env-file .env.production \
#     exec postgres sh /scripts/backup-db.sh
#   DATABASE_URL=postgresql://... ./scripts/backup-db.sh
#
# Environment:
#   DATABASE_URL    (required)  connection string passed to pg_dump
#   BACKUP_DIR      (default ./backups) where dumps are written
#   BACKUP_KEEP     (default 30) number of newest dumps to retain
#   AWS_S3_BUCKET   (optional)  S3 bucket name (S3_BUCKET accepted as alias)
# ═══════════════════════════════════════════════════════════════════════════
set -eu

: "${DATABASE_URL:?DATABASE_URL is required (postgres connection string)}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_KEEP="${BACKUP_KEEP:-30}"
S3_BUCKET="${AWS_S3_BUCKET:-${S3_BUCKET:-}}"

mkdir -p "$BACKUP_DIR"

ts=$(date -u +%Y%m%d-%H%M%S)
file="$BACKUP_DIR/gms-$ts.dump"

echo "[backup] pg_dump (custom format) -> $file"
pg_dump --format=custom --no-owner --no-acl --file="$file" "$DATABASE_URL"
echo "[backup] OK: $(du -k "$file" | cut -f1) KB"

# ── Optional S3 upload ──────────────────────────────────────────────────────
if [ -n "$S3_BUCKET" ]; then
  if command -v aws >/dev/null 2>&1; then
    echo "[backup] uploading to s3://$S3_BUCKET/$(basename "$file")"
    aws s3 cp "$file" "s3://$S3_BUCKET/$(basename "$file")"
  else
    echo "[backup] WARNING: AWS_S3_BUCKET set but aws CLI not found; skipped upload" >&2
  fi
fi

# ── Retention: keep the newest $BACKUP_KEEP dumps ───────────────────────────
# Filenames are gms-YYYYMMDD-HHMMSS.dump (no spaces), so word-splitting on
# the ls output is safe here.
count=0
for old in $(ls -1t "$BACKUP_DIR"/gms-*.dump 2>/dev/null); do
  count=$((count + 1))
  if [ "$count" -gt "$BACKUP_KEEP" ]; then
    rm -f "$old"
    echo "[backup] pruned $old"
  fi
done

echo "[backup] done — $(ls "$BACKUP_DIR"/gms-*.dump 2>/dev/null | wc -l | tr -d ' ') dump(s) retained in $BACKUP_DIR"
