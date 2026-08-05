/**
 * Liveness/readiness probes exist and are public (referenced by the request
 * allowlist and used by container orchestration). Liveness must not depend on
 * the DB; readiness confirms DB reachability.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import request from "supertest";
import { createTestApp } from "./setup";

let app: Express;
beforeAll(async () => {
  app = (await createTestApp()).app;
});

describe("health probes", () => {
  it("GET /api/health/live is public and returns ok without auth", async () => {
    const r = await request(app).get("/api/health/live");
    expect(r.status).toBe(200);
    expect(r.body.status).toBe("ok");
    expect(typeof r.body.uptime).toBe("number");
  });

  it("GET /api/ready and /api/health/ready report readiness (DB reachable)", async () => {
    for (const p of ["/api/ready", "/api/health/ready"]) {
      const r = await request(app).get(p);
      expect(r.status).toBe(200);
      expect(r.body.status).toBe("ready");
    }
  });
});
