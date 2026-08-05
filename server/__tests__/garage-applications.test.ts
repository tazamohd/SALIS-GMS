/**
 * Platform SuperAdmin — provider onboarding with automated government-identifier
 * verification (ZATCA VAT + commercial registration / Sejel):
 *   - verified identifiers  -> AUTO-APPROVED + provisioned, owner logs in at once
 *   - well-formed but unconfirmed -> PENDING manual review -> approve -> login
 *   - bad-format identifiers -> 400
 * Access control: a garage-level ADMIN cannot reach the review endpoints.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, loginAsPlatformAdmin } from "./helpers";

let app: Express;
let platform: supertest.Agent;
let garageAdmin: supertest.Agent;

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

// Well-formed, non-blocklisted identifiers => stub registry "found" => verified.
const VERIFIED_TAX = "311111111111113";
const VERIFIED_CR = "1011223344";
// Well-formed but blocklisted (both end 0000) => registry "not found" => manual_review.
const REVIEW_TAX = "300000000000000";
const REVIEW_CR = "1234560000";

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  platform = (await loginAsPlatformAdmin(app)).agent;
  garageAdmin = (await loginAsAdmin(app)).agent;
});

describe("provider onboarding — automated verification + auto-approve", () => {
  it("auto-approves a verified business and provisions an immediate owner login", async () => {
    const email = `verified-${uniq()}@test.sa`;
    const password = "OwnerPass123!";
    const anon = supertestLib.agent(app);

    const submit = await anon.post("/api/garage-applications").send({
      businessName: "Verified Auto Care", ownerName: "Sara Owner", email, password,
      phone: "+966500000200", city: "Riyadh", country: "Saudi Arabia", requestedPlan: "PRO",
      taxNumber: VERIFIED_TAX, commercialRegistration: VERIFIED_CR,
    });
    expect(submit.status).toBe(201);
    expect(submit.body.status).toBe("approved");
    expect(submit.body.autoApproved).toBe(true);
    expect(submit.body.garageId).toBeTruthy();
    expect(submit.body.verification.status).toBe("verified");

    // Owner logs in immediately with the password they chose — no manual step.
    const owner = supertestLib.agent(app);
    const login = await owner.post("/api/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.role).toBe("ADMIN");
    expect(login.body.garageId).toBe(submit.body.garageId);
  });

  it("routes a well-formed but unconfirmed business to manual review, then approves", async () => {
    const email = `review-${uniq()}@test.sa`;
    const password = "OwnerPass123!";
    const anon = supertestLib.agent(app);

    const submit = await anon.post("/api/garage-applications").send({
      businessName: "Needs Review Garage", ownerName: "Ray", email, password,
      requestedPlan: "STARTER", taxNumber: REVIEW_TAX, commercialRegistration: REVIEW_CR,
    });
    expect(submit.status).toBe(201);
    expect(submit.body.status).toBe("pending");
    expect(submit.body.verification.status).toBe("manual_review");
    const appId = submit.body.id;

    // Garage-level ADMIN cannot see or act on the review queue.
    expect((await garageAdmin.get("/api/platform-admin/garage-applications")).status).toBe(403);
    expect((await garageAdmin.post(`/api/platform-admin/garage-applications/${appId}/approve`)).status).toBe(403);

    const list = await platform.get("/api/platform-admin/garage-applications?status=pending");
    expect(list.status).toBe(200);
    expect(list.body.some((a: any) => a.id === appId)).toBe(true);

    const approve = await platform.post(`/api/platform-admin/garage-applications/${appId}/approve`);
    expect(approve.status).toBe(200);
    expect(approve.body.garageId).toBeTruthy();
    // No temp password — the applicant already set one at signup.
    expect(approve.body.tempPassword).toBeUndefined();

    const owner = supertestLib.agent(app);
    const login = await owner.post("/api/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.garageId).toBe(approve.body.garageId);
  });

  it("rejects bad-format identifiers with 400", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.post("/api/garage-applications").send({
      businessName: "Bad Format", ownerName: "Nope", email: `bad-${uniq()}@test.sa`,
      password: "OwnerPass123!", taxNumber: "123", commercialRegistration: "abc",
    });
    expect(res.status).toBe(400);
  });

  it("requires tax number + commercial registration", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.post("/api/garage-applications").send({
      businessName: "No IDs", ownerName: "Missing", email: `noids-${uniq()}@test.sa`, password: "OwnerPass123!",
    });
    expect(res.status).toBe(400);
  });

  it("requires an 8+ char password", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.post("/api/garage-applications").send({
      businessName: "Weak Pw", ownerName: "Short", email: `weak-${uniq()}@test.sa`,
      password: "x", taxNumber: VERIFIED_TAX, commercialRegistration: VERIFIED_CR,
    });
    expect(res.status).toBe(400);
  });

  it("rejects a platform admin rejecting then re-approving (409)", async () => {
    const email = `rej-${uniq()}@test.sa`;
    const anon = supertestLib.agent(app);
    const submit = await anon.post("/api/garage-applications").send({
      businessName: "Reject Me", ownerName: "Rj", email, password: "OwnerPass123!",
      taxNumber: REVIEW_TAX, commercialRegistration: REVIEW_CR,
    });
    const appId = submit.body.id;
    const reject = await platform.post(`/api/platform-admin/garage-applications/${appId}/reject`).send({ reason: "Docs" });
    expect(reject.status).toBe(200);
    expect(reject.body.status).toBe("rejected");
    expect((await platform.post(`/api/platform-admin/garage-applications/${appId}/approve`)).status).toBe(409);
  });
});
