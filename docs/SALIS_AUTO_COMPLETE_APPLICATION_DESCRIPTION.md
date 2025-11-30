# SALIS AUTO - Complete Application Description
## Comprehensive Garage Management System

**Version:** 2.0.0  
**Last Updated:** October 30, 2025  
**Document Type:** Complete System Documentation  
**🇸🇦 Saudi Arabia**: Production Ready

**NEW**: Saudi Arabia market expansion complete with VAT compliance, ZATCA e-invoicing, Hijri calendar, and more. [See full documentation →](./SAUDI_ARABIA_FEATURES.md)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Core Modules](#5-core-modules)
6. [Advanced Features](#6-advanced-features)
7. [Third-Party Integrations](#7-third-party-integrations)
8. [Security & Compliance](#8-security--compliance)
9. [Customer Portal](#9-customer-portal)
10. [AI Automation Features](#10-ai-automation-features)
11. [Database Schema](#11-database-schema)
12. [Frontend Pages & Routes](#12-frontend-pages--routes)
13. [API Endpoints](#13-api-endpoints)
14. [Business Intelligence & Analytics](#14-business-intelligence--analytics)
15. [Mobile & PWA Support](#15-mobile--pwa-support)
16. [Localization & Multi-Currency](#16-localization--multi-currency)
17. [Data Management](#17-data-management)
18. [Financial Management](#18-financial-management)
19. [Communication System](#19-communication-system)
20. [System Administration](#20-system-administration)

---

## 1. EXECUTIVE SUMMARY

**SALIS AUTO** is a comprehensive, enterprise-grade **Garage Management System** (GMS) designed specifically for automotive service centers, repair shops, and multi-branch garage operations in the Middle East and globally. Built with modern technologies (React, Express, PostgreSQL), the system provides complete end-to-end management of all garage operations from customer intake to service delivery, billing, and business analytics.

### Key Highlights:
- **Multi-Garage & Multi-Branch Support**: Manage multiple locations from a single platform
- **Role-Based Access Control**: 7 distinct user roles with granular permissions
- **Complete Service Lifecycle Management**: From appointment booking to invoice payment
- **AI-Powered Automation**: Job estimation, predictive maintenance, and smart scheduling
- **Comprehensive Financial Tools**: Multi-currency support, payment plans, automated tax calculation
- **Customer Self-Service Portal**: Dedicated customer interface for appointments and vehicle tracking
- **Third-Party Integrations**: Twilio (SMS), Gmail, Google Calendar, Stripe, PayPal, and more
- **Security & Compliance**: 2FA, GDPR tools, audit logging, and data backup

---

## 2. SYSTEM OVERVIEW

### 2.1 Business Purpose

SALIS AUTO addresses the critical operational challenges faced by modern automotive service businesses:

- **Operational Efficiency**: Streamline workflows, reduce manual paperwork, minimize errors
- **Customer Satisfaction**: Transparent communication, online booking, real-time updates
- **Financial Control**: Accurate invoicing, payment tracking, profit margin analysis
- **Business Growth**: Data-driven insights, performance tracking, scalable infrastructure
- **Compliance**: Automated audit trails, GDPR compliance, secure data management

### 2.2 Target Users

- **Garage Owners & Managers**: Complete operational oversight
- **Service Advisors & Receptionists**: Customer intake and appointment management
- **Technicians & Mechanics**: Task execution and progress tracking
- **Parts & Inventory Managers**: Stock control and supplier management
- **Accountants & Finance Teams**: Billing, payments, and financial reporting
- **Customers**: Self-service portal for bookings and vehicle tracking

### 2.3 Key Business Metrics

The system tracks and optimizes:
- Customer satisfaction scores
- Technician utilization rates
- Average job completion time
- Revenue per service type
- Inventory turnover
- Customer lifetime value
- Profit margins per job

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Technology Stack

**Frontend:**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling
- **Wouter** - Lightweight routing
- **TanStack Query (React Query v5)** - Server state management
- **shadcn/ui + Radix UI** - Component library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

**Backend:**
- **Node.js with Express** - Web framework
- **TypeScript** - Type-safe server code
- **Passport.js** - Authentication middleware
- **Bcrypt** - Password hashing

**Database:**
- **PostgreSQL (Neon)** - Primary database
- **Drizzle ORM** - Type-safe database access
- **connect-pg-simple** - Session storage

**Additional Services:**
- **Twilio** - SMS notifications
- **Gmail API** - Email communications
- **Google Calendar API** - Appointment synchronization
- **Stripe** - Payment processing
- **PayPal** - Alternative payment method
- **OpenAI (GPT-5 via Replit AI)** - AI-powered features
- **NHTSA API** - VIN decoding
- **TecDoc API** - Parts catalog lookup

### 3.2 System Design Principles

- **Monolithic Architecture**: Single codebase for frontend and backend
- **Session-Based Authentication**: Secure, stateful user sessions
- **RESTful API Design**: Consistent endpoint structure
- **Component-Based UI**: Reusable, maintainable frontend components
- **Database-First Approach**: Drizzle schema as source of truth
- **Real-Time Updates**: TanStack Query for automatic cache invalidation

### 3.3 Design System (SALIS AUTO Brand)

**Monochrome Color Palette:**
- **Black (#010101)**: Primary elements, active states, buttons
- **White (#FFFFFF)**: Backgrounds, text on dark
- **Gray (#6B7280)**: Secondary text, muted elements
- **Gray Light (#D1D5DB)**: Borders, disabled states
- **Gray Dark (#374151)**: Hover states, dark mode borders
- **50% Black (#808080)**: Secondary accents

**Typography:**
- **Montserrat**: Headers, logo (Bold/SemiBold)
- **Poppins**: Body text, UI elements (Regular/Medium)
- **Inter**: Captions, labels (Light/Regular)

**Theme Support:**
- Light and Dark mode with automatic switching
- Official SALIS AUTO S logo integration
- Gradient effects for premium aesthetic

---

## 4. USER ROLES & PERMISSIONS

### 4.1 Role Hierarchy

#### **1. Super Admin**
**Scope:** System-wide  
**Permissions:**
- Full system access and configuration
- Manage all garages and branches
- Create and manage users across all garages
- Access all reports and analytics
- Configure system settings and feature flags
- Approve new garage registrations
- Manage SaaS plans and subscriptions

#### **2. Garage Manager**
**Scope:** Garage-wide  
**Permissions:**
- Manage garage operations and settings
- Create and manage branches
- Manage staff within garage
- View all reports and analytics for garage
- Configure services and pricing
- Manage inventory and suppliers
- Approve large purchases and refunds

#### **3. Branch Manager**
**Scope:** Branch-specific  
**Permissions:**
- Manage branch operations and staff
- Assign technicians to jobs
- View branch-specific reports
- Manage branch inventory
- Handle customer relations
- Approve branch-level transactions

#### **4. Lead Technician**
**Scope:** Technical oversight  
**Permissions:**
- Oversee technical staff
- Assign and review work
- Quality control and inspections
- Technical decision making
- Mentor junior technicians
- Access diagnostic tools

#### **5. Technician**
**Scope:** Service execution  
**Permissions:**
- View assigned job cards
- Update task progress
- Log parts usage
- Record time spent
- Upload diagnostic results
- Request supervisor assistance

#### **6. Assistant**
**Scope:** Support tasks  
**Permissions:**
- Assist technicians
- Update basic task status
- Record parts usage
- Clean and organize workspace
- Basic data entry

#### **7. Customer**
**Scope:** Personal portal  
**Permissions:**
- Book appointments
- View vehicle service history
- Track job status
- View and pay invoices
- Communicate with garage
- Manage personal profile

### 4.2 Permission Matrix

| Feature | Super Admin | Garage Manager | Branch Manager | Lead Tech | Technician | Assistant | Customer |
|---------|:-----------:|:--------------:|:--------------:|:---------:|:----------:|:---------:|:--------:|
| **Dashboard Access** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (Portal) |
| **Manage Users** | ✓ | ✓ (Garage) | ✓ (Branch) | ✗ | ✗ | ✗ | ✗ |
| **Create Job Cards** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Assign Tasks** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Update Tasks** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **View Reports** | ✓ (All) | ✓ (Garage) | ✓ (Branch) | ✓ (Limited) | ✗ | ✗ | ✗ |
| **Manage Inventory** | ✓ | ✓ | ✓ | ✓ (View) | ✓ (View) | ✓ (View) | ✗ |
| **Create Invoices** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Process Payments** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ (Own) |
| **Book Appointments** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ (Own) |
| **Manage Suppliers** | ✓ | ✓ | ✓ (Branch) | ✗ | ✗ | ✗ | ✗ |
| **System Settings** | ✓ | ✓ (Garage) | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 5. CORE MODULES

### MODULE 1: Authentication & User Management

**Purpose:** Secure user access and identity management

**Features:**
- Email/password authentication with bcrypt hashing
- Session-based authentication with PostgreSQL storage
- User registration with admin approval
- Password reset functionality
- Profile management (personal info, profile picture)
- User activation/deactivation
- Access expiry dates
- National ID tracking
- Multi-branch user assignments

**Database Tables:**
- `users` - Core user information
- `sessions` - Session storage
- `userRoleBranch` - User-role-branch mapping
- `technicianProfiles` - Technician-specific data
- `customerProfiles` - Customer-specific data
- `assistantProfiles` - Assistant-specific data

---

### MODULE 2: Garage & Branch Management

**Purpose:** Multi-location operational structure

**Features:**
- **Garage Management:**
  - Create and configure garages
  - License number tracking
  - Working hours configuration
  - Contact information
  - Location details (country, city)
  - Active/inactive status
  - SaaS plan assignment

- **Branch Management:**
  - Create branches under garages
  - Branch-specific locations
  - Inherit or override garage settings
  - Branch-specific inventory
  - Branch-specific staff assignments

**Database Tables:**
- `garages` - Garage master data
- `branches` - Branch information
- `saasPlans` - Subscription plans

---

### MODULE 3: Job Cards & Task Management

**Purpose:** Core service workflow management

**Features:**
- **Job Card Creation:**
  - Auto-generated job numbers (JOB-timestamp)
  - Vehicle information capture
  - Service type selection
  - Description and notes
  - Priority levels (low, medium, high, urgent)
  - Status tracking (pending, assigned, in_progress, completed, delivered, cancelled)

- **Task Assignment:**
  - Break jobs into specific tasks
  - Assign to technicians or assistants
  - Task types (diagnostic, repair, assembly, etc.)
  - Estimated vs actual time tracking
  - Progress percentage
  - Task status workflow
  - Technician acceptance/rejection

- **Progress Tracking:**
  - Step-by-step logging
  - Time spent recording
  - Notes and observations
  - Photo/video uploads
  - Completion validation

**Database Tables:**
- `jobCards` - Main job records
- `taskAssignments` - Individual tasks
- `taskProgressLogs` - Progress updates

---

### MODULE 4: Service Templates

**Purpose:** Standardize and streamline common services

**Features:**
- Create reusable service definitions
- Predefined task steps
- Required skills specification
- Estimated hours and costs
- Standard parts lists
- Category organization (maintenance, repair, diagnostic)
- Service activation/deactivation

**Database Tables:**
- `serviceTemplates` - Template definitions

---

### MODULE 5: Tool Management

**Purpose:** Track and manage garage tools

**Features:**
- **Tool Catalog:**
  - Tool metadata (name, type, brand, manufacturer)
  - Compatibility tracking (vehicles, services, parts)
  - Media attachments (photos, manuals)
  - Document storage
  - Tags and categories
  - Global vs. local visibility

- **Tool Availability:**
  - Per-garage/branch quantity tracking
  - Status monitoring (available, in_use, under_maintenance)
  - Override field permissions
  - Enable/disable tools

- **Usage Tracking:**
  - Log tool usage per job/task
  - Track user assignments
  - Time-based logging
  - Usage notes

**Database Tables:**
- `tools` - Tool master data
- `toolAvailability` - Inventory per location
- `toolUsageLogs` - Usage history

---

### MODULE 6: Spare Parts & Inventory Management

**Purpose:** Complete inventory control and parts management

**Features:**
- **Parts Catalog:**
  - Comprehensive part metadata
  - Category and subcategory organization
  - Brand and manufacturer tracking
  - SKU and barcode management
  - Part type classification (OEM, generic, consumable)
  - Unit of measure (pieces, liters, kg, boxes)
  - Vehicle compatibility
  - Service and tool linkages
  - Media and documentation

- **Inventory Management:**
  - Per-garage/branch stock tracking
  - Minimum threshold alerts
  - Purchase price, selling price, cost price
  - Multi-currency support
  - Tax rate configuration (purchase and sale)
  - Storage location tracking
  - Last restock dates

- **Stock Alerts:**
  - Low stock notifications
  - Automatic reorder suggestions
  - Stock movement tracking

- **Bulk Operations:**
  - Excel import/export
  - TecDoc API integration (simulated)
  - Batch updates

**Database Tables:**
- `spareParts` - Parts master data
- `sparePartInventories` - Stock per location

---

### MODULE 7: Vehicle Management

**Purpose:** Comprehensive vehicle records and history

**Features:**
- **Vehicle Registration:**
  - Make, model, year
  - License plate and VIN
  - Color and mileage
  - Engine type (gasoline, diesel, electric, hybrid)
  - Transmission type
  - Customer assignment

- **Warranty Tracking:**
  - Provider information
  - Warranty type (manufacturer, extended, powertrain)
  - Start and end dates
  - Mileage limits
  - Terms and conditions

- **Service History:**
  - Complete service log
  - Linked job cards
  - Service dates and mileage
  - Costs and performed by tracking

- **Maintenance Scheduling:**
  - Manufacturer recommended intervals
  - Mileage-based reminders
  - Time-based reminders
  - Next due calculations

- **Service Reminders:**
  - Automated reminder creation
  - Advance notification settings
  - SMS/Email integration
  - Customer acknowledgment tracking

- **VIN Decoding:**
  - NHTSA API integration
  - Automatic vehicle data population

**Database Tables:**
- `vehicles` - Vehicle master data
- `vehicleServiceHistory` - Service records
- `maintenanceSchedules` - Maintenance plans
- `serviceReminders` - Reminder queue

---

### MODULE 8: Customer Management

**Purpose:** Customer relationship and interaction management

**Features:**
- Customer profiles with contact details
- Multiple vehicles per customer
- Address and location tracking
- Nationality and language preferences
- Customer notes (general, complaints, feedback, reminders)
- Important flag for priority customers
- Service history across all vehicles
- Communication history
- Customer portal access

**Database Tables:**
- `users` (userType: customer)
- `customerProfiles` - Extended customer data
- `customerNotes` - Interaction logs

---

### MODULE 9: Appointments & Scheduling

**Purpose:** Booking and calendar management

**Features:**
- **Appointment Booking:**
  - Auto-generated appointment numbers
  - Customer and vehicle selection
  - Service type and description
  - Date and time selection
  - Duration estimation
  - Technician assignment
  - Status workflow (scheduled, confirmed, in_progress, completed, cancelled, no_show)

- **Status Tracking:**
  - Complete status history
  - Change reason logging
  - Timestamp tracking

- **Reminder System:**
  - Automated reminders (SMS, email, push)
  - Scheduled reminder timing
  - Delivery confirmation
  - Failure tracking and retry

- **Calendar Integration:**
  - Google Calendar sync
  - Two-way event updates
  - Attendee management

**Database Tables:**
- `appointments` - Booking records
- `appointmentStatusHistory` - Status changes
- `appointmentReminders` - Reminder queue

---

### MODULE 10: Estimates & Quotes

**Purpose:** Pre-service pricing and approval

**Features:**
- **Estimate Creation:**
  - Auto-generated estimate numbers
  - Customer and vehicle linking
  - Line item management (services, parts, labor)
  - Subtotal, tax, discount calculations
  - Total amount calculation
  - Validity period

- **Status Workflow:**
  - Draft → Sent → Viewed → Approved/Rejected → Expired
  - Conversion to job card
  - Conversion to invoice

- **Customer Interaction:**
  - Email delivery
  - View tracking
  - Approval/rejection capture
  - Terms and conditions
  - Customer notes

- **Estimate Items:**
  - Item type categorization
  - Quantity and unit price
  - Cost tracking for profit analysis
  - Discount application
  - Line total calculation

**Database Tables:**
- `estimates` - Estimate headers
- `estimateItems` - Line items

---

### MODULE 11: Purchase Orders & Supplier Management

**Purpose:** Procurement and supplier relationships

**Features:**
- **Supplier Management:**
  - Supplier master data
  - Contact information
  - Payment terms (net30, net60, COD)
  - Tax ID tracking
  - Active/inactive status
  - Performance notes

- **Purchase Orders:**
  - Auto-generated PO numbers
  - Supplier selection
  - Expected and actual delivery dates
  - Status tracking (draft, sent, confirmed, partial, received, cancelled)
  - Subtotal, tax, total calculations
  - Approval workflow

- **PO Items:**
  - Part number and name
  - Quantity ordered vs. received
  - Unit price and line totals
  - Item notes

**Database Tables:**
- `suppliers` - Supplier records
- `purchaseOrders` - PO headers
- `purchaseOrderItems` - PO line items

---

### MODULE 12: Invoicing & Billing

**Purpose:** Financial documentation and payment tracking

**Features:**
- **Invoice Creation:**
  - Auto-generated invoice numbers
  - Customer and vehicle linking
  - Job card association
  - Invoice and due dates
  - Status workflow (draft, sent, paid, overdue, cancelled)

- **Financial Calculations:**
  - Subtotal, tax, discount
  - Total and paid amounts
  - Balance tracking
  - Profit margin analysis (unit cost tracking)

- **Invoice Items:**
  - Item type categorization (service, part, labor)
  - Quantity and pricing
  - Tax rate per line
  - Discount application
  - Cost tracking

- **Payment Processing:**
  - Multiple payment methods (cash, card, transfer, check)
  - Payment date and amount
  - Reference number tracking
  - Payment application to invoices
  - Receipt generation

- **Multi-Provider Payment Support:**
  - Stripe integration
  - PayPal integration
  - Cash/check recording
  - Bank transfer tracking

**Database Tables:**
- `invoices` - Invoice headers
- `invoiceItems` - Line items
- `payments` - Payment records

---

### MODULE 13: Financial Settings

**Purpose:** Automated financial calculations and rules

**Features:**
- **Tax Configurations:**
  - Tax name and type (percentage, fixed, tiered)
  - Tax rate definition
  - Default tax selection
  - Applicable categories (service, parts, labor)
  - Amount thresholds (min/max)
  - Regional tax rules (state, zip code)
  - Validity periods
  - Active/inactive status

- **Discounts & Promotions:**
  - Discount code generation
  - Discount types (percentage, fixed amount, buy X get Y)
  - Value and threshold configuration
  - Applicable categories and items
  - Usage limits (total and per customer)
  - Validity periods
  - Approval requirements

- **Discount Tracking:**
  - Usage history
  - Customer-specific tracking
  - Amount applied
  - Invoice/estimate association

- **Payment Plans:**
  - Installment configuration
  - Down payment requirements
  - Installment schedules
  - Interest calculations
  - Status tracking

**Database Tables:**
- `taxConfigurations` - Tax rules
- `discountsPromotions` - Discount definitions
- `discountUsage` - Usage tracking
- `paymentPlans` - Payment plan headers
- `installments` - Payment installments

---

### MODULE 14: Refund Management

**Purpose:** Customer refund processing and tracking

**Features:**
- Auto-generated refund numbers
- Invoice and payment linking
- Refund amount and method
- Reason tracking
- Status workflow (pending, approved, processed, rejected, cancelled)
- Approval chain (requested by, approved by, processed by)
- Reference number tracking
- Refund notes and history

**Database Tables:**
- `refunds` - Refund records

---

### MODULE 15: Notifications & Communication

**Purpose:** Multi-channel communication system

**Features:**
- **Notification Types:**
  - Email
  - SMS
  - In-app
  - Push notifications

- **Notification Categories:**
  - Appointment reminders
  - Invoice notifications
  - Job completion updates
  - Feedback requests
  - General announcements

- **Status Tracking:**
  - Pending, sent, delivered, failed, read
  - Delivery timestamps
  - Read receipts
  - Failure reasons and retry logic

- **Metadata:**
  - Link to related records (appointments, invoices, job cards)
  - Recipient information
  - Garage context

**Database Tables:**
- `notifications` - Notification records

---

### MODULE 16: Technician Management

**Purpose:** Workforce skill and performance tracking

**Features:**
- **Technician Profiles:**
  - Skills and certifications
  - Lead technician designation
  - Qualifications and education
  - Speciality areas
  - Experience level (junior, intermediate, senior, master)
  - Years of experience
  - Hourly rate
  - Schedule and availability
  - Max concurrent jobs

- **Technician Portal:**
  - View assigned jobs
  - Update task status
  - Log time and progress
  - Request parts and tools
  - Upload diagnostic results
  - Communicate with supervisors

**Database Tables:**
- `technicianProfiles` - Extended tech data

---

### MODULE 17: HR Management

**Purpose:** Staff administration and performance

**Features:**
- **Attendance Tracking:**
  - Clock in/out timestamps
  - Break management
  - Total and overtime hours
  - Status (present, absent, late, half_day, on_leave)
  - Approval workflow

- **Shift Management:**
  - Shift templates
  - Start/end times
  - Break durations
  - Days of week configuration
  - Shift assignments
  - Status tracking

- **Commission System:**
  - Commission rules (percentage, fixed, tiered)
  - Applicable service types
  - Minimum job value
  - Calculated commissions
  - Period tracking (monthly)
  - Payment status

- **Performance Reviews:**
  - Review periods (quarterly, annual)
  - Overall rating (1-5)
  - Skill assessments (technical, customer service, teamwork, punctuality, productivity)
  - Strengths and improvement areas
  - Goal setting
  - Employee acknowledgment

- **Training & Certifications:**
  - Training programs
  - Provider tracking
  - Training types (certification, workshop, online course, on-job)
  - Duration and cost
  - Recurring training
  - Validity periods

- **Employee Training Records:**
  - Enrollment tracking
  - Completion status
  - Expiry dates
  - Scores and certificates
  - Certificate storage

**Database Tables:**
- `employeeAttendance` - Attendance logs
- `shiftTemplates` - Shift definitions
- `shiftAssignments` - Shift schedules
- `commissionRules` - Commission config
- `commissions` - Calculated commissions
- `performanceReviews` - Review records
- `trainings` - Training catalog
- `employeeTrainings` - Training enrollment

---

### MODULE 18: Reports & Analytics

**Purpose:** Business intelligence and decision support

**Features:**
- **Financial Reports:**
  - Revenue analysis
  - Profit margins
  - Outstanding invoices
  - Payment trends
  - Tax summaries

- **Operational Reports:**
  - Job completion rates
  - Technician utilization
  - Average turnaround time
  - Service type distribution

- **Inventory Reports:**
  - Stock levels
  - Parts usage
  - Inventory turnover
  - Low stock alerts
  - Purchase history

- **Customer Reports:**
  - Customer lifetime value
  - Repeat customer rate
  - Service frequency
  - Customer satisfaction

- **Export Options:**
  - CSV, PDF, Excel formats
  - Custom date ranges
  - Filter configurations
  - Scheduled reports

**Database Tables:**
- `exportJobs` - Export queue management

---

### MODULE 19: Integrations

**Purpose:** Third-party service connectivity

**Features:**
- Integration connection management
- Sync log tracking
- Configuration storage
- Status monitoring
- Error handling and retry
- Connection testing

**Supported Integrations:**
- Gmail (email sending)
- Google Calendar (appointment sync)
- Twilio (SMS notifications)
- Stripe (payments)
- PayPal (payments)
- NHTSA API (VIN decoding)
- TecDoc API (parts lookup)
- OpenAI/Replit AI (AI features)

**Database Tables:**
- `integrationConnections` - Connection configs
- `integrationSyncLogs` - Sync history

---

### MODULE 20: Security & Access Control

**Purpose:** System security and compliance

**Features:**
- **Two-Factor Authentication (2FA):**
  - TOTP-based authentication
  - QR code setup
  - Backup codes
  - Recovery options
  - Per-user enforcement

- **Audit Logging:**
  - Action tracking
  - Resource type logging
  - IP address and user agent
  - Timestamp recording
  - Change history

- **Data Backup & Restore:**
  - Automated backups
  - Backup types (full, incremental, database-only)
  - Backup job tracking
  - Restore functionality

- **GDPR Compliance:**
  - Data export requests
  - Data deletion requests
  - Right to rectification
  - Consent management
  - Processing activity logs

- **Permission Overrides:**
  - Temporary permission grants
  - Expiration dates
  - Reason tracking
  - Approval workflow

**Database Tables:**
- `twoFactorAuth` - 2FA status
- `auditLogs` - Audit trail
- `backupJobs` - Backup tracking
- `gdprDataRequests` - GDPR requests
- `userConsents` - Consent records
- `permissionOverrides` - Permission grants

---

## 6. ADVANCED FEATURES

### 6.1 Search & Filtering System

**Features:**
- **Global Search:**
  - Search across all modules
  - Full-text search
  - Result highlighting
  - Quick navigation

- **Advanced Filters:**
  - Multi-field filtering
  - Date range selection
  - Status filtering
  - Custom filter combinations

- **Saved Filter Presets:**
  - Save frequently used filters
  - Share filters across team
  - Per-module filter sets
  - Quick access to saved views

- **Bulk Operations:**
  - Multi-select functionality
  - Bulk status updates
  - Bulk export
  - Bulk delete (with confirmation)

**Database Tables:**
- `savedFilterPresets` - Saved filters

---

### 6.2 Data Import/Export

**Features:**
- **Import Capabilities:**
  - Excel/CSV file upload
  - Field mapping
  - Data validation
  - Error reporting
  - Bulk import

- **Export Capabilities:**
  - Multiple formats (CSV, JSON, Excel)
  - Filtered exports
  - Async job processing
  - Download link generation
  - Export history

- **Supported Modules:**
  - Customers
  - Vehicles
  - Parts inventory
  - Job cards
  - Invoices
  - Appointments

**Database Tables:**
- `exportJobs` - Export tracking

---

### 6.3 Action History & Undo/Redo

**Features:**
- Track all user actions
- Undo/redo functionality
- Action stack management
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Action replay
- History browsing

**Database Tables:**
- `actionHistory` - Action records

---

### 6.4 User Settings & Preferences

**Features:**
- Theme selection (light/dark)
- Language preference
- Currency selection
- Date format
- Time format
- Timezone
- Notification preferences
- Dashboard layout customization

**Database Tables:**
- `userSettings` - User preferences

---

### 6.5 Print System

**Features:**
- Print job cards
- Print invoices
- Print estimates
- Print appointment schedules
- Print reports
- Custom print templates
- PDF generation

---

### 6.6 Feature Flags

**Features:**
- Per-garage feature enablement
- A/B testing support
- Gradual rollout
- Feature source tracking
- Runtime feature toggling

**Database Tables:**
- `featureFlags` - Feature toggles

---

## 7. THIRD-PARTY INTEGRATIONS

### 7.1 Twilio (SMS Notifications)

**Purpose:** Send SMS notifications to customers and staff

**Features:**
- Appointment reminders
- Job status updates
- Invoice notifications
- Payment confirmations
- Service reminders
- Feedback requests
- Custom messages

**Implementation:**
- Replit Twilio connector
- Template-based messages
- Delivery tracking
- Retry logic
- Cost tracking

---

### 7.2 Gmail (Email Communications)

**Purpose:** Automated email sending

**Features:**
- Appointment confirmations
- Invoice delivery
- Estimate sharing
- Service reminders
- Feedback requests
- Custom email templates
- HTML email support

**Implementation:**
- Google API integration
- OAuth authentication
- HTML template rendering
- Attachment support

---

### 7.3 Google Calendar (Appointment Sync)

**Purpose:** Two-way calendar synchronization

**Features:**
- Create calendar events for appointments
- Update events on status changes
- Delete cancelled appointments
- Attendee management
- Reminder configuration
- Event link sharing

**Implementation:**
- Google Calendar API v3
- OAuth flow
- Webhook support
- Conflict detection

---

### 7.4 Stripe (Payment Processing)

**Purpose:** Secure online payments

**Features:**
- Credit card processing
- Payment intents
- Customer management
- Subscription billing
- Refund processing
- Payment method storage
- 3D Secure support

**Implementation:**
- Stripe SDK integration
- PCI compliance
- Webhook handling
- Test/production modes

---

### 7.5 PayPal (Alternative Payments)

**Purpose:** PayPal payment option

**Features:**
- PayPal checkout
- Order creation
- Payment capture
- Refund processing
- Client token generation

**Implementation:**
- PayPal Server SDK
- OAuth authorization
- Sandbox/production environments

---

### 7.6 NHTSA API (VIN Decoder)

**Purpose:** Decode vehicle identification numbers

**Features:**
- Automatic vehicle data population
- Make, model, year extraction
- Engine specifications
- Safety ratings
- Recall information

**Implementation:**
- RESTful API calls
- Data parsing
- Error handling

---

### 7.7 TecDoc API (Parts Catalog)

**Purpose:** Automotive parts lookup

**Features:**
- Part number search
- Vehicle compatibility
- OEM part identification
- Generic alternatives
- Pricing information

**Implementation:**
- TecDoc connector
- Data enrichment
- Cache management

---

## 8. SECURITY & COMPLIANCE

### 8.1 Authentication Security

**Features:**
- Bcrypt password hashing (10 salt rounds)
- Session-based authentication
- HTTP-only cookies
- Secure cookies (production)
- Session timeout (7 days)
- PostgreSQL session storage
- CSRF protection
- Password strength requirements

---

### 8.2 Two-Factor Authentication (2FA)

**Features:**
- TOTP-based authentication
- QR code generation via speakeasy
- Backup codes (10 per user)
- Recovery mechanism
- Per-user enablement
- Admin enforcement
- Login flow integration

**Implementation:**
- speakeasy library
- qrcode generation
- Secure secret storage
- Time-based token validation

---

### 8.3 Audit Logging

**Features:**
- Comprehensive action tracking
- User identification
- Resource type and ID logging
- IP address and user agent capture
- Timestamp recording
- Request/response logging
- Searchable audit trail
- Retention policies

**Auditable Actions:**
- User login/logout
- Data creation/update/deletion
- Permission changes
- Financial transactions
- System configuration changes

**Database Tables:**
- `auditLogs` - Complete audit trail
- `sessionLogs` - Login/logout tracking
- `activityLogs` - Major actions

---

### 8.4 Data Backup & Recovery

**Features:**
- Automated daily backups
- Backup types (full, incremental, database-only)
- Backup job scheduling
- Status tracking
- File size logging
- Retention management
- Restore functionality
- Point-in-time recovery

**Database Tables:**
- `backupJobs` - Backup tracking

---

### 8.5 GDPR Compliance Tools

**Features:**
- **Data Subject Rights:**
  - Right to access (data export)
  - Right to erasure (deletion)
  - Right to rectification (updates)
  - Right to portability

- **Request Management:**
  - Request type tracking
  - Status workflow (pending, processing, completed, rejected)
  - Completion deadline tracking
  - User notes
  - Admin review

- **Consent Management:**
  - Consent type tracking (marketing, analytics, data processing)
  - Consent status (given, withdrawn)
  - Version tracking
  - Timestamp recording

**Database Tables:**
- `gdprDataRequests` - GDPR requests
- `userConsents` - Consent records

---

### 8.6 Permission System

**Features:**
- Role-based access control (RBAC)
- Granular permissions per module
- Permission overrides for specific users
- Temporary permission grants
- Expiration dates
- Approval workflow
- Audit trail

**Database Tables:**
- `permissionOverrides` - Permission grants

---

## 9. CUSTOMER PORTAL

### 9.1 Customer Dashboard

**Purpose:** Self-service customer interface

**Features:**
- Overview of vehicles and services
- Upcoming appointments
- Recent invoices
- Service reminders
- Quick actions (book appointment, pay invoice)

**Route:** `/portal/dashboard`

---

### 9.2 Customer Appointments

**Purpose:** Self-service appointment management

**Features:**
- View upcoming and past appointments
- Book new appointments
- Cancel or reschedule appointments
- View appointment details
- Receive notifications

**Route:** `/portal/appointments`

---

### 9.3 Customer Invoices

**Purpose:** Invoice viewing and payment

**Features:**
- View all invoices
- Filter by status (paid, unpaid, overdue)
- View invoice details
- Download invoice PDFs
- Make online payments
- Payment history

**Route:** `/portal/invoices`

---

### 9.4 Customer Vehicles

**Purpose:** Vehicle management

**Features:**
- View registered vehicles
- Add new vehicles
- View service history per vehicle
- View maintenance schedules
- Receive service reminders

**Route:** `/portal/vehicles`

---

### 9.5 Customer Communications

**Purpose:** Message center

**Features:**
- View all notifications
- Read messages from garage
- Reply to messages
- Request callbacks
- View communication history

**Route:** `/portal/communications`

---

## 10. AI AUTOMATION FEATURES

### 10.1 AI Job Time & Cost Estimation

**Purpose:** Predict job duration and cost using historical data

**Features:**
- Service type analysis
- Vehicle-specific calculations
- Historical job comparison
- Confidence scoring (0-100)
- Reasoning explanation
- Actual vs. estimated tracking

**Implementation:**
- OpenAI GPT-5 model
- JSON structured output
- Historical data training
- Accuracy improvement over time

**Database Tables:**
- `aiJobEstimations` - Estimation records

---

### 10.2 Predictive Maintenance

**Purpose:** Analyze vehicle history to predict future maintenance needs

**Features:**
- Service history analysis
- Vehicle make/model/year consideration
- Current mileage tracking
- Issue prediction with severity levels
- Recommended actions
- Estimated timeframes
- Confidence scoring

**Implementation:**
- AI analysis of service patterns
- Vehicle-specific recommendations
- Proactive customer outreach

**Database Tables:**
- `aiMaintenancePredictions` - Prediction records

---

### 10.3 AI Parts Recommendations

**Purpose:** Suggest required parts for services

**Features:**
- Service type analysis
- Vehicle compatibility
- Part number suggestions
- Quantity recommendations
- Cost estimates
- Priority categorization (required, recommended, optional)
- Alternative options

**Implementation:**
- AI-powered parts matching
- OEM and aftermarket suggestions
- Cost optimization

**Database Tables:**
- `aiPartsRecommendations` - Recommendation records

---

### 10.4 Smart Schedule Optimization

**Purpose:** Optimize technician schedules and appointments

**Features:**
- Conflict detection
- Efficiency suggestions
- Technician skill matching
- Workload balancing
- Time savings calculation
- Reschedule recommendations

**Implementation:**
- AI schedule analysis
- Multi-factor optimization
- Real-time suggestions

**Database Tables:**
- `aiScheduleOptimizations` - Optimization records

---

### 10.5 AI Customer Support Chatbot

**Purpose:** Automated customer assistance

**Features:**
- Answer service questions
- Provide pricing information
- Help with appointment booking
- Escalate to human staff when needed
- Maintain conversation history
- Context-aware responses

**Implementation:**
- GPT-5 conversational AI
- Garage context injection
- Handoff detection
- Session management

**Database Tables:**
- `aiChatConversations` - Chat history

---

## 11. DATABASE SCHEMA

### Complete Entity List (70+ Tables)

**Core System:**
- sessions
- saasPlans
- garages
- branches
- roles
- users
- userRoleBranch
- technicianProfiles
- customerProfiles
- assistantProfiles

**Logging & Security:**
- sessionLogs
- activityLogs
- mfaStatuses
- notificationPreferences
- featureFlags
- auditLogs
- twoFactorAuth
- backupJobs
- gdprDataRequests
- userConsents
- permissionOverrides

**Operations:**
- jobCards
- taskAssignments
- taskProgressLogs
- serviceTemplates
- tools
- toolAvailability
- toolUsageLogs

**Inventory:**
- spareParts
- sparePartInventories

**Vehicles & Customers:**
- vehicles
- vehicleServiceHistory
- maintenanceSchedules
- serviceReminders
- customerNotes

**Scheduling:**
- appointments
- appointmentStatusHistory
- appointmentReminders

**Financial:**
- estimates
- estimateItems
- suppliers
- purchaseOrders
- purchaseOrderItems
- invoices
- invoiceItems
- payments
- paymentPlans
- installments
- refunds
- taxConfigurations
- discountsPromotions
- discountUsage

**Communication:**
- notifications

**Data Management:**
- savedFilterPresets
- exportJobs
- userSettings
- actionHistory

**HR & Staff:**
- employeeAttendance
- shiftTemplates
- shiftAssignments
- commissionRules
- commissions
- performanceReviews
- trainings
- employeeTrainings

**AI Features:**
- aiJobEstimations
- aiMaintenancePredictions
- aiPartsRecommendations
- aiScheduleOptimizations
- aiChatConversations

**Integrations:**
- integrationConnections
- integrationSyncLogs
- accountingTransactions
- obdDiagnosticData

---

## 12. FRONTEND PAGES & ROUTES

### Public Routes (No Authentication)
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Garage Management Routes (Authenticated)
- `/dashboard` - Main dashboard
- `/tasks` - Task management
- `/appointments` - Appointments & calendar
- `/customers` - Customer management
- `/vehicles` - Vehicle management
- `/purchase-orders` - Purchase orders
- `/invoices` - Invoice management
- `/estimates` - Estimates & quotes
- `/reports` - Reports & analytics
- `/job-cards` - Job card management
- `/service-templates` - Service templates
- `/tools` - Tool management
- `/spare-parts` - Spare parts catalog
- `/inventory-management` - Inventory overview
- `/suppliers` - Supplier network
- `/technician-portal` - Technician dashboard
- `/technician-management` - Technician administration
- `/hr-management` - HR & staff management
- `/financial-settings` - Tax & discount settings
- `/refund-management` - Refund requests
- `/ai-automation` - AI features
- `/integrations` - Third-party connections
- `/security` - Security settings
- `/settings` - General settings
- `/profile` - User profile
- `/notifications` - Notification center
- `/calendar` - Calendar view
- `/data-import-export` - Data management
- `/business-intelligence` - BI & analytics

### Customer Portal Routes (Customer Role)
- `/portal/dashboard` - Customer dashboard
- `/portal/appointments` - Appointment management
- `/portal/invoices` - Invoice viewing & payment
- `/portal/vehicles` - Vehicle management
- `/portal/communications` - Message center

**Total Pages:** 40+

---

## 13. API ENDPOINTS

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Garages & Branches
- `GET /api/garages` - List garages
- `POST /api/garages` - Create garage
- `GET /api/branches` - List branches
- `POST /api/branches` - Create branch

### Job Cards
- `GET /api/job-cards` - List job cards
- `GET /api/job-cards/:id` - Get job card
- `POST /api/job-cards` - Create job card
- `PATCH /api/job-cards/:id` - Update job card
- `DELETE /api/job-cards/:id` - Delete job card

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task progress

### Tools
- `GET /api/tools` - List tools
- `POST /api/tools` - Create tool
- `GET /api/tool-availability` - Check availability
- `POST /api/tool-availability` - Update availability

### Spare Parts
- `GET /api/spare-parts` - List parts
- `POST /api/spare-parts` - Create part
- `GET /api/spare-part-inventories` - Get inventory
- `PATCH /api/spare-part-inventories/:id` - Update stock

### Vehicles
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/:id/service-history` - Get history
- `POST /api/vehicles/decode-vin` - Decode VIN

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice
- `PATCH /api/invoices/:id` - Update invoice

### Payments
- `POST /api/payments` - Record payment
- `POST /api/payments/stripe` - Process Stripe payment
- `POST /api/payments/paypal` - Process PayPal payment

### Estimates
- `GET /api/estimates` - List estimates
- `POST /api/estimates` - Create estimate
- `PATCH /api/estimates/:id` - Update estimate
- `POST /api/estimates/:id/send` - Send to customer

### Purchase Orders
- `GET /api/purchase-orders` - List POs
- `POST /api/purchase-orders` - Create PO
- `PATCH /api/purchase-orders/:id` - Update PO

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

### Reports
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/technician-utilization` - Utilization report
- `GET /api/reports/inventory` - Inventory report
- `POST /api/reports/export` - Export report

### AI Features
- `POST /api/ai/estimate-job` - AI job estimation
- `POST /api/ai/predict-maintenance` - Predictive maintenance
- `POST /api/ai/recommend-parts` - Parts recommendation
- `POST /api/ai/optimize-schedule` - Schedule optimization
- `POST /api/ai/chat` - AI chatbot

### Settings
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update settings

### Security
- `POST /api/2fa/setup` - Setup 2FA
- `POST /api/2fa/verify` - Verify 2FA token
- `GET /api/audit-logs` - Get audit logs

**Total Endpoints:** 100+

---

## 14. BUSINESS INTELLIGENCE & ANALYTICS

### Key Performance Indicators (KPIs)

**Financial KPIs:**
- Total revenue (daily, weekly, monthly, yearly)
- Profit margins per job
- Average invoice value
- Outstanding receivables
- Payment collection rate
- Revenue per technician
- Revenue per service type

**Operational KPIs:**
- Job completion rate
- Average job duration
- Technician utilization rate
- Appointment fulfillment rate
- On-time delivery percentage
- Rework rate
- Customer wait time

**Customer KPIs:**
- Customer lifetime value (CLV)
- Customer acquisition cost
- Repeat customer rate
- Customer satisfaction score
- Net promoter score (NPS)
- Average services per customer
- Customer churn rate

**Inventory KPIs:**
- Inventory turnover ratio
- Stock-out frequency
- Dead stock percentage
- Carrying cost
- Order fulfillment rate

### Dashboard Visualizations

**Charts & Graphs:**
- Revenue trends (line chart)
- Service type distribution (pie chart)
- Monthly comparisons (bar chart)
- Technician performance (radar chart)
- Customer acquisition (funnel chart)
- Inventory levels (gauge chart)

---

## 15. MOBILE & PWA SUPPORT

### Progressive Web App (PWA) Features

**Capabilities:**
- Installable on mobile devices
- Offline functionality
- Push notifications
- Home screen icon
- Fast loading
- Responsive design

**Service Worker:**
- Caching strategy
- Offline page
- Background sync
- Push notification handling

**Mobile-Optimized Views:**
- Touch-friendly interfaces
- Mobile navigation
- Swipe gestures
- Responsive tables
- Mobile forms

---

## 16. LOCALIZATION & MULTI-CURRENCY

### Language Support

**Supported Languages:**
- English (en)
- Arabic (ar)

**Implementation:**
- i18next library
- Language detection
- RTL support for Arabic
- Translation files
- Language switcher

### Currency Support

**Features:**
- Multi-currency pricing
- Currency conversion
- Default currency per garage
- Currency symbols
- Decimal precision
- Regional formatting

**Supported Currencies:**
- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- AED - UAE Dirham
- SAR - Saudi Riyal
- KWD - Kuwaiti Dinar
- QAR - Qatari Riyal

---

## 17. DATA MANAGEMENT

### Import/Export Features

**Import:**
- Excel (.xlsx, .xls)
- CSV files
- JSON format
- Field mapping
- Validation
- Error reporting

**Export:**
- CSV export
- JSON export
- Excel export
- PDF generation
- Custom templates
- Filtered exports

**Supported Data Types:**
- Customers
- Vehicles
- Parts inventory
- Service templates
- Job cards
- Invoices
- Appointments

---

## 18. FINANCIAL MANAGEMENT

### Payment Processing

**Payment Methods:**
- Cash
- Credit/Debit card (Stripe)
- PayPal
- Bank transfer
- Check

**Payment Features:**
- Partial payments
- Payment plans
- Installments
- Refunds
- Payment history
- Receipt generation

### Financial Reporting

**Reports:**
- Profit & loss statement
- Cash flow report
- Accounts receivable aging
- Sales tax summary
- Commission reports
- Revenue by service type
- Revenue by technician

---

## 19. COMMUNICATION SYSTEM

### SMS Notifications (Twilio)

**Notification Types:**
- Appointment reminders
- Job status updates
- Invoice notifications
- Payment confirmations
- Service reminders
- Feedback requests

**Features:**
- Template-based messages
- Scheduled delivery
- Delivery tracking
- Retry logic
- Cost tracking

### Email Communications (Gmail)

**Email Types:**
- Appointment confirmations
- Estimate delivery
- Invoice delivery
- Service reminders
- Feedback requests
- Custom messages

**Features:**
- HTML templates
- Attachment support
- Delivery tracking
- Auto-retry
- Template customization

---

## 20. SYSTEM ADMINISTRATION

### Administrative Features

**System Configuration:**
- Garage settings
- Branch settings
- Service type configuration
- Tax configuration
- Currency settings
- Notification settings
- Integration settings

**User Management:**
- User creation/deletion
- Role assignment
- Permission management
- User activation/deactivation
- Password reset
- 2FA enforcement

**Data Management:**
- Database backup
- Data export
- Data import
- Data cleanup
- Archive management

**System Monitoring:**
- Audit log review
- Error log tracking
- Performance monitoring
- Integration status
- Backup status

---

## CONCLUSION

SALIS AUTO represents a complete, enterprise-grade solution for automotive service management. With over **40 pages**, **70+ database tables**, **100+ API endpoints**, **20+ core modules**, and comprehensive features spanning operations, finance, customer service, AI automation, and business intelligence, the system provides everything needed to run a modern, efficient, and profitable garage operation.

The modular architecture, extensive customization options, and robust security features make SALIS AUTO suitable for single-location independent shops to large multi-branch service center chains.

---

**For Questions or Support:**
- Review the authentication guide: `AUTHENTICATION_GUIDE.md`
- Check user credentials: `user_credentials.csv`
- Examine database schema: `shared/schema.ts`
- Review API routes: `server/routes.ts`

**System Status:** ✅ Production Ready  
**Last Authentication Update:** October 20, 2025  
**Current Version:** 2.0.0 (Post-Replit Auth Migration)
