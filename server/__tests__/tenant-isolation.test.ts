/**
 * Cross-tenant isolation suite.
 *
 * Proves that a user in garage B cannot read garage A's data through the list
 * endpoints, even when they explicitly pass garage A's id as a `?garage_id`
 * query param. This guards against the audit's #1 critical ("missing/forged
 * garageId returns another tenant's data").
 *
 * Garage A = the seeded test garage (loginAsAdmin). Garage B = a fresh garage
 * with its own admin (createSecondGarageAdmin).
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
let garageB: string;

// Identifiers of records created under garage A.
let custA: any;
let vehA: any;
let jobA: any;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;

  const a = await loginAsAdmin(app);
  agentA = a.agent;
  garageA = a.garageId;

  // Seed a customer → vehicle → job card under garage A.
  custA = await seedCustomer(agentA, garageA);
  vehA = await seedVehicle(agentA, custA.id, garageA);
  jobA = await seedJobCard(agentA, vehA.id, custA.id, garageA);

  const b = await createSecondGarageAdmin(app);
  agentB = b.agent;
  garageB = b.garageId;
});

describe("Cross-tenant isolation — list reads are scoped to the caller's garage", () => {
  it("garages A and B are distinct", () => {
    expect(garageA).toBeTruthy();
    expect(garageB).toBeTruthy();
    expect(garageA).not.toBe(garageB);
  });

  it("garage B cannot see garage A's customers (even forging ?garage_id)", async () => {
    const plain = await agentB.get("/api/customers");
    expect(plain.status).toBe(200);
    expect(plain.body.find((c: any) => c.id === custA.id)).toBeUndefined();

    // Forge garage A's id — must still be ignored for a non-platform admin.
    const forged = await agentB.get(`/api/customers?garage_id=${garageA}`);
    expect(forged.status).toBe(200);
    expect(forged.body.find((c: any) => c.id === custA.id)).toBeUndefined();
  });

  it("garage B cannot see garage A's vehicles (even forging ?garageId)", async () => {
    const plain = await agentB.get("/api/vehicles");
    expect(plain.status).toBe(200);
    expect(plain.body.find((v: any) => v.id === vehA.id)).toBeUndefined();

    const forged = await agentB.get(`/api/vehicles?garageId=${garageA}`);
    expect(forged.status).toBe(200);
    expect(forged.body.find((v: any) => v.id === vehA.id)).toBeUndefined();
  });

  it("garage B cannot see garage A's job cards (even forging ?garage_id)", async () => {
    const plain = await agentB.get("/api/job-cards");
    expect(plain.status).toBe(200);
    expect(plain.body.find((j: any) => j.id === jobA.id)).toBeUndefined();

    const forged = await agentB.get(`/api/job-cards?garage_id=${garageA}`);
    expect(forged.status).toBe(200);
    expect(forged.body.find((j: any) => j.id === jobA.id)).toBeUndefined();
  });

  it("garage A still sees its own records (no over-filtering regression)", async () => {
    const customers = await agentA.get("/api/customers");
    expect(customers.status).toBe(200);
    expect(customers.body.find((c: any) => c.id === custA.id)).toBeDefined();

    const jobs = await agentA.get("/api/job-cards");
    expect(jobs.status).toBe(200);
    expect(jobs.body.find((j: any) => j.id === jobA.id)).toBeDefined();
  });
});
