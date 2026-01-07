# SALIS AUTO - Portal-Specific User Flows

## Overview

SALIS AUTO provides four dedicated portals for different user groups. Each portal offers tailored functionality and workflows specific to user needs.

---

## 1. Technician Portal

### Portal URL: `/technician-portal`

### Overview
Mobile-optimized portal for technicians to manage their daily work, view assignments, and document service activities.

---

### Flow 1.1: Daily Job Review

**Entry Point**: Login → Technician Portal Dashboard

**Steps**:
1. Technician logs in with credentials
2. Dashboard displays today's assignments
3. Priority jobs highlighted at top
4. Each job shows:
   - Vehicle info (make/model/plate)
   - Customer name
   - Service type
   - Estimated duration
   - Parts status
5. Technician taps job to view details
6. Full work order displayed

**User Scenarios**:
- View pending jobs
- Check job priorities
- Review work instructions
- See parts availability

---

### Flow 1.2: Job Execution Workflow

**Entry Point**: Job Details Screen

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Start Job    │───▶│ Work in      │───▶│ Complete     │
│ (Clock In)   │    │ Progress     │    │ (Clock Out)  │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Bay Assigned       Log Parts          Submit for QC
```

**Steps**:
1. Technician selects "Start Job"
2. System records start time
3. Bay assignment confirmed
4. During work:
   - Add notes/findings
   - Request additional parts
   - Take photos
   - Access repair guides
5. Mark operations complete
6. Select "Complete Job"
7. System records end time
8. Job sent to QC queue

**User Scenarios**:
- Start/pause/resume jobs
- Document work with photos
- Request parts mid-job
- Flag issues for advisor

---

### Flow 1.3: Parts Request

**Entry Point**: Job Details → Parts Tab

**Steps**:
1. Tap "Request Parts"
2. Search parts database
3. Select required part
4. Specify quantity
5. Add notes if needed
6. Submit request
7. Parts staff notified
8. Track delivery status

**User Scenarios**:
- Search by part number
- Search by description
- View alternatives
- Check stock levels

---

### Flow 1.4: Diagnostics Access

**Entry Point**: Job Details → Diagnostics

**Steps**:
1. Connect OBD scanner (Bluetooth)
2. Tap "Start Scan"
3. View live DTCs
4. Clear codes after repair
5. Verify repair success
6. Save diagnostic report to job

**User Scenarios**:
- Read diagnostic codes
- View live data
- Clear codes
- Compare before/after

---

### Flow 1.5: AR Repair Guide Access

**Entry Point**: Job Details → AR Guide

**Steps**:
1. Open AR overlay feature
2. Point device at vehicle component
3. AR displays repair steps
4. Follow on-screen instructions
5. Confirm step completion
6. System logs progress

**User Scenarios**:
- Complex repairs
- Unfamiliar procedures
- Training new technicians

---

## 2. Customer Portal

### Portal URL: `/client/*`

### Overview
Self-service portal for customers to manage appointments, view service history, track vehicles, and make payments.

---

### Flow 2.1: Customer Login/Registration

**Entry Points**: 
- Direct login: `/client/login`
- Registration: `/client/register`

**Steps for New Registration**:
1. Click "Create Account"
2. Enter email and phone
3. Set password
4. Verify email/SMS
5. Add vehicle(s)
6. Complete profile

**Steps for Existing Login**:
1. Enter email/username
2. Enter password
3. Optional 2FA verification
4. Access dashboard

---

### Flow 2.2: Book Appointment

**Entry Point**: Dashboard → "Book Service"

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Select       │───▶│ Choose       │───▶│ Confirm      │
│ Vehicle      │    │ Date/Time    │    │ Booking      │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Select Service      Enter Notes        Receive SMS
```

**Steps**:
1. Select vehicle from list (or add new)
2. Choose service type:
   - Scheduled maintenance
   - Repair
   - Inspection
   - Other
3. View available time slots
4. Select preferred date/time
5. Add description of issues (optional)
6. Upload photos (optional)
7. Review booking details
8. Confirm appointment
9. Receive confirmation via email/SMS

**User Scenarios**:
- Schedule routine service
- Book emergency repair
- Request specific technician
- Book multiple vehicles

---

### Flow 2.3: Track Service Status

**Entry Point**: Dashboard → Active Services

**Steps**:
1. View list of active jobs
2. Select job to see details
3. View current status:
   - Checked In
   - Diagnostics
   - Awaiting Approval
   - In Progress
   - Quality Check
   - Ready for Pickup
4. Receive push notifications for updates
5. View technician notes/photos

**User Scenarios**:
- Real-time status tracking
- View inspection photos
- Approve additional work
- Estimated completion time

---

### Flow 2.4: Approve Estimate

**Entry Point**: Notification/Email → Estimate Link

**Steps**:
1. Customer receives estimate notification
2. Opens estimate in portal
3. Reviews line items:
   - Labor charges
   - Parts costs
   - VAT amount
   - Total
4. Views inspection photos/videos
5. Options:
   - Approve all
   - Approve partial
   - Request callback
   - Decline
6. Digital signature if approving
7. Confirmation sent

**User Scenarios**:
- Approve full estimate
- Select specific items only
- Request more information
- Compare with previous estimates

---

### Flow 2.5: Make Payment

**Entry Point**: Invoices → Pay Now

**Steps**:
1. View invoice details
2. Select payment method:
   - Credit/Debit card (Stripe)
   - PayPal
   - Apple Pay
   - Bank transfer
3. Enter payment details
4. Confirm amount
5. Process payment
6. Download receipt (ZATCA-compliant)
7. Loyalty points added

**User Scenarios**:
- Pay full amount
- Partial payment
- Set up payment plan
- Redeem loyalty points

---

### Flow 2.6: View Service History

**Entry Point**: Dashboard → Service History

**Steps**:
1. View list of past services
2. Filter by:
   - Vehicle
   - Date range
   - Service type
3. Select service to view details
4. Download past invoices
5. View warranty status

**User Scenarios**:
- Review past repairs
- Check warranty coverage
- Download records for insurance
- Share with new mechanic

---

### Flow 2.7: Loyalty & Rewards

**Entry Point**: Dashboard → My Rewards

**Steps**:
1. View current points balance
2. See tier status
3. View available rewards
4. Redeem points for:
   - Discount on service
   - Free oil change
   - Merchandise
5. Track point history
6. Refer friends for bonus points

**User Scenarios**:
- Check points balance
- Redeem rewards
- View tier benefits
- Refer friends

---

## 3. Client Portal (B2B)

### Portal URL: `/client/*` (B2B Mode)

### Overview
Extended portal for fleet customers and business accounts with additional features for managing multiple vehicles and drivers.

---

### Flow 3.1: Fleet Management

**Entry Point**: Dashboard → Fleet

**Steps**:
1. View all fleet vehicles
2. Filter by:
   - Status (active/service/inactive)
   - Driver assigned
   - Next service due
3. Add new vehicle to fleet
4. Assign/reassign drivers
5. Set service schedules
6. View fleet-wide analytics

**User Scenarios**:
- Manage company vehicles
- Track all active services
- Schedule preventive maintenance
- Generate fleet reports

---

### Flow 3.2: Driver Management

**Entry Point**: Dashboard → Drivers

**Steps**:
1. View driver list
2. Add new driver:
   - Name and contact
   - License info
   - Assigned vehicle(s)
3. Set approval limits
4. View driver service history
5. Generate driver reports

**User Scenarios**:
- Add/remove drivers
- Set spending limits
- Approve driver requests
- Track driver-initiated services

---

### Flow 3.3: Consolidated Billing

**Entry Point**: Dashboard → Billing

**Steps**:
1. View monthly summary
2. See all invoices
3. Filter by vehicle/driver/date
4. Download consolidated statement
5. Pay all or selected invoices
6. Set up auto-payment

**User Scenarios**:
- Review monthly charges
- Download for accounting
- Pay consolidated bill
- Dispute charges

---

## 4. Purchase Agent Portal

### Portal URL: `/purchase-agent-portal`

### Overview
Procurement portal for managing purchase orders, supplier relationships, and parts sourcing.

---

### Flow 4.1: Purchase Order Management

**Entry Point**: Dashboard → Purchase Orders

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Create       │───▶│ Get          │───▶│ Submit       │
│ Request      │    │ Quotes       │    │ Order        │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   Add Items        Compare Prices       Track Delivery
```

**Steps**:
1. View pending requests
2. Create new PO:
   - Add line items
   - Specify quantities
   - Select supplier
3. Request quotes from suppliers
4. Compare prices
5. Select best offer
6. Submit for approval
7. Send PO to supplier
8. Track delivery status
9. Receive and verify goods

**User Scenarios**:
- Create purchase orders
- Get competitive quotes
- Track deliveries
- Handle returns

---

### Flow 4.2: Supplier Management

**Entry Point**: Dashboard → Suppliers

**Steps**:
1. View supplier list
2. Add new supplier:
   - Company details
   - Contact info
   - Payment terms
   - Catalog integration
3. Rate supplier performance
4. View order history
5. Manage contracts

**User Scenarios**:
- Onboard new supplier
- Evaluate performance
- Negotiate terms
- Manage catalog

---

### Flow 4.3: Inventory Reorder

**Entry Point**: Dashboard → Low Stock Alerts

**Steps**:
1. View low stock items
2. See suggested reorder quantities
3. AI predicts demand
4. Create bulk order
5. Split across suppliers
6. Submit orders
7. Track all deliveries

**User Scenarios**:
- Respond to stock alerts
- Bulk ordering
- Multi-supplier orders
- Optimize costs

---

## 5. Admin Console

### Portal URL: `/dashboard` (Admin Role)

### Overview
Full system administration console for managing users, settings, and system configuration.

---

### Flow 5.1: User Management

**Entry Point**: System Settings → Users

**Steps**:
1. View all users
2. Add new user:
   - Personal info
   - Assign role
   - Set permissions
   - Set location/department
3. Modify existing user
4. Deactivate/reactivate
5. Reset password
6. View audit log

**User Scenarios**:
- Onboard new employee
- Change user role
- Handle terminations
- Security audits

---

### Flow 5.2: System Configuration

**Entry Point**: System Settings

**Configurable Areas**:
1. **Company Settings**
   - Business name
   - Logo
   - Contact info
   - Tax IDs
   
2. **Service Settings**
   - Labor rates
   - Service templates
   - Warranty policies
   
3. **Financial Settings**
   - VAT configuration
   - Payment methods
   - Currency
   
4. **Integration Settings**
   - API keys
   - Third-party connections
   - Webhooks

---

### Flow 5.3: Multi-Location Management

**Entry Point**: Franchise → Locations

**Steps**:
1. View all locations
2. Add new location:
   - Address and contact
   - Staff assignment
   - Inventory allocation
   - Local settings
3. Configure location-specific:
   - Operating hours
   - Services offered
   - Pricing adjustments
4. Transfer resources between locations
5. View location performance

**User Scenarios**:
- Add new branch
- Configure location settings
- Transfer inventory
- Compare performance

---

## Portal Access Summary

| Portal | Primary Users | Key Features |
|--------|--------------|--------------|
| Technician | Technicians | Jobs, Parts, Diagnostics, AR |
| Customer | End Customers | Booking, Tracking, Payments |
| Client (B2B) | Fleet Managers | Fleet, Drivers, Billing |
| Purchase Agent | Procurement | POs, Suppliers, Inventory |
| Admin Console | Administrators | Users, Settings, Locations |

