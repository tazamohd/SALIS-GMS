/**
 * Tenant isolation for the previously tenant-less tables (deep-audit blocker B5).
 * fleet_accounts and document_library_items now carry a garage_id; a list from
 * garage B must not see garage A's rows.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  adminA = (await loginAsAdmin(app)).agent;
  adminB = (await createSecondGarageAdmin(app)).agent;
});

describe("Fleet accounts — tenant scoped (B5)", () => {
  it("garage B cannot see garage A's fleet account", async () => {
    const company = `Acme-Fleet-${Date.now()}`;
    const created = await adminA.post("/api/fleet/accounts").send({ companyName: company });
    expect([200, 201]).toContain(created.status);

    const listA = await adminA.get("/api/fleet/accounts");
    expect(listA.status).toBe(200);
    expect(JSON.stringify(listA.body)).toContain(company);

    const listB = await adminB.get("/api/fleet/accounts");
    expect(listB.status).toBe(200);
    expect(JSON.stringify(listB.body)).not.toContain(company);
  });
});

describe("Document library — tenant scoped (B5)", () => {
  it("garage B cannot see garage A's document", async () => {
    const docName = `Contract-A-${Date.now()}`;
    const created = await adminA.post("/api/documents").send({
      name: docName, type: "pdf", category: "contracts",
    });
    expect([200, 201]).toContain(created.status);

    const listA = await adminA.get("/api/documents");
    expect(listA.status).toBe(200);
    expect(JSON.stringify(listA.body)).toContain(docName);

    const listB = await adminB.get("/api/documents");
    expect(listB.status).toBe(200);
    expect(JSON.stringify(listB.body)).not.toContain(docName);
  });
});
