# SALIS AUTO — Accountant & Finance Manager Guide

**Document Type:** Training Manual  
**Audience:** Accountants, Finance Managers, Garage Owners reviewing finances  
**Level:** Advanced  
**Version:** 14.0.0  

---

## Introduction

SALIS AUTO includes a full double-entry accounting system designed for Saudi Arabian automotive businesses. This guide covers daily accounting operations, month-end close procedures, and Saudi compliance requirements.

---

## Chapter 1: Financial Module Overview

The accounting module is organized into several areas:
- **Chart of Accounts** — Account definitions
- **Journal Entries** — Transaction recording
- **Accounts Receivable** — Customer invoices and collections
- **Accounts Payable** — Supplier bills and payments
- **Banking** — Bank accounts and reconciliation
- **Financial Reports** — P&L, Balance Sheet, Cash Flow
- **Compliance** — VAT, Zakat, ZATCA

---

## Chapter 2: Daily Operations

### 2.1 Processing Customer Invoices

**From Job Card:**
1. When a job card is marked as "Completed"
2. Go to **Invoices** → the invoice is auto-generated from the job card
3. Review line items (labor + parts)
4. Verify VAT calculation (15%)
5. Click **Send to Customer** (email + portal)
6. For ZATCA compliance: click **Submit to ZATCA**

**Manual Invoice:**
1. Go to **Invoices → New Invoice**
2. Select customer and link to job card (optional)
3. Add line items manually
4. Apply discounts if applicable
5. VAT auto-calculated
6. Finalize and send

### 2.2 Recording Payments

When a customer pays:
1. Go to **Payments → Record Payment**
2. Select the invoice
3. Choose payment method: Cash / Bank Transfer / Stripe / PayPal
4. Enter amount received
5. Record payment date
6. System marks invoice as paid and creates journal entry

### 2.3 Processing Supplier Invoices

1. Go to **Accounts Payable → New Bill**
2. Select supplier
3. Link to purchase order (for automatic matching)
4. Enter invoice items and amounts
5. Set payment due date
6. Click **Save**
7. Approve bill for payment

### 2.4 Paying Suppliers

1. Go to **Accounts Payable → Due Payments**
2. Select bills due for payment
3. Choose bank account for payment
4. Record bank transfer or issue check
5. System marks bill as paid and creates journal entry

---

## Chapter 3: Chart of Accounts

### 3.1 Account Structure (Saudi GAAP aligned)
```
1000 — Assets
  1100 — Current Assets
    1110 — Cash and Cash Equivalents
    1120 — Accounts Receivable
    1130 — Inventory (Spare Parts)
    1140 — Prepaid Expenses
  1200 — Fixed Assets
    1210 — Equipment and Machinery
    1220 — Vehicles
    1230 — Furniture and Fixtures

2000 — Liabilities
  2100 — Current Liabilities
    2110 — Accounts Payable
    2120 — VAT Payable
    2130 — Accrued Expenses
  2200 — Long-term Liabilities
    2210 — Bank Loans

3000 — Equity
  3100 — Owner's Capital
  3200 — Retained Earnings

4000 — Income
  4100 — Service Revenue (Labor)
  4200 — Parts Revenue
  4300 — Inspection Fees

5000 — Expenses
  5100 — Cost of Parts
  5200 — Labor Costs
  5300 — Rent
  5400 — Utilities
  5500 — Marketing
  5600 — Depreciation
```

### 3.2 Managing Accounts
1. Go to **Accounting → Chart of Accounts**
2. Click an account to view transactions
3. Add sub-accounts as needed
4. Do not delete accounts that have existing transactions

---

## Chapter 4: Journal Entries

### 4.1 Automatic Journal Entries
SALIS AUTO automatically creates journal entries for:
- Invoice creation and payment
- Inventory adjustments
- Payroll runs
- Depreciation (if configured)

### 4.2 Manual Journal Entries
For corrections or adjustments:
1. Go to **Accounting → Journal Entries**
2. Click **New Entry**
3. Select accounting date
4. Add debit and credit lines (must balance to zero)
5. Add description/reference
6. Click **Post**

Example — Recording a bank deposit:
```
Debit:  1110 Cash              SAR 5,000
Credit: 1120 Accounts Receivable SAR 5,000
Description: Receipt from Customer XYZ, Invoice #INV-001
```

---

## Chapter 5: Financial Reports

### 5.1 Income Statement (`/income-statement`)
Monthly P&L analysis:
- Revenue breakdown: labor vs. parts
- Cost of goods sold
- Gross profit margin
- Operating expenses
- Net profit/loss
- Comparison to prior period

**Recommended Review:** Monthly, by the 5th of the following month.

### 5.2 Balance Sheet (`/balance-sheet`)
Point-in-time financial position:
- Total assets
- Total liabilities
- Owner's equity
- Verify: Assets = Liabilities + Equity

**Recommended Review:** Monthly (end of month snapshot).

### 5.3 Cash Flow Statement (`/cash-flow-statement`)
Cash movement analysis:
- Operating activities (collections and payments)
- Investing activities (equipment purchases)
- Financing activities (loans)
- Net cash change

**Recommended Review:** Weekly (cash is king!).

### 5.4 Trial Balance (`/trial-balance`)
All accounts with debit/credit totals:
- Must balance (debits = credits)
- Run before month-end close
- Identify and correct any imbalances

### 5.5 Accounts Receivable Aging (`/accounts-receivable`)
Track outstanding customer invoices:
- 0–30 days
- 31–60 days
- 61–90 days
- 90+ days (overdue)

Take action on overdue accounts by sending reminders or engaging management.

---

## Chapter 6: VAT Management

### 6.1 VAT Configuration
Settings → Compliance → VAT Settings:
- VAT rate: 15% (Saudi standard rate)
- VAT registration number
- Reporting period (quarterly)

### 6.2 VAT on Invoices
Every finalized invoice automatically shows:
- Subtotal (before VAT)
- VAT amount (15%)
- Total (including VAT)
- ZATCA QR code

### 6.3 VAT Return Preparation
At end of each quarter:
1. Go to **Compliance → VAT Settings → VAT Report**
2. Review:
   - Output VAT (collected from customers)
   - Input VAT (paid to suppliers)
   - Net VAT payable to ZATCA
3. Export the ZATCA-formatted return
4. Submit via ZATCA portal or integrated API

---

## Chapter 7: ZATCA E-Invoicing

### 7.1 Phase 1 Compliance (QR Code)
Every invoice automatically generates a ZATCA-compliant QR code containing:
- Seller name
- VAT number
- Invoice date
- Total amount
- VAT amount

### 7.2 Phase 2 Compliance (Real-time Reporting)
For businesses above SAR 3 million annual revenue:
1. Configure ZATCA Phase 2 in Compliance Settings
2. Each invoice is submitted to ZATCA API in real time
3. ZATCA returns a cryptographic stamp
4. Stamped invoice is issued to customer

### 7.3 ZATCA Submission Status
Check submission status per invoice:
1. Open any invoice
2. See **ZATCA Status** field:
   - Pending → Submitted → Accepted / Rejected
3. For rejected invoices: review error message and resubmit

---

## Chapter 8: Zakat Calculation

For qualifying Saudi businesses:
1. Go to **Compliance → Zakat Settings**
2. Enter nisab (minimum threshold for obligation)
3. Enter zakatable assets (cash, receivables, inventory)
4. System calculates 2.5% Zakat obligation
5. Record payment when Zakat is paid

---

## Chapter 9: Month-End Close Checklist

Run through this checklist at month-end:

| Step | Action | Module |
|------|--------|--------|
| 1 | Post all pending journal entries | Journal Entries |
| 2 | Reconcile bank accounts | Bank Account Management |
| 3 | Review AR aging — follow up on overdue | Accounts Receivable |
| 4 | Process outstanding AP invoices | Accounts Payable |
| 5 | Run trial balance — verify it balances | Trial Balance |
| 6 | Review income statement vs. budget | Income Statement |
| 7 | Prepare VAT summary | VAT Settings |
| 8 | Submit ZATCA invoices if pending | ZATCA Settings |
| 9 | Lock period (if available) | Financial Settings |
| 10 | Distribute financial summary to management | Reports |

---

## Chapter 10: Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Trial balance doesn't balance | Unposted journal entries | Post all pending entries |
| VAT calculation wrong | Incorrect VAT rate configured | Check VAT Settings |
| ZATCA submission rejected | Invalid TRN or certificate | Verify compliance configuration |
| Invoice shows wrong price | Parts pricing not updated | Update spare parts pricing |
| Payroll figures wrong | Timesheet not approved | Approve pending timesheets |

---

*SALIS AUTO Accountant Guide — Version 14.0.0*
