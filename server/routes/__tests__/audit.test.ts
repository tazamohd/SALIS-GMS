import { describe, it, expect } from 'vitest';

describe('Audit Trail API', () => {
  describe('POST /api/audit/seed', () => {
    it('should seed demo audit entries', async () => {
      const res = await fetch('http://localhost:5000/api/audit/seed', { method: 'POST' });
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/audit/log', () => {
    it('should return entries and total', async () => {
      const res = await fetch('http://localhost:5000/api/audit/log');
      const data = await res.json();
      expect(data).toHaveProperty('entries');
      expect(data).toHaveProperty('total');
    });

    it('should support severity filter', async () => {
      const res = await fetch('http://localhost:5000/api/audit/log?severity=critical');
      const data = await res.json();
      expect(data).toHaveProperty('entries');
    });

    it('should support pagination', async () => {
      const res = await fetch('http://localhost:5000/api/audit/log?limit=5&offset=0');
      const data = await res.json();
      expect(data.entries.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/audit/stats', () => {
    it('should return stats with severity counts', async () => {
      const res = await fetch('http://localhost:5000/api/audit/stats');
      const data = await res.json();
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('severityCounts');
      expect(data).toHaveProperty('topUsers');
    });
  });
});
