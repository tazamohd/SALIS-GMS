/**
 * Platform SuperAdmin — subscription change requests: a garage requests a plan
 * change, a PLATFORM_ADMIN reviews and approves (applies the plan) or rejects.
 * A garage-level ADMIN cannot reach the review endpoints.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { createSecondGarageAdmin, loginAsPlatformAdmin } from "./helpers";

let app: Express;
let garageAdmin: supertest.Agent;
let platform: supertest.Agent;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  // Use a DEDICATED garage so parallel tests touching the shared test garage's
  // subscription can't race our plan assertions.
  garageAdmin = (await createSecondGarageAdmin(app)).agent;
  platform = (await loginAsPlatformAdmin(app)).agent;
});

describe("subscription change requests", () => {
  it("garage requests a plan change -> platform admin approves -> plan applied", async () => {
    const create = await garageAdmin.post("/api/subscription-requests").send({ requestedPlan: "PRO" });
    expect(create.status).toBe(201);
    expect(create.body.status).toBe("pending");
    expect(create.body.requestedPlan).toBe("PRO");
    const reqId = create.body.id;

    // Duplicate pending request is refused.
    expect((await garageAdmin.post("/api/subscription-requests").send({ requestedPlan: "ENTERPRISE" })).status).toBe(409);

    // A garage-level ADMIN cannot see or act on the review queue.
    expect((await garageAdmin.get("/api/platform-admin/subscription-requests")).status).toBe(403);
    expect((await garageAdmin.post(`/api/platform-admin/subscription-requests/${reqId}/approve`)).status).toBe(403);

    const list = await platform.get("/api/platform-admin/subscription-requests?status=pending");
    expect(list.status).toBe(200);
    expect(list.body.some((r: any) => r.id === reqId)).toBe(true);

    const approve = await platform.post(`/api/platform-admin/subscription-requests/${reqId}/approve`);
    expect(approve.status).toBe(200);
    expect(approve.body.status).toBe("approved");

    // The plan is now applied to the garage's subscription.
    const current = await garageAdmin.get("/api/subscriptions/current");
    expect(current.status).toBe(200);
    expect(current.body.plan).toBe("PRO");

    // Re-approving is refused.
    expect((await platform.post(`/api/platform-admin/subscription-requests/${reqId}/approve`)).status).toBe(409);
  });

  it("rejects an invalid plan (400)", async () => {
    expect((await garageAdmin.post("/api/subscription-requests").send({ requestedPlan: "GOLD" })).status).toBe(400);
  });

  it("platform admin can reject a pending request", async () => {
    // The prior request was approved, so a fresh one can be created.
    const create = await garageAdmin.post("/api/subscription-requests").send({ requestedPlan: "ENTERPRISE" });
    expect(create.status).toBe(201);
    const reqId = create.body.id;

    const reject = await platform.post(`/api/platform-admin/subscription-requests/${reqId}/reject`).send({ reason: "Billing on hold" });
    expect(reject.status).toBe(200);
    expect(reject.body.status).toBe("rejected");

    // Plan unchanged (still PRO from the approved request).
    const current = await garageAdmin.get("/api/subscriptions/current");
    expect(current.body.plan).toBe("PRO");
  });
});
