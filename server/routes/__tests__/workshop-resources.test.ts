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

describe("Workshop resources (migrated modular router)", () => {
  it("creates, lists, fetches, updates and deletes a resource (garage-scoped)", async () => {
    const create = await admin.post("/api/workshop-resources").send({
      resourceType: "bay",
      resourceId: "BAY-1",
      resourceName: "Bay 1",
    });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const id = create.body.id;

    const list = await admin.get("/api/workshop-resources");
    expect(list.status).toBe(200);
    expect(list.body.some((r: any) => r.id === id)).toBe(true);

    expect((await admin.get(`/api/workshop-resources/${id}`)).status).toBe(200);

    const upd = await admin.patch(`/api/workshop-resources/${id}`).send({ resourceName: "Bay 1A" });
    expect(upd.status).toBe(200);
    expect(upd.body.resourceName).toBe("Bay 1A");

    expect((await admin.delete(`/api/workshop-resources/${id}`)).status).toBe(204);
    expect((await admin.get(`/api/workshop-resources/${id}`)).status).toBe(404);
  });

  it("404s an unknown id and validates the create body", async () => {
    expect((await admin.get("/api/workshop-resources/00000000-0000-0000-0000-000000000000")).status).toBe(404);
    expect((await admin.post("/api/workshop-resources").send({ resourceName: "no type" })).status).toBe(400);
  });

  it("forbids an ADVISOR from mutating resources (RBAC)", async () => {
    expect(
      (await advisor.post("/api/workshop-resources").send({ resourceType: "lift", resourceId: "L1", resourceName: "Lift 1" })).status,
    ).toBe(403);
    expect((await advisor.delete("/api/workshop-resources/00000000-0000-0000-0000-000000000000")).status).toBe(403);
  });
});
