/**
 * Exactly-once gateway settlement (deep-audit blocker B9).
 *
 * Gateways retry webhooks. settleGatewayPayment locks the invoice FOR UPDATE and
 * is backed by a partial unique index on (gateway, gateway_transaction_id), so a
 * duplicate settlement for the same transaction credits the invoice only once.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { loginAsAdmin, seedCustomer } from "./helpers";
import { storage } from "../storage";

let app: Express;
let admin: supertest.Agent;
let garageId: string;
let customerId: string;

async function makeInvoice(total: string): Promise<string> {
  const res = await admin.post("/api/invoices").send({
    garageId, customerId,
    totalAmount: total, subtotal: total, taxAmount: "0.00",
    balanceAmount: total, paidAmount: "0.00", status: "sent",
    dueDate: new Date(Date.now() + 30 * 864e5).toISOString(),
    invoiceDate: new Date().toISOString(),
    invoiceNumber: `INV-B9-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  });
  expect([200, 201]).toContain(res.status);
  return res.body.id;
}

async function paymentCount(txnId: string): Promise<number> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const r = await client.query(`SELECT count(*)::int AS n FROM payments WHERE gateway_transaction_id = $1`, [txnId]);
    return r.rows[0].n;
  } finally {
    await client.end();
  }
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  garageId = a.garageId;
  customerId = (await seedCustomer(admin, garageId)).id;
});

describe("settleGatewayPayment — exactly once (B9)", () => {
  it("credits the invoice once across duplicate settlements for the same transaction", async () => {
    const id = await makeInvoice("500.00");
    const txnId = `txn-b9-${Date.now()}`;
    const opts = { invoiceId: id, amount: 500, gateway: "moyasar", methodType: "mada" as any, transactionId: txnId };

    const first = await storage.settleGatewayPayment(opts);
    expect(first.settled).toBe(true);
    expect(first.alreadyProcessed).toBe(false);

    const second = await storage.settleGatewayPayment(opts);
    expect(second.settled).toBe(false);
    expect(second.alreadyProcessed).toBe(true);

    // Only one payment row, invoice credited exactly once.
    expect(await paymentCount(txnId)).toBe(1);
    const inv = await admin.get(`/api/invoices/${id}`);
    expect(parseFloat(inv.body.paidAmount)).toBeCloseTo(500);
    expect(parseFloat(inv.body.balanceAmount)).toBeCloseTo(0);
    expect(inv.body.status).toBe("paid");
  });

  it("rejects a raw duplicate insert at the DB level (partial unique index)", async () => {
    const id = await makeInvoice("100.00");
    const txnId = `txn-b9-dup-${Date.now()}`;
    await storage.settleGatewayPayment({ invoiceId: id, amount: 100, gateway: "tap", transactionId: txnId });

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    let threw = false;
    try {
      const cb = (await client.query(`SELECT created_by FROM invoices WHERE id = $1`, [id])).rows[0].created_by;
      await client.query(
        `INSERT INTO payments (invoice_id, amount, payment_method, gateway, status, gateway_transaction_id, created_by)
         VALUES ($1, '100.00', 'card', 'tap', 'completed', $2, $3)`,
        [id, txnId, cb],
      );
    } catch (e: any) {
      threw = String(e.code) === "23505";
    } finally {
      await client.end();
    }
    expect(threw).toBe(true);
  });
});
