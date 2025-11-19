# SALIS AUTO - Complete Platform Navigation Guide

**Version**: 1.0  
**Last Updated**: January 19, 2025

---

## Table of Contents
1. [Platform Introduction](#platform-introduction)
2. [Technology Stack](#technology-stack)
3. [API Integrations](#api-integrations)
4. [IoT & Hardware Requirements](#iot--hardware-requirements)
5. [Sidebar Navigation Guide](#sidebar-navigation-guide)

---

## Platform Introduction

**SALIS AUTO** is a world-class automotive ERP (Enterprise Resource Planning) platform designed for modern garage operations. It's a complete business management solution that helps automotive service centers run their operations efficiently, from customer appointments to invoicing, parts management, and advanced AI-powered diagnostics.

### What Does SALIS AUTO Do?

Think of SALIS AUTO as your garage's digital brain. It handles:
- **Customer Management**: Track all your customers and their vehicles
- **Appointment Scheduling**: Book services and manage your workshop calendar
- **Service Operations**: Create job cards, assign technicians, track work progress
- **Parts & Inventory**: Manage spare parts, track stock, order from suppliers
- **Billing & Payments**: Generate invoices, process payments, track finances
- **Staff Management**: Manage employees, track attendance, evaluate performance
- **Advanced Features**: AI diagnostics, blockchain service history, IoT monitoring

### Who Is It For?

- **Small Garages**: 1-2 technicians, basic operations
- **Medium Workshops**: 5-20 technicians, multiple service bays
- **Large Service Centers**: 50+ staff, multiple branches
- **Franchise Networks**: Multi-location operations with centralized management

### Key Benefits

✅ **Complete Business Management** - Everything in one platform  
✅ **Mobile Apps** - Technicians, customers, and managers can work on mobile  
✅ **Cloud-Based** - Access from anywhere, automatic backups  
✅ **AI-Powered** - Smart diagnostics and predictive maintenance  
✅ **Saudi Arabia Ready** - VAT, ZATCA e-invoicing, Arabic language support  
✅ **Scalable** - Grows with your business from 1 to 1000+ employees

---

## Technology Stack

### Frontend (What You See)
- **React 18**: Modern web framework for building the user interface
- **TypeScript**: Adds type safety to prevent bugs
- **Tailwind CSS**: Beautiful, responsive design that works on all devices
- **shadcn/ui**: Professional UI components (buttons, forms, tables, etc.)
- **wouter**: Fast client-side routing (switching between pages)
- **TanStack Query**: Smart data management and caching

### Backend (Behind the Scenes)
- **Node.js**: JavaScript runtime for the server
- **Express.js**: Web server framework
- **TypeScript**: Type-safe backend code
- **WebSocket**: Real-time features (chat, notifications, live tracking)

### Database
- **PostgreSQL**: Enterprise-grade database (290+ tables)
- **Drizzle ORM**: Type-safe database queries
- **Automated Backups**: Your data is safe and secure

### Authentication & Security
- **Passport.js**: Secure login system
- **bcrypt**: Password encryption
- **Session Management**: Secure user sessions
- **Role-Based Access Control (RBAC)**: 24 different user roles with specific permissions

### Mobile Apps
- **React Native**: Cross-platform mobile apps (iOS & Android)
- **Dedicated Apps**: Technician app, Customer app, Manager app

### Advanced Technologies
- **OpenAI GPT-5**: AI-powered diagnostics and chatbot
- **Blockchain**: Tamper-proof service history records
- **WebRTC**: Real-time video calls
- **QR Codes**: Quick parts scanning and tracking

---

## API Integrations

### Payment Processing
**Stripe API**
- **What**: Credit card payment processing
- **Used For**: Customer invoice payments, subscription billing
- **Required**: Stripe account + API keys
- **Setup**: Already integrated, just add your keys

**PayPal API**
- **What**: PayPal payment gateway
- **Used For**: Alternative payment option for customers
- **Required**: PayPal business account
- **Setup**: Already integrated, just add credentials

### Communication
**Twilio SMS API**
- **What**: Send SMS text messages
- **Used For**: 
  - Appointment reminders
  - Service completion notifications
  - Marketing campaigns
  - OTP verification
- **Required**: Twilio account (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER)
- **Setup**: Already integrated, credentials needed

**Gmail API**
- **What**: Send emails from your Gmail account
- **Used For**:
  - Invoice emails
  - Appointment confirmations
  - Marketing newsletters
- **Required**: Google account with API access
- **Setup**: Already integrated

### Calendar Integration
**Google Calendar API**
- **What**: Sync appointments with Google Calendar
- **Used For**:
  - Technician schedules
  - Workshop bookings
  - Manager calendars
- **Required**: Google account with Calendar API enabled
- **Setup**: Already integrated

### AI & Machine Learning
**OpenAI API (GPT-5)**
- **What**: Advanced AI for natural language and diagnostics
- **Used For**:
  - AI Chatbot assistant
  - Predictive diagnostics
  - Smart parts recommendations
  - Job assignment optimization
- **Required**: OpenAI API key
- **Setup**: Already integrated through Replit AI

### Vehicle Data
**NHTSA API** (Free, No Key Required)
- **What**: National Highway Traffic Safety Administration database
- **Used For**: VIN decoding, vehicle specifications
- **Required**: Nothing (free public API)
- **Setup**: Already integrated

**TecDoc API** (Optional)
- **What**: Global parts catalog database
- **Used For**: Parts lookup, cross-reference, specifications
- **Required**: TecDoc subscription
- **Setup**: Can be added when needed

### Business Tools
**Google My Business API**
- **What**: Manage your Google business listing
- **Used For**:
  - Respond to reviews
  - Update business hours
  - Post updates
- **Required**: Google My Business account
- **Setup**: Already integrated

### Accounting
**QuickBooks / Xero Integration** (Optional)
- **What**: Sync with accounting software
- **Used For**: Financial reporting, tax preparation
- **Required**: QuickBooks or Xero account
- **Setup**: Can be configured in settings

---

## IoT & Hardware Requirements

### Required Hardware (Basic Setup)
**Computer/Tablet**
- **What**: Device to run the web application
- **Specs**: Any modern computer with internet browser
- **Quantity**: 1 per workstation
- **Cost**: Use existing computers

**Internet Connection**
- **What**: Reliable internet access
- **Speed**: Minimum 10 Mbps recommended
- **Type**: WiFi or Ethernet
- **Cost**: Your existing connection

**Printer** (Optional but Recommended)
- **What**: For printing invoices, job cards, reports
- **Type**: Any network printer
- **Quantity**: 1+ per location
- **Cost**: $100-500

### Optional IoT Devices

#### 1. **Barcode/QR Scanner**
- **What**: Handheld or fixed scanner for parts
- **Used For**: Quick parts lookup, inventory tracking
- **Type**: USB or Bluetooth scanner
- **Cost**: $50-300
- **Setup**: Plug and scan

#### 2. **License Plate Recognition (LPR) Camera**
- **What**: Camera that reads license plates automatically
- **Used For**: Automatic customer check-in
- **Type**: IP camera with LPR software
- **Cost**: $500-2000
- **Setup**: Network camera + configuration

#### 3. **OBD-II Diagnostic Scanner**
- **What**: Plugs into vehicle diagnostic port
- **Used For**: Read error codes, live data from vehicle
- **Type**: WiFi/Bluetooth OBD adapter
- **Cost**: $20-200 (basic to professional)
- **Models**: 
  - Basic: ELM327 Bluetooth ($20)
  - Professional: Autel MaxiSys ($1500+)
- **Setup**: Plug into vehicle OBD port

#### 4. **IoT Sensors for Vehicle Monitoring**
- **What**: Sensors to track vehicle conditions
- **Types**:
  - Temperature sensors
  - Pressure sensors
  - GPS trackers
  - Battery monitors
- **Used For**: Real-time vehicle diagnostics
- **Cost**: $50-500 per sensor
- **Setup**: Install in vehicles, connect to platform

#### 5. **Digital Signage Displays**
- **What**: TV screens showing service status
- **Used For**: Customer waiting area, workshop status
- **Type**: Smart TV or monitor with HDMI
- **Cost**: $200-1000
- **Setup**: Connect to computer, open browser

#### 6. **Self-Service Kiosk**
- **What**: Touchscreen for customer check-in
- **Used For**: Automated customer arrival, service selection
- **Type**: Tablet or touchscreen monitor
- **Cost**: $300-1500
- **Setup**: Mount tablet, open kiosk page

#### 7. **CCTV Cameras for Computer Vision QC**
- **What**: Cameras with AI for quality inspection
- **Used For**: Automatic damage detection, work verification
- **Type**: IP cameras with AI processing
- **Cost**: $200-1000 per camera
- **Setup**: Network cameras + AI configuration

#### 8. **RFID Tags for Tool Tracking**
- **What**: Track tool locations and usage
- **Used For**: Prevent tool loss, accountability
- **Type**: RFID tags + reader
- **Cost**: $500-2000 for system
- **Setup**: Tag tools, install readers

### Hardware Summary Table

| Device | Priority | Cost Range | Benefit |
|--------|----------|------------|---------|
| Computer/Tablet | **Required** | $300-1000 | Run the platform |
| Internet | **Required** | $50-100/mo | Cloud access |
| Printer | High | $100-500 | Print documents |
| Barcode Scanner | Medium | $50-300 | Fast parts lookup |
| OBD Scanner | High | $20-2000 | Vehicle diagnostics |
| LPR Camera | Low | $500-2000 | Auto check-in |
| IoT Sensors | Low | $50-500 each | Real-time monitoring |
| Digital Signage | Low | $200-1000 | Customer experience |
| Kiosk | Low | $300-1500 | Self-service |
| CCTV + AI | Low | $200-1000 | Quality control |

**Recommended Starting Setup** (Small Garage): Computer + Internet + Printer + Basic OBD Scanner = ~$500-1500

---

## Sidebar Navigation Guide

The SALIS AUTO platform is organized into **18 workflow-based sections** that follow the natural flow of garage operations. Here's what each section does:

### 🎯 Group 1: Dashboard & Overview

**What It Is**: Your command center - see everything at a glance

**Pages**:
- **Dashboard** - Main overview with key metrics, charts, and quick actions
  - See today's appointments
  - Revenue/profit charts
  - Active job cards
  - Staff performance
  - Quick links to common tasks

**Who Uses It**: Everyone (customized based on your role)

**When To Use**: Start of day, checking business status, monitoring operations

---

### 📅 Group 2: Customer Intake & Appointments

**What It Is**: Everything related to booking and scheduling customer visits

**Pages**:
1. **Appointments** - Calendar view of all scheduled services
   - Book new appointments
   - View daily/weekly/monthly schedule
   - Send reminders to customers
   - Reschedule or cancel appointments

2. **Appointment Reminders** - Automated reminder system
   - Set up SMS/email reminders
   - Configure reminder timing (1 day before, 2 hours before, etc.)
   - Track reminder delivery status

3. **Calendar** - Interactive calendar interface
   - Drag and drop appointments
   - See technician availability
   - Block time slots
   - Sync with Google Calendar

**Who Uses It**: Receptionists, Service Advisors, Managers

**When To Use**: When customers call to book service, daily schedule planning

---

### 👥 Group 3: Customer Management

**What It Is**: All customer information and relationships

**Pages**:
1. **Customers** - Complete customer database
   - Add new customers
   - Edit customer details
   - View service history
   - Customer notes and preferences

2. **Customer Loyalty** - Loyalty program management
   - Points tracking
   - Rewards programs
   - VIP customers
   - Special offers

3. **Customer LTV Analysis** - Customer lifetime value analytics
   - Which customers are most valuable
   - Revenue per customer
   - Retention analysis
   - Upselling opportunities

**Who Uses It**: Service Advisors, Receptionists, Marketing, Managers

**When To Use**: Customer check-in, following up, marketing campaigns

---

### 🚗 Group 4: Vehicle Management

**What It Is**: Track all vehicles serviced in your garage

**Pages**:
1. **Vehicles** - Vehicle database
   - Add vehicles (VIN decoder)
   - Vehicle specifications
   - Link to owner
   - Service history per vehicle

2. **Fleet Management** - Manage customer fleets
   - Fleet accounts (companies with multiple vehicles)
   - Fleet contracts
   - Bulk scheduling
   - Fleet reporting

3. **Fleet Tracking** - Real-time GPS tracking
   - Track fleet vehicles
   - Route history
   - Geofencing alerts
   - Mileage tracking

4. **Vehicle History** - Complete service records
   - All past services
   - Parts replaced
   - Warranty information
   - Recalls and campaigns

5. **VIN Decoder** - Decode vehicle identification numbers
   - Enter VIN
   - Get full vehicle specs
   - Auto-fill vehicle details

**Who Uses It**: Service Advisors, Technicians, Fleet Managers

**When To Use**: New vehicle check-in, service history lookup, fleet monitoring

---

### 🔍 Group 5: Inspection & Check-In

**What It Is**: Initial vehicle inspection when customer arrives

**Pages**:
1. **Vehicle Inspections** - Multi-point inspection system
   - Digital inspection forms
   - Photo capture (damage, wear)
   - Video recording
   - Customer approval signature

2. **Kiosk Check-In** - Self-service customer arrival
   - Customer scans QR or enters phone
   - Auto-check-in
   - Digital signatures
   - Reduces reception workload

3. **License Plate Recognition** - Automatic vehicle identification
   - Camera reads plate
   - Finds customer/vehicle in system
   - Auto-creates arrival record
   - Sends notification to service advisor

**Who Uses It**: Receptionists, Service Advisors, Technicians

**When To Use**: Vehicle arrival, pre-service inspection

---

### 🔧 Group 6: Diagnostics & Assessment

**What It Is**: Identify what's wrong with the vehicle

**Pages**:
1. **Diagnostics OBD Hub** - Vehicle computer diagnostics
   - Read error codes (DTC)
   - Live data stream
   - Emissions readiness
   - Code library with fixes

2. **AI Predictive Diagnostics** - AI predicts future failures
   - AI analyzes vehicle data
   - Predicts component failures
   - Recommends preventive maintenance
   - Saves customers from breakdowns

3. **Predictive Maintenance** - Scheduled maintenance predictions
   - Based on mileage/time
   - Service intervals
   - Upcoming maintenance alerts

4. **Computer Vision QC** - AI camera quality control
   - Cameras check work quality
   - Damage detection
   - Before/after comparison
   - Proof of work

**Who Uses It**: Technicians, Service Advisors, Diagnosticians

**When To Use**: When vehicle has issues, diagnostics needed, quality verification

---

### 📋 Group 7: Service Planning & Scheduling

**What It Is**: Plan the repair work and assign technicians

**Pages**:
1. **Job Cards** - Digital work orders
   - Create repair orders
   - List services needed
   - Add parts required
   - Assign technician
   - Track status (pending → in progress → completed)

2. **Service Templates** - Pre-defined service packages
   - Oil change package
   - Brake service package
   - 30K/60K/90K mile services
   - Quick job creation

3. **Tasks Management** - Break jobs into tasks
   - Task lists per job
   - Subtask assignment
   - Task completion tracking
   - Dependencies

4. **Smart Job Assignment** - AI recommends best technician
   - AI analyzes technician skills
   - Current workload
   - Job type expertise
   - Optimal assignment suggestions

5. **Technician Performance** - Track technician productivity
   - Jobs completed
   - Average time per job
   - Efficiency ratings
   - Quality scores

**Who Uses It**: Service Managers, Service Advisors, Shop Foremen

**When To Use**: After diagnosis, work planning, technician assignment

---

### 📦 Group 8: Parts & Inventory

**What It Is**: Manage spare parts stock and suppliers

**Pages**:
1. **Spare Parts** - Parts catalog
   - All parts in stock
   - Part numbers
   - Prices
   - Stock levels
   - Photos

2. **Inventory Management** - Stock control
   - Stock in/out tracking
   - Reorder alerts
   - Stock counts
   - Location tracking (bins/shelves)

3. **Parts Availability Tracker** - Multi-supplier stock check
   - Real-time stock from multiple suppliers
   - Compare prices
   - Order from cheapest/fastest
   - Delivery time estimates

4. **Purchase Orders** - Order parts from suppliers
   - Create PO
   - Send to supplier
   - Track delivery
   - Receive parts

5. **Vendors/Suppliers** - Supplier management
   - Supplier contacts
   - Price lists
   - Performance tracking
   - Payment terms

6. **Parts Supply Network** - B2B parts marketplace
   - Connect with other garages
   - Share parts
   - Emergency part sourcing
   - Inter-branch transfers

7. **Smart Parts Recommendations** - AI suggests parts
   - AI predicts parts needed
   - Compatible alternatives
   - Better pricing options
   - Bundled recommendations

**Who Uses It**: Parts Managers, Technicians, Service Advisors, Purchasers

**When To Use**: Creating job cards, checking stock, ordering parts, inventory counts

---

### 🛠️ Group 9: Service Execution & Operations

**What It Is**: Actual repair work and workshop operations

**Pages**:
1. **Technician Portal** - Technician workspace (desktop)
   - My assigned jobs
   - Job details
   - Time tracking
   - Documentation

2. **Technician Management** - Manage all technicians
   - Technician profiles
   - Skills matrix
   - Certifications
   - Work schedules

3. **Time Clock** - Clock in/out system
   - Track work hours
   - Break times
   - Overtime calculation
   - Timesheets

4. **Timesheet Management** - Payroll hours
   - Review timesheets
   - Approve hours
   - Export to payroll
   - Labor cost tracking

5. **Tools Management** - Workshop tools tracking
   - Tool inventory
   - Tool assignments
   - Calibration schedules
   - Loss prevention

6. **Loaner Vehicles** - Courtesy car management
   - Loaner fleet
   - Availability
   - Customer assignments
   - Condition checks

7. **Towing & Recovery Services** - Towing operations
   - Tow requests
   - Truck dispatch
   - GPS tracking
   - Service completion

8. **Vehicle Storage** - Long-term storage
   - Storage spaces
   - Customer vehicles in storage
   - Storage fees
   - Retrieval scheduling

**Who Uses It**: Technicians, Service Managers, Shop Foremen

**When To Use**: During repair work, workshop management, resource allocation

---

### ✅ Group 10: Quality & Delivery

**What It Is**: Final checks before returning vehicle to customer

**Pages**:
1. **Quality Management** - ISO quality standards
   - Quality checklists
   - Inspection procedures
   - Non-conformance tracking
   - Corrective actions

2. **Safety & Incidents** - Workplace safety
   - Incident reporting
   - Safety inspections
   - Near-miss tracking
   - Safety training records

3. **Warranty Management** - Warranty claims
   - Warranty tracking
   - Claim submissions
   - Reimbursement tracking
   - Warranty part inventory

**Who Uses It**: QC Inspectors, Service Managers, Technicians

**When To Use**: Before vehicle delivery, quality audits, safety checks

---

### 💰 Group 11: Billing & Payments

**What It Is**: Generate invoices and process payments

**Pages**:
1. **Invoices** - Customer billing
   - Create invoices
   - Add labor + parts
   - Apply discounts
   - Print/email invoices

2. **Estimates** - Price quotes
   - Generate estimates
   - Customer approval
   - Convert to invoice
   - Win rate tracking

3. **Payments** - Payment processing
   - Record cash/card payments
   - Stripe/PayPal integration
   - Payment history
   - Outstanding balances

4. **Refund Management** - Handle refunds
   - Process refunds
   - Partial refunds
   - Refund tracking
   - Reason tracking

5. **Financial Settings** - Configure pricing
   - Labor rates
   - Tax rates (VAT)
   - Payment terms
   - Discount rules

6. **Accounting Integration** - Sync with accounting
   - QuickBooks/Xero sync
   - Chart of accounts
   - Financial exports
   - Reconciliation

**Who Uses It**: Service Advisors, Receptionists, Accountants, Managers

**When To Use**: Job completion, customer checkout, financial management

---

### 📊 Group 12: Analytics & Business Intelligence

**What It Is**: Reports and data analysis for business decisions

**Pages**:
1. **Reports** - Standard reports
   - Daily sales
   - Technician productivity
   - Parts usage
   - Customer reports

2. **Business Intelligence** - Advanced analytics
   - Interactive dashboards
   - Custom reports
   - Trend analysis
   - Forecasting

3. **Custom Report Builder** - Build your own reports
   - Drag-drop report builder
   - Filter data
   - Export to Excel/PDF
   - Schedule automated reports

4. **Business Heat Maps** - Visual analytics
   - Geographic revenue maps
   - Time-based heat maps
   - Service type distribution
   - Identify patterns

5. **Profit Margin Analysis** - Financial analytics
   - Per-job profitability
   - Service line margins
   - Cost analysis
   - Pricing optimization

6. **Activity Tracking** - Audit logs
   - User actions
   - System changes
   - Data history
   - Compliance tracking

**Who Uses It**: Managers, Business Owners, Accountants, Executives

**When To Use**: Business reviews, performance analysis, strategic planning

---

### 😊 Group 13: Customer Experience & Growth

**What It Is**: Marketing, loyalty, and customer engagement

**Pages**:
1. **Customer Portal** - Customer self-service
   - Customers log in
   - View service history
   - Book appointments
   - Pay invoices online

2. **Marketing Automation** - Marketing campaigns
   - Email campaigns
   - SMS campaigns
   - Customer segmentation
   - Campaign analytics

3. **Email Marketing** - Email newsletters
   - Design emails
   - Subscriber lists
   - Send schedules
   - Open/click tracking

4. **Social Media Monitoring** - Track online reviews
   - Google reviews
   - Facebook reviews
   - Review alerts
   - Respond to reviews

5. **Google My Business** - Manage Google listing
   - Update business info
   - Respond to reviews
   - Post updates
   - Analytics

6. **Chat** - In-app customer chat
   - Live chat support
   - Chat history
   - File sharing
   - Support tickets

**Who Uses It**: Marketing Managers, Customer Service, Receptionists

**When To Use**: Customer engagement, marketing campaigns, reputation management

---

### 👔 Group 14: Team & HR Management

**What It Is**: Manage employees and human resources

**Pages**:
1. **HR Management** - Employee database
   - Employee profiles
   - Contact information
   - Documents
   - Emergency contacts

2. **Staff Performance Review** - Performance evaluations
   - Review schedules
   - Performance metrics
   - Goals and objectives
   - Review history

3. **Training & LMS** - Learning management
   - Training programs
   - Course enrollment
   - Certification tracking
   - Training calendar

4. **Knowledge Base** - Internal wiki
   - Procedures
   - How-to guides
   - Troubleshooting
   - Best practices

5. **Payroll Management** - Salary processing
   - Salary calculations
   - Deductions
   - Pay slips
   - Tax reporting

6. **Expense Tracking** - Business expenses
   - Expense claims
   - Receipt uploads
   - Approval workflow
   - Reimbursements

7. **Notifications** - System notifications
   - Push notifications
   - Notification settings
   - Notification history

**Who Uses It**: HR Managers, Managers, Employees

**When To Use**: Employee management, training, payroll, performance reviews

---

### 📜 Group 15: Compliance & Safety

**What It Is**: Legal compliance, regulations, and safety

**Pages**:
1. **Compliance Management** - Regulatory compliance
   - Saudi ZATCA e-invoicing
   - VAT compliance
   - Zakat reporting
   - License renewals
   - Inspection certificates

2. **Document Management** - File storage
   - Upload documents
   - Organize folders
   - Version control
   - Document search

3. **Data Import/Export** - Data portability
   - Import customers/vehicles
   - Export reports
   - Backup data
   - Migration tools

**Who Uses It**: Compliance Officers, Managers, Accountants

**When To Use**: Tax filing, compliance audits, data backups

---

### 🏢 Group 16: Enterprise & Franchise

**What It Is**: Multi-location and franchise management

**Pages**:
1. **Franchise Management** - Franchise operations
   - Franchise locations
   - Performance tracking
   - Royalty calculations
   - Brand compliance

2. **Contract Management** - Business contracts
   - Customer contracts
   - Supplier contracts
   - SLA tracking
   - Contract renewals

3. **OEM Software Subscriptions** - Software licensing
   - Diagnostic software licenses
   - Subscription management
   - License assignments
   - Renewal tracking

4. **Globalization Layer** - Multi-country support
   - Multi-currency
   - Multi-language
   - Regional settings
   - Localization

5. **Telematics Integration** - Vehicle telematics
   - GPS tracking
   - Vehicle diagnostics
   - Driver behavior
   - Fleet analytics

**Who Uses It**: Franchise Owners, Regional Managers, Executives

**When To Use**: Franchise management, contract administration, enterprise operations

---

### 🚀 Group 17: Emerging Technologies

**What It Is**: Cutting-edge tech features

**Pages**:
1. **Blockchain Service History** - Tamper-proof records
   - Blockchain verification
   - Immutable service records
   - Transparency
   - Resale value proof

2. **Smart Contracts** - Automated agreements
   - Service contracts
   - Auto-payment triggers
   - Digital signatures
   - Contract execution

3. **Voice Commands** - Voice control
   - Voice-activated features
   - Hands-free operation
   - Voice search
   - Voice notes

4. **Document OCR** - Scan & digitize
   - Scan paper documents
   - Extract text
   - Auto-data entry
   - Digital archive

5. **AR/VR Showroom** - Virtual reality
   - VR vehicle tours
   - AR repair guides
   - Virtual showroom
   - Training simulations

6. **Wearable Integration** - Smart watch support
   - Notifications on watch
   - Quick actions
   - Health tracking (for staff)
   - Hands-free alerts

7. **Sustainable Energy Monitoring** - Green operations
   - Energy consumption
   - Carbon footprint
   - Solar panel monitoring
   - Sustainability reports

**Who Uses It**: Tech-savvy managers, Early adopters, Innovation teams

**When To Use**: Premium services, differentiation, future-proofing

---

### 🤖 Group 18: AI & Automation Hub

**What It Is**: Artificial intelligence and automation tools

**Pages**:
1. **AI Automation** - AI workflow automation
   - Automated workflows
   - Rule-based automation
   - Smart scheduling
   - Process optimization

2. **AI Chatbot Assistant** - Customer AI chatbot
   - Answer customer questions
   - Book appointments
   - Provide quotes
   - 24/7 availability

3. **Call Center** - Call center operations
   - Call queue management
   - Agent dashboard
   - Call recording
   - Performance metrics
   - Real-time monitoring

**Who Uses It**: Call Center Agents, Managers, Automation specialists

**When To Use**: Customer service, workflow optimization, AI implementation

---

### ⚙️ Group 19: System & Settings

**What It Is**: Platform configuration and user settings

**Pages**:
1. **Settings** - System configuration
   - General settings
   - Email templates
   - SMS templates
   - Notification rules

2. **Security** - Security settings
   - Two-factor authentication
   - Password policies
   - Access logs
   - IP restrictions

3. **Integrations** - Third-party connections
   - API configuration
   - Connected services
   - Webhooks
   - OAuth apps

4. **Profile** - Your user profile
   - Personal info
   - Password change
   - Preferences
   - Avatar

**Who Uses It**: System Administrators, All Users (Profile)

**When To Use**: System setup, security configuration, personal preferences

---

## Quick Reference: Who Uses What?

### Receptionist / Service Advisor
- ✅ Appointments
- ✅ Customers
- ✅ Vehicles
- ✅ Vehicle Inspections
- ✅ Job Cards
- ✅ Invoices
- ✅ Payments
- ✅ Estimates

### Technician
- ✅ Technician Portal
- ✅ My Jobs (mobile)
- ✅ Time Clock
- ✅ Diagnostics OBD Hub
- ✅ Parts Lookup
- ✅ Job Documentation
- ✅ Vehicle Inspections

### Parts Manager
- ✅ Spare Parts
- ✅ Inventory Management
- ✅ Purchase Orders
- ✅ Suppliers
- ✅ Parts Availability
- ✅ Parts Supply Network

### Service Manager
- ✅ Dashboard
- ✅ Job Cards
- ✅ Smart Job Assignment
- ✅ Technician Management
- ✅ Technician Performance
- ✅ Quality Management
- ✅ Reports

### Accountant / Finance
- ✅ Invoices
- ✅ Payments
- ✅ Refund Management
- ✅ Financial Settings
- ✅ Accounting Integration
- ✅ Profit Margin Analysis
- ✅ Expense Tracking
- ✅ Payroll Management

### Business Owner / Manager
- ✅ Dashboard
- ✅ Business Intelligence
- ✅ Reports
- ✅ Customer LTV Analysis
- ✅ Profit Margin Analysis
- ✅ Franchise Management (if applicable)
- ✅ Staff Performance Review

### Marketing Manager
- ✅ Marketing Automation
- ✅ Email Marketing
- ✅ Customer Loyalty
- ✅ Social Media Monitoring
- ✅ Google My Business

### HR Manager
- ✅ HR Management
- ✅ Staff Performance Review
- ✅ Training & LMS
- ✅ Payroll Management
- ✅ Expense Tracking

### Call Center Agent
- ✅ Call Center
- ✅ Appointments
- ✅ Customers
- ✅ Chat
- ✅ Customer Portal

---

## Getting Started Checklist

### Day 1: Initial Setup
- [ ] Access the platform at your Replit URL
- [ ] Login with admin credentials
- [ ] Configure garage details (name, address, logo)
- [ ] Set up financial settings (currency, tax rates)
- [ ] Add your first branch location

### Week 1: Core Setup
- [ ] Add staff users (service advisors, technicians, receptionist)
- [ ] Import or add customers
- [ ] Add vehicles
- [ ] Create spare parts catalog
- [ ] Set up service templates (oil change, brake service, etc.)
- [ ] Configure appointment calendar

### Week 2: Go Live
- [ ] Start booking appointments
- [ ] Create your first job cards
- [ ] Process your first invoice
- [ ] Train staff on their sections
- [ ] Test the workflow end-to-end

### Month 1: Optimize
- [ ] Review reports and analytics
- [ ] Set up automated reminders
- [ ] Configure marketing campaigns
- [ ] Enable mobile apps for technicians
- [ ] Fine-tune workflows based on usage

---

## Support & Training

### Help Resources
- **Built-in Help**: Click the "?" icon in any section
- **Knowledge Base**: Access from sidebar → Training & LMS
- **Video Tutorials**: Coming soon
- **User Guides**: This document + role-specific guides

### Training Recommendations
1. **Admin Training** (2-4 hours): System setup, user management
2. **Service Advisor Training** (2 hours): Appointments, job cards, invoicing
3. **Technician Training** (1 hour): Technician portal, time tracking
4. **Parts Manager Training** (1 hour): Inventory, purchase orders
5. **Finance Training** (1 hour): Invoicing, accounting integration

---

## Conclusion

SALIS AUTO is a comprehensive platform that grows with your business. Start with the basics (appointments, job cards, invoicing) and gradually adopt advanced features (AI diagnostics, blockchain, IoT) as your needs evolve.

The sidebar navigation is designed to match your daily workflow, making it intuitive to find what you need. Each section is purpose-built for specific roles, so every user sees what matters to them.

**Questions?** Contact your system administrator or check the Knowledge Base.

---

**Document Version**: 1.0  
**Last Updated**: January 19, 2025  
**Platform Version**: SALIS AUTO v1.0  
**Total Modules**: 141+  
**Total Pages**: 174
