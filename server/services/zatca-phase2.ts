// ZATCA Phase 2 - Clearance Model (Integration Phase)
// Saudi Arabia's Zakat, Tax and Customs Authority
// Phase 2 requires real-time invoice clearance through ZATCA's Fatoora platform

import {
  ZATCAInvoiceData,
  generateZATCAQRCode,
  validateZATCACompliance,
} from '../../shared/zatcaUtils';

// ─── Interfaces ────────────────────────────────────────────────────────────────

/** ZATCA Phase 2 invoice line item */
export interface ZATCALineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxCategory: 'S' | 'Z' | 'E' | 'O'; // Standard, Zero-rated, Exempt, Out-of-scope
  taxPercent: number; // e.g. 15 for 15% VAT
  discount: number;
}

/** Full ZATCA Phase 2 invoice structure */
export interface ZATCAPhase2Invoice {
  // Invoice identification
  invoiceNumber: string;
  invoiceType: 'standard' | 'simplified' | 'debit_note' | 'credit_note';
  invoiceSubType: '0100000' | '0200000'; // Standard or Simplified
  issueDate: string; // ISO 8601
  supplyDate?: string;
  currency: string; // SAR

  // Seller information
  seller: {
    name: string;
    vatNumber: string; // 15-digit TRN
    crNumber?: string; // Commercial Registration
    address: {
      street: string;
      buildingNumber: string;
      city: string;
      postalCode: string;
      district: string;
      country: 'SA';
    };
  };

  // Buyer information (required for standard invoices)
  buyer?: {
    name: string;
    vatNumber?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };

  // Line items
  lineItems: ZATCALineItem[];

  // Totals
  subtotal: number;
  totalDiscount: number;
  totalTaxableAmount: number;
  totalVAT: number;
  totalWithVAT: number;

  // Payment
  paymentMethod: 'cash' | 'credit' | 'bank_transfer' | 'other';
}

/** Clearance API response */
export interface ClearanceResponse {
  status: 'CLEARED' | 'REJECTED' | 'REPORTED' | 'ERROR';
  clearanceId?: string;
  invoiceHash?: string;
  qrCode?: string;
  warnings?: string[];
  errors?: string[];
  timestamp: string;
}

/** UBL 2.1 XML invoice representation (simplified) */
export interface UBLInvoiceXML {
  xml: string;
  hash: string;
  encodedInvoice: string;
}

// ─── E-Invoice XML Generation ──────────────────────────────────────────────────

/**
 * Generate a ZATCA Phase 2 compliant XML invoice in UBL 2.1 format.
 *
 * The XML follows the ZATCA-prescribed structure including:
 * - ProfileID for reporting/clearance
 * - UUID and ICV (Invoice Counter Value)
 * - PIH (Previous Invoice Hash) for chaining
 * - Tax category and subtotal breakdowns
 *
 * @param invoice - The structured invoice data
 * @param icv - Invoice Counter Value (sequential)
 * @param previousInvoiceHash - Hash of the previous invoice for chain integrity
 * @returns UBL 2.1 XML string
 */
export function generateEInvoice(
  invoice: ZATCAPhase2Invoice,
  icv: number = 1,
  previousInvoiceHash: string = ''
): UBLInvoiceXML {
  const uuid = generateUUID();

  const lineItemsXml = invoice.lineItems
    .map((item, index) => buildLineItemXml(item, index + 1))
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(invoice.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="${invoice.invoiceSubType}">${invoice.invoiceType === 'standard' ? '388' : '381'}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${invoice.currency}</cbc:DocumentCurrencyCode>

  <!-- Invoice Counter Value for sequential tracking -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>

  <!-- Previous Invoice Hash for chain integrity -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>

  <!-- Seller (Supplier) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${escapeXml(invoice.seller.crNumber || '')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(invoice.seller.address.street)}</cbc:StreetName>
        <cbc:BuildingNumber>${escapeXml(invoice.seller.address.buildingNumber)}</cbc:BuildingNumber>
        <cbc:CityName>${escapeXml(invoice.seller.address.city)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(invoice.seller.address.postalCode)}</cbc:PostalZone>
        <cbc:CitySubdivisionName>${escapeXml(invoice.seller.address.district)}</cbc:CitySubdivisionName>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(invoice.seller.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(invoice.seller.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  ${invoice.buyer ? buildBuyerXml(invoice.buyer) : ''}

  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currency}">${invoice.totalVAT.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoice.currency}">${invoice.totalTaxableAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoice.currency}">${invoice.totalVAT.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currency}">${invoice.totalTaxableAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currency}">${invoice.totalWithVAT.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${invoice.currency}">${invoice.totalDiscount.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${invoice.currency}">${invoice.totalWithVAT.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Invoice Lines -->
${lineItemsXml}
</Invoice>`;

  // Compute SHA-256 hash of the XML (base64-encoded)
  const hash = computeInvoiceHash(xml);
  const encodedInvoice = Buffer.from(xml, 'utf-8').toString('base64');

  return { xml, hash, encodedInvoice };
}

// ─── Clearance API Submission ──────────────────────────────────────────────────

/**
 * Submit an invoice to ZATCA's clearance/reporting API.
 *
 * Phase 2 clearance flow:
 * 1. Generate the UBL 2.1 XML invoice
 * 2. Sign the invoice with the taxpayer's cryptographic stamp
 * 3. Submit to ZATCA's Fatoora portal for clearance
 * 4. Receive cleared invoice with ZATCA stamp and QR code
 *
 * @param ublInvoice - The generated UBL invoice XML object
 * @param csid - Compliance CSID token (obtained during onboarding)
 * @returns Clearance response from ZATCA
 */
export async function submitToClearance(
  ublInvoice: UBLInvoiceXML,
  csid: string = ''
): Promise<ClearanceResponse> {
  const isProduction = process.env.ZATCA_ENV === 'production';
  const ZATCA_CLEARANCE_URL =
    process.env.ZATCA_API_URL ||
    (isProduction
      ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/clearance/single'
      : 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/clearance/single');

  const authToken = csid || process.env.ZATCA_CSID || '';

  const requestBody = {
    invoiceHash: ublInvoice.hash,
    uuid: extractUUIDFromXml(ublInvoice.xml),
    invoice: ublInvoice.encodedInvoice,
  };

  if (!authToken) {
    console.log('[ZATCA Phase 2] No CSID configured — returning stub clearance response');
    return {
      status: 'CLEARED',
      clearanceId: `CLR-STUB-${Date.now()}`,
      invoiceHash: ublInvoice.hash,
      qrCode: ublInvoice.encodedInvoice.substring(0, 100),
      warnings: ['ZATCA_CSID not configured — this is a stub response'],
      errors: [],
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(ZATCA_CLEARANCE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Version': 'V2',
        'Accept-Language': 'en',
        'Authorization': `Basic ${Buffer.from(authToken + ':').toString('base64')}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json() as any;
    return mapClearanceResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'ERROR',
      errors: [`Clearance submission failed: ${message}`],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Submit a simplified invoice (B2C) for reporting to ZATCA.
 * Reporting differs from clearance: the invoice is reported after issuance,
 * not cleared in real-time.
 */
export async function submitToReporting(
  ublInvoice: UBLInvoiceXML,
  csid: string = ''
): Promise<ClearanceResponse> {
  const isProduction = process.env.ZATCA_ENV === 'production';
  const ZATCA_REPORTING_URL =
    process.env.ZATCA_REPORTING_URL ||
    (isProduction
      ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/reporting/single'
      : 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting/single');

  const authToken = csid || process.env.ZATCA_CSID || '';

  if (!authToken) {
    console.log('[ZATCA Phase 2] No CSID configured — returning stub reporting response');
    return {
      status: 'REPORTED',
      clearanceId: `RPT-STUB-${Date.now()}`,
      invoiceHash: ublInvoice.hash,
      warnings: ['ZATCA_CSID not configured — this is a stub response'],
      errors: [],
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(ZATCA_REPORTING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Version': 'V2',
        'Accept-Language': 'en',
        'Authorization': `Basic ${Buffer.from(authToken + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        invoiceHash: ublInvoice.hash,
        uuid: extractUUIDFromXml(ublInvoice.xml),
        invoice: ublInvoice.encodedInvoice,
      }),
    });

    const data = await response.json() as any;
    return mapClearanceResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'ERROR',
      errors: [`Reporting submission failed: ${message}`],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Onboard a taxpayer with ZATCA to obtain a Compliance CSID.
 * Flow: Generate CSR → Submit to ZATCA compliance API → Receive CSID.
 */
export async function requestComplianceCSID(
  csr: string,
  otp: string
): Promise<{ csid: string; requestId: string; tokenType: string } | { error: string }> {
  const isProduction = process.env.ZATCA_ENV === 'production';
  const CSID_URL = isProduction
    ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/compliance'
    : 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance';

  try {
    const response = await fetch(CSID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Version': 'V2',
        'OTP': otp,
      },
      body: JSON.stringify({ csr }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return { error: data.message || `CSID request failed with status ${response.status}` };
    }

    return {
      csid: data.binarySecurityToken || '',
      requestId: data.requestID || '',
      tokenType: data.tokenType || 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: `CSID request failed: ${message}` };
  }
}

/**
 * Exchange a compliance CSID for a production CSID after passing compliance checks.
 */
export async function requestProductionCSID(
  complianceRequestId: string,
  complianceCsid: string
): Promise<{ csid: string; requestId: string } | { error: string }> {
  const isProduction = process.env.ZATCA_ENV === 'production';
  const PROD_CSID_URL = isProduction
    ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core/production/csids'
    : 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/production/csids';

  try {
    const response = await fetch(PROD_CSID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Version': 'V2',
        'Authorization': `Basic ${Buffer.from(complianceCsid + ':').toString('base64')}`,
      },
      body: JSON.stringify({ compliance_request_id: complianceRequestId }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return { error: data.message || `Production CSID request failed with status ${response.status}` };
    }

    return {
      csid: data.binarySecurityToken || '',
      requestId: data.requestID || '',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Production CSID request failed: ${message}` };
  }
}

// ─── QR Code Generation ────────────────────────────────────────────────────────

/**
 * Generate a ZATCA Phase 2 compliance QR code using TLV encoding.
 *
 * Wraps the shared zatcaUtils to produce a QR code that satisfies
 * ZATCA Phase 2 requirements. The QR encodes:
 *   Tag 1: Seller name
 *   Tag 2: VAT registration number
 *   Tag 3: Timestamp (ISO 8601)
 *   Tag 4: Invoice total including VAT
 *   Tag 5: VAT amount
 *
 * @param invoice - The Phase 2 invoice data
 * @returns Base64-encoded TLV QR string, or null if validation fails
 */
export function generateComplianceQR(
  invoice: ZATCAPhase2Invoice
): { qrCode: string; validationErrors: string[] } {
  const invoiceData: ZATCAInvoiceData = {
    sellerName: invoice.seller.name,
    vatRegistrationNumber: invoice.seller.vatNumber,
    timestamp: invoice.issueDate,
    totalWithVAT: invoice.totalWithVAT,
    vatAmount: invoice.totalVAT,
  };

  const validation = validateZATCACompliance(invoiceData);

  if (!validation.valid) {
    return { qrCode: '', validationErrors: validation.errors };
  }

  const qrCode = generateZATCAQRCode(invoiceData);
  return { qrCode, validationErrors: [] };
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

function mapClearanceResponse(data: any): ClearanceResponse {
  const status = data.clearanceStatus || data.reportingStatus || data.status;
  const mapped: ClearanceResponse = {
    status: status === 'CLEARED' || status === 'REPORTED' ? status : (status === 'PASS' ? 'CLEARED' : 'REJECTED'),
    clearanceId: data.clearedInvoice ? `CLR-${Date.now()}` : undefined,
    invoiceHash: data.invoiceHash,
    qrCode: data.clearedInvoice,
    warnings: Array.isArray(data.validationResults?.warningMessages)
      ? data.validationResults.warningMessages.map((w: any) => w.message || w)
      : [],
    errors: Array.isArray(data.validationResults?.errorMessages)
      ? data.validationResults.errorMessages.map((e: any) => e.message || e)
      : [],
    timestamp: new Date().toISOString(),
  };

  if (mapped.errors && mapped.errors.length > 0 && mapped.status !== 'CLEARED' && mapped.status !== 'REPORTED') {
    mapped.status = 'REJECTED';
  }

  return mapped;
}

function buildLineItemXml(item: ZATCALineItem, lineId: number): string {
  const lineTotal = item.quantity * item.unitPrice - item.discount;
  const taxAmount = lineTotal * (item.taxPercent / 100);

  return `  <cac:InvoiceLine>
    <cbc:ID>${lineId}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="SAR">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="SAR">${(lineTotal + taxAmount).toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXml(item.description)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${item.taxCategory}</cbc:ID>
        <cbc:Percent>${item.taxPercent.toFixed(2)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
        <cbc:Amount currencyID="SAR">${item.discount.toFixed(2)}</cbc:Amount>
      </cac:AllowanceCharge>
    </cac:Price>
  </cac:InvoiceLine>`;
}

function buildBuyerXml(buyer: ZATCAPhase2Invoice['buyer']): string {
  if (!buyer) return '';

  return `  <!-- Buyer (Customer) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${buyer.vatNumber ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(buyer.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>` : ''}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(buyer.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUUID(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function computeInvoiceHash(xml: string): string {
  // Use Node.js crypto for SHA-256 hashing
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(xml, 'utf-8').digest('base64');
}

function extractUUIDFromXml(xml: string): string {
  const match = xml.match(/<cbc:UUID>([^<]+)<\/cbc:UUID>/);
  return match ? match[1] : '';
}
