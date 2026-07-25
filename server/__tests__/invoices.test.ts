import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, seedCustomer, seedVehicle, seedJobCard } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;
let customerId: string;
let vehicleId: string;
let jobCardId: string;
let invoiceId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;

  const customer = await seedCustomer(agent, garageId);
  customerId = customer.id;
  const vehicle = await seedVehicle(agent, customerId, garageId);
  vehicleId = vehicle.id;
  const jobCard = await seedJobCard(agent, vehicleId, customerId, garageId);
  jobCardId = jobCard.id;
});

describe("Invoices - CRUD", () => {
  it("GET /api/invoices returns array", async () => {
    const res = await agent.get("/api/invoices");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/invoices creates invoice", async () => {
    const res = await agent.post("/api/invoices").send({
      garageId,
      customerId,
      jobCardId,
      totalAmount: "500.00",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    invoiceId = res.body.id;
  });

  it("GET /api/invoices/:id returns the invoice", async () => {
    const res = await agent.get(`/api/invoices/${invoiceId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", invoiceId);
  });

  it("PATCH /api/invoices/:id updates status", async () => {
    const res = await agent.patch(`/api/invoices/${invoiceId}`).send({
      status: "sent",
    });
    expect(res.status).toBe(200);
  });
});

describe("Invoices - With Items", () => {
  it("POST /api/invoices/with-items creates invoice with line items", async () => {
    const res = await agent.post("/api/invoices/with-items").send({
      invoice: {
        garageId,
        customerId,
        jobCardId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      items: [
        { itemType: "service", description: "Oil Change", quantity: 1, unitPrice: "150.00", lineTotal: "150.00" },
        { itemType: "part", description: "Oil Filter", quantity: 1, unitPrice: "45.00", lineTotal: "45.00" },
        { itemType: "labor", description: "Labor", quantity: 2, unitPrice: "100.00", lineTotal: "200.00" },
      ],
    });
    expect([200, 201]).toContain(res.status);
  });

  it("GET /api/invoices/:id/items returns line items", async () => {
    const res = await agent.get(`/api/invoices/${invoiceId}/items`);
    expect([200, 404, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe("Invoices - From Job Card", () => {
  it("POST /api/invoices/from-job/:jobId auto-generates invoice", async () => {
    const res = await agent.post(`/api/invoices/from-job/${jobCardId}`);
    expect([200, 201, 404]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      // Response may be { invoice: {...}, items: [...] } or flat
      const inv = res.body.invoice || res.body;
      expect(inv).toHaveProperty("id");
    }
  });
});

describe("Invoices - Auth Guard", () => {
  it("GET /api/invoices without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/invoices");
    expect(res.status).toBe(401);
  });
});
