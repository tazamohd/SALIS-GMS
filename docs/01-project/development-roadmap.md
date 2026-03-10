# SALIS AUTO — Development Roadmap

**Document Type:** Development Roadmap  
**Version:** 14.0.0  
**Last Updated:** March 2026  

---

## Overview

The SALIS AUTO platform was built across 14 development phases, each adding significant functional depth. This document captures what was built in each phase, the key features delivered, and the roadmap for future expansion.

---

## Completed Phases

### Phase 1 — Core MVP Foundation
**Status:** Complete  
**Objective:** Establish the foundational platform infrastructure

**Features Delivered:**
- Multi-tenant database architecture (garages, branches)
- User authentication (email/password, session-based)
- Role-based access control (RBAC) foundation
- Job Card lifecycle management (create → in progress → complete → delivered)
- Basic invoice generation with line items
- Customer and vehicle registration
- PostgreSQL + Drizzle ORM setup
- React 18 + Express full-stack foundation

**Key Tables Created:** `garages`, `branches`, `users`, `job_cards`, `invoices`, `customers`, `vehicles`

---

### Phase 2 — Customer & Vehicle Management
**Status:** Complete  
**Objective:** Deep customer relationship and vehicle lifecycle management

**Features Delivered:**
- Enhanced customer profiles with contact details and preferences
- Vehicle registration with VIN, make, model, year, plate
- Vehicle service history tracking
- Maintenance schedule and service reminders
- Vehicle health monitoring
- Customer notes and communication history
- Multi-vehicle ownership

**Key Tables Created:** `customer_profiles`, `vehicle_service_history`, `maintenance_schedules`, `service_reminders`

---

### Phase 3 — Inventory & Parts Management
**Status:** Complete  
**Objective:** Complete inventory lifecycle and supply chain management

**Features Delivered:**
- Spare parts catalog with SKU, category, pricing
- Branch-level stock management
- Inventory audit trails
- Internal warehouse management
- Parts auto-reorder rules
- Supplier management
- Purchase order workflow
- Barcode scanner integration
- Parts marketplace
- Tool management and usage tracking

**Key Tables Created:** `spare_parts`, `spare_part_inventories`, `suppliers`, `purchase_orders`, `tools`, `tool_usage_logs`

---

### Phase 4 — Technician Portal & HR Basics
**Status:** Complete  
**Objective:** Empower technicians with a dedicated mobile-optimized portal

**Features Delivered:**
- Technician Portal (9 sub-pages: dashboard, jobs, time-clock, parts, docs, profile, attendance, guides, software)
- Technician Mobile App (5 pages)
- Technician profiles with skills, certifications, and rates
- Task assignment and progress tracking
- Time clock (clock-in/clock-out)
- Technician leaderboards and performance analytics
- Service guides and documentation access

**Key Tables Created:** `technician_profiles`, `task_assignments`, `task_progress_logs`, `technician_availability`

---

### Phase 5 — Full Accounting Module
**Status:** Complete  
**Objective:** Enterprise-grade double-entry accounting

**Features Delivered:**
- Chart of Accounts
- General Ledger
- Journal Entries
- Trial Balance
- Balance Sheet
- Income Statement
- Cash Flow Statement
- Accounts Receivable & Payable
- Bank Account Management
- Budget Management
- Capital, Assets, Liabilities, Equity management
- Cost Centers
- Expense Tracking
- Financial Settings

**Key Tables Created:** `chart_of_accounts`, `journal_entries`, `budgets`, `bank_accounts`, `expenses`

---

### Phase 6 — HR, Payroll & Staff Management
**Status:** Complete  
**Objective:** Complete human resource management system

**Features Delivered:**
- Employee profiles and contracts
- Leave request workflow
- Payroll runs and calculations
- Timesheet management
- Staff performance reviews
- Training LMS
- Staff scheduling
- Shift management
- Wearable device integration

**Key Tables Created:** `hr_employee_profiles`, `hr_contracts`, `hr_leave_requests`, `hr_payroll_runs`, `training_courses`

---

### Phase 7 — AI & Automation Hub
**Status:** Complete  
**Objective:** Integrate AI intelligence across the platform

**Features Delivered:**
- AI Chatbot (OpenAI GPT-4o powered)
- Predictive Maintenance engine
- Smart Parts Recommendations
- AI Job Cost Estimation
- AI Scheduling optimization
- Smart Damage Assessment (computer vision)
- ML Fraud Detection
- Neural Network Prediction engine
- Voice Commands interface
- AI Service Advisor

**Key Tables Created:** `ai_job_estimations`, `ai_maintenance_predictions`, `ai_chat_conversations`, `fraud_detection_cases`

---

### Phase 8 — Saudi Arabia Compliance Stack
**Status:** Complete  
**Objective:** Full regulatory compliance for the Saudi market

**Features Delivered:**
- ZATCA E-Invoicing integration (Phase 1 & 2)
- VAT settings and calculation (15%)
- Zakat computation for Islamic businesses
- TRN (Tax Registration Number) validation
- Hijri calendar conversion
- Arabic language support (100% coverage, 2,000+ keys)
- RTL (Right-to-Left) layout support
- Twilio SMS integration for Arabic notifications
- Localized PDF/Excel export

---

### Phase 9 — B2B Parts Supply Network
**Status:** Complete  
**Objective:** Connect garages in a real-time parts trading network

**Features Delivered:**
- Network membership management
- Parts request broadcast system
- Quotation request/response workflow
- Network orders and fulfillment
- Inter-garage inventory sharing
- Parts Supply Network dashboard
- Incoming/outgoing request management

**Key Tables Created:** `network_members`, `parts_requests`, `network_quotations`, `network_orders`

---

### Phase 10 — Customer Portal & Mobile Apps
**Status:** Complete  
**Objective:** Full digital self-service for customers

**Features Delivered:**
- Customer Portal (web, 5 pages)
- Client Portal (desktop, 9 pages)
- Customer Mobile App (5 pages)
- Live vehicle tracking (public URL with token)
- Online appointment booking
- Invoice viewing and payment
- Service history access
- Appointment reminders
- Review and chat system

---

### Phase 11 — Marketing & Customer Experience
**Status:** Complete  
**Objective:** Drive customer growth and retention

**Features Delivered:**
- Marketing Hub
- Marketing Automation campaigns
- Email Marketing with templates
- Social Media Integration
- Social Media Monitoring
- Google My Business management
- Customer Loyalty Program (Bronze/Silver/Gold/Platinum tiers)
- Referral Program
- Customer Reviews & Ratings
- Customer LTV Analysis
- Appointment Reminders automation
- Video Consultations
- Video Estimates
- Digital Vehicle Walkaround

---

### Phase 12 — Emerging Technologies
**Status:** Complete  
**Objective:** Position SALIS AUTO at the frontier of automotive tech

**Features Delivered:**
- IoT Dashboard with sensor monitoring
- Augmented Reality (AR) Repair Guides
- AR Overlay for live mechanic assistance
- Virtual Reality (VR) Showroom
- Blockchain Service History records
- Smart Contracts
- Digital Twin Viewer
- Drone Inspection module
- Edge Computing Diagnostics
- Quantum Computing Optimization
- Interactive 3D Parts catalog
- Wearable Integration for technicians
- Sustainable Energy Monitoring

---

### Phase 13 — Franchise & Multi-Location
**Status:** Complete  
**Objective:** Scale across multiple locations and franchise networks

**Features Delivered:**
- Franchise Command Center
- Multi-Location Dashboard
- Globalization Layer (multi-currency, multi-language)
- OEM Software Subscriptions management
- Global analytics and reporting
- Cross-branch inventory visibility
- Centralized staff management

---

### Phase 14 — Real-Time Operations & Predictive Intelligence
**Status:** Complete  
**Objective:** Live operational awareness and predictive business intelligence

**Features Delivered:**
- Real-Time Service Bay Occupancy Dashboard (WebSocket)
- Automated Inventory Reordering with Predictive Demand Forecasting
- Customer Loyalty Program with Tiered Rewards
- Interactive Workshop Calendar (drag-and-drop scheduling)
- AR Overlay for Mechanics (Phase 2)
- Predictive Demand Forecasting
- KPI Dashboard
- Business Heat Maps
- Customer LTV Analysis
- Live Technician Leaderboards

**Key Tables Created:** `serviceBays`, `serviceBayAssignments`, `inventoryReorderRules`, `demandForecasts`, `loyaltyPrograms`, `workshopCalendarEvents`

---

## Future Roadmap

### Phase 15 — Advanced Mobile Capabilities (Planned)
- React Native dedicated mobile apps (iOS + Android)
- Push notifications
- Offline-first architecture
- Mobile OBD device pairing
- Augmented reality on mobile

### Phase 16 — AI-First Operations (Planned)
- Autonomous job dispatching
- AI-generated invoices from voice input
- Real-time pricing suggestions
- Predictive customer churn detection
- AI-powered parts procurement

### Phase 17 — Global Expansion (Planned)
- Additional language support (French, Turkish, Urdu)
- Multi-country tax compliance
- International payment gateways
- Cross-border parts logistics
- Regional compliance modules

### Phase 18 — Marketplace & Ecosystem (Planned)
- Third-party plugin marketplace
- API ecosystem for garage software integrations
- White-label franchise platform
- Developer SDK and documentation portal

---

## Technology Evolution

| Area | Current | Future |
|------|---------|--------|
| Frontend | React 18 | React 19 + Server Components |
| Database | PostgreSQL | PostgreSQL + TimescaleDB for IoT |
| AI | OpenAI GPT-4o | Fine-tuned automotive domain model |
| Mobile | PWA + Web Apps | React Native native apps |
| Infrastructure | Single server | Kubernetes microservices |
| Cache | None | Redis for real-time data |
| Search | DB queries | Elasticsearch for parts catalog |

---

*SALIS AUTO Development Roadmap — Phase 14 Complete*
