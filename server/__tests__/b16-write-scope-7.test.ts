/**
 * B16 breadth batch 7 — cross-tenant write scope on parent-join child rows
 * that have NO garage_id of their own:
 *   - supplier_quotations  -> quotation_requests.garage_id      (1 hop)
 *   - payment_plans        -> invoices.garage_id                (1 hop)
 *   - installments         -> payment_plans -> invoices.garage_id (2 hops)
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin, seedCustomer, seedVehicle, seedJobCard } from "./helpers";
import { storage } from "../storage";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let userId: string;
let supplierA: string;

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  userId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;
  supplierA = (await storage.createSupplier({ garageId: garageA, name: "Quote Supplier A" } as any)).id;
});

// Build a garage-A invoice via the customer -> vehicle -> job-card chain.
async function seedInvoiceA(): Promise<string> {
  const customerId = (await seedCustomer(adminA, garageA)).id;
  const vehicle = await seedVehicle(adminA, customerId, garageA);
  const jc = await seedJobCard(adminA, vehicle.id, customerId, garageA);
  const inv = await storage.createInvoice({
    invoiceNumber: `INV-${uniq()}`, garageId: garageA, customerId, jobCardId: jc.id,
    invoiceDate: new Date(), dueDate: new Date(), status: "unpaid",
    subtotal: "100.00", taxAmount: "15.00", discountAmount: "0.00",
    totalAmount: "115.00", paidAmount: "0.00", balanceAmount: "115.00", createdBy: userId,
  } as any);
  return inv.id;
}

async function seedPlanA(invoiceId: string): Promise<string> {
  const plan = await storage.createPaymentPlan({
    invoiceId, planName: "3-month", totalAmount: "115.00", numberOfInstallments: 3,
    installmentAmount: "38.33", startDate: new Date(), endDate: new Date(), createdBy: userId,
  } as any);
  return plan.id;
}

describe("B16 — supplier-quotation writes scoped via parent quotation request", () => {
  it("garage B cannot update garage A's supplier quotation", async () => {
    const qr = await storage.createQuotationRequest({
      requestNumber: `QR-${uniq()}`, garageId: garageA, title: "Quote", createdBy: userId,
    } as any);
    const sq = await storage.createSupplierQuotation({
      quotationRequestId: qr.id, supplierId: supplierA, totalPrice: "200.00",
    } as any);

    const bPatch = await adminB.patch(`/api/supplier-quotations/${sq.id}`).send({ totalPrice: "1.00" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/supplier-quotations/${sq.id}`).send({ totalPrice: "210.00" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — payment-plan writes scoped via parent invoice", () => {
  it("garage B cannot read or update garage A's payment plan", async () => {
    const planId = await seedPlanA(await seedInvoiceA());

    const bGet = await adminB.get(`/api/payment-plans/${planId}`);
    expect(bGet.status).toBe(404);
    const bPatch = await adminB.patch(`/api/payment-plans/${planId}`).send({ status: "cancelled" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/payment-plans/${planId}`).send({ status: "completed" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — installment writes scoped two hops via plan -> invoice", () => {
  it("garage B cannot update garage A's installment", async () => {
    const planId = await seedPlanA(await seedInvoiceA());
    const inst = await storage.createInstallment({
      paymentPlanId: planId, installmentNumber: 1, dueDate: new Date(), amount: "38.33",
    } as any);

    const bPatch = await adminB.patch(`/api/installments/${inst.id}`).send({ status: "paid" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/installments/${inst.id}`).send({ status: "paid" });
    expect(aPatch.status).toBe(200);
  });
});
