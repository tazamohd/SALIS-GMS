import { describe, it, expect } from 'vitest';

describe('Reports API', () => {
  describe('GET /api/reports/summary', () => {
    it('should return executive summary metrics', async () => {
      const res = await fetch('http://localhost:5000/api/reports/summary');
      const data = await res.json();
      expect(data).toHaveProperty('totalRevenue');
      expect(data).toHaveProperty('totalJobs');
      expect(data).toHaveProperty('totalCustomers');
    });
  });

  describe('GET /api/reports/revenue', () => {
    it('should return revenue data array', async () => {
      const res = await fetch('http://localhost:5000/api/reports/revenue');
      const data = await res.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should accept groupBy parameter', async () => {
      const res = await fetch('http://localhost:5000/api/reports/revenue?groupBy=day');
      const data = await res.json();
      expect(data.groupBy).toBe('day');
    });
  });

  describe('GET /api/reports/technician-performance', () => {
    it('should return performance data', async () => {
      const res = await fetch('http://localhost:5000/api/reports/technician-performance');
      const data = await res.json();
      expect(data).toHaveProperty('data');
    });
  });

  describe('GET /api/reports/inventory-turnover', () => {
    it('should return inventory data', async () => {
      const res = await fetch('http://localhost:5000/api/reports/inventory-turnover');
      const data = await res.json();
      expect(data).toHaveProperty('data');
    });
  });

  describe('GET /api/reports/customer-analytics', () => {
    it('should return customer data', async () => {
      const res = await fetch('http://localhost:5000/api/reports/customer-analytics');
      const data = await res.json();
      expect(data).toHaveProperty('data');
    });
  });
});
