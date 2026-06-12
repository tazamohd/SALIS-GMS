# SALIS-GMS — Product Overview

## Project Name

**SALIS AUTO / SALIS-GMS** (Garage Management System)

## Description

SALIS-GMS is an enterprise-grade automotive ERP and garage management platform designed for the Saudi Arabian market. It provides end-to-end operational management for vehicle service centers, workshops, and garage networks, with built-in compliance for Saudi regulatory requirements including ZATCA e-invoicing, VAT (15%), and Hijri calendar support.

The system is a multi-tenant SaaS product that serves garages, their branches, and staff across multiple roles with a subscription-tiered feature model (STARTER, PRO, ENTERPRISE).

## Target Audience

- **Primary operators**: Garage owners and workshop managers in Saudi Arabia
- **Staff users**: Service advisors, technicians, accountants, HR managers, purchasing agents
- **End customers**: Vehicle owners accessing self-service portals and job tracking
- **Fleet operators**: Companies managing company-owned vehicle fleets

## Core Features

### Workshop Operations
- Job card lifecycle management (create, assign, track, close)
- Technician assignment, time-clock, and performance tracking
- Vehicle check-in, inspection checklists, and service history
- Appointment scheduling with availability management
- Service bay real-time tracking via WebSocket

### Customer and Vehicle Management
- Customer profiles with loyalty points and CRM
- Vehicle registry with VIN decoding (NHTSA integration)
- Service reminders, maintenance schedules, and recall tracking
- Self-service customer portal and public job tracking

### Financial and Compliance
- Estimates, invoices, and payment processing (Stripe, PayPal)
- Saudi ZATCA Phase 2 e-invoicing with QR code generation
- VAT 15% calculations (`shared/vatUtils.ts`)
- Zakat and compliance reporting (`shared/zatcaUtils.ts`)
- Hijri calendar date handling (`shared/hijriUtils.ts`)
- Multi-currency support with exchange rate management

### Inventory and Procurement
- Spare parts catalog with barcode scanning
- Inventory tracking with automated reorder alerts
- Parts demand forecasting with AI-assisted recommendations
- Supplier portal and purchase order management

### HR and Workforce
- Employee profiles, attendance, payroll processing
- Role-based access control (RBAC) with granular permissions
- Technician mobile portal for field operations

### Business Intelligence and AI
- Dashboard with KPI aggregations
- AI chatbot for service advisor assistance (OpenAI)
- Predictive maintenance and diagnostics
- Advanced reporting and business intelligence dashboards
- Parts recommender and smart assignment engine

### Communications and Marketing
- WhatsApp Business integration
- SMS campaigns (Twilio)
- Email notifications (Google Gmail API)
- Marketing automation and loyalty programs

### Integrations
- Google Calendar for appointment sync
- NHTSA for VIN and recall data
- Stripe and PayPal for payments
- Twilio for SMS
- OpenAI for AI features

## Use Cases

1. A garage receives a vehicle, opens a job card, assigns a technician, tracks parts consumption from inventory, and generates a ZATCA-compliant VAT invoice on completion.
2. A fleet operator monitors all company vehicles, schedules preventive maintenance, and receives automated service reminders.
3. A service advisor uses the AI chatbot to look up repair procedures and recommend parts to a customer.
4. An accountant generates VAT returns, payroll reports, and profit/loss statements from the financial module.
5. A customer tracks their vehicle's service status in real time via the public tracking page without logging in.
