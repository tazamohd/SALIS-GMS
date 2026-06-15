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

describe("Loyalty tiers (migrated modular router)", () => {
  it("creates, lists, fetches, updates and deletes a tier (garage-scoped)", async () => {
    const create = await admin.post("/api/loyalty-tiers").send({
      tierName: "Gold",
      minPoints: 1000,
    });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    const id = create.body.id;

    const list = await admin.get("/api/loyalty-tiers");
    expect(list.status).toBe(200);
    expect(list.body.some((t: any) => t.id === id)).toBe(true);

    expect((await admin.get(`/api/loyalty-tiers/${id}`)).status).toBe(200);

    const upd = await admin.patch(`/api/loyalty-tiers/${id}`).send({ tierName: "Platinum" });
    expect(upd.status).toBe(200);
    expect(upd.body.tierName).toBe("Platinum");

    expect((await admin.delete(`/api/loyalty-tiers/${id}`)).status).toBe(204);
    expect((await admin.get(`/api/loyalty-tiers/${id}`)).status).toBe(404);
  });

  it("404s an unknown id and validates the create body", async () => {
    expect((await admin.get("/api/loyalty-tiers/00000000-0000-0000-0000-000000000000")).status).toBe(404);
    expect((await admin.post("/api/loyalty-tiers").send({ minPoints: 5 })).status).toBe(400);
  });

  it("forbids an ADVISOR from mutating tiers (RBAC)", async () => {
    expect((await advisor.post("/api/loyalty-tiers").send({ tierName: "Bronze" })).status).toBe(403);
    expect((await advisor.delete("/api/loyalty-tiers/00000000-0000-0000-0000-000000000000")).status).toBe(403);
  });
});
