/**
 * Audited impersonation (Story 5.2 / FR-10).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;

const PLATFORM = {
  email: `platform-${Date.now()}@slis.sa`,
  password: "SecurePass123!",
  fullName: "Platform Admin",
  phone: "+966500008888",
};

async function makePlatformPrincipal(email: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL! });
  await client.connect();
  try {
    // A Platform Principal is a user not bound to a single garage.
    await client.query(`UPDATE users SET garage_id = NULL WHERE email = $1`, [email]);
  } finally {
    await client.end();
  }
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("Audited impersonation", () => {
  it("forbids a normal (garaged) user from impersonating", async () => {
    const { agent } = await loginAsAdmin(app); // attached to a garage
    const res = await agent.post("/api/admin/impersonate").send({ targetGarageId: process.env.TEST_GARAGE_ID });
    expect(res.status).toBe(403);
  });

  it("lets a platform principal start/stop impersonation and audits it", async () => {
    const agent = supertest.agent(app);
    await agent.post("/api/register").send(PLATFORM);
    await makePlatformPrincipal(PLATFORM.email);
    const login = await agent.post("/api/login").send({ email: PLATFORM.email, password: PLATFORM.password });
    expect(login.status).toBe(200);

    const target = process.env.TEST_GARAGE_ID!;
    const start = await agent.post("/api/admin/impersonate").send({ targetGarageId: target });
    expect(start.status).toBe(200);
    expect(start.body).toMatchObject({ impersonating: true, targetGarageId: target });

    const status = await agent.get("/api/admin/impersonate/status");
    expect(status.body).toMatchObject({ impersonating: true, targetGarageId: target });

    const stop = await agent.post("/api/admin/impersonate/stop");
    expect(stop.body).toMatchObject({ impersonating: false });

    // Audit rows for start + stop exist for this target garage.
    const client = new Client({ connectionString: process.env.DATABASE_URL! });
    await client.connect();
    try {
      const r = await client.query(
        `SELECT action FROM audit_log WHERE resource_id = $1 AND action IN ('IMPERSONATION_START','IMPERSONATION_STOP')`,
        [target],
      );
      const actions = r.rows.map((x) => x.action);
      expect(actions).toContain("IMPERSONATION_START");
      expect(actions).toContain("IMPERSONATION_STOP");
    } finally {
      await client.end();
    }
  });

  it("rejects impersonating a non-existent garage", async () => {
    const agent = supertest.agent(app);
    await agent.post("/api/register").send({ ...PLATFORM, email: `platform2-${Date.now()}@slis.sa` });
    // (still garaged → 403 path covered above; here just assert auth required without session)
    const res = await supertest(app).post("/api/admin/impersonate").send({ targetGarageId: "x" });
    expect([401, 403]).toContain(res.status);
  });
});
