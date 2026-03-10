# Screen Documentation — Section 07: Estimates & Invoices

**Screens:** 047–050  
**Section:** Billing & Payments  
**Navigation Group:** Billing & Payments  

---

## Screen 047 — Estimates (`/estimates`)

### Description
Customer quote management system for providing cost estimates before work begins.

### Estimate Lifecycle
```
Draft → Sent to Customer → 
├── Approved → Convert to Job Card → Invoice
└── Rejected → Revised Estimate or Cancelled
```

### Estimate Form Fields
- Customer and vehicle selection
- Line items: description, quantity, unit price
- Parts (linked to inventory)
- Labor (hours × rate)
- Discount (percentage or fixed)
- VAT (auto-calculated at 15%)
- Validity period (default 7 days)
- Notes for customer

### User Scenarios

**Scenario 1: Pre-Authorization Estimate**
> Customer calls about engine noise. Service advisor creates estimate for diagnostic + suspected timing chain issue: Labor 8 hours @ SAR 150 = SAR 1,200, Timing chain kit SAR 850, Total + VAT: SAR 2,357.50. Sent via email. Customer approves. Estimate converts to job card.

**Scenario 2: Insurance Estimate**
> Customer brings accident-damaged vehicle. Service advisor creates detailed estimate with photos. Exported as PDF for insurance submission.

---

## Screen 048 — Invoices (`/invoices`)

### Description
Complete invoice management — creation, tracking, ZATCA compliance, and payment recording.

### Invoice Sections
1. **Header** — Invoice number, date, garage details, ZATCA certificate
2. **Customer** — Name, address, TRN (if business)
3. **Line Items** — Service description, quantity, unit price
4. **Parts** — Parts replaced with SKU references
5. **Subtotal / Discount / VAT (15%) / Total**
6. **ZATCA QR Code** — Embedded for compliance
7. **Payment Terms** — Due date, bank details

### ZATCA QR Code Content
Base64-encoded TLV structure containing:
- Seller name
- VAT registration number
- Invoice date
- Total (including VAT)
- VAT amount

### User Scenarios

**Scenario 1: Auto-Generated Invoice**
> Job card completed. Service advisor clicks "Create Invoice" — all job card data (parts, labor, customer) auto-populates. Reviews, confirms, sends to customer. Customer receives email with PDF invoice + ZATCA QR code.

**Scenario 2: ZATCA Submission**
> Finance manager reviews all invoices for the day. Selects unsubmitted invoices, clicks "Submit to ZATCA." System submits via API, receives clearance stamps, updates invoice status to "ZATCA Accepted."

---

## Screen 049 — Video Estimates (`/video-estimates`)

### Description
Send video-based repair estimates to customers — show the actual issue, not just describe it.

### How Video Estimates Work
1. Technician records short video (30–120 seconds) showing the damaged component
2. Speaks audio explanation: "This is your brake pad — see how thin it is? It needs immediate replacement."
3. Video attached to estimate in system
4. Customer receives link to view video + estimate
5. Customer can approve/reject with one click

### Benefits
- 45% higher estimate approval rate (customers can see the issue)
- Reduces "I didn't know it was that bad" complaints
- Creates documentation for disputes

---

## Screen 050 — Video Consultations (`/video-consultations`)

### Description
Live video call capability for remote vehicle consultations.

### Use Cases
- **Remote Diagnosis** — Customer describes issue, advisor watches vehicle behavior via video
- **Insurance Adjusters** — Remote inspection without travel
- **Pre-purchase Inspection** — Buyer views vehicle remotely
- **Fleet Management** — Fleet manager reviews vehicle condition

---

*Screen Documentation 07 — Estimates & Invoices*
