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

describe("Loyalty offers (migrated modular router)", () => {
  it("creates, lists, fetches, updates and deletes an offer (garage-scoped)", async () => {
    const create = await admin.post("/api/loyalty-offers").send({
      offerName: "Spring Promo",
      offerType: "percentage_off",
    });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const id = create.body.id;

    const list = await admin.get("/api/loyalty-offers");
    expect(list.status).toBe(200);
    expect(list.body.some((o: any) => o.id === id)).toBe(true);

    const one = await admin.get(`/api/loyalty-offers/${id}`);
    expect(one.status).toBe(200);

    const upd = await admin.patch(`/api/loyalty-offers/${id}`).send({ offerName: "Spring Promo v2" });
    expect(upd.status).toBe(200);
    expect(upd.body.offerName).toBe("Spring Promo v2");

    const del = await admin.delete(`/api/loyalty-offers/${id}`);
    expect(del.status).toBe(204);
    expect((await admin.get(`/api/loyalty-offers/${id}`)).status).toBe(404);
  });

  it("404s an unknown/foreign offer id", async () => {
    const res = await admin.get("/api/loyalty-offers/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("validates the create body", async () => {
    const res = await admin.post("/api/loyalty-offers").send({ offerName: "missing type" });
    expect(res.status).toBe(400);
  });

  it("forbids an ADVISOR from creating or deleting offers (RBAC)", async () => {
    expect((await advisor.post("/api/loyalty-offers").send({ offerName: "x", offerType: "free_service" })).status).toBe(403);
    expect((await advisor.delete("/api/loyalty-offers/00000000-0000-0000-0000-000000000000")).status).toBe(403);
  });
});
