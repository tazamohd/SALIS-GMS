/**
 * CSRF enforcement (final audit item). Enforcement is request-time gated
 * (CSRF_ENFORCE / production default), so these tests flip it on around each
 * assertion while the rest of the suite runs with it off.
 */
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let admin: supertestLib.Agent;

beforeAll(async () => {
  app = (await createTestApp()).app;
  admin = (await loginAsAdmin(app)).agent; // session established with enforcement OFF
});

afterEach(() => {
  delete process.env.CSRF_ENFORCE;
});

describe("CSRF enforcement", () => {
  it("blocks a mutating request without a token (403) and allows it with one", async () => {
    process.env.CSRF_ENFORCE = "true";

    // No token -> rejected before any handler runs.
    const blocked = await admin.post("/api/my/vehicles").send({ make: "Toyota" });
    expect(blocked.status).toBe(403);
    expect(blocked.body.message).toMatch(/CSRF/i);

    // Fetch the session token, replay the mutation with the header -> passes CSRF.
    const tokenRes = await admin.get("/api/csrf-token");
    expect(tokenRes.status).toBe(200);
    const token = tokenRes.body.csrfToken;
    expect(token).toBeTruthy();

    const ok = await admin
      .post("/api/my/vehicles")
      .set("X-CSRF-Token", token)
      .send({ make: "Toyota", model: "CSRF Test" });
    expect(ok.status).toBe(201);
  });

  it("rejects a wrong token (403)", async () => {
    process.env.CSRF_ENFORCE = "true";
    const res = await admin
      .post("/api/my/vehicles")
      .set("X-CSRF-Token", "not-the-token")
      .send({ make: "Toyota" });
    expect(res.status).toBe(403);
  });

  it("leaves GETs and exempt public/webhook endpoints unaffected", async () => {
    process.env.CSRF_ENFORCE = "true";
    // GET untouched.
    expect((await admin.get("/api/my/vehicles")).status).toBe(200);
    // Login (session creation) exempt.
    const anon = supertestLib.agent(app);
    const login = await anon.post("/api/login").send({ email: "nobody@x.sa", password: "wrong" });
    expect(login.status).toBe(401); // reached the auth handler, not a CSRF 403
    // Webhook exempt: reaches the whatsapp handler (200 in stub mode, not 403).
    delete process.env.WHATSAPP_APP_SECRET;
    const hook = await anon.post("/api/whatsapp/webhook").send({ entry: [] });
    expect(hook.status).toBe(200);
    // Public onboarding exempt: gets a validation 400, not a CSRF 403.
    const app400 = await anon.post("/api/garage-applications").send({});
    expect(app400.status).toBe(400);
  });

  it("is a no-op when enforcement is off (default in dev/test)", async () => {
    delete process.env.CSRF_ENFORCE;
    const res = await admin.post("/api/my/vehicles").send({ make: "Nissan", model: "NoCSRF" });
    expect(res.status).toBe(201);
  });
});
