/**
 * Platform SuperAdmin — garage onboarding applications, end to end:
 *   public submit -> PLATFORM_ADMIN lists pending -> approve (provisions garage
 *   + owner + trial sub, owner can log in with the temp password) / reject.
 * Access control: garage-level ADMIN cannot reach the review endpoints.
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

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  platform = (await loginAsPlatformAdmin(app)).agent;
  garageAdmin = (await loginAsAdmin(app)).agent;
});

describe("garage onboarding applications", () => {
  it("accepts a public application, then a platform admin approves and provisions a working login", async () => {
    const email = `newgarage-${uniq()}@test.sa`;
    const anon = supertestLib.agent(app);

    const submit = await anon.post("/api/garage-applications").send({
      businessName: "Fresh Auto Care", ownerName: "Sara Owner", email,
      phone: "+966500000200", city: "Riyadh", country: "Saudi Arabia", requestedPlan: "PRO",
    });
    expect(submit.status).toBe(201);
    const appId = submit.body.id;
    expect(appId).toBeTruthy();

    // A garage-level ADMIN must NOT see or act on the review queue.
    expect((await garageAdmin.get("/api/platform-admin/garage-applications")).status).toBe(403);
    expect((await garageAdmin.post(`/api/platform-admin/garage-applications/${appId}/approve`)).status).toBe(403);

    // Platform admin sees it pending.
    const list = await platform.get("/api/platform-admin/garage-applications?status=pending");
    expect(list.status).toBe(200);
    expect(list.body.some((a: any) => a.id === appId)).toBe(true);

    // Approve -> provisions garage + owner + trial sub, returns a temp password.
    const approve = await platform.post(`/api/platform-admin/garage-applications/${appId}/approve`);
    expect(approve.status).toBe(200);
    expect(approve.body.garageId).toBeTruthy();
    expect(approve.body.tempPassword).toBeTruthy();
    expect(approve.body.application.status).toBe("approved");

    // The provisioned owner can now log in with the temp password.
    const ownerAgent = supertestLib.agent(app);
    const login = await ownerAgent.post("/api/login").send({ email, password: approve.body.tempPassword });
    expect(login.status).toBe(200);
    expect(login.body.role).toBe("ADMIN");
    expect(login.body.garageId).toBe(approve.body.garageId);
  });

  it("rejects duplicate email submissions with 409", async () => {
    const email = `dupe-${uniq()}@test.sa`;
    const anon = supertestLib.agent(app);
    const base = { businessName: "Dup Garage", ownerName: "Dee", email, requestedPlan: "STARTER" };

    expect((await anon.post("/api/garage-applications").send(base)).status).toBe(201);
    // Second submission with the same email while the first is still pending.
    expect((await anon.post("/api/garage-applications").send(base)).status).toBe(409);
  });

  it("lets a platform admin reject a pending application", async () => {
    const email = `reject-${uniq()}@test.sa`;
    const anon = supertestLib.agent(app);
    const submit = await anon.post("/api/garage-applications").send({
      businessName: "Nope Garage", ownerName: "Ray", email, requestedPlan: "STARTER",
    });
    const appId = submit.body.id;

    const reject = await platform.post(`/api/platform-admin/garage-applications/${appId}/reject`).send({ reason: "Incomplete docs" });
    expect(reject.status).toBe(200);
    expect(reject.body.status).toBe("rejected");

    // Approving a rejected application is refused.
    const approve = await platform.post(`/api/platform-admin/garage-applications/${appId}/approve`);
    expect(approve.status).toBe(409);
  });

  it("requires businessName/ownerName/email (400)", async () => {
    const anon = supertestLib.agent(app);
    const res = await anon.post("/api/garage-applications").send({ businessName: "Missing Fields" });
    expect(res.status).toBe(400);
  });
});
