import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import { createTestApp } from "./setup";

// Verifies the per-route auth guards added to internal modules: these
// sensitive endpoints previously returned garage-'1' data to anonymous
// callers and must now reject unauthenticated requests with 401.
let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

// Paths with confirmed /api mounts (see server/routes/index.ts).
const guardedEndpoints = [
  "/api/audit/log",
  "/api/marketing/accounts",
  "/api/crm/customers",
  "/api/inventory/overview",
  "/api/warranty/contracts",
  "/api/currency/rates",
];

describe("Internal route auth guards (unauthenticated -> 401)", () => {
  for (const path of guardedEndpoints) {
    it(`GET ${path} requires authentication`, async () => {
      const { default: supertest } = await import("supertest");
      const res = await supertest(app).get(path);
      expect(res.status).toBe(401);
    });
  }
});
