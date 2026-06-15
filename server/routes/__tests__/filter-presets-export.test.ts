import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let admin: supertest.Agent;
let advisor: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  admin = (await loginAsAdmin(app)).agent;
  advisor = (await loginAsUser(app)).agent;
});

const UNKNOWN = "00000000-0000-0000-0000-000000000000";

describe("Saved filter presets (migrated, garage + user scoped)", () => {
  it("creates, lists, updates and deletes a preset", async () => {
    const create = await admin.post("/api/filter-presets").send({
      name: "Open job cards",
      module: "job_cards",
      filterConfig: { field: "status", operator: "equals", value: "open" },
    });
    expect(create.status).toBe(201);
    expect(create.body.garageId).toBeTruthy();
    expect(create.body.userId).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/filter-presets")).body.some((p: any) => p.id === id)).toBe(true);

    const upd = await admin.put(`/api/filter-presets/${id}`).send({ name: "Open jobs v2" });
    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe("Open jobs v2");

    expect((await admin.delete(`/api/filter-presets/${id}`)).status).toBe(204);
  });

  it("404s an unknown id and validates the create body", async () => {
    expect((await admin.put(`/api/filter-presets/${UNKNOWN}`).send({ name: "x" })).status).toBe(404);
    expect((await admin.delete(`/api/filter-presets/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post("/api/filter-presets").send({ name: "no module" })).status).toBe(400);
  });
});

describe("Export jobs (migrated, personal — garage + user scoped)", () => {
  it("starts an export, lists and fetches its own job", async () => {
    const create = await admin.post("/api/export").send({ module: "customers", format: "json" });
    expect(create.status).toBe(202);
    expect(create.body.garageId).toBeTruthy();
    expect(create.body.userId).toBeTruthy();
    const id = create.body.id;

    expect((await admin.get("/api/export-jobs")).body.some((j: any) => j.id === id)).toBe(true);
    expect((await admin.get(`/api/export-jobs/${id}`)).status).toBe(200);

    // A different user in the garage cannot read someone else's export job.
    expect((await advisor.get(`/api/export-jobs/${id}`)).status).toBe(404);
  });

  it("404s an unknown id and validates the export request", async () => {
    expect((await admin.get(`/api/export-jobs/${UNKNOWN}`)).status).toBe(404);
    expect((await admin.post("/api/export").send({ format: "json" })).status).toBe(400);
  });
});
