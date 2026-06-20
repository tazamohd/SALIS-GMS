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

describe("Reports - Overview", () => {
  it("GET /api/reports/overview returns summary stats", async () => {
    const res = await agent.get("/api/reports/overview");
    expect(res.status).toBe(200);
    expect(res.body).not.toBeNull();
    expect(res.body).toHaveProperty("totalRevenue");
    expect(res.body).toHaveProperty("totalJobCards");
    expect(res.body).toHaveProperty("totalCustomers");
  });
});

describe("Reports - Revenue", () => {
  it("GET /api/reports/revenue returns a data set", async () => {
    const res = await agent.get("/api/reports/revenue");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("Reports - Auth Guard", () => {
  it("GET /api/reports/overview without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/reports/overview");
    expect(res.status).toBe(401);
  });
});
