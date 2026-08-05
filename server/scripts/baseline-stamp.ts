/**
 * Baseline-stamp an already-migrated database against the squashed migration
 * history.
 *
 * WHY: migrations/ was squashed to a single 0000_baseline.sql (see the "squash
 * to a single baseline" commit). A FRESH database bootstraps from that baseline
 * with `npm run db:migrate` and needs nothing else. But a database that was
 * already migrated under the OLD 0001–0025 history has all the tables yet none
 * of the *new* journal's hashes in drizzle.__drizzle_migrations — so the
 * migrator would try to re-run 0000_baseline (CREATE TABLE …) and fail because
 * the tables already exist.
 *
 * This script records every migration in the current journal as already
 * applied — using the exact hash (sha256 of the .sql file) and created_at
 * (journal `when`) that drizzle-orm's migrator computes — so the next
 * `db:migrate` is a correct no-op. It never runs migration SQL and never
 * touches application tables.
 *
 * Usage:  DATABASE_URL=postgresql://… tsx server/scripts/baseline-stamp.ts
 *
 * Safe to re-run: rows already present (by hash) are skipped. Refuses to run
 * against a database that looks un-migrated (no `garages` table) — there you
 * want `npm run db:migrate`, not a stamp.
 */
import "../config";
import pg from "pg";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.resolve(__dirname, "..", "..", "migrations");

interface JournalEntry {
  idx: number;
  when: number;
  tag: string;
}

function readJournal(): JournalEntry[] {
  const journalPath = path.join(MIGRATIONS_FOLDER, "meta", "_journal.json");
  if (!fs.existsSync(journalPath)) {
    throw new Error(`No journal at ${journalPath}`);
  }
  return JSON.parse(fs.readFileSync(journalPath, "utf-8")).entries as JournalEntry[];
}

// Must match drizzle-orm's migrator exactly: sha256 of the raw .sql file text.
function migrationHash(tag: string): string {
  const sql = fs.readFileSync(path.join(MIGRATIONS_FOLDER, `${tag}.sql`), "utf-8");
  return crypto.createHash("sha256").update(sql).digest("hex");
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");

  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000 });
  try {
    // Guard: a genuinely fresh DB should be migrated, not stamped.
    const { rows: fresh } = await pool.query(
      `SELECT to_regclass('public.garages') IS NOT NULL AS has_schema`,
    );
    if (!fresh[0]?.has_schema) {
      console.error(
        "[stamp] This database has no application schema (no 'garages' table).\n" +
          "        A stamp would mark migrations applied without creating any tables.\n" +
          "        Run `npm run db:migrate` to bootstrap a fresh database instead.",
      );
      process.exitCode = 1;
      return;
    }

    // drizzle's migrator tracking table (id SERIAL, hash text, created_at bigint).
    await pool.query(`CREATE SCHEMA IF NOT EXISTS drizzle`);
    await pool.query(
      `CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
         id SERIAL PRIMARY KEY,
         hash text NOT NULL,
         created_at bigint
       )`,
    );

    const entries = readJournal();
    let stamped = 0;
    let skipped = 0;
    for (const entry of entries) {
      const hash = migrationHash(entry.tag);
      const { rows } = await pool.query(
        `SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = $1 LIMIT 1`,
        [hash],
      );
      if (rows.length > 0) {
        skipped++;
        continue;
      }
      await pool.query(
        `INSERT INTO drizzle.__drizzle_migrations ("hash", "created_at") VALUES ($1, $2)`,
        [hash, entry.when],
      );
      stamped++;
      console.log(`[stamp] recorded ${entry.tag} (hash ${hash.slice(0, 12)}…)`);
    }

    console.log(
      `[stamp] done — ${stamped} migration(s) stamped, ${skipped} already present. ` +
        `\`npm run db:migrate\` will now be a no-op on this database.`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[stamp] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
