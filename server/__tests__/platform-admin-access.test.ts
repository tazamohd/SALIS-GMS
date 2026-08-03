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
