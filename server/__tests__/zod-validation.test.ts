/**
 * Sprint 5 — Zod input validation at mutation boundaries.
 *
 * Endpoints that previously accepted any body now reject a payload missing a
 * required field with 400 { error: 'Validation failed', details: [...] } via the
 * shared validate() middleware. Schemas use .passthrough(), so a body that
 * carries the required fields is NOT rejected by validation (it may still fail
 * downstream for other reasons — we assert only that it is not a validation 400).
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  app = (await createTestApp()).app;
  agent = (await loginAsAdmin(app)).agent;
});

const isValidationError = (res: any) =>
  res.status === 400 && res.body?.error === "Validation failed";

describe("Zod validation — missing required fields are rejected with 400", () => {
  it("POST /api/fleet/accounts without companyName → 400 Validation failed", async () => {
    const res = await agent.post("/api/fleet/accounts").send({});
    expect(isValidationError(res)).toBe(true);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("POST /api/warranty/contracts with an empty body → 400 Validation failed", async () => {
    const res = await agent.post("/api/warranty/contracts").send({});
    expect(isValidationError(res)).toBe(true);
  });

  it("POST /api/hr/leave-requests without required fields → 400 Validation failed", async () => {
    const res = await agent.post("/api/hr/leave-requests").send({ reason: "x" });
    expect(isValidationError(res)).toBe(true);
  });
});

describe("Zod validation — a body with the required fields passes validation", () => {
  it("POST /api/fleet/accounts with companyName is NOT a validation 400", async () => {
    const res = await agent.post("/api/fleet/accounts").send({ companyName: "Acme Fleet Co" });
    // May 200/201 (created) or fail downstream, but never a *validation* 400.
    expect(isValidationError(res)).toBe(false);
  });
});
