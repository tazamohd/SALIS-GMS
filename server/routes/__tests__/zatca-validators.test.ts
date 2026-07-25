/**
 * Tests for ZATCA (Saudi e-invoicing Fatoora) validators
 * Ensures VAT registration number regex and amount bounds are enforced.
 */

import { describe, it, expect } from 'vitest';
import { zatcaInvoiceSchema, zatcaComplianceCheckSchema } from '../validators';

function validate(schema: any, body: any) {
  return schema.safeParse(body);
}

const validInvoice = {
  sellerName: 'SalisAuto Workshop',
  vatRegistrationNumber: '300123456700003',
  timestamp: new Date().toISOString(),
  totalWithVAT: 1150.00,
  vatAmount: 150.00,
};

describe('zatcaInvoiceSchema', () => {
  it('accepts a valid Saudi VAT invoice', () => {
    const result = validate(zatcaInvoiceSchema, validInvoice);
    expect(result.success).toBe(true);
  });

  it('accepts zero-amount invoice (free service)', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      totalWithVAT: 0,
      vatAmount: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects VAT number not starting with 3', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      vatRegistrationNumber: '200123456700003',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('15 digits');
    }
  });

  it('rejects VAT number with wrong length', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      vatRegistrationNumber: '300123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects VAT number with non-digits', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      vatRegistrationNumber: '30012345670000A',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative total amount', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      totalWithVAT: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing seller name', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      sellerName: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-ISO timestamp', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      timestamp: '2024-01-01 12:00:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode)', () => {
    const result = validate(zatcaInvoiceSchema, {
      ...validInvoice,
      hackerField: 'oops',
    });
    expect(result.success).toBe(false);
  });
});

describe('zatcaComplianceCheckSchema', () => {
  it('accepts a valid compliance check', () => {
    const result = validate(zatcaComplianceCheckSchema, {
      sellerName: 'SalisAuto Workshop',
      vatRegistrationNumber: '300123456700003',
      timestamp: new Date().toISOString(),
      invoiceTotal: 1150.00,
      vatAmount: 150.00,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid VAT number', () => {
    const result = validate(zatcaComplianceCheckSchema, {
      sellerName: 'Test',
      vatRegistrationNumber: '12345',
      timestamp: new Date().toISOString(),
      invoiceTotal: 100,
      vatAmount: 15,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative invoiceTotal', () => {
    const result = validate(zatcaComplianceCheckSchema, {
      sellerName: 'Test',
      vatRegistrationNumber: '300123456700003',
      timestamp: new Date().toISOString(),
      invoiceTotal: -1,
      vatAmount: 0,
    });
    expect(result.success).toBe(false);
  });
});
