import { describe, it, expect } from 'vitest';

describe('Workflow API Routes', () => {
  describe('POST /api/job-cards/:id/transition', () => {
    it('should reject missing targetStatus', async () => {
      const res = await fetch('http://localhost:5000/api/job-cards/1/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('should reject invalid targetStatus value', async () => {
      const res = await fetch('http://localhost:5000/api/job-cards/1/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus: 'invalid_status' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/appointments/:id/check-in', () => {
    it('should accept valid check-in request', async () => {
      const res = await fetch('http://localhost:5000/api/appointments/1/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Customer arrived' }),
      });
      // Should not be 400 (validation passes)
      expect(res.status).not.toBe(400);
    });
  });
});
