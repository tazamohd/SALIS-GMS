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

describe("Replenishment orders (migrated modular router)", () => {
  it("creates, lists, fetches, updates and approves an order (garage-scoped)", async () => {
    const create = await admin.post("/api/replenishment-orders").send({
      orderNumber: `RO-${Date.now()}`,
    });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/replenishment-orders")).body.some((o: any) => o.id === id)).toBe(true);
    expect((await admin.get(`/api/replenishment-orders/${id}`)).status).toBe(200);

    const upd = await admin.patch(`/api/replenishment-orders/${id}`).send({ status: "ordered" });
    expect(upd.status).toBe(200);

    const approve = await admin.post(`/api/replenishment-orders/${id}/approve`).send({});
    expect(approve.status).toBe(200);
  });

  it("404s unknown ids and validates the create body", async () => {
    expect((await admin.get(`/api/replenishment-orders/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post(`/api/replenishment-orders/${UNKNOWN}/approve`).send({})).status).toBe(404);
    expect((await admin.post("/api/replenishment-orders").send({})).status).toBe(400);
  });

  it("forbids an ADVISOR from creating or approving orders (RBAC)", async () => {
    expect((await advisor.post("/api/replenishment-orders").send({ orderNumber: "X" })).status).toBe(403);
    expect((await advisor.post(`/api/replenishment-orders/${UNKNOWN}/approve`).send({})).status).toBe(403);
  });
});
