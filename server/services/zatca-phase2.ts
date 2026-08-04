// ZATCA Phase 2 - Clearance Model (Integration Phase)
// Saudi Arabia's Zakat, Tax and Customs Authority
// Phase 2 requires real-time invoice clearance through ZATCA's Fatoora platform

import crypto from 'crypto';
import {
  ZATCAInvoiceData,
  generateZATCAQRCode,
  validateZATCACompliance,
} from '../../shared/zatcaUtils';
import {
  getZatcaSigningConfig,
  signInvoiceHash,
  getPublicKeyDer,
  getCertificateSignature,
} from './zatca-signing';

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

// ─── Chain + endpoint constants ────────────────────────────────────────────────

/**
 * PIH for the very first invoice in a chain: base64 of the sha256 hex digest
 * of "0", per the ZATCA XML implementation standard.
 */
export const ZATCA_INITIAL_PIH = Buffer.from(
  crypto.createHash('sha256').update('0', 'utf-8').digest('hex'),
  'utf-8',
).toString('base64');

/**
 * FATOORA endpoint for an invoice type. Standard (B2B) invoices go through
 * real-time CLEARANCE; simplified (B2C) invoices are REPORTED within 24h.
 * ZATCA_API_BASE selects the environment:
 *   developer-portal (sandbox, default) · simulation · core (production)
 */
export function zatcaEndpointFor(invoiceType: ZATCAPhase2Invoice['invoiceType']): string {
  const base =
    process.env.ZATCA_API_BASE ||
    'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal';
  return invoiceType === 'simplified'
    ? `${base}/invoices/reporting/single`
    : `${base}/invoices/clearance/single`;
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
  previousInvoiceHash: string = ZATCA_INITIAL_PIH
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
  csid: string = '',
  invoiceType: ZATCAPhase2Invoice['invoiceType'] = 'standard',
): Promise<ClearanceResponse> {
  // Standard invoices → clearance, simplified → reporting. ZATCA_API_URL
  // overrides the full URL; otherwise ZATCA_API_BASE selects the environment.
  const ZATCA_CLEARANCE_URL = process.env.ZATCA_API_URL || zatcaEndpointFor(invoiceType);

  // The CSID (binary security token) comes from ZATCA onboarding —
  // run server/scripts/zatca-onboard.ts once credentials are issued.
  const authToken = csid || process.env.ZATCA_CSID || '';
  const secret = process.env.ZATCA_SECRET || '';

  const requestBody = {
    invoiceHash: ublInvoice.hash,
    uuid: extractUUIDFromXml(ublInvoice.xml),
    invoice: ublInvoice.encodedInvoice,
  };

  try {
    // Key-deferred: when a CSID is configured we call the real FATOORA
    // clearance API; otherwise we return a prepared/stub response so the flow
    // is exercisable end-to-end without ZATCA onboarding. Set ZATCA_CSID (and
    // ZATCA_API_URL for sandbox vs production) to go live.
    if (authToken) {
      const response = await fetch(ZATCA_CLEARANCE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Version': 'V2',
          'Accept-Language': 'en',
          'Authorization': `Basic ${Buffer.from(`${authToken}:${secret}`).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          status: 'ERROR',
          invoiceHash: ublInvoice.hash,
          errors: [data?.message || `ZATCA clearance HTTP ${response.status}`],
          timestamp: new Date().toISOString(),
        };
      }
      return {
        status:
          data?.clearanceStatus === 'CLEARED' || data?.clearanceStatus === 'CLEARED_WITH_WARNINGS'
            ? 'CLEARED'
            : data?.reportingStatus === 'REPORTED' || data?.reportingStatus === 'REPORTED_WITH_WARNINGS'
              ? 'REPORTED'
              : 'ERROR',
        clearanceId: data?.clearanceId || data?.invoiceHash,
        invoiceHash: data?.invoiceHash || ublInvoice.hash,
        qrCode: data?.qrCode,
        warnings: data?.validationResults?.warningMessages || [],
        errors: data?.validationResults?.errorMessages || [],
        timestamp: new Date().toISOString(),
      };
    }

    // No CSID configured — prepared/stub response for development.
    console.log('[ZATCA Phase 2] Clearance prepared (no CSID — stub):', {
      endpoint: ZATCA_CLEARANCE_URL,
      invoiceHash: ublInvoice.hash,
    });
    return {
      status: 'CLEARED',
      clearanceId: `CLR-STUB-${ublInvoice.hash.substring(0, 8)}`,
      invoiceHash: ublInvoice.hash,
      qrCode: ublInvoice.encodedInvoice.substring(0, 100),
      warnings: ['ZATCA_CSID not configured — this is a development stub, not a real clearance.'],
      errors: [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'ERROR',
      errors: [`Clearance submission failed: ${message}`],
      timestamp: new Date().toISOString(),
    };
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
  invoice: ZATCAPhase2Invoice,
  ubl?: UBLInvoiceXML,
): { qrCode: string; validationErrors: string[]; signed: boolean } {
  const invoiceData: ZATCAInvoiceData = {
    sellerName: invoice.seller.name,
    vatRegistrationNumber: invoice.seller.vatNumber,
    timestamp: invoice.issueDate,
    totalWithVAT: invoice.totalWithVAT,
    vatAmount: invoice.totalVAT,
  };

  const validation = validateZATCACompliance(invoiceData);

  if (!validation.valid) {
    return { qrCode: '', validationErrors: validation.errors, signed: false };
  }

  // With a signing key configured and a generated UBL invoice on hand,
  // produce the full phase-2 stamp QR (tags 1–9); otherwise fall back to
  // the phase-1 QR (tags 1–5).
  const signing = getZatcaSigningConfig();
  if (signing && ubl) {
    try {
      const qrCode = generatePhase2QR(invoiceData, ubl.hash, signing.privateKeyPem, signing.certificatePem);
      return { qrCode, validationErrors: [], signed: true };
    } catch (err) {
      console.error('[ZATCA] phase-2 QR signing failed, falling back to phase-1 QR:', err);
    }
  }

  const qrCode = generateZATCAQRCode(invoiceData);
  return { qrCode, validationErrors: [], signed: false };
}

// ─── Phase-2 (signed) QR — TLV tags 1–9 ───────────────────────────────────────

/** One TLV entry with a binary-capable value. Length is a single byte per spec. */
export function tlvEntry(tag: number, value: string | Buffer): Buffer {
  const bytes = typeof value === 'string' ? Buffer.from(value, 'utf-8') : value;
  if (bytes.length > 255) throw new Error(`TLV tag ${tag} value exceeds 255 bytes`);
  return Buffer.concat([Buffer.from([tag, bytes.length]), bytes]);
}

/** Decode a TLV buffer into a tag → bytes map (QR readers + tests). */
export function decodeTlv(base64: string): Map<number, Buffer> {
  const buf = Buffer.from(base64, 'base64');
  const out = new Map<number, Buffer>();
  let i = 0;
  while (i + 2 <= buf.length) {
    const tag = buf[i];
    const len = buf[i + 1];
    out.set(tag, buf.subarray(i + 2, i + 2 + len));
    i += 2 + len;
  }
  return out;
}

/**
 * Build the signed phase-2 QR:
 *   1 seller name · 2 VAT number · 3 timestamp · 4 total · 5 VAT amount
 *   6 invoice hash · 7 ECDSA signature · 8 public key (DER SPKI)
 *   9 certificate signature (simplified invoices, when the CSID cert is set)
 */
export function generatePhase2QR(
  data: ZATCAInvoiceData,
  invoiceHashBase64: string,
  privateKeyPem: string,
  certificatePem?: string,
): string {
  const signature = signInvoiceHash(invoiceHashBase64, privateKeyPem);
  const publicKeyDer = getPublicKeyDer(privateKeyPem);

  const entries = [
    tlvEntry(1, data.sellerName),
    tlvEntry(2, data.vatRegistrationNumber),
    tlvEntry(3, data.timestamp),
    tlvEntry(4, data.totalWithVAT.toFixed(2)),
    tlvEntry(5, data.vatAmount.toFixed(2)),
    tlvEntry(6, invoiceHashBase64),
    tlvEntry(7, Buffer.from(signature, 'base64')),
    tlvEntry(8, publicKeyDer),
  ];
  if (certificatePem) {
    entries.push(tlvEntry(9, getCertificateSignature(certificatePem)));
  }
  return Buffer.concat(entries).toString('base64');
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

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
  return crypto.randomUUID();
}

function computeInvoiceHash(xml: string): string {
  return crypto.createHash('sha256').update(xml, 'utf-8').digest('base64');
}

function extractUUIDFromXml(xml: string): string {
  const match = xml.match(/<cbc:UUID>([^<]+)<\/cbc:UUID>/);
  return match ? match[1] : '';
}
