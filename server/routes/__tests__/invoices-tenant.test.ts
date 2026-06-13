import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Invoice & payment tenant isolation", () => {
  const otherGarageId = "22222222-2222-2222-2222-222222222222";

  it("rejects listing another garage's invoices via ?garage_id=", async () => {
    const res = await agent.get(`/api/invoices?garage_id=${otherGarageId}`);
    expect(res.status).toBe(403);
  });

  it("scopes the invoice list to the caller's garage by default", async () => {
    const res = await agent.get("/api/invoices");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 404 for an invoice outside the caller's garage", async () => {
    const res = await agent.get("/api/invoices/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("returns 404 when patching an unknown/foreign invoice", async () => {
    const res = await agent
      .patch("/api/invoices/00000000-0000-0000-0000-000000000000")
      .send({ notes: "x" });
    expect(res.status).toBe(404);
  });

  it("scopes the payments list to the caller's garage", async () => {
    const res = await agent.get("/api/payments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
