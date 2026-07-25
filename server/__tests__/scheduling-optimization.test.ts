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

describe("Scheduling Optimization History (DB-backed)", () => {
  it("POST /api/scheduling/optimize persists a run and GET /history returns it", async () => {
    const run = await agent.post("/api/scheduling/optimize").send({});
    expect(run.status).toBe(200);
    expect(run.body.id).toBeDefined();
    expect(typeof run.body.appointmentsOptimized).toBe("number");
    expect(Array.isArray(run.body.suggestions)).toBe(true);

    const history = await agent.get("/api/scheduling/history");
    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
    const ids = history.body.map((h: any) => h.id);
    expect(ids).toContain(run.body.id);
  });

  it("GET /api/scheduling/rules returns the rule catalog", async () => {
    const res = await agent.get("/api/scheduling/rules");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });
});
