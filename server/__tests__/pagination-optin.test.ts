/**
 * BE-H2 regression — opt-in offset pagination on formerly-unbounded list
 * endpoints. The contract (server/routes/pagination.ts):
 *   - no limit/offset/page param  → plain array (unchanged, backward compatible)
 *   - ?limit=N[&offset=M]         → { data: [...], pagination: { total, limit,
 *                                     offset, page, hasMore } }
 * This locks the wiring shape without depending on seeded row volume.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  app = (await createTestApp()).app;
  agent = (await loginAsAdmin(app)).agent;
});

const ENDPOINTS = [
  "/api/purchase-orders",
  "/api/purchase-tasks",
  "/api/support/tickets",
  "/api/supplier-payments",
];

describe("BE-H2 — list endpoints are backward-compatible without pagination params", () => {
  for (const url of ENDPOINTS) {
    it(`GET ${url} (no params) returns a plain array`, async () => {
      const res = await agent.get(url);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body), `${url} should return a bare array`).toBe(true);
    });
  }
});

describe("BE-H2 — list endpoints return a paginated envelope when paged", () => {
  for (const url of ENDPOINTS) {
    it(`GET ${url}?limit=1&offset=0 returns { data, pagination }`, async () => {
      const res = await agent.get(`${url}?limit=1&offset=0`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data), `${url} data should be an array`).toBe(true);
      expect(res.body.data.length, `${url} should honour limit=1`).toBeLessThanOrEqual(1);
      expect(res.body.pagination).toMatchObject({ limit: 1, offset: 0 });
      expect(typeof res.body.pagination.total).toBe("number");
      expect(typeof res.body.pagination.hasMore).toBe("boolean");
    });
  }
});
