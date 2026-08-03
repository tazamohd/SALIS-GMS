/**
 * Marketplace C2 — product orders (parts store) + insurance-quote requests
 * (insurer), end to end with ownership scoping and notifications.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { storage } from "../storage";

let app: Express;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function onboardProvider(app: Express, providerType: string) {
  const email = `${providerType}-${uniq()}@test.sa`;
  const anon = supertestLib.agent(app);
  const submit = await anon.post("/api/garage-applications").send({
    providerType, businessName: `${providerType} ${uniq()}`, ownerName: "Owner", email,
    password: "OwnerPass123!", taxNumber: "311111111111113", commercialRegistration: "1011223344",
  });
  expect(submit.body.status).toBe("approved");
  const agent = supertestLib.agent(app);
  await agent.post("/api/login").send({ email, password: "OwnerPass123!" });
  return { agent, providerId: submit.body.garageId as string };
}

async function signupCustomer(app: Express) {
  const agent = supertestLib.agent(app);
  const reg = await agent.post("/api/customer/register").send({ email: `oq-${uniq()}@test.sa`, password: "CustPass123!" });
  expect(reg.status).toBe(201);
  return agent;
}

let partsAgent: supertest.Agent;
let partsId: string;
let insAgent: supertest.Agent;
let insId: string;
let cust: supertest.Agent;
let custB: supertest.Agent;
let productId: string;
let planId: string;
let vehId: string;

beforeAll(async () => {
  app = (await createTestApp()).app;
  const parts = await onboardProvider(app, "parts_store");
  partsAgent = parts.agent; partsId = parts.providerId;
  const ins = await onboardProvider(app, "insurance");
  insAgent = ins.agent; insId = ins.providerId;
  cust = await signupCustomer(app);
  custB = await signupCustomer(app);

  productId = (await storage.createProviderOffering({ providerId: partsId, kind: "product", name: "Oil Filter", price: "35.00" } as any)).id;
  planId = (await storage.createProviderOffering({ providerId: insId, kind: "insurance_plan", name: "Comprehensive Plan", price: "1200.00" } as any)).id;
  vehId = (await cust.post("/api/my/vehicles").send({ make: "Toyota", model: "Camry", year: 2022 })).body.id;
}, 60000);

describe("product orders", () => {
  let orderId: string;

  it("customer orders products (snapshotted, priced server-side); provider sees and confirms", async () => {
    const create = await cust.post("/api/my/orders").send({
      providerId: partsId,
      items: [{ offeringId: productId, quantity: 3 }],
      notes: "Deliver please",
    });
    expect(create.status).toBe(201);
    expect(create.body.status).toBe("pending");
    expect(create.body.totalAmount).toBe("105.00"); // 3 × 35, priced from the offering
    expect(create.body.items[0].name).toBe("Oil Filter");
    orderId = create.body.id;

    // Provider inbox + confirm.
    const inbox = await partsAgent.get("/api/provider/orders");
    expect(inbox.body.some((o: any) => o.id === orderId)).toBe(true);
    const confirm = await partsAgent.patch(`/api/provider/orders/${orderId}`).send({ status: "confirmed" });
    expect(confirm.status).toBe(200);

    // Customer sees the status + got a notification.
    const mine = await cust.get("/api/my/orders");
    expect(mine.body.find((o: any) => o.id === orderId).status).toBe("confirmed");
    const notifs = await cust.get("/api/my/notifications");
    expect(notifs.body.some((n: any) => n.metadata?.orderId === orderId)).toBe(true);
  });

  it("rejects foreign offerings, bad quantities, and cross-customer access", async () => {
    // A plan from the insurer is not sold by the parts store.
    expect((await cust.post("/api/my/orders").send({ providerId: partsId, items: [{ offeringId: planId, quantity: 1 }] })).status).toBe(400);
    expect((await cust.post("/api/my/orders").send({ providerId: partsId, items: [{ offeringId: productId, quantity: 0 }] })).status).toBe(400);
    // Another customer cannot see or cancel this order.
    expect((await custB.get("/api/my/orders")).body.some((o: any) => o.id === orderId)).toBe(false);
    expect((await custB.post(`/api/my/orders/${orderId}/cancel`)).status).toBe(404);
  });

  it("only the right provider can act; customer can cancel while open", async () => {
    expect((await insAgent.patch(`/api/provider/orders/${orderId}`).send({ status: "declined" })).status).toBe(404);
    const cancel = await cust.post(`/api/my/orders/${orderId}/cancel`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.status).toBe("cancelled");
  });
});

describe("insurance quotes", () => {
  let quoteId: string;

  it("customer requests a quote for a plan + vehicle; insurer quotes; customer accepts", async () => {
    const create = await cust.post("/api/my/quotes").send({
      providerId: insId, offeringId: planId, customerVehicleId: vehId,
    });
    expect(create.status).toBe(201);
    expect(create.body.planName).toBe("Comprehensive Plan");
    expect(create.body.vehicleMake).toBe("Toyota");
    quoteId = create.body.id;

    // Cannot accept before it's quoted.
    expect((await cust.post(`/api/my/quotes/${quoteId}/accept`)).status).toBe(404);

    // Insurer must supply a premium to quote.
    expect((await insAgent.post(`/api/provider/quotes/${quoteId}/respond`).send({ status: "quoted" })).status).toBe(400);
    const respond = await insAgent.post(`/api/provider/quotes/${quoteId}/respond`)
      .send({ status: "quoted", quotedPremium: "980.00", quoteNotes: "Includes roadside assistance" });
    expect(respond.status).toBe(200);
    expect(respond.body.status).toBe("quoted");

    // Customer got the notification and accepts.
    const notifs = await cust.get("/api/my/notifications");
    expect(notifs.body.some((n: any) => n.metadata?.quoteId === quoteId && n.metadata?.status === "quoted")).toBe(true);
    const accept = await cust.post(`/api/my/quotes/${quoteId}/accept`);
    expect(accept.status).toBe(200);
    expect(accept.body.status).toBe("accepted");
  });

  it("scopes quotes per provider and per customer", async () => {
    expect((await partsAgent.post(`/api/provider/quotes/${quoteId}/respond`).send({ status: "declined" })).status).toBe(404);
    expect((await custB.get("/api/my/quotes")).body.some((q: any) => q.id === quoteId)).toBe(false);
    // A plan the insurer doesn't offer (the parts product) is rejected.
    expect((await cust.post("/api/my/quotes").send({ providerId: insId, offeringId: productId })).status).toBe(400);
    // custB cannot use cust's vehicle.
    expect((await custB.post("/api/my/quotes").send({ providerId: insId, customerVehicleId: vehId })).status).toBe(400);
  });
});
