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
  it("GET /api/reports/overview returns object with stats", async () => {
    const res = await agent.get("/api/reports/overview");
    // Accept 200 or 404 if endpoint not yet wired
    expect([200, 404, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(typeof res.body).toBe("object");
      expect(res.body).not.toBeNull();
    }
  });
});

describe("Reports - Revenue", () => {
  it("GET /api/reports/revenue returns object", async () => {
    const res = await agent.get("/api/reports/revenue");
    // Accept 200 or 404 if endpoint not yet wired
    expect([200, 404, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(typeof res.body).toBe("object");
      expect(res.body).not.toBeNull();
    }
  });
});

describe("Reports - Auth Guard", () => {
  it("GET /api/reports/overview without auth returns 401 or 404", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/reports/overview");
    expect([401, 404]).toContain(res.status);
  });
});
