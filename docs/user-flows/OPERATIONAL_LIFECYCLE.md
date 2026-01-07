# SALIS AUTO - Operational Lifecycle Flows

## Overview

This document covers the complete operational lifecycle from customer acquisition through service delivery and retention. Each flow includes user scenarios, system processes, and exception handling.

---

## 1. Customer Acquisition & Intake

### Flow: New Customer Registration

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Customer       │     │  Service        │     │   System        │
│  Arrives        │────▶│  Advisor        │────▶│   Creates       │
│                 │     │  Greets         │     │   Profile       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌─────────────────┐            │
                        │  Vehicle        │◀───────────┘
                        │  Registration   │
                        └─────────────────┘
```

#### Scenario 1.1: Walk-in Customer
**Preconditions**: Customer arrives at service center without appointment
**Steps**:
1. Service Advisor greets customer at reception
2. Advisor collects customer information (name, phone, email)
3. System creates customer profile with unique ID
4. Advisor registers vehicle (make, model, year, VIN, plate)
5. System performs VIN decode for vehicle specifications
6. Advisor documents customer concerns/requests
7. System creates preliminary job card
8. Customer receives SMS confirmation with ticket number

**Postconditions**: Customer and vehicle registered, job card created
**Exceptions**:
- Duplicate customer: Link to existing profile
- Invalid VIN: Manual vehicle entry with verification

#### Scenario 1.2: Online Appointment Booking
**Preconditions**: Customer has internet access
**Steps**:
1. Customer visits client portal or booking page
2. Selects service type from catalog
3. Chooses preferred date and time slot
4. Enters contact information
5. Adds vehicle details (existing or new)
6. System checks technician availability
7. System confirms appointment slot
8. Customer receives email/SMS confirmation
9. Reminder sent 24 hours before appointment

**Postconditions**: Appointment scheduled, calendar updated
**Exceptions**:
- No availability: Suggest alternative times
- Existing customer: Pre-fill information

#### Scenario 1.3: Phone Booking
**Preconditions**: Customer calls service center
**Steps**:
1. Call center agent answers (tracked in call center module)
2. Agent searches for existing customer record
3. If new, creates customer profile during call
4. Agent checks availability in workshop calendar
5. Books appointment in scheduling system
6. System sends confirmation to customer
7. Call logged in CRM with recording

**Postconditions**: Appointment booked, call documented

---

## 2. Vehicle Check-In & Inspection

### Flow: Vehicle Reception

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Customer       │     │  Digital        │     │   Multi-Point   │
│  Arrives        │────▶│  Check-in       │────▶│   Inspection    │
│                 │     │  Kiosk          │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Service Bay    │◀────│  Photos &       │◀───────────┘
│  Assignment     │     │  Documentation  │
└─────────────────┘     └─────────────────┘
```

#### Scenario 2.1: Kiosk Self Check-In
**Preconditions**: Customer has appointment, kiosk available
**Steps**:
1. Customer arrives and approaches kiosk
2. Scans QR code from appointment confirmation
3. Kiosk displays appointment details for verification
4. Customer confirms or updates contact information
5. System prints key tag with service ticket number
6. Customer hands keys to service advisor
7. System updates job card status to "Checked In"
8. Service advisor notified of arrival

**Postconditions**: Vehicle checked in, key secured
**Exceptions**:
- No QR code: Manual search by phone/email
- Walk-in: Create new appointment via kiosk

#### Scenario 2.2: Multi-Point Inspection
**Preconditions**: Vehicle checked in, technician assigned
**Steps**:
1. Technician receives inspection assignment on mobile device
2. Opens digital inspection checklist
3. Inspects exterior: body damage, tires, lights
4. Inspects interior: dashboard warnings, upholstery
5. Inspects under hood: fluids, belts, battery
6. Inspects undercarriage: suspension, exhaust, brakes
7. Documents findings with photos/videos
8. AI assists with damage assessment
9. System generates inspection report
10. Report sent to service advisor for customer discussion

**Postconditions**: Inspection complete, findings documented
**Exceptions**:
- Critical safety issue: Flag for immediate attention
- Customer decline additional work: Document refusal

---

## 3. Diagnostics & Assessment

### Flow: OBD Diagnostics

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Connect        │     │  Read           │     │   AI Analysis   │
│  OBD Scanner    │────▶│  DTCs           │────▶│   & Report      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Service        │◀────│  Technician     │◀───────────┘
│  Recommendations│     │  Review         │
└─────────────────┘     └─────────────────┘
```

#### Scenario 3.1: Standard OBD Scan
**Preconditions**: Vehicle has OBD-II port, scanner available
**Steps**:
1. Technician connects OBD scanner to vehicle
2. System reads all DTCs (Diagnostic Trouble Codes)
3. DTCs logged in diagnostics hub
4. AI analyzes codes for common patterns
5. System suggests probable causes
6. Technician verifies with manual inspection
7. Additional tests performed if needed
8. Final diagnosis documented

**Postconditions**: Vehicle diagnosed, issues identified
**Exceptions**:
- Communication error: Check connections, try again
- No DTCs but symptoms exist: Perform manual diagnosis

#### Scenario 3.2: Advanced Diagnostics
**Preconditions**: Complex issue, standard diagnosis inconclusive
**Steps**:
1. Technician escalates to senior technician
2. Access OEM-specific diagnostic software
3. Perform module-specific scans
4. Review live sensor data
5. Compare with known-good values
6. Identify failing component
7. Document diagnostic path
8. Create detailed repair plan

**Postconditions**: Root cause identified
**Exceptions**:
- Intermittent fault: Set up data logging
- Unknown issue: Contact technical support

---

## 4. Service Planning & Estimation

### Flow: Estimate Creation

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Review         │     │  Add Labor      │     │   Add Parts     │
│  Diagnosis      │────▶│  Operations     │────▶│   & Materials   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Customer       │◀────│  Calculate      │◀───────────┘
│  Approval       │     │  Total & VAT    │
└─────────────────┘     └─────────────────┘
```

#### Scenario 4.1: Standard Service Estimate
**Preconditions**: Diagnosis complete, service advisor ready
**Steps**:
1. Advisor reviews diagnostic findings
2. Selects applicable service templates
3. System pre-fills labor times from database
4. Advisor adds or adjusts labor items
5. System suggests required parts (AI-powered)
6. Advisor confirms parts availability
7. System calculates subtotals
8. VAT (15%) applied automatically
9. Estimate saved and PDF generated
10. Estimate sent to customer via email/SMS/WhatsApp

**Postconditions**: Estimate created, pending approval
**Exceptions**:
- Parts not in stock: Show ETA, offer alternatives
- Price exceeds customer budget: Offer payment plans

#### Scenario 4.2: Video Estimate Consultation
**Preconditions**: Customer not present, video capability available
**Steps**:
1. Service advisor initiates video call
2. Technician shows customer the issues on vehicle
3. Advisor explains repairs in simple terms
4. Customer sees live demonstration of problems
5. Advisor presents estimate on shared screen
6. Customer asks questions
7. Customer provides verbal or digital approval
8. Approval recorded in system with timestamp

**Postconditions**: Estimate approved via video
**Exceptions**:
- Connection issues: Reschedule or use photos
- Customer wants second opinion: Document and follow up

---

## 5. Parts & Inventory Management

### Flow: Parts Procurement

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Parts          │     │  Check Local    │     │   Check         │
│  Request        │────▶│  Inventory      │────▶│   Network       │
│                 │     │                 │     │   Suppliers     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Receive &      │◀────│  Create         │◀───────────┘
│  Allocate       │     │  Purchase Order │
└─────────────────┘     └─────────────────┘
```

#### Scenario 5.1: Parts Available in Stock
**Preconditions**: Part needed for job, inventory has stock
**Steps**:
1. Technician requests part via mobile app
2. System checks local inventory
3. Part located in warehouse
4. Parts staff retrieves part
5. Barcode scanned for allocation
6. Part assigned to job card
7. Inventory count decremented
8. Part delivered to service bay

**Postconditions**: Part allocated to job
**Exceptions**:
- Wrong part: Return and reallocate
- Damaged part: Report and get replacement

#### Scenario 5.2: Parts Not in Stock - Auto Reorder
**Preconditions**: Stock below reorder point
**Steps**:
1. System detects low stock level
2. AI predicts demand based on history
3. Auto-reorder rule triggered
4. System selects preferred supplier
5. Purchase order auto-generated
6. PO sent to supplier electronically
7. Supplier confirms order and ETA
8. System updates expected delivery date
9. Inventory manager notified

**Postconditions**: Order placed, ETA set
**Exceptions**:
- Supplier out of stock: Try alternate supplier
- Price increase: Flag for manager approval

---

## 6. Service Execution

### Flow: Job Card Execution

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Assign to      │     │  Technician     │     │   Work in       │
│  Service Bay    │────▶│  Clocks In      │────▶│   Progress      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Quality        │◀────│  Work           │◀───────────┘
│  Check          │     │  Completed      │
└─────────────────┘     └─────────────────┘
```

#### Scenario 6.1: Standard Job Execution
**Preconditions**: Estimate approved, parts available, bay assigned
**Steps**:
1. Service manager assigns job to technician
2. Technician receives mobile notification
3. Vehicle moved to assigned service bay
4. System starts service bay session
5. Technician clocks in on job
6. Follows repair procedures (AR guide available)
7. Documents work with photos
8. Logs actual parts used
9. Notes any additional findings
10. Clocks out when complete
11. Updates job status to "Ready for QC"

**Postconditions**: Work completed, pending QC
**Exceptions**:
- Additional work needed: Pause job, create supplement
- Part doesn't fit: Document and order correct part

#### Scenario 6.2: Complex Repair with AR Assistance
**Preconditions**: Complex procedure, AR equipment available
**Steps**:
1. Technician opens AR repair guide
2. AR displays step-by-step overlay on vehicle
3. System shows torque specs, part locations
4. Technician follows guided procedure
5. Each step confirmed before proceeding
6. System logs completion of each step
7. Alerts if steps skipped or out of order
8. Final verification checklist displayed

**Postconditions**: Repair completed with AR guidance

---

## 7. Quality Control & Delivery

### Flow: Quality Inspection

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Job            │     │  QC Inspector   │     │   Inspection    │
│  Completed      │────▶│  Assigned       │────▶│   Checklist     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
            ┌───────────────────────────────────────────┤
            ▼                                           ▼
┌─────────────────┐                         ┌─────────────────┐
│  PASS:          │                         │  FAIL:          │
│  Ready for      │                         │  Return to      │
│  Delivery       │                         │  Technician     │
└─────────────────┘                         └─────────────────┘
```

#### Scenario 7.1: Quality Inspection - Pass
**Preconditions**: Job completed by technician
**Steps**:
1. QC inspector receives notification
2. Reviews work order and scope
3. Inspects completed repairs
4. Verifies all items on checklist
5. Test drives if applicable
6. Confirms all DTCs cleared
7. Documents with photos
8. Marks inspection as PASSED
9. Job status updated to "Ready for Delivery"
10. Customer notified

**Postconditions**: Vehicle ready for pickup
**Exceptions**:
- Minor issue found: Quick fix, re-inspect
- Documentation missing: Return to technician

#### Scenario 7.2: Vehicle Delivery
**Preconditions**: QC passed, invoice ready
**Steps**:
1. Customer arrives for pickup
2. Service advisor reviews completed work
3. Shows before/after photos
4. Explains any warranty on repairs
5. Presents final invoice
6. Processes payment (card/cash/Apple Pay)
7. Generates ZATCA-compliant invoice with QR
8. Customer signs digital acknowledgment
9. Keys returned to customer
10. Service bay session ended
11. Follow-up reminder scheduled

**Postconditions**: Vehicle delivered, payment received

---

## 8. Billing & Payments

### Flow: Invoice & Payment

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Generate       │     │  Apply          │     │   Apply         │
│  Invoice        │────▶│  VAT (15%)      │────▶│   Discounts     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Record         │◀────│  Process        │◀───────────┘
│  Payment        │     │  Payment        │
└─────────────────┘     └─────────────────┘
```

#### Scenario 8.1: Standard Invoice & Payment
**Preconditions**: Service complete, QC passed
**Steps**:
1. System generates invoice from job card
2. Labor and parts itemized
3. VAT calculated at 15%
4. Any discounts applied
5. Total calculated in SAR
6. ZATCA QR code generated
7. Invoice presented to customer
8. Customer selects payment method
9. Payment processed (Stripe/PayPal/Cash)
10. Receipt generated
11. Transaction recorded in ledger

**Postconditions**: Payment received, books updated
**Exceptions**:
- Payment declined: Try alternate method
- Partial payment: Record and schedule balance

#### Scenario 8.2: Warranty Claim
**Preconditions**: Work covered under warranty
**Steps**:
1. Service advisor verifies warranty coverage
2. Creates warranty claim in system
3. Links to original invoice
4. Documents failure and repair
5. Submits claim to warranty provider
6. No charge to customer for covered work
7. Credits applied when claim approved

**Postconditions**: Warranty claim submitted

---

## 9. Customer Retention & Loyalty

### Flow: Loyalty Program

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Transaction    │     │  Calculate      │     │   Update        │
│  Complete       │────▶│  Points         │────▶│   Tier          │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌─────────────────┐            │
│  Notify         │◀────│  Check          │◀───────────┘
│  Customer       │     │  Rewards        │
└─────────────────┘     └─────────────────┘
```

#### Scenario 9.1: Points Accumulation
**Preconditions**: Customer is loyalty member
**Steps**:
1. Transaction completed
2. System calculates points (1 SAR = 1 point)
3. Points added to customer account
4. System checks for tier promotion
5. If threshold reached, upgrade tier
6. Customer notified of points earned
7. New balance displayed

**Postconditions**: Points added, tier updated
**Tiers**:
- Bronze: 0-999 points
- Silver: 1,000-4,999 points (5% discount)
- Gold: 5,000-9,999 points (10% discount)
- Platinum: 10,000+ points (15% discount)

#### Scenario 9.2: Service Reminder
**Preconditions**: Vehicle has service schedule
**Steps**:
1. System checks upcoming service dates
2. 30 days before: First reminder sent
3. 7 days before: Second reminder
4. 1 day before: Final reminder
5. Customer clicks to book
6. Pre-filled appointment form
7. Easy one-click booking

**Postconditions**: Customer reminded, booking encouraged

---

## Exception Handling Summary

| Exception | Handler | Escalation |
|-----------|---------|------------|
| Customer complaint | Service Advisor | Service Manager |
| Payment failure | Finance | Finance Manager |
| Quality failure | QC Inspector | Service Manager |
| Parts shortage | Inventory | Purchase Agent |
| Technician unavailable | Service Manager | HR Manager |
| System downtime | IT Support | System Admin |

