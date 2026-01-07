# SALIS AUTO - Complete User Scenarios Reference

## Overview

This document provides a comprehensive reference of all user scenarios organized by role and module. Use this as a quick lookup guide for testing, training, and development.

---

## Customer Scenarios

### CS-001: New Customer Registration
**Flow**: Walk-in → Reception → Profile Creation → Vehicle Add
**Actors**: Customer, Service Advisor
**Steps**: Collect info → Create profile → Add vehicle → VIN decode
**Expected Result**: Customer and vehicle in system

### CS-002: Online Appointment Booking
**Flow**: Portal → Service Select → Date/Time → Confirm
**Actors**: Customer
**Steps**: Login → Select service → Choose slot → Book
**Expected Result**: Appointment confirmed, reminders set

### CS-003: Service Status Check
**Flow**: Portal → My Services → View Status
**Actors**: Customer
**Steps**: Login → View active services → Check progress
**Expected Result**: Current status displayed with updates

### CS-004: Estimate Approval (Digital)
**Flow**: Notification → Review → Approve/Decline
**Actors**: Customer
**Steps**: Receive notification → View estimate → Make decision
**Expected Result**: Approval recorded, work proceeds or declined

### CS-005: Online Payment
**Flow**: Invoice → Payment Method → Process → Receipt
**Actors**: Customer
**Steps**: View invoice → Select payment → Complete → Download receipt
**Expected Result**: Payment processed, loyalty points added

### CS-006: Service History Review
**Flow**: Portal → History → Filter → View Details
**Actors**: Customer
**Steps**: Access history → Filter by vehicle/date → View past services
**Expected Result**: Complete service history displayed

### CS-007: Loyalty Points Redemption
**Flow**: Checkout → Apply Points → Discount Applied
**Actors**: Customer
**Steps**: At payment → Check balance → Apply points → Reduced total
**Expected Result**: Points deducted, discount applied

### CS-008: Submit Feedback
**Flow**: Post-Service → Feedback Form → Submit → AI Analysis
**Actors**: Customer
**Steps**: Receive request → Complete survey → Submit feedback
**Expected Result**: Feedback recorded, sentiment analyzed

---

## Technician Scenarios

### TS-001: View Daily Assignments
**Flow**: Portal Login → Dashboard → Job List
**Actors**: Technician
**Steps**: Login → View today's jobs → Check priorities
**Expected Result**: All assignments visible with details

### TS-002: Start Job Card
**Flow**: Job Details → Start → Clock In → Bay Assignment
**Actors**: Technician
**Steps**: Select job → Start work → System records time → Bay assigned
**Expected Result**: Job in progress, timer running

### TS-003: Request Parts
**Flow**: Job Details → Parts Tab → Search → Request
**Actors**: Technician, Parts Staff
**Steps**: Identify need → Search catalog → Submit request → Wait for delivery
**Expected Result**: Parts requested, notification to parts staff

### TS-004: Document Work with Photos
**Flow**: Job Details → Photos → Capture → Add to Record
**Actors**: Technician
**Steps**: Open camera → Take photos → Add notes → Save
**Expected Result**: Photos attached to job card

### TS-005: Perform OBD Scan
**Flow**: Diagnostics → Connect Scanner → Read DTCs → Save
**Actors**: Technician
**Steps**: Connect OBD → Start scan → View codes → Save to job
**Expected Result**: DTCs recorded in diagnostic hub

### TS-006: Complete Job Card
**Flow**: Work Done → Complete → Clock Out → Submit for QC
**Actors**: Technician
**Steps**: Finish work → Mark complete → System records time → QC queue
**Expected Result**: Job ready for quality check

### TS-007: Use AR Repair Guide
**Flow**: Job Details → AR Guide → Follow Steps → Complete
**Actors**: Technician
**Steps**: Open AR → Point at component → Follow overlay → Confirm steps
**Expected Result**: Repair completed with guidance

### TS-008: Flag Additional Work
**Flow**: Discovery → Document → Notify Advisor → Create Supplement
**Actors**: Technician, Service Advisor
**Steps**: Find issue → Document with photo → Alert advisor → Await approval
**Expected Result**: Additional work documented, estimate created

---

## Service Advisor Scenarios

### SA-001: Customer Check-In
**Flow**: Customer Arrives → Greet → Verify Appointment → Process
**Actors**: Service Advisor, Customer
**Steps**: Welcome → Confirm details → Print key tag → Assign bay
**Expected Result**: Vehicle checked in, job card active

### SA-002: Create Estimate
**Flow**: Diagnosis → Add Items → Calculate → Present
**Actors**: Service Advisor
**Steps**: Review findings → Add labor/parts → Calculate total → Send to customer
**Expected Result**: Estimate generated and delivered

### SA-003: Customer Communication
**Flow**: Status Change → Notify Customer → Handle Response
**Actors**: Service Advisor, Customer
**Steps**: Update status → Send notification → Answer questions → Update system
**Expected Result**: Customer informed and satisfied

### SA-004: Schedule Appointment
**Flow**: Customer Request → Check Availability → Book → Confirm
**Actors**: Service Advisor, Customer
**Steps**: Receive request → Check calendar → Book slot → Send confirmation
**Expected Result**: Appointment scheduled

### SA-005: Process Vehicle Pickup
**Flow**: Work Complete → Explain Work → Present Invoice → Collect Payment → Return Keys
**Actors**: Service Advisor, Customer
**Steps**: Review work → Show before/after → Collect payment → Return vehicle
**Expected Result**: Customer satisfied, payment received

### SA-006: Handle Customer Complaint
**Flow**: Complaint Received → Document → Escalate → Resolve
**Actors**: Service Advisor, Manager
**Steps**: Listen → Document issue → Escalate if needed → Provide resolution
**Expected Result**: Complaint resolved, customer retained

---

## Service Manager Scenarios

### SM-001: Daily Operations Review
**Flow**: Morning → Dashboard → Review Pending → Plan Day
**Actors**: Service Manager
**Steps**: Check overnight status → Review pending jobs → Assign resources → Set priorities
**Expected Result**: Day planned, team aligned

### SM-002: Technician Assignment
**Flow**: New Job → Evaluate → Match Technician → Assign
**Actors**: Service Manager
**Steps**: Review job requirements → Check availability → Select best match → Assign
**Expected Result**: Job assigned to qualified technician

### SM-003: Service Bay Management
**Flow**: Monitor Bays → Balance Load → Optimize Flow
**Actors**: Service Manager
**Steps**: View bay status → Identify bottlenecks → Reallocate resources
**Expected Result**: Optimal bay utilization

### SM-004: Quality Issue Resolution
**Flow**: QC Fail → Investigate → Correct → Verify
**Actors**: Service Manager, Technician
**Steps**: Review failure → Identify root cause → Assign correction → Verify fix
**Expected Result**: Issue resolved, lesson learned

### SM-005: Performance Review
**Flow**: Select Period → Review Metrics → Analyze → Act
**Actors**: Service Manager
**Steps**: Access reports → Review KPIs → Identify trends → Plan improvements
**Expected Result**: Performance insights, action items

---

## Finance Scenarios

### FI-001: Generate Invoice
**Flow**: Job Complete → Create Invoice → Add VAT → Generate ZATCA QR
**Actors**: Finance Staff
**Steps**: Select job card → Generate invoice → Apply VAT → Create QR code
**Expected Result**: ZATCA-compliant invoice ready

### FI-002: Process Payment
**Flow**: Invoice → Receive Payment → Record → Receipt
**Actors**: Finance Staff
**Steps**: Present invoice → Accept payment → Record transaction → Provide receipt
**Expected Result**: Payment recorded, books balanced

### FI-003: VAT Return Submission
**Flow**: Period End → Calculate → Review → Submit
**Actors**: Accountant
**Steps**: Compile transactions → Calculate net VAT → Review report → Submit to ZATCA
**Expected Result**: VAT return submitted on time

### FI-004: Process Refund
**Flow**: Request → Verify → Approve → Process → Credit Note
**Actors**: Finance Manager
**Steps**: Receive request → Verify original → Approve refund → Process → Generate credit note
**Expected Result**: Refund issued, credit note generated

### FI-005: Accounts Receivable Management
**Flow**: Monitor → Follow Up → Collect → Update
**Actors**: Finance Staff
**Steps**: Review aging → Contact overdue customers → Collect payment → Update records
**Expected Result**: Receivables collected, aging reduced

---

## HR Scenarios

### HR-001: Employee Onboarding
**Flow**: Hire → Create Profile → Assign Role → Train → Activate
**Actors**: HR Manager
**Steps**: Create user → Enter details → Assign department → Configure access → Activate
**Expected Result**: New employee fully set up

### HR-002: Leave Request Processing
**Flow**: Request → Review → Approve/Reject → Update Schedule
**Actors**: HR Manager, Employee
**Steps**: Receive request → Check coverage → Make decision → Update calendar
**Expected Result**: Leave status updated, schedule adjusted

### HR-003: Shift Scheduling
**Flow**: Review Needs → Create Schedule → Publish → Notify
**Actors**: HR Manager
**Steps**: Check workload → Create shifts → Assign staff → Publish → Notify team
**Expected Result**: Schedule published, team notified

### HR-004: Performance Review
**Flow**: Gather Data → Conduct Review → Document → Set Goals
**Actors**: HR Manager, Manager, Employee
**Steps**: Collect metrics → Meet with employee → Document feedback → Define objectives
**Expected Result**: Review documented, goals set

### HR-005: Training Assignment
**Flow**: Identify Need → Assign Course → Track Progress → Certify
**Actors**: HR Manager
**Steps**: Identify skill gap → Assign training → Monitor completion → Record certification
**Expected Result**: Employee trained, certificate issued

---

## Inventory Scenarios

### IN-001: Receive Stock
**Flow**: PO Received → Inspect → Count → Enter → Allocate
**Actors**: Inventory Manager
**Steps**: Match to PO → Inspect quality → Count items → Enter in system → Allocate to shelves
**Expected Result**: Stock received and available

### IN-002: Parts Issue for Job
**Flow**: Request → Locate → Pick → Deliver → Record
**Actors**: Parts Staff, Technician
**Steps**: Receive request → Find part → Pick from shelf → Deliver to bay → Record usage
**Expected Result**: Part delivered, inventory updated

### IN-003: Stock Count
**Flow**: Schedule → Count → Compare → Adjust → Document
**Actors**: Inventory Manager
**Steps**: Plan count → Physical count → Compare to system → Adjust variances → Document
**Expected Result**: Inventory accurate, variances explained

### IN-004: Auto-Reorder
**Flow**: Low Stock Alert → AI Predicts → Generate PO → Submit
**Actors**: System (Automated)
**Steps**: Stock hits reorder point → AI calculates quantity → Create PO → Send to supplier
**Expected Result**: Stock replenished before stockout

### IN-005: Transfer Between Locations
**Flow**: Request → Approve → Ship → Receive → Update
**Actors**: Inventory Manager (both locations)
**Steps**: Create transfer → Get approvals → Ship items → Receive → Update both inventories
**Expected Result**: Stock transferred, records updated

---

## Quality Control Scenarios

### QC-001: Perform Inspection
**Flow**: Job Complete → Receive → Inspect → Pass/Fail
**Actors**: QC Inspector
**Steps**: Get job → Review work order → Inspect work → Test → Record result
**Expected Result**: Inspection documented with result

### QC-002: Handle Failed Inspection
**Flow**: Fail → Document → Return → Re-inspect
**Actors**: QC Inspector, Technician
**Steps**: Document failures → Return to technician → Rework → Re-inspect
**Expected Result**: Issue corrected, inspection passed

### QC-003: Computer Vision Inspection
**Flow**: Upload Photo → AI Analysis → Confirm → Record
**Actors**: QC Inspector
**Steps**: Take photo → Upload → AI analyzes → Review findings → Confirm
**Expected Result**: AI-assisted inspection recorded

---

## Admin Scenarios

### AD-001: User Management
**Flow**: Create/Modify User → Set Role → Configure Access
**Actors**: System Administrator
**Steps**: Add user → Enter details → Assign role → Set permissions → Activate
**Expected Result**: User configured correctly

### AD-002: System Configuration
**Flow**: Access Settings → Modify → Test → Deploy
**Actors**: System Administrator
**Steps**: Access settings → Make changes → Test in dev → Deploy to production
**Expected Result**: Configuration updated

### AD-003: Integration Management
**Flow**: Configure → Test → Activate → Monitor
**Actors**: System Administrator
**Steps**: Enter API keys → Test connection → Enable integration → Monitor health
**Expected Result**: Integration active and healthy

### AD-004: Security Audit
**Flow**: Review Logs → Identify Issues → Remediate → Document
**Actors**: System Administrator
**Steps**: Access audit logs → Analyze activity → Identify concerns → Take action
**Expected Result**: Security maintained, issues addressed

---

## Scenario ID Reference

| Prefix | Module |
|--------|--------|
| CS | Customer |
| TS | Technician |
| SA | Service Advisor |
| SM | Service Manager |
| FI | Finance |
| HR | Human Resources |
| IN | Inventory |
| QC | Quality Control |
| AD | Administration |
| FR | Franchise |
| CO | Compliance |

---

## Test Coverage Matrix

| Scenario | Unit Test | Integration Test | E2E Test |
|----------|-----------|------------------|----------|
| CS-001 | ✅ | ✅ | ✅ |
| CS-002 | ✅ | ✅ | ✅ |
| CS-003 | ✅ | ✅ | ✅ |
| TS-001 | ✅ | ✅ | ✅ |
| TS-002 | ✅ | ✅ | ✅ |
| FI-001 | ✅ | ✅ | ✅ |
| FI-003 | ✅ | ✅ | ✅ |
| ... | ... | ... | ... |

