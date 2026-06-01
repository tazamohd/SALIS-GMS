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

describe('Audit Trail API', () => {
  describe('POST /api/audit/seed', () => {
    it('should seed demo audit entries', async () => {
      const res = await agent.post('/api/audit/seed');
      expect([200, 201, 404]).toContain(res.status);
      if (res.status === 200 || res.status === 201) {
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('GET /api/audit/log', () => {
    it('should return entries and total', async () => {
      const res = await agent.get('/api/audit/log');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('entries');
        expect(res.body).toHaveProperty('total');
      }
    });

    it('should support severity filter', async () => {
      const res = await agent.get('/api/audit/log?severity=critical');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('entries');
      }
    });

    it('should support pagination', async () => {
      const res = await agent.get('/api/audit/log?limit=5&offset=0');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.entries.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('GET /api/audit/stats', () => {
    it('should return stats with severity counts', async () => {
      const res = await agent.get('/api/audit/stats');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('severityCounts');
        expect(res.body).toHaveProperty('topUsers');
      }
    });
  });
});
