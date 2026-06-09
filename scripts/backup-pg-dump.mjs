#!/usr/bin/env node
/**
 * Daily DB backup runner.
 *
 * Streams `pg_dump` of $DATABASE_URL into a gzipped file under $BACKUP_DIR
 * (default `./backups`), then enforces retention: keep the last 30 daily
 * dumps, 12 weekly (Sunday), and 12 monthly (1st of month). Older files
 * are deleted.
 *
 * Optional S3 upload: if AWS_S3_BUCKET is set the dump is also uploaded
 * via the AWS CLI (`aws s3 cp`). The CLI is the simplest dependency-free
 * option; switch to @aws-sdk/client-s3 if you need IAM-role auth without
 * AWS CLI installed in the container.
 *
 * Usage:
 *   node scripts/backup-pg-dump.mjs                 # one-shot, e.g. from cron
 *   BACKUP_DIR=/var/backups/gms node scripts/backup-pg-dump.mjs
 *
 * Inside the workflow engine, server/engine/index.ts wires this to run
 * daily at 02:00 UTC via setInterval. For real production, prefer an
 * external cron (k8s CronJob, systemd timer) so backups continue when
 * the app is restarted.
 */

import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(process.cwd(), "backups");
const S3_BUCKET = process.env.AWS_S3_BUCKET || "";
const PG_DUMP_BIN = process.env.PG_DUMP_BIN || "pg_dump";

const RETENTION = {
  daily: Number(process.env.BACKUP_RETAIN_DAILY) || 30,
  weekly: Number(process.env.BACKUP_RETAIN_WEEKLY) || 12,
  monthly: Number(process.env.BACKUP_RETAIN_MONTHLY) || 12,
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function timestampFor(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(
    date.getUTCHours(),
  )}${pad(date.getUTCMinutes())}`;
}

async function runPgDump(outPath) {
  return new Promise((resolve, reject) => {
    const dump = spawn(PG_DUMP_BIN, ["--no-owner", "--no-acl", "--clean", "--if-exists", DATABASE_URL], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    dump.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    dump.on("error", reject);
    dump.on("exit", (code) => {
      if (code !== 0) reject(new Error(`pg_dump exit ${code}: ${stderr.trim()}`));
    });

    const gzip = createGzip({ level: 6 });
    const out = createWriteStream(outPath);
    pipeline(dump.stdout, gzip, out).then(resolve, reject);
  });
}

async function uploadToS3(localPath, key) {
  if (!S3_BUCKET) return;
  return new Promise((resolve, reject) => {
    const cp = spawn("aws", ["s3", "cp", localPath, `s3://${S3_BUCKET}/${key}`], { stdio: "inherit" });
    cp.on("error", reject);
    cp.on("exit", (code) => (code === 0 ? resolve(undefined) : reject(new Error(`aws s3 cp exit ${code}`))));
  });
}

function classifyDump(filename) {
  // Format: gms-YYYYMMDD-HHMM.sql.gz
  const m = filename.match(/^gms-(\d{4})(\d{2})(\d{2})-\d{4}\.sql\.gz$/);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const day = date.getUTCDay(); // 0 = Sunday
  const dom = date.getUTCDate();
  return {
    date,
    isWeekly: day === 0,
    isMonthly: dom === 1,
  };
}

function pruneRetention() {
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".sql.gz"))
    .map((f) => {
      const c = classifyDump(f);
      return c ? { file: f, ...c } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first

  // Tag the first N daily, weekly, monthly as kept; rest deleted.
  const keep = new Set();
  let dailyCount = 0;
  let weeklyCount = 0;
  let monthlyCount = 0;

  for (const f of files) {
    if (dailyCount < RETENTION.daily) {
      keep.add(f.file);
      dailyCount++;
    }
    if (f.isWeekly && weeklyCount < RETENTION.weekly) {
      keep.add(f.file);
      weeklyCount++;
    }
    if (f.isMonthly && monthlyCount < RETENTION.monthly) {
      keep.add(f.file);
      monthlyCount++;
    }
  }

  let deleted = 0;
  for (const f of files) {
    if (!keep.has(f.file)) {
      try {
        unlinkSync(path.join(BACKUP_DIR, f.file));
        deleted++;
      } catch (err) {
        console.error(`[backup] failed to delete ${f.file}:`, err.message);
      }
    }
  }
  if (deleted > 0) {
    console.log(`[backup] pruned ${deleted} old dumps; kept ${keep.size}`);
  }
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required for pg_dump backups.");
  }
  mkdirSync(BACKUP_DIR, { recursive: true });

  const ts = timestampFor(new Date());
  const filename = `gms-${ts}.sql.gz`;
  const outPath = path.join(BACKUP_DIR, filename);

  console.log(`[backup] dumping → ${outPath}`);
  const startedAt = Date.now();
  await runPgDump(outPath);
  const sizeMb = (statSync(outPath).size / 1_048_576).toFixed(2);
  console.log(`[backup] ✅ ${filename} (${sizeMb} MB) in ${Date.now() - startedAt}ms`);

  if (S3_BUCKET) {
    console.log(`[backup] uploading to s3://${S3_BUCKET}/${filename}`);
    await uploadToS3(outPath, filename);
  }

  pruneRetention();
}

main().catch((err) => {
  console.error("[backup] ❌ failed:", err);
  process.exit(1);
});
