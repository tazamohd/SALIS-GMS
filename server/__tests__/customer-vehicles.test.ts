/**
 * Customer vehicles — a signed-in customer manages their own vehicles, fully
 * scoped to their user id (no cross-customer access). Scan endpoint falls back
 * cleanly when OCR is not configured.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createTestApp } from "./setup";

let app: Express;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function signupCustomer(app: Express) {
  const agent = supertestLib.agent(app);
  const email = `veh-cust-${uniq()}@test.sa`;
  const reg = await agent.post("/api/customer/register").send({ email, password: "CustPass123!", fullName: "Veh Cust" });
  expect(reg.status).toBe(201);
  return agent;
}

let custA: supertestLib.Agent;
let custB: supertestLib.Agent;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  custA = await signupCustomer(app);
  custB = await signupCustomer(app);
});

describe("customer vehicles", () => {
  it("adds, lists, updates and removes a vehicle", async () => {
    const add = await custA.post("/api/my/vehicles").send({
      make: "Toyota", model: "Camry", year: 2022, vin: "JT1234567890VIN01",
      licensePlate: "ABC-123", color: "White",
      insuranceProvider: "Tawuniya", insurancePolicyNumber: "POL-99",
    });
    expect(add.status).toBe(201);
    const id = add.body.id;
    expect(add.body.make).toBe("Toyota");

    const list = await custA.get("/api/my/vehicles");
    expect(list.status).toBe(200);
    expect(list.body.some((v: any) => v.id === id)).toBe(true);

    const patch = await custA.patch(`/api/my/vehicles/${id}`).send({ mileage: 45000, color: "Silver" });
    expect(patch.status).toBe(200);
    expect(patch.body.mileage).toBe(45000);
    expect(patch.body.color).toBe("Silver");

    const del = await custA.delete(`/api/my/vehicles/${id}`);
    expect(del.status).toBe(200);
    // Soft-deleted -> no longer listed.
    const after = await custA.get("/api/my/vehicles");
    expect(after.body.some((v: any) => v.id === id)).toBe(false);
  });

  it("does not let a customer see or edit another customer's vehicle", async () => {
    const add = await custA.post("/api/my/vehicles").send({ make: "Nissan", model: "Patrol", year: 2021 });
    const id = add.body.id;

    // B cannot see A's vehicle in their own list.
    const bList = await custB.get("/api/my/vehicles");
    expect(bList.body.some((v: any) => v.id === id)).toBe(false);

    // B cannot update or (effectively) delete A's vehicle.
    const bPatch = await custB.patch(`/api/my/vehicles/${id}`).send({ make: "Hacked" });
    expect(bPatch.status).toBe(404);

    await custB.delete(`/api/my/vehicles/${id}`); // scoped no-op
    const aStill = await custA.get("/api/my/vehicles");
    expect(aStill.body.find((v: any) => v.id === id)?.make).toBe("Nissan");
  });

  it("requires a make (400)", async () => {
    const res = await custA.post("/api/my/vehicles").send({ model: "NoMake" });
    expect(res.status).toBe(400);
  });

  it("scan falls back cleanly when OCR is not configured", async () => {
    const res = await custA.post("/api/my/vehicles/scan").send({ docType: "license" });
    expect(res.status).toBe(200);
    expect(res.body.ocrAvailable).toBe(false);
    // Bad docType -> 400.
    expect((await custA.post("/api/my/vehicles/scan").send({ docType: "nope" })).status).toBe(400);
  });

  it("scan extracts structured fields from supplied OCR text", async () => {
    const res = await custA.post("/api/my/vehicles/scan").send({
      docType: "license",
      rawText: "Make: Toyota Model Year 2022 Chassis 4T1BF1FK5GU123456 Plate ABC-1234",
    });
    expect(res.status).toBe(200);
    expect(res.body.ocrAvailable).toBe(true);
    expect(res.body.fields.make).toBe("Toyota");
    expect(res.body.fields.vin).toBe("4T1BF1FK5GU123456");
    expect(res.body.fields.year).toBe(2022);
  });

  it("requires authentication", async () => {
    const anon = supertestLib.agent(app);
    expect((await anon.get("/api/my/vehicles")).status).toBe(401);
  });
});
