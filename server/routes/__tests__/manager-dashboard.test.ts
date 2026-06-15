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

describe("Manager mobile dashboard KPIs (real data)", () => {
  it("returns numeric per-garage KPIs from the DB (not hardcoded mocks)", async () => {
    const res = await agent.get("/api/mobile/manager/dashboard");
    expect(res.status).toBe(200);
    expect(typeof res.body.todayRevenue).toBe("number");
    expect(typeof res.body.activeJobs).toBe("number");
    expect(typeof res.body.jobsToday).toBe("number");
    expect(res.body).toHaveProperty("activeTechnicians");
    expect(res.body).toHaveProperty("appointmentsToday");
    // The old mock always returned 12450; real empty-DB metrics are 0.
    expect(res.body.todayRevenue).toBe(0);
  });

  it("returns real financial reports (zeros on empty DB, not the 45890 mock)", async () => {
    const res = await agent.get("/api/mobile/manager/reports?period=month");
    expect(res.status).toBe(200);
    expect(res.body.period).toBe("month");
    expect(typeof res.body.totalRevenue).toBe("number");
    expect(res.body.totalRevenue).toBe(0);
    expect(Array.isArray(res.body.topServices)).toBe(true);
  });
});
