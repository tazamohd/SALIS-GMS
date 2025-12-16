# Login Dashboard Project

## Overview
SALIS AUTO is a world-class automotive ERP platform designed for efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to **151+ comprehensive modules** across 13 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies (AI, blockchain, AR/VR, quantum computing, sustainable energy management), and dedicated mobile web applications. It includes comprehensive compliance and localization features for the Saudi Arabian market (VAT, ZATCA E-Invoicing, Hijri calendar, Zakat, TRN validation, Arabic language, localized exports, SMS). Recent enhancements include an in-app chat support system, a comprehensive technician portal, AI-powered predictive diagnostics, an AI chatbot assistant, blockchain service history, smart contracts, and 9 operational modules from Phase 13 (Payroll, Expense Tracking, Towing Services, Vehicle Storage, Telematics Integration, Knowledge Base, Training LMS, Google My Business Integration, and Enhanced Compliance Management).

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
The application uses a full-stack architecture with clear client-server separation.

**Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components, adhering to the Figma design.
**Backend**: Express server written in TypeScript.
**Authentication**: Custom email/password authentication with comprehensive role-based access control (RBAC).
**Database**: PostgreSQL with Drizzle ORM, comprising **170+ comprehensive modules with 307+ tables**.
**RBAC System**: 24 professional roles, 70 staff users across departments, granular permissions for 151+ resources. Role-based sidebar navigation filtering implemented via `roleNavigationMap` in Layout.tsx. Welcome page at `/welcome` routes users to their role-specific portal (technician → /technician-portal, HR → /hr-management, etc.).
**Security Notes (Production)**: AUTH_BYPASS=true is set for development only. Disable for production. HR module queries use optional garage-based filtering - in development mode without garageId, returns all records. Production deployments must enforce garageId for tenant isolation.
**Real-Time Features**: WebSocket server (`/ws/chat`) for in-app chat support, live notifications, and call center real-time updates with session-based authentication.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes.

**Design System & Archetype Wrappers**: A comprehensive UI/UX design system overhaul has been completed across all 144 application pages using 7 production-ready archetype wrappers: StandardPageLayout (simple pages with header/description), StandardTablePage (data tables), DashboardPage (metrics/cards), FormPage (form-centric), AnalyticsPage (reporting), MobileCardPage (mobile-optimized cards), and TabsPageLayout (multi-tab interfaces). **138 pages** have been successfully migrated to use these archetypes, while **6 pages** (Landing, LoginDashboard, Login, Register, not-found, PublicTracking) retain intentional custom layouts for their special purposes. All migrated pages maintain full functionality, data-testid attributes for testing, and dark theme consistency.

**Navigation System**: Sidebar navigation completely reorganized from 13 affinity-based groups into **18 workflow-based groups** that follow natural garage operational sequence: Dashboard & Overview → Customer Intake & Appointments → Vehicle Management → Inspection & Check-In → Diagnostics & Assessment → Service Planning & Scheduling → Parts & Inventory → Service Execution & Operations → Quality & Delivery → Billing & Payments → Analytics & Business Intelligence → Customer Experience & Growth → Team & HR Management → Compliance & Safety → Enterprise & Franchise → Emerging Technologies → AI & Automation Hub → System & Settings. The reorganization provides 100+ accessible routes organized by logical workflow, with intentional exclusions for authentication pages, mobile app routes, client portal routes, and deprecated features.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, a print system, undo/redo, keyboard shortcuts, a robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

**Core Modules**: The system includes 60+ modules covering comprehensive garage operations, including SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Vehicle Management, Job Cards, Inventory, Invoicing, Analytics, and advanced enterprise modules such as Franchise Command Center, Diagnostics & OBD Hub, OEM Software Subscriptions, Globalization Layer, Parts Supply Network, and Contract Management with SLA Tracking.

**Enterprise Expansion**: The platform incorporates AI & Automation (AI Chatbot, Predictive Maintenance, Smart Parts Recommendations), Advanced Analytics (Business Intelligence, Profit Margin Analysis, Customer Lifetime Value), Enhanced Integrations (Accounting, Email Marketing, Stripe Payments), Customer Experience features, Operational Efficiency tools, Compliance & Quality management, and Advanced Hardware integrations (Barcode/QR Scanner, Digital Signage, Kiosk Check-In, LPR).

**Mobile Apps**: Dedicated backend API and documentation for three cross-platform React Native apps: Technician, Customer, and Manager Dashboard, with PWA-ready mobile interfaces.

**Saudi Arabia Compliance Stack**: Includes database tables and utilities for VAT registration, ZATCA certification, Zakat settings, Arabic company details, TRN validation, Hijri calendar conversion, and localized PDF/Excel export services, and Twilio SMS integration.

**Recent Features**:
- **In-App Chat Support System**: Real-time chat with support tickets, file attachments, and presence tracking, using WebSocket authentication.
- **Client Portal Advanced Features**: Service History, E-Signature, Service Reminders, Live Tracking, and Review & Chat system.
- **Technician Portal**: Desktop portal at `/technician-portal` with job management, time tracking, and documentation.
- **AI-Powered Predictive Diagnostics**: Analyzes vehicle parameters using GPT-5 to predict failures.
- **AI Chatbot Assistant**: GPT-5-powered conversational assistant for customer queries and diagnostics.
- **Blockchain Service History**: Immutable ledger system for tamper-proof vehicle service records.
- **Smart Contracts**: Automated service agreements with digital signatures and payment triggers.
- **Operational Modules (Phase 13)**: Payroll Management, Expense Tracking, Towing & Recovery Services, Vehicle Storage Services, Telematics Integration, Knowledge Base, Training & Certification LMS, Google My Business Integration, and Enhanced Compliance Management.
- **Automated Push Notifications MVP**: In-app notification bell with basic CRUD functionality.
- **Real-Time Parts Availability Tracker**: Multi-supplier inventory sync with cached availability and a UI at `/parts-availability`.
- **Smart Job Assignment System**: AI-powered technician recommendation engine using OpenAI GPT-5 for optimal job assignments.
- **Call Center Module**: Call center infrastructure with real-time updates via WebSocket, managing call queues, sessions, and agent performance, with a UI at `/call-center`.
- **Comprehensive RBAC System**: 24 professional roles with 70 staff users across all departments (Service Advisors, Call Center Agents, Parts Managers, Accountants, Marketing, HR, QC, etc.).
- **Production-Ready Data Seeding**: 9-phase comprehensive seeding system with 6,250+ records, 35+ stock images, 100% referential integrity across all 290+ tables (vehicles, parts, job cards, invoices, training, attendance, blockchain, IoT).
- **Core Accounting Modules (10 NEW)**: Complete accounting system with General Ledger (دفتر الأستاذ العام), Journal Entries (القيود اليومية), Trial Balance (ميزان المراجعة), Income Statement (قائمة الدخل), Balance Sheet (الميزانية العمومية), Cash Flow Statement (قائمة التدفقات النقدية), Accounts Receivable (حسابات المدينين), Accounts Payable (حسابات الدائنين), Cost Centers (مراكز التكلفة), and Budget Management (الميزانية التقديرية).
- **Purchase Agent Portal**: Dedicated portal at `/purchase-agent` for procurement staff with 7 specialized pages: Dashboard, Purchase Orders, Supplier Management, Inventory Needs, Price Comparison, Order Tracking, and Reports. Features dedicated navigation, quick stats sidebar, and mobile-responsive design.
- **Marketing Platform Hub**: Unified advertising management platform at `/marketing-hub` for managing all external advertising platforms (Google Ads, Facebook, Instagram, X/Twitter, LinkedIn, TikTok, YouTube). Features platform connection management, campaign creation and tracking, performance reporting with unified metrics (spend, impressions, clicks, CTR, CPC, conversions), task management, unified social inbox for direct messaging across platforms, and comment management for replying to customer comments on posts/ads. Database schema includes 11 new tables: marketingProviders, marketingAccounts, marketingAdCampaigns, marketingSpendSnapshots, marketingTasks, marketingNotes, marketingCreatives, marketingConversations, marketingMessages, marketingCommentThreads, and marketingComments.
- **Comprehensive HR Module**: Complete Human Resources management system at `/hr-management` with 10 integrated tabs covering all HR functions. Database schema includes 17 new tables: hrDepartments, hrPositions, hrEmployeeProfiles, hrContracts, hrDocuments, hrLeaveTypes, hrLeaveBalances, hrLeaveRequests, hrJobPostings, hrCandidates, hrInterviews, hrBenefitPlans, hrBenefitEnrollments, hrPerformanceReviews, hrPerformanceGoals, hrAnnouncements, and hrSelfServiceRequests. Features include:
  - **Employees**: Employee directory with search/filter, profile management, add employee functionality
  - **Attendance**: Clock in/out system, time tracking, attendance records with daily summaries
  - **Leave Management**: Leave types (Annual, Sick, Emergency, Hajj, Unpaid), leave request workflow, balance tracking
  - **Payroll**: Salary processing, allowances, deductions, net pay calculations, export functionality
  - **Performance**: Performance reviews with ratings, quarterly cycles, manager feedback
  - **Training**: Training programs catalog, certifications, enrollment tracking, completion status
  - **Recruitment**: Job postings, candidate pipeline (applied/screening/interview/offer/hired), interview scheduling
  - **Benefits**: Benefit plans (health insurance, housing, transportation), enrollment management
  - **Organization**: Departments structure, positions, announcements, cost centers
  - **Self-Service**: Employee request portal (salary certificates, experience letters, NOC, info updates)
  Saudi Arabia specific features include GOSI number, IBAN, SAR currency, Arabic names for departments/positions, and Hijj leave type.

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
- Twilio
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
- jspdf