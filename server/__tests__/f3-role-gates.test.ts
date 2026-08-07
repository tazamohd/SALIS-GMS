/**
 * F3 role-gate regression — sensitive read surfaces must require manager-or-above,
 * not merely an authenticated session.
 *
 * The audit reproduced a TECHNICIAN/ADVISOR reading employee compensation/PII
 * (`/api/hr/employees`), the refund ledger (`/api/refunds`), and the RBAC role
 * catalog (`/api/roles`) — all gated by `isAuthenticated` only. This pins the
 * `requireManagerOrAbove` gate so a below-manager role gets 403 while an admin
 * still reads them.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, loginAsUser } from "./helpers";

let app: Express;
let advisor: supertest.Agent; // loginAsUser attaches the user to the garage as ADVISOR
let admin: supertest.Agent;

const GATED = ["/api/hr/employees", "/api/refunds", "/api/roles"];

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  advisor = (await loginAsUser(app)).agent;
  admin = (await loginAsAdmin(app)).agent;
});

describe("F3 manager-or-above gate on sensitive reads", () => {
  it("denies a below-manager (ADVISOR) role with 403", async () => {
    for (const ep of GATED) {
      const res = await advisor.get(ep);
      expect(res.status, `ADVISOR must be 403 on ${ep}, got ${res.status}`).toBe(403);
    }
  });

  it("still allows an admin to read them", async () => {
    for (const ep of GATED) {
      const res = await admin.get(ep);
      expect(res.status, `admin should reach ${ep}, got ${res.status}`).toBeLessThan(400);
    }
  });

  it("also gates employee creation (POST /api/hr/employees) to manager-or-above", async () => {
    const res = await advisor
      .post("/api/hr/employees")
      .send({ name: "x", email: `x${Date.now()}@t.sa`, position: "technician" });
    expect(res.status).toBe(403);
  });
});
