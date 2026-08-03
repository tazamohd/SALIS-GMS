/**
 * All three provider types onboard through the same verified pipeline and show
 * up in the marketplace directory filtered by type: garage, parts_store,
 * insurance.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createTestApp } from "./setup";

let app: Express;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function onboard(app: Express, providerType: string, name: string) {
  const anon = supertestLib.agent(app);
  const res = await anon.post("/api/garage-applications").send({
    providerType, businessName: name, ownerName: "Owner", email: `${providerType}-${uniq()}@test.sa`,
    password: "OwnerPass123!", city: "Jeddah", country: "Saudi Arabia", requestedPlan: "STARTER",
    taxNumber: "311111111111113", commercialRegistration: "1011223344",
  });
  expect(res.status).toBe(201);
  expect(res.body.status).toBe("approved");
  return res.body.garageId as string;
}

let partsStoreId: string;
let insuranceId: string;
let partsStoreName: string;
let insuranceName: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  partsStoreName = `Parts Hub ${uniq()}`;
  insuranceName = `Shield Insurance ${uniq()}`;
  partsStoreId = await onboard(app, "parts_store", partsStoreName);
  insuranceId = await onboard(app, "insurance", insuranceName);
});

describe("provider types in the marketplace directory", () => {
  it("provisions a parts_store and lists it under type=parts_store", async () => {
    const anon = supertestLib.agent(app);
    const list = await anon.get("/api/marketplace/providers?type=parts_store");
    expect(list.status).toBe(200);
    const hit = list.body.find((p: any) => p.id === partsStoreId);
    expect(hit).toBeTruthy();
    expect(hit.providerType).toBe("parts_store");
    // Must not leak into a different type filter.
    const asGarage = await anon.get("/api/marketplace/providers?type=garage");
    expect(asGarage.body.some((p: any) => p.id === partsStoreId)).toBe(false);
  });

  it("provisions an insurance provider and lists it under type=insurance", async () => {
    const anon = supertestLib.agent(app);
    const list = await anon.get("/api/marketplace/providers?type=insurance");
    expect(list.status).toBe(200);
    const hit = list.body.find((p: any) => p.id === insuranceId);
    expect(hit).toBeTruthy();
    expect(hit.providerType).toBe("insurance");
  });

  it("returns the correct providerType on the detail view", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.get(`/api/marketplace/providers/${insuranceId}`);
    expect(res.status).toBe(200);
    expect(res.body.providerType).toBe("insurance");
  });

  it("smart search annotates each provider hit with its type", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.get(`/api/marketplace/find?q=${encodeURIComponent(partsStoreName.split(" ")[0])}`);
    expect(res.status).toBe(200);
    const hit = res.body.providers.find((p: any) => p.id === partsStoreId);
    expect(hit?.providerType).toBe("parts_store");
  });
});
