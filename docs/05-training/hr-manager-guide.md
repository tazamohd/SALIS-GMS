# SALIS AUTO — HR Manager Guide

**Document Type:** Training Manual  
**Audience:** HR Managers  
**Level:** Standard  
**Version:** 14.0.0  

---

## Introduction

As HR Manager, you are responsible for the complete employee lifecycle — from onboarding new hires to managing performance, payroll, and compliance. SALIS AUTO's HR module provides all the tools you need in one integrated system.

**Login:** Your assigned HR Manager credentials  
**Start Page:** `/hr-management`

---

## Chapter 1: HR Dashboard (`/hr-management`)

### What You See
- **Headcount Summary** — Total staff by department and branch
- **Pending Actions** — Leave requests awaiting approval, reviews due
- **This Month at a Glance** — New hires, terminations, payroll date
- **Compliance Alerts** — Expiring contracts, missing documentation
- **Training Progress** — Course completion rates

---

## Chapter 2: Employee Records

### 2.1 Staff Directory (`/staff-directory`)
View all employees with their key details.

**Data Available Per Employee:**
- Personal information (name, ID, nationality, contact)
- Employment details (role, department, branch, start date)
- Contract type (full-time, part-time, contractor)
- Salary and benefits
- Current leave balance
- Performance rating

### 2.2 Adding a New Employee
1. Go to Staff Directory → Add Employee
2. Fill in:
   - Personal information
   - Emergency contact
   - Bank account details (for payroll)
   - Employment start date
   - Job title and department
   - Salary (monthly or hourly)
3. Upload documents:
   - Copy of ID (Iqama for expatriates)
   - Employment contract
   - Academic certificates
4. Assign access credentials → user account created
5. Enroll in mandatory training courses

### 2.3 Employee Offboarding
1. Change employee status to "Leaving"
2. Calculate final settlement:
   - Remaining leave balance (convert to pay)
   - End of service gratuity (per Saudi labor law)
   - Notice period deductions (if applicable)
3. Collect company assets (access card, uniform, tools)
4. Deactivate user account (security step)
5. Issue experience certificate

---

## Chapter 3: Leave Management (`/leave-requests`)

### 3.1 Leave Request Workflow
```
Employee submits leave request
    ↓
HR notified (email + in-app)
    ↓
Check: Leave balance sufficient?
Check: Department coverage during period?
    ↓
Approve or Reject (with reason)
    ↓
Employee notified
    ↓
Calendar and schedule updated automatically
```

### 3.2 Saudi Labor Law Leave Entitlements
| Leave Type | Entitlement |
|-----------|------------|
| Annual Leave | 21 days (first 5 years), 30 days thereafter |
| Sick Leave | 30 days (first 30 days full pay, next 60 half pay) |
| Maternity Leave | 10 weeks |
| Paternity Leave | 3 days |
| Hajj Leave | 10 days (once during employment) |
| Bereavement | 3 days (immediate family) |

### 3.3 Leave Balance Tracking
Each employee's leave balance shows:
- Entitlement for the year
- Days used to date
- Days remaining
- Days pending approval

---

## Chapter 4: Timesheets & Attendance

### 4.1 Reviewing Timesheets (`/timesheet-management`)
Weekly workflow:
1. Employees submit timesheets Friday evening
2. Review actual hours vs. scheduled hours
3. Check against time clock data for accuracy
4. Investigate discrepancies (late arrivals, early departures)
5. Approve or request corrections
6. Approved timesheets → Sent to payroll

### 4.2 Monitoring Attendance
**Reports Available:**
- Daily attendance report (who clocked in)
- Late arrival report (>15 minutes late)
- Absence report (absent without leave)
- Overtime report (hours beyond scheduled)

### 4.3 Managing Overtime
Saudi labor law overtime:
- More than 8 hours/day → 150% of hourly rate
- Friday (day off) → 200% of hourly rate
- Public holidays → 200% + day off in lieu

---

## Chapter 5: Payroll (`/payroll-management`)

### 5.1 Monthly Payroll Process
**Run on:** Between 25th–30th of each month

**Steps:**
1. Verify all timesheets are approved
2. Check approved leave records
3. Review overtime claims
4. Click "Preview Payroll Run"
5. Review payroll summary per employee
6. Identify discrepancies — correct if needed
7. Click "Process Payroll"
8. Generate bank transfer file (SADAD format)
9. Send salary slips to employees (email + portal)

### 5.2 Payroll Components
| Component | Calculation |
|-----------|------------|
| Basic Salary | Fixed monthly amount |
| Housing Allowance | % of basic (if applicable) |
| Transport Allowance | Fixed amount |
| Overtime | Hours × hourly rate × 1.5/2.0 |
| Late Deductions | Hours × hourly rate |
| Leave deductions | Unpaid leave days |
| GOSI contribution | 11% of basic (Saudi nationals) |

---

## Chapter 6: Performance Reviews

### 6.1 Review Schedule
- **Probation Review** — 3 months after hire date
- **Mid-Year Review** — July each year
- **Annual Review** — January each year
- **Promotion Review** — As needed

### 6.2 Creating a Performance Review
1. Go to Staff Performance Review
2. Click "Create Review" for employee
3. Select review type and period
4. Score each competency:
   - Technical Skills (1–5)
   - Customer Service (1–5)
   - Team Collaboration (1–5)
   - Attendance & Punctuality (1–5)
   - Initiative (1–5)
5. Write narrative feedback
6. Set goals for next period
7. Submit to employee for acknowledgement

### 6.3 Salary Review Based on Performance
| Rating | Salary Increase |
|--------|----------------|
| Outstanding (4.5–5.0) | 10–15% |
| Exceeds Expectations (4.0–4.4) | 7–10% |
| Meets Expectations (3.0–3.9) | 3–5% |
| Needs Improvement (2.0–2.9) | 0% + PIP |
| Unsatisfactory (<2.0) | Disciplinary action |

---

## Chapter 7: Training (`/training-lms`)

### 7.1 Mandatory Training Courses
| Course | Audience | Frequency |
|--------|----------|-----------|
| Safety Induction | All new hires | On hire |
| ZATCA Awareness | Finance, Admin | Annual |
| Customer Service | Customer-facing | Annual |
| Fire Safety | All | Annual |
| Data Privacy | All | Annual |

### 7.2 Tracking Training Completion
Dashboard shows:
- % of employees with current training
- Overdue training by person
- Upcoming expiry dates
- Non-compliant employees (flagged)

### 7.3 Adding Training Content
1. Go to Training LMS → Create Course
2. Upload video/PDF content
3. Add quiz questions
4. Set pass score (typically 80%)
5. Assign to roles or specific employees
6. Set deadline for completion

---

## Chapter 8: Compliance & Documentation

### 8.1 Document Expiry Tracking
HR must monitor:
- **Iqama (Residence Permit)** — Expatriate employees only
- **Employment contracts** — Renewal dates
- **Professional certificates** — Technician certifications
- **GOSI registration** — Monthly contributions

### 8.2 Saudi Labor Law Compliance
Key compliance requirements:
- Maximum 48 hours work per week (Ramadan: 36 hours)
- Weekly day off (Friday mandatory)
- Annual leave must be taken within the year
- GOSI contributions on time (by 10th of following month)
- End of service gratuity calculation

---

*SALIS AUTO HR Manager Guide — Version 14.0.0*
