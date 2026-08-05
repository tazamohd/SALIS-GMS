/**
 * Fixes for the four launch-blocking gaps found by the verification audit:
 *  #1 estimate GET-by-id cross-tenant read  → 404
 *  #2 document delete cross-tenant IDOR      → no-op (owner's doc survives)
 *  #3 PUT /api/job-cards/:id completion       → 400 (must use guarded PATCH)
 * (#4 legacy Stripe webhook now routes through the already-tested
 *  settleGatewayPayment; covered by gateway-settlement-idempotency.test.ts.)
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin, seedCustomer, seedVehicle, seedJobCard } from "./helpers";
import { storage } from "../storage";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let adminUserId: string;
let customerId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  adminUserId = a.user?.id;
  adminB = (await createSecondGarageAdmin(app)).agent;
  customerId = (await seedCustomer(adminA, garageA)).id;
});

describe("Verification fix #1 — estimate GET-by-id is tenant-scoped", () => {
  it("garage B gets 404 for garage A's estimate; garage A gets 200", async () => {
    const est = await storage.createEstimate({
      garageId: garageA, customerId, title: "Brake job", createdBy: adminUserId,
      subtotal: "100.00", taxRate: "15.00", taxAmount: "15.00", discountAmount: "0.00", totalAmount: "115.00",
    } as any);

    const asB = await adminB.get(`/api/estimates/${est.id}`);
    expect(asB.status).toBe(404);

    const asA = await adminA.get(`/api/estimates/${est.id}`);
    expect(asA.status).toBe(200);
    expect(asA.body.id).toBe(est.id);
  });
});

describe("Verification fix #2 — document delete is tenant-scoped", () => {
  it("garage B cannot delete garage A's document", async () => {
    const created = await adminA.post("/api/documents").send({ name: `DocX-${Date.now()}`, type: "pdf", category: "contracts" });
    expect([200, 201]).toContain(created.status);
    const docId = created.body.id;

    const bDelete = await adminB.delete(`/api/documents/${docId}`);
    expect(bDelete.status).toBe(404); // scoped delete matched nothing

    // The owner's document survives and is still listed.
    const listA = await adminA.get("/api/documents");
    expect(JSON.stringify(listA.body)).toContain(docId);
  });
});

describe("Verification fix #3 — PUT job-card cannot complete (bypass guard)", () => {
  it("PUT with status=completed is rejected with 400", async () => {
    const vehicle = await seedVehicle(adminA, customerId, garageA);
    const jobCard = await seedJobCard(adminA, vehicle.id, customerId, garageA);

    const put = await adminA.put(`/api/job-cards/${jobCard.id}`).send({ status: "completed" });
    expect(put.status).toBe(400);

    // A non-completion PUT still works.
    const ok = await adminA.put(`/api/job-cards/${jobCard.id}`).send({ notes: "in progress" });
    expect([200, 201]).toContain(ok.status);
  });
});
