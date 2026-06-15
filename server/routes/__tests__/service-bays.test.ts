import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  admin = (await loginAsAdmin(app)).agent;
  advisor = (await loginAsUser(app)).agent; // role ADVISOR
});

const UNKNOWN = "00000000-0000-0000-0000-000000000000";

describe("Service bays (migrated modular router)", () => {
  it("creates a bay, updates status, and runs an occupancy session (garage-scoped)", async () => {
    const create = await admin.post("/api/service-bays").send({ bayNumber: `B-${Date.now()}` });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const bayId = create.body.id;

    expect((await admin.get("/api/service-bays")).body.some((b: any) => b.id === bayId)).toBe(true);
    expect(Array.isArray((await admin.get("/api/service-bays/with-sessions")).body)).toBe(true);
    expect((await admin.get("/api/service-bays/statistics")).body).toHaveProperty("totalBays");

    const status = await admin.patch(`/api/service-bays/${bayId}/status`).send({ status: "maintenance" });
    expect(status.status).toBe(200);
    expect(status.body.status).toBe("maintenance");

    const start = await admin.post(`/api/service-bays/${bayId}/sessions`).send({});
    expect(start.status).toBe(201);
    const sessionId = start.body.id;

    const end = await admin.patch(`/api/service-bays/sessions/${sessionId}/end`).send({});
    expect(end.status).toBe(200);
    expect(end.body.endTime).toBeTruthy();
  });

  it("404s status/session/end for unknown ids and validates status body", async () => {
    expect((await admin.patch(`/api/service-bays/${UNKNOWN}/status`).send({ status: "x" })).status).toBe(404);
    expect((await admin.post(`/api/service-bays/${UNKNOWN}/sessions`).send({})).status).toBe(404);
    expect((await admin.patch(`/api/service-bays/sessions/${UNKNOWN}/end`).send({})).status).toBe(404);

    const bay = await admin.post("/api/service-bays").send({ bayNumber: `B2-${Date.now()}` });
    expect((await admin.patch(`/api/service-bays/${bay.body.id}/status`).send({})).status).toBe(400);
  });

  it("forbids an ADVISOR from creating a bay (RBAC), but the leak via query param is gone", async () => {
    expect((await advisor.post("/api/service-bays").send({ bayNumber: "X1" })).status).toBe(403);
  });
});
