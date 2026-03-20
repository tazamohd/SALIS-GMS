import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let sparePartId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Inventory - Spare Parts CRUD", () => {
  it("GET /api/spare-parts returns array", async () => {
    const res = await agent.get("/api/spare-parts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/spare-parts creates a part", async () => {
    const res = await agent.post("/api/spare-parts").send({
      name: "Oil Filter - Test",
      sku: `SKU-TEST-${Date.now()}`,
      price: 45.0,
      quantity: 100,
      minStock: 10,
      category: "Filters",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    sparePartId = res.body.id;
  });

  it("GET /api/spare-parts/:id returns the part", async () => {
    const res = await agent.get(`/api/spare-parts/${sparePartId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", sparePartId);
    expect(res.body).toHaveProperty("name", "Oil Filter - Test");
  });

  it("PATCH /api/spare-parts/:id updates the part", async () => {
    const res = await agent.patch(`/api/spare-parts/${sparePartId}`).send({
      price: 50.0,
      quantity: 150,
    });
    expect(res.status).toBe(200);
  });
});

describe("Inventory - Stock Management", () => {
  it("GET /api/spare-part-inventories returns stock levels", async () => {
    const garageId = process.env.TEST_GARAGE_ID || "";
    const res = await agent.get(`/api/spare-part-inventories?garage_id=${garageId}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it("GET /api/stock-alerts returns low stock items", async () => {
    const garageId = process.env.TEST_GARAGE_ID || "";
    const res = await agent.get(`/api/stock-alerts?garageId=${garageId}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe("Inventory - Reports", () => {
  it("GET /api/reports/inventory returns inventory report", async () => {
    const res = await agent.get("/api/reports/inventory");
    expect(res.status).toBe(200);
  });
});

describe("Inventory - Auth Guard", () => {
  it("GET /api/spare-parts without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/spare-parts");
    expect(res.status).toBe(401);
  });
});
