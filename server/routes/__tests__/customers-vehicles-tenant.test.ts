import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

const FOREIGN = "33333333-3333-3333-3333-333333333333";
const UNKNOWN = "00000000-0000-0000-0000-000000000000";

describe("Customer tenant isolation", () => {
  it("403s on a foreign ?garage_id= and scopes the list otherwise", async () => {
    expect((await agent.get(`/api/customers?garage_id=${FOREIGN}`)).status).toBe(403);
    const list = await agent.get("/api/customers");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
  });

  it("404s on a customer and sub-resources outside the garage", async () => {
    expect((await agent.get(`/api/customers/${UNKNOWN}`)).status).toBe(404);
    expect((await agent.get(`/api/customers/${UNKNOWN}/invoices`)).status).toBe(404);
    expect((await agent.get(`/api/customers/${UNKNOWN}/payments`)).status).toBe(404);
  });
});

describe("Vehicle tenant isolation", () => {
  it("403s on a foreign ?garageId= and scopes the list otherwise", async () => {
    expect((await agent.get(`/api/vehicles?garageId=${FOREIGN}`)).status).toBe(403);
    const list = await agent.get("/api/vehicles");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
  });

  it("404s on patch/delete and sub-resources outside the garage", async () => {
    expect((await agent.patch(`/api/vehicles/${UNKNOWN}`).send({ color: "Red" })).status).toBe(404);
    expect((await agent.delete(`/api/vehicles/${UNKNOWN}`)).status).toBe(404);
    expect((await agent.get(`/api/vehicles/${UNKNOWN}/service-history`)).status).toBe(404);
  });
});
