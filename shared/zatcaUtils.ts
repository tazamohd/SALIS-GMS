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
  const tlvData: Buffer[] = [];

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
  const combined = Buffer.concat(tlvData);

  // Return Base64-encoded string
  return combined.toString('base64');
}

/**
 * Create a TLV (Tag-Length-Value) entry
 * @param tag - Tag number
 * @param value - Value string
 * @returns Buffer containing TLV entry
 */
function createTLV(tag: number, value: string): Buffer {
  const valueBuffer = Buffer.from(value, 'utf8');
  const length = valueBuffer.length;

  const tlv = Buffer.allocUnsafe(2 + length);
  tlv.writeUInt8(tag, 0);
  tlv.writeUInt8(length, 1);
  valueBuffer.copy(tlv, 2);

  return tlv;
}

/**
 * Decode ZATCA QR code (for testing/verification)
 * @param base64QR - Base64-encoded QR code
 * @returns Decoded invoice data
 */
export function decodeZATCAQRCode(base64QR: string): Partial<ZATCAInvoiceData> {
  const buffer = Buffer.from(base64QR, 'base64');
  const result: Partial<ZATCAInvoiceData> = {};
  
  let offset = 0;
  
  while (offset < buffer.length) {
    const tag = buffer.readUInt8(offset);
    const length = buffer.readUInt8(offset + 1);
    const value = buffer.toString('utf8', offset + 2, offset + 2 + length);
    
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
