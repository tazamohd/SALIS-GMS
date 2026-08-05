/**
 * H-1 — object-level authorization on refunds and warranties.
 *
 * Before the fix, these :id routes looked records up / mutated by id with no
 * garage predicate, so a manager in garage A could process garage B's refund
 * (financial fraud) or read/patch/delete garage B's warranties and claims by
 * UUID. Storage methods are now garage-scoped; cross-tenant reads and writes
 * 404 and change nothing.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";
import { storage } from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let refundId: string;
let warrantyId: string;
let claimId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  const adminAId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  const customerId = (await storage.createUser({
    email: `h1-cust-${Date.now()}@a.sa`, password: "x", role: "CUSTOMER",
    userType: "customer", garageId: garageA, fullName: "Cust",
  } as any)).id;

  // A refund owned by garage A.
  const refund = await storage.createRefund({
    garageId: garageA, customerId, amount: "250.00", refundMethod: "cash",
    reason: "overcharge", status: "pending", requestedBy: adminAId,
  } as any);
  refundId = refund.id;

  // A warranty + claim owned by garage A (raw insert to satisfy NOT NULLs).
  const w = await db.execute(sql`
    INSERT INTO warranties (id, garage_id, warranty_type, related_type, related_id,
      customer_id, coverage_description, start_date, end_date, status, created_by, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'parts', 'service', gen_random_uuid(),
      ${customerId}, 'Full cover', NOW(), NOW() + INTERVAL '1 year', 'active', ${adminAId}, NOW())
    RETURNING id`);
  warrantyId = (w.rows[0] as any).id;

  const c = await db.execute(sql`
    INSERT INTO warranty_claims (id, warranty_id, claim_date, issue_description, status, created_at)
    VALUES (gen_random_uuid(), ${warrantyId}, NOW(), 'Engine fault', 'pending', NOW())
    RETURNING id`);
  claimId = (c.rows[0] as any).id;
}, 60000);

describe("refunds — cross-tenant blocked", () => {
  it("owner reads, processes and approves; garage B cannot", async () => {
    expect((await adminA.get(`/api/refunds/${refundId}`)).status).toBe(200);
    // The exploit from the audit: process another garage's refund.
    expect((await adminB.post(`/api/refunds/${refundId}/process`)).status).toBe(404);
    expect((await adminB.post(`/api/refunds/${refundId}/approve`)).status).toBe(404);
    expect((await adminB.patch(`/api/refunds/${refundId}`).send({ notes: "hax" })).status).toBe(404);
    expect((await adminB.get(`/api/refunds/${refundId}`)).status).toBe(404);

    // The refund is untouched — still pending.
    const still = await storage.getRefund(refundId, garageA);
    expect(still?.status).toBe("pending");

    // Owner can process.
    expect((await adminA.post(`/api/refunds/${refundId}/process`)).status).toBe(200);
  });
});

describe("warranties + claims — cross-tenant blocked", () => {
  it("garage B cannot read, patch or delete garage A's warranty", async () => {
    expect((await adminA.get(`/api/warranties/${warrantyId}`)).status).toBe(200);
    expect((await adminB.get(`/api/warranties/${warrantyId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/warranties/${warrantyId}`).send({ status: "cancelled" })).status).toBe(404);
    expect((await adminB.delete(`/api/warranties/${warrantyId}`)).status).toBe(404);
    // Untouched.
    expect((await adminA.get(`/api/warranties/${warrantyId}`)).body.status).toBe("active");
  });

  it("garage B cannot read, patch or delete garage A's warranty claim", async () => {
    expect((await adminA.get(`/api/warranty-claims/${claimId}`)).status).toBe(200);
    expect((await adminB.get(`/api/warranty-claims/${claimId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/warranty-claims/${claimId}`).send({ status: "approved" })).status).toBe(404);
    expect((await adminB.delete(`/api/warranty-claims/${claimId}`)).status).toBe(404);
  });
});
