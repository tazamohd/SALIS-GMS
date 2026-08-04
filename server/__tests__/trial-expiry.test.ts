/**
 * D1 — trial expiry enforcement (Stripe-independent).
 *
 * Provisioned trials carry an end date. Once it passes, the subscription
 * lazily flips to past_due on next access: paid-tier features return 402,
 * while baseline access keeps working so the garage never loses its data.
 * Stripe-managed subscriptions are exempt (webhooks own their status).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let owner: supertest.Agent;
let garageId: string;

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  app = (await createTestApp()).app;

  // Auto-approved PRO application → trialing PRO subscription.
  const email = `trial-${uniq()}@test.sa`;
  const submit = await supertestLib.agent(app).post("/api/garage-applications").send({
    providerType: "garage", businessName: `Trial Motors ${uniq()}`, ownerName: "Owner",
    email, password: "OwnerPass123!", requestedPlan: "PRO",
    taxNumber: "311111111111113", commercialRegistration: "1011223344",
  });
  expect(submit.body.status).toBe("approved");
  garageId = submit.body.garageId;
  owner = supertestLib.agent(app);
  await owner.post("/api/login").send({ email, password: "OwnerPass123!" });
}, 60000);

describe("trial provisioning", () => {
  it("a provisioned trial has a future end date", async () => {
    const res = await owner.get("/api/subscriptions/current");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("trialing");
    expect(res.body.plan).toBe("PRO");
    expect(new Date(res.body.currentPeriodEnd).getTime()).toBeGreaterThan(Date.now());
  });

  it("PRO features work during the trial", async () => {
    const res = await owner.get("/api/ai/predictions");
    expect(res.status).not.toBe(402);
  });
});

describe("trial expiry", () => {
  it("expired trial flips to past_due and locks paid-tier features, not baseline access", async () => {
    await db.execute(sql`
      UPDATE subscriptions SET current_period_end = NOW() - INTERVAL '1 day'
      WHERE garage_id = ${garageId}
    `);

    // Paid-tier feature now 402s with the trial-ended message.
    const gated = await owner.get("/api/ai/predictions");
    expect(gated.status).toBe(402);
    expect(gated.body.message).toMatch(/trial has ended/i);

    // The flip persisted.
    const sub = await owner.get("/api/subscriptions/current");
    expect(sub.body.status).toBe("past_due");

    // Baseline access still works — the garage is not locked out of its data.
    const customers = await owner.get("/api/customers");
    expect(customers.status).toBe(200);
  });

  it("a Stripe-managed subscription is never flipped locally", async () => {
    await db.execute(sql`
      UPDATE subscriptions
      SET status = 'trialing', stripe_subscription_id = ${"sub_test_" + uniq()}
      WHERE garage_id = ${garageId}
    `);
    const gated = await owner.get("/api/ai/predictions");
    expect(gated.status).not.toBe(402);
    const sub = await owner.get("/api/subscriptions/current");
    expect(sub.body.status).toBe("trialing");
  });
});
