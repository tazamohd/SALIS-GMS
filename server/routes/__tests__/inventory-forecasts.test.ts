import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let partId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  admin = (await loginAsAdmin(app)).agent;
  // Seed a spare part to satisfy the forecast.partId foreign key.
  const part = await admin.post("/api/spare-parts").send({
    name: "Oil Filter",
    category: "filters",
    sku: `SKU-${Date.now()}`,
  });
  partId = part.body.id;
});

describe("Inventory forecasts (migrated modular router)", () => {
  it("creates a forecast (garage injected) and fetches it back", async () => {
    const create = await admin.post("/api/inventory-forecasts").send({
      partId,
      forecastDate: "2026-07-01",
      predictedDemand: 25,
    });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const id = create.body.id;

    const list = await admin.get("/api/inventory-forecasts");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.some((f: any) => f.id === id)).toBe(true);

    expect((await admin.get(`/api/inventory-forecasts/${id}`)).status).toBe(200);
  });

  it("404s an unknown id and validates the create body", async () => {
    expect((await admin.get("/api/inventory-forecasts/00000000-0000-0000-0000-000000000000")).status).toBe(404);
    expect((await admin.post("/api/inventory-forecasts").send({ predictedDemand: 1 })).status).toBe(400);
  });
});
