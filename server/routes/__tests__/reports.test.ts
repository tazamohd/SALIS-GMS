import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser, unauthenticatedAgent } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;
let unauth: supertest.Agent;
let advisorAgent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  unauth = unauthenticatedAgent(app);
  const advisor = await loginAsUser(app); // role ADVISOR — not a management/financial role
  advisorAgent = advisor.agent;
});

describe('Reports API (admin happy path)', () => {
  it('GET /api/reports/summary returns executive metrics', async () => {
    const res = await agent.get('/api/reports/summary');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('totalJobs');
    expect(res.body).toHaveProperty('totalCustomers');
  });

  it('GET /api/reports/revenue returns a data array', async () => {
    const res = await agent.get('/api/reports/revenue');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/reports/revenue honours groupBy', async () => {
    const res = await agent.get('/api/reports/revenue?groupBy=day');
    expect(res.status).toBe(200);
    expect(res.body.groupBy).toBe('day');
  });

  it('GET /api/reports/technician-performance returns data', async () => {
    const res = await agent.get('/api/reports/technician-performance');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/reports/inventory-turnover returns data', async () => {
    const res = await agent.get('/api/reports/inventory-turnover');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/reports/customer-analytics returns data', async () => {
    const res = await agent.get('/api/reports/customer-analytics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('Reports API — RBAC enforcement (audit C3)', () => {
  const ALL_REPORTS = [
    '/api/reports/revenue',
    '/api/reports/summary',
    '/api/reports/inventory-turnover',
    '/api/reports/technician-performance',
    '/api/reports/customer-analytics',
  ];

  for (const path of ALL_REPORTS) {
    it(`rejects unauthenticated access to ${path} with 401`, async () => {
      const res = await unauth.get(path);
      expect(res.status).toBe(401);
    });

    it(`rejects a non-management (ADVISOR) session on ${path} with 403`, async () => {
      const res = await advisorAgent.get(path);
      expect(res.status).toBe(403);
    });
  }
});
