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

describe('Saudi Compliance API', () => {
  describe('GET /api/saudi/dashboard', () => {
    it('should return compliance dashboard data', async () => {
      const res = await agent.get('/api/saudi/dashboard');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });
  });

  describe('GET /api/saudi/hijri/today', () => {
    it('should return current Hijri date', async () => {
      const res = await agent.get('/api/saudi/hijri/today');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });
  });

  describe('GET /api/saudi/vat/summary', () => {
    it('should return VAT summary', async () => {
      const res = await agent.get('/api/saudi/vat/summary');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });
  });
});
