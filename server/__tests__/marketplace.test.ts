/**
 * Customer marketplace — platform-wide customer signup + public provider
 * directory + smart search. A provider is provisioned via the verified
 * onboarding path, given a service, then discovered anonymously.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { storage } from "../storage";

let app: Express;
let providerName: string;
let providerId: string;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;

  // Provision an approved provider (garage) through the verified onboarding path.
  const suffix = uniq();
  providerName = `Marketplace Motors ${suffix}`;
  const anon = supertestLib.agent(app);
  const submit = await anon.post("/api/garage-applications").send({
    businessName: providerName, ownerName: "MP Owner", email: `mp-owner-${suffix}@test.sa`,
    password: "OwnerPass123!", city: "Riyadh", country: "Saudi Arabia", requestedPlan: "PRO",
    taxNumber: "311111111111113", commercialRegistration: "1011223344",
  });
  expect(submit.status).toBe(201);
  expect(submit.body.status).toBe("approved");
  providerId = submit.body.garageId;

  // The provider presents a service.
  await storage.createServiceTemplate({
    garageId: providerId, name: "Premium Brake Replacement", category: "brakes",
    description: "Full brake pad + rotor service", standardCost: "450.00", isActive: true,
    taskSteps: ["inspect", "replace pads", "replace rotors"],
  } as any);
});

describe("customer platform signup", () => {
  it("registers a platform customer and starts a session", async () => {
    const email = `cust-${uniq()}@test.sa`;
    const agent = supertestLib.agent(app);
    const reg = await agent.post("/api/customer/register").send({
      email, password: "CustPass123!", fullName: "Cathy Customer", phone: "+966500000300",
    });
    expect(reg.status).toBe(201);
    expect(reg.body.userType).toBe("customer");
    expect(reg.body.password).toBeUndefined();

    // Duplicate email -> 409; weak password -> 400.
    expect((await supertestLib.agent(app).post("/api/customer/register").send({ email, password: "CustPass123!" })).status).toBe(409);
    expect((await supertestLib.agent(app).post("/api/customer/register").send({ email: `w-${uniq()}@t.sa`, password: "x" })).status).toBe(400);
  });
});

describe("public provider directory + smart search", () => {
  it("lists the provider anonymously and filters by name", async () => {
    const anon = supertestLib.agent(app);
    const list = await anon.get(`/api/marketplace/providers?q=${encodeURIComponent(providerName)}`);
    expect(list.status).toBe(200);
    const hit = list.body.find((p: any) => p.id === providerId);
    expect(hit).toBeTruthy();
    expect(hit.providerType).toBe("garage");
  });

  it("returns a provider detail with the services it presents", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.get(`/api/marketplace/providers/${providerId}`);
    expect(res.status).toBe(200);
    expect(res.body.services.some((s: any) => s.name === "Premium Brake Replacement")).toBe(true);
  });

  it("smart-searches a service and finds which provider offers it", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.get(`/api/marketplace/find?q=${encodeURIComponent("Brake")}`);
    expect(res.status).toBe(200);
    const svc = res.body.services.find((s: any) => s.providerId === providerId);
    expect(svc).toBeTruthy();
    expect(svc.providerName).toBe(providerName);
  });

  it("404s an unknown provider and 400s a too-short search", async () => {
    const anon = supertestLib.agent(app);
    expect((await anon.get(`/api/marketplace/providers/00000000-0000-0000-0000-000000000000`)).status).toBe(404);
    expect((await anon.get(`/api/marketplace/find?q=a`)).status).toBe(400);
  });
});
