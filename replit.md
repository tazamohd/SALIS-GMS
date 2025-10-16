# Login Dashboard Project

## Overview
This project is a full-stack SaaS application for garage management. It provides a comprehensive, module-based system for managing garage operations, technician workflows, customer service, and business analytics. The application features a modern, responsive UI, is built with TypeScript, and offers a complete solution covering job cards, appointments, invoicing, reporting, vehicle management, estimates, SMS notifications, and scheduling for garage businesses. The business vision is to provide a complete, integrated platform for efficient garage operations, enhancing customer satisfaction and business growth.

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- Continue developing and testing new features directly within the authenticated Figma interface
- Preserve original Figma design while adding functionality

## System Architecture
The application utilizes a full-stack architecture with clear client-server separation.
- **Frontend**: React 18 with Vite, `wouter` for routing, and `TanStack Query` for state management. UI components use `shadcn/ui` based on Radix UI primitives, adhering to the original Figma design with custom design tokens and typography.
- **Backend**: Express server written in TypeScript.
- **Authentication**: Replit Auth handles secure session management.
- **Database**: PostgreSQL with Drizzle ORM for schema definition and interaction, supporting complex schemas for various garage management entities.
- **Key Features**: Includes a login dashboard and modules for Job Cards, Appointments, Tool Management, Customer Management, Purchase Orders, Invoicing, Reporting, Vehicle Management (including service history, maintenance schedules, VIN decoding, photo gallery, service reminders, warranty tracking), Estimates & Quotes (with status workflow and conversion to job cards/invoices), SMS Notifications (via Twilio with granular preferences), Scheduling & Calendar (with multiple views, technician availability, recurring appointments, and conflict detection), Inventory & Parts Management (Module 27: featuring low stock alerts with acknowledgment workflow, automatic reordering based on thresholds, barcode scanning with HTML5 camera API, pricing history tracking, complete inventory audit trail, multi-location transfers with approval workflow, and TecDoc integration for parts catalog lookup with response caching), Advanced Financial Features (Module 28: multi-provider payment processing with Stripe and PayPal, payment plans/installments with automated scheduling, refund management with approval workflow, rule-based tax calculation automation, comprehensive discounts/promotions system with validation, and profit margin analysis with cost tracking), Search & Filtering (Module 29: global search across all modules with cross-module results, advanced filtering with saved filter presets for user-specific and garage-wide configurations, bulk operations for delete/update across modules, and data import/export functionality with CSV/JSON support for data migration and backups), Business Intelligence & Analytics (Module 30: customer lifetime value tracking with top customer rankings, most profitable services analysis with profit margin visualization, peak hours/days analysis with hourly and daily distribution charts, technician utilization rates showing hours worked vs available, and customer acquisition cost tracking with source attribution), Staff & HR Management (Module 31: comprehensive employee time tracking with clock in/out and break management, shift scheduling with reusable templates and assignments, automated commission calculation for technicians with flexible rule-based system supporting percentage/fixed/tiered structures, performance reviews with multi-dimensional ratings and acknowledgment workflow, training and certification tracking with expiry monitoring, all features fully secured with garage-scoped multi-tenant isolation and Zod input validation), and AI Automation & Insights (Module 32: AI-powered job time and cost estimation with historical data analysis, predictive maintenance suggestions based on vehicle history and mileage, automated parts recommendations for service types, smart schedule optimization for technician assignments, AI customer support chatbot for inquiries, powered by Replit AI Integrations using OpenAI gpt-5 model, all features with confidence scores and reasoning explanations). Form validation is implemented using Zod schemas shared between frontend and backend.
- **UI/UX Decisions**: Emphasizes preserving the original Figma design, ensuring responsiveness, and utilizing a consistent component-based approach with tabbed interfaces for complex modules.

## External Dependencies
- **Replit Auth**: User authentication and secure session management.
- **PostgreSQL**: Primary database.
- **Express.js**: Backend web framework.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **wouter**: Frontend routing.
- **@tanstack/react-query**: Data fetching and state management.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **Zod**: Schema declaration and validation.
- **recharts**: Data visualization.
- **Twilio**: SMS notification integration.
- **NHTSA API**: Free VIN decoding service.
- **TecDoc API**: Parts catalog lookup service (requires TECDOC_API_URL and TECDOC_API_KEY environment variables).
- **Stripe**: Payment processing provider (requires STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY environment variables).
- **PayPal**: Payment processing provider (requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables, managed via Replit blueprint integration).
- **react-big-calendar**: Calendar component for scheduling.
- **date-fns**: Date utility library (used with react-big-calendar).
- **@zxing/library**: Barcode scanning library for inventory management.
- **Replit AI Integrations (OpenAI)**: AI-powered features using gpt-5 model for job estimation, predictive maintenance, parts recommendations, schedule optimization, and customer support chatbot (requires AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY environment variables, automatically set by Replit).
- **Google Calendar**: Replit connector integration for appointment syncing (connection:conn_google-calendar_01K7P5FJS6Q2VZMWCN5FGWYBFN).
- **Gmail**: Replit connector integration for email notifications (connection:conn_google-mail_01K7P5HHZF5PMG9XG1NW7AK0Y9).

## Integration Notes
- **HubSpot CRM**: User declined the connector integration. For CRM functionality, request HubSpot API credentials to store as secrets for manual integration if needed in the future.
- **QuickBooks/Xero**: No native Replit connector available. Will implement manual integration with user-provided API credentials when requested.
- **OBD-II Diagnostics**: No native connector. Will implement manual integration with OBD adapter API/SDK when requested.
