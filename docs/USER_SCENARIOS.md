# SALIS AUTO - Complete User Scenarios

## Table of Contents
1. [Admin Scenarios](#1-admin--platform-owner-scenarios)
2. [Manager Scenarios](#2-garage-manager-scenarios)
3. [Service Advisor Scenarios](#3-service-advisor-scenarios)
4. [Technician Scenarios](#4-technician-scenarios)
5. [Customer Scenarios](#5-customer-scenarios)
6. [Accountant Scenarios](#6-accountant--finance-scenarios)
7. [Purchase Agent Scenarios](#7-purchase-agent-scenarios)
8. [HR Manager Scenarios](#8-hr-manager-scenarios)
9. [Receptionist Scenarios](#9-receptionist-scenarios)
10. [Call Center Scenarios](#10-call-center-agent-scenarios)
11. [Compliance Scenarios](#11-compliance-officer-scenarios)
12. [Cross-Role Scenarios](#12-cross-role-scenarios)

---

## 1. Admin / Platform Owner Scenarios

### SC-A01: Platform Setup & Configuration
**Actor:** Admin
**Precondition:** Fresh installation or new garage onboarding
**Flow:**
1. Admin logs into the platform with master credentials
2. Navigates to Settings > System Configuration
3. Configures garage profile (name, logo, address, CR number)
4. Sets up branch locations with contact details
5. Configures subscription plan (STARTER / PRO / ENTERPRISE)
6. Sets up payment gateway (Stripe/PayPal) credentials
7. Configures SMS (Twilio) and email (GetResponse) integrations
8. Enables/disables feature flags per business needs
**Postcondition:** Garage is fully configured and ready for operations

### SC-A02: User & Role Management
**Actor:** Admin
**Precondition:** Garage is configured
**Flow:**
1. Admin navigates to Role Management
2. Views the 24 predefined roles (Admin, Manager, Technician, etc.)
3. Creates a new user account with email and temporary password
4. Assigns one or more roles to the user
5. Assigns branch access (which branches the user can operate in)
6. Sets access end date if the user is temporary/contract
7. Optionally enables 2FA requirement for the user
8. User receives email notification with login credentials
**Postcondition:** New user can log in with assigned role and permissions

### SC-A03: Subscription & Plan Management
**Actor:** Admin
**Flow:**
1. Admin navigates to Settings > Subscription
2. Views current plan details (STARTER/PRO/ENTERPRISE)
3. Reviews feature comparison across plans
4. Upgrades plan to unlock additional modules
5. System immediately enables new features (e.g., AI diagnostics, IoT)
6. Billing is updated accordingly
**Postcondition:** New features are accessible based on plan level

### SC-A04: Security & Audit Review
**Actor:** Admin
**Flow:**
1. Admin navigates to Security settings
2. Reviews active sessions across all users
3. Views audit logs filtered by date/user/action
4. Identifies suspicious login attempts (rate-limited entries)
5. Forces logout for a compromised session
6. Reviews 2FA enrollment status across users
7. Exports audit log report for compliance
**Postcondition:** Security posture reviewed and any threats mitigated

### SC-A05: Multi-Branch Oversight
**Actor:** Admin
**Flow:**
1. Admin opens the Dashboard
2. Switches between branch views to compare performance
3. Views KPIs: revenue, jobs completed, customer satisfaction per branch
4. Identifies underperforming branches
5. Drills down into specific branch analytics
6. Generates cross-branch comparison report
**Postcondition:** Admin has visibility into all branch operations

### SC-A06: Integration Setup
**Actor:** Admin
**Flow:**
1. Admin navigates to Integrations page
2. Connects Google Calendar for appointment sync
3. Connects Gmail for email notifications
4. Configures Stripe payment gateway with API keys
5. Sets up Twilio for SMS notifications (Saudi +966 numbers)
6. Tests each integration with a sample action
7. Enables/disables integrations as needed
**Postcondition:** External services connected and operational

---

## 2. Garage Manager Scenarios

### SC-M01: Daily Operations Dashboard
**Actor:** Manager
**Flow:**
1. Manager logs in and views the main Dashboard
2. Sees today's appointments, active job cards, pending invoices
3. Reviews real-time alerts (overdue jobs, low inventory, pending approvals)
4. Checks technician availability and workload distribution
5. Uses Quick Actions to create a new appointment or job card
6. Reviews revenue metrics for the day/week/month
**Postcondition:** Manager has complete operational visibility

### SC-M02: Job Card Oversight & Approval
**Actor:** Manager
**Flow:**
1. Manager navigates to Job Cards
2. Filters by status: Pending Approval, In Progress, Completed
3. Opens a pending job card to review scope and estimated costs
4. Approves or requests modifications to the estimate
5. Assigns/reassigns technician based on skills and availability
6. Monitors progress updates in real-time via WebSocket
7. Receives notification when job is completed
**Postcondition:** Job cards managed and approved through lifecycle

### SC-M03: Staff Performance Review
**Actor:** Manager
**Flow:**
1. Manager navigates to Analytics > Performance
2. Views technician performance metrics (jobs completed, avg time, ratings)
3. Compares team members on efficiency and quality
4. Reviews customer feedback per technician
5. Identifies training needs based on performance gaps
6. Generates performance report for HR review
**Postcondition:** Staff performance assessed with data-driven insights

### SC-M04: Inventory & Procurement Oversight
**Actor:** Manager
**Flow:**
1. Manager checks Parts & Inventory dashboard
2. Reviews low stock alerts and reorder suggestions
3. Approves pending purchase orders from purchase agents
4. Reviews supplier performance ratings
5. Adjusts reorder points based on demand forecasts
6. Tracks incoming shipments and ETA
**Postcondition:** Inventory levels managed proactively

### SC-M05: Customer Complaint Resolution
**Actor:** Manager
**Flow:**
1. Manager receives escalated complaint notification
2. Opens the customer's profile and service history
3. Reviews the specific job card and invoice in question
4. Communicates with customer via internal chat
5. Approves a discount, refund, or complimentary service
6. Documents resolution in the system
7. Follows up to ensure customer satisfaction
**Postcondition:** Customer complaint resolved and documented

### SC-M06: Schedule & Capacity Planning
**Actor:** Manager
**Flow:**
1. Manager opens the Calendar view
2. Reviews upcoming appointments and booked capacity
3. Identifies overbooked or underutilized time slots
4. Adjusts technician schedules and shift assignments
5. Blocks time for maintenance or training
6. Uses AI scheduling optimization for suggestions
**Postcondition:** Schedule optimized for maximum throughput

---

## 3. Service Advisor Scenarios

### SC-SA01: Customer Walk-in Reception
**Actor:** Service Advisor
**Flow:**
1. Customer arrives at the garage
2. Service Advisor searches for existing customer profile
3. If new: creates customer profile (name, phone, email, nationality)
4. Looks up or registers the customer's vehicle (make, model, year, VIN, plate)
5. Conducts vehicle check-in with condition report
6. Takes photos of existing damage using media upload
7. Records customer's service requests and complaints
8. Creates an appointment or immediate job card
**Postcondition:** Customer and vehicle registered, service initiated

### SC-SA02: Service Estimate Creation
**Actor:** Service Advisor
**Flow:**
1. Service Advisor opens a new estimate
2. Selects the vehicle and customer
3. Adds service items from service templates
4. System suggests additional services based on vehicle history (AI)
5. Adds required spare parts with current pricing
6. AI estimates labor time and cost
7. Calculates VAT (15%) automatically
8. Generates ZATCA-compliant QR code
9. Presents estimate to customer for approval
10. Customer signs digitally on the signature pad
**Postcondition:** Approved estimate ready for job card creation

### SC-SA03: Appointment Scheduling
**Actor:** Service Advisor
**Flow:**
1. Service Advisor opens the Calendar
2. Selects available date and time slot
3. Assigns the appointment to a specific branch
4. Selects service type and estimated duration
5. Links to customer and vehicle records
6. System syncs to Google Calendar
7. Customer receives SMS/email confirmation
8. Reminder sent 24 hours before appointment
**Postcondition:** Appointment booked and notifications sent

### SC-SA04: Job Card Creation from Estimate
**Actor:** Service Advisor
**Flow:**
1. Service Advisor converts approved estimate to job card
2. System pre-fills job card with estimate details
3. Advisor assigns primary and supporting technicians
4. Sets priority level (Normal, Urgent, Emergency)
5. Defines task breakdown with time estimates
6. Links required parts from inventory
7. Job card status set to "Open"
8. Assigned technician receives notification
**Postcondition:** Job card created and assigned

### SC-SA05: Customer Communication & Updates
**Actor:** Service Advisor
**Flow:**
1. Service Advisor opens the customer's job card
2. Notes a delay or additional work needed
3. Calls or messages the customer via integrated chat
4. Sends updated estimate for additional work
5. Customer approves via digital signature
6. Updates job card with approved changes
7. Notifies technician of scope change
**Postcondition:** Customer informed and additional work approved

---

## 4. Technician Scenarios

### SC-T01: View Assigned Jobs (Desktop)
**Actor:** Technician
**Flow:**
1. Technician logs into Technician Portal
2. Sees personal dashboard with assigned jobs
3. Views job queue sorted by priority
4. Opens a job card to see full details (vehicle, tasks, parts)
5. Accepts the job and status changes to "In Progress"
6. Views task checklist and service instructions
**Postcondition:** Technician aware of all assigned work

### SC-T02: Mobile Job Execution
**Actor:** Technician
**Flow:**
1. Technician opens Technician Mobile App (PWA)
2. Scans vehicle barcode/QR to pull up job card
3. Views step-by-step task list
4. Marks each task as complete with notes
5. Takes photos of work completed
6. Reports parts consumed during service
7. Logs time spent on each task
8. Marks job as "Completed" or "Awaiting Parts"
**Postcondition:** Job progress tracked in real-time

### SC-T03: Parts Request During Service
**Actor:** Technician
**Flow:**
1. Technician discovers additional parts needed during service
2. Opens parts request from within the job card
3. Searches spare parts catalog by part number or name
4. Checks stock availability across branches
5. Submits request for parts not in stock
6. Purchase agent receives notification
7. Technician receives notification when parts arrive
**Postcondition:** Parts requested and tracked

### SC-T04: Quality Checkpoint Completion
**Actor:** Technician
**Flow:**
1. Technician completes all service tasks
2. Runs through quality checkpoint checklist
3. Performs test drive if applicable
4. Documents findings and measurements
5. Takes final photos of completed work
6. Signs off on quality inspection
7. Job card status changes to "Ready for Delivery"
**Postcondition:** Service quality verified

### SC-T05: Time & Attendance
**Actor:** Technician
**Flow:**
1. Technician clocks in via the mobile app
2. System records start time and location
3. Breaks are logged automatically
4. Views current shift schedule
5. Requests leave through HR module
6. Views timesheet summary at end of week
7. Commission calculated based on completed jobs
**Postcondition:** Work hours and productivity tracked

---

## 5. Customer Scenarios

### SC-C01: Online Appointment Booking
**Actor:** Customer
**Flow:**
1. Customer accesses the Customer Portal (web or mobile PWA)
2. Logs in or creates account (name, email, phone)
3. Adds vehicle details (make, model, year, plate number)
4. Selects service type from available categories
5. Views available time slots on the calendar
6. Selects preferred date, time, and branch
7. Confirms booking
8. Receives SMS and email confirmation
9. Gets reminder notification 24 hours before
**Postcondition:** Appointment booked and confirmed

### SC-C02: Track Vehicle Service Status
**Actor:** Customer
**Flow:**
1. Customer opens Customer Portal
2. Views active service orders
3. Sees real-time status: Checked In > Diagnosing > Repairing > Quality Check > Ready
4. Views assigned technician name
5. Receives push notification on status changes
6. Views photos of work in progress (if uploaded)
7. Can message the service advisor via chat
**Postcondition:** Customer informed of service progress

### SC-C03: View & Pay Invoice
**Actor:** Customer
**Flow:**
1. Customer receives notification that invoice is ready
2. Opens Customer Portal and views invoice details
3. Reviews itemized charges (labor, parts, VAT)
4. Scans ZATCA QR code for Saudi compliance verification
5. Selects payment method (Stripe card or PayPal)
6. Completes payment online
7. Receives payment confirmation and digital receipt
8. Downloads PDF invoice for records
**Postcondition:** Invoice paid and receipt generated

### SC-C04: Provide Feedback & Rating
**Actor:** Customer
**Flow:**
1. After vehicle delivery, customer receives feedback request (SMS/email)
2. Opens feedback form in Customer Portal
3. Rates overall experience (1-5 stars)
4. Rates specific aspects: service quality, timeliness, communication
5. Writes optional text review
6. Submits feedback
7. Manager receives notification of new feedback
8. Negative feedback triggers escalation workflow
**Postcondition:** Feedback recorded and visible to management

### SC-C05: View Vehicle Service History
**Actor:** Customer
**Flow:**
1. Customer opens Customer Portal
2. Selects a vehicle from their registered vehicles
3. Views complete service history chronologically
4. Opens any past service record for details
5. Views past invoices and payments
6. Sees upcoming recommended maintenance (AI-predicted)
7. Exports service history as PDF
**Postcondition:** Customer has full visibility into vehicle history

### SC-C06: Chat with Service Advisor
**Actor:** Customer
**Flow:**
1. Customer opens Customer Chat Widget in portal
2. Types a question about their service or vehicle
3. AI chatbot attempts to answer common questions
4. If unresolved, conversation escalates to human advisor
5. Real-time chat via WebSocket
6. Advisor can share photos, documents, or estimates in chat
7. Chat history preserved for reference
**Postcondition:** Customer question answered

---

## 6. Accountant / Finance Scenarios

### SC-F01: Invoice Management
**Actor:** Accountant
**Flow:**
1. Accountant navigates to Invoices page
2. Views all invoices filtered by status (Draft, Sent, Paid, Overdue)
3. Creates a new invoice from a completed job card
4. System auto-populates line items from job card
5. Applies 15% VAT automatically (Saudi compliance)
6. Generates ZATCA-compliant QR code
7. Sends invoice to customer via email/SMS
8. Tracks payment status and sends reminders for overdue invoices
**Postcondition:** Invoice created, sent, and tracked

### SC-F02: Payment Processing & Reconciliation
**Actor:** Accountant
**Flow:**
1. Accountant views Payment dashboard
2. Records incoming payments (cash, card, bank transfer)
3. Matches payments to outstanding invoices
4. Processes refunds for returned services
5. Generates daily/weekly/monthly payment reports
6. Reconciles bank statements with system records
7. Exports financial data for external accounting software
**Postcondition:** Payments processed and reconciled

### SC-F03: Expense Tracking
**Actor:** Accountant
**Flow:**
1. Accountant opens Expenses module
2. Records operational expenses (rent, utilities, supplies)
3. Categorizes expenses by type and department
4. Attaches receipts/invoices as documentation
5. Tracks expense trends over time
6. Generates expense reports for management
**Postcondition:** Expenses documented and categorized

### SC-F04: Revenue Analytics & Reporting
**Actor:** Accountant
**Flow:**
1. Accountant opens Analytics > Revenue
2. Views revenue breakdown by service type, branch, period
3. Compares revenue against targets/forecasts
4. Analyzes profit margins by service category
5. Identifies top revenue-generating customers
6. Generates financial report with charts
7. Exports to PDF or Excel
**Postcondition:** Financial performance analyzed

### SC-F05: Saudi Tax Compliance (VAT & Zakat)
**Actor:** Accountant
**Flow:**
1. Accountant opens Compliance module
2. Reviews VAT collection summary for the period
3. Verifies all invoices have ZATCA QR codes
4. Calculates Zakat obligation (2.5% on eligible assets)
5. Generates VAT return report
6. Exports compliance documentation
7. Prepares filing for ZATCA authority
**Postcondition:** Tax compliance reports ready for filing

---

## 7. Purchase Agent Scenarios

### SC-P01: Purchase Order Creation
**Actor:** Purchase Agent
**Flow:**
1. Purchase Agent opens Purchase Agent Portal
2. Reviews parts requests from technicians and low-stock alerts
3. Searches supplier catalog for required parts
4. Compares prices across multiple suppliers
5. Creates purchase order with selected items
6. System calculates total with shipping and VAT
7. Submits PO for manager approval
8. After approval, PO sent to supplier
**Postcondition:** Purchase order created and submitted

### SC-P02: Supplier Management
**Actor:** Purchase Agent
**Flow:**
1. Purchase Agent navigates to Suppliers
2. Views supplier directory with ratings and performance metrics
3. Adds a new supplier with contact and payment details
4. Reviews supplier price lists and updates
5. Tracks delivery reliability and quality scores
6. Negotiates pricing and updates supplier price list
7. Blacklists underperforming suppliers
**Postcondition:** Supplier relationships managed

### SC-P03: Inventory Replenishment
**Actor:** Purchase Agent
**Flow:**
1. Purchase Agent views Inventory dashboard
2. Reviews auto-generated reorder suggestions (based on min stock levels)
3. Adjusts quantities based on demand forecast (AI-powered)
4. Selects preferred supplier for each item
5. Creates bulk purchase order
6. Tracks order shipment and ETA
7. Receives and verifies incoming stock
8. Updates inventory quantities
**Postcondition:** Inventory replenished to optimal levels

### SC-P04: Parts Network & Cross-Branch Transfer
**Actor:** Purchase Agent
**Flow:**
1. Purchase Agent opens Parts Network
2. Searches for a specific part across all branches
3. Identifies branch with available stock
4. Initiates inter-branch transfer request
5. Coordinates logistics and timeline
6. Receiving branch confirms delivery
7. Inventory updated at both branches
**Postcondition:** Parts transferred between branches

---

## 8. HR Manager Scenarios

### SC-HR01: Employee Onboarding
**Actor:** HR Manager
**Flow:**
1. HR Manager creates new employee profile
2. Enters personal details, qualifications, certifications
3. Assigns department and position
4. Sets salary, benefits, and commission structure
5. Creates system user account with appropriate role
6. Assigns to branch and shift schedule
7. Schedules onboarding training
8. Employee receives welcome email with credentials
**Postcondition:** New employee fully onboarded

### SC-HR02: Leave & Attendance Management
**Actor:** HR Manager
**Flow:**
1. HR Manager opens HR > Attendance
2. Reviews attendance records across all staff
3. Processes leave requests (approve/deny)
4. Views leave balances and usage trends
5. Identifies attendance issues (late arrivals, absences)
6. Generates attendance reports
**Postcondition:** Leave and attendance managed

### SC-HR03: Payroll Processing
**Actor:** HR Manager
**Flow:**
1. HR Manager opens Payroll module
2. Reviews timesheet data for the pay period
3. Calculates base salary + overtime + commission
4. Applies deductions (tax, insurance, advances)
5. Generates payslips for all employees
6. Reviews and approves payroll batch
7. Exports payroll data for bank transfer
**Postcondition:** Payroll calculated and approved

### SC-HR04: Training & Certification Tracking
**Actor:** HR Manager
**Flow:**
1. HR Manager opens Training module
2. Views certification status for all technicians
3. Identifies expiring certifications
4. Schedules training sessions
5. Records training completion
6. Updates technician skill profiles
7. Generates training compliance report
**Postcondition:** Training tracked and compliance maintained

---

## 9. Receptionist Scenarios

### SC-R01: Walk-in Customer Handling
**Actor:** Receptionist
**Flow:**
1. Customer walks into the garage
2. Receptionist searches for customer by phone/name
3. If new: quickly registers customer and vehicle
4. Checks for existing appointments
5. If no appointment: creates walk-in entry
6. Assigns customer to available service advisor
7. Prints check-in ticket or sends digital notification
**Postcondition:** Walk-in customer queued for service

### SC-R02: Phone Call Management
**Actor:** Receptionist
**Flow:**
1. Receptionist receives incoming call
2. Call center integration logs the call
3. Searches customer by phone number
4. Views customer's service history
5. Books appointment or transfers to appropriate department
6. Logs call notes and follow-up actions
**Postcondition:** Call handled and documented

### SC-R03: Vehicle Delivery & Handoff
**Actor:** Receptionist
**Flow:**
1. Job card status shows "Ready for Delivery"
2. Receptionist notifies customer (SMS/call)
3. Customer arrives for pickup
4. Receptionist pulls up completed job card
5. Reviews final invoice and confirms payment status
6. Customer signs delivery acknowledgment (e-signature)
7. Receptionist releases vehicle
8. Feedback request auto-sent to customer
**Postcondition:** Vehicle delivered and handoff documented

---

## 10. Call Center Agent Scenarios

### SC-CC01: Inbound Call Handling
**Actor:** Call Center Agent
**Flow:**
1. Agent joins the call center queue via WebSocket
2. Incoming call is routed to available agent
3. System displays caller's customer profile (if recognized)
4. Agent views vehicle and service history
5. Handles inquiry: appointment booking, status check, complaint
6. Creates ticket if issue needs escalation
7. Logs call outcome and notes
8. Call metrics tracked for performance
**Postcondition:** Customer inquiry handled

### SC-CC02: Outbound Follow-up Calls
**Actor:** Call Center Agent
**Flow:**
1. Agent views scheduled follow-up queue
2. Opens customer record with context
3. Makes follow-up call for: service reminder, feedback, overdue payment
4. Records call outcome
5. Schedules next follow-up if needed
6. Updates customer record with interaction notes
**Postcondition:** Follow-up completed and documented

### SC-CC03: Support Ticket Management
**Actor:** Call Center Agent
**Flow:**
1. Agent receives support ticket from customer portal
2. Reviews ticket details and customer history
3. Responds via internal support chat (WebSocket real-time)
4. Escalates to manager if unresolved
5. Tracks resolution time and status
6. Closes ticket with resolution summary
7. Customer receives satisfaction survey
**Postcondition:** Support ticket resolved

---

## 11. Compliance Officer Scenarios

### SC-CO01: Safety Compliance Audit
**Actor:** Compliance Officer
**Flow:**
1. Officer opens Compliance > Safety module
2. Reviews safety checklist completion rates
3. Views incident reports and their resolutions
4. Checks equipment inspection schedules
5. Verifies fire safety and emergency procedures
6. Generates compliance audit report
7. Creates action items for non-compliance findings
**Postcondition:** Safety compliance status documented

### SC-CO02: Environmental Compliance
**Actor:** Compliance Officer
**Flow:**
1. Officer opens Compliance > Environmental
2. Reviews waste disposal records
3. Checks emissions tracking data
4. Verifies carbon footprint calculations
5. Reviews carbon credit status (blockchain-tracked)
6. Generates environmental compliance report
**Postcondition:** Environmental compliance verified

### SC-CO03: License & Certification Audit
**Actor:** Compliance Officer
**Flow:**
1. Officer reviews all business licenses and permits
2. Checks expiry dates and renewal schedules
3. Verifies technician certifications are current
4. Reviews insurance policy status
5. Generates license compliance report
6. Triggers renewal reminders for expiring documents
**Postcondition:** All licenses and certifications verified

---

## 12. Cross-Role Scenarios

### SC-X01: End-to-End Service Journey
**Actors:** Customer, Receptionist, Service Advisor, Technician, Accountant
**Flow:**
1. **Customer** books appointment online via Customer Portal
2. **Customer** receives SMS/email confirmation
3. **Customer** arrives at garage
4. **Receptionist** checks in the customer, verifies appointment
5. **Service Advisor** conducts vehicle inspection with photos
6. **Service Advisor** creates estimate with AI-suggested services
7. **Customer** approves estimate with digital signature
8. **Service Advisor** creates job card from estimate
9. **Technician** receives job assignment notification
10. **Technician** executes service, logs progress in mobile app
11. **Technician** requests additional parts mid-service
12. **Purchase Agent** fulfills parts request
13. **Technician** completes service and quality checklist
14. **Service Advisor** reviews completed work
15. **Accountant** generates invoice with VAT and ZATCA QR
16. **Customer** pays online via Stripe/PayPal
17. **Receptionist** releases vehicle, customer signs delivery
18. **Customer** receives feedback request and submits review
19. **Manager** reviews service metrics on dashboard
**Postcondition:** Complete service cycle tracked and documented

### SC-X02: Emergency Repair Workflow
**Actors:** Customer, Manager, Service Advisor, Technician
**Flow:**
1. **Customer** calls with vehicle breakdown emergency
2. **Call Center Agent** creates emergency appointment
3. **Manager** overrides schedule to prioritize
4. **Service Advisor** prepares for emergency intake
5. **Customer** arrives (or vehicle is towed)
6. **Technician** performs rapid diagnostic
7. **Service Advisor** creates expedited estimate
8. **Customer** approves verbally (noted in system)
9. **Technician** begins immediate repair
10. **Manager** monitors progress closely
11. Expedited invoice and payment processing
**Postcondition:** Emergency handled with full documentation

### SC-X03: Multi-Language Service (Arabic)
**Actors:** Arabic-speaking Customer, Service Advisor
**Flow:**
1. **Customer** opens Customer Portal
2. Selects Arabic language from language switcher
3. Entire interface switches to RTL layout with Arabic text
4. Books appointment with Arabic form labels
5. Receives SMS in Arabic
6. **Service Advisor** views job card with Arabic notes
7. Invoice generated with Arabic details and Hijri date
8. ZATCA QR code includes Arabic business info
**Postcondition:** Full service in Arabic with Saudi compliance

### SC-X04: AI-Assisted Diagnostics
**Actors:** Service Advisor, Technician, AI System
**Flow:**
1. **Technician** connects OBD scanner to vehicle
2. System reads fault codes and vehicle data
3. **AI** analyzes codes with vehicle history
4. **AI** predicts potential related issues (predictive maintenance)
5. **AI** recommends parts with compatibility scores
6. **AI** estimates repair time and cost
7. **Service Advisor** reviews AI recommendations
8. **Service Advisor** presents findings to customer
9. AI confidence scores help prioritize recommendations
**Postcondition:** Diagnostic completed with AI augmentation

### SC-X05: Inventory Shortage Handling
**Actors:** Technician, Purchase Agent, Manager, Supplier
**Flow:**
1. **Technician** needs a part not in stock
2. Creates parts request from job card
3. **Purchase Agent** receives notification
4. Checks parts network across all branches
5. Part found at another branch -> initiates transfer
6. OR Part not found -> creates purchase order to supplier
7. **Manager** approves urgent purchase order
8. **Supplier** confirms availability and delivery date
9. **Purchase Agent** tracks shipment
10. Part arrives, inventory updated
11. **Technician** notified, resumes work
**Postcondition:** Parts shortage resolved with minimal delay

### SC-X06: Monthly Reporting Cycle
**Actors:** Manager, Accountant, HR Manager
**Flow:**
1. **Manager** requests monthly operations report
2. System compiles: jobs completed, revenue, customer satisfaction
3. **Accountant** generates financial reports (P&L, cash flow)
4. **Accountant** prepares VAT return for ZATCA
5. **HR Manager** generates attendance and payroll reports
6. All reports exported to PDF/Excel
7. **Manager** reviews consolidated dashboard
8. Key metrics shared in management meeting
**Postcondition:** Monthly business review completed

### SC-X07: Customer Loyalty Program
**Actors:** Customer, Marketing Manager, System
**Flow:**
1. **Customer** completes a service
2. System awards loyalty points based on spend
3. **Customer** views points balance in portal
4. At threshold, **Customer** redeems points for discount
5. **Marketing Manager** reviews loyalty program analytics
6. Sends targeted promotions to loyal customers
7. Referral system tracks customer referrals
8. Referred customers get welcome discount
**Postcondition:** Customer loyalty tracked and rewarded

### SC-X08: Fleet Management
**Actors:** Fleet Manager, Technician, System
**Flow:**
1. **Fleet Manager** registers fleet of vehicles
2. System tracks all vehicles with telematics data
3. AI predicts maintenance needs based on mileage/usage
4. System auto-generates maintenance appointments
5. **Technician** services fleet vehicles per schedule
6. Fleet reports generated showing total cost of ownership
7. Loaner vehicles managed when fleet vehicles are in service
**Postcondition:** Fleet maintained proactively

### SC-X09: Real-Time Chat & Collaboration
**Actors:** Service Advisor, Technician, Manager
**Flow:**
1. **Technician** discovers unexpected issue during service
2. Opens internal chat and messages **Service Advisor**
3. Shares photo of the issue via chat
4. **Service Advisor** reviews and consults with **Manager**
5. Decision made to proceed with additional work
6. **Service Advisor** updates job card and notifies customer
7. All communication logged in chat history
**Postcondition:** Team collaborated in real-time to resolve issue

### SC-X10: Data Export & Compliance
**Actors:** Admin, Compliance Officer, Customer
**Flow:**
1. **Customer** submits GDPR data request via portal
2. System logs request in gdprDataRequests table
3. **Compliance Officer** reviews and approves request
4. System exports all customer data (profile, vehicles, services, payments)
5. Data package sent to customer securely
6. Audit log records the data export
7. **Admin** can also generate compliance reports for regulators
**Postcondition:** Data request fulfilled in compliance with regulations

---

## Scenario Summary Matrix

| Role | Total Scenarios | Key Areas |
|------|----------------|-----------|
| Admin | 6 | Setup, Users, Security, Integrations |
| Manager | 6 | Dashboard, Jobs, Staff, Inventory, Complaints |
| Service Advisor | 5 | Check-in, Estimates, Scheduling, Communication |
| Technician | 5 | Jobs, Mobile, Parts, Quality, Time |
| Customer | 6 | Booking, Tracking, Payment, Feedback, History |
| Accountant | 5 | Invoices, Payments, Expenses, Reports, Tax |
| Purchase Agent | 4 | POs, Suppliers, Inventory, Transfers |
| HR Manager | 4 | Onboarding, Leave, Payroll, Training |
| Receptionist | 3 | Walk-ins, Calls, Delivery |
| Call Center | 3 | Inbound, Outbound, Tickets |
| Compliance | 3 | Safety, Environment, Licenses |
| Cross-Role | 10 | E2E Journeys, Emergency, AI, Fleet |
| **TOTAL** | **60** | **All business operations covered** |
