/**
 * Spare-part inventory PATCH — atomic, audited, optimistic-concurrency safe
 * (audit medium #7).
 *
 * Before the fix the handler did a blind absolute overwrite of stockQuantity
 * (last-writer-wins, no audit trail). Now the update runs under a row lock,
 * writes an inventory_audit_trail entry when stock moves, and honours an
 * optional expectedStockQuantity guard (409 on mismatch).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";
import { storage } from "../storage";

let app: Express;
let admin: supertest.Agent;
let garageA: string;
let userId: string;
let sparePartId: string;
let inventoryId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  garageA = a.garageId;
  userId = a.user.id;

  const sp = await storage.createSparePart({
    name: "M7 Widget", category: "test", sku: `SKU-M7-${Date.now()}`, createdBy: userId,
  } as any);
  sparePartId = sp.id;
  inventoryId = (await storage.createSparePartInventory({
    sparePartId, garageId: garageA, stockQuantity: 10,
  } as any)).id;
});

async function auditCount(): Promise<number> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const r = await client.query(
      `SELECT count(*)::int AS n FROM inventory_audit_trail WHERE spare_part_id = $1 AND action_type = 'adjust'`,
      [sparePartId]
    );
    return r.rows[0].n;
  } finally {
    await client.end();
  }
}

describe("PATCH /api/spare-part-inventories/:id — medium #7", () => {
  it("applies the stock change and records an audit-trail entry", async () => {
    const before = await auditCount();
    const res = await admin.patch(`/api/spare-part-inventories/${inventoryId}`).send({ stockQuantity: 15 });
    expect(res.status).toBe(200);
    expect(res.body.stockQuantity).toBe(15);
    expect(await auditCount()).toBe(before + 1); // movement recorded
  });

  it("does NOT write an audit entry for a non-stock field change", async () => {
    const before = await auditCount();
    const res = await admin.patch(`/api/spare-part-inventories/${inventoryId}`).send({ location: "Shelf B2" });
    expect(res.status).toBe(200);
    expect(await auditCount()).toBe(before); // no stock movement → no entry
  });

  it("rejects an update whose expectedStockQuantity no longer matches (409)", async () => {
    // Current stock is 15; claim we expected 10 → conflict.
    const res = await admin
      .patch(`/api/spare-part-inventories/${inventoryId}`)
      .send({ stockQuantity: 99, expectedStockQuantity: 10 });
    expect(res.status).toBe(409);
    // Stock must be unchanged after a rejected optimistic update.
    const check = await admin.patch(`/api/spare-part-inventories/${inventoryId}`).send({ location: "Shelf B2" });
    expect(check.body.stockQuantity).toBe(15);
  });

  it("accepts an update whose expectedStockQuantity matches", async () => {
    const res = await admin
      .patch(`/api/spare-part-inventories/${inventoryId}`)
      .send({ stockQuantity: 20, expectedStockQuantity: 15 });
    expect(res.status).toBe(200);
    expect(res.body.stockQuantity).toBe(20);
  });
});
