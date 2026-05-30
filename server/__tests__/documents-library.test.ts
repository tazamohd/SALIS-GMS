import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Document Library (DB-backed)", () => {
  it("POST /api/documents creates and GET /api/documents lists it", async () => {
    const create = await agent.post("/api/documents").send({
      name: `Test Doc ${Date.now()}`,
      type: "pdf",
      category: "invoices",
      size: 12345,
      tags: ["test", "vitest"],
      description: "Created by unit test",
    });
    expect([200, 201]).toContain(create.status);
    expect(create.body.id).toBeDefined();
    expect(create.body.category).toBe("invoices");

    const list = await agent.get("/api/documents");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    const ids = list.body.map((d: any) => d.id);
    expect(ids).toContain(create.body.id);
  });

  it("POST /api/documents rejects bad category", async () => {
    const res = await agent.post("/api/documents").send({
      name: "Bad",
      type: "pdf",
      category: "not-a-real-category",
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/documents/categories returns category list", async () => {
    const res = await agent.get("/api/documents/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(6);
  });
});
