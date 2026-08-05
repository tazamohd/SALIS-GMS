/**
 * Money-integrity regression suite (deep-audit blockers B6, B7, B13).
 *
 * B6 — recording a payment must update the invoice balance atomically and be
 *      scoped to the caller's garage.
 * B7 — deleting a payment requires manager/accountant, is garage-scoped, and
 *      restores the invoice balance (reversal), not a silent orphan delete.
 * B13 — Stripe refunds require manager/accountant, not any authenticated user.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import {
  loginAsAdmin,
  loginAsUser,
  seedCustomer,
  createSecondGarageAdmin,
} from "./helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent; // ordinary staff (ADVISOR) in garage A
let agentB: supertest.Agent; // admin in garage B
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
    invoiceNumber: `INV-MI-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  });
  expect([200, 201]).toContain(res.status);
  return res.body.id;
}

async function getInvoice(id: string) {
  const res = await admin.get(`/api/invoices/${id}`);
  return res.body;
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  garageA = a.garageId;
  const u = await loginAsUser(app);
  advisor = u.agent;
  const b = await createSecondGarageAdmin(app);
  agentB = b.agent;
  customerId = (await seedCustomer(admin, garageA)).id;
});

describe("Payments — atomic balance update (B6)", () => {
  it("applies sequential payments to the invoice balance and marks it paid when covered", async () => {
    const id = await makeInvoice("1000.00");

    const p1 = await admin.post("/api/payments").send({
      invoiceId: id, amount: "400.00", paymentMethod: "cash", paymentDate: new Date().toISOString(),
    });
    expect([200, 201]).toContain(p1.status);
    let inv = await getInvoice(id);
    expect(parseFloat(inv.paidAmount)).toBeCloseTo(400);
    expect(parseFloat(inv.balanceAmount)).toBeCloseTo(600);
    expect(inv.status).toBe("sent");

    const p2 = await admin.post("/api/payments").send({
      invoiceId: id, amount: "600.00", paymentMethod: "card", paymentDate: new Date().toISOString(),
    });
    expect([200, 201]).toContain(p2.status);
    inv = await getInvoice(id);
    expect(parseFloat(inv.paidAmount)).toBeCloseTo(1000);
    expect(parseFloat(inv.balanceAmount)).toBeCloseTo(0);
    expect(inv.status).toBe("paid");
  });

  it("refuses a payment against another tenant's invoice with 404 (B6 scope)", async () => {
    const id = await makeInvoice("300.00");
    const res = await agentB.post("/api/payments").send({
      invoiceId: id, amount: "300.00", paymentMethod: "cash", paymentDate: new Date().toISOString(),
    });
    expect(res.status).toBe(404);
  });
});

describe("Payments — reversal with RBAC (B7)", () => {
  it("denies payment deletion to ordinary staff (403)", async () => {
    // Use a real payment in the advisor's own garage so the ownership guard
    // (H-1) passes and the RBAC check is what rejects the request. (A random
    // id would now 404 at the ownership guard before RBAC is ever reached.)
    const id = await makeInvoice("120.00");
    const pay = await admin.post("/api/payments").send({
      invoiceId: id, amount: "120.00", paymentMethod: "cash", paymentDate: new Date().toISOString(),
    });
    expect([200, 201]).toContain(pay.status);
    const res = await advisor.delete(`/api/payments/${pay.body.id}`);
    expect(res.status).toBe(403);
  });

  it("manager reversal restores the invoice balance", async () => {
    const id = await makeInvoice("500.00");
    const pay = await admin.post("/api/payments").send({
      invoiceId: id, amount: "500.00", paymentMethod: "cash", paymentDate: new Date().toISOString(),
    });
    expect([200, 201]).toContain(pay.status);
    const paymentId = pay.body.id;

    let inv = await getInvoice(id);
    expect(parseFloat(inv.balanceAmount)).toBeCloseTo(0);
    expect(inv.status).toBe("paid");

    const del = await admin.delete(`/api/payments/${paymentId}`);
    expect(del.status).toBe(200);

    inv = await getInvoice(id);
    expect(parseFloat(inv.paidAmount)).toBeCloseTo(0);
    expect(parseFloat(inv.balanceAmount)).toBeCloseTo(500);
    expect(inv.status).toBe("sent");
  });
});

describe("Refunds — RBAC (B13)", () => {
  it("denies /api/stripe/refund to ordinary staff (403)", async () => {
    const res = await advisor.post("/api/stripe/refund").send({
      paymentIntentId: "pi_test", amount: 100,
    });
    expect(res.status).toBe(403);
  });
});
