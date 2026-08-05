/**
 * H-1 (loyalty + fleet) via the central requireResourceOwnership guard.
 *
 * Exercises both guard modes:
 *  - direct garage_id (loyalty_accounts)
 *  - parent-join through fleet_groups.garage_id (fleet_vehicles, which has
 *    no garage_id of its own)
 *
 * Cross-tenant reads and mutations by UUID must 404; the owner succeeds.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";
import { storage } from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let loyaltyId: string;
let fleetGroupId: string;
let fleetVehicleId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  adminB = (await createSecondGarageAdmin(app)).agent;

  const customerId = (await storage.createUser({
    email: `h1-lf-${Date.now()}@a.sa`, password: "x", role: "CUSTOMER",
    userType: "customer", garageId: garageA, fullName: "Cust",
  } as any)).id;

  // GET/add-points/redeem-points operate on loyalty_accounts (direct
  // garage_id); insert straight into it.
  const loy = await db.execute(sql`
    INSERT INTO loyalty_accounts (id, garage_id, customer_id, current_points, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${customerId}, 100, NOW())
    RETURNING id`);
  loyaltyId = (loy.rows[0] as any).id;

  // Fleet group (direct garage_id) + a vehicle under it (garage via parent).
  const g = await db.execute(sql`
    INSERT INTO fleet_groups (id, garage_id, customer_id, fleet_name, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${customerId}, 'A Fleet', NOW())
    RETURNING id`);
  fleetGroupId = (g.rows[0] as any).id;

  const veh = (await db.execute(sql`INSERT INTO vehicles (id, garage_id, customer_id, make, model, year, license_plate, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${customerId}, 'Toyota', 'Hilux', 2022, ${'FLT-' + Date.now()}, NOW()) RETURNING id`)).rows[0] as any;
  const fv = await db.execute(sql`
    INSERT INTO fleet_vehicles (id, fleet_group_id, vehicle_id)
    VALUES (gen_random_uuid(), ${fleetGroupId}, ${veh.id})
    RETURNING id`);
  fleetVehicleId = (fv.rows[0] as any).id;
}, 60000);

describe("loyalty account — direct garage_id ownership (add/redeem points)", () => {
  it("blocks garage B from the audit's money exploit; owner succeeds", async () => {
    // The audit's financial-integrity exploit: mutate another garage's
    // point balance by UUID. Both must 404 for garage B.
    expect((await adminB.post(`/api/loyalty-accounts/${loyaltyId}/add-points`).send({ points: 9999 })).status).toBe(404);
    expect((await adminB.post(`/api/loyalty-accounts/${loyaltyId}/redeem-points`).send({ points: 10 })).status).toBe(404);
    // Owner is not broken by the guard.
    expect((await adminA.post(`/api/loyalty-accounts/${loyaltyId}/add-points`).send({ points: 10 })).status).toBe(200);
  });
});

describe("fleet vehicle — parent-join ownership (no own garage_id)", () => {
  it("owner reads; garage B is blocked on read/patch/delete (404)", async () => {
    expect((await adminA.get(`/api/fleet/vehicles/${fleetVehicleId}`)).status).toBe(200);
    expect((await adminB.get(`/api/fleet/vehicles/${fleetVehicleId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/fleet/vehicles/${fleetVehicleId}`).send({ notes: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/fleet/vehicles/${fleetVehicleId}`)).status).toBe(404);
    // The parent group itself is also protected.
    expect((await adminB.get(`/api/fleet/groups/${fleetGroupId}`)).status).toBe(404);
    expect((await adminA.get(`/api/fleet/groups/${fleetGroupId}`)).status).toBe(200);
  });
});
