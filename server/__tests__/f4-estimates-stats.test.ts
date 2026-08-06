/**
 * F4-7 regression — GET /api/estimates/stats must return a stats object, not
 * 500. It previously fell through to GET /api/estimates/:id (ownership-checked),
 * which 500'd casting the literal "stats" to uuid. Also pins the ownership
 * middleware hardening: a non-UUID id now yields 404, not 500.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let admin: supertest.Agent;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  admin = (await loginAsAdmin(app)).agent;
});

describe("F4-7 estimates stats + ownership id hardening", () => {
  it("GET /api/estimates/stats returns a numeric stats object (not 500)", async () => {
    const res = await admin.get("/api/estimates/stats");
    expect(res.status).toBe(200);
    expect(typeof res.body.totalEstimates).toBe("number");
    expect(typeof res.body.conversionRate).toBe("number");
    expect(typeof res.body.avgValue).toBe("number");
    expect(typeof res.body.pendingCount).toBe("number");
    expect(res.body.funnel).toEqual(
      expect.objectContaining({
        created: expect.any(Number),
        sent: expect.any(Number),
        approved: expect.any(Number),
        converted: expect.any(Number),
      }),
    );
    expect(typeof res.body.byStatus).toBe("object");
  });

  it("a non-UUID id on an ownership-guarded route returns 404, not 500", async () => {
    const res = await admin.get("/api/estimates/not-a-uuid-word");
    expect(res.status).toBe(404);
  });
});
