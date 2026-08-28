import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";

let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("RBAC enforcement — unauthenticated requests return 401", () => {
  const protectedEndpoints: Array<{ method: "get" | "post" | "patch" | "delete"; path: string }> = [
    { method: "get", path: "/api/audit/log" },
    { method: "get", path: "/api/audit/stats" },
    { method: "post", path: "/api/audit/seed" },
    { method: "get", path: "/api/feature-flags" },
    { method: "post", path: "/api/feature-flags" },
    { method: "patch", path: "/api/feature-flags/test-id" },
    { method: "delete", path: "/api/feature-flags/test-id" },
    { method: "get", path: "/api/bank-accounts" },
    { method: "post", path: "/api/bank-accounts" },
    { method: "get", path: "/api/bank-transactions" },
    { method: "post", path: "/api/bank-transactions" },
    { method: "get", path: "/api/loss-entries" },
    { method: "post", path: "/api/loss-entries" },
    { method: "post", path: "/api/subscriptions/change-plan" },
    { method: "post", path: "/api/subscriptions/cancel" },
    { method: "post", path: "/api/subscriptions/resume" },
    { method: "get", path: "/api/settings" },
  ];

  for (const ep of protectedEndpoints) {
    it(`${ep.method.toUpperCase()} ${ep.path} rejects unauthenticated`, async () => {
      const res = await supertest(app)[ep.method](ep.path).send({});
      expect(res.status).toBe(401);
    });
  }
});
