import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import { createTestApp } from "./setup";
import supertest from "supertest";

let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("Currency Transactions (DB-backed)", () => {
  it("POST /api/currency/transactions creates and GET lists it", async () => {
    const ts = Date.now();
    const create = await supertest(app).post("/api/currency/transactions").send({
      description: `Test FX tx ${ts}`,
      originalAmount: 123.45,
      originalCurrency: "USD",
      type: "payment",
      reference: `TEST-${ts}`,
      customerName: "Test Customer",
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.id).toBeDefined();
    expect(create.body.originalCurrency).toBe("USD");

    const list = await supertest(app).get("/api/currency/transactions?limit=100");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.transactions)).toBe(true);
    const ids = list.body.transactions.map((t: any) => t.id);
    expect(ids).toContain(create.body.id);
    expect(typeof list.body.summary.totalSAR).toBe("number");
  });

  it("POST /api/currency/transactions rejects unknown currency", async () => {
    const res = await supertest(app).post("/api/currency/transactions").send({
      description: "bad",
      originalAmount: 10,
      originalCurrency: "XXX",
      type: "payment",
    });
    expect(res.status).toBe(400);
  });
});
