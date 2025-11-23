# SALIS AUTO - User Manual

## 📋 Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Core Features](#core-features)
- [Role-Specific Guides](#role-specific-guides)
- [Common Tasks](#common-tasks)
- [Tips & Best Practices](#tips--best-practices)

---

## Introduction

Welcome to the **SALIS AUTO User Manual**! This comprehensive guide will help you navigate and use all features of the platform effectively.

### Who Should Read This?

This manual is for all SALIS AUTO users, including:
- Service Advisors
- Technicians
- Parts Managers
- Finance Staff
- Managers and Administrators
- Customer Service Representatives

---

## Getting Started

### Your First Login

1. **Access the System**
   - Open your web browser
   - Navigate to: `https://salisauto.net` (or your custom domain)
   
2. **Login Credentials**
   - Enter your email address
   - Enter your password (default: `password123`)
   - Click "Login"

3. **Change Your Password** (First Time)
   - Navigate to Profile → Security
   - Click "Change Password"
   - Enter new secure password
   - Click "Update Password"

### Understanding Your Dashboard

After login, you'll see your personalized dashboard based on your role:

- **Service Advisors**: Customer appointments, active job cards, pending estimates
- **Technicians**: Assigned jobs, upcoming tasks, performance metrics
- **Managers**: KPIs, revenue stats, team performance, operational metrics
- **Parts Managers**: Inventory levels, low stock alerts, pending orders
- **Finance**: Revenue summary, pending invoices, payment status

---

## Dashboard Overview

### Main Navigation

The left sidebar contains all features organized by workflow:

1. **Dashboard & Overview** - Your home base
2. **Customer Intake & Appointments** - Booking and scheduling
3. **Vehicle Management** - Vehicle records and history
4. **Inspection & Check-In** - Vehicle inspections and walkaround
5. **Diagnostics & Assessment** - OBD tools and smart diagnostics
6. **Service Planning & Scheduling** - Job cards, tasks, estimates
7. **Parts & Inventory** - Parts management and ordering
8. **Service Execution & Operations** - Technician portal, work management
9. **Quality & Delivery** - Quality control, contracts, warranties
10. **Billing & Payments** - Invoicing and payment processing
11. **Analytics & Business Intelligence** - Reports and insights
12. **Customer Experience & Growth** - Marketing, loyalty, reviews
13. **Team & HR Management** - Staff, payroll, performance
14. **Compliance & Safety** - Regulatory compliance, safety
15. **Enterprise & Franchise** - Multi-location management
16. **Emerging Technologies** - AR, VR, IoT, blockchain
17. **AI & Automation Hub** - AI features, chatbot, call center
18. **System & Settings** - Configuration and preferences

### Top Header

- **Search Bar**: Quick search across customers, vehicles, job cards
- **Quick Actions** (⌘K or Ctrl+K): Fast access to common tasks
- **Language Switcher**: Change interface language
- **Theme Toggle**: Switch between light/dark mode
- **Notifications**: Bell icon shows alerts and updates
- **Profile Menu**: Access your profile and settings

---

## Core Features

### 1. Customer Management

#### Creating a New Customer

1. Navigate to **Customers**
2. Click **"+ New Customer"** button
3. Fill in customer details:
   - Full Name *
   - Email *
   - Phone Number *
   - Address
   - Company Name (for business customers)
   - Tax ID (if applicable)
4. Click **"Create Customer"**

#### Viewing Customer History

1. Navigate to **Customers**
2. Click on customer name
3. View tabs:
   - **Overview**: Contact info, stats
   - **Vehicles**: Owned vehicles
   - **Service History**: Past job cards
   - **Invoices**: Billing history
   - **Appointments**: Upcoming bookings
   - **Documents**: Uploaded files

### 2. Vehicle Management

#### Adding a New Vehicle

1. Navigate to **Vehicles** (or from Customer profile)
2. Click **"+ Add Vehicle"**
3. Enter vehicle details:
   - Customer (search and select)
   - VIN Number (will auto-decode)
   - Or manually enter: Make, Model, Year
   - License Plate
   - Color
   - Mileage
   - Engine Type
   - Transmission Type
4. Click **"Add Vehicle"**

#### Using VIN Decoder

1. Navigate to **VIN Decoder**
2. Enter 17-character VIN
3. Click **"Decode"**
4. System automatically fills: Make, Model, Year, Engine, Trim
5. Save to vehicle record

### 3. Appointment Booking

#### Creating an Appointment

1. Navigate to **Appointments** or **Calendar**
2. Click **"+ New Appointment"**
3. Fill in details:
   - Customer (search)
   - Vehicle (select from customer's vehicles)
   - Service Type (dropdown)
   - Preferred Date & Time
   - Estimated Duration
   - Notes/Special Instructions
4. Click **"Book Appointment"**

#### Managing Calendar

- **Day View**: See hourly schedule
- **Week View**: 7-day overview
- **Month View**: Monthly calendar
- **Drag & Drop**: Reschedule by dragging
- **Color Coding**: Different colors for service types
- **Filters**: Filter by technician, service type, status

### 4. Job Card Management

#### Creating a Job Card

1. Navigate to **Job Cards**
2. Click **"+ New Job Card"**
3. Enter information:
   - Customer & Vehicle (auto-filled from appointment)
   - Service Type
   - Description of work
   - Assigned Technician
   - Priority Level
   - Estimated Completion
4. Add Service Items:
   - Select from service templates
   - Or manually add labor/parts
5. Click **"Create Job Card"**

#### Job Card Workflow

```
Pending → Assigned → In Progress → Quality Check → Completed → Invoiced
```

**Status Updates:**
- **Pending**: Waiting for technician assignment
- **Assigned**: Technician assigned, not started
- **In Progress**: Work underway
- **Quality Check**: Under QC inspection
- **Completed**: Work finished, ready for pickup
- **Invoiced**: Invoice generated and sent

### 5. Vehicle Inspections

#### Performing an Inspection

1. Navigate to **Vehicle Inspections**
2. Click **"+ New Inspection"**
3. Select vehicle and job card
4. Complete inspection checklist:
   - **Exterior**: Body, glass, lights, tires
   - **Interior**: Seats, dashboard, controls
   - **Under Hood**: Fluids, belts, battery
   - **Undercarriage**: Suspension, brakes, exhaust
5. Take photos for each area
6. Mark items: ✅ Good, ⚠️ Attention Needed, ❌ Failed
7. Add recommendations
8. Click **"Complete Inspection"**

### 6. Parts Management

#### Searching for Parts

1. Navigate to **Spare Parts**
2. Use search bar or filters:
   - Category (brakes, fluids, filters)
   - Brand
   - Compatibility (vehicle make/model)
3. View part details:
   - SKU, description, price
   - Stock quantity
   - Location in warehouse
   - Supplier information

#### Adding Parts to Job Card

1. Open job card
2. Click **"+ Add Parts"**
3. Search and select parts
4. Enter quantity
5. Price auto-calculates
6. Click **"Add to Job Card"**

#### Checking Stock Levels

1. Navigate to **Inventory Management**
2. View stock dashboard:
   - 🟢 In Stock (sufficient quantity)
   - 🟡 Low Stock (below threshold)
   - 🔴 Out of Stock (zero quantity)
3. Click **"Reorder"** for low stock items

### 7. Invoicing & Payments

#### Generating an Invoice

1. Navigate to **Job Cards**
2. Find completed job card
3. Click **"Generate Invoice"**
4. Review invoice details:
   - Labor charges (from tasks)
   - Parts charges (from parts used)
   - Tax calculations (auto-computed)
   - Discounts (if applicable)
5. Click **"Generate Invoice"**
6. Choose delivery method:
   - Email to customer
   - Print for in-person
   - SMS with payment link

#### Processing Payment

1. Navigate to **Invoices**
2. Find unpaid invoice
3. Click **"Record Payment"**
4. Select payment method:
   - Cash
   - Credit/Debit Card (Stripe)
   - PayPal
   - Bank Transfer
5. Enter amount
6. Click **"Process Payment"**
7. Receipt auto-generates and emails to customer

### 8. Customer Portal Features

#### What Customers Can Do

Customers with portal access can:

- **Book Appointments**: Online self-service booking
- **View Service History**: All past services
- **Track Live Service**: Real-time job status
- **View Invoices**: Download and pay online
- **Manage Profile**: Update contact info
- **Upload Documents**: Insurance, registration
- **Chat Support**: Real-time chat with staff
- **Leave Reviews**: Rate and review services

#### Enabling Customer Portal Access

1. Navigate to **Customers**
2. Select customer
3. Click **"Enable Portal Access"**
4. System sends welcome email with login link
5. Customer sets password on first login

---

## Role-Specific Guides

### For Service Advisors

**Daily Workflow:**
1. Check today's appointments
2. Welcome customers at check-in
3. Create job cards for services
4. Communicate with technicians on progress
5. Update customers on status
6. Generate invoices when complete
7. Process payments
8. Schedule follow-up appointments

**Key Features You'll Use:**
- Customers
- Appointments
- Calendar
- Job Cards
- Vehicles
- Estimates
- Invoices
- Chat (customer communication)

### For Technicians

**Daily Workflow:**
1. Login to Technician Portal
2. View assigned job cards
3. Clock in to start work
4. Update job card status as you progress
5. Add notes and photos
6. Mark tasks complete
7. Request parts as needed
8. Complete quality checklist
9. Clock out when done

**Key Features You'll Use:**
- Technician Portal
- Job Cards (assigned to you)
- Vehicle Inspections
- Diagnostics & OBD
- Knowledge Base
- AR Repair Guide
- Parts lookup (view only)

### For Parts Managers

**Daily Workflow:**
1. Check low stock alerts
2. Review pending purchase orders
3. Process incoming parts
4. Update inventory levels
5. Fulfill parts requests from technicians
6. Coordinate with suppliers
7. Monitor parts availability
8. Generate inventory reports

**Key Features You'll Use:**
- Inventory Management
- Spare Parts
- Suppliers
- Purchase Orders
- Parts Availability Tracker
- Barcode Scanner
- Stock Alerts
- Reports

### For Managers

**Daily Workflow:**
1. Review KPI dashboard
2. Check team performance metrics
3. Review pending approvals
4. Monitor financial reports
5. Address escalations
6. Plan staffing and schedules
7. Review customer feedback
8. Strategic planning with BI reports

**Key Features You'll Use:**
- KPI Dashboard
- Business Intelligence
- Reports
- Team Performance
- Financial Analytics
- Customer Reviews
- Franchise Management (if applicable)

---

## Common Tasks

### Searching for Information

**Global Search** (top header):
- Type customer name, phone, email
- Type vehicle plate number or VIN
- Type job card number
- Type invoice number
- Results appear instantly

**Quick Actions** (Cmd/Ctrl + K):
1. Press ⌘K (Mac) or Ctrl+K (Windows)
2. Type action name:
   - "New Customer"
   - "New Appointment"
   - "New Job Card"
3. Press Enter to execute

### Filtering & Sorting

Most tables support:
- **Search Bar**: Quick filter
- **Column Filters**: Click column header
- **Date Ranges**: Select date range
- **Status Filters**: Filter by status
- **Export**: Download as CSV/Excel/PDF

### Exporting Data

1. Navigate to Reports or any data table
2. Click **"Export"** button
3. Choose format:
   - CSV (for Excel)
   - PDF (for printing)
   - Excel (XLSX)
4. Select date range (if applicable)
5. Click **"Download"**

### Printing Documents

1. Open invoice, estimate, or report
2. Click **"Print"** button
3. Review print preview
4. Select printer
5. Click **"Print"**

**Printable Documents:**
- Invoices
- Estimates
- Job Cards
- Vehicle Inspection Reports
- Purchase Orders
- Financial Reports

---

## Tips & Best Practices

### Efficiency Tips

1. **Use Keyboard Shortcuts**
   - ⌘K / Ctrl+K: Quick Actions
   - Esc: Close modals
   - Tab: Navigate forms
   - Enter: Submit forms

2. **Save Common Searches**
   - Use Saved Filters feature
   - Name your custom filters
   - Quick access to frequent queries

3. **Use Service Templates**
   - Create templates for common services
   - Save time on job card creation
   - Ensure consistency

4. **Batch Operations**
   - Select multiple items
   - Perform bulk actions
   - Update statuses in batch

### Data Quality Tips

1. **Complete Customer Profiles**
   - Always collect email and phone
   - Verify addresses
   - Update on each visit

2. **Accurate Vehicle Info**
   - Use VIN decoder
   - Update mileage every visit
   - Document modifications

3. **Detailed Job Notes**
   - Document customer concerns
   - Note work performed
   - Include photos when relevant

4. **Timely Status Updates**
   - Update job status as work progresses
   - Keep customers informed
   - Accurate time tracking

### Security Best Practices

1. **Password Security**
   - Use strong passwords (8+ chars, mixed case, numbers)
   - Change password every 90 days
   - Never share passwords

2. **Session Management**
   - Log out when leaving workstation
   - Lock screen during breaks
   - Session auto-expires after 30 min inactivity

3. **Data Privacy**
   - Only access data you need
   - Don't share customer info
   - Follow GDPR guidelines

4. **2FA Protection**
   - Enable two-factor authentication
   - Use authenticator app
   - Keep backup codes safe

---

## Mobile Usage

### Mobile Web Access

SALIS AUTO is fully responsive on mobile devices:

**Supported Features:**
- View dashboard
- Check appointments
- Update job statuses
- View customer info
- Scan barcodes/QR codes
- Take photos
- Real-time chat
- Notifications

**Best Practices:**
- Use landscape for tables
- Portrait for forms
- Enable notifications
- Bookmark on home screen

---

## Getting Help

### In-App Help

- **?** Icon: Contextual help on each page
- **Knowledge Base**: Searchable help articles
- **Video Tutorials**: Step-by-step guides
- **Chat Support**: Real-time assistance

### Documentation

- [Quick Start Guide](QUICK-START-GUIDE.md)
- [FAQ](FAQ.md)
- [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md)
- [Training Materials](TRAINING-MATERIALS.md)

### Contact Support

- **Email**: support@salisauto.com
- **Phone**: Available in your profile
- **Live Chat**: Click chat icon
- **Support Hours**: Mon-Fri 8AM-6PM

---

## Appendix

### Glossary

- **Job Card**: Service order/work order
- **VIN**: Vehicle Identification Number (17 characters)
- **OBD**: On-Board Diagnostics
- **SKU**: Stock Keeping Unit (part number)
- **QC**: Quality Control
- **KPI**: Key Performance Indicator
- **RBAC**: Role-Based Access Control
- **2FA**: Two-Factor Authentication

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K / Ctrl+K | Quick Actions |
| Esc | Close Modal |
| Tab | Navigate Form Fields |
| Shift+Tab | Navigate Back |
| Enter | Submit Form |
| / | Focus Search Bar |

---

**Happy Using SALIS AUTO!** 🚗✨

For more detailed information, explore our complete [Documentation Index](DOCUMENTATION-INDEX.md).
