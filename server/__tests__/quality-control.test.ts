import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Quality Control (DB-backed)", () => {
  it("POST /api/qc/inspections creates and GET lists it", async () => {
    const create = await agent.post("/api/qc/inspections").send({
      jobCardRef: `JC-TEST-${Date.now()}`,
      vehicleInfo: "2024 Test Camry (TEST-001)",
      serviceType: "Oil Change",
      inspector: "Test Inspector",
      inspectorId: "test-1",
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.inspection?.id).toBeDefined();
    expect(create.body.inspection.result).toBe("pending");
    expect(create.body.inspection.totalItems).toBeGreaterThan(0);

    const list = await agent.get("/api/qc/inspections");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.inspections)).toBe(true);
    const ids = list.body.inspections.map((i: any) => i.id);
    expect(ids).toContain(create.body.inspection.id);
  });

  it("POST /api/qc/defects creates and GET lists it", async () => {
    const create = await agent.post("/api/qc/defects").send({
      description: "Test defect from unit test",
      severity: "high",
      category: "Workmanship",
      reportedBy: "Tester",
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.defect?.id).toBeDefined();

    const list = await agent.get("/api/qc/defects");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.defects)).toBe(true);
    const ids = list.body.defects.map((d: any) => d.id);
    expect(ids).toContain(create.body.defect.id);
  });

  it("POST /api/qc/inspections without required fields returns 400", async () => {
    const res = await agent.post("/api/qc/inspections").send({ jobCardRef: "x" });
    expect(res.status).toBe(400);
  });
});
