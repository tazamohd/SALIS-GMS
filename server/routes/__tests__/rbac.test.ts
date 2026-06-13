import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;

const UNKNOWN = "00000000-0000-0000-0000-000000000000";

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  admin = (await loginAsAdmin(app)).agent;
  advisor = (await loginAsUser(app)).agent; // role ADVISOR
});

describe("RBAC on destructive endpoints", () => {
  it("forbids an ADVISOR from deleting a vehicle", async () => {
    const res = await advisor.delete(`/api/vehicles/${UNKNOWN}`);
    expect(res.status).toBe(403);
  });

  it("forbids an ADVISOR from deleting a service template", async () => {
    const res = await advisor.delete(`/api/service-templates/${UNKNOWN}`);
    expect(res.status).toBe(403);
  });

  it("allows an ADMIN past the role gate (404 on unknown id, not 403)", async () => {
    const vehicle = await admin.delete(`/api/vehicles/${UNKNOWN}`);
    expect(vehicle.status).toBe(404);
    const template = await admin.delete(`/api/service-templates/${UNKNOWN}`);
    expect(template.status).toBe(404);
  });
});
