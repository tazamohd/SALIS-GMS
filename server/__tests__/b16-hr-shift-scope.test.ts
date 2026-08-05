/**
 * B16 tail — HR shift templates are tenant-scoped. The central
 * requireResourceOwnership guard (H-1) now runs ahead of the handler and
 * returns 404 for a cross-tenant :id (existence is not disclosed to another
 * garage); storage writes remain garageId-scoped as defense in depth.
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

describe("B16 — HR shift-template writes are tenant-scoped", () => {
  it("garage B cannot update or delete garage A's shift template; owner can", async () => {
    const tpl = await storage.createShiftTemplate({
      garageId: garageA, name: "Morning", startTime: "09:00", endTime: "17:00",
      daysOfWeek: ["monday", "tuesday", "wednesday"],
    } as any);

    const bPatch = await adminB.patch(`/api/hr/shift-templates/${tpl.id}`).send({ name: "Hacked" });
    expect(bPatch.status).toBe(404);

    const bDel = await adminB.delete(`/api/hr/shift-templates/${tpl.id}`);
    expect(bDel.status).toBe(404);

    const aPatch = await adminA.patch(`/api/hr/shift-templates/${tpl.id}`).send({ name: "Morning Shift" });
    expect(aPatch.status).toBe(200);
    expect(aPatch.body.name).toBe("Morning Shift");
  });
});
