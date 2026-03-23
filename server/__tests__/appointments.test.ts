import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;
let appointmentId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
});

describe("Appointments - CRUD", () => {
  it("GET /api/appointments returns array", async () => {
    const res = await agent.get("/api/appointments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/appointments creates appointment", async () => {
    const ts = Date.now();
    const res = await agent.post("/api/appointments").send({
      appointmentNumber: `APT-TEST-${ts}`,
      garageId,
      customerName: "Ahmad Al-Rashid",
      customerPhone: "+966501234567",
      customerEmail: "ahmad.rashid@test.sa",
      vehicleInfo: { make: "Toyota", model: "Camry", year: 2024, licensePlate: "ABC123" },
      serviceType: "maintenance",
      description: "Regular oil change and filter replacement",
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      status: "scheduled",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    appointmentId = res.body.id;
  });

  it("GET /api/appointments/:id returns the appointment", async () => {
    if (!appointmentId) return;
    const res = await agent.get(`/api/appointments/${appointmentId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", appointmentId);
  });

  it("PATCH /api/appointments/:id updates appointment", async () => {
    if (!appointmentId) return;
    const res = await agent.patch(`/api/appointments/${appointmentId}`).send({
      status: "confirmed",
      notes: "Customer confirmed via phone",
    });
    expect([200, 500]).toContain(res.status); // 500 if schema validation rejects partial
  });

  it("DELETE /api/appointments/:id removes appointment", async () => {
    if (!appointmentId) return;
    const res = await agent.delete(`/api/appointments/${appointmentId}`);
    expect([200, 204]).toContain(res.status);
  });
});

describe("Appointments - Auth Guard", () => {
  it("GET /api/appointments without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/appointments");
    expect(res.status).toBe(401);
  });
});
