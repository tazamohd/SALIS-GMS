import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  agent = (await loginAsAdmin(app)).agent;
});

describe("Manager approvals (DB-backed)", () => {
  it("creates, lists, and resolves an approval scoped to the garage", async () => {
    const create = await agent.post("/api/mobile/manager/approvals").send({
      type: "estimate",
      title: "Estimate for #1234",
      amount: "450.00",
    });
    expect(create.status).toBe(201);
    expect(create.body.status).toBe("pending");
    const id = create.body.id;

    const pending = await agent.get("/api/mobile/manager/approvals");
    expect(pending.status).toBe(200);
    expect(pending.body.some((a: any) => a.id === id)).toBe(true);

    const approve = await agent
      .patch(`/api/mobile/manager/approvals/${id}`)
      .send({ action: "approve", notes: "ok" });
    expect(approve.status).toBe(200);
    expect(approve.body.status).toBe("approved");

    // No longer in the default (pending) list
    const afterPending = await agent.get("/api/mobile/manager/approvals");
    expect(afterPending.body.some((a: any) => a.id === id)).toBe(false);
  });

  it("rejects an invalid action and an unknown id", async () => {
    const bad = await agent
      .patch("/api/mobile/manager/approvals/00000000-0000-0000-0000-000000000000")
      .send({ action: "nope" });
    expect(bad.status).toBe(400);

    const nf = await agent
      .patch("/api/mobile/manager/approvals/00000000-0000-0000-0000-000000000000")
      .send({ action: "approve" });
    expect(nf.status).toBe(404);
  });
});

describe("Manager alerts (DB-backed)", () => {
  it("creates, lists, and resolves an alert", async () => {
    const create = await agent.post("/api/mobile/manager/alerts").send({
      type: "inventory",
      severity: "high",
      message: "Low stock: oil filters",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const list = await agent.get("/api/mobile/manager/alerts");
    expect(list.body.some((a: any) => a.id === id)).toBe(true);

    const resolve = await agent.patch(`/api/mobile/manager/alerts/${id}/resolve`);
    expect(resolve.status).toBe(200);

    const after = await agent.get("/api/mobile/manager/alerts");
    expect(after.body.some((a: any) => a.id === id)).toBe(false);
  });
});
