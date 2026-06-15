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

function discountPayload() {
  return {
    code: `SAVE-${Date.now()}`,
    name: "Spring discount",
    discountType: "percentage",
    discountValue: "10",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-12-31T00:00:00.000Z",
  };
}

describe("Discounts (migrated modular router)", () => {
  it("creates, lists, fetches, updates, validates and deletes (garage-scoped)", async () => {
    const create = await admin.post("/api/discounts").send(discountPayload());
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    expect(create.body.createdBy).toBeTruthy();
    const id = create.body.id;
    const code = create.body.code;

    expect((await admin.get("/api/discounts")).body.some((d: any) => d.id === id)).toBe(true);
    expect((await admin.get(`/api/discounts/${id}`)).status).toBe(200);

    const upd = await admin.patch(`/api/discounts/${id}`).send({ name: "Spring v2" });
    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe("Spring v2");

    // validate uses the session garage, not a body param
    const validate = await admin.post("/api/discounts/validate").send({ code, amount: 100 });
    expect(validate.status).toBe(200);

    expect((await admin.delete(`/api/discounts/${id}`)).status).toBe(204);
    expect((await admin.get(`/api/discounts/${id}`)).status).toBe(404);
  });

  it("404s an unknown id and validates the create body", async () => {
    expect((await admin.get(`/api/discounts/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post("/api/discounts").send({ name: "no code" })).status).toBe(400);
  });

  it("forbids an ADVISOR from creating discounts (RBAC)", async () => {
    expect((await advisor.post("/api/discounts").send(discountPayload())).status).toBe(403);
  });
});
