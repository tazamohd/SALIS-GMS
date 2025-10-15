# Login Dashboard Project

## Overview
This project is a full-stack SaaS application designed for garage management. It provides a comprehensive system for managing garage operations, technician workflows, customer service, and business analytics. The application features a modern, responsive UI and is built with TypeScript for robust development. The goal is to offer a complete, module-based solution for garage businesses, covering all aspects from job cards and appointments to invoicing and reporting.

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- Continue developing and testing new features directly within the authenticated Figma interface
- Preserve original Figma design while adding functionality

## System Architecture
The application uses a full-stack architecture with a clear separation between client and server.
- **Frontend**: React 18 with Vite, `wouter` for routing, and `TanStack Query` for state management. UI components are built with `shadcn/ui` based on Radix UI primitives, strictly adhering to the original Figma design using custom design tokens and typography.
- **Backend**: An Express server written in TypeScript.
- **Authentication**: Secure session management is handled via Replit Auth.
- **Database**: PostgreSQL with Drizzle ORM for schema definition and interaction, supporting complex schemas for garage management, users, roles, job cards, appointments, inventory, purchase orders, and invoicing.
- **Key Features**: The system includes a login dashboard and comprehensive module-based features for garage operations such as Job Cards, Appointments, Tool Management, Customer Management, Purchase Orders, Invoicing, and Reporting. Form validation is implemented using Zod schemas shared between frontend and backend.
- **UI/UX Decisions**: Emphasizes preserving the original Figma design, ensuring responsiveness, and utilizing a consistent component-based approach with shadcn/ui.

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
- **recharts**: Data visualization for reports and dashboards.

## Recent Changes

### Module 15: Purchase Orders Management (October 15, 2025)
**Core Functionality**:
- Complete CRUD operations for purchase orders
- Line item management with automatic calculations
- Status workflow management (draft → sent → confirmed → partial → received → cancelled)
- Supplier integration with supplier selection
- Expected delivery date tracking
- Automatic PO number generation
- Subtotal, tax, and total calculations
- Notes and special instructions support

**UI Features**:
- Enhanced table view with comprehensive filters (garage, status)
- Summary cards showing total orders, pending, confirmed, and total value
- Create dialog with inline line item management
- Add/remove line items with quantity and unit price
- Real-time calculation of subtotals, tax (10%), and totals
- Details dialog showing complete PO information
- Inline status editing within details view
- Delete functionality with confirmation (draft orders only)
- Status transition actions via dropdown menu
- Responsive grid layout with skeleton loading states
- Empty states with helpful messaging

**Technical Implementation**:
- Uses insertPurchaseOrderSchema and insertPurchaseOrderItemSchema from @shared/schema
- Form validation with Zod and react-hook-form
- TanStack Query for data fetching and mutations
- Backend API routes: GET, POST, PATCH, DELETE at /api/purchase-orders
- Batch creation endpoint: POST /api/purchase-orders/with-items for atomic PO+items creation
- Storage methods: getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder
- Line items storage: getPurchaseOrderItems, createPurchaseOrderItem, deletePurchaseOrderItem
- Proper cache invalidation using predicate queries for all operations
- Data-testid attributes for testing
- Comprehensive error handling with user-friendly messages
- Status workflow enforcement in UI

**Production-ready** with full functionality

### Module 16: Technician Management Enhancements (October 15, 2025)
**Core Functionality**:
- Complete CRUD operations for technicians (create, read, update, delete)
- Technician profile management with skills, certifications, and qualifications
- User account creation with garage assignment
- Safe deletion with confirmation dialog
- Profile editing with comprehensive form fields

**UI Features**:
- "Add Technician" button in page header
- AddTechnicianDialog component with form validation
- Delete button on each technician card with trash icon
- Delete confirmation dialog with user name display
- Edit and Delete buttons side-by-side on cards
- Real-time updates after create/edit/delete operations
- Proper loading states during mutations
- Toast notifications for success and error feedback

**Technical Implementation**:
- Backend API routes: POST /api/technicians, DELETE /api/technicians/:id
- Storage methods: createUser, deleteUser in DatabaseStorage class
- Form validation using Zod with insertUserSchema
- Proper TypeScript typing with Garage[] for garage selection
- Predicate-based cache invalidation covering both /api/technicians and /api/technician-profiles
- React Hook Form with zodResolver for form management
- useQueries for efficiently fetching multiple technician profiles
- Data-testid attributes throughout for testing
- Comprehensive error handling with user-friendly messages

**Production-ready** with architect-approved implementation

### Module 17: Analytics & Reporting Enhancements (October 15, 2025)
**Core Functionality**:
- Date range picker with preset options (Last 7 days, Last 30 days, Last 90 days, This Month, Last Month, Custom)
- Technician performance analytics with comprehensive metrics
- Jobs completed tracking per technician
- Average completion time calculation (in days)
- Revenue generated attribution by technician
- Efficiency rating based on job completion rate
- Job status breakdown for each technician
- Garage-scoped and date-filtered analytics

**UI Features**:
- Interactive date range picker with calendar and preset buttons
- New "Technicians" tab in Reports page
- Individual performance cards for each technician with key metrics
- Visual efficiency rating with progress bar
- Comparison charts: Jobs Completed, Revenue Generated, Avg. Completion Time, Efficiency Rating
- Bar charts for technician performance comparison
- Empty state messaging when no data available
- Loading states with spinner
- Responsive grid layout for performance cards

**Technical Implementation**:
- Backend API route: GET /api/reports/technician-performance with garage and date filters
- Storage method: getTechnicianPerformance with SQL-based filtering
- SQL filtering applied to technicians, job cards, and invoices for performance
- Optional date range support (start/end) with proper handling of partial ranges
- Date normalization to day boundaries (start: 00:00:00, end: 23:59:59)
- API validation with 400 errors for invalid dates
- Revenue returned as number from backend, formatted as currency in frontend
- Completion time calculated only for jobs with both createdAt and completedAt
- Proper handling of NaN in revenue calculations
- Garage-scoped queries preventing cross-garage data leakage
- Data-testid attributes throughout for testing
- Type-safe implementation with proper TypeScript interfaces

**Production-ready** with architect-approved implementation

### Module 18: Customer Analytics (October 15, 2025)
**Core Functionality**:
- Customer performance analytics with comprehensive metrics
- Lifetime value calculation (total revenue from invoices)
- Total invoices and total visits tracking
- Average invoice value calculation
- Last visit date tracking
- Customer status determination (active: visit in last 30 days, recent: 30-90 days, inactive: >90 days)
- Garage-scoped and date-filtered analytics
- Activity-based customer filtering (only customers with relevant invoices/appointments)

**UI Features**:
- New "Customers" tab in Reports page
- Individual customer cards with key metrics (lifetime value, invoices, visits, avg invoice)
- Color-coded status badges (active, recent, inactive)
- Comparison charts: Top 10 by Lifetime Value, Visit Frequency, Average Invoice Value
- Pie chart showing customer status distribution
- Empty state messaging when no data available
- Loading states with spinner
- Responsive grid layout for customer cards
- Email display on customer cards when available

**Technical Implementation**:
- Backend API route: GET /api/reports/customer-analytics with garage and date filters
- Storage method: getCustomerAnalytics with SQL-based filtering
- SQL filtering applied to users, invoices, and appointments
- Customer filtering based on activity in selected garage/date range
- activeCustomerIds set to capture customers with relevant invoices/appointments
- Optional date range support (start/end) with proper handling of partial ranges
- Date normalization to day boundaries (start: 00:00:00, end: 23:59:59)
- API validation with 400 errors for invalid dates
- Revenue and metrics returned as numbers from backend
- Garage-scoped queries preventing cross-garage data leakage
- Data-testid attributes throughout for testing
- Type-safe implementation with proper TypeScript interfaces
- Sorted by lifetime value descending

**Production-ready** with architect-approved implementation