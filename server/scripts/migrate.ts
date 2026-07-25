/**
 * Production-safe migration runner.
 *
 * Applies every versioned SQL file in `./migrations/` in order, recording
 * each in Drizzle's internal `__drizzle_migrations` table so re-runs are
 * idempotent. Unlike `drizzle-kit push` (dev-only — diffs schema.ts against
 * the live DB and applies the diff interactively), this runner is the right
 * production tool: it has a forward-only history, no schema introspection,
 * and never requires the source TypeScript schema at runtime.
 *
 * Usage:
 *   DATABASE_URL=postgresql://… tsx server/scripts/migrate.ts
 *
 * Container entrypoint pattern:
 *   tsx server/scripts/migrate.ts && node dist/index.js
 *
 * The script exits 0 on success, 1 on any migration error. Drizzle's runner
 * is transactional per migration; a failure aborts that file's transaction
 * and leaves the previously-applied migrations intact.
 */

import "../config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_FOLDER = path.resolve(__dirname, "..", "..", "migrations");

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  // Conservative pool — one connection is enough for sequential migrations,
  // and small pools fail fast if the credentials are wrong rather than
  // hanging on retries.
  const pool = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 10_000,
  });

  const db = drizzle(pool);

  console.log(`[migrate] connecting to ${redactUrl(url)}`);
  console.log(`[migrate] migrations folder: ${MIGRATIONS_FOLDER}`);

  const startedAt = Date.now();
  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    const elapsed = Date.now() - startedAt;
    console.log(`[migrate] ✅ all migrations applied in ${elapsed}ms`);
  } finally {
    await pool.end();
  }
}

function redactUrl(url: string): string {
  // pg connection strings: postgres://user:pass@host:port/db
  return url.replace(/(:\/\/[^:]+):([^@]+)@/, "$1:****@");
}

main().catch((err) => {
  console.error("[migrate] ❌ migration failed:", err);
  process.exit(1);
});
