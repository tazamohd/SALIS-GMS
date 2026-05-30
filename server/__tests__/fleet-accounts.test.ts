import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import { createTestApp } from "./setup";
import supertest from "supertest";

let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("Fleet Accounts (DB-backed)", () => {
  it("POST /api/fleet/accounts creates and GET lists it", async () => {
    const create = await supertest(app).post("/api/fleet/accounts").send({
      companyName: `Test Fleet ${Date.now()}`,
      contactPerson: "Test Contact",
      contactEmail: "fleet@test.sa",
      contactPhone: "+966500000000",
      discountPercentage: 5,
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.account?.id).toBeDefined();
    expect(create.body.account.vehicleCount).toBe(0);

    const list = await supertest(app).get("/api/fleet/accounts");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.accounts)).toBe(true);
    const ids = list.body.accounts.map((a: any) => a.id);
    expect(ids).toContain(create.body.account.id);
  });

  it("POST /api/fleet/accounts rejects missing companyName", async () => {
    const res = await supertest(app).post("/api/fleet/accounts").send({ contactPerson: "x" });
    expect(res.status).toBe(400);
  });

  it("GET /api/fleet/vehicles returns array", async () => {
    const res = await supertest(app).get("/api/fleet/vehicles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });
});
