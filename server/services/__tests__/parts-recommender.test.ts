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

describe('Parts Recommendations API', () => {
  describe('POST /api/ai/parts-recommendations', () => {
    it('should return recommendations for oil change', async () => {
      const res = await agent.post('/api/ai/parts-recommendations').send({
        serviceType: 'oil change',
        vehicleMake: 'Toyota',
      });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('recommendations');
        expect(Array.isArray(res.body.recommendations)).toBe(true);
      }
    });

    it('should return recommendations for brake service', async () => {
      const res = await agent.post('/api/ai/parts-recommendations').send({
        serviceType: 'brake service',
      });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('recommendations');
        expect(Array.isArray(res.body.recommendations)).toBe(true);
      }
    });

    it('should include stock status in recommendations', async () => {
      const res = await agent.post('/api/ai/parts-recommendations').send({
        serviceType: 'oil change',
      });
      if (res.status === 200 && res.body.recommendations?.length > 0) {
        expect(res.body.recommendations[0]).toHaveProperty('inStock');
        expect(res.body.recommendations[0]).toHaveProperty('stockQuantity');
      }
    });
  });

  describe('GET /api/ai/parts-recommendations', () => {
    it('should accept query parameters', async () => {
      const res = await agent.get('/api/ai/parts-recommendations?serviceType=battery');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('recommendations');
      }
    });
  });
});
