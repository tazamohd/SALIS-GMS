import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, unauthenticatedAgent } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;
let uniqueName: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;

  // Seed a customer in the caller's garage with a unique, searchable name.
  uniqueName = `Zentestcustomer${Date.now()}`;
  await agent.post("/api/customers").send({
    fullName: uniqueName,
    email: `${uniqueName.toLowerCase()}@test.sa`,
    phone: "+966500009999",
    address: "1 Test Road, Riyadh",
    garageId: login.garageId,
  });
});

describe("GET /api/search (smart, tenant-scoped)", () => {
  it("returns [] for queries shorter than 2 chars", async () => {
    const res = await agent.get("/api/search?q=a");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns [] when no query is provided", async () => {
    const res = await agent.get("/api/search");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("finds a customer in the caller's garage", async () => {
    const res = await agent.get(`/api/search?q=${uniqueName.toLowerCase()}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const hit = res.body.find(
      (r: any) => r.type === "customer" && r.title === uniqueName,
    );
    expect(hit).toBeTruthy();
    expect(hit.href).toContain("/customers?id=");
  });

  it("rejects unauthenticated callers", async () => {
    const res = await unauthenticatedAgent(app).get("/api/search?q=test");
    expect([401, 403]).toContain(res.status);
  });
});
