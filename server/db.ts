// @ts-nocheck
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isNeon = process.env.DATABASE_URL.includes('neon.tech');

// Pool sizing note (2026-06-11): an experiment with smaller/shorter-lived test
// pools (max 5, idle 2s) to bound vitest's per-file pool accumulation made the
// suite WORSE (connect churn → "Connection terminated unexpectedly"). The
// empirically best run used the plain 20/30s sizing below. If mid-suite
// connection timeouts reappear, suspect slow fsync on the Postgres data dir
// (OneDrive-synced paths!) before touching these numbers.
const POOL_MAX = 20;
const POOL_IDLE_MS = 30_000;

// Use standard pg Pool for local dev, Neon serverless Pool for production
let pool: any;
let db: any;

if (isNeon) {
  // Production: Neon serverless driver with WebSocket support
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle: drizzleNeon } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  neonConfig.webSocketConstructor = ws.default;

  pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
    max: POOL_MAX,
    idleTimeoutMillis: POOL_IDLE_MS,
    connectionTimeoutMillis: 5_000,
  });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Local development: standard pg driver (no WebSocket needed)
  const pg = await import('pg');
  const { drizzle: drizzleNode } = await import('drizzle-orm/node-postgres');

  pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
    max: POOL_MAX,
    idleTimeoutMillis: POOL_IDLE_MS,
    connectionTimeoutMillis: 5_000,
  });
  db = drizzleNode({ client: pool, schema });
}

export { pool, db };

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try { await client.query('SELECT 1'); return true; } finally { client.release(); }
  } catch { return false; }
}
