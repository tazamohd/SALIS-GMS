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
3. **Job Cards** - Service job cards management with vehicle info, technician assignment, and progress tracking
4. **Service Templates** - Reusable service templates with predefined task steps and workflows
5. **Tools Management** - Tool and equipment inventory tracking with availability status
6. **Appointments** - Appointment scheduling and management
7. **Customers** - Customer profiles, vehicles, and communication history
8. **Purchase Orders** - Supplier integration and PO management
9. **Invoices** - Invoice generation, billing, and payment tracking with status workflow validation
10. **Reports & Dashboards** - Comprehensive analytics with 4 tabs:
   - Overview: Key business metrics (revenue, invoices, job cards, customers)
   - Revenue: Monthly trends, invoices by status, payments by method
   - Job Cards: Status/priority distribution, completion time metrics, technician performance
   - Inventory: Tool availability, category breakdown
   - Features: Garage-specific filtering, recharts visualization, real completion time calculation
11. **My Profile** - User profile management and account settings

### 🎯 Production Status
All 11 modules are production-ready with architect approval, featuring:
- PostgreSQL database with Drizzle ORM
- Comprehensive form validation with Zod schemas
- Secure session management via Replit Auth
- Responsive UI with shadcn/ui components
- Real-time data updates with TanStack Query
- Proper error handling and loading states

### Module 9: Job Cards (October 15, 2025)
**Core Functionality**:
- Complete CRUD operations for job cards
- Vehicle information tracking (make, model, year, license plate, VIN)
- Service type categorization (maintenance, repair, diagnostic, inspection, bodywork)
- Priority levels (low, medium, high, urgent)
- Status workflow (pending → assigned → in_progress → completed/cancelled)
- Automatic timestamp tracking (startedAt, completedAt)
- Technician assignment
- Cost and time estimation

**UI Features**:
- Card-based listing with responsive grid layout
- Three-level filtering (Garage, Status, Priority)
- Comprehensive create dialog with form validation
- Detailed view dialog showing all job card information
- Quick status change dropdown
- Status and priority badges with color coding
- Empty states and loading indicators

**Technical Implementation**:
- Uses insertJobCardSchema from @shared/schema for type safety
- Form validation with Zod and react-hook-form
- TanStack Query for data fetching and mutations
- Proper cache invalidation for filtered views
- Timestamp logic that prevents duplicate entries
- All required default values for form fields
- Data-testid attributes for testing

**Production-ready** with full architect approval

### Module 10: Service Templates (October 15, 2025)
**Core Functionality**:
- Complete CRUD operations for service templates
- Reusable service definitions with standardized workflows
- Dynamic task steps builder for multi-step services
- Category classification (maintenance, repair, diagnostic)
- Estimated hours and standard cost tracking
- Required skills tracking (stored as JSON array)
- Active/inactive template status management

**UI Features**:
- Card-based listing with responsive grid layout
- Two-level filtering (Garage, Category)
- Comprehensive create dialog with dynamic task steps
- Task steps builder with add/remove functionality
- Detailed view dialog showing all template information
- Delete confirmation in details view
- Status badges with color coding
- Empty states and loading indicators

**Technical Implementation**:
- Uses insertServiceTemplateSchema from @shared/schema for type safety
- Form validation with Zod and react-hook-form
- TanStack Query with dual query support (single-garage and all-garages views)
- Proper cache invalidation for both query branches
- JSONB columns for taskSteps and requiredSkills arrays
- Storage methods: getAllServiceTemplates, getServiceTemplates, getServiceTemplate, create, update, delete
- API routes including /all endpoint for cross-garage queries
- Data-testid attributes for testing

**Production-ready** with full architect approval

### Module 11: Tools Management (October 15, 2025)
**Core Functionality**:
- Complete CRUD operations for tools and equipment
- Tool type categorization (diagnostic, mechanical, electrical)
- Brand and manufacturer tracking
- Visibility settings (private, public, shared)
- Global vs. local tool configuration
- Active/inactive status management
- Comprehensive tool metadata (tags, compatible vehicles, linked services/parts)

**UI Features**:
- Card-based listing with responsive grid layout
- Tool type filtering
- Comprehensive create dialog with form validation
- Detailed view dialog showing all tool information
- Status badges with color coding
- Error handling and loading states
- Empty states with helpful messaging

**Technical Implementation**:
- Uses insertToolSchema from @shared/schema for type safety
- Form validation with Zod and react-hook-form
- TanStack Query for data fetching and mutations
- Backend API routes already in place (/api/tools)
- Proper cache invalidation
- Complete data-testid attributes for testing
- Error state handling with user-friendly messages

**Production-ready** with full architect approval