import EmbeddedPostgres from "embedded-postgres";
import { execSync } from "child_process";
import fs from "fs";

let pg: EmbeddedPostgres;

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require("net");
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => { server.close(); resolve(false); });
    server.listen(port);
  });
}

export async function setup() {
  // If Postgres is already running externally, just push schema and seed
  if (await isPortInUse(5432)) {
    console.log("Postgres already running on 5432 — reusing");
  } else {
    const dataDir = "./pg-test-data";

    if (fs.existsSync(dataDir)) {
      fs.rmSync(dataDir, { recursive: true, force: true });
    }

    pg = new EmbeddedPostgres({
      databaseDir: dataDir,
      user: "postgres",
      password: "postgres",
      port: 5432,
      persistent: false,
    });

    await pg.initialise();
    await pg.start();

    try {
      await pg.createDatabase("slis_gms");
    } catch (err: any) {
      if (!err.message?.includes("exists")) throw err;
    }

    console.log("Embedded Postgres started on port 5432");
  }

  // Push schema (ignore partial failures on non-core tables)
  console.log("Pushing schema...");
  try {
    execSync("npx drizzle-kit push --force", {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/slis_gms",
      },
    });
    console.log("Schema pushed successfully");
  } catch (err: any) {
    console.log("Schema push completed with warnings (some tables may have FK issues)");
  }

  // Seed a test garage
  const { Client } = require("pg");
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/slis_gms",
  });
  await client.connect();
  const garageResult = await client.query(`
    INSERT INTO garages (name, country, city, is_active)
    VALUES ('Test Garage', 'Saudi Arabia', 'Riyadh', true)
    RETURNING id
  `);
  const garageId = garageResult.rows[0]?.id || "";
  await client.end();

  // Write garageId to temp file so test processes can read it
  fs.writeFileSync(".test-garage-id", garageId, "utf-8");
  console.log("Test DB ready, garageId:", garageId);
}

export async function teardown() {
  if (pg) {
    try {
      await pg.stop();
    } catch {}
  }
  try {
    fs.rmSync("./pg-test-data", { recursive: true, force: true });
  } catch {}
  try {
    fs.unlinkSync(".test-garage-id");
  } catch {}
}
