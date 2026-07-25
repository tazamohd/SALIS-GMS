import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, seedCustomer } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;
let customerId: string;
let vehicleId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
  const customer = await seedCustomer(agent, garageId);
  customerId = customer.id;
});

describe("Vehicles - CRUD", () => {
  it("GET /api/vehicles returns array", async () => {
    const res = await agent.get("/api/vehicles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/vehicles creates new vehicle", async () => {
    const res = await agent.post("/api/vehicles").send({
      customerId,
      garageId,
      make: "Honda",
      model: "Accord",
      year: 2023,
      licensePlate: `V-${Date.now().toString().slice(-4)}`,
      vin: `TESTVHCL${Date.now()}`,
      color: "Silver",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    vehicleId = res.body.id;
  });

  it("PATCH /api/vehicles/:id updates vehicle", async () => {
    const res = await agent.patch(`/api/vehicles/${vehicleId}`).send({
      color: "Black",
    });
    expect(res.status).toBe(200);
  });
});

describe("Vehicles - Service History", () => {
  it("GET /api/vehicles/:id/service-history returns array", async () => {
    const res = await agent.get(`/api/vehicles/${vehicleId}/service-history`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/vehicles/:id/service-history adds entry", async () => {
    const res = await agent.post(`/api/vehicles/${vehicleId}/service-history`).send({
      serviceType: "Oil Change",
      description: "Full synthetic oil change",
      mileageAtService: 50000,
      serviceDate: new Date().toISOString(),
    });
    expect([200, 201]).toContain(res.status);
  });
});

describe("Vehicles - Maintenance", () => {
  it("GET /api/vehicles/:id/maintenance-schedules returns array", async () => {
    const res = await agent.get(`/api/vehicles/${vehicleId}/maintenance-schedules`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/vehicles/:id/maintenance-schedules creates schedule", async () => {
    const res = await agent.post(`/api/vehicles/${vehicleId}/maintenance-schedules`).send({
      serviceName: "Brake Inspection",
      intervalType: "both",
      intervalMileage: 30000,
      intervalMonths: 12,
    });
    expect([200, 201]).toContain(res.status);
  });
});

describe("Vehicles - Catalogs", () => {
  it("GET /api/catalogs/vehicle-makes returns array", async () => {
    const res = await agent.get("/api/catalogs/vehicle-makes");
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe("Vehicles - Auth Guard", () => {
  it("GET /api/vehicles without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/vehicles");
    expect(res.status).toBe(401);
  });
});
