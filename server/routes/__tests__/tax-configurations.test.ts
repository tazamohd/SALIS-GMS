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

function taxPayload() {
  return { taxName: "VAT", taxType: "percentage", taxRate: "15" };
}

describe("Tax configurations (migrated modular router)", () => {
  it("creates, lists, fetches, updates and deletes (garage-scoped)", async () => {
    const create = await admin.post("/api/tax-configurations").send(taxPayload());
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    expect(create.body.createdBy).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/tax-configurations")).body.some((c: any) => c.id === id)).toBe(true);
    expect((await admin.get(`/api/tax-configurations/${id}`)).status).toBe(200);

    const upd = await admin.patch(`/api/tax-configurations/${id}`).send({ taxName: "VAT 15%" });
    expect(upd.status).toBe(200);
    expect(upd.body.taxName).toBe("VAT 15%");

    expect((await admin.delete(`/api/tax-configurations/${id}`)).status).toBe(204);
    expect((await admin.get(`/api/tax-configurations/${id}`)).status).toBe(404);
  });

  it("404s an unknown id and validates the create body", async () => {
    expect((await admin.get(`/api/tax-configurations/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post("/api/tax-configurations").send({ taxName: "incomplete" })).status).toBe(400);
  });

  it("forbids an ADVISOR from creating tax configs (RBAC)", async () => {
    expect((await advisor.post("/api/tax-configurations").send(taxPayload())).status).toBe(403);
  });
});
