/**
 * Platform-admin access control (runtime) — the /api/platform-admin/* control
 * plane spans every tenant, so a garage-level ADMIN must be denied and only a
 * PLATFORM_ADMIN allowed. This guards against the inverted requireAdmin gate
 * (which short-circuited for ADMIN and denied PLATFORM_ADMIN).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, loginAsPlatformAdmin } from "./helpers";

let app: Express;
let garageAdmin: supertest.Agent;
let platformAdmin: supertest.Agent;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  garageAdmin = (await loginAsAdmin(app)).agent;
  platformAdmin = (await loginAsPlatformAdmin(app)).agent;
});

describe("platform-admin control plane is super-admin only", () => {
  it("denies a garage-level ADMIN (403)", async () => {
    const res = await garageAdmin.get("/api/platform-admin/stats");
    expect(res.status).toBe(403);
  });

  it("allows a PLATFORM_ADMIN (200)", async () => {
    const res = await platformAdmin.get("/api/platform-admin/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalGarages");
  });

  it("denies a garage ADMIN from listing all garages", async () => {
    const res = await garageAdmin.get("/api/platform-admin/garages");
    expect(res.status).toBe(403);
  });
});

describe("platform-admin data endpoints return real data", () => {
  it("stats includes plan mix and role counts", async () => {
    const res = await platformAdmin.get("/api/platform-admin/stats");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.planMix)).toBe(true);
    expect(Array.isArray(res.body.roleCounts)).toBe(true);
    // At least the seeded admin + platform admin users exist.
    const totalByRole = res.body.roleCounts.reduce((n: number, r: any) => n + r.count, 0);
    expect(totalByRole).toBeGreaterThan(0);
    expect(res.body.totalSuppliers).toBeTypeOf("number");
  });

  it("lists garages with real user counts", async () => {
    const res = await platformAdmin.get("/api/platform-admin/garages");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("user_count");
    expect(res.body[0]).toHaveProperty("is_active");
  });

  it("lists suppliers (empty or real rows, never fabricated)", async () => {
    const res = await platformAdmin.get("/api/platform-admin/suppliers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("system-health reports measured DB status and integration flags", async () => {
    const res = await platformAdmin.get("/api/platform-admin/system-health");
    expect(res.status).toBe(200);
    expect(res.body.dbOk).toBe(true);
    expect(res.body.dbLatencyMs).toBeTypeOf("number");
    expect(res.body.uptimeSeconds).toBeTypeOf("number");
    const names = res.body.integrations.map((i: any) => i.name);
    expect(names).toContain("PostgreSQL Database");
    // No invented SLA numbers in the payload.
    expect(res.body).not.toHaveProperty("cacheHitRate");
    expect(res.body).not.toHaveProperty("cpuUsage");
  });

  it("fake e-commerce store endpoint is gone (404)", async () => {
    const res = await platformAdmin.post("/api/platform-admin/stores").send({ name: "Fake" });
    expect(res.status).toBe(404);
  });
});
