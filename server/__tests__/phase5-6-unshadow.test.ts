import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

// Verifies the Phase 5/6 endpoints are served by the real phase5Service/
// phase6Service implementations, not the old hardcoded mock handlers. On the
// (empty) test DB the real handlers return [], so the mock "fingerprint"
// strings must be absent.
let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

const cases: Array<{ path: string; fingerprint: string }> = [
  { path: "/api/auto-reorder/rules", fingerprint: "Oil Filter" },
  { path: "/api/auto-reorder/history", fingerprint: "AutoParts Plus" },
  { path: "/api/calibration/records", fingerprint: "Torque Wrench #1" },
  { path: "/api/calibration/reminders", fingerprint: "Diagnostic Scanner" },
  { path: "/api/routing/routes", fingerprint: "Mike Davis" },
  { path: "/api/environmental-compliance/records", fingerprint: "Used Oil" },
  { path: "/api/quality/checklists", fingerprint: "Service Delivery Quality" },
  { path: "/api/quality/non-conformances", fingerprint: "NC-2024-001" },
  { path: "/api/safety-incidents", fingerprint: "SI-2024-001" },
  { path: "/api/insurance-claims", fingerprint: "CLM-2024-001" },
];

describe("Phase 5/6 endpoints serve real data (no mock shadowing)", () => {
  for (const { path, fingerprint } of cases) {
    it(`GET ${path} returns real data without the mock fingerprint`, async () => {
      const res = await agent.get(path);
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toContain(fingerprint);
    });
  }
});

describe("Phase 5/6 endpoints auth guard", () => {
  it("GET /api/safety-incidents without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/safety-incidents");
    expect(res.status).toBe(401);
  });
});
