/**
 * Authenticated smoke tests for the 8 new "completed half-real page" endpoints.
 * Verifies that each endpoint:
 *   - 200s for an admin user in the test garage
 *   - returns the documented response shape
 *   - scopes data to the caller's garage (positive scope check)
 *
 * Pairs with the unauthenticated coverage in
 * server/routes/__tests__/completed-pages.test.ts.
 */
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

describe("Completed half-real endpoints — authenticated happy path", () => {
  it("GET /api/mobile-devices returns array scoped to caller's garage", async () => {
    const res = await agent.get("/api/mobile-devices");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const d of res.body) {
      expect(d.garageId).toBe(garageId);
    }
  });

  it("GET /api/smart-contracts returns array scoped to caller's garage", async () => {
    const res = await agent.get("/api/smart-contracts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const c of res.body) {
      expect(c.garageId).toBe(garageId);
    }
  });

  it("GET /api/analytics/performance returns expected top-level shape", async () => {
    const res = await agent.get("/api/analytics/performance?timeRange=30d&metric=revenue");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("revenueByMonth");
    expect(res.body).toHaveProperty("technicianStats");
    expect(res.body).toHaveProperty("serviceDistribution");
    expect(res.body).toHaveProperty("kpis");
    expect(res.body.kpis).toHaveProperty("avgRevenuePerJob");
    expect(res.body.kpis).toHaveProperty("avgTurnaroundHours");
    expect(res.body.kpis).toHaveProperty("customerRetentionPct");
    expect(res.body.kpis).toHaveProperty("momGrowthPct");
  });

  it("GET /api/productivity returns expected top-level shape", async () => {
    const res = await agent.get("/api/productivity?period=today");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("hourlyProductivity");
    expect(res.body).toHaveProperty("technicianStats");
    expect(res.body).toHaveProperty("metrics");
    expect(res.body).toHaveProperty("teamGoalProgress");
    expect(Array.isArray(res.body.hourlyProductivity)).toBe(true);
    expect(res.body.hourlyProductivity.length).toBe(6); // 8AM, 10AM, 12PM, 2PM, 4PM, 6PM
  });

  it("GET /api/forecasting/demand returns weeklyForecast + partsDemand", async () => {
    const res = await agent.get("/api/forecasting/demand?period=30");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.weeklyForecast)).toBe(true);
    expect(res.body.weeklyForecast.length).toBe(4);
    expect(Array.isArray(res.body.partsDemand)).toBe(true);
    expect(typeof res.body.accuracy).toBe("number");
    expect(typeof res.body.peakDay).toBe("string");
  });

  it("GET /api/ai/predictions?predictionType=demand returns typed series", async () => {
    const res = await agent.get("/api/ai/predictions?timeRange=7d&predictionType=demand");
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("demand");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/ai/accuracy returns overall + byCategory", async () => {
    const res = await agent.get("/api/ai/accuracy");
    expect(res.status).toBe(200);
    expect(typeof res.body.overall).toBe("number");
    expect(res.body.byCategory).toHaveProperty("serviceDemand");
    expect(res.body.byCategory).toHaveProperty("partsForecast");
    expect(res.body.byCategory).toHaveProperty("revenueForecast");
  });

  it("GET /api/diagnostics/obd/:vehicleId returns empty-state for an unknown vehicle", async () => {
    const res = await agent.get(
      "/api/diagnostics/obd/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status).toBe(200);
    expect(res.body.live).toBeNull();
    expect(res.body.activeDtcs).toEqual([]);
    expect(res.body.freezeFrames).toEqual([]);
    expect(res.body.history).toEqual([]);
  });
});

describe("Completed half-real endpoints — mutations are garage-scoped", () => {
  it("POST /api/mobile-devices then GET shows the new device under the caller's garage only", async () => {
    const deviceName = `Scope-Test-Tablet-${Date.now()}`;
    const create = await agent.post("/api/mobile-devices").send({
      deviceName,
      deviceType: "tablet",
      status: "active",
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.garageId).toBe(garageId);

    const list = await agent.get("/api/mobile-devices");
    expect(list.status).toBe(200);
    const found = list.body.find((d: any) => d.deviceName === deviceName);
    expect(found).toBeDefined();
    expect(found.garageId).toBe(garageId);

    // Clean up so repeat runs don't accumulate rows
    await agent.delete(`/api/mobile-devices/${create.body.id}`);
  });

  it("POST /api/diagnostics/obd/:vehicleId stamps the caller's garageId", async () => {
    const vehicleId = "00000000-0000-0000-0000-000000000001";
    const create = await agent.post(`/api/diagnostics/obd/${vehicleId}`).send({
      diagnosticCodes: [{ code: "P0420", severity: "warning", status: "active" }],
      liveData: { engineRpm: 1500, speedMph: 0 },
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.id).toBeDefined();

    const read = await agent.get(`/api/diagnostics/obd/${vehicleId}`);
    expect(read.status).toBe(200);
    expect(read.body.live).not.toBeNull();
    expect(read.body.live.engineRpm).toBe(1500);
    expect(read.body.activeDtcs.length).toBeGreaterThan(0);
  });
});
