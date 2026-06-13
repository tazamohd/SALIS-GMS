import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  agent = (await loginAsAdmin(app)).agent;
});

describe("Custom reports (DB-backed, tenant-scoped)", () => {
  it("creates and lists a custom report scoped to the garage", async () => {
    const create = await agent.post("/api/analytics/custom-report").send({
      name: `Revenue ${Date.now()}`,
      reportType: "revenue",
      configuration: { groupBy: "month" },
    });
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty("id");
    expect(create.body.garageId).toBeTruthy();

    const list = await agent.get("/api/analytics/custom-reports");
    expect(list.status).toBe(200);
    expect(list.body.some((r: any) => r.id === create.body.id)).toBe(true);
  });

  it("rejects an invalid custom report body", async () => {
    const res = await agent.post("/api/analytics/custom-report").send({ name: "x" });
    expect(res.status).toBe(400);
  });
});

describe("Dashboard widgets (DB-backed, per user + garage)", () => {
  it("creates and lists a widget", async () => {
    const create = await agent.post("/api/analytics/widgets").send({
      widgetType: "kpi",
      title: `Open jobs ${Date.now()}`,
      dataSource: "job_cards",
      configuration: { metric: "count" },
    });
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty("id");

    const list = await agent.get("/api/analytics/widgets");
    expect(list.status).toBe(200);
    expect(list.body.some((w: any) => w.id === create.body.id)).toBe(true);
  });
});
