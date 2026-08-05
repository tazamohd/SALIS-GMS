/**
 * H-1 central-guard rollout — cross-tenant lock-in across the four guard modes
 * the bulk rollout uses, so a future edit that drops or mis-tables a guard is
 * caught:
 *   - DIRECT garage_id           (estimates, suppliers, call_sessions)
 *   - PARENT-JOIN child          (supplier_performance -> suppliers)
 *   - PARENT-ADDRESSED nested    (iot_sensors -> vehicles, via /iot/sensors/:id)
 *   - PROVIDER tenant column     (provider_offerings.provider_id == garageId)
 *
 * Garage B must get 404 on every cross-tenant :id; the owner is unaffected.
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
let estimateId: string;
let supplierId: string;
let perfId: string;
let callId: string;
let sensorId: string;
let offeringId: string;

async function insert(q: any): Promise<string> {
  return (await db.execute(q)).rows[0].id as string;
}

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  const adminAId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  const customerId = (await storage.createUser({
    email: `h1-roll-${Date.now()}@a.sa`, password: "x", role: "CUSTOMER",
    userType: "customer", garageId: garageA, fullName: "Cust",
  } as any)).id;

  estimateId = await insert(sql`INSERT INTO estimates (id, estimate_number, garage_id, customer_id, title, created_by, created_at)
    VALUES (gen_random_uuid(), ${'EST-' + Date.now()}, ${garageA}, ${customerId}, 'Brakes', ${adminAId}, NOW()) RETURNING id`);

  supplierId = await insert(sql`INSERT INTO suppliers (id, garage_id, name, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'Acme Parts', NOW()) RETURNING id`);

  perfId = await insert(sql`INSERT INTO supplier_performance (id, supplier_id, period, created_at)
    VALUES (gen_random_uuid(), ${supplierId}, '2026-Q1', NOW()) RETURNING id`);

  callId = await insert(sql`INSERT INTO call_sessions (id, garage_id, direction, phone_number, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'inbound', '+966500000000', NOW()) RETURNING id`);

  const vehId = await insert(sql`INSERT INTO vehicles (id, garage_id, customer_id, make, model, year, license_plate, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${customerId}, 'Toyota', 'Camry', 2021, ${'ROLL-' + Date.now()}, NOW()) RETURNING id`);
  sensorId = await insert(sql`INSERT INTO iot_sensors (id, vehicle_id, sensor_type, sensor_identifier, created_at)
    VALUES (gen_random_uuid(), ${vehId}, 'temperature', ${'SEN-' + Date.now()}, NOW()) RETURNING id`);

  // provider_offerings is scoped by provider_id, which FK-references garages.
  offeringId = await insert(sql`INSERT INTO provider_offerings (id, provider_id, name, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'Roadside Assist', NOW()) RETURNING id`);
});

describe("DIRECT garage_id entities", () => {
  it("garage B is blocked; owner reads", async () => {
    expect((await adminA.get(`/api/estimates/${estimateId}`)).status).toBe(200);
    expect((await adminB.get(`/api/estimates/${estimateId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/estimates/${estimateId}`).send({ title: "hax" })).status).toBe(404);

    expect((await adminB.patch(`/api/suppliers/${supplierId}`).send({ name: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/suppliers/${supplierId}`)).status).toBe(404);

    expect((await adminA.get(`/api/call-center/sessions/${callId}`)).status).toBe(200);
    expect((await adminB.get(`/api/call-center/sessions/${callId}`)).status).toBe(404);
  });
});

describe("PARENT-JOIN child (supplier_performance -> suppliers)", () => {
  it("garage B cannot read/patch/delete another garage's supplier performance", async () => {
    expect((await adminA.get(`/api/supplier-performance/${perfId}`)).status).toBe(200);
    expect((await adminB.get(`/api/supplier-performance/${perfId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/supplier-performance/${perfId}`).send({ period: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/supplier-performance/${perfId}`)).status).toBe(404);
  });
});

describe("PARENT-ADDRESSED nested (iot/sensors/:id -> vehicles)", () => {
  it("garage B cannot read/patch/delete a sensor under another garage's vehicle", async () => {
    expect((await adminB.get(`/api/iot/sensors/${sensorId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/iot/sensors/${sensorId}`).send({ sensorType: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/iot/sensors/${sensorId}`)).status).toBe(404);
  });
});

describe("PROVIDER tenant column (provider_id == garageId)", () => {
  it("garage B cannot patch/delete another provider's offering", async () => {
    expect((await adminB.patch(`/api/provider/offerings/${offeringId}`).send({ name: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/provider/offerings/${offeringId}`)).status).toBe(404);
  });
});
