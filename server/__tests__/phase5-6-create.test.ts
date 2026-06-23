import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

// Validates the Phase 6 create endpoints wired during the mock-shadowing fix:
// a real POST must persist (201 + id) and be visible on the subsequent GET.
let app: Express;
let agent: supertest.Agent;
let userId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  userId = login.user.id;
});

describe("Environmental compliance create round-trip", () => {
  it("POST persists and GET returns the new record", async () => {
    const post = await agent.post("/api/environmental-compliance/records").send({
      complianceType: "waste_disposal",
      wasteType: "Used Oil",
      quantity: 5,
      unit: "L",
    });
    expect([200, 201]).toContain(post.status);
    expect(post.body).toHaveProperty("id");

    const get = await agent.get("/api/environmental-compliance/records");
    expect(get.status).toBe(200);
    expect(Array.isArray(get.body)).toBe(true);
    expect(get.body.some((r: any) => r.id === post.body.id)).toBe(true);
  });
});

describe("Safety incident create round-trip", () => {
  it("POST persists and GET returns the new incident", async () => {
    const incidentNumber = `SI-T-${Date.now()}`;
    const post = await agent.post("/api/safety-incidents").send({
      incidentNumber,
      incidentType: "injury",
      severity: "minor",
      description: "Test incident from integration suite",
      reportedBy: userId,
    });
    expect([200, 201]).toContain(post.status);
    expect(post.body).toHaveProperty("id");

    const get = await agent.get("/api/safety-incidents");
    expect(get.status).toBe(200);
    expect(get.body.some((i: any) => i.id === post.body.id)).toBe(true);
  });
});
