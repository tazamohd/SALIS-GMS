/**
 * B11 (HR) — employee detail and pay slip are tenant-scoped and role-gated.
 *
 * These endpoints expose national ID + full salary computation. Before the
 * fix they (a) queried non-existent quoted-camelCase columns and silently
 * returned empty, and (b) looked up users by id with no garage filter, so
 * any authenticated user in any garage could read another garage's HR
 * record. Employee detail is now manager+; both are garage-scoped.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, loginAsUser, createSecondGarageAdmin } from "./helpers";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let adminA: supertest.Agent;
let advisorA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let employeeAId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  advisorA = (await loginAsUser(app)).agent;
  adminB = (await createSecondGarageAdmin(app)).agent;

  // A garage-A employee with HR-sensitive data.
  const res = await db.execute(sql`
    INSERT INTO users (id, full_name, email, role, national_id, password, garage_id, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Salary Person', ${`emp-${Date.now()}@a.sa`}, 'TECHNICIAN',
            '1234567890', 'x', ${garageA}, true, NOW(), NOW())
    RETURNING id
  `);
  employeeAId = (res.rows[0] as any).id;
}, 60000);

describe("HR employee detail — real data, scoped, role-gated", () => {
  it("returns real employee data for a manager in the same garage", async () => {
    const res = await adminA.get(`/api/hr/employees/${employeeAId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Salary Person");
    expect(res.body.nationalId).toBe("1234567890");
    expect(res.body.gosi).toBeDefined();
  });

  it("lists real employees (not the old empty fallback)", async () => {
    const res = await adminA.get("/api/hr/employees?limit=5");
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.employees.length).toBeGreaterThan(0);
  });

  it("denies an ordinary advisor (manager+ only)", async () => {
    const res = await advisorA.get(`/api/hr/employees/${employeeAId}`);
    expect(res.status).toBe(403);
  });

  it("does not leak across tenants: garage B admin gets 404", async () => {
    const res = await adminB.get(`/api/hr/employees/${employeeAId}`);
    expect(res.status).toBe(404);
  });

  it("pay slip is tenant-scoped: garage B admin gets 404", async () => {
    const res = await adminB.get(`/api/hr/payroll/slip/${employeeAId}`);
    expect(res.status).toBe(404);
    const own = await adminA.get(`/api/hr/payroll/slip/${employeeAId}`);
    expect(own.status).toBe(200);
    expect(own.body.netPay).toBeTypeOf("number");
  });
});
