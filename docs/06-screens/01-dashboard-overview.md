# Screen Documentation — Section 01: Dashboard & Home

**Screens:** 001–003  
**Section:** Dashboard & Overview  
**Navigation Group:** Dashboard & Overview  

---

## Overview

The Dashboard section is the first screen users see after login. It provides a high-level summary of the garage's operational status and routes users to their role-specific workspaces.

---

## Screen 001 — Dashboard Home (`/`)

### Description
The root URL renders the main operational dashboard — the primary overview for management staff. This is the default landing page for all non-specialized roles.

### Purpose
Provide at-a-glance operational awareness for the entire garage or branch.

### Key Elements
- **Revenue Summary Card** — Today's revenue vs. target with percentage change
- **Active Job Cards** — Count of jobs currently in progress
- **Technician Utilization** — % of technicians actively working vs. available
- **Bay Occupancy** — Real-time service bay status
- **Recent Jobs Feed** — Latest job cards with status
- **Upcoming Appointments** — Next 24 hours of scheduled appointments
- **Inventory Alerts** — Parts at or below minimum stock
- **Quick Actions Bar** — New Job Card, New Appointment, Add Customer

### User Scenarios

**Scenario 1: Morning Operations Check**
> Service Manager logs in at 8:00 AM, views today's appointment list, checks which bays are occupied, and notes 2 inventory alerts requiring attention before the day gets busy.

**Scenario 2: Revenue Monitoring**
> Owner checks evening dashboard, sees revenue is 12% above daily target, notes 3 jobs are still in-progress past estimated completion time.

**Scenario 3: Quick Action**
> Receptionist receives a walk-in customer, clicks "New Job Card" from the Quick Actions bar to start the intake process immediately.

### User Flow
```
Login → Dashboard Home
├── Check KPI cards → Investigate if anomalies found
├── View active jobs → Click to open specific job card
├── Check alerts → Navigate to Inventory or Calendar
└── Quick action → New appointment or job card
```

### Recommendations
- Configure dashboard widgets to match the most-viewed KPIs for your operation
- Enable browser notifications for real-time alerts
- Customize the Quick Actions bar via Dashboard Settings

---

## Screen 002 — Welcome Page (`/welcome`)

### Description
A role-based routing page that directs users to their appropriate portal after login. Non-management roles are redirected from this page to their specific workspace.

### Purpose
Provide a personalized entry point based on user role.

### Role Routing Map
| Role | Redirected To |
|------|--------------|
| TECHNICIAN | /technician-portal |
| HR_MANAGER | /hr-management |
| ACCOUNTANT | /chart-of-accounts |
| PURCHASE_AGENT | /purchase-agent |
| CUSTOMER | /client |
| All others | /dashboard |

### User Scenarios

**Scenario 1: Technician Login**
> Tech clicks login → sees Welcome Page briefly → automatically redirected to Technician Portal with their assigned jobs for today.

**Scenario 2: Customer Login**
> Customer logs in → Welcome Page → redirected to Client Portal showing their vehicles and upcoming appointments.

### User Flow
```
Login Complete → Welcome Page
└── Role detection
    ├── TECHNICIAN → /technician-portal
    ├── HR_MANAGER → /hr-management
    ├── PURCHASE_AGENT → /purchase-agent
    ├── CUSTOMER → /client
    └── Other → /dashboard
```

---

## Screen 003 — Dashboard Main (`/dashboard`)

### Description
The primary analytics dashboard with comprehensive metrics, charts, and business intelligence visualizations.

### Purpose
Strategic overview for owners and general managers with trend analysis and performance tracking.

### Key Elements
- **Revenue Chart** — 30-day revenue trend (bar/line chart)
- **Job Volume Chart** — Daily job count trend
- **Parts Revenue vs. Labor Revenue** — Split breakdown
- **Top Services** — Most common service types
- **Customer Growth Chart** — New vs. returning customers
- **Technician Performance Rankings** — Top performers
- **Profit Margin Indicators** — Per service category
- **Date Range Selector** — Today / This Week / This Month / Custom

### User Scenarios

**Scenario 1: Monthly Business Review**
> Owner pulls up Dashboard Main at month-end, selects "This Month" date range, reviews revenue trend (up 8% vs. last month), notes weekend revenue spikes, and plans additional weekend staffing.

**Scenario 2: Identifying Service Mix**
> Manager analyzes Top Services chart — discovers tire services have increased 40% this quarter, prompts ordering additional tire stock.

**Scenario 3: Comparing Technician Output**
> Service Manager reviews technician rankings to identify training needs and recognizes top performers for the monthly bonus.

### User Flow
```
Dashboard Main
├── Select date range
│   ├── Apply → Charts refresh with filtered data
├── Click any chart data point
│   └── Drill down to specific records
├── Export reports → PDF/Excel download
└── Set alerts → Configure threshold notifications
```

### Chart Types Used
- **Bar Chart** — Revenue by day
- **Line Chart** — Trend over time
- **Pie/Donut Chart** — Service type breakdown
- **Progress Bars** — Technician utilization
- **Sparklines** — Quick trend indicators on KPI cards

### Recommendations
- Set up daily email summary via Settings → Notifications
- Pin most-viewed date range as default
- Share dashboard link with stakeholders (requires login)

---

## Navigation Group: Dashboard & Overview

### Workflow Position
This group sits at position 1 in the 18-group navigation workflow.

```
Navigation Sidebar → Group 1: Dashboard & Overview
├── 🏠 Dashboard Home (/)
├── 📊 Analytics Dashboard (/dashboard)
├── 📋 KPI Dashboard (/kpi-dashboard)
└── 🎛️ Dashboard Widgets (/dashboard-widgets)
```

### Data Sources
All dashboard data comes from:
- Real-time job card status updates
- Invoice and payment records
- Technician time clock data
- Inventory levels

### Refresh Behavior
- KPI cards: Real-time (WebSocket updates for bay status)
- Charts: Refreshed on page load + every 5 minutes
- Alerts: Real-time via WebSocket

---

*Screen Documentation 01 — Dashboard & Home*
