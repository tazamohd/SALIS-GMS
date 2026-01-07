# SALIS AUTO - Compliance & Localization Flows

## Overview

SALIS AUTO is fully compliant with Saudi Arabian regulations including ZATCA E-Invoicing (Fatoorah), VAT, and Zakat requirements. This document details all compliance-related flows and localization features.

---

## 1. ZATCA E-Invoicing (Phase 2)

### Overview
ZATCA (Zakat, Tax and Customs Authority) mandates electronic invoicing for all businesses in Saudi Arabia. Phase 2 requires integration with ZATCA's system for real-time invoice clearance.

### Configuration: `/zatca-settings`

---

### Flow 1.1: Standard Tax Invoice Generation

**Trigger**: Invoice finalized for customer

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Generate     │───▶│ Sign with    │───▶│ Generate     │
│ Invoice      │    │ Certificate  │    │ QR Code      │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  XML Created         Hash Added          Submit to ZATCA
```

**Steps**:
1. Service completed, invoice triggered
2. System generates invoice data:
   - Invoice number (sequential, unique)
   - Date and time
   - Seller details (TRN, address)
   - Buyer details (if B2B)
   - Line items with individual VAT
   - Total amounts
3. Invoice converted to XML (UBL 2.1 format)
4. Digital signature applied using certificate
5. Cryptographic hash generated
6. QR code created containing:
   - Seller name (Arabic)
   - VAT number
   - Timestamp
   - Invoice total with VAT
   - VAT amount
   - Hash
7. For B2B invoices: Submit to ZATCA for clearance
8. For B2C invoices: Report within 24 hours
9. Store clearance response
10. Generate PDF with QR code

**User Scenarios**:
- Standard service invoice
- Parts-only sale
- Multi-line invoice
- Invoice with discounts

---

### Flow 1.2: Simplified Tax Invoice (B2C)

**Trigger**: Cash/card payment at counter

**Steps**:
1. Transaction completed
2. Generate simplified invoice:
   - Seller name and VAT number
   - Date and time
   - Total with VAT
   - VAT amount
   - QR code
3. Sign digitally
4. Generate QR code
5. Print/email to customer
6. Report to ZATCA (within 24 hours)

**User Scenarios**:
- Walk-in customer payment
- Small purchases
- Quick oil change

---

### Flow 1.3: Credit Note Generation

**Trigger**: Refund or adjustment needed

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Reference    │───▶│ Generate     │───▶│ Submit to    │
│ Original     │    │ Credit Note  │    │ ZATCA        │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Steps**:
1. Identify original invoice
2. Select reason for credit:
   - Full refund
   - Partial refund
   - Price adjustment
   - Error correction
3. Enter credit amount
4. System generates credit note
5. Links to original invoice
6. Apply digital signature
7. Generate QR code
8. Submit to ZATCA
9. Update accounting records
10. Process refund if applicable

**User Scenarios**:
- Customer refund
- Price correction
- Service warranty claim
- Billing error

---

### Flow 1.4: Debit Note Generation

**Trigger**: Additional charge needed

**Steps**:
1. Reference original invoice
2. Add additional items/charges
3. Generate debit note
4. Link to original
5. Sign and generate QR
6. Submit to ZATCA
7. Send to customer

**User Scenarios**:
- Additional work discovered
- Price increase
- Underbilling correction

---

### Flow 1.5: ZATCA Submission & Clearance

**Trigger**: B2B invoice generated

**Steps**:
1. Invoice XML prepared
2. Certificate authentication
3. Submit to ZATCA portal (API)
4. ZATCA validates:
   - XML structure
   - Signature validity
   - Business registration
   - VAT calculations
5. Response received:
   - Cleared: Get clearance number
   - Rejected: Get error codes
6. If cleared:
   - Store clearance ID
   - Update invoice status
   - Invoice deliverable
7. If rejected:
   - Parse error details
   - Correct issues
   - Resubmit

**Error Handling**:
- Invalid XML: Check format, regenerate
- Signature error: Verify certificate
- Calculation error: Recalculate VAT
- Duplicate: Check sequence numbers

---

## 2. VAT Management

### Configuration: `/vat-settings`

---

### Flow 2.1: VAT on Sales

**Trigger**: Any taxable sale

**Steps**:
1. Item/service added to invoice
2. System identifies VAT rate:
   - Standard (15%): Most services/parts
   - Zero (0%): Exports, specific exemptions
3. Calculate VAT per line item
4. Sum total VAT
5. Display breakdown:
   - Subtotal (excl. VAT)
   - VAT amount
   - Total (incl. VAT)
6. Apply to invoice
7. Record for reporting

**User Scenarios**:
- Standard service (15% VAT)
- Export service (0% VAT)
- Mixed rate invoice

---

### Flow 2.2: VAT on Purchases

**Trigger**: Purchase from supplier

**Steps**:
1. Receive supplier invoice
2. Verify supplier VAT number
3. Extract VAT amount
4. Record as input VAT
5. Available for offset against output VAT

**User Scenarios**:
- Parts purchase
- Equipment purchase
- Consumables

---

### Flow 2.3: VAT Return Preparation

**Trigger**: End of VAT period (quarterly)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Gather       │───▶│ Calculate    │───▶│ Generate     │
│ Transactions │    │ Net VAT      │    │ Return       │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Verify Data       Review Summary      Submit to ZATCA
```

**Steps**:
1. System compiles all transactions
2. Categorize by VAT rate
3. Calculate:
   - Total output VAT (collected)
   - Total input VAT (paid)
   - Net VAT (output - input)
4. Generate summary report
5. Finance reviews accuracy
6. Approve return
7. Submit via ZATCA portal
8. Pay net VAT if positive
9. Claim refund if negative

**User Scenarios**:
- Net VAT payable
- Net VAT refund
- Zero return

---

## 3. Zakat Management

### Configuration: `/zakat-settings`

---

### Flow 3.1: Zakat Calculation

**Trigger**: Annual fiscal year end

**Steps**:
1. Identify zakatable assets:
   - Cash and bank balances
   - Accounts receivable
   - Inventory (spare parts)
   - Investments
2. Identify deductions:
   - Short-term liabilities
   - Advance payments
3. Calculate zakat base
4. Apply 2.5% rate (based on Hijri year)
5. Generate zakat report
6. Submit to ZATCA
7. Pay zakat due

**User Scenarios**:
- Annual zakat calculation
- Interim estimate
- Amendment submission

---

### Flow 3.2: Zakat Certificate

**Trigger**: After zakat payment

**Steps**:
1. Zakat paid to ZATCA
2. Request zakat certificate
3. Certificate issued by ZATCA
4. Store in system
5. Use for:
   - Government contracts
   - Banking requirements
   - Legal compliance

---

## 4. Arabic Language Support

### Configuration: Language Toggle in UI

---

### Flow 4.1: Language Switching

**Trigger**: User changes language preference

**Steps**:
1. User clicks language toggle
2. Select Arabic (العربية)
3. System updates:
   - UI language
   - Text direction (RTL)
   - Date format
   - Number format
4. All labels translated
5. Preference saved to profile

**Coverage**:
- 235+ pages translated
- 2000+ translation keys
- RTL layout support
- Arabic fonts loaded

---

### Flow 4.2: Bilingual Documents

**Trigger**: Generate customer document

**Steps**:
1. Generate invoice/estimate
2. System includes:
   - Arabic text (primary)
   - English text (secondary)
3. Company name in both languages
4. Items in both languages
5. Legal text in Arabic
6. PDF generated with proper fonts

**Documents Covered**:
- Invoices
- Estimates
- Receipts
- Contracts
- Service reports

---

## 5. Hijri Calendar Integration

### Configuration: System Settings

---

### Flow 5.1: Date Display

**Trigger**: Display any date

**Steps**:
1. Date retrieved from database (Gregorian)
2. Convert to Hijri using algorithm
3. Display based on user preference:
   - Hijri only
   - Gregorian only
   - Both (dual display)

**Example**:
- Gregorian: 2026-01-07
- Hijri: 1447-07-07

---

### Flow 5.2: Date Input

**Trigger**: User enters date

**Steps**:
1. User opens date picker
2. Can switch between Hijri/Gregorian
3. Select date in preferred calendar
4. System converts to standard format
5. Stored in Gregorian (database)
6. Displayed in user preference

**User Scenarios**:
- Book appointment using Hijri
- Set service reminder
- Schedule payment

---

### Flow 5.3: Reporting with Hijri

**Trigger**: Generate financial report

**Steps**:
1. Select report period
2. Choose calendar type
3. System generates with:
   - Hijri date headers
   - Gregorian in parentheses
4. Fiscal year alignment
5. Quarter calculations based on Hijri

---

## 6. Localized Export Services

### Flow 6.1: PDF Export (Arabic)

**Steps**:
1. Select document to export
2. System generates PDF:
   - Arabic text (RTL)
   - Proper Arabic fonts
   - ZATCA QR code
   - Company logo
3. Download or email

---

### Flow 6.2: Excel Export (Bilingual)

**Steps**:
1. Select data to export
2. Choose language preference
3. System generates Excel:
   - Column headers in Arabic
   - Data in original format
   - RTL cell formatting
   - Number formatting for SAR

---

## 7. Compliance Dashboard

### Location: `/compliance-management`

### Metrics Displayed:
- ZATCA submission status
- Pending invoices for submission
- VAT return status
- Zakat certificate expiry
- Compliance alerts

### Alerts:
- Invoice submission overdue
- VAT return deadline approaching
- Certificate expiring
- Audit scheduled

---

## Compliance Checklist

| Requirement | Status | Configuration |
|-------------|--------|---------------|
| ZATCA E-Invoicing Phase 2 | ✅ | `/zatca-settings` |
| Digital Signature Certificate | ✅ | Uploaded |
| QR Code Generation | ✅ | Automatic |
| VAT 15% Rate | ✅ | `/vat-settings` |
| VAT Registration (TRN) | ✅ | Configured |
| Zakat Calculation | ✅ | `/zakat-settings` |
| Arabic Language | ✅ | 100% coverage |
| Hijri Calendar | ✅ | Dual display |
| RTL Layout | ✅ | Automatic |

---

## Regulatory References

- ZATCA E-Invoicing: [zatca.gov.sa](https://zatca.gov.sa)
- VAT Regulations: Royal Decree M/113
- Zakat Guidelines: ZATCA Zakat Guide
- Data Protection: Saudi Data & AI Authority

