# Login Dashboard Project

## Overview
This project is a world-class automotive ERP platform (SALIS AUTO) designed to manage efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to **141+ comprehensive modules** across 13 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies including AI, blockchain, AR/VR, quantum computing, sustainable energy management, and dedicated mobile web applications for customers and technicians. The platform includes comprehensive compliance and localization features for the Saudi Arabian market, such as VAT compliance, ZATCA E-Invoicing, Hijri calendar support, Zakat calculations, TRN validation, Arabic language support, and localized PDF/Excel exports and SMS notifications.

**Latest Enhancement (Phase 13 - November 2025)**: Complete implementation of 9 missing planned modules including Payroll Management, Expense Tracking, Towing Services, Vehicle Storage, Telematics Integration, Knowledge Base, Training LMS, Google My Business Integration, and Enhanced Compliance Management.

**Latest Update (November 12, 2025) - Client Portal Advanced Features**: Added 5 comprehensive features to the customer-facing client portal including Service History with filtering, canvas-based E-Signature component, Service Reminders with custom notifications, Live Tracking with real-time updates, and Review & Chat system for customer-garage communication. Includes new database tables (`serviceSignatures`, `serviceChatMessages`, `serviceReviews`) and customer-scoped API routes. Security documentation created in `CLIENT_PORTAL_SECURITY.md` for production deployment requirements.

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

**Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components, adhering to the original Figma design.
**Backend**: Express server written in TypeScript.
**Authentication**: Custom email/password authentication with role-based access control.
**Database**: PostgreSQL with Drizzle ORM, comprising **141+ comprehensive modules with 290+ tables**.
**Real-Time Features**: WebSocket server for in-app chat support and live notifications.

**Core Modules**: The system includes 60+ modules covering comprehensive garage operations, including SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Vehicle Management, Job Cards, Inventory, Invoicing, Analytics, and advanced enterprise modules such as Franchise Command Center, Diagnostics & OBD Hub, OEM Software Subscriptions, Globalization Layer, Parts Supply Network, and Contract Management with SLA Tracking.

**Enterprise Expansion**: The platform incorporates AI & Automation (AI Chatbot, Predictive Maintenance, Smart Parts Recommendations), Advanced Analytics (Business Intelligence, Profit Margin Analysis, Customer Lifetime Value), Enhanced Integrations (Accounting, Email Marketing, Stripe Payments), Customer Experience features, Operational Efficiency tools, Compliance & Quality management, and Advanced Hardware integrations (Barcode/QR Scanner, Digital Signage, Kiosk Check-In, LPR).

**Mobile Apps**: Dedicated backend API and documentation for three cross-platform React Native apps: Technician, Customer, and Manager Dashboard, with PWA-ready mobile interfaces for customers and technicians.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, print system, undo/redo, keyboard shortcuts, robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

**Saudi Arabia Compliance Stack**: This includes database tables for VAT registration, ZATCA certification, Zakat settings, Arabic company details, and utilities for VAT calculations, TRN validation, ZATCA QR code generation, Hijri calendar conversion, and localized PDF/Excel export services, and Twilio SMS integration with Saudi phone formatting. A persistent dark/light/system theme toggle is also included.

**Contract Management (Phase 12 Enhancement)**: Comprehensive contract utilization tracking, SLA compliance monitoring, and automated renewal workflows with:
- Contract Utilization Dashboard: Real-time tracking of service spending vs. contract caps with visual progress indicators
- SLA Compliance Tracking: Response time, completion time, and uptime monitoring with breach severity tracking and automatic penalty calculations
- Automated Renewal Workflows: Configurable renewal notice periods, automated notification system, and one-click renewal acceptance
- Performance Analytics: Service type breakdown, utilization trends, compliance rates, and expiring contract alerts
- Database Tables: `contract_utilization`, `contract_sla_metrics`, `contract_renewals` with complete audit trails

**Phase 13 Expansion - Complete Suite of Operational Modules**: All previously planned features now fully implemented:
1. **Payroll Management** (`/payroll-management`) - Complete payroll processing system with employee management, pay periods, payroll runs, tax withholding, and direct deposit. Database tables: `payroll_employees`, `pay_periods`, `payroll_runs`
2. **Expense Tracking** (`/expense-tracking`) - Business expense management with categories, approval workflows, receipt uploads, and budget monitoring. Database tables: `expense_categories`, `expenses`
3. **Towing & Recovery Services** (`/towing-services`) - Complete towing dispatch and tracking system with job management, driver assignment, and cost calculation. Database table: `towing_jobs`
4. **Vehicle Storage Services** (`/vehicle-storage`) - Long-term vehicle storage management with facility management, slot assignments, and billing integration. Database tables: `storage_facilities`, `vehicle_storage_assignments`
5. **Telematics Integration** (`/telematics-integration`) - Real-time vehicle tracking with GPS feeds, speed monitoring, fuel level tracking, and automated alerts. Database tables: `telematics_feeds`, `telematics_alerts`
6. **Knowledge Base** (`/knowledge-base`) - Comprehensive documentation system with article categories, search functionality, and helpful/unhelpful ratings. Database tables: `article_categories`, `knowledge_articles`
7. **Training & Certification LMS** (`/training-lms`) - Complete learning management system with training modules, certifications, quiz assessments, and certificate generation. Database tables: `training_modules`, `certifications`, `certification_attempts`
8. **Google My Business Integration** (`/google-my-business`) - Full GMB integration with post publishing, review management, and sync automation. Database tables: `google_business_profiles`, `gmb_posts`, `gmb_reviews`
9. **Enhanced Compliance Management** (`/compliance-management`) - Standalone compliance module with policies, audits, and task management for regulatory compliance. Database tables: `compliance_policies`, `compliance_audits`, `compliance_tasks`

## External Dependencies
- Replit Auth
- PostgreSQL
- Express.js
- React
- Vite
- wouter
- @tanstack/react-query
- shadcn/ui
- Tailwind CSS
- Drizzle ORM
- Zod
- recharts
- Twilio (SMS notifications)
- NHTSA API
- TecDoc API
- Stripe
- PayPal
- react-big-calendar
- date-fns
- @zxing/library
- Replit AI Integrations (OpenAI)
- Google Calendar
- Gmail
- speakeasy
- qrcode
- jspdf + jspdf-autotable (PDF generation)