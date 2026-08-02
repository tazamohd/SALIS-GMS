/**
 * B16 breadth batch 6 — cross-tenant write scope on the purchase/finance tail
 * that carries a direct garage_id: purchase-tasks, quotation-requests,
 * supplier-payments, deliveries.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";
import { storage } from "../storage";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let userId: string;
let supplierA: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  userId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;
  supplierA = (await storage.createSupplier({ garageId: garageA, name: "Pay Supplier A" } as any)).id;
});

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

describe("B16 — purchase-task writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's purchase task", async () => {
    const task = await storage.createPurchaseTask({
      taskNumber: `PT-${uniq()}`, garageId: garageA, title: "Restock brakes", sourceType: "procurement",
    } as any);

    const bPatch = await adminB.patch(`/api/purchase-tasks/${task.id}`).send({ title: "hacked" });
    expect(bPatch.status).toBe(404);
    await adminB.delete(`/api/purchase-tasks/${task.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/purchase-tasks/${task.id}`).send({ title: "Restock brake pads" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — quotation-request writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's quotation request", async () => {
    const qr = await storage.createQuotationRequest({
      requestNumber: `QR-${uniq()}`, garageId: garageA, title: "Brake quote", createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/quotation-requests/${qr.id}`).send({ title: "hacked" });
    expect(bPatch.status).toBe(404);
    await adminB.delete(`/api/quotation-requests/${qr.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/quotation-requests/${qr.id}`).send({ title: "Brake quote v2" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — supplier-payment writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's supplier payment", async () => {
    const pay = await storage.createSupplierPayment({
      garageId: garageA, supplierId: supplierA, amount: "500.00", createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/supplier-payments/${pay.id}`).send({ amount: "1.00" });
    expect(bPatch.status).toBe(404);
    await adminB.delete(`/api/supplier-payments/${pay.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/supplier-payments/${pay.id}`).send({ status: "approved" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — delivery writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's delivery", async () => {
    const del = await storage.createDelivery({
      garageId: garageA, supplierId: supplierA, createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/deliveries/${del.id}`).send({ status: "delivered" });
    expect(bPatch.status).toBe(404);
    await adminB.delete(`/api/deliveries/${del.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/deliveries/${del.id}`).send({ status: "dispatched" });
    expect(aPatch.status).toBe(200);
  });
});
