/**
 * Business profile & guided setup: the business can edit its own identity,
 * branding and document preferences, cannot set what onboarding/approval owns,
 * and the endpoints are closed to anonymous callers.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, unauthenticatedAgent } from "./helpers";

let app: Express;
let admin: supertest.Agent;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  admin = (await loginAsAdmin(app)).agent;
});

describe("business profile", () => {
  it("returns the profile with the setup steps", async () => {
    const res = await admin.get("/api/business/profile");
    expect(res.status).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(res.body.steps).toContain("branding");
  });

  it("saves branding and document preferences", async () => {
    const res = await admin.patch("/api/business/profile").send({
      brandPrimaryColor: "#123456",
      brandSecondaryColor: "#654321",
      invoiceSettings: { template: "modern", paperSize: "A5", showQrCode: true, invoicePrefix: "SAL" },
    });
    expect(res.status).toBe(200);
    expect(res.body.brandPrimaryColor).toBe("#123456");
    expect(res.body.invoiceSettings.template).toBe("modern");
    expect(res.body.invoiceSettings.invoicePrefix).toBe("SAL");
  });

  it("rejects malformed identifiers and colours", async () => {
    expect((await admin.patch("/api/business/profile").send({ taxNumber: "12345" })).status).toBe(400);
    expect((await admin.patch("/api/business/profile").send({ commercialRegistration: "abc" })).status).toBe(400);
    expect((await admin.patch("/api/business/profile").send({ brandPrimaryColor: "blue" })).status).toBe(400);
  });

  it("ignores fields the business does not own", async () => {
    const res = await admin.patch("/api/business/profile").send({
      subscriptionPlan: "ENTERPRISE",
      businessType: "insurance",
      staffJoinCode: "HACKED",
      name: "Renamed Workshop",
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed Workshop");
    expect(res.body.subscriptionPlan).not.toBe("ENTERPRISE");
    expect(res.body.staffJoinCode).not.toBe("HACKED");
  });

  it("records the setup cursor and completion", async () => {
    expect((await admin.post("/api/business/onboarding/step").send({ step: "nope" })).status).toBe(400);

    const step = await admin.post("/api/business/onboarding/step").send({ step: "documents" });
    expect(step.status).toBe(200);
    expect(step.body.onboardingStep).toBe("documents");

    const done = await admin.post("/api/business/onboarding/complete");
    expect(done.status).toBe(200);
    expect(done.body.onboardingComplete).toBe(true);
  });

  it("is closed to anonymous callers", async () => {
    const anon = unauthenticatedAgent(app);
    expect((await anon.get("/api/business/profile")).status).toBe(401);
    expect((await anon.patch("/api/business/profile").send({ name: "x" })).status).toBe(401);
  });
});
