/**
 * B16 breadth batch 4 — cross-tenant write scope on inventory/finance config:
 * stock-alerts, reorder-settings, tax-configurations (all carry garage_id).
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
let sparePartId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  userId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  const sp = await storage.createSparePart({
    name: "B16b4 Widget", category: "test", sku: `SKU-B16B4-${Date.now()}`, createdBy: userId,
  } as any);
  sparePartId = sp.id;
});

describe("B16 — stock-alert writes are tenant-scoped", () => {
  it("garage B cannot update garage A's stock alert", async () => {
    const alert = await storage.createStockAlert({
      garageId: garageA, sparePartId, alertType: "low_stock", alertStatus: "active", currentQuantity: 2, threshold: 5,
    } as any);

    const bPatch = await adminB.patch(`/api/stock-alerts/${alert.id}`).send({ alertStatus: "resolved" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/stock-alerts/${alert.id}`).send({ alertStatus: "acknowledged" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — reorder-setting writes are tenant-scoped", () => {
  it("garage B cannot update garage A's reorder setting", async () => {
    const setting = await storage.createReorderSetting({
      garageId: garageA, sparePartId, reorderPoint: 5, reorderQuantity: 20, isAutoReorderEnabled: true, createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/reorder-settings/${setting.id}`).send({ reorderQuantity: 999 });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/reorder-settings/${setting.id}`).send({ reorderQuantity: 30 });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — tax-configuration writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's tax configuration", async () => {
    const cfg = await storage.createTaxConfiguration({
      garageId: garageA, taxName: "VAT", taxType: "percentage", taxRate: "15", isActive: true, createdBy: userId,
    } as any);

    const bPatch = await adminB.patch(`/api/tax-configurations/${cfg.id}`).send({ taxRate: "0" });
    expect(bPatch.status).toBe(404);

    await adminB.delete(`/api/tax-configurations/${cfg.id}`); // scoped no-op

    // Still present + editable for the owner after B's attempts.
    const aPatch = await adminA.patch(`/api/tax-configurations/${cfg.id}`).send({ taxRate: "15" });
    expect(aPatch.status).toBe(200);
  });
});
