// ZATCA E-Invoicing QR Code Generation (Fatoora)
// Saudi Arabia's Zakat, Tax and Customs Authority requirements
// QR Code Format: Base64-encoded TLV (Tag-Length-Value)

export interface ZATCAInvoiceData {
  sellerName: string;
  vatRegistrationNumber: string;
  timestamp: string;
  totalWithVAT: number;
  vatAmount: number;
}

/**
 * Generate ZATCA-compliant QR code data (Base64 TLV format)
 * Browser-compatible implementation using Uint8Array
 * 
 * Tags:
 * 1 = Seller name
 * 2 = VAT registration number (TRN)
 * 3 = Timestamp
 * 4 = Total with VAT
 * 5 = VAT amount
 * 
 * @param data - Invoice data for QR code
 * @returns Base64-encoded TLV string
 */
export function generateZATCAQRCode(data: ZATCAInvoiceData): string {
  const tlvData: Uint8Array[] = [];

  // Tag 1: Seller name
  tlvData.push(createTLV(1, data.sellerName));

  // Tag 2: VAT registration number
  tlvData.push(createTLV(2, data.vatRegistrationNumber));

  // Tag 3: Timestamp (ISO 8601 format)
  tlvData.push(createTLV(3, data.timestamp));

  // Tag 4: Total with VAT
  tlvData.push(createTLV(4, data.totalWithVAT.toFixed(2)));

  // Tag 5: VAT amount
  tlvData.push(createTLV(5, data.vatAmount.toFixed(2)));

  // Combine all TLV entries
  const totalLength = tlvData.reduce((sum, arr) => sum + arr.length, 0);
  const combined = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const tlv of tlvData) {
    combined.set(tlv, offset);
    offset += tlv.length;
  }

  // Return Base64-encoded string (browser-compatible)
  return arrayBufferToBase64(combined);
}

/**
 * Create a TLV (Tag-Length-Value) entry
 * Browser-compatible using Uint8Array
 * @param tag - Tag number
 * @param value - Value string
 * @returns Uint8Array containing TLV entry
 */
function createTLV(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBuffer = encoder.encode(value);
  const length = valueBuffer.length;

  const tlv = new Uint8Array(2 + length);
  tlv[0] = tag;
  tlv[1] = length;
  tlv.set(valueBuffer, 2);

  return tlv;
}

/**
 * Convert Uint8Array to Base64 string (universal: works in browser AND Node.js)
 * @param buffer - Uint8Array buffer
 * @returns Base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  // Check if running in Node.js (Buffer available)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  
  // Browser environment (use btoa)
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array (universal: works in browser AND Node.js)
 * @param base64 - Base64 string
 * @returns Uint8Array buffer
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  // Check if running in Node.js (Buffer available)
  if (typeof Buffer !== 'undefined') {
    const nodeBuffer = Buffer.from(base64, 'base64');
    return new Uint8Array(nodeBuffer);
  }
  
  // Browser environment (use atob)
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode ZATCA QR code (for testing/verification)
 * Browser-compatible using Uint8Array
 * @param base64QR - Base64-encoded QR code
 * @returns Decoded invoice data
 */
export function decodeZATCAQRCode(base64QR: string): Partial<ZATCAInvoiceData> {
  const buffer = base64ToArrayBuffer(base64QR);
  const decoder = new TextDecoder();
  const result: Partial<ZATCAInvoiceData> = {};
  
  let offset = 0;
  
  while (offset < buffer.length) {
    const tag = buffer[offset];
    const length = buffer[offset + 1];
    const valueBytes = buffer.slice(offset + 2, offset + 2 + length);
    const value = decoder.decode(valueBytes);
    
    switch (tag) {
      case 1:
        result.sellerName = value;
        break;
      case 2:
        result.vatRegistrationNumber = value;
        break;
      case 3:
        result.timestamp = value;
        break;
      case 4:
        result.totalWithVAT = parseFloat(value);
        break;
      case 5:
        result.vatAmount = parseFloat(value);
        break;
    }
    
    offset += 2 + length;
  }
  
  return result;
}

/**
 * Validate ZATCA compliance fields
 * @param data - Invoice data
 * @returns Validation result with errors
 */
export function validateZATCACompliance(data: Partial<ZATCAInvoiceData>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.sellerName || data.sellerName.trim().length === 0) {
    errors.push('Seller name is required');
  }

  if (!data.vatRegistrationNumber || !/^\d{15}$/.test(data.vatRegistrationNumber)) {
    errors.push('Valid 15-digit VAT registration number (TRN) is required');
  }

  if (!data.timestamp) {
    errors.push('Timestamp is required');
  }

  if (data.totalWithVAT === undefined || data.totalWithVAT <= 0) {
    errors.push('Total with VAT must be greater than 0');
  }

  if (data.vatAmount === undefined || data.vatAmount < 0) {
    errors.push('VAT amount must be 0 or greater');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
