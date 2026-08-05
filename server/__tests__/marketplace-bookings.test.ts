/**
 * Marketplace bookings — a customer books a provider for a service using one of
 * their vehicles; the provider sees and acts on it. Ownership is enforced on
 * both sides (customer only sees own bookings; provider only its own).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { loginAsPlatformAdmin } from "./helpers";
import { storage } from "../storage";

let app: Express;
let providerAgent: supertest.Agent; // the garage owner provisioned via onboarding
let providerId: string;
let serviceId: string;
let custA: supertest.Agent;
let custB: supertest.Agent;
let vehA: string;

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function signupCustomer(app: Express) {
  const agent = supertestLib.agent(app);
  const reg = await agent.post("/api/customer/register").send({ email: `bk-${uniq()}@test.sa`, password: "CustPass123!", fullName: "Bk Cust" });
  expect(reg.status).toBe(201);
  return agent;
}

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  await loginAsPlatformAdmin(app); // ensure app fully wired

  // Provision a provider via the verified onboarding path, then log in as owner.
  const email = `prov-${uniq()}@test.sa`;
  const anon = supertestLib.agent(app);
  const submit = await anon.post("/api/garage-applications").send({
    businessName: `Booking Motors ${uniq()}`, ownerName: "Owner", email, password: "OwnerPass123!",
    taxNumber: "311111111111113", commercialRegistration: "1011223344", requestedPlan: "PRO",
  });
  expect(submit.body.status).toBe("approved");
  providerId = submit.body.garageId;
  serviceId = (await storage.createServiceTemplate({
    garageId: providerId, name: "Oil Change", category: "maintenance", taskSteps: ["drain", "refill"], isActive: true,
  } as any)).id;

  providerAgent = supertestLib.agent(app);
  const login = await providerAgent.post("/api/login").send({ email, password: "OwnerPass123!" });
  expect(login.status).toBe(200);

  custA = await signupCustomer(app);
  custB = await signupCustomer(app);
  vehA = (await custA.post("/api/my/vehicles").send({ make: "Toyota", model: "Camry", year: 2022, licensePlate: "AAA-111" })).body.id;
});

describe("marketplace bookings", () => {
  let bookingId: string;

  it("a customer books a provider service with their vehicle (snapshotted)", async () => {
    const res = await custA.post("/api/my/bookings").send({
      providerId, serviceTemplateId: serviceId, customerVehicleId: vehA,
      preferredDate: new Date(Date.now() + 86400000).toISOString(), notes: "Morning please",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("requested");
    expect(res.body.serviceName).toBe("Oil Change");
    expect(res.body.vehicleMake).toBe("Toyota");
    expect(res.body.vehiclePlate).toBe("AAA-111");
    bookingId = res.body.id;

    const list = await custA.get("/api/my/bookings");
    expect(list.body.some((b: any) => b.id === bookingId)).toBe(true);
  });

  it("rejects a service not offered by the provider, and a vehicle not owned by the caller", async () => {
    expect((await custA.post("/api/my/bookings").send({ providerId, serviceTemplateId: "00000000-0000-0000-0000-000000000000" })).status).toBe(400);
    // custB tries to book with custA's vehicle.
    expect((await custB.post("/api/my/bookings").send({ providerId, customerVehicleId: vehA })).status).toBe(400);
  });

  it("shows the booking to the provider, who accepts it", async () => {
    const list = await providerAgent.get("/api/provider/bookings?status=requested");
    expect(list.status).toBe(200);
    expect(list.body.some((b: any) => b.id === bookingId)).toBe(true);

    const accept = await providerAgent.patch(`/api/provider/bookings/${bookingId}`).send({ status: "accepted", providerNotes: "See you at 9am" });
    expect(accept.status).toBe(200);
    expect(accept.body.status).toBe("accepted");
  });

  it("does not let another customer see or cancel someone else's booking", async () => {
    const bList = await custB.get("/api/my/bookings");
    expect(bList.body.some((b: any) => b.id === bookingId)).toBe(false);
    expect((await custB.post(`/api/my/bookings/${bookingId}/cancel`)).status).toBe(404);
  });

  it("notified the provider admin on request and the customer on acceptance (C1)", async () => {
    // Provider owner got an in-app notification for the new request.
    const provNotifs = await providerAgent.get("/api/my/notifications");
    expect(provNotifs.status).toBe(200);
    const provHit = provNotifs.body.find((n: any) => n.metadata?.bookingId === bookingId);
    expect(provHit).toBeTruthy();
    expect(provHit.title).toMatch(/booking request/i);

    // Customer got one when the provider accepted.
    const custNotifs = await custA.get("/api/my/notifications");
    const custHit = custNotifs.body.find((n: any) => n.metadata?.bookingId === bookingId && n.metadata?.status === "accepted");
    expect(custHit).toBeTruthy();

    // Mark-read works and is owner-scoped.
    const read = await custA.post(`/api/my/notifications/${custHit.id}/read`);
    expect(read.status).toBe(200);
    expect(read.body.status).toBe("read");
    expect((await custB.post(`/api/my/notifications/${provHit.id}/read`)).status).toBe(404);
  });

  it("lets the owning customer cancel their booking", async () => {
    const cancel = await custA.post(`/api/my/bookings/${bookingId}/cancel`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.status).toBe("cancelled");
  });

  it("requires a provider account for the provider endpoints", async () => {
    // A platform customer has no garageId -> 403 on provider endpoints.
    expect((await custA.get("/api/provider/bookings")).status).toBe(403);
  });
});
