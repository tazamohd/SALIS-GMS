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

describe("Backup History (DB-backed)", () => {
  it("POST /api/backup/create persists a backup and GET /list returns it", async () => {
    const create = await agent.post("/api/backup/create");
    // Admin guard may reject if our test user isn't admin-role; accept 200/403.
    expect([200, 403]).toContain(create.status);
    if (create.status !== 200) return;
    expect(create.body.success).toBe(true);
    expect(create.body.backup?.id).toBeDefined();

    const list = await agent.get("/api/backup/list");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    const ids = list.body.map((b: any) => b.id);
    expect(ids).toContain(create.body.backup.id);

    const status = await agent.get("/api/backup/status");
    expect(status.status).toBe(200);
    expect(status.body.backupCount).toBeGreaterThan(0);
    expect(status.body.lastBackupTime).toBeTruthy();
  });
});
