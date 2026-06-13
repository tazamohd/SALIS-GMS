import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, seedCustomer } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;
let customerId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
  const customer = await seedCustomer(agent, garageId);
  customerId = customer.id;
});

describe("Invoice VAT enforcement (15% computed server-side)", () => {
  it("overrides client-supplied tax/total with the correct 15% figures", async () => {
    const res = await agent.post("/api/invoices").send({
      invoiceNumber: `INV-VAT-${Date.now()}`,
      garageId,
      customerId,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      subtotal: "100.00",
      // Deliberately wrong — the server must ignore these.
      taxAmount: "0.00",
      totalAmount: "100.00",
    });
    expect(res.status).toBe(201);
    expect(res.body.taxAmount).toBe("15.00");
    expect(res.body.totalAmount).toBe("115.00");
    expect(res.body.balanceAmount).toBe("115.00");
  });

  it("applies VAT on the discounted subtotal", async () => {
    const res = await agent.post("/api/invoices").send({
      invoiceNumber: `INV-VAT-${Date.now()}-d`,
      garageId,
      customerId,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      subtotal: "200.00",
      discountAmount: "50.00",
      paidAmount: "0.00",
    });
    expect(res.status).toBe(201);
    // taxable = 200 - 50 = 150 -> VAT 22.50 -> total 172.50
    expect(res.body.taxAmount).toBe("22.50");
    expect(res.body.totalAmount).toBe("172.50");
  });
});
