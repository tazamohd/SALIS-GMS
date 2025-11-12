# Login Dashboard Project

## Overview
This project is SALIS AUTO, a world-class automotive ERP platform managing efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to **141+ comprehensive modules** across 13 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies (AI, blockchain, AR/VR, quantum computing, sustainable energy management), and dedicated mobile web applications. It includes comprehensive compliance and localization features for the Saudi Arabian market (VAT, ZATCA E-Invoicing, Hijri calendar, Zakat, TRN validation, Arabic language, localized exports, SMS). Recent enhancements include an in-app chat support system, a comprehensive technician portal, AI-powered predictive diagnostics, an AI chatbot assistant, blockchain service history, and smart contracts. The latest phase (Phase 13) completes the implementation of 9 operational modules including Payroll Management, Expense Tracking, Towing Services, Vehicle Storage, Telematics Integration, Knowledge Base, Training LMS, Google My Business Integration, and Enhanced Compliance Management.

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

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, print system, undo/redo, keyboard shortcuts, robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

**Core Modules**: The system includes 60+ modules covering comprehensive garage operations, including SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Vehicle Management, Job Cards, Inventory, Invoicing, Analytics, and advanced enterprise modules such as Franchise Command Center, Diagnostics & OBD Hub, OEM Software Subscriptions, Globalization Layer, Parts Supply Network, and Contract Management with SLA Tracking.

**Enterprise Expansion**: The platform incorporates AI & Automation (AI Chatbot, Predictive Maintenance, Smart Parts Recommendations), Advanced Analytics (Business Intelligence, Profit Margin Analysis, Customer Lifetime Value), Enhanced Integrations (Accounting, Email Marketing, Stripe Payments), Customer Experience features, Operational Efficiency tools, Compliance & Quality management, and Advanced Hardware integrations (Barcode/QR Scanner, Digital Signage, Kiosk Check-In, LPR).

**Mobile Apps**: Dedicated backend API and documentation for three cross-platform React Native apps: Technician, Customer, and Manager Dashboard, with PWA-ready mobile interfaces for customers and technicians.

**Saudi Arabia Compliance Stack**: Includes database tables for VAT registration, ZATCA certification, Zakat settings, Arabic company details, and utilities for VAT calculations, TRN validation, ZATCA QR code generation, Hijri calendar conversion, and localized PDF/Excel export services, and Twilio SMS integration with Saudi phone formatting.

**Recent Features**:
- **In-App Chat Support System**: Production-ready real-time chat with support tickets, file attachments, message reactions, typing indicators, and presence tracking. Features session-based WebSocket authentication with cookie signature validation, comprehensive input validation, server-side participant derivation, and automatic connection termination on auth failures. Includes `supportTickets`, `supportTicketEvents`, `chatAttachments` tables, dedicated API routes with Zod validation, and WebSocket server with cryptographic session verification.
- **Client Portal Advanced Features**: Service History, E-Signature, Service Reminders, Live Tracking, and Review & Chat system with new database tables (`serviceSignatures`, `serviceChatMessages`, `serviceReviews`).
- **Technician Portal**: Desktop portal at `/technician-portal` with Dashboard, My Jobs, Time Clock, Parts Lookup, Job Documentation, and Profile pages, with technician-scoped API routes.
- **AI-Powered Predictive Diagnostics**: Analyzes vehicle parameters to predict failures using GPT-5, saving predictions to `aiMaintenancePredictions` table.
- **AI Chatbot Assistant**: GPT-5-powered conversational assistant for customer queries, service bookings, and vehicle diagnostics, using `aiChatConversations` and `aiChatMessages` tables.
- **Blockchain Service History**: Immutable ledger system using cryptographic hashing for tamper-proof vehicle service records, stored in `blockchainRecords`.
- **Smart Contracts**: Automated service agreements with digital signatures and payment triggers, managed via `smartContracts` and `contractEvents` tables.
- **Operational Modules (Phase 13)**: Includes Payroll Management (`payroll_employees`, `pay_periods`, `payroll_runs`), Expense Tracking (`expense_categories`, `expenses`), Towing & Recovery Services (`towing_jobs`), Vehicle Storage Services (`storage_facilities`, `vehicle_storage_assignments`), Telematics Integration (`telematics_feeds`, `telematics_alerts`), Knowledge Base (`article_categories`, `knowledge_articles`), Training & Certification LMS (`training_modules`, `certifications`, `certification_attempts`), Google My Business Integration (`google_business_profiles`, `gmb_posts`, `gmb_reviews`), and Enhanced Compliance Management (`compliance_policies`, `compliance_audits`, `compliance_tasks`).

**Wave 2: Customer Experience Features (In Progress)**:
- **Feature #4 - Automated Push Notifications MVP**: Production-ready in-app notification bell component with unread badge, dropdown list, and mark-as-read functionality. Integrated with existing notification API routes (GET, POST, PATCH, DELETE, unread-count). Manual test notification endpoint (POST /api/notifications/test) for admin testing. Foundation infrastructure includes `notification_schedules` table and storage CRUD methods for future automation. Existing SMS (Twilio) and email (GetResponse) services functional. **Backlog**: Event-triggered automation service deferred pending data model enhancements (appointments.scheduledDate, storage.getGarage method).

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