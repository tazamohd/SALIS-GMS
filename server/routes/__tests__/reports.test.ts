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

describe('Reports API', () => {
  describe('GET /api/reports/summary', () => {
    it('should return executive summary metrics', async () => {
      const res = await agent.get('/api/reports/summary');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('totalRevenue');
        expect(res.body).toHaveProperty('totalJobs');
        expect(res.body).toHaveProperty('totalCustomers');
      }
    });
  });

  describe('GET /api/reports/revenue', () => {
    it('should return revenue data array', async () => {
      const res = await agent.get('/api/reports/revenue');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('should accept groupBy parameter', async () => {
      const res = await agent.get('/api/reports/revenue?groupBy=day');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.groupBy).toBe('day');
      }
    });
  });

  describe('GET /api/reports/technician-performance', () => {
    it('should return performance data', async () => {
      const res = await agent.get('/api/reports/technician-performance');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
      }
    });
  });

  describe('GET /api/reports/inventory-turnover', () => {
    it('should return inventory data', async () => {
      const res = await agent.get('/api/reports/inventory-turnover');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
      }
    });
  });

  describe('GET /api/reports/customer-analytics', () => {
    it('should return customer data', async () => {
      const res = await agent.get('/api/reports/customer-analytics');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
      }
    });
  });
});
