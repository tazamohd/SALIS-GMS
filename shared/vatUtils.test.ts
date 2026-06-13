import { describe, it, expect } from 'vitest';
import {
  calculateVAT,
  reverseVAT,
  calculateInvoiceWithVAT,
  calculateZakat,
  validateTRN,
  formatTRN,
  SAUDI_VAT_RATE,
} from './vatUtils';

describe('calculateVAT (real export)', () => {
  it('applies the 15% Saudi rate by default', () => {
    const r = calculateVAT(100);
    expect(r.subtotal).toBe(100);
    expect(r.vatAmount).toBe(15);
    expect(r.total).toBe(115);
    expect(r.vatRate).toBe(SAUDI_VAT_RATE);
  });

  it('returns zeros for a zero subtotal', () => {
    const r = calculateVAT(0);
    expect(r.vatAmount).toBe(0);
    expect(r.total).toBe(0);
  });

  it('rounds to 2 decimals (no floating-point drift)', () => {
    const r = calculateVAT(99.99);
    expect(r.vatAmount).toBe(15); // 99.99 * 0.15 = 14.9985 -> 15.00
    expect(r.total).toBe(114.99);
  });

  it('honours a custom rate', () => {
    const r = calculateVAT(200, 0.05);
    expect(r.vatAmount).toBe(10);
    expect(r.total).toBe(210);
  });
});

describe('reverseVAT', () => {
  it('extracts subtotal and VAT from a VAT-inclusive total', () => {
    const r = reverseVAT(115);
    expect(r.subtotal).toBe(100);
    expect(r.vatAmount).toBe(15);
    expect(r.total).toBe(115);
  });

  it('round-trips with calculateVAT', () => {
    const forward = calculateVAT(250);
    const back = reverseVAT(forward.total);
    expect(back.subtotal).toBe(250);
  });
});

describe('calculateInvoiceWithVAT', () => {
  it('sums line items then applies VAT', () => {
    const r = calculateInvoiceWithVAT([{ amount: 50 }, { amount: 30 }, { amount: 20 }]);
    expect(r.subtotal).toBe(100);
    expect(r.vatAmount).toBe(15);
    expect(r.total).toBe(115);
  });
});

describe('calculateZakat', () => {
  it('applies the 2.5% rate', () => {
    const r = calculateZakat(10000);
    expect(r.zakatAmount).toBe(250);
  });
});

describe('validateTRN / formatTRN', () => {
  it('accepts a 15-digit TRN and rejects others', () => {
    expect(validateTRN('300123456789012')).toBe(true);
    expect(validateTRN('12345')).toBe(false);
    expect(validateTRN('30012345678901a')).toBe(false);
  });

  it('formats a valid TRN and leaves invalid ones untouched', () => {
    expect(formatTRN('300123456789012')).toBe('300 1234 5678 9012');
    expect(formatTRN('bad')).toBe('bad');
  });
});
