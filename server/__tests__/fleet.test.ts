import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
});

describe("Fleet - Groups", () => {
  it("GET /api/fleet/groups returns array", async () => {
    const res = await agent.get("/api/fleet/groups");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/fleet/groups creates a group", async () => {
    const res = await agent.post("/api/fleet/groups").send({
      garageId,
      name: `Test Fleet ${Date.now()}`,
      description: "Test fleet group",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    expect(res.body.fleetName).toContain("Test Fleet");
  });

  it("POST /api/fleet/groups rejects a missing name", async () => {
    const res = await agent.post("/api/fleet/groups").send({ garageId });
    expect(res.status).toBe(400);
  });
});

describe("Fleet - Vehicles", () => {
  it("GET /api/fleet/vehicles returns { vehicles: [...] }", async () => {
    const res = await agent.get("/api/fleet/vehicles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });
});

describe("Fleet - Auth Guard", () => {
  it("GET /api/fleet/groups without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/fleet/groups");
    expect(res.status).toBe(401);
  });
});
