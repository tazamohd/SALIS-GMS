# SALIS AUTO — Screenshots Library

**Platform Version:** 14.0.0
**Last Updated:** March 2026
**Total Modules Covered:** 18 workflow groups, 235 screens

---

## Overview

This directory is the centralized screenshots library for the SALIS AUTO Automotive ERP platform. Screenshots are organized by module, following the same 18 workflow-based navigation groups used in the sidebar. All screenshots should be captured at **1920×1080** resolution in **dark theme** with realistic sample data visible.

---

## Directory Structure

```
docs/screenshots/
├── README.md                        ← This file (master index)
├── dashboard/                       ← Dashboard & Overview screens
│   └── README.md
├── customers/                       ← Customer Intake, CRM, Feedback
│   └── README.md
├── vehicles/                        ← Vehicle Management, Fleet, Diagnostics
│   └── README.md
├── appointments/                    ← Appointments, Calendar, Scheduling
│   └── README.md
├── job-cards/                       ← Job Cards, Service Templates, Bay
│   └── README.md
├── invoices/                        ← Estimates, Invoices, Payments
│   └── README.md
├── payments/                        ← Payments, Stripe, Refunds
│   └── README.md
├── inventory/                       ← Inventory, Parts, Suppliers, Network
│   └── README.md
├── hr/                              ← HR Management, Staff, Timesheets
│   └── README.md
├── accounting/                      ← Full Accounting Suite (25+ screens)
│   └── README.md
├── reports/                         ← Analytics, BI, KPI, Reports
│   └── README.md
├── compliance/                      ← ZATCA, VAT, Zakat, ISO, Safety
│   └── README.md
├── ai-features/                     ← AI Automation, Chatbot, Voice, ML
│   └── README.md
├── settings/                        ← System Settings, RBAC, Integrations
│   └── README.md
├── technician-portal/               ← Technician Portal all tabs
│   └── README.md
└── client-portal/                   ← Client Portal all tabs
    └── README.md
```

---

## Screenshot Naming Convention

All screenshots must follow this naming pattern:

```
[module]-[screen-name]-[view].png
```

**Examples:**
- `dashboard-kpi-cards-overview.png`
- `accounting-general-ledger-main.png`
- `inventory-parts-list-filtered.png`
- `technician-portal-jobs-active.png`

---

## Capture Standards

| Property | Requirement |
|----------|-------------|
| Resolution | 1920×1080 (minimum) |
| Format | PNG |
| Theme | Dark (mandatory — SALIS AUTO default) |
| Language | English (primary) |
| Sample Data | Must be visible and realistic |
| Personal Data | Must NOT appear — use anonymized samples |
| Browser | Chrome / Chromium (consistent rendering) |
| Zoom | 100% browser zoom |

---

## Module-by-Module Screenshot Checklist

### Dashboard & Overview
- [ ] `dashboard/dashboard-home-welcome.png` — Welcome / role routing screen
- [ ] `dashboard/dashboard-main-kpi.png` — Main dashboard with KPI cards
- [ ] `dashboard/dashboard-kpi-metrics.png` — KPI Dashboard full view
- [ ] `dashboard/dashboard-service-bay.png` — Service Bay live dashboard
- [ ] `dashboard/dashboard-widgets-customize.png` — Widget customization

### Customer Management
- [ ] `customers/customers-list.png` — Customer list with search/filter
- [ ] `customers/customers-detail.png` — Customer profile detail
- [ ] `customers/customers-feedback.png` — Customer feedback & reviews
- [ ] `customers/customers-loyalty.png` — Loyalty program membership
- [ ] `customers/customers-ltv.png` — Customer LTV analysis
- [ ] `customers/customers-portal.png` — Customer self-service portal

### Vehicle Management
- [ ] `vehicles/vehicles-list.png` — Vehicle registry list
- [ ] `vehicles/vehicles-detail.png` — Vehicle detail with history
- [ ] `vehicles/vehicles-vin-decoder.png` — VIN decoder interface
- [ ] `vehicles/vehicles-health.png` — Vehicle health monitoring
- [ ] `vehicles/vehicles-fleet.png` — Fleet management view
- [ ] `vehicles/vehicles-inspections.png` — Inspection checklist

### Appointments & Scheduling
- [ ] `appointments/appointments-list.png` — Appointment list
- [ ] `appointments/appointments-calendar.png` — Calendar view
- [ ] `appointments/appointments-workshop.png` — Workshop calendar drag-drop
- [ ] `appointments/appointments-ai-schedule.png` — AI scheduling optimizer

### Job Cards & Service
- [ ] `job-cards/job-cards-list.png` — Job card list
- [ ] `job-cards/job-cards-detail.png` — Job card detail view
- [ ] `job-cards/job-cards-bay-dashboard.png` — Service bay live board
- [ ] `job-cards/job-cards-quality-control.png` — QC checklist

### Estimates & Invoices
- [ ] `invoices/estimates-list.png` — Estimates list
- [ ] `invoices/invoices-list.png` — Invoice list
- [ ] `invoices/invoices-detail.png` — Invoice detail with line items
- [ ] `invoices/invoices-zatca.png` — ZATCA e-invoice QR

### Payments
- [ ] `payments/payments-list.png` — Payments history
- [ ] `payments/payments-stripe.png` — Stripe payment processing
- [ ] `payments/payments-refunds.png` — Refund management

### Inventory & Parts
- [ ] `inventory/inventory-list.png` — Main inventory list
- [ ] `inventory/inventory-parts.png` — Parts availability
- [ ] `inventory/inventory-auto-reorder.png` — Auto reorder rules
- [ ] `inventory/inventory-suppliers.png` — Supplier list
- [ ] `inventory/inventory-purchase-orders.png` — Purchase orders
- [ ] `inventory/inventory-barcode.png` — Barcode scanner interface
- [ ] `inventory/inventory-network.png` — Parts supply network

### HR & Staff
- [ ] `hr/hr-management-overview.png` — HR dashboard
- [ ] `hr/hr-staff-directory.png` — Staff directory
- [ ] `hr/hr-scheduling.png` — Staff scheduling
- [ ] `hr/hr-timesheets.png` — Timesheet management
- [ ] `hr/hr-payroll.png` — Payroll management
- [ ] `hr/hr-leave.png` — Leave requests
- [ ] `hr/hr-training.png` — Training LMS

### Accounting (25 screens)
See [accounting/README.md](./accounting/README.md) for full details.

### Analytics & Reports
- [ ] `reports/reports-custom.png` — Custom report builder
- [ ] `reports/reports-bi-dashboard.png` — Business intelligence dashboard
- [ ] `reports/reports-kpi.png` — KPI dashboard
- [ ] `reports/reports-heatmap.png` — Business heat maps
- [ ] `reports/reports-profit.png` — Profit margin analysis

### Compliance & Safety
- [ ] `compliance/compliance-zatca.png` — ZATCA e-invoicing settings
- [ ] `compliance/compliance-vat.png` — VAT settings
- [ ] `compliance/compliance-zakat.png` — Zakat settings
- [ ] `compliance/compliance-iso.png` — ISO quality management
- [ ] `compliance/compliance-safety.png` — Safety incidents
- [ ] `compliance/compliance-environmental.png` — Environmental compliance

### AI & Automation
- [ ] `ai-features/ai-automation-hub.png` — AI automation dashboard
- [ ] `ai-features/ai-chatbot.png` — AI chatbot interface
- [ ] `ai-features/ai-voice.png` — Voice command interface
- [ ] `ai-features/ai-predictive.png` — Predictive diagnostics
- [ ] `ai-features/ai-fraud.png` — ML fraud detection

### Settings & System
- [ ] `settings/settings-system.png` — System settings overview
- [ ] `settings/settings-user.png` — User profile settings
- [ ] `settings/settings-rbac.png` — Role management
- [ ] `settings/settings-integrations.png` — Integrations management
- [ ] `settings/settings-security.png` — Security settings

### Technician Portal
- [ ] `technician-portal/tech-portal-dashboard.png` — Portal dashboard
- [ ] `technician-portal/tech-portal-jobs.png` — My jobs list
- [ ] `technician-portal/tech-portal-timeclock.png` — Time clock / check-in

### Client Portal
- [ ] `client-portal/client-portal-dashboard.png` — Client dashboard
- [ ] `client-portal/client-portal-vehicles.png` — My vehicles
- [ ] `client-portal/client-portal-appointments.png` — My appointments
- [ ] `client-portal/client-portal-invoices.png` — My invoices
- [ ] `client-portal/client-portal-tracking.png` — Live service tracking

---

## How to Capture Screenshots

### Manual Capture
1. Log in at `http://localhost:5000` with appropriate test credentials
2. Navigate to the target screen
3. Ensure sample data is visible
4. Press `F12` → DevTools → Toggle device toolbar → set 1920×1080
5. Use browser screenshot (Ctrl+Shift+P → "Capture full size screenshot")
6. Save to appropriate subfolder using the naming convention

### Test Credentials
| Email | Password | Role | Portal Access |
|-------|----------|------|---------------|
| admin@salisauto.com | admin123 | System Administrator | All screens |
| tech@salisauto.com | tech123 | Technician | Technician portal |
| client@salisauto.com | client123 | Customer | Client portal |
| agent@salisauto.com | agent123 | Purchase Agent | Inventory/parts |
| superadmin@salisauto.com | superadmin123 | Platform Admin | Platform admin |

---

## Related Documentation

- [GUI PRTSCN/](../GUI%20PRTSCN/) — 235 numbered PNG screenshots with individual README files
- [ui-screens/](../ui-screens/) — 121 UI screen captures with individual README files
- [06-screens/](./06-screens/) — Grouped screen documentation by module
- [11-ui-screens/UI_SCREENS_REFERENCE.md](./11-ui-screens/UI_SCREENS_REFERENCE.md) — Master UI reference

---

*SALIS AUTO Platform — Screenshots Library*
*Maintained by the SALIS AUTO Engineering Team*
