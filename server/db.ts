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

if (isNeon) {
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  neonConfig.webSocketConstructor = ws.default;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // `pg` is CommonJS. Destructuring `Pool` off the dynamic-import namespace
  // yields undefined under Node's ESM loader, so reach through `default`.
  const pg = await import('pg');
  const Pool = (pg as any).default?.Pool ?? (pg as any).Pool;
  const { drizzle } = await import('drizzle-orm/node-postgres');
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
