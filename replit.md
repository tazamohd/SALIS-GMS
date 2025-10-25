# Login Dashboard Project

## Overview
This project is a full-stack SaaS application for garage management, offering a comprehensive, module-based system for managing operations, technician workflows, customer service, and business analytics. It features a modern, responsive UI and covers job cards, appointments, invoicing, reporting, vehicle management, estimates, SMS notifications, and scheduling. The business vision is to provide a complete, integrated platform for efficient garage operations, enhancing customer satisfaction and business growth.

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
- **Database**: PostgreSQL with Drizzle ORM, comprising 48 comprehensive modules with 70+ tables.
- **Real-Time Features**: WebSocket server for in-app chat support and live notifications.

**Core Modules**: The system includes 48 modules covering SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Technician Management, Vehicle Management, Job Cards, Appointments, Tool Management, Spare Parts Inventory, Purchase Orders, Invoicing & Billing, Payments, Estimates & Quotes, Reports & Analytics, SMS Notifications, Service Reminders, Vehicle Service History, Tax Configuration, Discounts & Promotions, Data Import/Export, Global Search, Saved Filter Presets, Notifications, Commission Management, Employee Attendance, Shift Templates, Performance Reviews, Training Programs, Stock Alerts, Security & Compliance, User Settings, Action History, Permission System, Consent Management, In-App Chat Support, Customer Self-Service Portal, Digital Signatures & Media Documentation, QR Code Check-In System, Fleet Management, Warranty Tracking, Marketing Automation, Vendor/Supplier Portal, Customer Loyalty Program, Vehicle Inspection Checklists, Towing & Roadside Assistance, Document Management, and Loaner Vehicle Management.

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