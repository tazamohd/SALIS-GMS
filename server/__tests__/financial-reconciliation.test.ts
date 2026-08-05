/**
 * F2 — financial reconciliation.
 *
 * The reconciliation endpoint cross-checks each invoice's stored money
 * fields against the payments/refunds/line-item ground truth and reports
 * every inconsistency. A ledger that agrees stays silent; a tampered or
 * drifted invoice is flagged with the expected vs actual value.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, loginAsUser, seedCustomer, createSecondGarageAdmin } from "./helpers";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let customerId: string;

async function makeInvoice(total: string): Promise<string> {
  const res = await admin.post("/api/invoices").send({
    garageId: garageA,
    customerId,
    totalAmount: total,
    subtotal: total,
    taxAmount: "0.00",
    balanceAmount: total,
    paidAmount: "0.00",
    status: "sent",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceDate: new Date().toISOString(),
    invoiceNumber: `INV-RC-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  });
  expect([200, 201]).toContain(res.status);
  return res.body.id;
}

async function reconcile(agent: supertest.Agent) {
  const res = await agent.get("/api/reconciliation/financial");
  expect(res.status).toBe(200);
  return res.body as {
    summary: { invoiceCount: number; discrepancyCount: number; cleanInvoices: number };
    discrepancies: { invoiceId: string; type: string; expected: number; actual: number }[];
  };
}

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  garageA = a.garageId;
  advisor = (await loginAsUser(app)).agent;
  adminB = (await createSecondGarageAdmin(app)).agent;
  customerId = (await seedCustomer(admin, garageA)).id;
}, 60000);

describe("financial reconciliation", () => {
  it("a correctly-paid invoice reconciles clean", async () => {
    const id = await makeInvoice("1000.00");
    const pay = await admin.post("/api/payments").send({
      invoiceId: id, amount: "400.00", paymentMethod: "cash", paymentDate: new Date().toISOString(),
    });
    expect([200, 201]).toContain(pay.status);

    const report = await reconcile(admin);
    expect(report.discrepancies.filter((d) => d.invoiceId === id)).toEqual([]);
  });

  it("flags an invoice whose paid_amount was tampered without a payment", async () => {
    const id = await makeInvoice("500.00");
    // Simulate drift/tampering outside the payment flow.
    await db.execute(sql`UPDATE invoices SET paid_amount = '450.00' WHERE id = ${id}`);

    const report = await reconcile(admin);
    const mine = report.discrepancies.filter((d) => d.invoiceId === id);
    const types = mine.map((d) => d.type);
    expect(types).toContain("payment_mismatch"); // 450 recorded, 0 actually paid
    expect(types).toContain("balance_mismatch"); // balance still 500, should be 50
    const pm = mine.find((d) => d.type === "payment_mismatch")!;
    expect(pm.expected).toBeCloseTo(0);
    expect(pm.actual).toBeCloseTo(450);
  });

  it("flags a 'paid' invoice that still carries a balance", async () => {
    const id = await makeInvoice("300.00");
    await db.execute(sql`UPDATE invoices SET status = 'paid' WHERE id = ${id}`);

    const report = await reconcile(admin);
    const types = report.discrepancies.filter((d) => d.invoiceId === id).map((d) => d.type);
    expect(types).toContain("status_paid_with_balance");
  });

  it("flags a subtotal that disagrees with the line items", async () => {
    const id = await makeInvoice("200.00");
    await db.execute(sql`
      INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit_price, line_total)
      VALUES (${id}, 'service', 'Brake pads', 1, '150.00', '150.00')
    `);

    const report = await reconcile(admin);
    const mine = report.discrepancies.filter((d) => d.invoiceId === id);
    const im = mine.find((d) => d.type === "items_mismatch");
    expect(im).toBeTruthy();
    expect(im!.expected).toBeCloseTo(150); // items say 150
    expect(im!.actual).toBeCloseTo(200); // header says 200
  });

  it("is tenant-scoped: garage B never sees garage A's invoices", async () => {
    const id = await makeInvoice("100.00");
    const reportB = await reconcile(adminB);
    expect(reportB.discrepancies.some((d) => d.invoiceId === id)).toBe(false);
  });

  it("is denied to ordinary staff (ADVISOR)", async () => {
    const res = await advisor.get("/api/reconciliation/financial");
    expect(res.status).toBe(403);
  });
});
