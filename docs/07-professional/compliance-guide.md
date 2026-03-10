# SALIS AUTO — Saudi Arabia Compliance Guide

**Document Type:** Professional — Compliance Guide  
**Version:** 14.0.0  
**Jurisdiction:** Kingdom of Saudi Arabia  
**Regulatory Authority:** ZATCA (Zakat, Tax and Customs Authority)  

---

## Introduction

SALIS AUTO is purpose-built for the Saudi Arabian regulatory environment. This guide covers all compliance features and how they ensure your garage operates fully within the Kingdom's tax and commercial laws.

---

## 1. ZATCA E-Invoicing Compliance

### Background
ZATCA (Zakat, Tax and Customs Authority) mandates electronic invoicing for all VAT-registered businesses above specified thresholds. The mandate was implemented in two phases:
- **Phase 1** (December 2021): Generate and store e-invoices with QR code
- **Phase 2** (January 2023 onwards): Real-time integration with ZATCA API

### SALIS AUTO Implementation

#### Phase 1 — QR Code Invoices
Every invoice generated in SALIS AUTO automatically includes:
1. **ZATCA QR code** embedded in the invoice PDF
2. **Structured data format** — Seller name, VAT number, invoice date, total, VAT amount
3. **Sequential numbering** — Unbroken invoice number series
4. **Archiving** — All invoices archived for minimum 5 years (Saudi regulation)

#### Phase 2 — Real-Time Reporting
For businesses in Phase 2 scope:
1. Invoice data transmitted to ZATCA API at time of issuance
2. ZATCA returns a cryptographic stamp (UUID + QR code hash)
3. Stamped invoice issued to customer
4. SALIS AUTO stores submission status and response

### Certification Status
SALIS AUTO is ZATCA-certified for both Phase 1 and Phase 2 e-invoicing.

### ZATCA Invoice Requirements Met
- [x] Seller name (Arabic + English)
- [x] Seller VAT registration number (15 digits)
- [x] Invoice date (Gregorian and Hijri)
- [x] Sequential invoice number
- [x] Invoice total (SAR)
- [x] VAT amount (SAR)
- [x] VAT registration number of seller
- [x] QR code (Phase 1 minimum)
- [x] ZATCA cryptographic stamp (Phase 2)
- [x] Buyer TRN (for B2B transactions)

---

## 2. Value Added Tax (VAT)

### Overview
Saudi Arabia implemented VAT at 5% in January 2018, increased to 15% in July 2020. All VAT-registered businesses must:
- Charge VAT on taxable supplies
- Claim input VAT on business purchases
- File quarterly VAT returns
- Maintain VAT records for 5 years

### SALIS AUTO VAT Features

**Automatic VAT Calculation:**
All invoices automatically apply the configured VAT rate (15%) to:
- Labor charges
- Parts and materials
- Inspection fees
- Any other taxable service

**VAT Exemptions:**
Some supplies may be zero-rated or exempt. Configure in VAT Settings:
- Export services (zero-rated)
- International transportation (zero-rated)

**VAT Return Preparation:**
At end of each quarter:
1. Go to Compliance → VAT Settings → VAT Report
2. System calculates:
   - Output VAT (collected from customers)
   - Input VAT (paid to suppliers, recoverable)
   - Net VAT payable to ZATCA
3. Export in ZATCA-accepted format
4. Review and submit via ZATCA portal

### VAT Registration Requirements
- Annual revenue exceeding SAR 375,000: **Mandatory**
- Annual revenue SAR 187,500–375,000: **Optional**
- Below SAR 187,500: **Exempt**

---

## 3. Zakat

### Overview
Zakat is an Islamic mandatory charitable contribution calculated at 2.5% of zakatable assets for Saudi-national-owned businesses. ZATCA collects both VAT and Zakat.

### Zakatable Assets
| Asset | Included in Zakat Base |
|-------|----------------------|
| Cash and bank balances | Yes |
| Trade receivables | Yes |
| Inventory (cost value) | Yes |
| Short-term investments | Yes |
| Fixed assets | No (used in production) |
| Accounts payable | Deductible |
| Short-term loans | Deductible |

### SALIS AUTO Zakat Features
1. Go to Compliance → Zakat Settings
2. Enter current period asset and liability values
3. System calculates: `(Zakatable Assets - Zakatable Liabilities) × 2.5%`
4. Annual Zakat amount displayed
5. Record payment when submitted to ZATCA

---

## 4. Saudi Labor Law Compliance

SALIS AUTO's HR module ensures compliance with Saudi Labor Law:

### Working Hours Compliance
- Standard hours: 48 hours/week (8 hours/day × 6 days)
- Ramadan hours: 36 hours/week
- Overtime: Mandatory 150% rate for additional hours
- Weekly rest day: Friday (compulsory)

### Employee Documentation
HR module tracks:
- Iqama (residency permit) validity for expatriates
- Work permit documentation
- Employment contract records

### End of Service Gratuity (EOSB)
Saudi law requires gratuity payment on termination:
| Service Period | Gratuity Rate |
|---------------|--------------|
| <2 years | No entitlement (unless dismissed by employer) |
| 2–5 years | 15 days' salary per year |
| >5 years | 30 days' salary per year |

---

## 5. GOSI (General Organization for Social Insurance)

### Contribution Rates
| Employee Type | Employee Share | Employer Share | Total |
|--------------|---------------|----------------|-------|
| Saudi national | 9.75% | 12.5% | 22.25% |
| Non-Saudi | 0% | 2% (work injury only) | 2% |

### SALIS AUTO HR Support
- Salary records maintained for GOSI calculation
- Monthly contribution report
- Saudi national identification (for correct rate)
- Note: GOSI submission itself goes through GOSI portal; SALIS AUTO provides the data

---

## 6. Commercial Registration

### Requirements
Every garage must have:
- **Commercial Registration (CR)** — issued by Ministry of Commerce
- **Municipal License** — issued by local municipality
- **Environmental Compliance Certificate** — from Ministry of Environment

### SALIS AUTO Compliance Tracking
Document management module stores:
- CR number and expiry date
- License renewal date alerts
- Environmental compliance records

---

## 7. Data Privacy (NCA)

### Saudi Data Governance Law
The National Cybersecurity Authority (NCA) and the Saudi Data Governance regulations impose requirements on businesses handling personal data.

### SALIS AUTO Data Privacy Features
- Customer data access restricted by role
- Data export only for authorized roles
- Audit log of all data access
- Data deletion capability for GDPR-equivalent requests
- Encrypted storage of sensitive data

---

## 8. Compliance Checklist for New Garages

| Requirement | Authority | SALIS AUTO Support |
|-------------|-----------|-------------------|
| VAT Registration | ZATCA | VAT Settings configuration |
| ZATCA E-Invoice Setup | ZATCA | ZATCA Settings + certification |
| Commercial Registration | Ministry of Commerce | Document management |
| Municipal License | Local Municipality | Expiry tracking |
| GOSI Registration | GOSI | Employee records + reports |
| Environmental Permit | Ministry of Environment | Compliance tracking |
| Fire Safety Certificate | Civil Defense | Document management |
| Labor Office Registration | Ministry of HR | Employee records |

---

## 9. Annual Compliance Calendar

| Month | Task | Authority |
|-------|------|-----------|
| January | File Q4 VAT return | ZATCA |
| March | Zakat return | ZATCA |
| April | File Q1 VAT return | ZATCA |
| July | File Q2 VAT return | ZATCA |
| October | File Q3 VAT return | ZATCA |
| December | Annual performance review compliance | Internal |
| Monthly | GOSI contributions (by 10th) | GOSI |
| As required | ZATCA e-invoice submissions | ZATCA |

---

*SALIS AUTO Saudi Arabia Compliance Guide — Version 14.0.0*
