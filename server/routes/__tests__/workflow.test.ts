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

describe('Workflow API Routes', () => {
  describe('POST /api/job-cards/:id/transition', () => {
    it('should reject missing targetStatus', async () => {
      const res = await agent.post('/api/job-cards/1/transition').send({});
      expect([400, 404]).toContain(res.status);
    });

    it('should reject invalid targetStatus value', async () => {
      const res = await agent.post('/api/job-cards/1/transition').send({
        targetStatus: 'invalid_status',
      });
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('POST /api/appointments/:id/check-in', () => {
    it('should accept valid check-in request', async () => {
      const res = await agent.post('/api/appointments/1/check-in').send({
        notes: 'Customer arrived',
      });
      // Should not be 400 (validation passes)
      expect(res.status).not.toBe(400);
    });
  });
});
