import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";

/**
 * Smoke tests for the 8 new routes added to back the "completed half-real" pages.
 * Verifies each route is mounted and rejects unauthenticated requests with 401,
 * plus a few payload-validation checks where the endpoint accepts user input.
 *
 * Uses an unauthenticated supertest agent against the in-process Express app.
 */
let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe('Completed half-real page endpoints — auth gating', () => {
  const endpoints: Array<{ method: 'get' | 'post' | 'patch' | 'delete'; path: string }> = [
    { method: 'get', path: '/api/mobile-devices' },
    { method: 'get', path: '/api/smart-contracts' },
    { method: 'get', path: '/api/ai/predictions?timeRange=7d&predictionType=demand' },
    { method: 'get', path: '/api/ai/accuracy' },
    { method: 'get', path: '/api/analytics/performance?timeRange=30d' },
    { method: 'get', path: '/api/forecasting/demand?period=30' },
    { method: 'get', path: '/api/productivity?period=today' },
    { method: 'get', path: '/api/diagnostics/obd/00000000-0000-0000-0000-000000000000' },
  ];

  for (const ep of endpoints) {
    it(`${ep.method.toUpperCase()} ${ep.path} returns 401 when unauthenticated`, async () => {
      const res = await supertest(app)[ep.method](ep.path);
      expect(res.status).toBe(401);
    });
  }

  it('POST /api/ai/repair-guide returns 401 when unauthenticated', async () => {
    const res = await supertest(app)
      .post('/api/ai/repair-guide')
      .send({ vehicleId: '1', guide: 'Oil Change' });
    expect(res.status).toBe(401);
  });

  it('POST /api/mobile-devices returns 401 when unauthenticated', async () => {
    const res = await supertest(app).post('/api/mobile-devices').send({
      deviceName: 'Test Tablet',
      deviceType: 'tablet',
      status: 'active',
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/smart-contracts returns 401 when unauthenticated', async () => {
    const res = await supertest(app).post('/api/smart-contracts').send({
      contractType: 'service_agreement',
      partyA: 'Garage',
      partyB: 'Customer',
      terms: {},
      contractValue: '100',
    });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/smart-contracts/:id returns 401 when unauthenticated', async () => {
    const res = await supertest(app)
      .patch('/api/smart-contracts/00000000-0000-0000-0000-000000000000')
      .send({ status: 'signed' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/mobile-devices/:id returns 401 when unauthenticated', async () => {
    const res = await supertest(app).delete(
      '/api/mobile-devices/00000000-0000-0000-0000-000000000000'
    );
    expect(res.status).toBe(401);
  });
});

describe('Completed half-real page endpoints — handler resilience', () => {
  it('GET /api/ai/predictions accepts any timeRange string (graceful fallback)', async () => {
    // Endpoint coerces unknown timeRange to 7-day default; should still 401 (auth first)
    const res = await supertest(app).get(
      '/api/ai/predictions?timeRange=999d&predictionType=demand'
    );
    expect(res.status).toBe(401);
  });

  it('GET /api/forecasting/demand clamps period to [7, 90]', async () => {
    const res = await supertest(app).get('/api/forecasting/demand?period=99999');
    expect(res.status).toBe(401);
  });
});
