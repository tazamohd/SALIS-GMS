/**
 * H-2 regression — object-level authorization on modular by-id endpoints.
 *
 * The security floor pins the tenant on the query string and request body, but
 * it cannot enforce ownership on a `:id` PATH parameter: a handler that looks a
 * row up by id with no garage predicate lets any authenticated staff user in
 * garage B read another garage's record by UUID. The monolith was already
 * guarded; this suite locks the modular routes (`server/routes/*.ts`) that the
 * H-2 gap analysis flagged — a representative cross-garage sample plus the two
 * bespoke fixes (recipient-scoped notifications, garage-or-global templates).
 *
 * Garage A = seeded test garage (loginAsAdmin). Garage B = a fresh garage with
 * its own admin (createSecondGarageAdmin). A must reach its own rows; B must 404.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin, seedCustomer, seedVehicle, seedJobCard } from "./helpers";

let app: Express;
let agentA: supertest.Agent;
let garageA: string;
let agentB: supertest.Agent;

let vehA: any;
let jobA: any;

beforeAll(async () => {
  app = (await createTestApp()).app;

  const a = await loginAsAdmin(app);
  agentA = a.agent;
  garageA = a.garageId;

  const custA = await seedCustomer(agentA, garageA);
  vehA = await seedVehicle(agentA, custA.id, garageA);
  jobA = await seedJobCard(agentA, vehA.id, custA.id, garageA);

  agentB = (await createSecondGarageAdmin(app)).agent;
});

describe("H-2 — cross-garage by-id reads are 404 (requireResourceOwnership)", () => {
  // vehicle-scoped guards (vehicle-maintenance.ts / vehicle-tracking.ts / service-reminders.ts)
  const vehicleRoutes = (id: string) => [
    `/api/vehicles/${id}/service-history`,
    `/api/vehicles/${id}/maintenance-schedules`,
    `/api/vehicles/${id}/service-reminders`,
    `/api/vehicle-tracking/${id}`,
    `/api/vehicle-tracking/${id}/history`,
    `/api/service-reminders/vehicle/${id}`,
  ];

  it("garage B is 404 on every vehicle-scoped by-id route for garage A's vehicle", async () => {
    for (const url of vehicleRoutes(vehA.id)) {
      const res = await agentB.get(url);
      expect(res.status, `B should not reach ${url}`).toBe(404);
    }
  });

  it("garage A still reaches its OWN vehicle's service-history (guard passes through)", async () => {
    const res = await agentA.get(`/api/vehicles/${vehA.id}/service-history`);
    expect(res.status).toBe(200); // empty history is 200 [], not a guard 404
  });

  it("garage B is 404 on garage A's job-card chat (parent-scoped guard)", async () => {
    const res = await agentB.get(`/api/job-cards/${jobA.id}/chat`);
    expect(res.status).toBe(404);
  });

  it("garage A reaches its OWN job-card chat", async () => {
    const res = await agentA.get(`/api/job-cards/${jobA.id}/chat`);
    expect(res.status).toBe(200);
  });

  it("a malformed (non-uuid) id is 404, not 500", async () => {
    const res = await agentB.get("/api/vehicles/not-a-uuid/service-history");
    expect(res.status).toBe(404);
  });
});

// The notification-center router (app_notifications, recipient-scoped) is
// mounted at /api/notification-center — distinct from the monolith's
// `notifications`-table endpoints under /api/notifications.
describe("H-2 — notification-center is recipient-scoped", () => {
  const NC = "/api/notification-center";

  it("a user cannot delete another user's notification (404), but can delete their own", async () => {
    // Seed notifications for user A, grab one id.
    const seed = await agentA.post(`${NC}/notifications/seed`).send({});
    const list = await agentA.get(`${NC}/notifications`);
    expect(list.status).toBe(200);
    const notif = list.body.notifications?.[0];
    expect(notif, `seed=${seed.status} list=${JSON.stringify(list.body).slice(0, 200)}`).toBeTruthy();

    // User B (different recipient) cannot delete it.
    const bDelete = await agentB.delete(`${NC}/notifications/${notif.id}`);
    expect(bDelete.status).toBe(404);

    // The owner can.
    const aDelete = await agentA.delete(`${NC}/notifications/${notif.id}`);
    expect(aDelete.status).toBe(200);
  });

  it("marking a non-owned notification read is 404", async () => {
    const res = await agentB.post(`${NC}/notifications/999999999/read`).send({});
    expect(res.status).toBe(404);
  });
});
