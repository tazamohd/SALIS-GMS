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
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Job card tenant isolation", () => {
  const otherGarageId = "11111111-1111-1111-1111-111111111111";

  it("rejects listing another garage's job cards via ?garage_id=", async () => {
    const res = await agent.get(`/api/job-cards?garage_id=${otherGarageId}`);
    expect(res.status).toBe(403);
  });

  it("scopes the list to the caller's garage when no garage_id is given", async () => {
    const res = await agent.get("/api/job-cards");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 404 for a job card id outside the caller's garage", async () => {
    const res = await agent.get(
      "/api/job-cards/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when updating a job card outside the caller's garage", async () => {
    const res = await agent
      .put("/api/job-cards/00000000-0000-0000-0000-000000000000")
      .send({ status: "in_progress" });
    expect(res.status).toBe(404);
  });

  it("guards job-card sub-resources (parts, tasks) against foreign ids", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    expect((await agent.get(`/api/job-cards/${id}/parts`)).status).toBe(404);
    expect((await agent.get(`/api/job-cards/${id}/tasks`)).status).toBe(404);
    expect(
      (await agent.post(`/api/job-cards/${id}/tasks`).send({ title: "x" })).status,
    ).toBe(404);
  });
});
