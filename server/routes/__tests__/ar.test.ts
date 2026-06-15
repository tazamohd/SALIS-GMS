import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;
let techId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  techId = a.user.id;
  advisor = (await loginAsUser(app)).agent; // role ADVISOR
});

describe("AR instructions (migrated, ADMIN/MANAGER mutations)", () => {
  it("does full CRUD as admin and 404s unknown / validates body", async () => {
    const create = await admin.post("/api/ar-instructions").send({ instructionName: "Brake AR guide" });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/ar-instructions")).body.some((r: any) => r.id === id)).toBe(true);
    expect((await admin.get(`/api/ar-instructions/${id}`)).status).toBe(200);

    const upd = await admin.patch(`/api/ar-instructions/${id}`).send({ instructionName: "Brake AR v2" });
    expect(upd.status).toBe(200);
    expect(upd.body.instructionName).toBe("Brake AR v2");

    expect((await admin.delete(`/api/ar-instructions/${id}`)).status).toBe(204);
    expect((await admin.get(`/api/ar-instructions/${id}`)).status).toBe(404);

    expect((await admin.post("/api/ar-instructions").send({})).status).toBe(400);
  });

  it("forbids an ADVISOR from creating instructions (RBAC)", async () => {
    expect((await advisor.post("/api/ar-instructions").send({ instructionName: "x" })).status).toBe(403);
  });
});

describe("AR sessions (migrated, authenticated only)", () => {
  it("creates, lists and updates a session scoped to the garage", async () => {
    const create = await admin.post("/api/ar-sessions").send({ technicianId: techId });
    expect(create.status).toBe(201);
    const id = create.body.id;
    expect((await admin.get("/api/ar-sessions")).body.some((r: any) => r.id === id)).toBe(true);
    const upd = await admin.patch(`/api/ar-sessions/${id}`).send({ technicianId: techId });
    expect(upd.status).toBe(200);
  });
});

describe("AR devices (migrated, authenticated only)", () => {
  it("creates, fetches, updates and deletes a device pairing", async () => {
    const create = await admin.post("/api/ar-devices").send({
      technicianId: techId,
      deviceId: `DEV-${Date.now()}`,
      deviceType: "hololens",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;
    expect((await admin.get(`/api/ar-devices/${id}`)).status).toBe(200);
    expect((await admin.patch(`/api/ar-devices/${id}`).send({ deviceType: "magic-leap" })).body.deviceType).toBe("magic-leap");
    expect((await admin.delete(`/api/ar-devices/${id}`)).status).toBe(204);
    expect((await admin.get(`/api/ar-devices/${id}`)).status).toBe(404);
  });
});
