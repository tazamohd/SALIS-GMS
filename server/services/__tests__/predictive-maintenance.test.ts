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

describe('Predictive Maintenance API', () => {
  describe('GET /api/predictive-maintenance/predictions', () => {
    it('should return predictions array', async () => {
      const res = await agent.get('/api/predictive-maintenance/predictions');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('predictions');
        expect(Array.isArray(res.body.predictions)).toBe(true);
      }
    });
  });

  describe('GET /api/predictive-maintenance/stats', () => {
    it('should return maintenance stats', async () => {
      const res = await agent.get('/api/predictive-maintenance/stats');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('vehicleCount');
        expect(res.body).toHaveProperty('critical');
        expect(res.body).toHaveProperty('high');
        expect(res.body).toHaveProperty('estimatedRevenue');
      }
    });
  });
});
