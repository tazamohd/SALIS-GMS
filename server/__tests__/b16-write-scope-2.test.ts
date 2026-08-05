/**
 * B16 breadth batch 2 — cross-tenant write scope on job-cards + service-templates.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin, seedCustomer, seedVehicle, seedJobCard } from "./helpers";
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

describe("B16 — job-card writes are tenant-scoped", () => {
  it("garage B cannot update garage A's job card", async () => {
    const customerId = (await seedCustomer(adminA, garageA)).id;
    const vehicle = await seedVehicle(adminA, customerId, garageA);
    const jc = await seedJobCard(adminA, vehicle.id, customerId, garageA);

    const bPatch = await adminB.patch(`/api/job-cards/${jc.id}`).send({ notes: "hacked" });
    expect(bPatch.status).toBe(404);

    const aPatch = await adminA.patch(`/api/job-cards/${jc.id}`).send({ notes: "legit" });
    expect(aPatch.status).toBe(200);
  });
});

describe("B16 — service-template writes are tenant-scoped", () => {
  it("garage B cannot update garage A's service template", async () => {
    const tpl = await storage.createServiceTemplate({
      garageId: garageA, name: "Oil Change", category: "maintenance", taskSteps: ["drain", "refill"],
    } as any);

    const bPut = await adminB.put(`/api/service-templates/${tpl.id}`).send({ name: "hacked" });
    expect(bPut.status).toBe(404);

    const aPut = await adminA.put(`/api/service-templates/${tpl.id}`).send({ name: "Oil Change Plus" });
    expect(aPut.status).toBe(200);
  });
});
