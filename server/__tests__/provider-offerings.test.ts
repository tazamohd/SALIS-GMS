/**
 * Provider offerings — a provider manages the products/plans it presents, scoped
 * to its own garage; the offerings surface in the public marketplace directory
 * and smart search.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";

let app: Express;
let partsAgent: supertest.Agent;   // owner of a parts_store provider
let partsProviderId: string;
let otherAgent: supertest.Agent;   // owner of a different provider
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function onboardProvider(app: Express, providerType: string, name: string) {
  const email = `${providerType}-${uniq()}@test.sa`;
  const anon = supertestLib.agent(app);
  const submit = await anon.post("/api/garage-applications").send({
    providerType, businessName: name, ownerName: "Owner", email, password: "OwnerPass123!",
    taxNumber: "311111111111113", commercialRegistration: "1011223344", requestedPlan: "PRO",
  });
  expect(submit.body.status).toBe("approved");
  const agent = supertestLib.agent(app);
  await agent.post("/api/login").send({ email, password: "OwnerPass123!" });
  return { agent, providerId: submit.body.garageId as string };
}

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const parts = await onboardProvider(app, "parts_store", `Parts Hub ${uniq()}`);
  partsAgent = parts.agent;
  partsProviderId = parts.providerId;
  otherAgent = (await onboardProvider(app, "garage", `Other Garage ${uniq()}`)).agent;
}, 30000);

describe("provider offerings", () => {
  let offeringId: string;
  const productName = `Brake Pad Set ${uniq()}`;

  it("creates, lists and updates an offering (scoped to the provider)", async () => {
    const create = await partsAgent.post("/api/provider/offerings").send({
      kind: "product", name: productName, category: "brakes", description: "OEM pads", price: "120.00",
    });
    expect(create.status).toBe(201);
    expect(create.body.kind).toBe("product");
    offeringId = create.body.id;

    const list = await partsAgent.get("/api/provider/offerings");
    expect(list.status).toBe(200);
    expect(list.body.some((o: any) => o.id === offeringId)).toBe(true);

    const patch = await partsAgent.patch(`/api/provider/offerings/${offeringId}`).send({ price: "99.00" });
    expect(patch.status).toBe(200);
    expect(String(patch.body.price)).toBe("99.00");
  });

  it("surfaces the offering in the public provider detail + smart search", async () => {
    const anon = supertestLib.agent(app);
    const detail = await anon.get(`/api/marketplace/providers/${partsProviderId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.offerings.some((o: any) => o.id === offeringId)).toBe(true);

    const search = await anon.get(`/api/marketplace/find?q=${encodeURIComponent("Brake Pad")}`);
    expect(search.status).toBe(200);
    const hit = search.body.offerings.find((o: any) => o.providerId === partsProviderId);
    expect(hit).toBeTruthy();
    expect(hit.kind).toBe("product");
  });

  it("does not let another provider update or delete the offering", async () => {
    const bPatch = await otherAgent.patch(`/api/provider/offerings/${offeringId}`).send({ price: "1.00" });
    expect(bPatch.status).toBe(404);
    await otherAgent.delete(`/api/provider/offerings/${offeringId}`); // scoped no-op
    // Still there for the owner.
    expect((await partsAgent.get("/api/provider/offerings")).body.some((o: any) => o.id === offeringId)).toBe(true);
  });

  it("requires a provider account (403) and a name (400)", async () => {
    const customer = supertestLib.agent(app);
    await customer.post("/api/customer/register").send({ email: `oc-${uniq()}@test.sa`, password: "CustPass123!" });
    expect((await customer.get("/api/provider/offerings")).status).toBe(403);
    expect((await partsAgent.post("/api/provider/offerings").send({ kind: "product" })).status).toBe(400);
  });

  it("removes the offering", async () => {
    const del = await partsAgent.delete(`/api/provider/offerings/${offeringId}`);
    expect(del.status).toBe(200);
    expect((await partsAgent.get("/api/provider/offerings")).body.some((o: any) => o.id === offeringId)).toBe(false);
  });
});
