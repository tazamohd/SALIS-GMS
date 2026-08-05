/**
 * Customer phone verification (C4) — session-backed OTP. Demo mode returns the
 * code (no SMS provider configured), verify sets phone + phone_verified_at.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";

let app: Express;
let agent: supertestLib.Agent;
let email: string;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  app = (await createTestApp()).app;
  agent = supertestLib.agent(app);
  email = `otp-${uniq()}@test.sa`;
  const reg = await agent.post("/api/customer/register").send({ email, password: "CustPass123!", fullName: "OTP Cust" });
  expect(reg.status).toBe(201);
});

describe("customer OTP", () => {
  it("requests a code (demo returns it), verifies it, and persists phone_verified_at", async () => {
    const reqRes = await agent.post("/api/customer/request-otp").send({ phone: "+966500001234" });
    expect(reqRes.status).toBe(200);
    const code = reqRes.body.demoOtp;
    expect(code).toMatch(/^\d{6}$/);

    // Wrong code first.
    expect((await agent.post("/api/customer/verify-otp").send({ code: "000000" })).status).toBe(400);

    const ok = await agent.post("/api/customer/verify-otp").send({ code });
    expect(ok.status).toBe(200);
    expect(ok.body.verified).toBe(true);

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const r = await client.query(`SELECT phone, phone_verified_at FROM users WHERE email = $1`, [email]);
      expect(r.rows[0].phone).toBe("+966500001234");
      expect(r.rows[0].phone_verified_at).not.toBeNull();
    } finally {
      await client.end();
    }
  });

  it("rejects a bad phone and verify-without-request", async () => {
    expect((await agent.post("/api/customer/request-otp").send({ phone: "abc" })).status).toBe(400);
    const fresh = supertestLib.agent(app);
    await fresh.post("/api/customer/register").send({ email: `otp2-${uniq()}@test.sa`, password: "CustPass123!" });
    expect((await fresh.post("/api/customer/verify-otp").send({ code: "123456" })).status).toBe(400);
  });
});
