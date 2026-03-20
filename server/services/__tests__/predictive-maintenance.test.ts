import { describe, it, expect } from 'vitest';

describe('Predictive Maintenance API', () => {
  describe('GET /api/predictive-maintenance/predictions', () => {
    it('should return predictions array', async () => {
      const res = await fetch('http://localhost:5000/api/predictive-maintenance/predictions');
      const data = await res.json();
      expect(data).toHaveProperty('predictions');
      expect(Array.isArray(data.predictions)).toBe(true);
    });
  });

  describe('GET /api/predictive-maintenance/stats', () => {
    it('should return maintenance stats', async () => {
      const res = await fetch('http://localhost:5000/api/predictive-maintenance/stats');
      const data = await res.json();
      expect(data).toHaveProperty('vehicleCount');
      expect(data).toHaveProperty('critical');
      expect(data).toHaveProperty('high');
      expect(data).toHaveProperty('estimatedRevenue');
    });
  });
});
