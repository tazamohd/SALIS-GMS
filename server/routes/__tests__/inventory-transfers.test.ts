import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;
let garageId: string;
let partId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  garageId = a.garageId;
  advisor = (await loginAsUser(app)).agent;
  const part = await admin.post("/api/spare-parts").send({
    name: "Brake Pad",
    category: "brakes",
    sku: `SKU-${Date.now()}`,
  });
  partId = part.body.id;
});

const UNKNOWN = "00000000-0000-0000-0000-000000000000";

function transferPayload() {
  return { sparePartId: partId, fromGarageId: garageId, toGarageId: garageId, quantity: 5 };
}

describe("Inventory transfers (migrated modular router)", () => {
  it("creates, lists, fetches, updates, approves and completes a transfer", async () => {
    const create = await admin.post("/api/inventory-transfers").send(transferPayload());
    expect(create.status).toBe(201);
    expect(create.body.requestedBy).toBeTruthy();
    expect(create.body.transferNumber).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/inventory-transfers")).body.some((t: any) => t.id === id)).toBe(true);
    expect((await admin.get(`/api/inventory-transfers/${id}`)).status).toBe(200);

    expect((await admin.patch(`/api/inventory-transfers/${id}`).send({ quantity: 8 })).status).toBe(200);
    expect((await admin.post(`/api/inventory-transfers/${id}/approve`).send({})).status).toBe(200);
    expect((await admin.post(`/api/inventory-transfers/${id}/complete`).send({})).status).toBe(200);
  });

  it("404s unknown ids and validates the create body", async () => {
    expect((await admin.get(`/api/inventory-transfers/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post(`/api/inventory-transfers/${UNKNOWN}/approve`).send({})).status).toBe(404);
    expect((await admin.post("/api/inventory-transfers").send({ quantity: 1 })).status).toBe(400);
  });

  it("rejects a transfer that does not involve the caller's garage (403)", async () => {
    const res = await admin.post("/api/inventory-transfers").send({
      sparePartId: partId,
      fromGarageId: UNKNOWN,
      toGarageId: UNKNOWN,
      quantity: 1,
    });
    expect(res.status).toBe(403);
  });

  it("forbids an ADVISOR from approving/updating transfers (RBAC)", async () => {
    expect((await advisor.patch(`/api/inventory-transfers/${UNKNOWN}`).send({ quantity: 1 })).status).toBe(403);
    expect((await advisor.post(`/api/inventory-transfers/${UNKNOWN}/approve`).send({})).status).toBe(403);
  });
});
