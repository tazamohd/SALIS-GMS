# Login Dashboard Project

## Overview
This project is a world-class automotive ERP platform (SALIS AUTO) designed to manage efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to 60 comprehensive modules, supporting multi-tenant franchise networks and advanced hardware integrations.

**NEW: Saudi Arabia Market Expansion (October 2025)**
The platform now includes comprehensive compliance and localization features for the Saudi Arabian market:
- **VAT Compliance**: 15% Saudi VAT calculations with automatic tax breakdown on all invoices and estimates
- **ZATCA E-Invoicing**: QR code generation following ZATCA (Fatoora) standards for tax compliance
- **Hijri Calendar**: Islamic calendar support with Gregorian-Hijri date conversion utilities
- **Zakat Calculations**: Islamic tax (2.5%) calculation utilities for businesses
- **TRN Validation**: 15-digit Tax Registration Number format validation and display
- **Arabic Support**: RTL language support with comprehensive Arabic translations (ar.json)
- **Dark/Light Theme Toggle**: User preference-based theme switching throughout the platform
- **PDF Export**: Professional invoice, estimate, and job card PDF generation with VAT breakdown
- **Excel Export**: CSV/Excel export for invoices, job cards, customers, vehicles, and VAT reports
- **SMS Reminders**: Twilio integration for appointment reminders, job completion, and payment notifications with Saudi (+966) phone formatting

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
**Database**: PostgreSQL with Drizzle ORM, comprising 60 comprehensive modules with 100+ tables.
**Real-Time Features**: WebSocket server for in-app chat support and live notifications.

**Core Modules**: The system includes 60+ modules covering comprehensive garage operations, including SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Vehicle Management, Job Cards, Inventory, Invoicing, Analytics, and advanced enterprise modules such as Franchise Command Center, Diagnostics & OBD Hub, OEM Software Subscriptions, Globalization Layer, and Parts Supply Network.

**Enterprise Expansion**: The platform includes advanced enterprise features across several phases:
-   **AI & Automation**: Six AI-powered modules with real OpenAI GPT-5 integration via Replit AI for features like AI Chatbot, Predictive Maintenance, and Smart Parts Recommendations.
-   **Advanced Analytics**: Four analytics modules utilizing PostgreSQL SQL aggregation for Business Intelligence, Profit Margin Analysis, Customer Lifetime Value, and Business Heat Maps.
-   **Enhanced Integrations**: Six integration modules including Accounting Integration (QuickBooks/Xero simulation), Email Marketing, Social Media, Video Consultations (Zoom/Teams), Parts Marketplace (eBay/Amazon simulation), and Stripe Payment Processing.
-   **Customer Experience**: Five customer-facing modules including Live Service Tracking, Video Estimates, Digital Vehicle Walkaround, Customer Reviews & Ratings, and a Referral Program.
-   **Operations & Efficiency**: Five operational modules such as AI-Powered Scheduling Optimizer, Parts Auto-Reordering System, Multi-Location Routing Optimizer, Time Clock & Payroll, and Equipment Calibration Tracking.
-   **Compliance & Quality**: Four compliance modules for Environmental Compliance, ISO 9001 Quality Management, Safety Incident Reporting, and Insurance Claims.
-   **Advanced Hardware**: Five hardware integration modules including Barcode/QR Scanner, Digital Signage System, Kiosk Check-In Interface, Security Camera Integration, and License Plate Recognition.
-   **Mobile Apps**: Backend API and documentation for three cross-platform React Native apps: Technician, Customer, and Manager Dashboard.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, print system, undo/redo, keyboard shortcuts, robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

**Saudi Arabia Compliance Stack**:
- **Database**: `saudi_tax_compliance` table with VAT registration, ZATCA certification, Zakat settings, and Arabic company details
- **Utilities**: 
  - `shared/vatUtils.ts` - VAT calculations, TRN validation, invoice totals with 15% Saudi rate
  - `shared/zatcaUtils.ts` - ZATCA QR code generation (Base64 TLV format), compliance validation
  - `shared/hijriUtils.ts` - Hijri calendar conversion, dual calendar formatting, Islamic month names
- **Export Services**:
  - `client/src/lib/pdfExport.ts` - jsPDF integration for invoices, job cards, estimates with VAT breakdown
  - `client/src/lib/excelExport.ts` - CSV export utilities for all major entities and VAT reports
- **SMS Service**: `server/smsService.ts` - Twilio integration with Saudi phone number formatting (+966)
- **Theme System**: `client/src/components/ThemeToggle.tsx` - Persistent dark/light/system theme preference

## External Dependencies
-   Replit Auth
-   PostgreSQL
-   Express.js
-   React
-   Vite
-   wouter
-   @tanstack/react-query
-   shadcn/ui
-   Tailwind CSS
-   Drizzle ORM
-   Zod
-   recharts
-   Twilio (SMS notifications)
-   NHTSA API
-   TecDoc API
-   Stripe
-   PayPal
-   react-big-calendar
-   date-fns
-   @zxing/library
-   Replit AI Integrations (OpenAI)
-   Google Calendar
-   Gmail
-   speakeasy
-   qrcode
-   jspdf + jspdf-autotable (PDF generation)

## Recent Changes (October 30, 2025)
**Saudi Arabia Market Launch Features**:
1. ✅ VAT compliance system (15% Saudi rate)
2. ✅ ZATCA e-invoicing QR codes
3. ✅ Hijri calendar support + Zakat calculations
4. ✅ Dark/Light theme toggle with localStorage persistence
5. ✅ PDF export service (invoices, estimates, job cards)
6. ✅ Excel/CSV export service (all entities + VAT reports)
7. ✅ Twilio SMS integration for appointment/payment reminders
8. ✅ TRN (Tax Registration Number) validation
9. ✅ Arabic RTL support (existing i18n system)