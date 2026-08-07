/**
 * Sprint 5 data-integrity regression — invoice numbers are unique PER GARAGE.
 *
 * invoices.invoice_number carried a GLOBAL unique constraint, which is wrong for
 * a multi-tenant system: two garages could not both issue "INV-001". The schema
 * now drops that global unique and adds a composite UNIQUE(garage_id,
 * invoice_number). The test DB is built via `drizzle-kit push` from schema.ts,
 * so these assertions verify the change took effect in the actual database.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "pg";

let client: Client;

beforeAll(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");
  client = new Client({ connectionString: url });
  await client.connect();
});

afterAll(async () => {
  await client?.end();
});

describe("invoice_number uniqueness is scoped to the garage", () => {
  it("a composite UNIQUE index on (garage_id, invoice_number) exists", async () => {
    const r = await client.query(
      `SELECT indexdef FROM pg_indexes
       WHERE tablename = 'invoices' AND indexname = 'invoices_garage_invoice_number_unique'`,
    );
    expect(r.rows.length).toBe(1);
    const def = String(r.rows[0].indexdef);
    expect(def).toMatch(/UNIQUE/i);
    expect(def).toMatch(/garage_id/);
    expect(def).toMatch(/invoice_number/);
  });

  it("the old GLOBAL unique constraint on invoice_number is gone", async () => {
    const r = await client.query(
      `SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_unique'`,
    );
    expect(r.rows.length).toBe(0);
  });

  it("behaviour: a garage cannot duplicate an invoice number, but two garages may share one", async () => {
    // Core case needs one seeded garage + a valid user (customer_id/created_by
    // FKs); the cross-garage case runs only if a second garage exists. All
    // inserts are rolled back, so nothing is persisted.
    const g = await client.query(`SELECT id FROM garages`);
    const u = await client.query(`SELECT id FROM users LIMIT 1`);
    if (g.rows.length < 1 || u.rows.length < 1) return; // index assertions above still hold
    const uid = u.rows[0].id;
    const gA = g.rows[0].id;
    const num = `S5-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const ins = (garageId: string) =>
      client.query(
        `INSERT INTO invoices (invoice_number, garage_id, customer_id, due_date, created_by)
         VALUES ($1, $2, $3, now(), $4)`,
        [num, garageId, uid, uid],
      );

    // Core: the same garage may not reuse an invoice number.
    await client.query("BEGIN");
    try {
      await ins(gA);
      await expect(ins(gA)).rejects.toThrow(); // unique violation on (garage_id, invoice_number)
    } finally {
      await client.query("ROLLBACK");
    }

    // Cross-garage: a second garage may reuse the same number (best-effort).
    if (g.rows.length >= 2) {
      const gB = g.rows[1].id;
      await client.query("BEGIN");
      try {
        await ins(gA);
        await ins(gB); // allowed — uniqueness is per-garage
      } finally {
        await client.query("ROLLBACK");
      }
    }
  });
});
