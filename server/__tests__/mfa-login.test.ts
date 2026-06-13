/**
 * MFA login enforcement (Story 4.2 / FR-11).
 *
 * Proves that when 2FA is enabled, password alone does NOT authenticate — the
 * login is gated behind the second factor. Enables 2FA via a direct DB insert so
 * the test is not coupled to TOTP timing.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";

let app: Express;
const user = {
  email: `mfa-test-${Date.now()}@slis.sa`,
  password: "SecurePass123!",
  fullName: "MFA Test User",
  phone: "+966500007777",
};
let userId: string;

async function enable2FA(uid: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL! });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO two_factor_auth (user_id, secret, is_enabled, backup_codes)
       VALUES ($1, $2, true, $3)
       ON CONFLICT (user_id) DO UPDATE SET is_enabled = true, secret = EXCLUDED.secret`,
      [uid, "JBSWY3DPEHPK3PXP", JSON.stringify(["backup-1", "backup-2"])],
    );
  } finally {
    await client.end();
  }
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const reg = await supertest(app).post("/api/register").send(user);
  userId = reg.body.id;
});

describe("MFA login enforcement", () => {
  it("logs in normally before 2FA is enabled", async () => {
    const res = await supertest.agent(app).post("/api/login").send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.mfaRequired).toBeFalsy();
    expect(res.body).toHaveProperty("id");
  });

  it("does NOT authenticate on password alone once 2FA is enabled", async () => {
    await enable2FA(userId);
    const agent = supertest.agent(app);
    const res = await agent.post("/api/login").send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.mfaRequired).toBe(true);
    // The session must NOT be authenticated yet.
    const who = await agent.get("/api/auth/user");
    expect(who.status).toBe(401);
  });

  it("rejects /login/mfa with a wrong token", async () => {
    const agent = supertest.agent(app);
    await agent.post("/api/login").send({ email: user.email, password: user.password });
    const res = await agent.post("/api/login/mfa").send({ token: "000000" });
    expect([400, 401, 429]).toContain(res.status);
    // Still not authenticated.
    const who = await agent.get("/api/auth/user");
    expect(who.status).toBe(401);
  });

  it("rejects /login/mfa with no pending login", async () => {
    const res = await supertest.agent(app).post("/api/login/mfa").send({ token: "123456" });
    expect(res.status).toBe(401);
  });
});
