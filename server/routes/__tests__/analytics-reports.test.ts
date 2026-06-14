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
  it("creates, lists, and runs a custom report scoped to the garage", async () => {
    const create = await agent.post("/api/analytics/custom-reports").send({
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

    const run = await agent.post(`/api/analytics/custom-reports/${create.body.id}/run`);
    expect(run.status).toBe(200);
    expect(run.body.success).toBe(true);
    expect(run.body.report.lastRunAt).toBeTruthy();
  });

  it("returns 404 when running a report outside the caller's garage", async () => {
    const res = await agent.post(
      "/api/analytics/custom-reports/00000000-0000-0000-0000-000000000000/run",
    );
    expect(res.status).toBe(404);
  });

  it("rejects an invalid custom report body", async () => {
    const res = await agent.post("/api/analytics/custom-reports").send({ name: "x" });
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
