/**
 * B11 — modular procurement/support routers are read-scoped by tenant.
 *
 * These routers previously (a) trusted a client-supplied ?garage_id on the
 * list endpoints and (b) looked up records by id with no garage filter, so
 * any authenticated user could read another garage's purchase orders,
 * quotations, supplier payments, deliveries and support tickets — including
 * child collections (items, quotations, events). Lists now use the session
 * garage; by-id and child routes 404 across tenants.
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
let poId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  const adminAId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  const supplier = await storage.createSupplier({
    garageId: garageA, name: "Test Supplier", contactPerson: "X", email: "s@a.sa",
  } as any);
  const po = await storage.createPurchaseOrderWithItems(
    { garageId: garageA, supplierId: supplier.id, status: "draft", totalAmount: "500.00", createdBy: adminAId } as any,
    [{ partName: "Filter", quantity: 2, unitPrice: "50.00", lineTotal: "100.00" } as any],
  );
  poId = po.id;
}, 60000);

describe("purchase orders — tenant read scope", () => {
  it("owner reads the PO and its items", async () => {
    const detail = await adminA.get(`/api/purchase-orders/${poId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.id).toBe(poId);

    const items = await adminA.get(`/api/purchase-orders/${poId}/items`);
    expect(items.status).toBe(200);
    expect(items.body.length).toBe(1);
  });

  it("another garage cannot read the PO or its items (404)", async () => {
    expect((await adminB.get(`/api/purchase-orders/${poId}`)).status).toBe(404);
    expect((await adminB.get(`/api/purchase-orders/${poId}/items`)).status).toBe(404);
  });

  it("the list endpoint ignores a spoofed ?garage_id and scopes to the session", async () => {
    // Garage B asks for garage A's orders by passing A's id — must not leak.
    const spoof = await adminB.get(`/api/purchase-orders?garage_id=${garageA}`);
    expect(spoof.status).toBe(200);
    expect(spoof.body.some((o: any) => o.id === poId)).toBe(false);

    // Garage A sees its own order without passing any garage_id.
    const own = await adminA.get(`/api/purchase-orders`);
    expect(own.body.some((o: any) => o.id === poId)).toBe(true);
  });
});
