/**
 * Tests for ZATCA (Saudi e-invoicing) utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateZATCAQRCode,
  decodeZATCAQRCode,
  validateZATCACompliance,
  type ZATCAInvoiceData,
} from './zatcaUtils';

const validInvoice: ZATCAInvoiceData = {
  sellerName: 'Test Garage',
  vatRegistrationNumber: '300000000000003',
  timestamp: '2026-06-27T12:00:00Z',
  totalWithVAT: 115.00,
  vatAmount: 15.00,
};

describe('generateZATCAQRCode', () => {
  it('returns a base64-encoded string', () => {
    const qr = generateZATCAQRCode(validInvoice);
    expect(typeof qr).toBe('string');
    expect(qr.length).toBeGreaterThan(0);
  });

  it('produces different output for different invoices', () => {
    const q1 = generateZATCAQRCode(validInvoice);
    const q2 = generateZATCAQRCode({ ...validInvoice, totalWithVAT: 200.00 });
    expect(q1).not.toBe(q2);
  });

  it('is deterministic for the same input', () => {
    const q1 = generateZATCAQRCode(validInvoice);
    const q2 = generateZATCAQRCode(validInvoice);
    expect(q1).toBe(q2);
  });
});

describe('decodeZATCAQRCode', () => {
  it('roundtrips invoice data', () => {
    const qr = generateZATCAQRCode(validInvoice);
    const decoded = decodeZATCAQRCode(qr);
    expect(decoded.sellerName).toBe(validInvoice.sellerName);
    expect(decoded.vatRegistrationNumber).toBe(validInvoice.vatRegistrationNumber);
  });
});

describe('validateZATCACompliance', () => {
  it('accepts valid complete data', () => {
    const result = validateZATCACompliance(validInvoice);
    expect(result.valid).toBe(true);
  });

  it('rejects missing seller name', () => {
    const result = validateZATCACompliance({ ...validInvoice, sellerName: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects missing VAT number', () => {
    const result = validateZATCACompliance({ ...validInvoice, vatRegistrationNumber: '' });
    expect(result.valid).toBe(false);
  });
});