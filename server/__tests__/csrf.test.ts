import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "./setup";

let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

// Build an authenticated agent that deliberately does NOT carry a CSRF token,
// so we can assert the validator's behaviour directly.
async function authedAgentWithoutToken() {
  const agent = supertest.agent(app);
  const email = `csrf-${Date.now()}@slis.sa`;
  await agent.post("/api/register").send({
    email,
    password: "SecurePass123!",
    fullName: "CSRF Test",
    phone: "+966500000123",
  });
  return agent;
}

describe("CSRF protection", () => {
  it("GET /api/csrf-token returns a token", async () => {
    const agent = supertest.agent(app);
    const res = await agent.get("/api/csrf-token");
    expect(res.status).toBe(200);
    expect(typeof res.body.csrfToken).toBe("string");
    expect(res.body.csrfToken.length).toBeGreaterThan(0);
  });

  it("rejects an authenticated state-changing request with no CSRF token", async () => {
    const agent = await authedAgentWithoutToken();
    const res = await agent.post("/api/customers").send({ fullName: "X", email: "x@y.sa" });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/csrf/i);
  });

  it("allows the request once a valid CSRF token is attached", async () => {
    const agent = await authedAgentWithoutToken();
    const tokenRes = await agent.get("/api/csrf-token");
    agent.set("x-csrf-token", tokenRes.body.csrfToken);
    const res = await agent.post("/api/customers").send({ fullName: "X", email: "x@y.sa" });
    // No longer blocked by CSRF (may 400/403-for-other-reasons, but not the CSRF 403).
    expect(res.body.message).not.toMatch(/csrf/i);
  });

  it("does not block safe (GET) requests", async () => {
    const agent = await authedAgentWithoutToken();
    const res = await agent.get("/api/csrf-token");
    expect(res.status).toBe(200);
  });
});
