/**
 * WhatsApp webhook (audit medium #13) — a server-to-server callback with no
 * session. It must be reachable WITHOUT auth, verify the GET subscription
 * handshake, and (when an app secret is configured) fail closed on a bad
 * signature.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createHmac } from "crypto";
import { createTestApp } from "./setup";

let app: Express;
const VERIFY_TOKEN = "demo-verify-token";
const APP_SECRET = "demo-app-secret";

beforeAll(async () => {
  app = (await createTestApp()).app;
  process.env.WHATSAPP_VERIFY_TOKEN = VERIFY_TOKEN;
});
afterAll(() => {
  delete process.env.WHATSAPP_VERIFY_TOKEN;
  delete process.env.WHATSAPP_APP_SECRET;
});

describe("whatsapp webhook", () => {
  it("GET verification echoes the challenge only with the right verify token", async () => {
    const anon = supertestLib.agent(app);
    const ok = await anon.get("/api/whatsapp/webhook")
      .query({ "hub.mode": "subscribe", "hub.verify_token": VERIFY_TOKEN, "hub.challenge": "12345" });
    expect(ok.status).toBe(200);
    expect(ok.text).toBe("12345");

    const bad = await anon.get("/api/whatsapp/webhook")
      .query({ "hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "12345" });
    expect(bad.status).toBe(403);
  });

  it("POST is reachable without authentication (no session)", async () => {
    delete process.env.WHATSAPP_APP_SECRET; // no signature required
    const anon = supertestLib.agent(app);
    const res = await anon.post("/api/whatsapp/webhook").send({ entry: [] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("fails closed on a missing/invalid signature when an app secret is set", async () => {
    process.env.WHATSAPP_APP_SECRET = APP_SECRET;
    const anon = supertestLib.agent(app);

    // No signature -> 401.
    expect((await anon.post("/api/whatsapp/webhook").send({ entry: [] })).status).toBe(401);

    // Wrong signature -> 401.
    const bad = await anon.post("/api/whatsapp/webhook")
      .set("Content-Type", "application/json")
      .set("x-hub-signature-256", "sha256=deadbeef")
      .send(JSON.stringify({ entry: [] }));
    expect(bad.status).toBe(401);

    // Correct signature over the exact raw body -> 200.
    const body = JSON.stringify({ entry: [{ id: "1" }] });
    const sig = "sha256=" + createHmac("sha256", APP_SECRET).update(body).digest("hex");
    const good = await anon.post("/api/whatsapp/webhook")
      .set("Content-Type", "application/json")
      .set("x-hub-signature-256", sig)
      .send(body);
    expect(good.status).toBe(200);
  });
});
