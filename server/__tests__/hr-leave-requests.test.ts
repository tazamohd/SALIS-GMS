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

describe("HR Leave Requests (DB-backed)", () => {
  it("POST /api/hr/leave-requests creates an entry and GET lists it", async () => {
    const createRes = await agent.post("/api/hr/leave-requests").send({
      employeeId: `emp-${Date.now()}`,
      employeeName: "Test Employee",
      type: "annual",
      startDate: "2026-06-01",
      endDate: "2026-06-03",
      reason: "Vacation",
    });
    expect([200, 201]).toContain(createRes.status);
    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.days).toBe(3);
    expect(createRes.body.status).toBe("pending");

    const listRes = await agent.get("/api/hr/leave-requests");
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.leaveRequests)).toBe(true);
    const ids = listRes.body.leaveRequests.map((r: any) => r.id);
    expect(ids).toContain(createRes.body.id);
    expect(typeof listRes.body.pending).toBe("number");
  });

  it("POST without required fields returns 400", async () => {
    const res = await agent.post("/api/hr/leave-requests").send({ employeeId: "x" });
    expect(res.status).toBe(400);
  });
});
