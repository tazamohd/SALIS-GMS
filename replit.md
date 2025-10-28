# Login Dashboard Project

## Overview
This project is a world-class automotive ERP platform (SALIS AUTO) designed to manage efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to 60 comprehensive modules, supporting multi-tenant franchise networks and advanced hardware integrations, aiming to solidify its position as a leading solution in the automotive industry.

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
-   Twilio
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