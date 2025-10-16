# Login Dashboard Project

## Overview
This project is a full-stack SaaS application for garage management. It provides a comprehensive, module-based system for managing garage operations, technician workflows, customer service, and business analytics. The application features a modern, responsive UI, is built with TypeScript, and aims to offer a complete solution covering job cards, appointments, invoicing, and reporting for garage businesses.

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
- **Key Features**: Includes a login dashboard and modules for Job Cards, Appointments, Tool Management, Customer Management, Purchase Orders, Invoicing, and Reporting. Form validation is implemented using Zod schemas shared between frontend and backend.
- **UI/UX Decisions**: Emphasizes preserving the original Figma design, ensuring responsiveness, and utilizing a consistent component-based approach.

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
- **GetResponse**: Email marketing and automation (for notifications).
### Module 22: Vehicle Management (October 16, 2025)
**Core Functionality**:
- Complete vehicle management system for tracking customer vehicles
- Add, edit, and delete vehicle records with full CRUD operations
- Vehicle database with make, model, year, license plate, VIN, color, mileage tracking
- Support for engine type (gasoline, diesel, electric, hybrid) and transmission type
- Customer association for each vehicle
- Garage-scoped vehicle listing and filtering
- Search functionality across make, model, license plate, VIN, and owner name
- Soft delete with isActive flag

**UI Features**:
- Vehicles page with grid layout showing all vehicles
- Vehicle cards displaying key information (make, model, year, owner, license plate)
- Add/Edit vehicle modal with comprehensive form
- Search bar for quick vehicle lookup
- Visual indicators for active vehicles with status badges
- Empty states for no vehicles or search results
- Delete confirmation dialogs for safety
- Responsive design for all screen sizes

**Form Fields**:
- Customer selection (required) - dropdown of all customers
- Make and Model (required) - text inputs
- Year (required) - numeric input
- License Plate (required) - text input
- VIN (optional) - text input
- Color (optional) - text input
- Engine Type (optional) - dropdown (gasoline, diesel, electric, hybrid)
- Transmission Type (optional) - dropdown (automatic, manual)
- Mileage (optional) - numeric input
- Notes (optional) - textarea for additional information

**Technical Implementation**:
- Database schema: vehicles table with customer/garage relationships
- Storage methods: getVehicles, getCustomerVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle
- Backend API routes: GET/POST /api/vehicles, PATCH/DELETE /api/vehicles/:id with Zod validation
- Frontend: React Hook Form with insertVehicleSchema validation from shared schema
- React Query for data fetching with automatic cache invalidation
- Navigation integration in sidebar and Quick Actions modal
- Data-testid attributes throughout for testing
- Type-safe implementation with Vehicle and InsertVehicle types

**Integration Points**:
- Links to customer records
- Added to sidebar navigation
- Included in Quick Actions modal for rapid access
- Backend routes support garage filtering for multi-tenant isolation

**Production-ready** and fully integrated with existing system

### Module 23: Estimates & Quotes (October 16, 2025)
**Core Functionality**:
- Complete estimate/quote management system with full CRUD operations
- Estimate creation with line items (services/parts), pricing, taxes, and discounts
- Status workflow: draft → sent → viewed → approved/rejected → expired → converted
- Conversion functionality: estimate-to-job-card and estimate-to-invoice
- Customer and vehicle association for contextual estimates
- Terms and conditions, validity period tracking
- Vehicle information capture for service context

**Status Management**:
- Draft: Initial creation state
- Sent: Delivered to customer
- Viewed: Customer opened estimate
- Approved/Rejected: Customer response
- Expired: Past validity date
- Converted: Transformed to job card or invoice

**Conversion Features**:
- **Estimate-to-Job-Card**: Creates job card with task assignments from estimate items, links conversion tracking
- **Estimate-to-Invoice**: Generates invoice with matching line items, maintains estimate reference

**UI Features**:
- Estimates list page with status filtering and search
- Create/Edit estimate dialog with dynamic item management
- Estimate details view with conversion action buttons
- Integration with Quick Actions (Cmd/Ctrl+K)
- Real-time subtotal/tax/total calculations
- Empty states and loading indicators

**Technical Implementation**:
- Database schema: estimates and estimate_items tables
- Storage methods: CRUD operations for estimates and items, conversion methods
- Backend routes: GET/POST /api/estimates, conversion endpoints with validation
- Frontend: React Hook Form with Zod validation, TanStack Query for state
- Type-safe with Estimate, EstimateItem, InsertEstimate types

**Integration Points**:
- Links to customers and vehicles
- Converts to job cards with task assignments
- Converts to invoices with line items
- Sidebar navigation and Quick Actions access

**Production-ready** and architect-approved

### Module 24: SMS Notifications & Preferences (October 16, 2025)
**Core Functionality**:
- Complete SMS notification system using Twilio integration
- 8 SMS notification types: appointment reminders, confirmations, job status updates, completion, invoices, payments, estimates, feedback requests
- Granular notification preferences per category (email, SMS, in-app channels)
- User-configurable opt-in/opt-out for each notification type
- Preference persistence with JSON-based event mapping

**SMS Templates**:
- Appointment Reminder: "Hi {name}, reminder: Your appointment at {garage} is on {date} at {time}"
- Appointment Confirmation: Booking confirmation with details
- Job Status Update: Progress notifications for ongoing work
- Job Completed: Service completion with total amount
- Invoice Notification: Payment due reminders with amount and date
- Payment Received: Confirmation of payment processing
- Estimate Ready: Quote availability notification
- Feedback Request: Post-service satisfaction survey invitation

**Notification Preferences**:
- Per-category control (appointments, invoices, jobs, payments, estimates, feedback)
- Three channels per category: Email, SMS, In-App
- Toggle switches for granular control
- Persistent storage in notification_preferences table
- Real-time save with immediate UI feedback

**Technical Implementation**:
- **Twilio Integration**: Replit Connector for SMS (twilioClient.ts)
- **SMS Service**: Template-based messaging with error handling (smsService.ts)
- **Backend Routes**: 8 SMS endpoints + preferences management
- **Storage**: getNotificationPreferences, upsertNotificationPreferences methods
- **Frontend**: NotificationPreferences component with useEffect hydration
- **UI Integration**: Preferences accessible from Notifications page

**Integration Points**:
- Twilio connector with automatic credential management
- Notification creation tracking in database
- Links to existing notification system (Module 21)
- Preferences UI embedded in Notifications page
- Ready for workflow integration (appointments, invoices, job cards)

**Security**:
- Twilio credentials managed via Replit Connectors
- No API keys exposed in code
- User-scoped preferences with authentication
- Notification records for audit trail

**Production-ready** and architect-approved
