# Login Dashboard Project

## Overview
This project is a full-stack garage management SaaS application. Its core purpose is to provide a comprehensive system for managing garage operations, technician workflows, customer service, and business analytics. The application features a modern, responsive UI built with shadcn/ui and Tailwind CSS, leveraging TypeScript for robust development. The ambition is to offer a complete, module-based solution for garage businesses, covering everything from job cards and appointments to invoicing and reporting.

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- Continue developing and testing new features directly within the authenticated Figma interface
- Preserve original Figma design while adding functionality

## System Architecture
The application is built on a full-stack architecture with a clear separation between client and server.
- **Frontend**: React 18 with Vite, utilizing `wouter` for routing and `TanStack Query` for state management. UI components are built with `shadcn/ui` based on Radix UI primitives, strictly adhering to the original Figma design, including custom design tokens and typography.
- **Backend**: An Express server written in TypeScript, connected to a PostgreSQL database.
- **Authentication**: Secure session management is handled via Replit Auth.
- **Database**: PostgreSQL is used with Drizzle ORM for schema definition and interaction, supporting complex schemas for garage management, users, roles, job cards, appointments, inventory, purchase orders, and invoicing.
- **Key Features**: The system includes a login dashboard, comprehensive module-based features for garage operations (e.g., Job Cards, Appointments, Tool Management, Customer Management, Purchase Orders, Invoicing), and reporting capabilities. Form validation is implemented using Zod schemas shared between frontend and backend.
- **UI/UX Decisions**: The project emphasizes preserving the original Figma design, ensuring responsiveness, and using a consistent component-based approach with shadcn/ui.

## External Dependencies
- **Replit Auth**: For user authentication and secure session management.
- **PostgreSQL**: The primary database for all application data.
- **Express.js**: Backend web framework.
- **React**: Frontend library.
- **Vite**: Build tool for the frontend.
- **wouter**: Frontend routing library.
- **@tanstack/react-query**: Data fetching and state management for the frontend.
- **shadcn/ui**: UI component library based on Radix UI.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Drizzle ORM**: TypeScript ORM for interacting with PostgreSQL.
- **Zod**: Schema declaration and validation library.
- **recharts**: Used for data visualization in reports and dashboards.

## Implemented Modules (As of October 15, 2025)

### ✅ Core Management System
1. **Dashboard** - Overview of key metrics, recent activity, quick actions
2. **Tasks Management** - Task tracking and assignment system
3. **Appointments** - Appointment scheduling and management
4. **Customers** - Customer profiles, vehicles, and communication history
5. **Purchase Orders** - Supplier integration and PO management
6. **Invoices** - Invoice generation, billing, and payment tracking with status workflow validation
7. **Reports & Dashboards** - Comprehensive analytics with 4 tabs:
   - Overview: Key business metrics (revenue, invoices, job cards, customers)
   - Revenue: Monthly trends, invoices by status, payments by method
   - Job Cards: Status/priority distribution, completion time metrics, technician performance
   - Inventory: Tool availability, category breakdown
   - Features: Garage-specific filtering, recharts visualization, real completion time calculation
8. **My Profile** - User profile management and account settings

### 🎯 Production Status
All 8 modules are production-ready with architect approval, featuring:
- PostgreSQL database with Drizzle ORM
- Comprehensive form validation with Zod schemas
- Secure session management via Replit Auth
- Responsive UI with shadcn/ui components
- Real-time data updates with TanStack Query
- Proper error handling and loading states