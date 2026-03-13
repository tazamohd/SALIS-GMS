import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isNeon = process.env.DATABASE_URL.includes('neon.tech');

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
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Local development: standard pg driver (no WebSocket needed)
  const pg = await import('pg');
  const { drizzle: drizzleNode } = await import('drizzle-orm/node-postgres');

  pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30_000,
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
