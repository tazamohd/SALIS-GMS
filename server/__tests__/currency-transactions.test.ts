import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Currency Transactions (DB-backed)", () => {
  it("POST /api/currency/transactions creates and GET lists it", async () => {
    const ts = Date.now();
    const create = await agent.post("/api/currency/transactions").send({
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

    const list = await agent.get("/api/currency/transactions?limit=100");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.transactions)).toBe(true);
    const ids = list.body.transactions.map((t: any) => t.id);
    expect(ids).toContain(create.body.id);
    expect(typeof list.body.summary.totalSAR).toBe("number");
  });

  it("POST /api/currency/transactions rejects unknown currency", async () => {
    const res = await agent.post("/api/currency/transactions").send({
      description: "bad",
      originalAmount: 10,
      originalCurrency: "XXX",
      type: "payment",
    });
    expect(res.status).toBe(400);
  });
});
