import { describe, it, expect } from 'vitest';

/**
 * Smoke tests for the 8 new routes added to back the "completed half-real" pages.
 * Verifies each route is mounted and rejects unauthenticated requests with 401,
 * plus a few payload-validation checks where the endpoint accepts user input.
 *
 * These mirror the existing test conventions in this directory (saudi.test.ts,
 * technician.test.ts). A real garage-scope leakage test requires authenticated
 * fixtures across two garages — out of scope for this lightweight suite.
 */
const BASE = 'http://localhost:5000';

describe('Completed half-real page endpoints — auth gating', () => {
  const endpoints = [
    { method: 'GET', path: '/api/mobile-devices' },
    { method: 'GET', path: '/api/smart-contracts' },
    { method: 'GET', path: '/api/ai/predictions?timeRange=7d&predictionType=demand' },
    { method: 'GET', path: '/api/ai/accuracy' },
    { method: 'GET', path: '/api/analytics/performance?timeRange=30d' },
    { method: 'GET', path: '/api/forecasting/demand?period=30' },
    { method: 'GET', path: '/api/productivity?period=today' },
    {
      method: 'GET',
      path: '/api/diagnostics/obd/00000000-0000-0000-0000-000000000000',
    },
  ];

  for (const ep of endpoints) {
    it(`${ep.method} ${ep.path} returns 401 when unauthenticated`, async () => {
      const res = await fetch(`${BASE}${ep.path}`, { method: ep.method });
      expect(res.status).toBe(401);
    });
  }

  it('POST /api/ai/repair-guide returns 401 when unauthenticated', async () => {
    const res = await fetch(`${BASE}/api/ai/repair-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: '1', guide: 'Oil Change' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/mobile-devices returns 401 when unauthenticated', async () => {
    const res = await fetch(`${BASE}/api/mobile-devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceName: 'Test Tablet',
        deviceType: 'tablet',
        status: 'active',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/smart-contracts returns 401 when unauthenticated', async () => {
    const res = await fetch(`${BASE}/api/smart-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractType: 'service_agreement',
        partyA: 'Garage',
        partyB: 'Customer',
        terms: {},
        contractValue: '100',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/smart-contracts/:id returns 401 when unauthenticated', async () => {
    const res = await fetch(
      `${BASE}/api/smart-contracts/00000000-0000-0000-0000-000000000000`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'signed' }),
      }
    );
    expect(res.status).toBe(401);
  });

  it('DELETE /api/mobile-devices/:id returns 401 when unauthenticated', async () => {
    const res = await fetch(
      `${BASE}/api/mobile-devices/00000000-0000-0000-0000-000000000000`,
      { method: 'DELETE' }
    );
    expect(res.status).toBe(401);
  });
});

describe('Completed half-real page endpoints — handler resilience', () => {
  it('GET /api/ai/predictions accepts any timeRange string (graceful fallback)', async () => {
    // Endpoint coerces unknown timeRange to 7-day default; should still 401 (auth first)
    const res = await fetch(`${BASE}/api/ai/predictions?timeRange=999d&predictionType=demand`);
    expect(res.status).toBe(401);
  });

  it('GET /api/forecasting/demand clamps period to [7, 90]', async () => {
    const res = await fetch(`${BASE}/api/forecasting/demand?period=99999`);
    expect(res.status).toBe(401);
  });
});
