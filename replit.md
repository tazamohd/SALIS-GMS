# Login Dashboard Project

## Overview
This project is a world-class automotive ERP platform (SALIS AUTO) that has evolved from 48 modules to 60 comprehensive modules, offering enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and B2B spare parts supply network. It provides a complete, integrated platform for efficient garage operations at scale, supporting multi-tenant franchise networks, global expansion, and advanced hardware integrations.

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- Continue developing and testing new features directly within the authenticated Figma interface
- SALIS AUTO brand design system applied across entire UI
- Official SALIS AUTO logo integrated
- Dark theme enforced - avoid white backgrounds throughout the application

## System Architecture
The application utilizes a full-stack architecture with clear client-server separation.

- **Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components, adhering to the original Figma design.
- **Backend**: Express server written in TypeScript.
- **Authentication**: Custom email/password authentication with role-based access control.
- **Database**: PostgreSQL with Drizzle ORM, comprising 60 comprehensive modules with 100+ tables.
- **Real-Time Features**: WebSocket server for in-app chat support and live notifications.

**Core Modules**: The system includes 60+ modules covering all original 48 modules (SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Technician Management, Vehicle Management, Job Cards, Appointments, Tool Management, Spare Parts Inventory, Purchase Orders, Invoicing & Billing, Payments, Estimates & Quotes, Reports & Analytics, SMS Notifications, Service Reminders, Vehicle Service History, Tax Configuration, Discounts & Promotions, Data Import/Export, Global Search, Saved Filter Presets, Notifications, Commission Management, Employee Attendance, Shift Templates, Performance Reviews, Training Programs, Stock Alerts, Security & Compliance, User Settings, Action History, Permission System, Consent Management, In-App Chat Support, Customer Self-Service Portal, Digital Signatures & Media Documentation, QR Code Check-In System, Fleet Management, Warranty Tracking, Marketing Automation, Vendor/Supplier Portal, Customer Loyalty Program, Vehicle Inspection Checklists, Towing & Roadside Assistance, Document Management, and Loaner Vehicle Management) **PLUS 12 ENTERPRISE MODULES**: Franchise Command Center (franchise groups, contracts, KPIs, revenue sharing), Diagnostics & OBD Hub (IoT device management, real-time diagnostics, OBD sessions, diagnostic reports), OEM Software Subscriptions (vendor catalogs, license management, audit logs, entitlements), Globalization Layer (multi-language, multi-currency, tax regions, timezone management), and Parts Supply Network (B2B partners, fulfillment orders, shipment tracking, warehouse nodes, cross-border logistics).

**Enterprise Expansion - 44 Features Across 8 Phases**: The platform is expanding with advanced enterprise features to solidify its position as a world-class automotive ERP.

**Phase 1 - AI & Automation (🚧 UI COMPLETE, BACKEND IN PROGRESS)**: Six AI-powered frontend modules implemented with full UI/UX: (1) AI Chatbot with OpenAI conversation interface, (2) Predictive Maintenance with vehicle analysis and alert system, (3) Smart Parts Recommendations with compatibility scoring interface, (4) Voice Commands with Web Speech API frontend, (5) Document OCR with upload and edit workflow, (6) AI Service Assistant (planned). Database schemas added: `ai_chat_conversations`, `ai_chat_messages`, `ai_maintenance_predictions`, `ai_parts_recommendations`, `voice_commands`, `ocr_documents`, `ai_service_suggestions`. **Status**: Frontend UIs complete with mock data, backend routes partially implemented, needs OpenAI integration and real data processing.

**Phase 2 - Advanced Analytics (🚧 UI COMPLETE, BACKEND IN PROGRESS)**: Four analytics frontend modules implemented with full UI/UX: (1) Business Intelligence Dashboard with custom report builder, widgets, and KPI cards, (2) Profit Margin Analysis by service/technician/customer with cost breakdown, (3) Customer Lifetime Value Analysis with retention risk scoring and churn prediction, (4) Business Heat Maps showing time demand, service demand, and technician utilization. Database schemas added: `customReports`, `dashboardWidgets`, `profitAnalysis`, `serviceTypeProfitability`, `customerLtvAnalysis`, `businessHeatmaps`, `demandForecasts`. **Status**: Frontend UIs complete with mock data visualizations, backend routes return static responses, needs real analytics queries and data aggregation.

**Phase 3 - Enhanced Integrations (✅ UI COMPLETE, BACKEND MOCKED)**: Five integration modules implemented with full UI/UX: (1) Accounting Integration with QuickBooks/Xero sync management, (2) Email Marketing Campaigns with template builder and analytics, (3) Social Media Integration for multi-platform posting and review management, (4) Video Consultations with Zoom/Teams scheduling interface, (5) Parts Marketplace integration with eBay Motors/Amazon ordering. Database schemas added: `accounting_connections`, `accounting_sync_history`, `email_campaigns`, `social_media_posts`, `social_media_reviews`, `video_consultations`, `marketplace_orders`, `marketplace_connections`. **Status**: Frontend UIs complete with mock data, backend routes return mock responses, needs OAuth integrations and real API connections.

**Phase 4 - Customer Experience (✅ UI COMPLETE, BACKEND MOCKED)**: Five customer-facing modules implemented with full UI/UX: (1) Live Service Tracking with real-time job progress timeline and customer notifications, (2) Video Estimates with technician walkaround video player and service recommendations, (3) Digital Vehicle Walkaround with multi-angle photo capture and damage annotation system, (4) Customer Reviews & Ratings with multi-platform aggregation (Google/Yelp/Facebook) and response management, (5) Referral Program with code generation, reward tracking, and conversion analytics. Database schemas added: `service_tracking_updates`, `video_estimates`, `digital_walkarounds`, `customer_reviews`, `referral_programs`, `customer_referrals`. **Status**: Frontend UIs complete with mock data, backend routes return mock responses, needs real-time WebSocket integration for live tracking and external API connections for reviews.

**Phase 5 - Operations & Efficiency (✅ UI COMPLETE, BACKEND MOCKED)**: Five operational modules implemented with full UI/UX: (1) AI-Powered Scheduling Optimizer with rule-based technician assignment and efficiency tracking, (2) Parts Auto-Reordering System with stock monitoring and automatic purchase triggers, (3) Multi-Location Routing Optimizer for deliveries and mobile service, (4) Time Clock & Payroll with clock in/out, time entry approval, and payroll calculation, (5) Equipment Calibration Tracking with due date management and certification tracking. Database schemas added: `scheduling_rules`, `scheduling_optimizations`, `auto_reorder_rules`, `auto_reorder_history`, `routing_routes`, `payroll_periods`, `time_entries`, `calibration_records`, `calibration_reminders`. **Status**: Frontend UIs complete with mock data, backend routes return mock responses, needs real scheduling algorithms, payment processing integration, and route optimization APIs.

**Phase 6 - Compliance & Quality (✅ UI COMPLETE, BACKEND MOCKED)**: Four compliance modules implemented with full UI/UX: (1) Environmental Compliance tracking with hazardous waste disposal records and regulatory reporting, (2) ISO 9001 Quality Management with quality checklists, non-conformance tracking, and corrective actions, (3) Safety Incident Reporting with OSHA compliance, investigation workflow, and root cause analysis, (4) Insurance Claims integration with claim submission, status tracking, and adjuster communication. Database schemas added: `environmental_compliance`, `quality_checklists`, `non_conformances`, `corrective_actions`, `safety_incidents`, `incident_investigations`, `insurance_claims`. **Status**: Frontend UIs complete with mock data, backend routes return mock responses, needs insurance API integration and regulatory reporting features.

**Phase 7 - Advanced Hardware (✅ UI COMPLETE, BACKEND MOCKED)**: Five hardware integration modules implemented with full UI/UX: (1) Barcode/QR Scanner integration for part inventory and vehicle check-in with real-time scanning interface, (2) Digital Signage System for waiting room displays with content management, (3) Kiosk Check-In Interface for self-service customer check-in with digital signatures, (4) Security Camera Integration with live feeds, motion detection, and recording management, (5) License Plate Recognition with automatic vehicle identification and entry/exit logging. Database schemas added: `barcode_scans`, `signage_displays`, `signage_content`, `kiosk_sessions`, `kiosk_check_ins`, `security_cameras`, `camera_recordings`, `license_plate_scans`, `vehicle_entry_logs`. **Status**: Frontend UIs complete with mock data, backend routes return mock responses, needs hardware SDK integration (barcode readers, cameras, LPR systems).

**Phase 8 - Mobile Apps (✅ DOCUMENTATION COMPLETE)**: Three cross-platform React Native apps fully documented: (1) Technician Mobile App with job card management, photo/video capture, barcode scanning, and time tracking, (2) Customer Mobile App with appointment booking, live service tracking, vehicle management, and digital payments, (3) Manager Dashboard Mobile App with real-time KPIs, approval workflows, team management, and financial reports. Comprehensive documentation includes technical stack (React Native with Expo), API integration endpoints, offline sync strategy, push notifications architecture, and 6-month development roadmap. **Status**: Complete documentation in `docs/PHASE_8_MOBILE_APPS.md`, ready for React Native development.

**UI/UX Decisions**: Preserves Figma design, ensures responsiveness, and uses a consistent component-based approach with tabbed interfaces. Implements PWA support, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode with service worker caching. The sidebar navigation is reorganized into 11 logical, collapsible groups. The application uses a monochrome design system based on the SALIS AUTO brand, with a specific color palette (Black, White, Gray, Gray Light, Gray Dark, 50% Black) and typography (Montserrat for headers/logo, Poppins and Inter for body/UI). A pure grayscale design is enforced, with distinct light and dark modes.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Comprehensive user settings, print system, undo/redo system, keyboard shortcuts, and a robust currency system are implemented. Action history is tracked for audit trails. The database is seeded with realistic sample data.

## External Dependencies
- **Replit Auth**: User authentication.
- **PostgreSQL**: Primary database.
- **Express.js**: Backend framework.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **wouter**: Frontend routing.
- **@tanstack/react-query**: Data fetching.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: CSS framework.
- **Drizzle ORM**: ORM for PostgreSQL.
- **Zod**: Schema validation.
- **recharts**: Data visualization.
- **Twilio**: SMS notifications.
- **NHTSA API**: VIN decoding.
- **TecDoc API**: Parts catalog lookup.
- **Stripe**: Payment processing.
- **PayPal**: Payment processing.
- **react-big-calendar**: Calendar component.
- **date-fns**: Date utility library.
- **@zxing/library**: Barcode scanning.
- **Replit AI Integrations (OpenAI)**: AI features.
- **Google Calendar**: Replit connector integration.
- **Gmail**: Replit connector integration.
- **speakeasy**: Two-factor authentication.
- **qrcode**: QR code generation.