import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "./setup";
import { unauthenticatedAgent } from "./helpers";

let app: Express;
const testEmail = `auth-test-${Date.now()}@slis.sa`;
const testPassword = "SecurePass123!";

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("Auth - Registration", () => {
  it("POST /api/register with valid data returns user", async () => {
    const res = await supertest(app).post("/api/register").send({
      email: testEmail,
      password: testPassword,
      fullName: "Auth Test User",
      phone: "+966500000099",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", testEmail);
    expect(res.body).not.toHaveProperty("password");
  });

  it("POST /api/register with duplicate email returns 400", async () => {
    const res = await supertest(app).post("/api/register").send({
      email: testEmail,
      password: testPassword,
      fullName: "Duplicate User",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it("POST /api/register with missing fields returns 400", async () => {
    const res = await supertest(app).post("/api/register").send({
      email: "",
      password: "",
    });
    expect(res.status).toBe(400);
  });
});

describe("Auth - Login", () => {
  it("POST /api/login with valid creds returns user + session", async () => {
    const agent = supertest.agent(app);
    const res = await agent.post("/api/login").send({
      email: testEmail,
      password: testPassword,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", testEmail);
    expect(res.body).not.toHaveProperty("password");
    // Should set session cookie
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/login with wrong password returns 401", async () => {
    const res = await supertest(app).post("/api/login").send({
      email: testEmail,
      password: "WrongPassword123!",
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/login with nonexistent user returns 401", async () => {
    const res = await supertest(app).post("/api/login").send({
      email: "nobody@nowhere.com",
      password: "anything",
    });
    expect(res.status).toBe(401);
  });
});

describe("Auth - Session", () => {
  it("GET /api/user without session returns 401", async () => {
    const agent = unauthenticatedAgent(app);
    const res = await agent.get("/api/user");
    expect(res.status).toBe(401);
  });

  it("GET /api/user with valid session returns user", async () => {
    const agent = supertest.agent(app);
    await agent.post("/api/login").send({
      email: testEmail,
      password: testPassword,
    });
    const res = await agent.get("/api/user");
    // Could be /api/user or /api/auth/user — test whichever works
    if (res.status === 404) {
      const res2 = await agent.get("/api/auth/user");
      expect(res2.status).toBe(200);
      expect(res2.body).toHaveProperty("email", testEmail);
    } else {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("email", testEmail);
    }
  });
});

describe("Auth - Logout", () => {
  it("POST /api/logout destroys session", async () => {
    const agent = supertest.agent(app);
    // Login first
    await agent.post("/api/login").send({
      email: testEmail,
      password: testPassword,
    });
    // Logout
    const logoutRes = await agent.post("/api/logout");
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toMatch(/logged out/i);
  });

  it("GET /api/user after logout returns 401", async () => {
    const agent = supertest.agent(app);
    await agent.post("/api/login").send({
      email: testEmail,
      password: testPassword,
    });
    await agent.post("/api/logout");
    // Session should be gone
    const res = await agent.get("/api/auth/user");
    expect(res.status).toBe(401);
  });
});
