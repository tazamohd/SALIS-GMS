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

describe("Service templates (/api/service-templates)", () => {
  let templateId: string;

  it("creates a template scoped to the caller's garage", async () => {
    const res = await agent.post("/api/service-templates").send({
      // garageId intentionally omitted — server injects it from the session.
      name: `Oil Change ${Date.now()}`,
      category: "maintenance",
      taskSteps: [{ step: 1, label: "Drain oil" }],
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.garageId).toBeTruthy();
    templateId = res.body.id;
  });

  it("rejects an invalid body (missing required fields)", async () => {
    const res = await agent.post("/api/service-templates").send({ name: "Incomplete" });
    expect(res.status).toBe(400);
  });

  it("lists templates for the caller's garage", async () => {
    const res = await agent.get("/api/service-templates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t: any) => t.id === templateId)).toBe(true);
  });

  it("fetches a single template by id", async () => {
    const res = await agent.get(`/api/service-templates/${templateId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(templateId);
  });

  it("updates a template", async () => {
    const res = await agent
      .put(`/api/service-templates/${templateId}`)
      .send({ description: "Updated description" });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe("Updated description");
  });

  it("returns 404 for a template in another garage / unknown id", async () => {
    const res = await agent.get(
      "/api/service-templates/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });

  it("deletes a template", async () => {
    const del = await agent.delete(`/api/service-templates/${templateId}`);
    expect(del.status).toBe(204);
    const get = await agent.get(`/api/service-templates/${templateId}`);
    expect(get.status).toBe(404);
  });
});
