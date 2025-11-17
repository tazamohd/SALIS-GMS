# Login Dashboard Project

## Overview
SALIS AUTO is a world-class automotive ERP platform designed for efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to **141+ comprehensive modules** across 13 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies (AI, blockchain, AR/VR, quantum computing, sustainable energy management), and dedicated mobile web applications. It includes comprehensive compliance and localization features for the Saudi Arabian market (VAT, ZATCA E-Invoicing, Hijri calendar, Zakat, TRN validation, Arabic language, localized exports, SMS). Recent enhancements include an in-app chat support system, a comprehensive technician portal, AI-powered predictive diagnostics, an AI chatbot assistant, blockchain service history, smart contracts, and 9 operational modules from Phase 13 (Payroll, Expense Tracking, Towing Services, Vehicle Storage, Telematics Integration, Knowledge Base, Training LMS, Google My Business Integration, and Enhanced Compliance Management).

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
**Authentication**: Custom email/password authentication with role-based access control.
**Database**: PostgreSQL with Drizzle ORM, comprising **141+ comprehensive modules with 290+ tables**.
**Real-Time Features**: WebSocket server (`/ws/chat`) for in-app chat support, live notifications, and call center real-time updates with session-based authentication.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes.

**Design System & Archetype Wrappers**: A comprehensive UI/UX design system overhaul has been completed across all 144 application pages using 7 production-ready archetype wrappers: StandardPageLayout (simple pages with header/description), StandardTablePage (data tables), DashboardPage (metrics/cards), FormPage (form-centric), AnalyticsPage (reporting), MobileCardPage (mobile-optimized cards), and TabsPageLayout (multi-tab interfaces). **138 pages** have been successfully migrated to use these archetypes, while **6 pages** (Landing, LoginDashboard, Login, Register, not-found, PublicTracking) retain intentional custom layouts for their special purposes. All migrated pages maintain full functionality, data-testid attributes for testing, and dark theme consistency.

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