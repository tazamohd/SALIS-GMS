/**
 * Tenant-isolation regression suite for write paths (deep-audit blockers B4, B12).
 *
 * Before Phase 1a, create endpoints trusted a body `garageId` (mass-assignment)
 * and storage update/delete filtered by primary key only, so an authenticated
 * user in garage B could rename/delete garage A's rows by id. These tests pin
 * the tenant on create and scope update/delete to the caller's garage.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";

let app: Express;
let agentA: supertest.Agent;
let agentB: supertest.Agent;
let garageA: string;
let garageB: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  agentA = a.agent;
  garageA = a.garageId || process.env.TEST_GARAGE_ID || "";
  const b = await createSecondGarageAdmin(app);
  agentB = b.agent;
  garageB = b.garageId;
});

describe("Tenant isolation — supplier writes (B4 / B12)", () => {
  it("pins a created supplier to the session garage, ignoring a forged body garageId (B12)", async () => {
    const res = await agentA
      .post("/api/suppliers")
      .send({ name: "Acme Parts A", garageId: garageB });
    expect(res.status).toBe(201);
    expect(res.body.garageId).toBe(garageA);
    expect(res.body.garageId).not.toBe(garageB);
  });

  it("blocks a cross-tenant update with 404 and allows the owner's update (B4)", async () => {
    // garageId is sent to satisfy the insert schema; the handler pins it to the
    // session garage regardless (proven above).
    const created = await agentA.post("/api/suppliers").send({ name: "Acme Parts B", garageId: garageA });
    expect(created.status).toBe(201);
    const id = created.body.id;
    expect(id).toBeTruthy();

    const cross = await agentB.patch(`/api/suppliers/${id}`).send({ name: "HACKED" });
    expect(cross.status).toBe(404);

    const own = await agentA.patch(`/api/suppliers/${id}`).send({ name: "Renamed OK" });
    expect(own.status).toBe(200);
    expect(own.body.name).toBe("Renamed OK");
  });

  it("cross-tenant delete is a no-op — the owner's supplier survives", async () => {
    const created = await agentA.post("/api/suppliers").send({ name: "Acme Parts C", garageId: garageA });
    expect(created.status).toBe(201);
    const id = created.body.id;

    // The scoped WHERE matches nothing for garage B, so this deactivates nothing.
    await agentB.delete(`/api/suppliers/${id}`);

    // The owner can still operate on it → it was not deactivated across tenants.
    const own = await agentA.patch(`/api/suppliers/${id}`).send({ name: "Still Here" });
    expect(own.status).toBe(200);
    expect(own.body.name).toBe("Still Here");
  });
});
