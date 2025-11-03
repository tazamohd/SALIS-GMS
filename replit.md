# Login Dashboard Project

## Overview
This project is a world-class automotive ERP platform (SALIS AUTO) designed to manage efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to 121 comprehensive modules across 11 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies including AI, blockchain, AR/VR, quantum computing, sustainable energy management, and dedicated mobile web applications for customers and technicians. The platform includes comprehensive compliance and localization features for the Saudi Arabian market, such as VAT compliance, ZATCA E-Invoicing, Hijri calendar support, Zakat calculations, TRN validation, Arabic language support, and localized PDF/Excel exports and SMS notifications.

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
**Database**: PostgreSQL with Drizzle ORM, comprising 119 comprehensive modules with 251 tables.
**Real-Time Features**: WebSocket server for in-app chat support and live notifications.

**Core Modules**: The system includes 60+ modules covering comprehensive garage operations, including SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Vehicle Management, Job Cards, Inventory, Invoicing, Analytics, and advanced enterprise modules such as Franchise Command Center, Diagnostics & OBD Hub, OEM Software Subscriptions, Globalization Layer, and Parts Supply Network.

**Enterprise Expansion**: The platform incorporates AI & Automation (AI Chatbot, Predictive Maintenance, Smart Parts Recommendations), Advanced Analytics (Business Intelligence, Profit Margin Analysis, Customer Lifetime Value), Enhanced Integrations (Accounting, Email Marketing, Stripe Payments), Customer Experience features, Operational Efficiency tools, Compliance & Quality management, and Advanced Hardware integrations (Barcode/QR Scanner, Digital Signage, Kiosk Check-In, LPR).

**Mobile Apps**: Dedicated backend API and documentation for three cross-platform React Native apps: Technician, Customer, and Manager Dashboard, with PWA-ready mobile interfaces for customers and technicians.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, print system, undo/redo, keyboard shortcuts, robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

**Saudi Arabia Compliance Stack**: This includes database tables for VAT registration, ZATCA certification, Zakat settings, Arabic company details, and utilities for VAT calculations, TRN validation, ZATCA QR code generation, Hijri calendar conversion, and localized PDF/Excel export services, and Twilio SMS integration with Saudi phone formatting. A persistent dark/light/system theme toggle is also included.

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