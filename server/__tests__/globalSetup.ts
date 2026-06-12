import EmbeddedPostgres from "embedded-postgres";
import { execSync } from "child_process";
import fs from "fs";
import net from "net";
import { Client } from "pg";

const EMBEDDED_URL = "postgresql://postgres:postgres@localhost:5432/slis_gms";

let pg: EmbeddedPostgres | undefined;
let activeUrl: string;

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => { server.close(); resolve(false); });
    server.listen(port);
  });
}

function parseUrl(url: string) {
  const u = new URL(url);
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    database: u.pathname.replace(/^\//, ""),
  };
}

async function ensureDatabaseExists(url: string) {
  const parts = parseUrl(url);
  // Connect to maintenance DB to check for the target DB
  const admin = new Client({
    user: parts.user,
    password: parts.password,
    host: parts.host,
    port: parts.port,
    database: "postgres",
  });
  await admin.connect();
  try {
    const r = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [parts.database]);
    if (r.rowCount === 0) {
      console.log(`Creating test database "${parts.database}"...`);
      await admin.query(`CREATE DATABASE "${parts.database}"`);
    }
  } finally {
    await admin.end();
  }
}

async function resetPublicSchema(url: string) {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("GRANT ALL ON SCHEMA public TO public");
  } finally {
    await client.end();
  }
}

async function seedGarage(url: string): Promise<string> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const r = await client.query(`
      INSERT INTO garages (name, country, city, is_active)
      VALUES ('Test Garage', 'Saudi Arabia', 'Riyadh', true)
      RETURNING id
    `);
    const garageId = r.rows[0]?.id ?? "";

    // Give the test garage an active ENTERPRISE subscription so tests can hit
    // every requirePlan()-gated endpoint without per-test setup. Use ON CONFLICT
    // so re-runs are idempotent.
    if (garageId) {
      await client.query(
        `INSERT INTO subscriptions (garage_id, plan, status)
         VALUES ($1, 'ENTERPRISE', 'active')
         ON CONFLICT (garage_id) DO UPDATE
           SET plan = 'ENTERPRISE', status = 'active', updated_at = NOW()`,
        [garageId],
      );
    }
    return garageId;
  } finally {
    await client.end();
  }
}

export async function setup() {
  const testUrl = process.env.TEST_DATABASE_URL;

  if (testUrl) {
    activeUrl = testUrl;
    console.log("Using TEST_DATABASE_URL — skipping embedded Postgres");
    await ensureDatabaseExists(activeUrl);
  } else {
    // No escape hatch: fall back to embedded PG (best-effort; broken on Windows)
    activeUrl = EMBEDDED_URL;
    if (await isPortInUse(5432)) {
      console.log("Postgres already running on 5432 — reusing");
    } else {
      const dataDir = "./pg-test-data";
      for (let i = 0; i < 3; i++) {
        try {
          if (fs.existsSync(dataDir)) fs.rmSync(dataDir, { recursive: true, force: true });
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      pg = new EmbeddedPostgres({
        databaseDir: dataDir,
        user: "postgres",
        password: "postgres",
        port: 5432,
        persistent: false,
      });

      try {
        await pg.initialise();
      } catch (err: any) {
        if (!err.message?.includes("already exist")) throw err;
      }
      await pg.start();

      try {
        await pg.createDatabase("slis_gms");
      } catch (err: any) {
        if (!err.message?.includes("exists")) throw err;
      }
      console.log("Embedded Postgres started on port 5432");
    }
  }

  // Wipe and re-create public schema so each test run starts clean.
  console.log("Resetting public schema...");
  await resetPublicSchema(activeUrl);

  console.log("Pushing schema...");
  try {
    execSync("npx drizzle-kit push --force", {
      stdio: "pipe",
      env: { ...process.env, DATABASE_URL: activeUrl },
    });
    console.log("Schema pushed successfully");
  } catch (err: any) {
    console.log("Schema push completed with warnings:", err?.stderr?.toString?.() ?? err?.message);
  }

  const garageId = await seedGarage(activeUrl);
  fs.writeFileSync(".test-garage-id", garageId, "utf-8");
  console.log("Test DB ready, garageId:", garageId);
}

export async function teardown() {
  // Drop the schema we created so the test DB does not retain state between runs.
  if (activeUrl) {
    try {
      await resetPublicSchema(activeUrl);
    } catch (err: any) {
      console.log("Schema teardown warning:", err?.message);
    }
  }
  if (pg) {
    try { await pg.stop(); } catch {}
    try { fs.rmSync("./pg-test-data", { recursive: true, force: true }); } catch {}
  }
  try { fs.unlinkSync(".test-garage-id"); } catch {}
}
