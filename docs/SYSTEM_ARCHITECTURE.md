# SALIS AUTO - System Architecture & User Scenarios

---

## 1. PLATFORM OVERVIEW

SALIS AUTO is a **multi-sided automotive platform** serving two distinct visitor segments before they become users:

```
                    +---------------------------+
                    |    SALISAUTO.COM / APP     |
                    |   (Public Landing Page)    |
                    +---------------------------+
                           /            \
                          /              \
              +-----------+          +------------+
              |  SERVICE   |          |   AUTO     |
              |  SEEKERS   |          |  BUSINESS  |
              | (B2C/B2B)  |          |   OWNERS   |
              +-----------+          +------------+
              |                      |
              | Individuals or       | Auto shops, garages,
              | companies looking    | fleet operators,
              | for auto services    | dealers looking for
              | (repair, towing,     | management solutions
              | maintenance, etc.)   | (GMS, ERP, ecommerce)
              |                      |
              v                      v
        +----------+          +------------+
        | CUSTOMER |          |   ADMIN    |
        | PORTAL   |          |  DASHBOARD |
        +----------+          +------------+
```

---

## 2. VISITOR TYPES (PRE-SIGNUP)

### Visitor Type A: SERVICE SEEKERS
**Who**: Individuals or companies looking for auto services
**What they seek**: Repair shops, maintenance, towing, spare parts, fleet services
**Journey**:
```
Visit salisauto.com/app
  -> Browse service providers by type/location/rating
  -> View provider profiles, reviews, pricing
  -> Sign up as CUSTOMER
  -> Book appointment / Request service
  -> Track service / Pay invoice / Leave review
```

### Visitor Type B: AUTO BUSINESS OWNERS
**Who**: Garage owners, workshop managers, fleet operators, dealers, parts sellers
**What they seek**: Management solutions for their business
**Solutions available**:
- Garage Management System (GMS)
- Spare Parts E-Commerce
- Fleet Management
- Insurance Management
- Rental Management
- Towing Services Management

**Journey**:
```
Visit salisauto.com/app
  -> Browse available solutions (GMS, Fleet, Parts, etc.)
  -> View features, pricing plans, demos
  -> Sign up as BUSINESS (choose plan: STARTER/PRO/ENTERPRISE)
  -> Onboard garage/workshop
  -> Add staff (technicians, advisors, accountants)
  -> Start operations
```

---

## 3. HIGH-LEVEL SYSTEM ARCHITECTURE

```
+=========================================================================+
|                        SALISAUTO PLATFORM                               |
+=========================================================================+
|                                                                         |
|  +-------------------+    +-------------------+    +-----------------+  |
|  | PUBLIC WEBSITE     |    | MOBILE APP (PWA)  |    | API GATEWAY    |  |
|  | (Landing, Browse,  |    | (iOS/Android)     |    | (REST + WS)   |  |
|  |  Search, Info)     |    |                   |    |               |  |
|  +--------+----------+    +--------+----------+    +-------+-------+  |
|           |                         |                       |          |
|           +------------+------------+-----------+-----------+          |
|                        |                        |                      |
|  +=====================+========================+===================+  |
|  |                    APPLICATION LAYER                              |  |
|  |                                                                   |  |
|  |  +-------------+  +----------------+  +---------------------+    |  |
|  |  | AUTH SERVICE |  | ROLE ROUTER    |  | SUBSCRIPTION GATE   |    |  |
|  |  | (Passport)   |  | (6 Roles)      |  | (Starter/Pro/Ent)   |    |  |
|  |  +-------------+  +----------------+  +---------------------+    |  |
|  |                                                                   |  |
|  |  +-----------+  +----------+  +----------+  +-----------+       |  |
|  |  |  ADMIN    |  |TECHNICIAN|  | CUSTOMER |  | PURCHASE  |       |  |
|  |  | DASHBOARD |  |  PORTAL  |  |  PORTAL  |  |  AGENT    |       |  |
|  |  | (156 mod) |  | (Desktop |  | (Desktop |  |  PORTAL   |       |  |
|  |  |           |  |  +Mobile)|  |  +Mobile)|  |           |       |  |
|  |  +-----------+  +----------+  +----------+  +-----------+       |  |
|  |                                                                   |  |
|  |  +------------------+  +------------------+  +--------------+    |  |
|  |  | CLIENT PORTAL    |  | PARTS NETWORK    |  | PUBLIC       |    |  |
|  |  | (B2B Accounts)   |  | (B2B Marketplace)|  | TRACKING     |    |  |
|  |  +------------------+  +------------------+  +--------------+    |  |
|  +===================================================================+  |
|                        |                                               |
|  +=====================+===========================================+   |
|  |                   SERVICE LAYER                                 |   |
|  |                                                                 |   |
|  |  +----------+ +----------+ +----------+ +-----------+          |   |
|  |  |   AI     | | BILLING  | |INVENTORY | |    HR     |          |   |
|  |  | Services | | & Finance| | & Parts  | | & Payroll |          |   |
|  |  +----------+ +----------+ +----------+ +-----------+          |   |
|  |                                                                 |   |
|  |  +----------+ +----------+ +----------+ +-----------+          |   |
|  |  |COMPLIANCE| |MARKETING | |  COMMS   | | ANALYTICS |          |   |
|  |  |& Safety  | |& CRM     | |(SMS/Email| | & Reports |          |   |
|  |  |          | |          | | Chat/WS) | |           |          |   |
|  |  +----------+ +----------+ +----------+ +-----------+          |   |
|  |                                                                 |   |
|  |  +----------+ +----------+ +----------+ +-----------+          |   |
|  |  |  IoT &   | |BLOCKCHAIN| |  DRONE   | |   AR/VR   |          |   |
|  |  |TELEMATICS| |& SmartCon| |INSPECTION| | REPAIR    |          |   |
|  |  +----------+ +----------+ +----------+ +-----------+          |   |
|  +=================================================================+   |
|                        |                                               |
|  +=====================+===========================================+   |
|  |                 INFRASTRUCTURE LAYER                            |   |
|  |                                                                 |   |
|  |  +------------+  +------------+  +-------------+               |   |
|  |  | PostgreSQL |  | WebSocket  |  | File Storage|               |   |
|  |  | (230+ tbl) |  | (Real-time)|  | (Media/Docs)|               |   |
|  |  +------------+  +------------+  +-------------+               |   |
|  |                                                                 |   |
|  |  +------------+  +------------+  +-------------+               |   |
|  |  | Redis/Cache|  |  Stripe    |  |  Twilio     |               |   |
|  |  | (Sessions) |  | (Payments) |  | (SMS/Voice) |               |   |
|  |  +------------+  +------------+  +-------------+               |   |
|  |                                                                 |   |
|  |  +------------+  +------------+  +-------------+               |   |
|  |  |  OpenAI    |  |  Google    |  | ZATCA/Saudi |               |   |
|  |  |  (AI/ML)   |  | (Maps/Cal) |  | (Compliance)|               |   |
|  |  +------------+  +------------+  +-------------+               |   |
|  +=================================================================+   |
+=========================================================================+
```

---

## 4. TECHNOLOGY STACK

```
+-------------------+-------------------------------------------+
|     LAYER         |           TECHNOLOGY                      |
+-------------------+-------------------------------------------+
| Frontend          | React 18 + TypeScript + Vite              |
| UI Framework      | Tailwind CSS + shadcn/ui + Radix UI       |
| State Management  | TanStack Query (React Query)              |
| Routing           | Wouter (lightweight)                      |
| Forms             | React Hook Form + Zod validation          |
| Animations        | Framer Motion                             |
| Backend           | Express.js + TypeScript                   |
| ORM               | Drizzle ORM                               |
| Database          | PostgreSQL (Neon Serverless)               |
| Auth              | Passport.js (Local Strategy)              |
| Sessions          | express-session + connect-pg-simple        |
| Real-time         | WebSocket (ws)                            |
| Payments          | Stripe + PayPal                           |
| SMS/Voice         | Twilio                                    |
| AI                | OpenAI GPT                                |
| Email             | Nodemailer + Gmail API                    |
| Calendar          | Google Calendar API                        |
| PDF Export        | jsPDF + jspdf-autotable                   |
| i18n              | i18next (English + Arabic)                |
| Build             | esbuild (server) + Vite (client)          |
| Testing           | Vitest + Testing Library                  |
+-------------------+-------------------------------------------+
```

---

## 5. DATABASE ARCHITECTURE

```
+=========================================================================+
|                    DATABASE: 230+ TABLES                                |
+=========================================================================+
|                                                                         |
|  CORE IDENTITY              OPERATIONS              FINANCIAL           |
|  +--------------+           +--------------+        +--------------+    |
|  | users        |           | jobCards      |        | invoices     |    |
|  | roles        |           | appointments  |        | payments     |    |
|  | garages      |           | vehicles      |        | estimates    |    |
|  | branches     |           | spareParts    |        | expenses     |    |
|  | saasPlans    |           | suppliers     |        | payroll      |    |
|  | sessions     |           | purchaseOrders|        | chartOfAccts |    |
|  | customerProf.|           | serviceTempl. |        | generalLedger|    |
|  | technicianPr.|           | fleetVehicles |        | journalEntry |    |
|  +--------------+           +--------------+        +--------------+    |
|                                                                         |
|  COMMUNICATION              COMPLIANCE              AI & EMERGING       |
|  +--------------+           +--------------+        +--------------+    |
|  | chatMessages |           | saudiTaxComp.|        | aiChatConv.  |    |
|  | emailCampaign|           | safetyIncid. |        | iotSensors   |    |
|  | callSessions |           | warranties   |        | droneFleets  |    |
|  | socialPosts  |           | insuranceCl. |        | digitalTwins |    |
|  | gmbReviews   |           | equipCalibr. |        | blockchainRec|    |
|  | videoConsult.|           | gdprRequests |        | arRepairGuide|    |
|  +--------------+           +--------------+        +--------------+    |
|                                                                         |
|  ANALYTICS                  MARKETPLACE             HR & WORKFORCE      |
|  +--------------+           +--------------+        +--------------+    |
|  | customReports|           | partsNetwork |        | leaveRequests|    |
|  | dashWidgets  |           | vendorCatalog|        | timesheets   |    |
|  | heatmaps     |           | marketplaceCn|        | trainingMod. |    |
|  | profitAnalys.|           | partsQuotati.|        | performanceR.|    |
|  | demandForec. |           | networkOrders|        | shiftAssign. |    |
|  +--------------+           +--------------+        +--------------+    |
+=========================================================================+
```

---

## 6. AUTHENTICATION & AUTHORIZATION FLOW

```
                    +------------------+
                    |   VISITOR        |
                    | (No Account)     |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  /login or       |
                    |  /register       |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Passport.js     |
                    |  LocalStrategy   |
                    |  bcrypt verify   |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Session Created |
                    |  (PostgreSQL)    |
                    |  TTL: 7 days     |
                    +--------+---------+
                             |
              +--------------+----------------+
              |              |                |
     +--------v---+  +------v------+  +------v--------+
     |ROLE CHECK  |  |SUBSCRIPTION |  |BRANCH/GARAGE  |
     |            |  |PLAN CHECK   |  |ASSIGNMENT     |
     +--------+---+  +------+------+  +------+--------+
              |              |                |
              +--------------+----------------+
                             |
         +-------------------+--------------------+
         |         |         |         |          |
    +----v--+ +---v----+ +--v-----+ +-v------+ +-v--------+
    |ADMIN  | |MANAGER | |ADVISOR | |TECHNIC.| |ACCOUNTANT|
    |Full   | |Ops +   | |Customer| |Jobs +  | |Finance   |
    |Access | |Reports | |Facing  | |Parts   | |Only      |
    +-------+ +--------+ +--------+ +--------+ +----------+

    PLATFORM_ADMIN: Super admin across all garages (SaaS level)
```

### Subscription Plans Gate Features:

```
+------------------+------------------+-------------------+
|    STARTER       |       PRO        |    ENTERPRISE     |
+------------------+------------------+-------------------+
| Dashboard        | + AI Scheduling  | + IoT Dashboard   |
| Customers        | + Smart Assign.  | + Digital Twin    |
| Appointments     | + Pred. Maint.   | + Drone Inspect.  |
| Vehicles         | + Customer LTV   | + AR Repair       |
| Job Cards        | + Marketing Hub  | + Blockchain      |
| Invoices         | + Email Campaign | + Smart Contracts  |
| Payments         | + Call Center    | + Edge Computing  |
| Estimates        | + Advanced Rpts  | + Quantum Encrypt |
| Inventory        | + Parts Network  | + Franchise Mgmt  |
| Basic Reports    | + Vendor Portal  | + Multi-Location  |
| Settings         | + HR Management  | + Globalization   |
|                  | + Compliance     | + Full Accounting |
+------------------+------------------+-------------------+
```

---

## 7. PORTAL ARCHITECTURE

```
+=========================================================================+
|                       6 USER PORTALS                                    |
+=========================================================================+
|                                                                         |
|  1. ADMIN DASHBOARD (Layout.tsx)                                        |
|     +-----------------------------------------------------------+      |
|     | Sidebar | Main Content Area                                |      |
|     | Nav     | 156 Modules across 8 phases                      |      |
|     | (role   | - Operations, Finance, HR, Compliance            |      |
|     |  based) | - AI, IoT, Blockchain, AR/VR                     |      |
|     +-----------------------------------------------------------+      |
|     Users: ADMIN, MANAGER, ADVISOR, ACCOUNTANT, HR                      |
|                                                                         |
|  2. TECHNICIAN PORTAL (TechnicianLayout.tsx)                            |
|     +-----------------------------------------------------------+      |
|     | Top Nav | Dashboard | My Jobs | Time Clock | Parts |       |      |
|     |         | Profile   | Docs    | Attendance | Guides|       |      |
|     +-----------------------------------------------------------+      |
|     Users: TECHNICIAN role                                              |
|                                                                         |
|  3. CUSTOMER PORTAL (CustomerPortalLayout.tsx)                          |
|     +-----------------------------------------------------------+      |
|     | Top Nav | Dashboard | Vehicles | Appointments | Invoices | |      |
|     |         | Profile   | History  | Live Track   | Reviews  | |      |
|     +-----------------------------------------------------------+      |
|     Users: Registered customers (B2C individuals)                       |
|                                                                         |
|  4. CLIENT PORTAL (ClientLayout.tsx)                                    |
|     +-----------------------------------------------------------+      |
|     | Side    | Dashboard | Vehicles | Appointments | Invoices | |      |
|     | Nav     | Profile   | History  | Tracking     | Comms    | |      |
|     +-----------------------------------------------------------+      |
|     Users: Business accounts (B2B corporate/fleet)                      |
|                                                                         |
|  5. PURCHASE AGENT PORTAL (PurchaseAgentLayout.tsx)                     |
|     +-----------------------------------------------------------+      |
|     | Top Nav | Dashboard | Orders | Suppliers | Inventory |     |      |
|     |         | Quotes    | Prices | Tracking  | Reports   |     |      |
|     +-----------------------------------------------------------+      |
|     Users: Procurement staff                                            |
|                                                                         |
|  6. MOBILE APP (CustomerMobileLayout / TechnicianMobileLayout)          |
|     +-----------------------------------------------------------+      |
|     | Bottom Tab Nav                                              |      |
|     | Customer: Home | Booking | Vehicles | Payments | Profile   |      |
|     | Technician: Home | Jobs | Clock | Lookup | Profile         |      |
|     +-----------------------------------------------------------+      |
|     Users: Mobile users (PWA installable)                               |
+=========================================================================+
```

---

## 8. COMPLETE USER SCENARIOS

### PHASE 0: PUBLIC VISITORS (No Account)

#### Scenario 0.1: Service Seeker Discovers Platform
```
Actor: Individual car owner
Goal:  Find a reliable auto service provider

1. Visits salisauto.com (or downloads mobile app)
2. Browses landing page with platform features
3. Searches for service providers by:
   - Location / proximity
   - Service type (repair, maintenance, towing, body work)
   - Ratings and reviews
   - Price range
4. Views provider profile:
   - Services offered
   - Pricing
   - Customer reviews
   - Operating hours
   - Photos / certifications
5. Decides to book -> Redirected to sign up
6. Creates CUSTOMER account
7. Books first appointment
```

#### Scenario 0.2: Auto Business Owner Explores Solutions
```
Actor: Garage owner / Workshop manager
Goal:  Find a management system for their business

1. Visits salisauto.com
2. Browses available solutions:
   - Garage Management System (GMS)
   - Spare Parts E-Commerce
   - Fleet Management
   - Insurance Management
   - Rental Management
   - Towing Services
3. Views feature comparisons
4. Compares subscription plans:
   - STARTER (basic operations)
   - PRO (AI + advanced features)
   - ENTERPRISE (full platform)
5. Watches demo / requests trial
6. Decides to subscribe -> Redirected to sign up
7. Creates BUSINESS account (ADMIN role)
8. Onboards garage: name, address, branches
9. Invites staff members
10. Begins operations
```

#### Scenario 0.3: Public Service Tracking
```
Actor: Anyone with a tracking token
Goal:  Track a vehicle service without logging in

1. Receives tracking link via SMS/email
2. Opens /track/:token
3. Views real-time service status:
   - Current stage (Received, Diagnosing, In Progress, QC, Ready)
   - Timeline of events
   - Estimated completion time
4. No login required
```

---

### PHASE 1: CUSTOMER SCENARIOS (Service Seekers - B2C)

#### Scenario 1.1: Book a Service Appointment
```
Actor: Registered customer
Portal: Customer Portal or Mobile App

1. Logs into Customer Portal
2. Selects vehicle (or adds new vehicle with VIN)
3. Clicks "Book Appointment"
4. Selects service type (Oil Change, Brake Service, etc.)
5. Chooses preferred date/time from available slots
6. Adds notes about issues
7. Receives confirmation via SMS + Email
8. Gets reminder 24h before appointment
9. Arrives at garage -> Kiosk check-in or front desk
```

#### Scenario 1.2: Track Live Service Progress
```
Actor: Customer with active service
Portal: Customer Portal -> Live Tracking

1. Logs in or uses tracking link
2. Views live service dashboard:
   - Current status (Received -> Diagnosing -> Repairing -> QC -> Ready)
   - Assigned technician info
   - Photos/videos from inspection
   - Parts being used
   - Estimated completion time
3. Receives real-time notifications on status changes
4. Gets notified when vehicle is ready for pickup
```

#### Scenario 1.3: Review and Pay Invoice
```
Actor: Customer after service completion
Portal: Customer Portal -> Invoices

1. Receives notification: "Your invoice is ready"
2. Opens invoice in portal
3. Reviews line items:
   - Labor charges
   - Parts used
   - VAT (15%)
   - Discounts applied
4. Chooses payment method:
   - Stripe (credit/debit card)
   - PayPal
   - Bank transfer
   - Cash at pickup
5. Completes payment
6. Receives e-invoice (ZATCA compliant with QR code)
7. Downloads PDF receipt
```

#### Scenario 1.4: Submit Feedback and Review
```
Actor: Customer after service
Portal: Customer Portal -> Reviews

1. Receives feedback request via SMS/email
2. Opens review form
3. Rates service (1-5 stars)
4. Rates technician performance
5. Writes detailed feedback
6. Submits review
7. Review appears on provider profile
8. Earns loyalty points for review
```

#### Scenario 1.5: Use Loyalty Program
```
Actor: Returning customer
Portal: Customer Portal -> Loyalty

1. Views loyalty dashboard:
   - Points balance
   - Tier status (Bronze/Silver/Gold/Platinum)
   - Available rewards
2. Earns points from:
   - Service bookings
   - Payments
   - Reviews
   - Referrals
3. Redeems points for:
   - Discounts on next service
   - Free oil change
   - Priority scheduling
```

#### Scenario 1.6: Refer a Friend
```
Actor: Satisfied customer
Portal: Customer Portal -> Referrals

1. Gets unique referral link/code
2. Shares with friend via SMS/email/social
3. Friend signs up and books service
4. Both earn referral bonus (points or discount)
5. Tracks referral status in portal
```

#### Scenario 1.7: Video Consultation
```
Actor: Customer with car trouble
Portal: Customer Portal -> Video Consultation

1. Requests video consultation
2. Connects with service advisor via video call
3. Shows vehicle issue on camera
4. Advisor provides initial assessment
5. Receives estimate based on video
6. Books in-person service if needed
```

---

### PHASE 2: CLIENT SCENARIOS (B2B Business Accounts)

#### Scenario 2.1: Fleet Service Management
```
Actor: Fleet manager at a company
Portal: Client Portal

1. Logs into Client Portal
2. Views fleet dashboard:
   - All company vehicles with status
   - Upcoming maintenance schedules
   - Active service orders
   - Monthly spend summary
3. Books service for specific fleet vehicle
4. Assigns priority level
5. Tracks all active services
6. Reviews consolidated monthly invoice
7. Approves payment via corporate billing
```

#### Scenario 2.2: Contract-Based Service Agreement
```
Actor: Corporate client with service contract
Portal: Client Portal

1. Views active contract terms:
   - Covered services
   - SLA metrics (turnaround time)
   - Pricing terms
   - Contract expiry date
2. Books service under contract
3. Contract pricing auto-applied
4. SLA clock starts on intake
5. Receives SLA compliance reports
6. Reviews quarterly performance reports
```

---

### PHASE 3: ADMIN / MANAGER SCENARIOS (Business Owners)

#### Scenario 3.1: Daily Operations Dashboard
```
Actor: Garage owner / Manager
Portal: Admin Dashboard

1. Logs in to dashboard
2. Views real-time KPIs:
   - Today's appointments (scheduled/completed/no-show)
   - Active jobs in service bays
   - Revenue today/week/month
   - Technician utilization
   - Parts inventory alerts
3. Reviews job cards pending approval
4. Checks technician assignments
5. Monitors customer satisfaction scores
```

#### Scenario 3.2: Create Job Card
```
Actor: Service Advisor
Portal: Admin Dashboard -> Job Cards

1. Customer arrives / appointment checked in
2. Creates new job card:
   - Links to customer profile
   - Links to vehicle
   - Describes reported issues
   - Runs vehicle inspection checklist
   - Takes photos (digital walkaround)
3. System suggests related services (AI)
4. Creates estimate with parts + labor
5. Sends estimate to customer for approval
6. Customer approves -> Job starts
7. Assigns technician (manual or AI smart assignment)
8. Tracks progress through service stages
```

#### Scenario 3.3: Inventory & Parts Management
```
Actor: Parts Manager
Portal: Admin Dashboard -> Inventory

1. Views current inventory levels
2. Receives low-stock alerts
3. AI recommends reorder quantities
4. Creates purchase order for supplier
5. Tracks PO delivery status
6. Receives parts -> Scans barcode to update stock
7. Parts auto-allocated to active job cards
8. Views inventory forecasting (AI)
```

#### Scenario 3.4: Financial Management
```
Actor: Accountant
Portal: Admin Dashboard -> Finance

1. Views Chart of Accounts
2. Reviews General Ledger entries
3. Creates/approves Journal Entries
4. Generates Trial Balance
5. Views Income Statement
6. Views Balance Sheet
7. Reviews Cash Flow Statement
8. Manages Accounts Receivable/Payable
9. Reconciles bank accounts
10. Generates ZATCA-compliant e-invoices
11. Calculates VAT returns (15%)
12. Prepares Zakat calculations (2.5%)
```

#### Scenario 3.5: Staff Scheduling
```
Actor: Manager
Portal: Admin Dashboard -> HR

1. Views staff directory
2. Creates shift schedule for week
3. Assigns technicians to service bays
4. Reviews time clock entries
5. Approves timesheets
6. Processes payroll
7. Reviews technician performance
8. Views leaderboard rankings
9. Manages leave requests
```

#### Scenario 3.6: Marketing Campaign
```
Actor: Marketing Manager
Portal: Admin Dashboard -> Marketing Hub

1. Creates email campaign targeting past customers
2. Designs email template (oil change reminder)
3. Segments audience (last service > 6 months)
4. Schedules campaign send
5. Tracks open/click rates
6. Creates social media posts
7. Manages Google My Business reviews
8. Runs referral program promotions
```

#### Scenario 3.7: Multi-Branch Management
```
Actor: Business owner with multiple locations
Portal: Admin Dashboard -> Multi-Location

1. Views consolidated dashboard across branches
2. Compares branch performance
3. Transfers parts between branches
4. Shares technician schedules
5. Standardizes service templates
6. Views consolidated financial reports
```

#### Scenario 3.8: AI-Powered Operations
```
Actor: Manager
Portal: Admin Dashboard -> AI Features

1. AI Scheduling: Optimizes daily appointment slots
2. Smart Assignment: Auto-assigns jobs to best-fit technician
3. Predictive Maintenance: Flags vehicles due for service
4. AI Chatbot: Handles customer inquiries 24/7
5. Smart Parts Recommender: Suggests parts for job types
6. Fraud Detection: Flags suspicious transactions
7. Demand Forecasting: Predicts busy periods
```

---

### PHASE 4: TECHNICIAN SCENARIOS

#### Scenario 4.1: Daily Job Queue
```
Actor: Technician
Portal: Technician Portal (Desktop or Mobile)

1. Clocks in via Time Clock
2. Views "My Jobs" dashboard:
   - Assigned jobs for today
   - Priority indicators
   - Estimated time per job
3. Selects first job
4. Views job details:
   - Vehicle info
   - Customer complaint
   - Inspection photos
   - Recommended repairs
5. Starts job timer
6. Requests parts from inventory
7. Updates progress (photo/video)
8. Completes quality checklist
9. Marks job complete
10. Moves to next job
```

#### Scenario 4.2: Parts Request
```
Actor: Technician working on job
Portal: Technician Portal -> Parts Lookup

1. Identifies needed part during repair
2. Searches parts catalog (by name, number, or barcode scan)
3. Checks availability across branches
4. Requests part from inventory
5. Gets notification when part is ready
6. Scans barcode to confirm receipt
7. Part auto-linked to job card
```

#### Scenario 4.3: Technical Documentation
```
Actor: Technician needing reference
Portal: Technician Portal -> Guides

1. Opens service guides for vehicle make/model
2. Views step-by-step repair instructions
3. Accesses AR Repair Guide (Enterprise)
4. Views wiring diagrams / technical specs
5. Checks OEM service bulletins
6. References torque specs and fluid capacities
```

---

### PHASE 5: PURCHASE AGENT SCENARIOS

#### Scenario 5.1: Supplier Price Comparison
```
Actor: Purchase Agent
Portal: Purchase Agent Portal

1. Receives parts request from technician/inventory
2. Searches multiple suppliers for part
3. Compares prices, availability, delivery time
4. Selects best supplier
5. Creates purchase order
6. Gets manager approval
7. Sends PO to supplier
8. Tracks delivery status
9. Receives and inspects parts
10. Updates inventory on receipt
```

#### Scenario 5.2: Parts Network Request
```
Actor: Purchase Agent
Portal: Parts Network

1. Can't find part from regular suppliers
2. Posts request to Parts Network (B2B marketplace)
3. Network members (other garages) respond with quotes
4. Reviews quotations
5. Accepts best offer
6. Arranges inter-garage parts transfer
7. Receives part and updates inventory
```

---

### PHASE 6: COMPLIANCE SCENARIOS (Saudi Arabia)

#### Scenario 6.1: ZATCA E-Invoice Generation
```
Actor: System (automatic)
Trigger: Invoice finalized

1. Invoice data validated (TRN, amounts, VAT)
2. QR code generated with ZATCA-compliant data
3. XML invoice generated in ZATCA format
4. Invoice submitted to ZATCA portal
5. Clearance/reporting status tracked
6. QR code printed on invoice PDF
7. Audit trail maintained
```

#### Scenario 6.2: Safety Incident Report
```
Actor: Manager / Safety Officer
Portal: Admin Dashboard -> Compliance

1. Incident occurs in workshop
2. Creates safety incident report:
   - Type (injury, spill, equipment failure)
   - Severity level
   - Persons involved
   - Root cause analysis
3. Documents corrective actions
4. Schedules follow-up inspection
5. Updates compliance dashboard
```

---

## 9. DATA FLOW DIAGRAM

```
+------------------+     +------------------+     +------------------+
|   CUSTOMER       |     |   ADMIN/STAFF    |     |   TECHNICIAN     |
|   (Portal/App)   |     |   (Dashboard)    |     |   (Portal/App)   |
+--------+---------+     +--------+---------+     +--------+---------+
         |                         |                        |
         v                         v                        v
+========================================================================+
|                    REACT FRONTEND (SPA/PWA)                             |
|  TanStack Query -> Fetch API -> Express API -> PostgreSQL              |
+========================================================================+
         |                         |                        |
         v                         v                        v
+========================================================================+
|                    EXPRESS.JS BACKEND (Port 5000)                       |
|                                                                        |
|  /api/login          /api/job-cards        /api/vehicles               |
|  /api/register       /api/appointments     /api/inventory              |
|  /api/user           /api/invoices         /api/parts                  |
|  /api/customers      /api/payments         /api/suppliers              |
|  /api/estimates      /api/reports          /api/employees              |
|                                                                        |
|  Middleware: Auth -> CSRF -> RateLimit -> Validate -> Handler          |
+========================================================================+
         |              |              |              |
         v              v              v              v
+----------+    +----------+    +----------+    +----------+
|PostgreSQL|    |  Stripe  |    |  Twilio  |    |  OpenAI  |
| 230+ tbl |    | Payments |    | SMS/Call |    |  AI/ML   |
+----------+    +----------+    +----------+    +----------+
         |              |              |
         v              v              v
+----------+    +----------+    +----------+
|  Google  |    |  ZATCA   |    | WebSocket|
| Maps/Cal |    | E-Invoice|    | Real-time|
+----------+    +----------+    +----------+
```

---

## 10. DEPLOYMENT ARCHITECTURE

```
+=========================================================================+
|                     PRODUCTION DEPLOYMENT                               |
+=========================================================================+
|                                                                         |
|     +------------------+          +------------------+                  |
|     |   CDN / Proxy    |          |   DNS / Domain   |                  |
|     |  (Cloudflare)    |  <----   |  salisauto.com   |                  |
|     +--------+---------+          +------------------+                  |
|              |                                                          |
|     +--------v---------+                                                |
|     |   Load Balancer  |                                                |
|     +--------+---------+                                                |
|              |                                                          |
|     +--------v---------+          +------------------+                  |
|     |  Node.js Server  |  <--->   |  PostgreSQL      |                  |
|     |  Express + React |          |  (Neon Serverless)|                  |
|     |  Port 5000       |          +------------------+                  |
|     +--------+---------+                                                |
|              |                                                          |
|     +--------v---------+          +------------------+                  |
|     |  WebSocket Server|          |  File Storage    |                  |
|     |  (Real-time)     |          |  (S3/Local)      |                  |
|     +------------------+          +------------------+                  |
|                                                                         |
|  External Services:                                                     |
|  [Stripe] [Twilio] [OpenAI] [Google APIs] [ZATCA]                      |
+=========================================================================+
```

---

## 11. SECURITY ARCHITECTURE

```
Request Flow:

Browser ---HTTPS---> Express Server
                         |
                    [Rate Limiter]
                    200 req/15min (global)
                    10 req/15min (auth)
                         |
                    [Security Headers]
                    X-Content-Type-Options
                    X-Frame-Options
                    X-XSS-Protection
                    Strict-Transport-Security
                         |
                    [Session Check]
                    PostgreSQL session store
                    7-day TTL
                    httpOnly + secure cookies
                         |
                    [CSRF Validation]
                    Token-based on POST/PUT/DELETE
                         |
                    [Role Authorization]
                    requireRole middleware
                         |
                    [Request Handler]
                    Zod input validation
                         |
                    [Audit Logging]
                    All actions logged
```

---

## 12. MODULE MAP (156 Modules across 8 Phases)

```
PHASE 1: CORE OPERATIONS (20 modules)
  Dashboard, KPI, Widgets, Customers, Appointments, Calendar,
  Reminders, Vehicles, History, VIN, Fleet, Tracking, Inspections,
  Checklist, Job Cards, Templates, Estimates, Invoices, Payments

PHASE 2: ADVANCED OPERATIONS (20 modules)
  Inventory, Spare Parts, Tools, Auto-Reorder, Forecasting,
  Suppliers, Vendor Portal, Purchase Orders, Marketplace,
  Parts Network, Barcode, Technician Portal, Management,
  Leaderboards, Performance, Towing, Storage, Routing, Tasks

PHASE 3: FINANCIAL (20 modules)
  Chart of Accounts, General Ledger, Journal Entries, Trial Balance,
  Income Statement, Balance Sheet, Cash Flow, AR, AP, Bank Mgmt,
  Budget, Expense Tracking, Payroll, Financial Settings,
  Refund Management, Accounting Integration, Stripe, PayPal

PHASE 4: HR & COMPLIANCE (16 modules)
  HR Management, Time Clock, Timesheets, Productivity,
  Training LMS, Staff Directory, Scheduling, Performance Review,
  Leave Requests, Compliance, Safety, Environmental, ISO Quality,
  Equipment Calibration, Contracts, Warranties

PHASE 5: CUSTOMER EXPERIENCE (14 modules)
  Customer Portal, Loyalty, Reviews, Referrals, Feedback,
  Video Consultations, Live Tracking, Marketing Hub,
  Email Campaigns, Social Media, Google My Business,
  Marketing Automation, Kiosk Check-in, Call Center

PHASE 6: ANALYTICS & INTELLIGENCE (10 modules)
  Reports, Custom Reports, Business Intelligence, BI Dashboard,
  Heatmaps, Profit Analysis, Customer LTV, KPI Dashboard,
  Productivity Tracker, Demand Forecasting

PHASE 7: AI & AUTOMATION (12 modules)
  AI Automation, AI Chatbot, AI Service Advisor, AI Scheduling,
  Smart Assignment, Smart Parts, Predictive Maintenance,
  Predictive Diagnostics, Damage Assessment, Fraud Detection,
  Voice Commands, Document OCR

PHASE 8: EMERGING TECHNOLOGIES (14 modules)
  IoT Dashboard, Telematics, Edge Computing, Digital Twin,
  Drone Inspection, AR Repair, VR Showroom, Blockchain,
  Smart Contracts, Quantum Computing, Sustainable Energy,
  Digital Signage, Wearable Integration, Next-Gen Tech
```

---

*Generated: 2026-03-15*
*Platform: SALIS AUTO v1.0.0*
*Total Pages: 184 | Tables: 230+ | API Endpoints: 250+*
