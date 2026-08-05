import * as schema from "@shared/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let pool: any;
let db: NodePgDatabase<typeof schema>;

const isNeon = process.env.DATABASE_URL.includes('neon.tech');

// Cap how long any single statement may run so a pathological query (an
// unbounded scan, a lock wait) cannot pin a pooled connection indefinitely and
// starve the pool under load. Tunable via PG_STATEMENT_TIMEOUT_MS.
const STATEMENT_TIMEOUT_MS = Number(process.env.PG_STATEMENT_TIMEOUT_MS) || 30000;

if (isNeon) {
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  neonConfig.webSocketConstructor = ws.default;
  pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX) || 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: STATEMENT_TIMEOUT_MS,
  });
  db = drizzle({ client: pool, schema });
} else {
  // `pg` is CommonJS. Destructuring `Pool` off the dynamic-import namespace
  // yields undefined under Node's ESM loader, so reach through `default`.
  const pg = await import('pg');
  const Pool = (pg as any).default?.Pool ?? (pg as any).Pool;
  const { drizzle } = await import('drizzle-orm/node-postgres');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX) || 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: STATEMENT_TIMEOUT_MS,
  });
  db = drizzle({ client: pool, schema });
}

/**
 * Round-trips a trivial query so a readiness probe reports the connection
 * state rather than just the process being alive.
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export { pool, db, checkDatabaseHealth };
