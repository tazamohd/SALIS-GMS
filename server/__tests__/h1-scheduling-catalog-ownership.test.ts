/**
 * H-1 (scheduling + catalog batch) via requireResourceOwnership.
 *
 * Direct-garage_id entities that previously looked rows up by :id with no
 * tenant predicate: discounts_promotions, calendar_appointments,
 * loaner_vehicles, document_categories. Cross-tenant reads/writes by UUID
 * must 404; the owner still succeeds.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let adminAId: string;
let discountId: string;
let apptId: string;
let loanerId: string;
let docCatId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  adminAId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  discountId = (await db.execute(sql`
    INSERT INTO discounts_promotions (id, garage_id, code, name, discount_type,
      discount_value, start_date, end_date, created_by, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${'H1-' + Date.now()}, 'Batch', 'percentage',
      10, NOW(), NOW() + INTERVAL '30 days', ${adminAId}, NOW())
    RETURNING id`)).rows[0].id as string;

  apptId = (await db.execute(sql`
    INSERT INTO calendar_appointments (id, garage_id, title, start_time, end_time, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'Oil change', NOW(), NOW() + INTERVAL '1 hour', NOW())
    RETURNING id`)).rows[0].id as string;

  loanerId = (await db.execute(sql`
    INSERT INTO loaner_vehicles (id, garage_id, make, model, year, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'Toyota', 'Corolla', 2023, NOW())
    RETURNING id`)).rows[0].id as string;

  docCatId = (await db.execute(sql`
    INSERT INTO document_categories (id, garage_id, category_name, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'Invoices', NOW())
    RETURNING id`)).rows[0].id as string;
}, 60000);

describe("discounts — direct garage_id", () => {
  it("owner reads; garage B cannot read, patch or delete", async () => {
    expect((await adminA.get(`/api/discounts/${discountId}`)).status).toBe(200);
    expect((await adminB.get(`/api/discounts/${discountId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/discounts/${discountId}`).send({ name: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/discounts/${discountId}`)).status).toBe(404);
  });
});

describe("calendar appointments — direct garage_id", () => {
  it("owner reads; garage B cannot read, patch, delete or move", async () => {
    expect((await adminA.get(`/api/calendar-appointments/${apptId}`)).status).toBe(200);
    expect((await adminB.get(`/api/calendar-appointments/${apptId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/calendar-appointments/${apptId}`).send({ title: "hax" })).status).toBe(404);
    expect((await adminB.post(`/api/calendar-appointments/${apptId}/move`).send({ startTime: new Date().toISOString() })).status).toBe(404);
    expect((await adminB.delete(`/api/calendar-appointments/${apptId}`)).status).toBe(404);
  });
});

describe("loaner vehicles + document categories — direct garage_id", () => {
  it("garage B is blocked; owner reads", async () => {
    expect((await adminA.get(`/api/loaner-vehicles/${loanerId}`)).status).toBe(200);
    expect((await adminB.get(`/api/loaner-vehicles/${loanerId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/loaner-vehicles/${loanerId}`).send({ make: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/loaner-vehicles/${loanerId}`)).status).toBe(404);

    expect((await adminA.get(`/api/document-categories/${docCatId}`)).status).toBe(200);
    expect((await adminB.get(`/api/document-categories/${docCatId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/document-categories/${docCatId}`).send({ categoryName: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/document-categories/${docCatId}`)).status).toBe(404);
  });
});
