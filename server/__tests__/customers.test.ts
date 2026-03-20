import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

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
});

describe("Customers - CRUD", () => {
  it("GET /api/customers returns array", async () => {
    const res = await agent.get("/api/customers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/customers creates new customer", async () => {
    const res = await agent.post("/api/customers").send({
      fullName: "Test Customer CRUD",
      email: `crud-customer-${Date.now()}@test.sa`,
      phone: "+966500000010",
      address: "456 Test Ave, Riyadh",
      garageId,
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    customerId = res.body.id;
  });

  it("GET /api/customers/:id returns the customer", async () => {
    const res = await agent.get(`/api/customers/${customerId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", customerId);
  });
});

describe("Customers - Related Data", () => {
  it("GET /api/customers/:id/vehicles returns array", async () => {
    const res = await agent.get(`/api/customers/${customerId}/vehicles`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/customers/:id/job-cards returns array", async () => {
    const res = await agent.get(`/api/customers/${customerId}/job-cards`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/customers/:id/invoices returns array", async () => {
    const res = await agent.get(`/api/customers/${customerId}/invoices`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/customers/:id/payments returns array", async () => {
    const res = await agent.get(`/api/customers/${customerId}/payments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Customers - Notes", () => {
  it("POST /api/customers/:id/notes adds a note", async () => {
    const res = await agent.post(`/api/customers/${customerId}/notes`).send({
      customerId,
      noteType: "general",
      content: "Test note for customer",
    });
    expect([200, 201]).toContain(res.status);
  });

  it("GET /api/customers/:id/notes returns notes array", async () => {
    const res = await agent.get(`/api/customers/${customerId}/notes`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Customers - Auth Guard", () => {
  it("GET /api/customers without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/customers");
    expect(res.status).toBe(401);
  });
});
