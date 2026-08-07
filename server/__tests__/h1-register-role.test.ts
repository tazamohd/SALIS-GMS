/**
 * H-1 regression — public self-registration must not mint a staff account.
 *
 * `users.role` defaults to ADVISOR (a staff role), and `POST /api/register`
 * (public, in the auth + CSRF allowlists) created a user without a role — so
 * anyone could self-register straight into staff-level access. The fix pins a
 * non-privileged identity (role=CUSTOMER, userType=customer) both at the
 * handler and as a floor in storage.createUser. This pins that behaviour.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { storage } from "../storage";

let app: Express;
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  app = (await createTestApp()).app;
});

describe("H-1 self-registration is non-staff", () => {
  it("POST /api/register yields role=CUSTOMER / userType=customer, never a staff role", async () => {
    const agent = supertestLib.agent(app);
    const email = `h1-reg-${uniq()}@test.sa`;
    const res = await agent.post("/api/register").send({ email, password: "Pass123!", fullName: "H1" });
    expect(res.status).toBe(200);
    expect(res.body.role).not.toBe("ADVISOR");
    expect(res.body.role).toBe("CUSTOMER");
    expect(res.body.userType).toBe("customer");
  });

  it("storage.createUser floors an omitted role to CUSTOMER (not the ADVISOR column default)", async () => {
    const u = await storage.createUser({
      email: `h1-store-${uniq()}@test.sa`,
      password: "$2b$10$abcdefghijklmnopqrstuv", // pre-hashed shape, left as-is
      fullName: "H1 Store",
    } as any);
    expect(u.role).toBe("CUSTOMER");
    expect(u.userType).toBe("customer");
  });

  it("an explicit staff role is still honoured (floor only applies when omitted)", async () => {
    const u = await storage.createUser({
      email: `h1-staff-${uniq()}@test.sa`,
      password: "$2b$10$abcdefghijklmnopqrstuv",
      fullName: "H1 Staff",
      role: "MANAGER",
    } as any);
    expect(u.role).toBe("MANAGER");
  });
});
