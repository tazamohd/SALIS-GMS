import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

// Smoke coverage for modular route files that previously had no tests.
// Asserts each endpoint is wired (passes auth, no server crash) and guarded.
let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

// Endpoints that apply isAuthenticated per-route.
const guarded = [
  "/api/mobile-devices",
  "/api/smart-contracts",
  "/api/ai/predictions",
  "/api/analytics/performance",
  "/api/forecasting/demand",
  "/api/productivity",
  "/api/dashboard/summary",
];

const all = guarded;

describe("Modular route smoke — authenticated", () => {
  for (const path of all) {
    it(`GET ${path} is wired and does not crash`, async () => {
      const res = await agent.get(path);
      expect(res.status).not.toBe(401); // passed auth
      expect(res.status).toBeLessThan(500); // no server error
    });
  }
});

describe("Modular route smoke — auth guard", () => {
  for (const path of guarded) {
    it(`GET ${path} without auth returns 401`, async () => {
      const { default: supertest } = await import("supertest");
      const res = await supertest(app).get(path);
      expect(res.status).toBe(401);
    });
  }
});
