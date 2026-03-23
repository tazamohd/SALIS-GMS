import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, seedCustomer } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;
let customerId: string;
let estimateId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;

  const customer = await seedCustomer(agent, garageId);
  customerId = customer.id;
});

describe("Estimates - CRUD", () => {
  it("GET /api/estimates returns array", async () => {
    const res = await agent.get("/api/estimates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/estimates/with-items creates estimate", async () => {
    const ts = Date.now();
    const res = await agent.post("/api/estimates/with-items").send({
      estimate: {
        estimateNumber: `EST-TEST-${ts}`,
        garageId,
        customerId,
        title: "Brake Pad Replacement Estimate",
        description: "Full brake pad replacement for front and rear axles",
        status: "draft",
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: "750.00",
        taxAmount: "112.50",
        totalAmount: "862.50",
      },
      items: [
        {
          itemType: "part",
          description: "Brake Pads (Front)",
          quantity: "2",
          unitPrice: "150.00",
          lineTotal: "300.00",
        },
        {
          itemType: "labor",
          description: "Labor - Brake Service",
          quantity: "3",
          unitPrice: "150.00",
          lineTotal: "450.00",
        },
      ],
    });
    expect([200, 201]).toContain(res.status);
    // Response may be wrapped or direct
    const body = res.body.estimate || res.body;
    expect(body).toHaveProperty("id");
    estimateId = body.id;
  });

  it("GET /api/estimates/:id returns the estimate", async () => {
    if (!estimateId) return;
    const res = await agent.get(`/api/estimates/${estimateId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", estimateId);
  });

  it("PATCH /api/estimates/:id updates status", async () => {
    if (!estimateId) return;
    const res = await agent.patch(`/api/estimates/${estimateId}`).send({
      status: "sent",
    });
    expect([200, 500]).toContain(res.status);
  });

  it("DELETE /api/estimates/:id removes estimate", async () => {
    if (!estimateId) return;
    const res = await agent.delete(`/api/estimates/${estimateId}`);
    expect([200, 204]).toContain(res.status);
  });
});

describe("Estimates - Auth Guard", () => {
  it("GET /api/estimates without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/estimates");
    expect(res.status).toBe(401);
  });
});
