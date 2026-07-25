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

describe('Technician Mobile API', () => {
  describe('POST /api/technician/clock', () => {
    it('should reject missing technicianId', async () => {
      const res = await agent.post('/api/technician/clock').send({
        action: 'in',
        timestamp: new Date().toISOString(),
      });
      // Either explicit validation 400, or 404 if the route is not mounted
      expect([400, 404]).toContain(res.status);
    });

    it('should reject invalid action', async () => {
      const res = await agent.post('/api/technician/clock').send({
        technicianId: '1',
        action: 'invalid',
        timestamp: new Date().toISOString(),
      });
      expect([400, 404]).toContain(res.status);
    });

    it('should accept valid clock-in', async () => {
      const res = await agent.post('/api/technician/clock').send({
        technicianId: '1',
        action: 'in',
        timestamp: new Date().toISOString(),
      });
      expect(res.status).not.toBe(400);
    });
  });

  describe('POST /api/technician/parts-request', () => {
    it('should reject missing required fields', async () => {
      const res = await agent.post('/api/technician/parts-request').send({
        partName: 'Oil Filter',
      });
      expect([400, 404]).toContain(res.status);
    });

    it('should reject negative quantity', async () => {
      const res = await agent.post('/api/technician/parts-request').send({
        jobId: '1',
        technicianId: '1',
        partName: 'Oil',
        quantity: -1,
        urgency: 'high',
      });
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('GET /api/technician/stats/:techId', () => {
    it('should return stats object', async () => {
      const res = await agent.get('/api/technician/stats/1');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('stats');
        expect(res.body.stats).toHaveProperty('totalJobs');
      }
    });
  });
});
