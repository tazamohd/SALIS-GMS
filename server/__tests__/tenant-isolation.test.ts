/**
 * Cross-tenant isolation harness (Story 1.7 / FR-8).
 *
 * Seeds a SECOND garage and a second authenticated admin, then asserts that
 * Garage A cannot read or mutate Garage B's data across lists, detail reads
 * (existence-hiding 404), global search, and writes. Runs against real Postgres
 * in CI. This is the executable proof for Epic 1.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;

// Garage A == the globally seeded TEST_GARAGE_ID (loginAsAdmin attaches to it).
let agentA: supertest.Agent;
let garageA: string;

// Garage B == a second tenant created just for this suite.
let agentB: supertest.Agent;
let garageB: string;

const ADMIN_B = {
  email: `iso-admin-b-${Date.now()}@slis.sa`,
  password: "TestPass123!",
  fullName: "Isolation Admin B",
  phone: "+966500009999",
};

async function createGarageB(): Promise<string> {
  const url = process.env.DATABASE_URL!;
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const r = await client.query(
      `INSERT INTO garages (name, country, city, is_active)
       VALUES ('Isolation Garage B', 'Saudi Arabia', 'Jeddah', true) RETURNING id`,
    );
    const id = r.rows[0].id as string;
    await client.query(
      `INSERT INTO subscriptions (garage_id, plan, status) VALUES ($1, 'ENTERPRISE', 'active')
       ON CONFLICT (garage_id) DO UPDATE SET plan = 'ENTERPRISE', status = 'active'`,
      [id],
    );
    await client.query(`UPDATE users SET garage_id = $1, role = 'ADMIN' WHERE email = $2`, [id, ADMIN_B.email]);
    return id;
  } finally {
    await client.end();
  }
}

async function loginAdminB(): Promise<supertest.Agent> {
  const agent = supertest.agent(app);
  await agent.post("/api/register").send(ADMIN_B).expect((res) => {
    if (![200, 400, 500].includes(res.status)) {
      throw new Error(`Register B failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });
  garageB = await createGarageB();
  const login = await agent.post("/api/login").send({ email: ADMIN_B.email, password: ADMIN_B.password });
  if (login.status !== 200) throw new Error(`Login B failed: ${login.status} ${JSON.stringify(login.body)}`);
  return agent;
}

async function createCustomer(agent: supertest.Agent, garageId: string, name: string) {
  const res = await agent.post("/api/customers").send({
    fullName: name,
    email: `${name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}@iso.sa`,
    phone: "+966500001234",
    address: "1 Isolation St",
    garageId,
  });
  expect([200, 201]).toContain(res.status);
  return res.body;
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  agentA = a.agent;
  garageA = a.garageId;
  agentB = await loginAdminB();
});

describe("Tenant isolation — Garage A cannot reach Garage B", () => {
  let bCustomer: any;
  let aCustomer: any;

  beforeAll(async () => {
    bCustomer = await createCustomer(agentB, garageB, "Bravo Customer");
    aCustomer = await createCustomer(agentA, garageA, "Alpha Customer");
  });

  it("seeds two distinct garages", () => {
    expect(garageA).toBeTruthy();
    expect(garageB).toBeTruthy();
    expect(garageA).not.toBe(garageB);
  });

  it("list reads exclude the other tenant's customers", async () => {
    const aList = await agentA.get("/api/customers");
    expect(aList.status).toBe(200);
    const aIds = (aList.body as any[]).map((c) => c.id);
    expect(aIds).toContain(aCustomer.id);
    expect(aIds).not.toContain(bCustomer.id);

    const bList = await agentB.get("/api/customers");
    expect(bList.status).toBe(200);
    const bIds = (bList.body as any[]).map((c) => c.id);
    expect(bIds).toContain(bCustomer.id);
    expect(bIds).not.toContain(aCustomer.id);
  });

  it("detail read of another tenant's customer is 404 (existence-hiding)", async () => {
    const res = await agentA.get(`/api/customers/${bCustomer.id}`);
    expect(res.status).toBe(404);
    // B can still read its own — proving the row exists and A is being denied, not 404'd by absence.
    const own = await agentB.get(`/api/customers/${bCustomer.id}`);
    expect(own.status).toBe(200);
  });

  it("cross-tenant update does not mutate the other tenant's record", async () => {
    const before = await agentB.get(`/api/customers/${bCustomer.id}`);
    const originalName = before.body.fullName;

    const attempt = await agentA
      .patch(`/api/customers/${bCustomer.id}`)
      .send({ fullName: "HACKED BY A" });
    expect([403, 404]).toContain(attempt.status);

    const after = await agentB.get(`/api/customers/${bCustomer.id}`);
    expect(after.body.fullName).toBe(originalName);
    expect(after.body.fullName).not.toBe("HACKED BY A");
  });

  it("global search does not surface the other tenant's data", async () => {
    const res = await agentA.get(`/api/search`).query({ q: "Bravo" });
    // Endpoint may return 200 with results; assert none belong to Garage B.
    if (res.status === 200) {
      const blob = JSON.stringify(res.body);
      expect(blob).not.toContain(bCustomer.id);
    }
  });
});
