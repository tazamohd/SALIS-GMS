import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;
let customerId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const a = await loginAsAdmin(app);
  admin = a.agent;
  customerId = a.user.id; // customerId references users.id
  advisor = (await loginAsUser(app)).agent;
});

const UNKNOWN = "00000000-0000-0000-0000-000000000000";

function refundPayload() {
  return { customerId, amount: "50.00", refundMethod: "cash", reason: "Service not completed" };
}

describe("Refunds (migrated modular router)", () => {
  it("creates, lists, fetches, updates, approves and processes a refund", async () => {
    const create = await admin.post("/api/refunds").send(refundPayload());
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    expect(create.body.requestedBy).toBeTruthy();
    expect(create.body.refundNumber).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/refunds")).body.some((r: any) => r.id === id)).toBe(true);
    expect((await admin.get(`/api/refunds/${id}`)).status).toBe(200);

    expect((await admin.patch(`/api/refunds/${id}`).send({ reason: "Updated reason" })).status).toBe(200);

    const approve = await admin.post(`/api/refunds/${id}/approve`).send({});
    expect(approve.status).toBe(200);
    expect(approve.body.status).toBe("approved");

    const process = await admin.post(`/api/refunds/${id}/process`).send({});
    expect(process.status).toBe(200);
    expect(process.body.status).toBe("processed");
  });

  it("404s unknown ids and validates the create body", async () => {
    expect((await admin.get(`/api/refunds/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post(`/api/refunds/${UNKNOWN}/approve`).send({})).status).toBe(404);
    expect((await admin.post("/api/refunds").send({ amount: "1.00" })).status).toBe(400);
  });

  it("forbids an ADVISOR from approving/processing refunds (RBAC)", async () => {
    expect((await advisor.post(`/api/refunds/${UNKNOWN}/approve`).send({})).status).toBe(403);
    expect((await advisor.post(`/api/refunds/${UNKNOWN}/process`).send({})).status).toBe(403);
  });
});
