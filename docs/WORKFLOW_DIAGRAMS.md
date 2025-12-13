# SALIS AUTO - Workflow Diagrams & Process Flows

## Overview

This document provides visual process flow documentation for SALIS AUTO's core garage operations, covering the complete customer journey from intake to service completion.

---

## 1. Customer Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY OVERVIEW                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  INTAKE  │────▶│ SERVICE  │────▶│ QUALITY  │────▶│ DELIVERY │
    │          │     │          │     │          │     │          │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
         │                │                │                │
         ▼                ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │Appointment│    │Job Card  │     │Inspection│     │Invoice   │
    │Booking   │     │Execution │     │& QC      │     │& Payment │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## 2. Appointment Booking Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPOINTMENT BOOKING FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

Customer Request                 System Processing                   Confirmation
      │                                │                                  │
      ▼                                ▼                                  ▼
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ Customer  │───▶│ Check     │───▶│ Assign    │───▶│ Create    │───▶│ Send      │
│ Request   │    │ Available │    │ Bay &     │    │ Appoint-  │    │ Confirm-  │
│ Service   │    │ Slots     │    │ Technician│    │ ment      │    │ ation SMS │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
                       │
                       ▼
                 ┌───────────┐
                 │ Calendar  │
                 │ Integration│
                 │ (Google)  │
                 └───────────┘

CHANNELS:
  • Walk-in → Reception Desk → Direct Entry
  • Phone → Call Center → Agent Booking
  • Online → Customer Portal → Self-Service
  • Mobile → PWA App → Self-Service
```

---

## 3. Vehicle Check-In Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VEHICLE CHECK-IN FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Arrival                    Inspection                    Documentation
   │                           │                              │
   ▼                           ▼                              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Vehicle │──▶│ License │──▶│ Digital │──▶│ Damage  │──▶│ Create  │
│ Arrives │   │ Plate   │   │ Walk-   │   │ Assess- │   │ Check-In│
│         │   │ Scan    │   │ around  │   │ ment    │   │ Record  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                  │              │              │
                  ▼              ▼              ▼
             ┌─────────┐   ┌─────────┐   ┌─────────┐
             │   LPR   │   │  Photo  │   │   AI    │
             │ System  │   │ Capture │   │ Analysis│
             └─────────┘   └─────────┘   └─────────┘

OUTPUTS:
  • Vehicle identification verified
  • Pre-existing damage documented
  • Mileage/fuel level recorded
  • Customer signature captured
```

---

## 4. Job Card Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JOB CARD LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

CREATION ──────────────────────────────────────────────────────────▶ COMPLETION

┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ DRAFT   │──▶│ PENDING │──▶│   IN    │──▶│  QC     │──▶│ READY   │──▶│COMPLETED│
│         │   │APPROVAL │   │PROGRESS │   │ CHECK   │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼             ▼
 ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐
 │Estimate│   │Customer│   │Tech    │   │Quality │   │Customer│   │Invoice │
 │Created │   │Approval│   │Working │   │Inspec- │   │Notified│   │Created │
 └───────┘    └───────┘    └───────┘    │tion    │   └───────┘    └───────┘
                                        └───────┘

STATUS TRANSITIONS:
  Draft → Pending: Estimate sent to customer
  Pending → In Progress: Customer approves
  In Progress → QC: Work completed
  QC → Ready: Inspection passed
  Ready → Completed: Vehicle delivered
```

---

## 5. Parts Ordering Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PARTS ORDERING FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Requirement                  Sourcing                      Fulfillment
     │                          │                              │
     ▼                          ▼                              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Part    │──▶│ Check   │──▶│ Create  │──▶│ Receive │──▶│ Assign  │
│ Required│   │ Stock   │   │ Purchase│   │ & QC    │   │ to Job  │
│ for Job │   │ Level   │   │ Order   │   │         │   │ Card    │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                  │              │
                  ▼              ▼
             ┌─────────┐   ┌─────────┐
             │In Stock │   │ Multi-  │
             │→ Reserve│   │ Supplier│
             └─────────┘   │ Query   │
                          └─────────┘

AI FEATURES:
  • Smart Parts Recommendations
  • Inventory Forecasting
  • Multi-supplier price comparison
  • Auto-reorder triggers
```

---

## 6. Invoice & Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INVOICE & PAYMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

Job Completion                Payment                      Closure
      │                          │                           │
      ▼                          ▼                           ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│Generate │──▶│ Send to │──▶│ Payment │──▶│ Record  │──▶│ Close   │
│ Invoice │   │ Customer│   │ Process │   │ Receipt │   │ Job     │
│         │   │         │   │         │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │
     ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ VAT     │   │ Email / │   │ Stripe  │
│ Calc.   │   │ SMS     │   │ PayPal  │
│ ZATCA   │   │ Portal  │   │ Cash    │
└─────────┘   └─────────┘   └─────────┘

SAUDI COMPLIANCE:
  • VAT calculation (15%)
  • ZATCA e-invoicing
  • QR code generation
  • TRN validation
```

---

## 7. Technician Assignment Flow (AI-Powered)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   SMART JOB ASSIGNMENT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Job Requirements              AI Analysis                  Assignment
      │                           │                            │
      ▼                           ▼                            ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Job     │──▶│ Analyze │──▶│ Match   │──▶│ Rank    │──▶│ Assign  │
│ Details │   │ Skills  │   │ Avail-  │   │ Techni- │   │ & Notify│
│ Entered │   │ Required│   │ ability │   │ cians   │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                  │              │              │
                  ▼              ▼              ▼
             ┌─────────┐   ┌─────────┐   ┌─────────┐
             │ OpenAI  │   │ Calendar│   │ Score   │
             │ GPT-5   │   │ Check   │   │ Factors │
             └─────────┘   └─────────┘   └─────────┘

SCORING FACTORS:
  • Skill match (certifications)
  • Current workload
  • Historical performance
  • Bay availability
  • Priority level
```

---

## 8. Customer Portal Self-Service Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CUSTOMER PORTAL SELF-SERVICE                               │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │ Customer Login  │
                        │ /client/login   │
                        └────────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     │  Dashboard  │     │   Service   │     │   My       │
     │  Overview   │     │   History   │     │  Vehicles  │
     └─────────────┘     └─────────────┘     └─────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     │ Live Track  │     │  Reminders  │     │  Invoices  │
     │ Service     │     │  & Alerts   │     │  & Payments│
     └─────────────┘     └─────────────┘     └─────────────┘
            │                    │                    │
            └────────────────────┴────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Reviews & Chat  │
                        │ Support         │
                        └─────────────────┘
```

---

## 9. Blockchain Service History Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN SERVICE HISTORY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Service Event              Blockchain                    Verification
      │                        │                             │
      ▼                        ▼                             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Service │──▶│ Create  │──▶│  Add    │──▶│Generate │──▶│ Verify  │
│Completed│   │ Record  │   │  Block  │   │  Hash   │   │ Chain   │
│         │   │         │   │         │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘

BENEFITS:
  • Tamper-proof records
  • Complete service history
  • Vehicle value verification
  • Insurance documentation
  • Ownership transfer proof
```

---

## 10. Navigation Workflow Groups

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   18 WORKFLOW-BASED NAVIGATION GROUPS                        │
└─────────────────────────────────────────────────────────────────────────────┘

OPERATIONAL FLOW:
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ 1. Dash-   │ 2. Customer│ 3. Vehicle │ 4. Inspect │ 5. Diagnos-│
│ board &    │ Intake &   │ Management │ & Check-In │ tics &     │
│ Overview   │ Appointments│           │            │ Assessment │
└────────────┴────────────┴────────────┴────────────┴────────────┘
       │            │            │            │            │
       ▼            ▼            ▼            ▼            ▼
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ 6. Service │ 7. Parts & │ 8. Service │ 9. Quality │10. Billing │
│ Planning & │ Inventory  │ Execution  │ & Delivery │ & Payments │
│ Scheduling │            │ & Ops      │            │            │
└────────────┴────────────┴────────────┴────────────┴────────────┘
       │            │            │            │            │
       ▼            ▼            ▼            ▼            ▼
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│11. Analyt- │12. Customer│13. Team &  │14. Compli- │15. Enter-  │
│ ics & BI   │ Experience │ HR Mgmt    │ ance &     │ prise &    │
│            │ & Growth   │            │ Safety     │ Franchise  │
└────────────┴────────────┴────────────┴────────────┴────────────┘
       │            │            │
       ▼            ▼            ▼
┌────────────┬────────────┬────────────┐
│16. Emerging│17. AI &    │18. System  │
│ Tech       │ Automation │ & Settings │
│            │ Hub        │            │
└────────────┴────────────┴────────────┘
```

---

## 11. Accounting Cycle Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ACCOUNTING CYCLE FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Transaction Entry            Processing                    Reporting
      │                          │                             │
      ▼                          ▼                             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Source  │──▶│ Journal │──▶│ General │──▶│ Trial   │──▶│Financial│
│ Document│   │ Entry   │   │ Ledger  │   │ Balance │   │ Reports │
│         │   │         │   │         │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│Invoice  │   │ Debit/  │   │ Account │   │ Verify  │   │• Income │
│Receipt  │   │ Credit  │   │ Balances│   │ Accuracy│   │  Stmt   │
│Bill     │   │ Posted  │   │ Updated │   │         │   │• Balance│
│         │   │         │   │         │   │         │   │  Sheet  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   │• Cash   │
                                                        │  Flow   │
                                                        └─────────┘

SOURCE DOCUMENTS:
  • Invoices → Accounts Receivable
  • Bills → Accounts Payable
  • Receipts → Cash Management
  • Payroll → Expense Tracking

SAUDI COMPLIANCE:
  • VAT 15% automatic calculation
  • ZATCA e-invoice integration
  • Hijri date support
  • Arabic financial statements
```

---

## 12. Accounts Receivable Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ACCOUNTS RECEIVABLE FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Service Completion           Invoicing                    Collection
      │                          │                             │
      ▼                          ▼                             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Job     │──▶│ Create  │──▶│ Send to │──▶│ Payment │──▶│ Record  │
│ Complete│   │ Invoice │   │ Customer│   │ Received│   │ Receipt │
│         │   │         │   │         │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                  │              │              │             │
                  ▼              ▼              ▼             ▼
             ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
             │ VAT 15% │   │ SMS/    │   │ Stripe/ │   │ Journal │
             │ Applied │   │ Email   │   │ PayPal  │   │ Entry   │
             │ ZATCA QR│   │ Portal  │   │ Cash    │   │ Posted  │
             └─────────┘   └─────────┘   └─────────┘   └─────────┘

AGING BUCKETS:
  • Current (0-30 days)
  • 31-60 days overdue
  • 61-90 days overdue
  • 90+ days overdue
```

---

## 13. Accounts Payable Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ACCOUNTS PAYABLE FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Purchase                    Processing                    Payment
   │                            │                            │
   ▼                            ▼                            ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Receive │──▶│ Match   │──▶│ Approve │──▶│ Schedule│──▶│ Execute │
│ Invoice │   │ to PO   │   │ Payment │   │ Payment │   │ Payment │
│         │   │         │   │         │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Vendor  │   │ 3-Way   │   │ Manager │   │ Due     │   │ Bank    │
│ Bill    │   │ Match   │   │ Sign-off│   │ Date    │   │ Transfer│
│ Entry   │   │ Check   │   │         │   │ Queue   │   │ Record  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘

3-WAY MATCHING:
  • Purchase Order
  • Goods Receipt
  • Vendor Invoice
```

---

## 14. Budget Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BUDGET MANAGEMENT FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Planning                    Execution                    Analysis
   │                            │                            │
   ▼                            ▼                            ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Create  │──▶│ Approve │──▶│ Monitor │──▶│ Analyze │──▶│ Adjust  │
│ Budget  │   │ Budget  │   │ Spending│   │ Variance│   │ Forecast│
│         │   │         │   │         │   │         │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Revenue │   │ Finance │   │ Real-   │   │ Over/   │   │ Rolling │
│ & Cost  │   │ Manager │   │ time    │   │ Under   │   │ Forecast│
│ Centers │   │ Sign-off│   │ Tracking│   │ Budget  │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘

BUDGET TYPES:
  • Operating Budget (expenses)
  • Capital Budget (investments)
  • Cash Budget (liquidity)
  • Department Budgets (cost centers)
```

---

## Related Documentation

- [Sidebar Organization](../SIDEBAR_ORGANIZATION.md)
- [Platform Navigation Guide](../PLATFORM-NAVIGATION-GUIDE.md)
- [User Manual](../USER-MANUAL.md)
- [System Overview](../SYSTEM-OVERVIEW.md)
- [Accounting Modules](../ACCOUNTING_MODULES.md)

---

*Last Updated: December 2025*
*SALIS AUTO v1.1 - 151+ Modules*
