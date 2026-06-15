/**
 * RBAC deny-by-default enforcement (Story 3.2).
 *
 * Verifies the policy registry: an ADVISOR is denied financial mutations but
 * allowed operational ones; an ADMIN bypasses (not 403).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, loginAsUser } from "./helpers";

let app: Express;
let advisor: supertest.Agent;
let admin: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  advisor = (await loginAsUser(app)).agent; // role ADVISOR
  admin = (await loginAsAdmin(app)).agent; // role ADMIN
});

describe("RBAC authorize (Story 3.2)", () => {
  it("denies an ADVISOR a financial mutation (invoices = ACCOUNTANT/MANAGER)", async () => {
    const res = await advisor.post("/api/invoices").send({ totalAmount: "10" });
    expect(res.status).toBe(403);
  });

  it("denies an ADVISOR an admin-only mutation (settings)", async () => {
    const res = await advisor.post("/api/settings").send({ k: "v" });
    expect(res.status).toBe(403);
  });

  it("does NOT deny an ADVISOR an operational mutation (job-cards is ADVISOR/MANAGER)", async () => {
    const res = await advisor.post("/api/job-cards").send({});
    // May be 400 (bad body) etc., but must NOT be a role denial.
    expect(res.status).not.toBe(403);
  });

  it("ADMIN bypasses policy (financial mutation not 403)", async () => {
    const res = await admin.post("/api/invoices").send({ totalAmount: "10" });
    expect(res.status).not.toBe(403);
  });

  it("does not gate reads", async () => {
    const res = await advisor.get("/api/invoices");
    expect(res.status).not.toBe(403);
  });
});
