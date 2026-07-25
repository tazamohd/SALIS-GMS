/**
 * Demo access endpoints suite.
 *
 * Covers the public, demo-mode-gated endpoints that power the login-page
 * quick-pick (server/routes/demo.ts):
 *  - GET  /api/demo/accounts never leaks passwords and lists every base role.
 *  - POST /api/demo/login establishes a session by role key (no password on the
 *    wire), rejects unknown roles, and reports unseeded accounts as 404.
 *
 * Demo mode is forced on via DEMO_MODE so the suite is independent of NODE_ENV.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";

let app: Express;

// One seeded demo role used to exercise the login path; the rest stay unseeded
// so we can also assert the 404 "not seeded" branch.
const SEEDED_ROLE_KEY = "SYSTEM_ADMIN";
const SEEDED_EMAIL = "system_admin@demo.salisauto.com";

async function insertDemoUser(garageId: string | undefined) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required for demo-access setup");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`DELETE FROM users WHERE email = $1`, [SEEDED_EMAIL]);
    await client.query(
      `INSERT INTO users (id, email, password, full_name, user_type, role, garage_id, is_active)
       VALUES (gen_random_uuid()::text, $1, $2, $3, 'admin', 'ADMIN', $4, true)`,
      [SEEDED_EMAIL, "$2b$10$abcdefghijklmnopqrstuv", "Demo System Administrator", garageId ?? null],
    );
  } finally {
    await client.end();
  }
}

beforeAll(async () => {
  process.env.DEMO_MODE = "true";
  const result = await createTestApp();
  app = result.app;
  await insertDemoUser(process.env.TEST_GARAGE_ID);
});

describe("GET /api/demo/accounts", () => {
  it("is reachable without authentication and lists every base role", async () => {
    const res = await supertest(app).get("/api/demo/accounts");
    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(Array.isArray(res.body.accounts)).toBe(true);
    // 20 STANDARD_ROLES are seeded as demo accounts.
    expect(res.body.accounts.length).toBeGreaterThanOrEqual(20);
    expect(res.body.accounts.map((a: any) => a.roleKey)).toContain(SEEDED_ROLE_KEY);
  });

  it("never includes passwords in the account list", async () => {
    const res = await supertest(app).get("/api/demo/accounts");
    for (const account of res.body.accounts) {
      expect(account).not.toHaveProperty("password");
      expect(account).toHaveProperty("email");
      expect(account).toHaveProperty("guardRole");
    }
  });
});

describe("POST /api/demo/login", () => {
  it("establishes a session for a seeded role without a password", async () => {
    const agent = supertest.agent(app);
    const res = await agent.post("/api/demo/login").send({ roleKey: SEEDED_ROLE_KEY });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(SEEDED_EMAIL);
    expect(res.body).not.toHaveProperty("password");

    // Session really established — an authenticated route now succeeds.
    const me = await agent.get("/api/auth/user");
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(SEEDED_EMAIL);
  });

  it("rejects an unknown role key with 400", async () => {
    const res = await supertest(app).post("/api/demo/login").send({ roleKey: "NOT_A_REAL_ROLE" });
    expect(res.status).toBe(400);
  });

  it("reports an unseeded (but valid) role as 404", async () => {
    // OWNER is a valid role key but is not inserted by this suite.
    const res = await supertest(app).post("/api/demo/login").send({ roleKey: "OWNER" });
    expect(res.status).toBe(404);
  });
});
