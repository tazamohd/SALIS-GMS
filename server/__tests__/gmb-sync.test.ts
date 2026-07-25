/**
 * Integration coverage for the key-deferred Google My Business live-sync routes
 * (server/routes/gmb-sync.routes.ts + server/services/gmb-sync.ts).
 *
 * The test environment has no GOOGLE_GMB_* credentials, so these assert the
 * deferred (no-op) behaviour and tenant scoping — the deterministic surface.
 * The live-pull path is exercised only when credentials are present in prod.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";

let app: Express;
let admin: supertest.Agent;
let garageId: string;
let profileId: string;

const MISSING_UUID = "00000000-0000-0000-0000-000000000000";

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  garageId = a.garageId;

  // Seed a GMB profile under garage A directly (the local CRUD lives in the
  // monolith; we only need a row to scope the sync endpoints against).
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const r = await client.query(
      `INSERT INTO google_business_profiles (garage_id, account_id, location_id, business_name, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id`,
      [garageId, "accounts/123", "locations/456", "Test Garage GMB"],
    );
    profileId = r.rows[0].id;
  } finally {
    await client.end();
  }
});

describe("GMB live sync (key-deferred)", () => {
  it("GET /api/gmb/sync/status reports not-configured + lists garage profiles", async () => {
    const res = await admin.get("/api/gmb/sync/status");
    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(Array.isArray(res.body.profiles)).toBe(true);
    expect(res.body.profiles.some((p: any) => p.id === profileId)).toBe(true);
  });

  it("POST /api/gmb/sync no-ops with a clear message when unconfigured", async () => {
    const res = await admin.post("/api/gmb/sync");
    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(res.body.synced).toEqual([]);
    expect(typeof res.body.message).toBe("string");
  });

  it("POST /api/gmb/sync/:profileId returns the deferred result for an owned profile", async () => {
    const res = await admin.post(`/api/gmb/sync/${profileId}`);
    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(res.body.profileId).toBe(profileId);
  });

  it("POST /api/gmb/sync/:profileId 404s for an unknown profile", async () => {
    const res = await admin.post(`/api/gmb/sync/${MISSING_UUID}`);
    expect(res.status).toBe(404);
  });

  it("does not let another garage sync this garage's profile (tenant isolation)", async () => {
    const other = await createSecondGarageAdmin(app);
    const res = await other.agent.post(`/api/gmb/sync/${profileId}`);
    expect(res.status).toBe(404);
  });
});
