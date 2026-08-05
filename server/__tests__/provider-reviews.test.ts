/**
 * Marketplace C3 — provider profiles + customer reviews.
 * Review gate: only a customer with a completed transaction may review; one
 * review per provider per customer (resubmit = update); aggregates surface in
 * the directory and detail.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { storage } from "../storage";

let app: Express;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

let providerAgent: supertest.Agent;
let providerId: string;
let cust: supertest.Agent;      // will transact -> may review
let custId = "";
let stranger: supertest.Agent;  // never transacted -> may not

beforeAll(async () => {
  app = (await createTestApp()).app;

  const email = `rev-prov-${uniq()}@test.sa`;
  const anon = supertestLib.agent(app);
  const submit = await anon.post("/api/garage-applications").send({
    providerType: "garage", businessName: `Review Motors ${uniq()}`, ownerName: "Owner", email,
    password: "OwnerPass123!", taxNumber: "311111111111113", commercialRegistration: "1011223344",
  });
  expect(submit.body.status).toBe("approved");
  providerId = submit.body.garageId;
  providerAgent = supertestLib.agent(app);
  await providerAgent.post("/api/login").send({ email, password: "OwnerPass123!" });

  cust = supertestLib.agent(app);
  const reg = await cust.post("/api/customer/register").send({ email: `rev-c-${uniq()}@test.sa`, password: "CustPass123!", fullName: "Reviewer" });
  custId = reg.body.id;
  stranger = supertestLib.agent(app);
  await stranger.post("/api/customer/register").send({ email: `rev-s-${uniq()}@test.sa`, password: "CustPass123!" });
}, 60000);

describe("provider profile", () => {
  it("provider edits its public profile; fields surface in the marketplace detail", async () => {
    const patch = await providerAgent.patch("/api/provider/profile").send({
      description: "Family-run garage since 2005",
      phone: "+966112223344",
      workingHours: "Sat–Thu 8:00–20:00",
    });
    expect(patch.status).toBe(200);
    expect(patch.body.description).toContain("Family-run");

    const anon = supertestLib.agent(app);
    const detail = await anon.get(`/api/marketplace/providers/${providerId}`);
    expect(detail.body.description).toContain("Family-run");
    expect(detail.body.workingHours).toContain("8:00");
    // A customer (no garage) cannot edit any provider profile.
    expect((await cust.patch("/api/provider/profile").send({ description: "hax" })).status).toBe(403);
  });
});

describe("reviews", () => {
  it("blocks reviews without a completed transaction, allows after one, and upserts", async () => {
    // No transaction yet -> 403.
    expect((await cust.post("/api/my/reviews").send({ providerId, rating: 5 })).status).toBe(403);

    // Complete a booking with this provider.
    const booking = await cust.post("/api/my/bookings").send({ providerId, notes: "review-gate" });
    expect(booking.status).toBe(201);
    expect((await providerAgent.patch(`/api/provider/bookings/${booking.body.id}`).send({ status: "completed" })).status).toBe(200);

    // Now the review lands.
    const first = await cust.post("/api/my/reviews").send({ providerId, rating: 4, comment: "Solid work" });
    expect(first.status).toBe(201);

    // Bad ratings rejected.
    expect((await cust.post("/api/my/reviews").send({ providerId, rating: 0 })).status).toBe(400);
    expect((await cust.post("/api/my/reviews").send({ providerId, rating: 6 })).status).toBe(400);

    // Resubmission updates rather than duplicates.
    const second = await cust.post("/api/my/reviews").send({ providerId, rating: 5, comment: "Even better second visit" });
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);

    // Stranger with no transaction still blocked.
    expect((await stranger.post("/api/my/reviews").send({ providerId, rating: 1 })).status).toBe(403);
  });

  it("aggregates surface in directory + detail + public reviews list", async () => {
    const anon = supertestLib.agent(app);
    const detail = await anon.get(`/api/marketplace/providers/${providerId}`);
    expect(detail.body.reviewCount).toBe(1);
    expect(Number(detail.body.avgRating)).toBe(5);
    expect(detail.body.reviews[0].comment).toContain("second visit");
    expect(detail.body.reviews[0].customerName).toBe("Reviewer");

    const list = await anon.get(`/api/marketplace/providers?q=Review Motors`);
    const hit = list.body.find((p: any) => p.id === providerId);
    expect(hit.reviewCount).toBe(1);
    expect(Number(hit.avgRating)).toBe(5);

    const reviews = await anon.get(`/api/marketplace/providers/${providerId}/reviews`);
    expect(reviews.status).toBe(200);
    expect(reviews.body.length).toBe(1);
  });
});
