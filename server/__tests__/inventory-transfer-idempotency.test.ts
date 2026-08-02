/**
 * Inventory-transfer completion — atomic + idempotent (deep-audit blocker B15).
 *
 * Before the fix, completeInventoryTransfer ran source-decrement, dest-increment
 * and the status update as three unsynchronized statements with no idempotency
 * guard, so calling /complete twice deducted the source twice. This proves a
 * duplicate completion is a no-op.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "pg";
import { storage } from "../storage";

async function stockOf(id: string): Promise<number> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const r = await client.query(`SELECT stock_quantity FROM spare_part_inventories WHERE id = $1`, [id]);
    return Number(r.rows[0]?.stock_quantity ?? NaN);
  } finally {
    await client.end();
  }
}

describe("completeInventoryTransfer — idempotent (B15)", () => {
  let sparePartId: string;
  let srcInvId: string;
  let dstInvId: string;
  let transferId: string;
  let userId = "";

  beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    let garageA = "", garageB = "";
    try {
      garageA = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('B15-A','Saudi Arabia','Riyadh',true) RETURNING id`)).rows[0].id;
      garageB = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('B15-B','Saudi Arabia','Jeddah',true) RETURNING id`)).rows[0].id;
      userId = (await client.query(`INSERT INTO users (email,password,full_name,role) VALUES ($1,'x','B15 User','ADMIN') RETURNING id`, [`b15-${Date.now()}@t.sa`])).rows[0].id;
    } finally {
      await client.end();
    }

    const sp = await storage.createSparePart({ name: "B15 Widget", category: "test", sku: `SKU-B15-${Date.now()}`, createdBy: userId } as any);
    sparePartId = sp.id;

    const src = await storage.createSparePartInventory({ sparePartId, garageId: garageA, stockQuantity: 10 } as any);
    srcInvId = src.id;
    const dst = await storage.createSparePartInventory({ sparePartId, garageId: garageB, stockQuantity: 0 } as any);
    dstInvId = dst.id;

    const t = await storage.createInventoryTransfer({
      transferNumber: `TR-B15-${Date.now()}`,
      sparePartId,
      fromGarageId: garageA,
      toGarageId: garageB,
      quantity: 3,
      transferStatus: "approved",
      requestedBy: userId,
    } as any);
    transferId = t.id;
  });

  it("deducts the source exactly once across duplicate completes", async () => {
    const first = await storage.completeInventoryTransfer(transferId, userId);
    expect(first.transferStatus).toBe("completed");
    expect(await stockOf(srcInvId)).toBe(7); // 10 - 3
    expect(await stockOf(dstInvId)).toBe(3); // 0 + 3

    // Duplicate completion (retry / double-click) must be a no-op.
    const second = await storage.completeInventoryTransfer(transferId, userId);
    expect(second.transferStatus).toBe("completed");
    expect(await stockOf(srcInvId)).toBe(7); // still 7, NOT 4
    expect(await stockOf(dstInvId)).toBe(3); // still 3, NOT 6
  });
});

describe("completeInventoryTransfer — source sufficiency + missing destination (audit medium #6)", () => {
  let garageA = "", garageB = "", garageC = "", userId = "";
  let sparePartId = "", srcInvId = "";

  beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      garageA = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('M6-A','Saudi Arabia','Riyadh',true) RETURNING id`)).rows[0].id;
      garageB = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('M6-B','Saudi Arabia','Jeddah',true) RETURNING id`)).rows[0].id;
      garageC = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('M6-C','Saudi Arabia','Dammam',true) RETURNING id`)).rows[0].id;
      userId = (await client.query(`INSERT INTO users (email,password,full_name,role) VALUES ($1,'x','M6 User','ADMIN') RETURNING id`, [`m6-${Date.now()}@t.sa`])).rows[0].id;
    } finally {
      await client.end();
    }

    const sp = await storage.createSparePart({ name: "M6 Widget", category: "test", sku: `SKU-M6-${Date.now()}`, createdBy: userId } as any);
    sparePartId = sp.id;
    srcInvId = (await storage.createSparePartInventory({ sparePartId, garageId: garageA, stockQuantity: 2 } as any)).id;
  });

  it("aborts (no negative stock) when the source has insufficient stock", async () => {
    const t = await storage.createInventoryTransfer({
      transferNumber: `TR-M6-INS-${Date.now()}`,
      sparePartId, fromGarageId: garageA, toGarageId: garageB,
      quantity: 5, transferStatus: "approved", requestedBy: userId,
    } as any);

    await expect(storage.completeInventoryTransfer(t.id, userId)).rejects.toThrow(/insufficient/i);
    expect(await stockOf(srcInvId)).toBe(2); // unchanged — never went negative
    const reloaded = await storage.getInventoryTransfer?.(t.id);
    if (reloaded) expect(reloaded.transferStatus).not.toBe("completed"); // still retryable
  });

  it("creates the destination row when none exists so moved stock is not dropped", async () => {
    const t = await storage.createInventoryTransfer({
      transferNumber: `TR-M6-NEW-${Date.now()}`,
      sparePartId, fromGarageId: garageA, toGarageId: garageC, // garageC has no inventory row
      quantity: 2, transferStatus: "approved", requestedBy: userId,
    } as any);

    const done = await storage.completeInventoryTransfer(t.id, userId);
    expect(done.transferStatus).toBe("completed");
    expect(await stockOf(srcInvId)).toBe(0); // 2 - 2

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const r = await client.query(
        `SELECT stock_quantity FROM spare_part_inventories WHERE spare_part_id = $1 AND garage_id = $2`,
        [sparePartId, garageC]
      );
      expect(Number(r.rows[0]?.stock_quantity)).toBe(2); // new dest row holds the moved stock
    } finally {
      await client.end();
    }
  });
});
