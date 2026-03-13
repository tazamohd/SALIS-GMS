import { describe, it, expect } from 'vitest';
import { generateZATCAQRCode, decodeZATCAQRCode, validateZATCACompliance, type ZATCAInvoiceData } from './zatcaUtils';

describe('ZATCA QR Code Generation', () => {
  const validData: ZATCAInvoiceData = {
    sellerName: 'SALIS AUTO',
    vatRegistrationNumber: '310122393500003',
    timestamp: '2025-10-30T12:00:00Z',
    totalWithVAT: 1150.00,
    vatAmount: 150.00,
  };

  it('should generate a valid base64 string', () => {
    const qr = generateZATCAQRCode(validData);
    expect(qr).toBeTruthy();
    expect(typeof qr).toBe('string');
    // Base64 characters only
    expect(qr).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('should be decodable back to original data', () => {
    const qr = generateZATCAQRCode(validData);
    const decoded = decodeZATCAQRCode(qr);
    expect(decoded.sellerName).toBe(validData.sellerName);
    expect(decoded.vatRegistrationNumber).toBe(validData.vatRegistrationNumber);
    expect(decoded.timestamp).toBe(validData.timestamp);
    expect(decoded.totalWithVAT).toBe(validData.totalWithVAT);
    expect(decoded.vatAmount).toBe(validData.vatAmount);
  });

  it('should handle zero amounts', () => {
    const zeroData: ZATCAInvoiceData = { ...validData, totalWithVAT: 0, vatAmount: 0 };
    const qr = generateZATCAQRCode(zeroData);
    const decoded = decodeZATCAQRCode(qr);
    expect(decoded.totalWithVAT).toBe(0);
    expect(decoded.vatAmount).toBe(0);
  });
});

describe('ZATCA Compliance Validation', () => {
  it('should pass with valid data', () => {
    const result = validateZATCACompliance({
      sellerName: 'SALIS AUTO',
      vatRegistrationNumber: '310122393500003',
      timestamp: '2025-10-30T12:00:00Z',
      totalWithVAT: 1150,
      vatAmount: 150,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail with missing seller name', () => {
    const result = validateZATCACompliance({ sellerName: '', vatRegistrationNumber: '310122393500003', timestamp: '2025-10-30', totalWithVAT: 100, vatAmount: 15 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Seller name'))).toBe(true);
  });

  it('should fail with invalid TRN (not 15 digits)', () => {
    const result = validateZATCACompliance({ sellerName: 'Test', vatRegistrationNumber: '12345', timestamp: '2025-10-30', totalWithVAT: 100, vatAmount: 15 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('15-digit'))).toBe(true);
  });

  it('should fail with zero total', () => {
    const result = validateZATCACompliance({ sellerName: 'Test', vatRegistrationNumber: '310122393500003', timestamp: '2025-10-30', totalWithVAT: 0, vatAmount: 0 });
    expect(result.valid).toBe(false);
  });
});
