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