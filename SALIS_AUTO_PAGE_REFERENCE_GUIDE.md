# SALIS AUTO - Complete Page Reference Guide

**Version:** 1.0  
**Total Pages:** 235  
**Screenshot Location:** `GUI PRTSCN/`  
**Resolution:** 1920x1080 (Full HD)  
**Last Updated:** January 2026

---

## Table of Contents

1. [Dashboard & Overview (001-003)](#1-dashboard--overview-001-003)
2. [Customer Management (004-011)](#2-customer-management-004-011)
3. [Appointments & Scheduling (012-018)](#3-appointments--scheduling-012-018)
4. [Vehicle Management (019-036)](#4-vehicle-management-019-036)
5. [Diagnostics & Maintenance (037-040)](#5-diagnostics--maintenance-037-040)
6. [Service Operations (041-053)](#6-service-operations-041-053)
7. [Inventory & Parts (054-067)](#7-inventory--parts-054-067)
8. [Suppliers & Purchasing (068-078)](#8-suppliers--purchasing-068-078)
9. [Purchase Agent Portal (079-089)](#9-purchase-agent-portal-079-089)
10. [Technician Portal (090-107)](#10-technician-portal-090-107)
11. [Client Portal (108-116)](#11-client-portal-108-116)
12. [Customer Mobile App (117-121)](#12-customer-mobile-app-117-121)
13. [General Portal (122-126)](#13-general-portal-122-126)
14. [Reports & Analytics (127-134)](#14-reports--analytics-127-134)
15. [HR & Team Management (135-144)](#15-hr--team-management-135-144)
16. [Accounting & Finance (145-171)](#16-accounting--finance-145-171)
17. [Marketing & Communications (172-181)](#17-marketing--communications-172-181)
18. [Compliance & Safety (182-192)](#18-compliance--safety-182-192)
19. [AI & Automation (193-201)](#19-ai--automation-193-201)
20. [Emerging Technologies (202-214)](#20-emerging-technologies-202-214)
21. [Hardware & Devices (215-218)](#21-hardware--devices-215-218)
22. [Documents & Data (219-223)](#22-documents--data-219-223)
23. [System & Settings (224-235)](#23-system--settings-224-235)

---

## 1. Dashboard & Overview (001-003)

### 001 - Dashboard Home
**Screenshot:** `001-Dashboard-Home.png`  
**Route:** `/`  
**Purpose:** Primary landing page after login

**Features:**
- Welcome message with user name
- Quick action buttons for common tasks
- Today's appointments overview
- Active job cards summary
- Revenue metrics (daily/weekly/monthly)
- Recent customer activity feed
- Pending tasks notification
- System alerts and announcements

**Key Metrics Displayed:**
- Total customers served today
- Open job cards count
- Pending invoices value
- Parts low stock alerts

---

### 002 - Welcome Page
**Screenshot:** `002-Welcome-Page.png`  
**Route:** `/welcome`  
**Purpose:** Role-based routing hub after authentication

**Features:**
- Personalized greeting based on user role
- Role-specific quick navigation cards
- Getting started guide for new users
- Recent activity summary
- Recommended actions based on role

**Role Routing:**
| Role | Redirects To |
|------|--------------|
| Admin | /dashboard |
| Technician | /technician-portal |
| HR Manager | /hr-management |
| Accountant | /accounting-integration |
| Customer | /client |

---

### 003 - Dashboard Main
**Screenshot:** `003-Dashboard-Main.png`  
**Route:** `/dashboard`  
**Purpose:** Comprehensive business overview dashboard

**Features:**
- Multi-metric stat cards grid
- Revenue trend chart (line graph)
- Service distribution pie chart
- Top performing technicians list
- Vehicle status breakdown
- Appointment calendar widget
- Inventory status indicators
- Real-time notifications panel

**Widgets:**
- Revenue Today/Week/Month
- Jobs Completed vs Pending
- Customer Satisfaction Score
- Average Repair Time
- Parts Usage Statistics

---

## 2. Customer Management (004-011)

### 004 - Customers List
**Screenshot:** `004-Customers-List.png`  
**Route:** `/customers`  
**Purpose:** Master customer database with search and filters

**Features:**
- Searchable customer table
- Filter by status (Active/Inactive)
- Filter by customer type
- Sort by name, date, visits
- Add new customer button
- Bulk actions (export, email)
- Customer card preview on hover

**Table Columns:**
- Customer ID
- Name
- Phone
- Email
- Total Visits
- Last Visit Date
- Total Spent
- Status
- Actions (View/Edit/Delete)

---

### 005 - Customer Feedback
**Screenshot:** `005-Customer-Feedback.png`  
**Route:** `/customer-feedback`  
**Purpose:** AI-powered customer feedback analysis with sentiment tracking

**Features:**
- Feedback submission form
- Star rating component (1-5)
- Comment text area
- AI sentiment analysis display
- Sentiment trend chart
- Feedback history table
- Response management
- Export feedback reports

**Sentiment Categories:**
- Positive (Blue indicator)
- Neutral (Gray indicator)
- Negative (Orange indicator)

---

### 006 - Customer Loyalty
**Screenshot:** `006-Customer-Loyalty.png`  
**Route:** `/customer-loyalty`  
**Purpose:** Customer loyalty status and benefits overview

**Features:**
- Loyalty tier display (Bronze/Silver/Gold/Platinum)
- Points balance card
- Points earning history
- Available rewards catalog
- Tier progression bar
- Benefits breakdown by tier
- Referral bonus tracking

---

### 007 - Customer Reviews & Ratings
**Screenshot:** `007-Customer-Reviews-Ratings.png`  
**Route:** `/customer-reviews`  
**Purpose:** Public review management and response system

**Features:**
- Review listing with star ratings
- Average rating display
- Review response composer
- Filter by rating (1-5 stars)
- Review moderation tools
- Publish/unpublish controls
- Review analytics chart

---

### 008 - Referral Program
**Screenshot:** `008-Referral-Program.png`  
**Route:** `/referral-program`  
**Purpose:** Customer referral tracking and reward management

**Features:**
- Referral code generator
- Share via SMS/Email/WhatsApp
- Referral tracking table
- Reward claim history
- Commission calculation
- Top referrers leaderboard
- Program rules display

---

### 009 - Customer Portal
**Screenshot:** `009-Customer-Portal.png`  
**Route:** `/customer-portal`  
**Purpose:** Self-service customer interface overview

**Features:**
- Customer dashboard widgets
- Vehicle status cards
- Appointment scheduler
- Invoice history access
- Service history timeline
- Document downloads
- Support chat access

---

### 010 - Loyalty Program
**Screenshot:** `010-Loyalty-Program.png`  
**Route:** `/loyalty-program`  
**Purpose:** Complete loyalty program management

**Features:**
- Program configuration panel
- Tier setup (4 tiers)
- Points rules configuration
- Reward catalog management
- Member enrollment stats
- Redemption tracking
- Program analytics

**Tier Configuration:**
| Tier | Points Required | Discount |
|------|-----------------|----------|
| Bronze | 0 | 0% |
| Silver | 1,000 | 5% |
| Gold | 5,000 | 10% |
| Platinum | 15,000 | 15% |

---

### 011 - Customer LTV Analysis
**Screenshot:** `011-Customer-LTV-Analysis.png`  
**Route:** `/customer-ltv`  
**Purpose:** Customer Lifetime Value analytics and segmentation

**Features:**
- LTV calculation display
- Customer segmentation chart
- High-value customer list
- Churn risk indicators
- Retention rate metrics
- Revenue per customer trend
- Predictive LTV modeling

---

## 3. Appointments & Scheduling (012-018)

### 012 - Appointments
**Screenshot:** `012-Appointments.png`  
**Route:** `/appointments`  
**Purpose:** Appointment booking and management hub

**Features:**
- Calendar view (day/week/month)
- Appointment list view
- New appointment form
- Customer search autocomplete
- Vehicle selection dropdown
- Service type selector
- Time slot availability
- Technician assignment
- SMS/Email confirmation toggle

**Appointment Status:**
- Scheduled (Blue)
- Confirmed (Blue)
- In Progress (Blue)
- Completed (Blue)
- Cancelled (Orange)
- No Show (Orange)

---

### 013 - Appointment Reminders
**Screenshot:** `013-Appointment-Reminders.png`  
**Route:** `/appointment-reminders`  
**Purpose:** Automated reminder configuration and tracking

**Features:**
- Reminder schedule configuration
- SMS template editor
- Email template editor
- Reminder timing settings (1hr, 24hr, 48hr)
- Delivery status tracking
- Failed reminder retry
- Opt-out management

---

### 014 - Calendar
**Screenshot:** `014-Calendar.png`  
**Route:** `/calendar`  
**Purpose:** Full-featured calendar for all scheduling

**Features:**
- Month/week/day views
- Drag-and-drop rescheduling
- Color-coded event types
- Multi-resource view
- Google Calendar sync
- iCal export
- Quick event creation
- Event details popup

---

### 015 - Workshop Calendar
**Screenshot:** `015-Workshop-Calendar.png`  
**Route:** `/workshop-calendar`  
**Purpose:** Service bay scheduling with drag-and-drop

**Features:**
- Resource timeline view
- Bay-by-bay scheduling
- Technician availability overlay
- Job duration estimation
- Conflict detection
- Capacity planning
- Overtime indicators
- Print schedule option

**Libraries Used:**
- react-big-calendar
- @dnd-kit/core
- @dnd-kit/sortable

---

### 016 - AI Scheduling
**Screenshot:** `016-AI-Scheduling.png`  
**Route:** `/ai-scheduling`  
**Purpose:** AI-powered optimal scheduling recommendations

**Features:**
- Auto-schedule button
- Optimization criteria settings
- Conflict resolution suggestions
- Workload balancing view
- Predicted completion times
- Resource optimization score
- What-if scenario modeling

---

### 017 - Smart Assignment
**Screenshot:** `017-Smart-Assignment.png`  
**Route:** `/smart-assignment`  
**Purpose:** AI-driven technician job matching

**Features:**
- Skill-based matching algorithm
- Workload distribution chart
- Technician availability matrix
- Job complexity scoring
- Assignment recommendations
- Manual override option
- Performance history consideration

---

### 018 - Routing Optimizer
**Screenshot:** `018-Routing-Optimizer.png`  
**Route:** `/routing-optimizer`  
**Purpose:** Mobile service route optimization

**Features:**
- Map-based route visualization
- Stop sequence optimization
- Travel time estimation
- Fuel cost calculation
- Route export to navigation
- Multi-vehicle routing
- Time window constraints

---

## 4. Vehicle Management (019-036)

### 019 - Vehicles
**Screenshot:** `019-Vehicles.png`  
**Route:** `/vehicles`  
**Purpose:** Vehicle registration and management

**Features:**
- Add vehicle form with make/model dropdowns
- 57 vehicle makes available
- 200+ models with dependent filtering
- VIN input with decoder button
- License plate entry
- Year/color/mileage fields
- Customer assignment
- Photo upload capability

**Make/Model System:**
- Dependent dropdown (model updates based on make)
- ScrollArea for long lists
- Search within dropdown
- Manual entry option

---

### 020 - Vehicles List
**Screenshot:** `020-Vehicles-List.png`  
**Route:** `/vehicles-list`  
**Purpose:** Complete vehicle inventory with filters

**Features:**
- Vehicle search (VIN, plate, make)
- Filter by make/model/year
- Filter by status
- Sort options
- Vehicle cards grid view
- Table list view toggle
- Export to CSV/Excel
- Bulk status update

---

### 021 - Vehicle Inspections
**Screenshot:** `021-Vehicle-Inspections.png`  
**Route:** `/vehicle-inspections`  
**Purpose:** Pre-service vehicle inspection records

**Features:**
- Inspection checklist
- Photo documentation
- Damage marking tool
- Mileage recording
- Fuel level indicator
- Customer signature capture
- PDF report generation
- Email to customer

---

### 022 - Vehicle Checklist
**Screenshot:** `022-Vehicle-Checklist.png`  
**Route:** `/vehicle-checklist`  
**Purpose:** Customizable inspection checklists

**Features:**
- Checklist template builder
- Checkpoint categories
- Pass/Fail/N-A options
- Notes per checkpoint
- Severity indicators
- Checklist assignment
- Completion tracking

---

### 023 - Vehicle History
**Screenshot:** `023-Vehicle-History.png`  
**Route:** `/vehicle-history`  
**Purpose:** Complete service history timeline

**Features:**
- Timeline view of all services
- Service details expansion
- Invoice links
- Parts used listing
- Technician notes
- Photo attachments
- Export history report
- Share with customer

---

### 024 - Vehicle Health Monitoring
**Screenshot:** `024-Vehicle-Health-Monitoring.png`  
**Route:** `/vehicle-health`  
**Purpose:** Real-time vehicle health status tracking

**Features:**
- Health score gauge (0-100)
- Component status indicators
- Upcoming maintenance alerts
- OBD data integration
- Trend analysis charts
- Comparison with similar vehicles
- Maintenance recommendations

---

### 025 - Vehicle Tracking
**Screenshot:** `025-Vehicle-Tracking.png`  
**Route:** `/vehicle-tracking`  
**Purpose:** GPS-based vehicle location tracking

**Features:**
- Live map view
- Vehicle location pins
- Route history playback
- Geofence alerts
- Speed monitoring
- Idle time tracking
- Trip reports

---

### 026 - Vehicle Storage
**Screenshot:** `026-Vehicle-Storage.png`  
**Route:** `/vehicle-storage`  
**Purpose:** Long-term vehicle storage management

**Features:**
- Storage bay assignment
- Check-in/check-out logs
- Storage duration tracking
- Billing calculation
- Vehicle condition reports
- Climate control settings
- Customer notifications

---

### 027 - VIN Decoder
**Screenshot:** `027-VIN-Decoder.png`  
**Route:** `/vin-decoder`  
**Purpose:** Vehicle Identification Number lookup tool

**Features:**
- VIN input field (17 characters)
- Decode button
- Make/Model/Year extraction
- Engine specifications
- Manufacturing plant info
- Safety recall check
- NHTSA database integration
- Auto-fill vehicle form

---

### 028 - Fleet Management
**Screenshot:** `028-Fleet-Management.png`  
**Route:** `/fleet-management`  
**Purpose:** Commercial fleet vehicle management

**Features:**
- Fleet overview dashboard
- Vehicle status grid
- Maintenance scheduling
- Fuel consumption tracking
- Driver assignment
- Utilization reports
- Cost per vehicle analysis
- Compliance tracking

---

### 029 - Fleet Tracking
**Screenshot:** `029-Fleet-Tracking.png`  
**Route:** `/fleet-tracking`  
**Purpose:** Real-time fleet location monitoring

**Features:**
- Multi-vehicle map view
- Live location updates
- Route optimization
- ETA calculations
- Driver behavior scoring
- Fuel efficiency metrics
- Alert notifications

---

### 030 - Tire Management
**Screenshot:** `030-Tire-Management.png`  
**Route:** `/tire-management`  
**Purpose:** Tire inventory and rotation tracking

**Features:**
- Tire inventory database
- Tread depth recording
- Rotation schedule
- Seasonal swap tracking
- Tire storage location
- Wear pattern analysis
- Replacement recommendations

---

### 031 - Loaner Vehicles
**Screenshot:** `031-Loaner-Vehicles.png`  
**Route:** `/loaner-vehicles`  
**Purpose:** Courtesy vehicle fleet management

**Features:**
- Loaner availability calendar
- Reservation system
- Customer agreement forms
- Mileage tracking
- Fuel policy settings
- Return inspection
- Cleaning schedule

---

### 032 - Towing Assistance
**Screenshot:** `032-Towing-Assistance.png`  
**Route:** `/towing-assistance`  
**Purpose:** Emergency towing request handling

**Features:**
- Towing request form
- Customer location input
- Service type selection
- Partner tow company dispatch
- ETA tracking
- Cost estimation
- Request history

---

### 033 - Towing Services
**Screenshot:** `033-Towing-Services.png`  
**Route:** `/towing-services`  
**Purpose:** Towing service provider management

**Features:**
- Tow company directory
- Service area mapping
- Rate configuration
- Performance ratings
- Contract management
- Invoice reconciliation
- Availability status

---

### 034 - Telematics Integration
**Screenshot:** `034-Telematics-Integration.png`  
**Route:** `/telematics`  
**Purpose:** Connected car data integration

**Features:**
- Telematics device pairing
- Real-time data stream
- DTC code reading
- Battery health monitoring
- Trip statistics
- Driver behavior analysis
- Maintenance predictions

---

### 035 - Digital Vehicle Walkaround
**Screenshot:** `035-Digital-Vehicle-Walkaround.png`  
**Route:** `/digital-walkaround`  
**Purpose:** Digital inspection with photos/video

**Features:**
- 360° vehicle diagram
- Tap-to-mark damage
- Photo capture integration
- Video recording option
- Voice notes
- Customer viewing link
- Before/after comparison

---

### 036 - License Plate Recognition
**Screenshot:** `036-License-Plate-Recognition.png`  
**Route:** `/license-plate-recognition`  
**Purpose:** Automated vehicle identification via LPR

**Features:**
- Camera feed display
- Plate detection algorithm
- Vehicle lookup automation
- Entry/exit logging
- Customer greeting trigger
- Integration with check-in
- Historical plate logs

---

## 5. Diagnostics & Maintenance (037-040)

### 037 - Diagnostics OBD Hub
**Screenshot:** `037-Diagnostics-OBD-Hub.png`  
**Route:** `/diagnostics`  
**Purpose:** OBD-II scanner integration center

**Features:**
- Device connection status
- Live data stream display
- DTC code reading/clearing
- Freeze frame data
- Mode $06 test results
- Sensor data graphs
- Report generation
- Code library reference

**Supported Protocols:**
- OBD-II (CAN, ISO, KWP)
- J1850 PWM/VPW
- ISO 9141-2

---

### 038 - Predictive Diagnostics
**Screenshot:** `038-Predictive-Diagnostics.png`  
**Route:** `/predictive-diagnostics`  
**Purpose:** AI-powered failure prediction

**Features:**
- Component failure probability
- Remaining useful life estimates
- Risk scoring matrix
- Trend analysis charts
- Recommended preventive actions
- Cost-benefit analysis
- Alert configuration

---

### 039 - Predictive Maintenance
**Screenshot:** `039-Predictive-Maintenance.png`  
**Route:** `/predictive-maintenance`  
**Purpose:** Maintenance forecasting and scheduling

**Features:**
- Maintenance timeline forecast
- Service interval optimization
- Parts ordering automation
- Customer notification scheduling
- Cost projection
- Fleet-wide maintenance calendar
- Compliance tracking

---

### 040 - OEM Software Subscriptions
**Screenshot:** `040-OEM-Software-Subscriptions.png`  
**Route:** `/oem-software`  
**Purpose:** OEM diagnostic software license management

**Features:**
- Subscription status dashboard
- License expiration tracking
- Renewal reminders
- Usage analytics
- Cost allocation
- Multi-brand support tracking
- Access management

**Supported OEM Tools:**
- BMW ISTA
- Mercedes XENTRY
- VW/Audi ODIS
- Toyota Techstream
- And more...

---

## 6. Service Operations (041-053)

### 041 - Job Cards
**Screenshot:** `041-Job-Cards.png`  
**Route:** `/job-cards`  
**Purpose:** Service work order management

**Features:**
- Job card creation wizard
- Customer/vehicle selection
- Service line items
- Parts allocation
- Labor time entry
- Technician assignment
- Status workflow
- Notes and attachments
- Print job card

**Status Workflow:**
Created → Assigned → In Progress → QC Pending → Completed → Invoiced

---

### 042 - Service Templates
**Screenshot:** `042-Service-Templates.png`  
**Route:** `/service-templates`  
**Purpose:** Pre-defined service packages

**Features:**
- Template library
- Service package builder
- Parts bundling
- Labor time presets
- Pricing tiers
- Template categories
- Quick apply to job cards
- Version control

---

### 043 - Service Bay Dashboard
**Screenshot:** `043-Service-Bay-Dashboard.png`  
**Route:** `/service-bay-dashboard`  
**Purpose:** Real-time service bay occupancy

**Features:**
- Bay status grid (6-12 bays)
- Occupancy percentage
- Current job per bay
- Technician per bay
- Estimated completion time
- WebSocket real-time updates
- Bay assignment controls
- Capacity planning view

**Bay Status Colors:**
- Available (Gray)
- Occupied (Blue)
- Maintenance (Orange)

---

### 044 - Live Service Tracking
**Screenshot:** `044-Live-Service-Tracking.png`  
**Route:** `/live-tracking`  
**Purpose:** Real-time job progress tracking

**Features:**
- Job progress bar
- Step-by-step status
- Photo/video updates
- Customer notification triggers
- ETA updates
- Delay alerts
- Customer view link

---

### 045 - Quality Control
**Screenshot:** `045-Quality-Control.png`  
**Route:** `/quality-control`  
**Purpose:** Post-service quality inspection

**Features:**
- QC checklist
- Pass/fail criteria
- Defect documentation
- Rework assignment
- QC sign-off
- Customer delivery approval
- Quality metrics dashboard

---

### 046 - Computer Vision QC
**Screenshot:** `046-Computer-Vision-QC.png`  
**Route:** `/computer-vision-qc`  
**Purpose:** AI-powered visual quality inspection

**Features:**
- Camera integration
- Defect detection AI
- Before/after comparison
- Damage classification
- Automated reporting
- Training data management
- Accuracy metrics

---

### 047 - Estimates
**Screenshot:** `047-Estimates.png`  
**Route:** `/estimates`  
**Purpose:** Service cost estimation

**Features:**
- Estimate builder
- Parts pricing lookup
- Labor rate calculation
- Tax calculation
- Discount application
- Customer approval workflow
- Convert to job card
- Email/SMS to customer
- PDF export

---

### 048 - Invoices
**Screenshot:** `048-Invoices.png`  
**Route:** `/invoices`  
**Purpose:** Invoice generation and management

**Features:**
- Invoice listing with filters
- Create invoice from job card
- Line item editor
- Tax configuration (VAT/GST)
- Payment status tracking
- Send via email/SMS
- Print invoice
- ZATCA e-invoice compliance
- Payment recording

---

### 049 - Video Estimates
**Screenshot:** `049-Video-Estimates.png`  
**Route:** `/video-estimates`  
**Purpose:** Video-based remote estimation

**Features:**
- Video recording interface
- Annotation tools
- Damage highlighting
- Voice narration
- Customer sharing link
- Approval workflow
- Video storage management

---

### 050 - Video Consultations
**Screenshot:** `050-Video-Consultations.png`  
**Route:** `/video-consultations`  
**Purpose:** Live video calls with customers

**Features:**
- Video call initiation
- Screen sharing
- Vehicle camera view
- Recording capability
- Chat overlay
- Document sharing
- Appointment scheduling

---

### 051 - Payments
**Screenshot:** `051-Payments.png`  
**Route:** `/payments`  
**Purpose:** Payment processing center

**Features:**
- Payment method selection
- Amount entry
- Invoice linking
- Receipt generation
- Payment history
- Refund processing
- Partial payment handling
- Multi-currency support

---

### 052 - Stripe Payment Processing
**Screenshot:** `052-Stripe-Payment-Processing.png`  
**Route:** `/stripe-payments`  
**Purpose:** Stripe integration for card payments

**Features:**
- Stripe Elements integration
- Card payment form
- Payment intent creation
- 3D Secure handling
- Webhook event processing
- Payout tracking
- Fee calculation
- Dispute management

---

### 053 - Refund Management
**Screenshot:** `053-Refund-Management.png`  
**Route:** `/refunds`  
**Purpose:** Customer refund processing

**Features:**
- Refund request form
- Reason categorization
- Approval workflow
- Partial refund option
- Original payment lookup
- Refund method selection
- Accounting integration
- Customer notification

---

## 7. Inventory & Parts (054-067)

### 054 - Inventory Management
**Screenshot:** `054-Inventory-Management.png`  
**Route:** `/inventory`  
**Purpose:** Complete parts inventory system

**Features:**
- Parts catalog browser
- Stock level display
- Reorder point alerts
- Bin location tracking
- Cost/price management
- Supplier linking
- Stock adjustments
- Inventory valuation
- Barcode support

---

### 055 - Parts Availability
**Screenshot:** `055-Parts-Availability.png`  
**Route:** `/parts-availability`  
**Purpose:** Real-time parts availability check

**Features:**
- Part search (number, name)
- Stock quantity display
- Warehouse location
- Alternative parts suggestions
- Cross-reference lookup
- Supplier availability
- ETA for out-of-stock
- Reserve for job card

---

### 056 - Parts Auto Reorder
**Screenshot:** `056-Parts-Auto-Reorder.png`  
**Route:** `/parts-auto-reorder`  
**Purpose:** Automated reordering configuration

**Features:**
- Reorder point settings
- Minimum quantity rules
- Preferred supplier selection
- Auto-purchase order generation
- Approval thresholds
- Schedule settings
- Notification preferences

---

### 057 - Smart Parts Recommender
**Screenshot:** `057-Smart-Parts-Recommender.png`  
**Route:** `/smart-parts-recommender`  
**Purpose:** AI-powered parts suggestions

**Features:**
- Vehicle-based recommendations
- Service history analysis
- Frequently needed parts
- Bundle suggestions
- Upsell opportunities
- Compatibility verification
- Price comparison

---

### 058 - Smart Parts Recommendations
**Screenshot:** `058-Smart-Parts-Recommendations.png`  
**Route:** `/smart-parts-recommendations`  
**Purpose:** Context-aware parts suggestions

**Features:**
- Job card context analysis
- Related parts suggestions
- Commonly replaced together
- Quality tier options
- Aftermarket alternatives
- OEM vs generic comparison

---

### 059 - Smart Inventory Forecasting
**Screenshot:** `059-Smart-Inventory-Forecasting.png`  
**Route:** `/smart-inventory-forecasting`  
**Purpose:** AI demand prediction for parts

**Features:**
- Demand forecast charts
- Seasonal trend analysis
- Stock level recommendations
- Dead stock identification
- Turn rate optimization
- Safety stock calculation
- Budget planning

---

### 060 - Automated Reordering
**Screenshot:** `060-Automated-Reordering.png`  
**Route:** `/automated-reordering`  
**Purpose:** Hands-free inventory replenishment

**Features:**
- Rule configuration
- Trigger conditions
- Supplier selection logic
- Order approval workflow
- Budget controls
- Order history
- Exception handling
- Performance metrics

---

### 061 - Spare Parts
**Screenshot:** `061-Spare-Parts.png`  
**Route:** `/spare-parts`  
**Purpose:** Spare parts catalog management

**Features:**
- Parts catalog browser
- Category navigation
- Part details view
- Image gallery
- Fitment data
- Pricing history
- Stock movement log
- Supplier information

---

### 062 - Barcode Scanner
**Screenshot:** `062-Barcode-Scanner.png`  
**Route:** `/barcode-scanner`  
**Purpose:** Parts identification via barcode

**Features:**
- Camera-based scanning
- USB scanner support
- Part lookup automation
- Stock adjustment
- Receiving goods
- Picking verification
- Label printing
- Batch scanning mode

---

### 063 - Internal Warehouse
**Screenshot:** `063-Internal-Warehouse.png`  
**Route:** `/internal-warehouse`  
**Purpose:** Warehouse location management

**Features:**
- Warehouse layout map
- Bin/shelf management
- Location assignment
- Stock transfer
- Pick list generation
- Put-away optimization
- Cycle counting
- Space utilization

---

### 064 - Interactive 3D Parts
**Screenshot:** `064-Interactive-3D-Parts.png`  
**Route:** `/3d-parts`  
**Purpose:** 3D parts catalog visualization

**Features:**
- 3D model viewer
- Exploded view diagrams
- Part selection hotspots
- Rotation/zoom controls
- Part information overlay
- Add to cart integration
- Compatible vehicles list

---

### 065 - Parts Marketplace
**Screenshot:** `065-Parts-Marketplace.png`  
**Route:** `/parts-marketplace`  
**Purpose:** B2B parts trading platform

**Features:**
- Marketplace listings
- Price comparison
- Seller ratings
- Order placement
- Delivery tracking
- Return management
- Bulk purchasing
- Negotiation tools

---

### 066 - Dynamic Pricing
**Screenshot:** `066-Dynamic-Pricing.png`  
**Route:** `/dynamic-pricing`  
**Purpose:** Automated price optimization

**Features:**
- Pricing rules engine
- Market-based adjustments
- Demand-based pricing
- Competitor monitoring
- Margin protection
- Volume discounts
- Customer-specific pricing
- Price change history

---

### 067 - Intelligent Price Optimizer
**Screenshot:** `067-Intelligent-Price-Optimizer.png`  
**Route:** `/intelligent-price-optimizer`  
**Purpose:** AI-driven pricing recommendations

**Features:**
- Price elasticity analysis
- Revenue optimization
- Profit maximization
- What-if scenarios
- A/B price testing
- Competitive positioning
- Seasonal adjustments

---

## 8. Suppliers & Purchasing (068-078)

### 068 - Suppliers
**Screenshot:** `068-Suppliers.png`  
**Route:** `/suppliers`  
**Purpose:** Supplier database management

**Features:**
- Supplier listing
- Contact information
- Product categories
- Payment terms
- Performance ratings
- Contract documents
- Order history
- Communication log

---

### 069 - Purchase Orders
**Screenshot:** `069-Purchase-Orders.png`  
**Route:** `/purchase-orders`  
**Purpose:** Purchase order creation and tracking

**Features:**
- PO creation wizard
- Supplier selection
- Line item entry
- Approval workflow
- Status tracking
- Receiving goods
- Invoice matching
- Print/email PO

---

### 070 - Vendor Supplier Portal
**Screenshot:** `070-Vendor-Supplier-Portal.png`  
**Route:** `/vendor-portal`  
**Purpose:** Supplier self-service portal

**Features:**
- Order acknowledgment
- Shipment updates
- Invoice submission
- Catalog updates
- Communication center
- Performance dashboard
- Document sharing

---

### 071 - Parts Network Dashboard
**Screenshot:** `071-Parts-Network-Dashboard.png`  
**Route:** `/parts-network`  
**Purpose:** B2B parts network overview

**Features:**
- Network statistics
- Active requests count
- Pending quotations
- Recent transactions
- Member directory link
- Quick request button
- Activity feed

---

### 072 - Parts Network Send Request
**Screenshot:** `072-Parts-Network-Send-Request.png`  
**Route:** `/parts-network/send-request`  
**Purpose:** Submit parts request to network

**Features:**
- Part specification form
- Quantity needed
- Urgency level
- Target members selection
- Price range preference
- Attachment upload
- Submit to network

---

### 073 - Parts Network My Requests
**Screenshot:** `073-Parts-Network-My-Requests.png`  
**Route:** `/parts-network/my-requests`  
**Purpose:** Track submitted requests

**Features:**
- Request listing
- Status filter
- Response count
- Best quote highlight
- Accept quotation
- Cancel request
- Resubmit option

---

### 074 - Parts Network Incoming Requests
**Screenshot:** `074-Parts-Network-Incoming-Requests.png`  
**Route:** `/parts-network/incoming-requests`  
**Purpose:** Respond to network requests

**Features:**
- Incoming request feed
- Filter by part type
- Availability check
- Submit quotation
- Decline with reason
- Request details view
- Sender information

---

### 075 - Parts Network Quotations
**Screenshot:** `075-Parts-Network-Quotations.png`  
**Route:** `/parts-network/quotations`  
**Purpose:** Manage sent/received quotations

**Features:**
- Quotation listing
- Sent vs received tabs
- Status tracking
- Price comparison
- Accept/reject actions
- Counter-offer option
- Expiration alerts

---

### 076 - Parts Network Members
**Screenshot:** `076-Parts-Network-Members.png`  
**Route:** `/parts-network/members`  
**Purpose:** Network member directory

**Features:**
- Member search
- Business type filter
- Location filter
- Rating display
- Specialization tags
- Contact options
- Profile view
- Favorite members

---

### 077 - Parts Network Orders
**Screenshot:** `077-Parts-Network-Orders.png`  
**Route:** `/parts-network/orders`  
**Purpose:** Network order management

**Features:**
- Order history
- Status tracking
- Shipment updates
- Delivery confirmation
- Issue reporting
- Invoice access
- Review submission

---

### 078 - Parts Supply Network
**Screenshot:** `078-Parts-Supply-Network.png`  
**Route:** `/parts-supply-network`  
**Purpose:** Enterprise supply chain overview

**Features:**
- Supply chain map
- Partner locations
- Inventory visibility
- Order flow tracking
- Performance metrics
- Risk indicators
- Optimization suggestions

---

## 9. Purchase Agent Portal (079-089)

### 079 - Purchase Agent Dashboard
**Screenshot:** `079-Purchase-Agent-Dashboard.png`  
**Route:** `/purchase-agent`  
**Purpose:** Purchasing agent main dashboard

**Features:**
- Pending tasks count
- Open POs value
- Supplier performance
- Budget utilization
- Quick actions
- Recent activity
- Alerts and notifications

---

### 080 - Purchase Agent Tasks
**Screenshot:** `080-Purchase-Agent-Tasks.png`  
**Route:** `/purchase-agent/tasks`  
**Purpose:** Purchasing task management

**Features:**
- Task queue
- Priority sorting
- Due date tracking
- Task assignment
- Status updates
- Notes and attachments
- Task completion

---

### 081 - Purchase Agent Quotations
**Screenshot:** `081-Purchase-Agent-Quotations.png`  
**Route:** `/purchase-agent/quotations`  
**Purpose:** RFQ and quotation management

**Features:**
- RFQ creation
- Quotation requests
- Response tracking
- Comparison matrix
- Best price highlight
- Negotiation notes
- Award supplier

---

### 082 - Purchase Agent Payments
**Screenshot:** `082-Purchase-Agent-Payments.png`  
**Route:** `/purchase-agent/payments`  
**Purpose:** Supplier payment processing

**Features:**
- Payment queue
- Invoice matching
- Payment scheduling
- Approval workflow
- Payment history
- Statement reconciliation
- Early payment discounts

---

### 083 - Purchase Agent Delivery
**Screenshot:** `083-Purchase-Agent-Delivery.png`  
**Route:** `/purchase-agent/delivery`  
**Purpose:** Delivery tracking and receiving

**Features:**
- Expected deliveries
- Shipment tracking
- Receiving goods
- Quantity verification
- Quality inspection
- Discrepancy reporting
- Delivery history

---

### 084 - Purchase Agent Orders
**Screenshot:** `084-Purchase-Agent-Orders.png`  
**Route:** `/purchase-agent/orders`  
**Purpose:** Purchase order portfolio

**Features:**
- Order listing
- Status filters
- Supplier filter
- Date range selection
- Order details
- Amendment history
- Export functionality

---

### 085 - Purchase Agent Suppliers
**Screenshot:** `085-Purchase-Agent-Suppliers.png`  
**Route:** `/purchase-agent/suppliers`  
**Purpose:** Supplier relationship management

**Features:**
- Supplier scorecard
- Performance history
- Contract status
- Compliance tracking
- Communication log
- Document repository
- Onboarding status

---

### 086 - Purchase Agent Inventory
**Screenshot:** `086-Purchase-Agent-Inventory.png`  
**Route:** `/purchase-agent/inventory`  
**Purpose:** Inventory overview for purchasing

**Features:**
- Stock levels
- Reorder requirements
- Lead time analysis
- Supplier stock visibility
- Demand forecast
- Safety stock status
- Cost analysis

---

### 087 - Purchase Agent Price Compare
**Screenshot:** `087-Purchase-Agent-Price-Compare.png`  
**Route:** `/purchase-agent/price-compare`  
**Purpose:** Multi-supplier price comparison

**Features:**
- Part search
- Supplier pricing grid
- Historical pricing
- Volume discounts
- Delivery terms
- Total cost calculation
- Best value highlight

---

### 088 - Purchase Agent Tracking
**Screenshot:** `088-Purchase-Agent-Tracking.png`  
**Route:** `/purchase-agent/tracking`  
**Purpose:** Order and shipment tracking

**Features:**
- Order status timeline
- Shipment map view
- Carrier tracking integration
- Delay alerts
- ETA updates
- Delivery confirmation
- Issue escalation

---

### 089 - Purchase Agent Reports
**Screenshot:** `089-Purchase-Agent-Reports.png`  
**Route:** `/purchase-agent/reports`  
**Purpose:** Purchasing analytics and reports

**Features:**
- Spend analysis
- Supplier performance
- Cost savings tracking
- Budget vs actual
- Order cycle time
- Category breakdown
- Trend analysis
- Export reports

---

## 10. Technician Portal (090-107)

### 090 - Technician Portal Dashboard
**Screenshot:** `090-Technician-Portal-Dashboard.png`  
**Route:** `/technician-portal`  
**Purpose:** Technician main workspace

**Features:**
- My jobs today
- Clock in/out button
- Earnings display
- Performance metrics
- Pending parts requests
- Quick job lookup
- Team chat access

---

### 091 - Technician Portal My Jobs
**Screenshot:** `091-Technician-Portal-My-Jobs.png`  
**Route:** `/technician-portal/my-jobs`  
**Purpose:** Assigned job cards list

**Features:**
- Job card listing
- Priority indicators
- Customer info
- Vehicle details
- Service description
- Time estimates
- Status update buttons
- Parts check

---

### 092 - Technician Portal Time Clock
**Screenshot:** `092-Technician-Portal-Time-Clock.png`  
**Route:** `/technician-portal/time-clock`  
**Purpose:** Time tracking and attendance

**Features:**
- Clock in button
- Clock out button
- Break tracking
- Overtime indicator
- Weekly hours summary
- Timesheet history
- Leave request link

---

### 093 - Technician Portal Parts
**Screenshot:** `093-Technician-Portal-Parts.png`  
**Route:** `/technician-portal/parts`  
**Purpose:** Parts request and lookup

**Features:**
- Parts search
- Availability check
- Request parts
- Request status tracking
- Bin location display
- Return parts
- Usage history

---

### 094 - Technician Portal Documentation
**Screenshot:** `094-Technician-Portal-Documentation.png`  
**Route:** `/technician-portal/documentation`  
**Purpose:** Technical documentation access

**Features:**
- Service manuals
- Wiring diagrams
- TSB (Technical Service Bulletins)
- Recall information
- Repair procedures
- Video tutorials
- Search functionality

---

### 095 - Technician Portal Profile
**Screenshot:** `095-Technician-Portal-Profile.png`  
**Route:** `/technician-portal/profile`  
**Purpose:** Technician personal profile

**Features:**
- Profile photo
- Contact information
- Certifications list
- Skills/specializations
- Performance stats
- Training history
- Badge collection

---

### 096 - Technician Portal Attendance
**Screenshot:** `096-Technician-Portal-Attendance.png`  
**Route:** `/technician-portal/attendance`  
**Purpose:** Attendance records view

**Features:**
- Monthly calendar view
- Attendance status per day
- Late arrival flags
- Leave days marked
- Overtime hours
- Total hours summary
- Export attendance report

---

### 097 - Technician Portal Guides
**Screenshot:** `097-Technician-Portal-Guides.png`  
**Route:** `/technician-portal/guides`  
**Purpose:** Step-by-step repair guides

**Features:**
- Guide categories
- Search guides
- Step-by-step instructions
- Embedded images
- Video clips
- Tool requirements
- Safety warnings
- Bookmark guides

---

### 098 - Technician Portal Software
**Screenshot:** `098-Technician-Portal-Software.png`  
**Route:** `/technician-portal/software`  
**Purpose:** Diagnostic software access

**Features:**
- Available software list
- License status
- Launch application
- Update status
- Usage logging
- Support links
- Training materials

---

### 099 - Technician Management
**Screenshot:** `099-Technician-Management.png`  
**Route:** `/technician-management`  
**Purpose:** Admin view of all technicians

**Features:**
- Technician roster
- Skill matrix
- Certification tracking
- Schedule overview
- Performance rankings
- Workload distribution
- Training assignments

---

### 100 - Technician Leaderboards
**Screenshot:** `100-Technician-Leaderboards.png`  
**Route:** `/technician-leaderboards`  
**Purpose:** Gamified performance rankings

**Features:**
- Top performers list
- Points/ranking system
- Achievement badges
- Weekly/monthly leaders
- Category leaders (efficiency, quality)
- Rewards information
- Personal rank display

---

### 101 - Technician Performance
**Screenshot:** `101-Technician-Performance.png`  
**Route:** `/technician-performance`  
**Purpose:** Detailed performance analytics

**Features:**
- Jobs completed chart
- Efficiency metrics
- Quality scores
- Customer feedback
- Trend analysis
- Comparison with team
- Goal tracking
- Areas for improvement

---

### 102 - Technician Mobile
**Screenshot:** `102-Technician-Mobile.png`  
**Route:** `/technician-mobile`  
**Purpose:** Mobile-optimized technician interface

**Features:**
- Touch-optimized UI
- Swipe gestures
- Large tap targets
- Offline capability
- Quick status updates
- Photo capture
- Voice notes

---

### 103 - Technician App Home
**Screenshot:** `103-Technician-App-Home.png`  
**Route:** `/technician-app`  
**Purpose:** Mobile app home screen

**Features:**
- Today's summary
- Quick clock in/out
- Current job display
- Navigation tiles
- Notifications badge
- Profile access

---

### 104 - Technician App Jobs
**Screenshot:** `104-Technician-App-Jobs.png`  
**Route:** `/technician-app/jobs`  
**Purpose:** Mobile job card management

**Features:**
- Job cards list
- Swipe to update status
- Tap for details
- Timer integration
- Parts request
- Photo documentation

---

### 105 - Technician App Clock
**Screenshot:** `105-Technician-App-Clock.png`  
**Route:** `/technician-app/clock`  
**Purpose:** Mobile time tracking

**Features:**
- Large clock in/out button
- Current status display
- Break button
- Today's hours
- Week summary
- GPS verification (optional)

---

### 106 - Technician App Lookup
**Screenshot:** `106-Technician-App-Lookup.png`  
**Route:** `/technician-app/lookup`  
**Purpose:** Mobile parts/info lookup

**Features:**
- Search bar
- Barcode scanner
- Part details display
- Stock availability
- Location info
- Technical specs

---

### 107 - Technician App Profile
**Screenshot:** `107-Technician-App-Profile.png`  
**Route:** `/technician-app/profile`  
**Purpose:** Mobile profile view

**Features:**
- Profile summary
- Performance stats
- Certifications
- Settings access
- Logout button

---

## 11. Client Portal (108-116)

### 108 - Client Portal Dashboard
**Screenshot:** `108-Client-Portal-Dashboard.png`  
**Route:** `/client`  
**Purpose:** Customer self-service home

**Features:**
- Vehicle status cards
- Upcoming appointments
- Recent invoices
- Service reminders
- Quick booking button
- Loyalty points display
- Messages/notifications

---

### 109 - Client Portal Vehicles
**Screenshot:** `109-Client-Portal-Vehicles.png`  
**Route:** `/client/vehicles`  
**Purpose:** Customer's vehicles list

**Features:**
- Vehicle cards
- Add vehicle button
- Vehicle details
- Service history link
- Health status
- Upcoming maintenance
- Document storage

---

### 110 - Client Portal Appointments
**Screenshot:** `110-Client-Portal-Appointments.png`  
**Route:** `/client/appointments`  
**Purpose:** Customer appointment management

**Features:**
- Book new appointment
- Upcoming appointments
- Past appointments
- Reschedule option
- Cancel appointment
- Appointment details
- Service location map

---

### 111 - Client Portal Invoices
**Screenshot:** `111-Client-Portal-Invoices.png`  
**Route:** `/client/invoices`  
**Purpose:** Customer invoice history

**Features:**
- Invoice listing
- Payment status
- Download PDF
- Pay now button
- Filter by date
- Payment history
- Statement request

---

### 112 - Client Portal Profile
**Screenshot:** `112-Client-Portal-Profile.png`  
**Route:** `/client/profile`  
**Purpose:** Customer profile management

**Features:**
- Personal information
- Contact details
- Password change
- Notification preferences
- Communication preferences
- Loyalty status
- Referral code

---

### 113 - Client Portal Service History
**Screenshot:** `113-Client-Portal-Service-History.png`  
**Route:** `/client/service-history`  
**Purpose:** Complete service records

**Features:**
- Service timeline
- Per-vehicle history
- Invoice links
- Warranty tracking
- Recommendations
- Download records
- Share with new garage

---

### 114 - Client Portal Live Tracking
**Screenshot:** `114-Client-Portal-Live-Tracking.png`  
**Route:** `/client/live-tracking`  
**Purpose:** Real-time service progress

**Features:**
- Current job status
- Progress percentage
- Step completion
- Photo updates
- Estimated completion
- Technician info
- Chat with garage

---

### 115 - Client Portal Reminders
**Screenshot:** `115-Client-Portal-Reminders.png`  
**Route:** `/client/reminders`  
**Purpose:** Service reminder preferences

**Features:**
- Reminder settings
- SMS/email preferences
- Advance notice period
- Service types to remind
- Opt-out options
- Reminder history

---

### 116 - Client Portal Review Chat
**Screenshot:** `116-Client-Portal-Review-Chat.png`  
**Route:** `/client/review-chat`  
**Purpose:** Customer feedback and chat

**Features:**
- Leave review form
- Star rating
- Comment field
- Photo attachment
- Chat history
- Support conversation
- Ticket status

---

## 12. Customer Mobile App (117-121)

### 117 - Customer App Home
**Screenshot:** `117-Customer-App-Home.png`  
**Route:** `/customer-app`  
**Purpose:** Mobile app landing screen

**Features:**
- Welcome message
- Quick book button
- Vehicle status summary
- Recent activity
- Promotions banner
- Navigation menu

---

### 118 - Customer App Booking
**Screenshot:** `118-Customer-App-Booking.png`  
**Route:** `/customer-app/booking`  
**Purpose:** Mobile appointment booking

**Features:**
- Service selection
- Vehicle selection
- Date picker
- Time slots
- Location selection
- Confirm booking
- Add to calendar

---

### 119 - Customer App Vehicles
**Screenshot:** `119-Customer-App-Vehicles.png`  
**Route:** `/customer-app/vehicles`  
**Purpose:** Mobile vehicle management

**Features:**
- Vehicle cards
- Add vehicle
- Quick health check
- Service history
- Documents
- Reminders

---

### 120 - Customer App Payments
**Screenshot:** `120-Customer-App-Payments.png`  
**Route:** `/customer-app/payments`  
**Purpose:** Mobile payment interface

**Features:**
- Outstanding invoices
- Pay now
- Saved payment methods
- Payment history
- Split payment
- Tip option

---

### 121 - Customer App Profile
**Screenshot:** `121-Customer-App-Profile.png`  
**Route:** `/customer-app/profile`  
**Purpose:** Mobile profile settings

**Features:**
- Profile photo
- Personal details
- Preferences
- Notifications
- Privacy settings
- Logout

---

## 13. General Portal (122-126)

### 122 - Portal Dashboard
**Screenshot:** `122-Portal-Dashboard.png`  
**Route:** `/portal/dashboard`  
**Purpose:** Generic portal dashboard

**Features:**
- Role-based widgets
- Key metrics
- Quick actions
- Recent activity
- Announcements

---

### 123 - Portal Appointments
**Screenshot:** `123-Portal-Appointments.png`  
**Route:** `/portal/appointments`  
**Purpose:** Portal appointment view

**Features:**
- Calendar integration
- Booking form
- History view
- Status tracking

---

### 124 - Portal Invoices
**Screenshot:** `124-Portal-Invoices.png`  
**Route:** `/portal/invoices`  
**Purpose:** Portal invoice access

**Features:**
- Invoice listing
- Download options
- Payment links
- Filtering

---

### 125 - Portal Vehicles
**Screenshot:** `125-Portal-Vehicles.png`  
**Route:** `/portal/vehicles`  
**Purpose:** Portal vehicle management

**Features:**
- Vehicle registry
- Details view
- History access

---

### 126 - Portal Communications
**Screenshot:** `126-Portal-Communications.png`  
**Route:** `/portal/communications`  
**Purpose:** Portal messaging center

**Features:**
- Message inbox
- Compose message
- Attachment support
- Read receipts

---

## 14. Reports & Analytics (127-134)

### 127 - Reports
**Screenshot:** `127-Reports.png`  
**Route:** `/reports`  
**Purpose:** Report library hub

**Features:**
- Report categories
- Saved reports
- Run report
- Schedule reports
- Export options
- Favorite reports

---

### 128 - Custom Reports
**Screenshot:** `128-Custom-Reports.png`  
**Route:** `/custom-reports`  
**Purpose:** Report builder tool

**Features:**
- Drag-drop report builder
- Data source selection
- Field picker
- Filter conditions
- Grouping options
- Visualization type
- Save template
- Share report

---

### 129 - Business Intelligence
**Screenshot:** `129-Business-Intelligence.png`  
**Route:** `/business-intelligence`  
**Purpose:** BI analytics overview

**Features:**
- KPI dashboard
- Trend analysis
- Drill-down capability
- Data exploration
- Export to Excel

---

### 130 - Business Intelligence Dashboard
**Screenshot:** `130-Business-Intelligence-Dashboard.png`  
**Route:** `/business-intelligence-dashboard`  
**Purpose:** Interactive BI dashboard

**Features:**
- Widget-based layout
- Real-time updates
- Interactive charts
- Filter controls
- Dashboard sharing
- Full-screen mode

---

### 131 - Business Heatmaps
**Screenshot:** `131-Business-Heatmaps.png`  
**Route:** `/business-heatmaps`  
**Purpose:** Geographic and temporal heatmaps

**Features:**
- Location-based heatmap
- Time-based heatmap
- Revenue distribution
- Customer density
- Service demand patterns

---

### 132 - Profit Analysis
**Screenshot:** `132-Profit-Analysis.png`  
**Route:** `/profit-analysis`  
**Purpose:** Profitability analytics

**Features:**
- Profit margin charts
- Cost breakdown
- Revenue by service
- Customer profitability
- Trend comparison
- Margin optimization

---

### 133 - KPI Dashboard
**Screenshot:** `133-KPI-Dashboard.png`  
**Route:** `/kpi-dashboard`  
**Purpose:** Key performance indicators

**Features:**
- KPI cards
- Target vs actual
- Traffic light indicators
- Trend arrows
- Drill-down links
- Alert thresholds

---

### 134 - Productivity Tracker
**Screenshot:** `134-Productivity-Tracker.png`  
**Route:** `/productivity-tracker`  
**Purpose:** Team productivity metrics

**Features:**
- Productivity scores
- Time utilization
- Efficiency metrics
- Team comparison
- Individual tracking
- Goal setting

---

## 15. HR & Team Management (135-144)

### 135 - HR Management
**Screenshot:** `135-HR-Management.png`  
**Route:** `/hr-management`  
**Purpose:** HR department hub

**Features:**
- Employee count
- Active positions
- Leave calendar
- Compliance status
- Quick links
- Announcements

---

### 136 - Staff Directory
**Screenshot:** `136-Staff-Directory.png`  
**Route:** `/staff-directory`  
**Purpose:** Employee database

**Features:**
- Employee listing
- Search/filter
- Department filter
- Profile cards
- Contact info
- Org chart link

---

### 137 - Staff Scheduling
**Screenshot:** `137-Staff-Scheduling.png`  
**Route:** `/staff-scheduling`  
**Purpose:** Work schedule management

**Features:**
- Weekly schedule grid
- Shift assignment
- Availability view
- Time-off display
- Conflict detection
- Publish schedule

---

### 138 - Staff Performance Review
**Screenshot:** `138-Staff-Performance-Review.png`  
**Route:** `/staff-performance-review`  
**Purpose:** Performance evaluation system

**Features:**
- Review cycles
- Evaluation forms
- Rating scales
- Goal tracking
- Feedback submission
- Review history

---

### 139 - Timesheet Management
**Screenshot:** `139-Timesheet-Management.png`  
**Route:** `/timesheet-management`  
**Purpose:** Time record administration

**Features:**
- Timesheet listing
- Approval workflow
- Edit corrections
- Export payroll
- Overtime tracking
- Policy compliance

---

### 140 - Timeclock Payroll
**Screenshot:** `140-Timeclock-Payroll.png`  
**Route:** `/timeclock-payroll`  
**Purpose:** Time clock and payroll integration

**Features:**
- Clock events log
- Pay period summary
- Hours calculation
- Overtime rules
- Holiday pay
- Export to payroll

---

### 141 - Payroll Management
**Screenshot:** `141-Payroll-Management.png`  
**Route:** `/payroll-management`  
**Purpose:** Payroll processing system

**Features:**
- Payroll runs
- Employee earnings
- Deductions
- Tax calculations
- Pay slips
- Direct deposit
- Year-end reports

---

### 142 - Leave Requests
**Screenshot:** `142-Leave-Requests.png`  
**Route:** `/leave-requests`  
**Purpose:** Time-off request management

**Features:**
- Request form
- Leave balance display
- Approval workflow
- Calendar view
- Team availability
- Policy rules

---

### 143 - Training LMS
**Screenshot:** `143-Training-LMS.png`  
**Route:** `/training-lms`  
**Purpose:** Learning management system

**Features:**
- Course catalog
- Enrollment management
- Progress tracking
- Certification tracking
- Quiz/assessment
- Completion certificates
- Training calendar

---

### 144 - Wearable Integration
**Screenshot:** `144-Wearable-Integration.png`  
**Route:** `/wearable-integration`  
**Purpose:** Smartwatch/wearable device integration

**Features:**
- Device pairing
- Notification push
- Job alerts
- Clock in/out
- Voice commands
- Health monitoring (optional)

---

## 16. Accounting & Finance (145-171)

### 145 - Chart of Accounts
**Screenshot:** `145-Chart-Of-Accounts.png`  
**Route:** `/chart-of-accounts`  
**Purpose:** Account structure management

**Features:**
- Account hierarchy
- Account types
- Add/edit accounts
- Deactivate accounts
- Sub-account creation
- Balance display

---

### 146 - General Ledger
**Screenshot:** `146-General-Ledger.png`  
**Route:** `/general-ledger`  
**Purpose:** Core accounting ledger

**Features:**
- Ledger entries
- Date range filter
- Account filter
- Debit/credit columns
- Running balance
- Export functionality

---

### 147 - Journal Entries
**Screenshot:** `147-Journal-Entries.png`  
**Route:** `/journal-entries`  
**Purpose:** Manual journal entry creation

**Features:**
- Entry form
- Multi-line entries
- Debit/credit balance check
- Attachment support
- Recurring entries
- Entry reversal

---

### 148 - Trial Balance
**Screenshot:** `148-Trial-Balance.png`  
**Route:** `/trial-balance`  
**Purpose:** Trial balance report

**Features:**
- Account listing
- Debit totals
- Credit totals
- Balance verification
- Date selection
- Export to Excel

---

### 149 - Balance Sheet
**Screenshot:** `149-Balance-Sheet.png`  
**Route:** `/balance-sheet`  
**Purpose:** Balance sheet report

**Features:**
- Assets section
- Liabilities section
- Equity section
- Comparative periods
- Drill-down to accounts
- PDF export

---

### 150 - Income Statement
**Screenshot:** `150-Income-Statement.png`  
**Route:** `/income-statement`  
**Purpose:** Profit and loss report

**Features:**
- Revenue breakdown
- Expense breakdown
- Net income calculation
- Period comparison
- Margin analysis
- Department breakdown

---

### 151 - Cash Flow Statement
**Screenshot:** `151-Cash-Flow-Statement.png`  
**Route:** `/cash-flow-statement`  
**Purpose:** Cash flow report

**Features:**
- Operating activities
- Investing activities
- Financing activities
- Net cash change
- Beginning/ending cash
- Trend analysis

---

### 152 - Accounts Receivable
**Screenshot:** `152-Accounts-Receivable.png`  
**Route:** `/accounts-receivable`  
**Purpose:** Customer receivables management

**Features:**
- Outstanding invoices
- Aging report
- Customer balances
- Collection tracking
- Payment reminders
- Write-off management

---

### 153 - Accounts Payable
**Screenshot:** `153-Accounts-Payable.png`  
**Route:** `/accounts-payable`  
**Purpose:** Supplier payables management

**Features:**
- Bills to pay
- Aging report
- Vendor balances
- Payment scheduling
- Check printing
- 1099 tracking

---

### 154 - Bank Account Management
**Screenshot:** `154-Bank-Account-Management.png`  
**Route:** `/bank-accounts`  
**Purpose:** Bank account administration

**Features:**
- Bank account listing
- Balance tracking
- Reconciliation
- Transaction import
- Transfer between accounts
- Check register

---

### 155 - Budget Management
**Screenshot:** `155-Budget-Management.png`  
**Route:** `/budget-management`  
**Purpose:** Budget planning and tracking

**Features:**
- Budget creation
- Department budgets
- Monthly allocation
- Actual vs budget
- Variance analysis
- Forecast updates

---

### 156 - Capital Management
**Screenshot:** `156-Capital-Management.png`  
**Route:** `/capital-management`  
**Purpose:** Capital expenditure tracking

**Features:**
- CapEx projects
- Budget allocation
- Approval workflow
- Depreciation planning
- ROI analysis
- Asset tracking

---

### 157 - Assets Management
**Screenshot:** `157-Assets-Management.png`  
**Route:** `/assets-management`  
**Purpose:** Fixed asset register

**Features:**
- Asset catalog
- Depreciation schedules
- Asset location
- Maintenance history
- Disposal tracking
- Asset valuation

---

### 158 - Liabilities Management
**Screenshot:** `158-Liabilities-Management.png`  
**Route:** `/liabilities-management`  
**Purpose:** Liability tracking

**Features:**
- Loan tracking
- Payment schedules
- Interest calculation
- Lease liabilities
- Accrued expenses
- Liability aging

---

### 159 - Equity Management
**Screenshot:** `159-Equity-Management.png`  
**Route:** `/equity-management`  
**Purpose:** Owner equity tracking

**Features:**
- Capital contributions
- Distributions
- Retained earnings
- Equity changes
- Partner shares
- Dividend tracking

---

### 160 - Retained Earnings
**Screenshot:** `160-Retained-Earnings.png`  
**Route:** `/retained-earnings`  
**Purpose:** Retained earnings statement

**Features:**
- Beginning balance
- Net income addition
- Dividend deductions
- Adjustments
- Ending balance
- Historical trend

---

### 161 - Cost Centers
**Screenshot:** `161-Cost-Centers.png`  
**Route:** `/cost-centers`  
**Purpose:** Cost center management

**Features:**
- Cost center hierarchy
- Budget allocation
- Expense tracking
- Cost allocation rules
- Performance metrics
- Reporting

---

### 162 - Loss Account
**Screenshot:** `162-Loss-Account.png`  
**Route:** `/loss-account`  
**Purpose:** Loss tracking and write-offs

**Features:**
- Loss categories
- Write-off entries
- Approval workflow
- Recovery tracking
- Loss analysis
- Tax implications

---

### 163 - Partners Current Account
**Screenshot:** `163-Partners-Current-Account.png`  
**Route:** `/partners-current-account`  
**Purpose:** Partner drawings and contributions

**Features:**
- Partner listing
- Contribution tracking
- Drawing records
- Balance display
- Interest calculation
- Statement generation

---

### 164 - Expense Tracking
**Screenshot:** `164-Expense-Tracking.png`  
**Route:** `/expense-tracking`  
**Purpose:** Expense categorization and tracking

**Features:**
- Expense entry
- Category assignment
- Receipt upload
- Approval workflow
- Reimbursement tracking
- Expense reports

---

### 165 - Expenses Management
**Screenshot:** `165-Expenses-Management.png`  
**Route:** `/expenses-management`  
**Purpose:** Comprehensive expense management

**Features:**
- Expense policies
- Budget limits
- Approval routing
- Audit trail
- Vendor payments
- Analytics

---

### 166 - Sales Management
**Screenshot:** `166-Sales-Management.png`  
**Route:** `/sales-management`  
**Purpose:** Sales tracking and management

**Features:**
- Sales dashboard
- Revenue tracking
- Customer sales
- Service sales
- Parts sales
- Sales targets

---

### 167 - Accounting Integration
**Screenshot:** `167-Accounting-Integration.png`  
**Route:** `/accounting-integration`  
**Purpose:** External accounting system integration

**Features:**
- QuickBooks sync
- Xero integration
- Data mapping
- Sync status
- Error handling
- Manual export

---

### 168 - Financial Settings
**Screenshot:** `168-Financial-Settings.png`  
**Route:** `/financial-settings`  
**Purpose:** Accounting configuration

**Features:**
- Fiscal year settings
- Currency settings
- Tax configuration
- Number formats
- Default accounts
- Closing procedures

---

### 169 - Warranty Management
**Screenshot:** `169-Warranty-Management.png`  
**Route:** `/warranty-management`  
**Purpose:** Warranty claim processing

**Features:**
- Warranty registration
- Claim submission
- Approval tracking
- Parts coverage
- Labor coverage
- Claim history

---

### 170 - Contract Management
**Screenshot:** `170-Contract-Management.png`  
**Route:** `/contract-management`  
**Purpose:** Service contract administration

**Features:**
- Contract templates
- Customer contracts
- SLA tracking
- Renewal management
- Coverage terms
- Revenue recognition

---

### 171 - Insurance Claims
**Screenshot:** `171-Insurance-Claims.png`  
**Route:** `/insurance-claims`  
**Purpose:** Insurance claim processing

**Features:**
- Claim initiation
- Documentation upload
- Adjuster communication
- Estimate submission
- Approval tracking
- Payment receipt

---

## 17. Marketing & Communications (172-181)

### 172 - Marketing Hub
**Screenshot:** `172-Marketing-Hub.png`  
**Route:** `/marketing-hub`  
**Purpose:** Marketing department dashboard

**Features:**
- Campaign overview
- Lead metrics
- Conversion rates
- Budget tracking
- Quick actions
- Performance summary

---

### 173 - Marketing Automation
**Screenshot:** `173-Marketing-Automation.png`  
**Route:** `/marketing-automation`  
**Purpose:** Automated marketing workflows

**Features:**
- Workflow builder
- Trigger configuration
- Action sequences
- Audience segmentation
- A/B testing
- Performance analytics

---

### 174 - Email Marketing Campaigns
**Screenshot:** `174-Email-Marketing-Campaigns.png`  
**Route:** `/email-marketing`  
**Purpose:** Email campaign management

**Features:**
- Campaign listing
- Email template editor
- Audience selection
- Send scheduling
- Open/click tracking
- Unsubscribe handling

---

### 175 - Social Media Integration
**Screenshot:** `175-Social-Media-Integration.png`  
**Route:** `/social-media`  
**Purpose:** Social media connection

**Features:**
- Platform connections
- Post scheduling
- Content calendar
- Engagement metrics
- Reply management
- Analytics

---

### 176 - Social Media Monitoring
**Screenshot:** `176-Social-Media-Monitoring.png`  
**Route:** `/social-monitoring`  
**Purpose:** Social mention tracking

**Features:**
- Mention alerts
- Sentiment analysis
- Competitor tracking
- Trend identification
- Response queue
- Report generation

---

### 177 - Google My Business
**Screenshot:** `177-Google-My-Business.png`  
**Route:** `/google-my-business`  
**Purpose:** GMB profile management

**Features:**
- Profile information
- Photo management
- Review monitoring
- Post publishing
- Insights analytics
- Q&A management

---

### 178 - Call Center
**Screenshot:** `178-Call-Center.png`  
**Route:** `/call-center`  
**Purpose:** Inbound/outbound call management

**Features:**
- Call queue display
- Agent status
- Call logging
- Script prompts
- Customer lookup
- Call recording
- Performance metrics

---

### 179 - Chat
**Screenshot:** `179-Chat.png`  
**Route:** `/chat`  
**Purpose:** Internal team chat

**Features:**
- Team channels
- Direct messages
- File sharing
- Emoji reactions
- Thread replies
- Search messages
- Notifications

---

### 180 - Support Chat Dashboard
**Screenshot:** `180-Support-Chat-Dashboard.png`  
**Route:** `/support-chat-dashboard`  
**Purpose:** Customer support chat management

**Features:**
- Active conversations
- Queue management
- Agent assignment
- Canned responses
- Transfer capability
- Chat history
- Satisfaction rating

---

### 181 - Notifications
**Screenshot:** `181-Notifications.png`  
**Route:** `/notifications`  
**Purpose:** System notification center

**Features:**
- Notification list
- Read/unread status
- Category filters
- Mark all read
- Notification settings
- Push notification config

---

## 18. Compliance & Safety (182-192)

### 182 - Compliance Management
**Screenshot:** `182-Compliance-Management.png`  
**Route:** `/compliance-management`  
**Purpose:** Regulatory compliance tracking

**Features:**
- Compliance checklist
- Deadline tracking
- Document storage
- Audit preparation
- Gap analysis
- Action items

---

### 183 - ZATCA Settings
**Screenshot:** `183-ZATCA-Settings.png`  
**Route:** `/zatca-settings`  
**Purpose:** Saudi e-invoicing compliance

**Features:**
- ZATCA registration
- Certificate upload
- API configuration
- Invoice format settings
- Compliance status
- Testing mode

---

### 184 - VAT Settings
**Screenshot:** `184-VAT-Settings.png`  
**Route:** `/vat-settings`  
**Purpose:** VAT configuration

**Features:**
- VAT registration number
- Tax rates configuration
- Tax categories
- Exemption settings
- Reporting periods
- VAT return generation

---

### 185 - Zakat Settings
**Screenshot:** `185-Zakat-Settings.png`  
**Route:** `/zakat-settings`  
**Purpose:** Zakat calculation configuration

**Features:**
- Zakat base configuration
- Asset inclusion rules
- Calculation method
- Payment tracking
- Certificate upload
- Annual reporting

---

### 186 - Safety Incidents
**Screenshot:** `186-Safety-Incidents.png`  
**Route:** `/safety-incidents`  
**Purpose:** Workplace safety tracking

**Features:**
- Incident reporting form
- Incident types
- Severity classification
- Investigation workflow
- Corrective actions
- Trend analysis

---

### 187 - Environmental Compliance
**Screenshot:** `187-Environmental-Compliance.png`  
**Route:** `/environmental-compliance`  
**Purpose:** Environmental regulation tracking

**Features:**
- Waste management
- Emissions tracking
- Permit management
- Inspection records
- Training compliance
- Reporting

---

### 188 - ISO Quality Management
**Screenshot:** `188-ISO-Quality-Management.png`  
**Route:** `/iso-quality`  
**Purpose:** ISO quality system management

**Features:**
- Document control
- Process documentation
- Audit scheduling
- Non-conformance tracking
- CAPA management
- Certification status

---

### 189 - Equipment Calibration
**Screenshot:** `189-Equipment-Calibration.png`  
**Route:** `/equipment-calibration`  
**Purpose:** Tool calibration tracking

**Features:**
- Equipment register
- Calibration schedule
- Due date alerts
- Calibration records
- Certificate storage
- Out-of-tolerance handling

---

### 190 - Franchise Management
**Screenshot:** `190-Franchise-Management.png`  
**Route:** `/franchise-management`  
**Purpose:** Franchise network administration

**Features:**
- Franchise listing
- Performance comparison
- Royalty tracking
- Brand compliance
- Support tickets
- Training coordination

---

### 191 - Globalization Layer
**Screenshot:** `191-Globalization-Layer.png`  
**Route:** `/globalization`  
**Purpose:** Multi-region configuration

**Features:**
- Region settings
- Currency configuration
- Language management
- Date/time formats
- Tax jurisdictions
- Compliance by region

---

### 192 - Multi-Location Dashboard
**Screenshot:** `192-Multi-Location-Dashboard.png`  
**Route:** `/multi-location-dashboard`  
**Purpose:** Multi-site performance overview

**Features:**
- Location comparison
- Revenue by location
- Occupancy rates
- Staff utilization
- Customer satisfaction
- Inventory status

---

## 19. AI & Automation (193-201)

### 193 - AI Automation
**Screenshot:** `193-AI-Automation.png`  
**Route:** `/ai-automation`  
**Purpose:** AI automation hub

**Features:**
- Automation rules
- AI model status
- Trigger configuration
- Action library
- Performance metrics
- Enable/disable controls

---

### 194 - AI Chatbot
**Screenshot:** `194-AI-Chatbot.png`  
**Route:** `/ai-chatbot`  
**Purpose:** Customer-facing AI chatbot

**Features:**
- Chat interface
- Conversation history
- Intent recognition
- Handoff to human
- Training data
- Analytics

---

### 195 - AI Chatbot Assistant
**Screenshot:** `195-AI-Chatbot-Assistant.png`  
**Route:** `/ai-chatbot-assistant`  
**Purpose:** Internal AI assistant

**Features:**
- Natural language queries
- Data retrieval
- Task assistance
- Report generation
- Knowledge base search
- Contextual help

---

### 196 - AI Service Advisor
**Screenshot:** `196-AI-Service-Advisor.png`  
**Route:** `/ai-service-advisor`  
**Purpose:** AI-powered service recommendations

**Features:**
- Vehicle analysis
- Service recommendations
- Priority ranking
- Cost estimation
- Customer explanation generator
- Upsell suggestions

---

### 197 - Voice Commands
**Screenshot:** `197-Voice-Commands.png`  
**Route:** `/voice-commands`  
**Purpose:** Voice control interface

**Features:**
- Voice activation
- Command library
- Speech recognition
- Natural language processing
- Action execution
- Feedback confirmation

---

### 198 - Voice Command Interface
**Screenshot:** `198-Voice-Command-Interface.png`  
**Route:** `/voice-command-interface`  
**Purpose:** Voice UI configuration

**Features:**
- Wake word settings
- Command customization
- Language selection
- Microphone settings
- Noise cancellation
- Training phrases

---

### 199 - Smart Damage Assessment
**Screenshot:** `199-Smart-Damage-Assessment.png`  
**Route:** `/smart-damage-assessment`  
**Purpose:** AI damage detection

**Features:**
- Photo upload
- AI damage detection
- Severity scoring
- Cost estimation
- Repair recommendations
- Report generation

---

### 200 - ML Fraud Detection
**Screenshot:** `200-ML-Fraud-Detection.png`  
**Route:** `/ml-fraud-detection`  
**Purpose:** Machine learning fraud prevention

**Features:**
- Transaction monitoring
- Anomaly detection
- Risk scoring
- Alert dashboard
- Investigation queue
- False positive feedback

---

### 201 - Neural Network Prediction
**Screenshot:** `201-Neural-Network-Prediction.png`  
**Route:** `/neural-network-prediction`  
**Purpose:** Deep learning predictions

**Features:**
- Model dashboard
- Prediction outputs
- Confidence scores
- Historical accuracy
- Model retraining
- Feature importance

---

## 20. Emerging Technologies (202-214)

### 202 - Emerging Technologies
**Screenshot:** `202-Emerging-Technologies.png`  
**Route:** `/emerging-technologies`  
**Purpose:** Technology innovation hub

**Features:**
- Technology overview
- Implementation status
- Pilot programs
- ROI tracking
- Roadmap view
- Documentation

---

### 203 - NextGen Technologies
**Screenshot:** `203-NextGen-Technologies.png`  
**Route:** `/nextgen-technologies`  
**Purpose:** Future technology preview

**Features:**
- Technology catalog
- Beta features
- Feedback collection
- Early adopter program
- Release timeline
- Integration plans

---

### 204 - IoT Dashboard
**Screenshot:** `204-IoT-Dashboard.png`  
**Route:** `/iot-dashboard`  
**Purpose:** IoT device monitoring

**Features:**
- Device listing
- Real-time status
- Sensor data display
- Alert configuration
- Device management
- Data export

---

### 205 - Edge Computing
**Screenshot:** `205-Edge-Computing.png`  
**Route:** `/edge-computing`  
**Purpose:** Edge device management

**Features:**
- Edge node status
- Processing metrics
- Data synchronization
- Offline capability
- Update management
- Performance monitoring

---

### 206 - Digital Twin Viewer
**Screenshot:** `206-Digital-Twin-Viewer.png`  
**Route:** `/digital-twin-viewer`  
**Purpose:** 3D digital twin visualization

**Features:**
- 3D garage model
- Real-time status overlay
- Asset tracking
- Simulation mode
- Historical playback
- Analytics integration

---

### 207 - Drone Inspection
**Screenshot:** `207-Drone-Inspection.png`  
**Route:** `/drone-inspection`  
**Purpose:** Aerial inspection management

**Features:**
- Drone fleet status
- Flight scheduling
- Image/video capture
- Inspection reports
- Compliance tracking
- Battery management

---

### 208 - AR Repair Guide
**Screenshot:** `208-AR-Repair-Guide.png`  
**Route:** `/ar-repair-guide`  
**Purpose:** Augmented reality repair assistance

**Features:**
- AR overlay viewer
- Step-by-step guides
- Parts identification
- Tool requirements
- Safety warnings
- Video tutorials

---

### 209 - AR Overlay
**Screenshot:** `209-AR-Overlay.png`  
**Route:** `/ar-overlay`  
**Purpose:** AR overlay management

**Features:**
- Overlay library
- Marker configuration
- Instruction creation
- 3D model import
- Session tracking
- Usage analytics

---

### 210 - VR Showroom
**Screenshot:** `210-VR-Showroom.png`  
**Route:** `/vr-showroom`  
**Purpose:** Virtual reality vehicle showcase

**Features:**
- VR environment
- Vehicle models
- Interactive features
- Customer presentation
- Configuration options
- VR device support

---

### 211 - Blockchain Service History
**Screenshot:** `211-Blockchain-Service-History.png`  
**Route:** `/blockchain-service-history`  
**Purpose:** Immutable service records

**Features:**
- Blockchain explorer
- Record verification
- History timeline
- Tamper detection
- Certificate generation
- Third-party verification

---

### 212 - Smart Contracts
**Screenshot:** `212-Smart-Contracts.png`  
**Route:** `/smart-contracts`  
**Purpose:** Automated contract execution

**Features:**
- Contract templates
- Condition configuration
- Automatic triggers
- Execution log
- Dispute resolution
- Integration status

---

### 213 - Quantum Computing
**Screenshot:** `213-Quantum-Computing.png`  
**Route:** `/quantum-computing-optimization`  
**Purpose:** Quantum optimization tools

**Features:**
- Optimization problems
- Quantum algorithm selection
- Classical comparison
- Result visualization
- Performance metrics
- Future roadmap

---

### 214 - Sustainable Energy Monitoring
**Screenshot:** `214-Sustainable-Energy-Monitoring.png`  
**Route:** `/sustainable-energy-monitoring`  
**Purpose:** Energy consumption tracking

**Features:**
- Energy dashboard
- Consumption trends
- Solar panel output
- Carbon footprint
- Cost savings
- Sustainability goals

---

## 21. Hardware & Devices (215-218)

### 215 - Digital Signage
**Screenshot:** `215-Digital-Signage.png`  
**Route:** `/digital-signage`  
**Purpose:** Display screen management

**Features:**
- Screen listing
- Content scheduler
- Playlist management
- Template editor
- Remote control
- Status monitoring

---

### 216 - Kiosk Check-In
**Screenshot:** `216-Kiosk-Check-In.png`  
**Route:** `/kiosk-checkin`  
**Purpose:** Self-service kiosk configuration

**Features:**
- Kiosk settings
- Check-in workflow
- Custom branding
- Language options
- Printer integration
- Usage analytics

---

### 217 - Security Cameras
**Screenshot:** `217-Security-Cameras.png`  
**Route:** `/security-cameras`  
**Purpose:** CCTV management

**Features:**
- Camera grid view
- Live feeds
- Recording playback
- Motion detection
- Alert configuration
- Storage management

---

### 218 - Mobile Device Management
**Screenshot:** `218-Mobile-Device-Management.png`  
**Route:** `/mobile-device-management`  
**Purpose:** Mobile fleet management

**Features:**
- Device inventory
- App deployment
- Policy enforcement
- Remote wipe
- Location tracking
- Compliance status

---

## 22. Documents & Data (219-223)

### 219 - Document Management
**Screenshot:** `219-Document-Management.png`  
**Route:** `/document-management`  
**Purpose:** Document storage and organization

**Features:**
- Folder structure
- File upload
- Version control
- Access permissions
- Search functionality
- Document preview

---

### 220 - Document OCR
**Screenshot:** `220-Document-OCR.png`  
**Route:** `/document-ocr`  
**Purpose:** Document scanning and text extraction

**Features:**
- Scan/upload interface
- OCR processing
- Data extraction
- Field mapping
- Verification queue
- Export options

---

### 221 - Data Import Export
**Screenshot:** `221-Data-Import-Export.png`  
**Route:** `/data-import-export`  
**Purpose:** Bulk data operations

**Features:**
- Import wizard
- Export builder
- Format selection (CSV, Excel, JSON)
- Field mapping
- Validation rules
- Schedule exports

---

### 222 - Data Backup
**Screenshot:** `222-Data-Backup.png`  
**Route:** `/data-backup`  
**Purpose:** Backup configuration and management

**Features:**
- Backup schedule
- Backup history
- Restore options
- Storage location
- Encryption settings
- Retention policy

---

### 223 - Knowledge Base
**Screenshot:** `223-Knowledge-Base.png`  
**Route:** `/knowledge-base`  
**Purpose:** Internal knowledge repository

**Features:**
- Article categories
- Search functionality
- Article editor
- Version history
- Access controls
- Related articles
- User ratings

---

## 23. System & Settings (224-235)

### 224 - User Profile
**Screenshot:** `224-User-Profile.png`  
**Route:** `/profile`  
**Purpose:** Personal profile management

**Features:**
- Profile photo
- Personal information
- Password change
- 2FA settings
- Session management
- Activity log

---

### 225 - System Settings
**Screenshot:** `225-System-Settings.png`  
**Route:** `/settings`  
**Purpose:** Global system configuration

**Features:**
- General settings
- Business information
- Localization
- Email settings
- SMS settings
- System maintenance

---

### 226 - User Settings
**Screenshot:** `226-User-Settings.png`  
**Route:** `/user-settings`  
**Purpose:** User preference management

**Features:**
- Display preferences
- Notification settings
- Language selection
- Theme preference
- Dashboard layout
- Keyboard shortcuts

---

### 227 - Integrations
**Screenshot:** `227-Integrations.png`  
**Route:** `/integrations`  
**Purpose:** Third-party integration management

**Features:**
- Available integrations
- Connected services
- API key management
- Webhook configuration
- Sync status
- Error logs

---

### 228 - Security Settings
**Screenshot:** `228-Security-Settings.png`  
**Route:** `/security`  
**Purpose:** Security configuration

**Features:**
- Password policy
- 2FA enforcement
- Session timeout
- IP restrictions
- Audit logging
- Access logs

---

### 229 - Role Management
**Screenshot:** `229-Role-Management.png`  
**Route:** `/role-management`  
**Purpose:** User role configuration

**Features:**
- Role listing
- Permission matrix
- Create/edit roles
- Role assignment
- Role hierarchy
- Access templates

---

### 230 - Tasks
**Screenshot:** `230-Tasks.png`  
**Route:** `/tasks`  
**Purpose:** Personal task management

**Features:**
- Task listing
- Create task
- Due date tracking
- Priority setting
- Status updates
- Task completion

---

### 231 - Task Management
**Screenshot:** `231-Task-Management.png`  
**Route:** `/task-management`  
**Purpose:** Team task administration

**Features:**
- All tasks view
- Assignment management
- Filter by assignee
- Kanban board
- Gantt chart
- Task templates

---

### 232 - Tools
**Screenshot:** `232-Tools.png`  
**Route:** `/tools`  
**Purpose:** Utility tools collection

**Features:**
- Calculator
- Unit converter
- Torque specifications
- Fluid capacities
- Color code lookup
- Wire gauge reference

---

### 233 - Dashboard Widgets
**Screenshot:** `233-Dashboard-Widgets.png`  
**Route:** `/dashboard-widgets`  
**Purpose:** Dashboard customization

**Features:**
- Widget library
- Drag-drop layout
- Widget settings
- Data source selection
- Refresh intervals
- Save layout

---

### 234 - SMS Integration
**Screenshot:** `234-SMS-Integration.png`  
**Route:** `/sms-integration`  
**Purpose:** SMS service configuration

**Features:**
- Twilio integration
- Phone number management
- Message templates
- Send test SMS
- Delivery reports
- Usage statistics

---

### 235 - Sales Guide
**Screenshot:** `235-Sales-Guide.png`  
**Route:** `/sales-guide`  
**Purpose:** Sales process guidance

**Features:**
- Sales scripts
- Product information
- Pricing guides
- Upsell suggestions
- Objection handling
- Closing techniques

---

## Appendix: Page Count Summary

| Category | Page Range | Count |
|----------|------------|-------|
| Dashboard & Overview | 001-003 | 3 |
| Customer Management | 004-011 | 8 |
| Appointments & Scheduling | 012-018 | 7 |
| Vehicle Management | 019-036 | 18 |
| Diagnostics & Maintenance | 037-040 | 4 |
| Service Operations | 041-053 | 13 |
| Inventory & Parts | 054-067 | 14 |
| Suppliers & Purchasing | 068-078 | 11 |
| Purchase Agent Portal | 079-089 | 11 |
| Technician Portal | 090-107 | 18 |
| Client Portal | 108-116 | 9 |
| Customer Mobile App | 117-121 | 5 |
| General Portal | 122-126 | 5 |
| Reports & Analytics | 127-134 | 8 |
| HR & Team Management | 135-144 | 10 |
| Accounting & Finance | 145-171 | 27 |
| Marketing & Communications | 172-181 | 10 |
| Compliance & Safety | 182-192 | 11 |
| AI & Automation | 193-201 | 9 |
| Emerging Technologies | 202-214 | 13 |
| Hardware & Devices | 215-218 | 4 |
| Documents & Data | 219-223 | 5 |
| System & Settings | 224-235 | 12 |
| **TOTAL** | | **235** |

---

*This document provides comprehensive descriptions of all 235 pages in the SALIS AUTO platform. Each page entry includes its screenshot filename, route path, purpose, and detailed feature list.*
