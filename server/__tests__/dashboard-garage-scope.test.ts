/**
 * Dashboard garage-scoping regression suite.
 *
 * Guards the fix for the `(req as any).user?.garageId || '1'` fallback that used
 * to live in server/routes/dashboard.ts. `garage_id` is a UUID column, so a
 * null-garageId session (e.g. a platform admin, or any user whose garage_id is
 * NULL) hit `WHERE "garage_id" = '1'`, which Postgres rejects with
 * `invalid input syntax for type uuid: "1"`. The error was swallowed by each
 * handler's try/catch, so the bug was invisible to a status-code check — both
 * the broken and fixed versions return 200 with an empty payload.
 *
 * The meaningful regression assertion is therefore: a null-garageId session must
 * NOT log a uuid cast error. We spy on console.error and assert no such message
 * is emitted across all three dashboard endpoints.
 */
import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";

let app: Express;
let agent: supertest.Agent;

const GARAGELESS_USER = {
  email: `dash-nogarage-${Date.now()}@slis.sa`,
  password: "TestPass123!",
  fullName: "Garageless Dashboard User",
  phone: "+966500000077",
};

/**
 * Register a user, force their garage_id to NULL with an ordinary (non
 * cross-garage) role, then log in. deserializeUser re-reads the row on every
 * request, so the resulting session has `garageId == null`.
 */
async function loginAsGaragelessUser(expressApp: Express): Promise<supertest.Agent> {
  const a = supertest.agent(expressApp);
  await a.post("/api/register").send(GARAGELESS_USER).expect((res) => {
    if (![200, 400, 500].includes(res.status)) {
      throw new Error(`Register failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required for garageless-session setup");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    // Pin user_type to the staff value too: since H-1 (#85) /api/register floors
    // an omitted role to user_type='customer', which requireStaffByDefault (#79)
    // would 403 off the staff surface. This test needs a garageless STAFF session.
    await client.query(
      `UPDATE users SET garage_id = NULL, role = 'ADVISOR', user_type = 'advisor' WHERE email = $1`,
      [GARAGELESS_USER.email],
    );
  } finally {
    await client.end();
  }

  const loginRes = await a.post("/api/login").send({
    email: GARAGELESS_USER.email,
    password: GARAGELESS_USER.password,
  });
  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }
  return a;
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  agent = await loginAsGaragelessUser(app);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const DASHBOARD_ENDPOINTS = [
  "/api/dashboard/summary",
  "/api/dashboard/recent-activity",
  "/api/dashboard/trends",
];

describe("Dashboard — null-garageId session does not cause a UUID cast error", () => {
  for (const endpoint of DASHBOARD_ENDPOINTS) {
    it(`GET ${endpoint} returns 200 without logging a uuid syntax error`, async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await agent.get(endpoint);

      // No swallowed cast error: the bug surfaced as
      // 'invalid input syntax for type uuid: "1"' logged from the catch block.
      const uuidErrors = errorSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === "string" && arg.toLowerCase().includes("uuid")),
      );
      expect(uuidErrors).toEqual([]);

      expect(res.status).toBe(200);
    });
  }

  it("GET /api/dashboard/summary returns the empty KPI payload for a garageless caller", async () => {
    const res = await agent.get("/api/dashboard/summary");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      todayRevenue: 0,
      jobsInProgress: 0,
      pendingJobs: 0,
      appointmentsToday: 0,
      pendingInvoices: 0,
      lowStockItems: 0,
      technicianUtilization: 0,
      totalTechnicians: 0,
    });
  });

  it("GET /api/dashboard/recent-activity returns no activities for a garageless caller", async () => {
    const res = await agent.get("/api/dashboard/recent-activity");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ activities: [] });
  });

  it("GET /api/dashboard/trends returns the empty trends payload for a garageless caller", async () => {
    const res = await agent.get("/api/dashboard/trends");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      revenue: { data: [], change: 0 },
      jobs: { data: [], change: 0 },
      visits: { data: [], change: 0 },
    });
  });
});

describe("Dashboard — auth guard", () => {
  it("GET /api/dashboard/summary without auth returns 401", async () => {
    const res = await supertest(app).get("/api/dashboard/summary");
    expect(res.status).toBe(401);
  });
});
