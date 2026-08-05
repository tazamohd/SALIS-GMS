/**
 * B16 breadth batch 3 — cross-tenant write scope on loaner-vehicles
 * (vehicle-inspections use the identical optional-garageId storage/handler path).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";
import { storage } from "../storage";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  adminB = (await createSecondGarageAdmin(app)).agent;
});

describe("B16 — loaner-vehicle writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's loaner vehicle", async () => {
    const lv = await storage.createLoanerVehicle({
      garageId: garageA, make: "Toyota", model: "Corolla", year: 2021,
    } as any);

    const bPatch = await adminB.patch(`/api/loaner-vehicles/${lv.id}`).send({ model: "Hacked" });
    expect(bPatch.status).toBe(404);

    await adminB.delete(`/api/loaner-vehicles/${lv.id}`); // scoped no-op

    const aPatch = await adminA.patch(`/api/loaner-vehicles/${lv.id}`).send({ model: "Corolla LE" });
    expect(aPatch.status).toBe(200);
  });
});
