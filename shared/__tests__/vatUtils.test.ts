import { describe, it, expect } from 'vitest';
import {
  calculateVAT,
  reverseVAT,
  calculateZakat,
  validateTRN,
  formatTRN,
  calculateInvoiceWithVAT,
  SAUDI_VAT_RATE,
  ZAKAT_RATE,
} from '../vatUtils';

describe('calculateVAT', () => {
  it('calculates 15% VAT on a round number', () => {
    const result = calculateVAT(1000);
    expect(result.subtotal).toBe(1000);
    expect(result.vatAmount).toBe(150);
    expect(result.total).toBe(1150);
    expect(result.vatRate).toBe(SAUDI_VAT_RATE);
  });

  it('rounds to two decimal places', () => {
    const result = calculateVAT(33.33);
    expect(result.vatAmount).toBe(5);
    expect(result.total).toBe(38.33);
  });

  it('handles zero subtotal', () => {
    const result = calculateVAT(0);
    expect(result.vatAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('accepts a custom VAT rate', () => {
    const result = calculateVAT(100, 0.10);
    expect(result.vatAmount).toBe(10);
    expect(result.total).toBe(110);
    expect(result.vatRate).toBe(0.10);
  });
});

describe('reverseVAT', () => {
  it('extracts subtotal from a VAT-inclusive total', () => {
    const result = reverseVAT(1150);
    expect(result.subtotal).toBe(1000);
    expect(result.vatAmount).toBe(150);
    expect(result.total).toBe(1150);
  });

  it('is the inverse of calculateVAT', () => {
    const forward = calculateVAT(500);
    const reverse = reverseVAT(forward.total);
    expect(reverse.subtotal).toBe(500);
  });
});

describe('calculateZakat', () => {
  it('calculates 2.5% Zakat', () => {
    const result = calculateZakat(100000);
    expect(result.zakatAmount).toBe(2500);
    expect(result.zakatRate).toBe(ZAKAT_RATE);
  });

  it('handles fractional amounts', () => {
    const result = calculateZakat(75000);
    expect(result.zakatAmount).toBe(1875);
  });
});

describe('validateTRN', () => {
  it('accepts a valid 15-digit TRN', () => {
    expect(validateTRN('310122393500003')).toBe(true);
  });

  it('rejects TRN with fewer than 15 digits', () => {
    expect(validateTRN('31012239350000')).toBe(false);
  });

  it('rejects TRN with more than 15 digits', () => {
    expect(validateTRN('3101223935000030')).toBe(false);
  });

  it('rejects TRN with non-digit characters', () => {
    expect(validateTRN('31012239350000A')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateTRN('')).toBe(false);
  });
});

describe('formatTRN', () => {
  it('formats a valid TRN with spaces', () => {
    expect(formatTRN('310122393500003')).toBe('310 1223 9350 0003');
  });

  it('returns invalid TRN unformatted', () => {
    expect(formatTRN('12345')).toBe('12345');
  });
});

describe('calculateInvoiceWithVAT', () => {
  it('sums line items and applies VAT', () => {
    const items = [{ amount: 200 }, { amount: 300 }, { amount: 500 }];
    const result = calculateInvoiceWithVAT(items);
    expect(result.subtotal).toBe(1000);
    expect(result.vatAmount).toBe(150);
    expect(result.total).toBe(1150);
  });

  it('handles empty items array', () => {
    const result = calculateInvoiceWithVAT([]);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });
});
