import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
});

describe("Settings - Feature Flags", () => {
  it("GET /api/feature-flags returns array", async () => {
    const res = await agent.get("/api/feature-flags");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Settings - CRUD", () => {
  it("GET /api/settings returns the user's settings object", async () => {
    const res = await agent.get("/api/settings");
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe("object");
    expect(res.body).not.toBeNull();
  });

  it("PATCH /api/settings updates and persists settings", async () => {
    const res = await agent.patch("/api/settings").send({
      timezone: "Asia/Riyadh",
      currency: "SAR",
    });
    expect(res.status).toBe(200);
    expect(res.body.timezone).toBe("Asia/Riyadh");
    expect(res.body.currency).toBe("SAR");

    // Persisted on the next read.
    const after = await agent.get("/api/settings");
    expect(after.body.currency).toBe("SAR");
  });

  it("PATCH /api/settings rejects an invalid field type", async () => {
    const res = await agent.patch("/api/settings").send({ compactMode: "not-a-boolean" });
    expect(res.status).toBe(400);
  });
});

describe("Settings - Auth Guard", () => {
  it("GET /api/settings without auth returns 401", async () => {
    const { default: supertest } = await import("supertest");
    const res = await supertest(app).get("/api/settings");
    expect(res.status).toBe(401);
  });
});
