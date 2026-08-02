/**
 * B16 breadth batch 5 — cross-tenant write scope on supplier child rows that
 * have NO garage_id of their own (supplier_price_list, supplier_performance).
 * These are scoped through the parent supplier's garage.
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
let supplierA: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  adminB = (await createSecondGarageAdmin(app)).agent;

  supplierA = (await storage.createSupplier({ garageId: garageA, name: "Supplier A" } as any)).id;
});

describe("B16 — supplier-price-list writes scoped via parent supplier", () => {
  it("garage B cannot read, update or delete garage A's price list", async () => {
    const pl = await storage.createSupplierPriceList({
      supplierId: supplierA, partName: "Brake Pad", unitPrice: "50.00",
    } as any);

    const bGet = await adminB.get(`/api/supplier-price-lists/${pl.id}`);
    expect(bGet.status).toBe(404);

    const bPatch = await adminB.patch(`/api/supplier-price-lists/${pl.id}`).send({ unitPrice: "1.00" });
    expect(bPatch.status).toBe(404);

    await adminB.delete(`/api/supplier-price-lists/${pl.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/supplier-price-lists/${pl.id}`).send({ unitPrice: "55.00" });
    expect(aPatch.status).toBe(200);
    expect(String(aPatch.body.unitPrice)).toBe("55.00");
  });
});

describe("B16 — supplier-performance writes scoped via parent supplier", () => {
  it("garage B cannot read or update garage A's performance record", async () => {
    const perf = await storage.createSupplierPerformance({
      supplierId: supplierA, period: "2026-Q1", qualityScore: "80",
    } as any);

    const bGet = await adminB.get(`/api/supplier-performance/${perf.id}`);
    expect(bGet.status).toBe(404);

    const bPatch = await adminB.patch(`/api/supplier-performance/${perf.id}`).send({ qualityScore: "0" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/supplier-performance/${perf.id}`).send({ qualityScore: "90" });
    expect(aPatch.status).toBe(200);
  });
});
