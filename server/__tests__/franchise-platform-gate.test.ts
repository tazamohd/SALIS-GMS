/**
 * Franchise administration spans multiple garages by design (franchise_groups,
 * franchise_contracts, franchise_kpis, revenue_sharing_rules have no garage_id),
 * so it is a platform/HQ function, not a per-garage one. A garage ADMIN must
 * NOT be able to read or mutate franchise data across the network — only a
 * PLATFORM_ADMIN may. (Previously these routes were gated only by
 * isAuthenticated, exposing every franchise to any authenticated staff user.)
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { createSecondGarageAdmin } from "./helpers";

let app: Express;
let admin: supertest.Agent;

beforeAll(async () => {
  app = (await createTestApp()).app;
  // Use a dedicated garage ADMIN (distinct email/garage), NOT the shared
  // TEST_ADMIN that platform-admin-access.test.ts elevates to PLATFORM_ADMIN —
  // passport re-reads the user every request, so a shared admin can be
  // concurrently promoted mid-test and wrongly pass requirePlatformAdmin.
  admin = (await createSecondGarageAdmin(app)).agent;
});

describe("franchise routes are platform-admin only", () => {
  it("a garage ADMIN is denied (403) on franchise reads and writes", async () => {
    const someId = "00000000-0000-0000-0000-000000000000";
    // Issue the probes sequentially — firing them all at once through supertest
    // against one ephemeral server can reset a connection under CI load
    // (ECONNRESET); the guard itself is what we're asserting, not concurrency.
    const probes: Array<() => Promise<{ status: number }>> = [
      () => admin.get("/api/franchise-groups"),
      () => admin.get(`/api/franchise-groups/${someId}`),
      () => admin.post("/api/franchise-groups").send({ name: "x" }),
      () => admin.patch(`/api/franchise-groups/${someId}`).send({ name: "x" }),
      () => admin.delete(`/api/franchise-groups/${someId}`),
      () => admin.get("/api/franchise-contracts"),
      () => admin.get("/api/franchise-kpis"),
      () => admin.get("/api/revenue-sharing-rules"),
      () => admin.delete(`/api/revenue-sharing-rules/${someId}`),
    ];
    for (const probe of probes) {
      const r = await probe();
      expect(r.status).toBe(403);
    }
  });
});
