import { describe, it, expect } from 'vitest';

describe('Parts Recommendations API', () => {
  describe('POST /api/ai/parts-recommendations', () => {
    it('should return recommendations for oil change', async () => {
      const res = await fetch('http://localhost:5000/api/ai/parts-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'oil change', vehicleMake: 'Toyota' }),
      });
      const data = await res.json();
      expect(data).toHaveProperty('recommendations');
      expect(data.recommendations.length).toBeGreaterThan(0);
    });

    it('should return recommendations for brake service', async () => {
      const res = await fetch('http://localhost:5000/api/ai/parts-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'brake service' }),
      });
      const data = await res.json();
      expect(data.recommendations.length).toBeGreaterThan(0);
    });

    it('should include stock status in recommendations', async () => {
      const res = await fetch('http://localhost:5000/api/ai/parts-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'oil change' }),
      });
      const data = await res.json();
      if (data.recommendations.length > 0) {
        expect(data.recommendations[0]).toHaveProperty('inStock');
        expect(data.recommendations[0]).toHaveProperty('stockQuantity');
      }
    });
  });

  describe('GET /api/ai/parts-recommendations', () => {
    it('should accept query parameters', async () => {
      const res = await fetch('http://localhost:5000/api/ai/parts-recommendations?serviceType=battery');
      const data = await res.json();
      expect(data).toHaveProperty('recommendations');
    });
  });
});
