/**
 * C-1 / C-2 regression lock — a customer session must never reach the staff API
 * surface.
 *
 * C-1 (broken function-level authz): a self-registered marketplace customer got
 * a Passport session but the legacy monolith gated ~283 GET routes with
 * `isAuthenticated` only, so the customer could read `/api/customers`,
 * `/api/users`, `/api/invoices`, `/api/hr/employees`, ... .
 * C-2 (cross-tenant leak): that customer has no garageId, and the getters'
 * "no garage ⇒ all tenants" behaviour turned the C-1 read into a cross-tenant
 * read of every garage's data.
 *
 * `requireStaffByDefault` (server/middleware/requireStaff.ts) closes both by
 * denying the staff surface to customer sessions while leaving the customer's
 * own namespaces reachable. This test pins that behaviour so a future middleware
 * edit can't silently re-open it.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let customer: supertestLib.Agent;
let admin: supertestLib.Agent;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

// Staff surfaces a customer must never read (C-1). Includes the ones the audit
// reproduced returning 200 with real staff/PII data.
const STAFF_ENDPOINTS = [
  "/api/customers",
  "/api/users",
  "/api/invoices",
  "/api/hr/employees",
  "/api/job-cards",
  "/api/suppliers",
  "/api/reports",
  "/api/roles",
];

// The customer's own namespaces must stay reachable (no over-blocking).
const CUSTOMER_ENDPOINTS = ["/api/user", "/api/my/vehicles", "/api/customer/vehicles"];

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  customer = supertestLib.agent(app);
  const email = `c1c2-cust-${uniq()}@test.sa`;
  const reg = await customer
    .post("/api/customer/register")
    .send({ email, password: "CustPass123!", fullName: "Lockout Cust" });
  expect(reg.status).toBe(201);
  const a = await loginAsAdmin(app);
  admin = a.agent;
});

describe("C-1/C-2 customer staff-surface lockout", () => {
  it("blocks a customer session from every staff endpoint (403)", async () => {
    for (const ep of STAFF_ENDPOINTS) {
      const res = await customer.get(ep);
      expect(res.status, `customer must be 403 on ${ep}, got ${res.status}`).toBe(403);
    }
  });

  it("still lets the customer reach their own namespaces", async () => {
    for (const ep of CUSTOMER_ENDPOINTS) {
      const res = await customer.get(ep);
      expect(res.status, `customer should reach ${ep}, got ${res.status}`).not.toBe(403);
      expect(res.status).toBeLessThan(500);
    }
  });

  it("does not affect staff access to the same staff endpoints", async () => {
    // Control: the admin (staff) still reads the staff surface the customer is denied.
    for (const ep of ["/api/customers", "/api/invoices", "/api/hr/employees"]) {
      const res = await admin.get(ep);
      expect(res.status, `admin should reach ${ep}, got ${res.status}`).toBeLessThan(400);
    }
  });

  it("customer cannot mutate staff resources either", async () => {
    const res = await customer.post("/api/customers").send({ fullName: "x", email: `x${uniq()}@t.sa` });
    expect(res.status).toBe(403);
  });
});
