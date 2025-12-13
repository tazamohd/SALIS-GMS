import { describe, it, expect } from 'vitest';

const calculateVAT = (amount: number, rate: number = 0.15) => {
  return amount * rate;
};

describe('VAT Calculation Logic', () => {
  it('should calculate 15% VAT correctly for 100 SAR', () => {
    const result = calculateVAT(100);
    expect(result).toBe(15);
  });

  it('should return 0 for 0 amount', () => {
    const result = calculateVAT(0);
    expect(result).toBe(0);
  });

  it('should handle custom tax rates', () => {
    const result = calculateVAT(200, 0.05);
    expect(result).toBe(10);
  });
});
