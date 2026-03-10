# SALIS AUTO — API Reference

**Document Type:** API Reference  
**Version:** 14.0.0  
**Base URL:** `http://localhost:5000/api`  
**Auth:** Session-based (cookie)  

---

## Overview

SALIS AUTO exposes a comprehensive REST API with 1,000+ endpoints organized by functional domain. All endpoints require an authenticated session unless marked as public.

**OpenAPI Spec:** `GET /openapi.json`  
**AI Plugin Manifest:** `GET /.well-known/ai-plugin.json`

---

## Authentication Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/register` | Register new user |
| `POST` | `/api/login` | Login with email/password |
| `POST` | `/api/logout` | End current session |
| `GET` | `/api/user` | Get current authenticated user |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/roles` | List all roles |
| `GET` | `/api/user/:id/roles` | Get roles for user |

### Login Request
```json
POST /api/login
{
  "email": "admin@salisauto.com",
  "password": "admin123"
}
```

### Login Response
```json
{
  "id": "uuid",
  "email": "admin@salisauto.com",
  "name": "Admin User",
  "role": "SYSTEM_ADMIN"
}
```

---

## Customer Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/customers` | List all customers |
| `POST` | `/api/customers` | Create customer |
| `GET` | `/api/customers/:id` | Get customer by ID |
| `PATCH` | `/api/customers/:id` | Update customer |
| `DELETE` | `/api/customers/:id` | Delete customer |
| `GET` | `/api/customers/:id/vehicles` | Customer's vehicles |
| `GET` | `/api/customer-portal/me` | Current customer portal data |
| `GET` | `/api/customer-portal/appointments` | Customer's appointments |
| `GET` | `/api/customer-feedback` | List feedback |
| `POST` | `/api/customer-feedback` | Submit feedback |
| `POST` | `/api/customer-feedback/:id/sentiment` | AI sentiment analysis |

---

## Vehicle Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Register vehicle |
| `GET` | `/api/vehicles/:id` | Get vehicle |
| `PATCH` | `/api/vehicles/:id` | Update vehicle |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle |
| `GET` | `/api/decode-vin/:vin` | Decode VIN number |
| `GET` | `/api/vehicles/:id/history` | Vehicle service history |
| `GET` | `/api/maintenance-schedules` | List maintenance schedules |
| `POST` | `/api/service-reminders` | Create service reminder |
| `GET` | `/api/fleet/vehicles` | Fleet vehicles |

---

## Appointments & Scheduling

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Create appointment |
| `PATCH` | `/api/appointments/:id` | Update appointment |
| `DELETE` | `/api/appointments/:id` | Cancel appointment |
| `GET` | `/api/workshop/events` | Workshop calendar events |
| `POST` | `/api/workshop/events` | Create calendar event |
| `GET` | `/api/workshop/resources` | Workshop resources |
| `GET` | `/api/technician-availability` | Technician availability |
| `POST` | `/api/ai/schedule` | AI scheduling suggestion |

---

## Job Cards

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/job-cards` | List job cards |
| `POST` | `/api/job-cards` | Create job card |
| `GET` | `/api/job-cards/:id` | Get job card |
| `PATCH` | `/api/job-cards/:id` | Update job card status |
| `GET` | `/api/job-cards/:id/details` | Full job card details |
| `GET` | `/api/job-cards/:id/tasks` | Tasks for job card |
| `POST` | `/api/job-cards/:id/tasks` | Add task |
| `GET` | `/api/job-cards/:id/parts` | Parts used |
| `POST` | `/api/job-cards/:id/parts` | Add part to job |
| `GET` | `/api/service-templates` | List service templates |
| `GET` | `/api/service-bays` | Service bay status |
| `POST` | `/api/service-bays/:id/start-session` | Start bay session |
| `POST` | `/api/service-bays/:id/end-session` | End bay session |

---

## Estimates & Invoices

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/estimates` | List estimates |
| `POST` | `/api/estimates` | Create estimate |
| `PATCH` | `/api/estimates/:id` | Update estimate |
| `POST` | `/api/estimates/:id/approve` | Approve estimate |
| `GET` | `/api/invoices` | List invoices |
| `POST` | `/api/invoices` | Create invoice |
| `GET` | `/api/invoices/:id` | Get invoice |
| `POST` | `/api/invoices/:id/finalize` | Finalize invoice |
| `POST` | `/api/invoices/:id/void` | Void invoice |
| `POST` | `/api/video-estimates` | Create video estimate |

---

## Payments

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/payments` | List payments |
| `POST` | `/api/payments` | Record payment |
| `POST` | `/api/create-payment-intent` | Stripe payment intent |
| `POST` | `/api/paypal/create-order` | PayPal order |
| `POST` | `/api/paypal/capture-order` | PayPal capture |
| `POST` | `/api/refunds` | Process refund |

---

## Inventory & Parts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/spare-parts` | List spare parts |
| `POST` | `/api/spare-parts` | Add spare part |
| `GET` | `/api/spare-parts/:id` | Get part |
| `PATCH` | `/api/spare-parts/:id` | Update part |
| `GET` | `/api/inventory` | Inventory levels |
| `POST` | `/api/inventory/adjust` | Adjust stock |
| `GET` | `/api/inventory/reorder-rules` | Reorder rules |
| `POST` | `/api/inventory/reorder-rules` | Create reorder rule |
| `GET` | `/api/inventory/forecasts` | Demand forecasts |
| `POST` | `/api/inventory/auto-reorder` | Trigger auto-reorder |
| `GET` | `/api/tools` | List tools |
| `POST` | `/api/tool-usage` | Log tool usage |

---

## Suppliers & Purchasing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/suppliers` | List suppliers |
| `POST` | `/api/suppliers` | Add supplier |
| `GET` | `/api/purchase-orders` | List purchase orders |
| `POST` | `/api/purchase-orders` | Create purchase order |
| `PATCH` | `/api/purchase-orders/:id` | Update PO |

---

## B2B Parts Network

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/parts-network/members` | Network members |
| `GET` | `/api/parts-network/requests` | Parts requests |
| `POST` | `/api/parts-network/requests` | Send parts request |
| `GET` | `/api/parts-network/quotations` | Network quotations |
| `POST` | `/api/parts-network/quotations` | Submit quotation |
| `GET` | `/api/parts-network/orders` | Network orders |

---

## HR & Staff Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/hr/employees` | List employees |
| `POST` | `/api/hr/employees` | Add employee |
| `GET` | `/api/hr/leave-requests` | Leave requests |
| `POST` | `/api/hr/leave-requests` | Submit leave request |
| `PATCH` | `/api/hr/leave-requests/:id` | Approve/reject leave |
| `GET` | `/api/hr/performance-reviews` | Performance reviews |
| `POST` | `/api/hr/performance-reviews` | Create review |
| `GET` | `/api/hr/payroll-runs` | Payroll runs |
| `POST` | `/api/timeclock/clock-in` | Clock in |
| `POST` | `/api/timeclock/clock-out` | Clock out |
| `GET` | `/api/timesheets` | Timesheets |

---

## Accounting & Finance

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/accounting/chart-of-accounts` | Chart of accounts |
| `GET` | `/api/accounting/transactions` | Transaction ledger |
| `POST` | `/api/accounting/journal-entries` | Create journal entry |
| `GET` | `/api/accounting/trial-balance` | Trial balance |
| `GET` | `/api/accounting/balance-sheet` | Balance sheet |
| `GET` | `/api/accounting/income-statement` | Income statement |
| `GET` | `/api/accounting/cash-flow` | Cash flow statement |
| `GET` | `/api/budgets` | List budgets |
| `POST` | `/api/budgets` | Create budget |

---

## AI & Machine Learning

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/estimate-job` | AI job cost estimation |
| `POST` | `/api/ai/predict-maintenance` | Predictive maintenance |
| `POST` | `/api/ai/recommend-parts` | Parts recommendations |
| `POST` | `/api/ai/chat` | AI chatbot conversation |
| `POST` | `/api/ai/schedule` | AI scheduling |
| `POST` | `/api/ai/damage-assessment` | Smart damage assessment |
| `GET` | `/api/fraud-detection/cases` | Fraud cases |
| `POST` | `/api/vision/analyze-image` | Computer vision QC |

---

## Compliance (Saudi Arabia)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/zatca/config` | ZATCA configuration |
| `POST` | `/api/zatca/submit-invoice` | Submit e-invoice to ZATCA |
| `GET` | `/api/vat/config` | VAT configuration |
| `PATCH` | `/api/vat/config` | Update VAT settings |
| `GET` | `/api/zakat/calculations` | Zakat calculations |
| `GET` | `/api/compliance/policies` | Compliance policies |
| `POST` | `/api/safety-incidents` | Report safety incident |
| `GET` | `/api/environmental-compliance/records` | Environmental records |

---

## Marketing & CRM

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/marketing/campaigns` | Marketing campaigns |
| `POST` | `/api/marketing/campaigns` | Create campaign |
| `GET` | `/api/loyalty/programs` | Loyalty programs |
| `GET` | `/api/loyalty/members` | Loyalty members |
| `GET` | `/api/loyalty/transactions` | Loyalty transactions |
| `GET` | `/api/loyalty/rewards` | Loyalty rewards |
| `GET` | `/api/referrals` | Referral program |
| `GET` | `/api/reviews` | Customer reviews |

---

## Emerging Technologies

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/emerging-tech/iot-sensors` | IoT sensor data |
| `GET` | `/api/emerging-tech/blockchain` | Blockchain records |
| `GET` | `/api/ar/overlays` | AR overlays |
| `GET` | `/api/ar/sessions` | AR sessions |
| `GET` | `/api/digital-twin/:vehicleId` | Digital twin data |

---

## Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/public/track/:token` | Public vehicle tracking |
| `GET` | `/openapi.json` | OpenAPI specification |
| `GET` | `/.well-known/ai-plugin.json` | AI plugin manifest |
| `GET` | `/robots.txt` | Crawler instructions |
| `GET` | `/sitemap.xml` | Site map |

---

## Error Responses

All API errors follow this format:
```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

*SALIS AUTO API Reference — Version 14.0.0*
