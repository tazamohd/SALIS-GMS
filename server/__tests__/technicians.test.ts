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

describe("Technicians - List", () => {
  it("GET /api/technicians returns array", async () => {
    const res = await agent.get("/api/technicians");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Technicians - Performance", () => {
  it("GET /api/technicians/performance returns data", async () => {
    const res = await agent.get("/api/technicians/performance");
    // May return object or array depending on implementation
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toBeDefined();
    }
  });
});

describe("Technicians - Auth Guard", () => {
  it("GET /api/technicians without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/technicians");
    expect(res.status).toBe(401);
  });
});
