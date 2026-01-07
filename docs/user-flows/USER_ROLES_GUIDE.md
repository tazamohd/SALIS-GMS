# SALIS AUTO - User Roles & Personas Guide

## Overview

SALIS AUTO supports 24 professional roles across multiple departments. Each role has specific permissions, access levels, and workflows tailored to their responsibilities.

---

## 1. System Administrator

### Role Description
Full system access for platform configuration, user management, and system maintenance.

### Key Responsibilities
- User account management and role assignment
- System configuration and settings
- Security and access control
- Backup and disaster recovery
- Integration management

### Primary Workflows
1. **User Onboarding**: Create user → Assign role → Configure permissions → Send credentials
2. **System Configuration**: Access settings → Modify parameters → Test changes → Deploy
3. **Security Audit**: Review logs → Identify issues → Implement fixes → Document

### Access Level
- Full access to all modules
- Database administration
- API configuration
- Third-party integrations

### Key Pages
- `/dashboard` - System overview
- `/system-settings` - Platform configuration
- `/integrations` - Integration management
- `/data-import-export` - Data management

---

## 2. Franchise Owner

### Role Description
Business owner with oversight of multiple locations and franchise operations.

### Key Responsibilities
- Monitor overall business performance
- Review multi-location metrics
- Approve major expenditures
- Strategic planning and growth

### Primary Workflows
1. **Performance Review**: View dashboard → Compare locations → Analyze trends → Make decisions
2. **Franchise Expansion**: Evaluate market → Configure new location → Deploy resources → Monitor
3. **Financial Oversight**: Review revenue → Analyze costs → Approve budgets → Track ROI

### Access Level
- Read access to all locations
- Financial reports and analytics
- Strategic decision modules
- Franchise management tools

### Key Pages
- `/franchise-command-center` - Multi-location control
- `/multi-location-dashboard` - Location comparison
- `/business-intelligence-dashboard` - Analytics
- `/profit-margin-analysis` - Financial insights

---

## 3. Service Manager

### Role Description
Oversees daily service operations, technician assignments, and quality standards.

### Key Responsibilities
- Daily operations management
- Technician scheduling and assignment
- Quality control oversight
- Customer escalation handling
- Performance tracking

### Primary Workflows
1. **Daily Operations**: Review pending jobs → Assign technicians → Monitor progress → Resolve issues
2. **Resource Planning**: Check capacity → Schedule shifts → Balance workload → Optimize throughput
3. **Quality Management**: Review inspections → Address failures → Implement improvements → Track metrics

### Access Level
- Service bay management
- Technician scheduling
- Job card oversight
- Quality control
- Customer communication

### Key Pages
- `/service-bay-dashboard` - Real-time bay status
- `/workshop-calendar` - Visual scheduling
- `/smart-assignment` - AI-powered assignment
- `/quality-control` - Inspection management
- `/staff-scheduling` - Shift planning

---

## 4. Technician

### Role Description
Performs vehicle repairs, maintenance, and diagnostics.

### Key Responsibilities
- Execute assigned job cards
- Perform vehicle inspections
- Document work completed
- Request parts and materials
- Update job status

### Primary Workflows
1. **Job Execution**: Receive assignment → Start job → Log work → Request parts → Complete job
2. **Vehicle Inspection**: Check-in vehicle → Perform inspection → Document findings → Report issues
3. **Parts Request**: Identify need → Search inventory → Request parts → Receive confirmation

### Access Level
- Assigned job cards only
- Parts request (no procurement)
- Time logging
- Inspection documentation

### Key Pages
- `/technician-portal` - Personal dashboard
- `/job-cards` - Work orders
- `/parts-availability` - Parts lookup
- `/diagnostics-obd-hub` - Vehicle diagnostics
- `/vehicle-check-in` - Inspection tools

---

## 5. Service Advisor

### Role Description
Customer-facing role handling intake, estimates, and communication.

### Key Responsibilities
- Customer reception and intake
- Service estimate creation
- Customer communication
- Appointment scheduling
- Invoice explanation

### Primary Workflows
1. **Customer Intake**: Greet customer → Record vehicle → Document concerns → Create job card
2. **Estimate Creation**: Assess work needed → Price services → Add parts → Present to customer
3. **Status Updates**: Check job progress → Contact customer → Handle approvals → Schedule pickup

### Access Level
- Customer management
- Estimate creation
- Appointment scheduling
- Invoice viewing
- Communication tools

### Key Pages
- `/appointments` - Booking management
- `/estimates` - Quote creation
- `/customer-profiles` - Customer database
- `/vehicles` - Vehicle lookup
- `/service-reminders` - Follow-up scheduling

---

## 6. Customer / Client

### Role Description
External users accessing the customer portal for service requests and history.

### Key Responsibilities
- Book appointments
- View service history
- Track current services
- Make payments
- Provide feedback

### Primary Workflows
1. **Book Appointment**: Select service → Choose date/time → Confirm booking → Receive confirmation
2. **Track Service**: Log in → View status → Receive updates → Confirm completion
3. **Make Payment**: View invoice → Select method → Complete payment → Download receipt

### Access Level
- Own vehicles only
- Own service history
- Payment processing
- Feedback submission

### Key Pages
- `/client/dashboard` - Personal overview
- `/client/appointments` - Booking
- `/client/vehicles` - My vehicles
- `/client/invoices` - Payment history
- `/client/service-history` - Past services

---

## 7. HR Manager

### Role Description
Manages human resources, staffing, and employee development.

### Key Responsibilities
- Employee records management
- Recruitment and onboarding
- Performance reviews
- Training coordination
- Leave management

### Primary Workflows
1. **Employee Onboarding**: Create profile → Assign department → Set schedule → Configure access
2. **Performance Review**: Gather data → Conduct review → Document feedback → Set goals
3. **Leave Management**: Receive request → Check coverage → Approve/reject → Update schedule

### Access Level
- Employee records
- Payroll data
- Performance metrics
- Training management
- Scheduling

### Key Pages
- `/hr-management` - HR dashboard
- `/staff-directory` - Employee list
- `/leave-requests` - Leave approvals
- `/staff-scheduling` - Shift management
- `/training-lms` - Learning platform
- `/staff-performance-review` - Evaluations

---

## 8. Finance / Accountant

### Role Description
Manages financial operations, invoicing, and compliance.

### Key Responsibilities
- Invoice management
- Payment processing
- VAT/Zakat compliance
- Financial reporting
- Expense tracking

### Primary Workflows
1. **Invoice Processing**: Generate invoice → Apply tax → Send to customer → Track payment
2. **Tax Compliance**: Calculate VAT → Generate reports → Submit to ZATCA → Archive records
3. **Financial Reporting**: Gather data → Generate statements → Analyze trends → Present findings

### Access Level
- Full financial access
- Invoice management
- Tax settings
- Payment processing
- Financial reports

### Key Pages
- `/invoices` - Invoice management
- `/payments` - Payment tracking
- `/vat-settings` - VAT configuration
- `/zatca-settings` - E-invoicing
- `/zakat-settings` - Zakat management
- `/chart-of-accounts` - Accounting
- `/general-ledger` - Transactions
- `/financial-settings` - Configuration

---

## 9. Inventory Manager

### Role Description
Manages parts inventory, procurement, and stock levels.

### Key Responsibilities
- Stock level monitoring
- Purchase order creation
- Supplier management
- Stock audits
- Reorder optimization

### Primary Workflows
1. **Stock Monitoring**: Check levels → Identify low stock → Generate alerts → Plan orders
2. **Procurement**: Create PO → Select supplier → Approve order → Receive goods
3. **Stock Audit**: Count inventory → Compare records → Resolve discrepancies → Update system

### Access Level
- Full inventory access
- Purchase orders
- Supplier management
- Stock transfers
- Audit functions

### Key Pages
- `/inventory` - Stock management
- `/parts-auto-reorder` - Auto-reordering
- `/smart-inventory-forecasting` - Demand prediction
- `/vendor-supplier-portal` - Supplier management
- `/barcode-scanner` - Quick entry

---

## 10. Purchase Agent

### Role Description
Handles procurement, supplier negotiations, and purchase approvals.

### Key Responsibilities
- Purchase order management
- Supplier evaluation
- Price negotiation
- Delivery tracking
- Contract management

### Primary Workflows
1. **Purchase Order**: Receive request → Get quotes → Compare prices → Create PO → Track delivery
2. **Supplier Management**: Evaluate performance → Negotiate terms → Update contracts → Maintain records
3. **Cost Optimization**: Analyze spending → Identify savings → Implement changes → Track results

### Access Level
- Purchase orders
- Supplier database
- Contract management
- Approval workflows
- Cost reports

### Key Pages
- `/purchase-agent-portal` - Agent dashboard
- `/vendor-supplier-portal` - Suppliers
- `/contract-management` - Contracts
- `/parts-availability` - Parts search

---

## 11. Marketing Manager

### Role Description
Manages marketing campaigns, customer engagement, and brand promotion.

### Key Responsibilities
- Campaign planning
- Customer segmentation
- Email marketing
- Social media management
- Referral programs

### Primary Workflows
1. **Campaign Launch**: Define audience → Create content → Schedule delivery → Track results
2. **Customer Retention**: Identify at-risk → Design offers → Execute outreach → Measure impact
3. **Social Engagement**: Monitor channels → Respond to mentions → Create content → Analyze performance

### Access Level
- Marketing tools
- Customer data (limited)
- Campaign analytics
- Communication platforms
- Social media

### Key Pages
- `/marketing-automation` - Campaigns
- `/marketing-hub` - Overview
- `/email-marketing` - Email campaigns
- `/social-media-integration` - Social tools
- `/referral-program` - Referrals
- `/loyalty-program` - Customer rewards

---

## 12. Quality Control Inspector

### Role Description
Ensures service quality standards and compliance with procedures.

### Key Responsibilities
- Service inspections
- Quality audits
- Compliance verification
- Issue documentation
- Process improvement

### Primary Workflows
1. **Service Inspection**: Receive job → Inspect work → Document findings → Pass/fail decision
2. **Quality Audit**: Select sample → Perform audit → Record results → Generate report
3. **Issue Resolution**: Identify problem → Assign corrective action → Verify fix → Close issue

### Access Level
- Quality control module
- Inspection records
- Compliance reports
- Issue tracking
- Process documentation

### Key Pages
- `/quality-control` - Inspection dashboard
- `/iso-quality-management` - Standards
- `/computer-vision-qc` - AI inspection
- `/compliance-management` - Compliance

---

## Role Hierarchy & Permissions Matrix

```
Level 1: System Administrator
    └── Full system access

Level 2: Franchise Owner
    └── Multi-location oversight, financial access

Level 3: Department Managers
    ├── Service Manager (Operations)
    ├── HR Manager (People)
    ├── Finance Manager (Money)
    ├── Inventory Manager (Stock)
    └── Marketing Manager (Growth)

Level 4: Specialists
    ├── Service Advisor (Customer-facing)
    ├── Quality Inspector (Quality)
    ├── Purchase Agent (Procurement)
    └── Accountant (Finance)

Level 5: Operational Staff
    └── Technician (Service execution)

Level 6: External Users
    └── Customer/Client (Self-service)
```

---

## Login Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| System Administrator | admin@salisauto.com | admin123 |
| Technician | tech@salisauto.com | tech123 |
| Customer | client@salisauto.com | client123 |
| Purchase Agent | agent@salisauto.com | agent123 |

