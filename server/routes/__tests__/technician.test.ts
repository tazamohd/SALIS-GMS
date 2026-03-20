import { describe, it, expect } from 'vitest';

describe('Technician Mobile API', () => {
  describe('POST /api/technician/clock', () => {
    it('should reject missing technicianId', async () => {
      const res = await fetch('http://localhost:5000/api/technician/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'in', timestamp: new Date().toISOString() }),
      });
      expect(res.status).toBe(400);
    });

    it('should reject invalid action', async () => {
      const res = await fetch('http://localhost:5000/api/technician/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: '1', action: 'invalid', timestamp: new Date().toISOString() }),
      });
      expect(res.status).toBe(400);
    });

    it('should accept valid clock-in', async () => {
      const res = await fetch('http://localhost:5000/api/technician/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: '1', action: 'in', timestamp: new Date().toISOString() }),
      });
      expect(res.status).not.toBe(400);
    });
  });

  describe('POST /api/technician/parts-request', () => {
    it('should reject missing required fields', async () => {
      const res = await fetch('http://localhost:5000/api/technician/parts-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partName: 'Oil Filter' }),
      });
      expect(res.status).toBe(400);
    });

    it('should reject negative quantity', async () => {
      const res = await fetch('http://localhost:5000/api/technician/parts-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: '1', technicianId: '1', partName: 'Oil', quantity: -1, urgency: 'high' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/technician/stats/:techId', () => {
    it('should return stats object', async () => {
      const res = await fetch('http://localhost:5000/api/technician/stats/1');
      const data = await res.json();
      expect(data).toHaveProperty('stats');
      expect(data.stats).toHaveProperty('totalJobs');
    });
  });
});
