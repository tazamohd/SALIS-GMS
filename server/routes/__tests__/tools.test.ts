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

describe("Tools catalogue (/api/tools)", () => {
  let toolId: string;

  it("creates a tool (createdBy from session)", async () => {
    const res = await agent.post("/api/tools").send({
      name: `Torque Wrench ${Date.now()}`,
      toolType: "mechanical",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.createdBy).toBeTruthy();
    toolId = res.body.id;
  });

  it("rejects an invalid body (missing required toolType)", async () => {
    const res = await agent.post("/api/tools").send({ name: "No type" });
    expect(res.status).toBe(400);
  });

  it("lists tools including the new one", async () => {
    const res = await agent.get("/api/tools");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t: any) => t.id === toolId)).toBe(true);
  });

  it("fetches a tool by id, 404 for unknown", async () => {
    const ok = await agent.get(`/api/tools/${toolId}`);
    expect(ok.status).toBe(200);
    const missing = await agent.get("/api/tools/00000000-0000-0000-0000-000000000000");
    expect(missing.status).toBe(404);
  });

  it("updates a tool", async () => {
    const res = await agent.put(`/api/tools/${toolId}`).send({ brand: "Bosch" });
    expect(res.status).toBe(200);
    expect(res.body.brand).toBe("Bosch");
  });
});
