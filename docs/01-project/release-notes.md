# SALIS AUTO — Release Notes & Version History

**Document Type:** Release Notes  
**Current Version:** 14.0.0  

---

## Version 14.0.0 — March 2026 (Current)

### New Features
- **Real-Time Service Bay Occupancy Dashboard** — WebSocket-powered live bay monitoring with transactional locking
- **Automated Inventory Reordering** — AI-driven demand forecasting with automatic purchase order generation
- **Customer Loyalty Program** — Full tiered rewards system (Bronze/Silver/Gold/Platinum) with points engine
- **Interactive Workshop Calendar** — Drag-and-drop scheduling with react-big-calendar and @dnd-kit
- **AR Overlay for Mechanics (Phase 2)** — Enhanced AR instruction overlays for live repair guidance
- **Predictive Demand Forecasting** — Machine learning model for 30/90-day parts demand prediction
- **Customer LTV Analysis** — Comprehensive lifetime value analytics with churn prediction
- **Business Heat Maps** — Temporal and geographic visualization of business performance

### Technical Improvements
- WebSocket connection for real-time updates across bay dashboard, chat, and notifications
- Transactional row locking in `startBaySession` to prevent race conditions
- Phase 14 database tables: `serviceBays`, `inventoryReorderRules`, `demandForecasts`, `loyaltyPrograms`, `workshopCalendarEvents`

### Bug Fixes
- Fixed CustomerFeedback.tsx null reference errors with optional chaining
- Resolved sidebar resize persistence edge case on Firefox
- Fixed ZATCA QR code generation for invoices over SAR 10,000

---

## Version 13.0.0 — February 2026

### New Features
- **Franchise Command Center** — Multi-location dashboard with consolidated reporting
- **Globalization Layer** — Multi-currency, multi-language, multi-country configuration
- **Multi-Location Dashboard** — Cross-branch performance comparison
- **OEM Software Subscription Management** — License key storage and expiry tracking

---

## Version 12.0.0 — January 2026

### New Features
- **IoT Dashboard** — Real-time sensor monitoring with configurable thresholds
- **AR Repair Guides** — Step-by-step augmented reality repair instruction overlays
- **VR Showroom** — Virtual reality vehicle showcase
- **Blockchain Service History** — Immutable on-chain service records
- **Smart Contracts** — Automated service agreements on blockchain
- **Digital Twin Viewer** — 3D vehicle health representation
- **Drone Inspection** — Autonomous exterior inspection with AI damage detection
- **Edge Computing Diagnostics** — Local AI processing for real-time analysis
- **Quantum Computing Optimization** — Pilot optimization for scheduling and pricing
- **Sustainable Energy Monitoring** — Workshop energy consumption tracking

---

## Version 11.0.0 — December 2025

### New Features
- **Marketing Hub** — Unified marketing management center
- **Marketing Automation** — Trigger-based workflow automation
- **Email Marketing Campaigns** — Gmail integration with campaign builder
- **Social Media Integration** — Multi-platform posting and monitoring
- **Google My Business** — GMB profile management integration
- **Customer Loyalty Program** (Phase 1) — Basic points system
- **Referral Program** — Customer referral tracking and rewards
- **Customer Reviews & Ratings** — Review management with response capability
- **Video Consultations** — Live video call for remote diagnosis
- **Video Estimates** — Video-based repair estimates for customers

---

## Version 10.0.0 — November 2025

### New Features
- **Client Portal** — Complete customer self-service portal with 9 sub-pages
- **Customer Mobile App** — Mobile-optimized customer experience
- **Technician Mobile App** — Dedicated technician mobile interface
- **Customer App Booking Flow** — 5-step appointment booking
- **Public Vehicle Tracking** — Token-based public tracking URL
- **Live Service Tracking** — Real-time job status for customers
- **Portal Appointment Booking** — Direct online booking from portal

---

## Version 9.0.0 — October 2025

### New Features
- **B2B Parts Network** — Inter-garage parts marketplace
- **Parts Request Broadcasting** — Send urgent requests to network members
- **Network Quotation System** — Receive and compare quotations
- **Network Members Directory** — Browse and rate network participants
- **Purchase Agent Portal** — Dedicated 11-page procurement portal
- **Price Comparison Tool** — Side-by-side supplier comparison
- **Vendor Supplier Portal** — Supplier-facing self-service interface

---

## Version 8.0.0 — September 2025

### New Features
- **ZATCA E-Invoicing Phase 1** — QR code embedded in every invoice
- **ZATCA E-Invoicing Phase 2** — Real-time ZATCA API submission
- **VAT Settings** — 15% VAT configuration and reporting
- **Zakat Calculator** — Islamic charitable contribution computation
- **TRN Validation** — Saudi Tax Registration Number verification
- **Hijri Calendar** — Islamic calendar date display and conversion
- **Arabic Translation (100%)** — 2,000+ translation keys covering all screens
- **RTL Layout** — Full right-to-left Arabic layout support
- **Arabic SMS via Twilio** — Bilingual SMS notification system

---

## Version 7.0.0 — August 2025

### New Features
- **AI Chatbot** — OpenAI GPT-4o powered customer assistant
- **AI Staff Assistant** — Internal AI for operational queries
- **Predictive Maintenance** — ML-based maintenance prediction engine
- **Smart Parts Recommender** — Context-aware parts recommendations
- **AI Job Estimation** — Machine learning cost and time estimation
- **AI Scheduling** — Intelligent appointment optimization
- **Smart Damage Assessment** — Computer vision damage analysis
- **ML Fraud Detection** — Transaction anomaly detection
- **Neural Network Predictions** — Business forecasting models
- **Voice Commands** — Hands-free platform control

---

## Version 6.0.0 — July 2025

### New Features
- **HR Management** — Complete employee record management
- **Payroll Processing** — Full payroll run with Saudi bank integration
- **Leave Request Workflow** — Multi-level approval process
- **Timesheet Management** — Weekly timesheet review and approval
- **Training LMS** — Course creation and completion tracking
- **Staff Scheduling** — Shift planning and coverage management
- **Staff Performance Reviews** — Quarterly review workflow
- **Wearable Device Integration** — Workshop safety monitoring

---

## Version 5.0.0 — June 2025

### New Features
- **Chart of Accounts** — Complete account structure
- **General Ledger** — Full transaction history by account
- **Journal Entries** — Manual double-entry posting
- **Financial Reports** — P&L, Balance Sheet, Cash Flow
- **Accounts Receivable** — Aging analysis and collection
- **Accounts Payable** — Supplier bill management
- **Budget Management** — Annual budget with variance tracking
- **Cost Centers** — Departmental cost allocation

---

## Version 4.0.0 — May 2025

### New Features
- **Technician Portal** — Complete 9-page dedicated workspace
- **Time Clock** — Digital attendance recording
- **Task Assignments** — Granular task-level job management
- **Job Documentation** — Photo and video documentation
- **Service Guides Library** — Repair procedure documentation
- **Technician Leaderboards** — Performance-based rankings
- **OEM Software Management** — Licensed software access control

---

## Version 3.0.0 — April 2025

### New Features
- **Spare Parts Catalog** — Complete parts management
- **Branch Inventory** — Per-branch stock tracking
- **Auto-Reorder Rules** — Stock threshold management
- **Supplier Management** — Vendor database
- **Purchase Orders** — Full PO lifecycle
- **Inventory Audit Trail** — Every movement logged
- **Barcode Scanner** — Camera-based barcode reading
- **Internal Warehouse** — Bin location management

---

## Version 2.0.0 — March 2025

### New Features
- **Vehicle Registration** — VIN decode, make/model catalog
- **Service History** — Complete vehicle history tracking
- **Maintenance Schedules** — Service interval tracking
- **Vehicle Inspections** — Pre/post service checklists
- **Digital Walkaround** — Photo-based condition recording
- **Fleet Management** — Corporate fleet tracking
- **Tire Management** — Rotation and replacement tracking

---

## Version 1.0.0 — February 2025

### Initial Release
- User authentication (email/password + session)
- Role-based access control (20 roles)
- Job Card management (full lifecycle)
- Basic invoicing with VAT
- Customer registration
- Garage and branch setup
- PostgreSQL database with Drizzle ORM
- React 18 + Express full-stack foundation

---

*SALIS AUTO Release Notes — Version 14.0.0*
