/**
 * B16 breadth batch — cross-tenant write scope on appointments + purchase orders.
 * A garage-B admin must not be able to update/delete garage-A's rows by id.
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

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  userId = a.user?.id;
  adminB = (await createSecondGarageAdmin(app)).agent;
});

describe("B16 — appointment writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's appointment", async () => {
    const appt = await storage.createAppointment({
      garageId: garageA,
      appointmentNumber: `APT-${Date.now()}`,
      customerName: "Test Cust",
      customerPhone: "+966500000123",
      vehicleInfo: { make: "Toyota", model: "Camry", year: 2020 },
      serviceType: "maintenance",
      appointmentDate: new Date(),
      createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/appointments/${appt.id}`).send({ serviceType: "repair" });
    expect(bPatch.status).toBe(404);

    await adminB.delete(`/api/appointments/${appt.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/appointments/${appt.id}`).send({ serviceType: "repair" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — purchase-order writes are tenant-scoped", () => {
  it("garage B cannot update garage A's purchase order", async () => {
    const supplier = await storage.createSupplier({ name: "PO Supplier", garageId: garageA } as any);
    const po = await storage.createPurchaseOrder({
      garageId: garageA,
      poNumber: `PO-${Date.now()}`,
      supplierId: supplier.id,
      subtotal: "100.00",
      taxAmount: "15.00",
      totalAmount: "115.00",
      createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/purchase-orders/${po.id}`).send({ subtotal: "1.00" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/purchase-orders/${po.id}`).send({ subtotal: "120.00" });
    expect(aPatch.status).toBe(200);
  });
});
