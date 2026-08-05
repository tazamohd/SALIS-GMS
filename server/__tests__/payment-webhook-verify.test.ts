/**
 * Gateway webhook signature verification (deep-audit blocker B8).
 * Proves the fail-closed gate: a forged/unsigned webhook never settles an invoice.
 */
import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, seedCustomer } from "./helpers";
import { verifyGatewayWebhook } from "../services/payments/webhook-verify";

const RAW = JSON.stringify({ id: "evt_1", status: "paid", invoiceId: "inv-1" });

describe("verifyGatewayWebhook — fail-closed (B8)", () => {
  it("rejects when no webhook secret is configured", () => {
    delete process.env.MOYASAR_WEBHOOK_SECRET;
    expect(verifyGatewayWebhook("moyasar", { headers: { "x-moyasar-signature": "abc" }, rawBody: RAW }).ok).toBe(false);
  });

  it("rejects a wrong signature when the secret IS configured", () => {
    process.env.MOYASAR_WEBHOOK_SECRET = "shh";
    expect(verifyGatewayWebhook("moyasar", { headers: { "x-moyasar-signature": "deadbeef" }, rawBody: RAW }).ok).toBe(false);
    delete process.env.MOYASAR_WEBHOOK_SECRET;
  });

  it("rejects a missing signature header", () => {
    process.env.MOYASAR_WEBHOOK_SECRET = "shh";
    expect(verifyGatewayWebhook("moyasar", { headers: {}, rawBody: RAW }).ok).toBe(false);
    delete process.env.MOYASAR_WEBHOOK_SECRET;
  });

  it("accepts a correct HMAC-SHA256 signature", () => {
    process.env.MOYASAR_WEBHOOK_SECRET = "shh";
    const sig = crypto.createHmac("sha256", "shh").update(RAW).digest("hex");
    expect(verifyGatewayWebhook("moyasar", { headers: { "x-moyasar-signature": sig }, rawBody: RAW }).ok).toBe(true);
    delete process.env.MOYASAR_WEBHOOK_SECRET;
  });

  it("accepts a 'sha256='-prefixed signature", () => {
    process.env.MOYASAR_WEBHOOK_SECRET = "shh";
    const sig = crypto.createHmac("sha256", "shh").update(RAW).digest("hex");
    expect(verifyGatewayWebhook("moyasar", { headers: { "x-moyasar-signature": `sha256=${sig}` }, rawBody: RAW }).ok).toBe(true);
    delete process.env.MOYASAR_WEBHOOK_SECRET;
  });
});

describe("verifyGatewayWebhook — Stripe timestamped scheme (medium #11)", () => {
  const SECRET = "whsec_test";
  const stripeSig = (t: number, body: string, secret = SECRET) =>
    `t=${t},v1=${crypto.createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;

  it("accepts a correct t=/v1= signature", () => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    const t = Math.floor(Date.now() / 1000);
    const r = verifyGatewayWebhook("stripe", { headers: { "stripe-signature": stripeSig(t, RAW) }, rawBody: RAW });
    expect(r.ok).toBe(true);
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("rejects a plain HMAC (Stripe is NOT a bare body HMAC)", () => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    const bare = crypto.createHmac("sha256", SECRET).update(RAW).digest("hex");
    expect(verifyGatewayWebhook("stripe", { headers: { "stripe-signature": bare }, rawBody: RAW }).ok).toBe(false);
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("rejects a tampered body and an out-of-tolerance timestamp", () => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    const t = Math.floor(Date.now() / 1000);
    // Signature computed for RAW, but a different body is delivered.
    const sig = stripeSig(t, RAW);
    expect(verifyGatewayWebhook("stripe", { headers: { "stripe-signature": sig }, rawBody: RAW + "x" }).ok).toBe(false);
    // Correct signature but a stale timestamp (> 5 min) -> replay rejected.
    const old = t - 10 * 60;
    expect(verifyGatewayWebhook("stripe", { headers: { "stripe-signature": stripeSig(old, RAW) }, rawBody: RAW }).ok).toBe(false);
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("fails closed with no secret and on a malformed header", () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(verifyGatewayWebhook("stripe", { headers: { "stripe-signature": "t=1,v1=abc" }, rawBody: RAW }).ok).toBe(false);
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    expect(verifyGatewayWebhook("stripe", { headers: { "stripe-signature": "garbage" }, rawBody: RAW }).ok).toBe(false);
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });
});

describe("webhook route — forged event does not settle the invoice (B8)", () => {
  let app: Express;
  let admin: supertest.Agent;
  let garageId: string;
  let customerId: string;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    const a = await loginAsAdmin(app);
    admin = a.agent;
    garageId = a.garageId;
    customerId = (await seedCustomer(admin, garageId)).id;
  });

  it("rejects an unverified webhook and leaves the invoice unpaid", async () => {
    delete process.env.MOYASAR_WEBHOOK_SECRET; // fail-closed: no secret configured

    const inv = await admin.post("/api/invoices").send({
      garageId, customerId,
      totalAmount: "200.00", subtotal: "200.00", taxAmount: "0.00",
      balanceAmount: "200.00", paidAmount: "0.00", status: "sent",
      dueDate: new Date(Date.now() + 30 * 864e5).toISOString(),
      invoiceDate: new Date().toISOString(),
      invoiceNumber: `INV-WH-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    });
    expect([200, 201]).toContain(inv.status);
    const id = inv.body.id;

    // Forged completed event, no signature — must NOT settle.
    const hook = await supertest(app)
      .post("/api/payments/webhook/moyasar")
      .send({ invoiceId: id, status: "completed", amount: 200 });
    expect(hook.status).toBe(200);
    expect(hook.body.verified).toBe(false);

    const after = await admin.get(`/api/invoices/${id}`);
    expect(parseFloat(after.body.balanceAmount)).toBeCloseTo(200);
    expect(parseFloat(after.body.paidAmount)).toBeCloseTo(0);
    expect(after.body.status).toBe("sent");
  });
});
