# SALIS AUTO - Enterprise & Franchise Management Flows

## Overview

SALIS AUTO supports multi-location franchise operations with centralized management, performance monitoring, and resource sharing capabilities.

---

## 1. Multi-Location Management

### Location: `/multi-location-dashboard`, `/franchise-command-center`

---

### Flow 1.1: Location Setup

**Trigger**: New franchise location opening

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Create       │───▶│ Configure    │───▶│ Assign       │
│ Location     │    │ Settings     │    │ Resources    │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Basic Info         Local Config        Staff/Inventory
```

**Steps**:
1. Admin creates new location
2. Enter location details:
   - Name and address
   - Contact information
   - Operating hours
   - Tax registrations
3. Configure local settings:
   - Services offered
   - Pricing adjustments
   - Local compliance
4. Assign initial resources:
   - Staff members
   - Equipment
   - Initial inventory
5. Set up integrations:
   - Payment terminals
   - Phone numbers
   - Email addresses
6. Configure reporting:
   - Dashboard access
   - Report recipients
7. Location goes live

**User Scenarios**:
- Open new branch
- Acquire existing shop
- Expand to new city

---

### Flow 1.2: Cross-Location Monitoring

**Trigger**: Manager views dashboard

**Metrics Displayed**:
1. **Per Location**:
   - Revenue (daily/weekly/monthly)
   - Jobs completed
   - Technician utilization
   - Customer satisfaction
   - Inventory value

2. **Comparative**:
   - Location ranking
   - Performance trends
   - Target achievement
   - Growth rates

**Steps**:
1. Manager accesses multi-location dashboard
2. View summary cards for all locations
3. Drill down into specific location
4. Compare performance metrics
5. Identify outliers
6. Generate comparative reports

**User Scenarios**:
- Daily performance review
- Monthly business review
- Identify underperforming locations
- Benchmark best practices

---

### Flow 1.3: Resource Transfer

**Trigger**: Need to balance resources

**Transferable Resources**:
- Staff (temporary assignment)
- Inventory (parts)
- Equipment

**Steps**:
1. Identify transfer need
2. Check source availability
3. Verify destination requirement
4. Create transfer request
5. Approval workflow:
   - Source manager approves release
   - Destination manager accepts
   - Central approves (if policy)
6. Execute transfer:
   - Update locations
   - Adjust inventory counts
   - Update staff assignments
7. Track transfer status
8. Confirm receipt

**User Scenarios**:
- Send technician to busy location
- Transfer parts for urgent repair
- Move equipment for project

---

## 2. Franchise Command Center

### Location: `/franchise-command-center`

---

### Flow 2.1: Franchise Performance Overview

**Trigger**: Franchise owner login

**Dashboard Components**:
1. **KPI Summary**:
   - Total network revenue
   - Total jobs completed
   - Network-wide NPS
   - Compliance status

2. **Location Cards**:
   - Quick status view
   - Key metrics
   - Alerts/issues
   - Quick actions

3. **Trend Analysis**:
   - Revenue trends
   - Volume trends
   - Efficiency trends

4. **Alerts**:
   - Compliance issues
   - Performance dips
   - Resource shortages
   - Customer complaints

**User Scenarios**:
- Morning status check
- Executive briefing preparation
- Investor reporting

---

### Flow 2.2: Franchise Reporting

**Trigger**: Scheduled or on-demand

**Report Types**:
1. **Financial Reports**:
   - P&L by location
   - Revenue breakdown
   - Cost analysis
   - Royalty calculations

2. **Operational Reports**:
   - Job completion rates
   - Technician productivity
   - Bay utilization
   - Parts usage

3. **Customer Reports**:
   - Satisfaction scores
   - Retention rates
   - Loyalty program stats
   - Complaint analysis

4. **Compliance Reports**:
   - Tax submissions
   - Certification status
   - Audit results

**Steps**:
1. Select report type
2. Choose parameters:
   - Date range
   - Locations
   - Comparison period
3. Generate report
4. View online or export
5. Schedule recurring delivery
6. Share with stakeholders

---

### Flow 2.3: Royalty Management

**Trigger**: Period end (monthly/quarterly)

**Steps**:
1. Calculate location revenues
2. Apply royalty rate (per contract)
3. Calculate royalty due
4. Generate royalty statement
5. Send to franchisee
6. Track payment
7. Record in accounting

**User Scenarios**:
- Monthly royalty calculation
- Dispute resolution
- Payment tracking

---

## 3. Globalization Layer

### Location: `/globalization-layer`

---

### Flow 3.1: Multi-Currency Support

**Trigger**: Transaction in different currency

**Supported Currencies**:
- SAR (Saudi Riyal) - Primary
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- AED (UAE Dirham)

**Steps**:
1. Transaction initiated
2. Currency selected
3. Exchange rate applied:
   - Real-time or daily rate
   - System configured source
4. Amounts converted
5. Display in selected currency
6. Store in base currency (SAR)
7. Record exchange details

**User Scenarios**:
- International customer
- Multi-currency reporting
- Foreign supplier payment

---

### Flow 3.2: Multi-Language Support

**Trigger**: User language preference

**Supported Languages**:
- Arabic (العربية) - Primary
- English - Secondary

**Steps**:
1. User selects language
2. UI loads translated content
3. Date/number formats adjusted
4. RTL/LTR layout applied
5. Preference saved
6. Applied across sessions

**User Scenarios**:
- Arabic-speaking staff
- English-speaking customer
- Bilingual documents

---

### Flow 3.3: Regional Compliance

**Trigger**: Transaction in specific region

**Regional Variations**:
1. **Saudi Arabia**:
   - VAT 15%
   - ZATCA e-invoicing
   - Zakat requirements
   - Hijri calendar option

2. **UAE**:
   - VAT 5%
   - FTA e-invoicing
   - Corporate tax

3. **Other GCC**:
   - Regional tax rates
   - Local compliance

**Steps**:
1. Transaction location identified
2. Regional rules applied
3. Correct tax rates used
4. Appropriate compliance checks
5. Regional documents generated

---

## 4. SLA & Contract Management

### Location: `/contract-management`

---

### Flow 4.1: Fleet Customer Contract

**Trigger**: New fleet customer onboarding

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Define       │───▶│ Set          │───▶│ Monitor      │
│ Terms        │    │ SLAs         │    │ Compliance   │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Contract Elements**:
1. **Customer Details**:
   - Company information
   - Authorized contacts
   - Billing details

2. **Service Terms**:
   - Covered services
   - Pricing (fixed/discount)
   - Payment terms
   - Duration

3. **SLA Definitions**:
   - Response time targets
   - Completion time targets
   - Quality standards
   - Reporting requirements

4. **Penalties/Rewards**:
   - SLA breach penalties
   - Performance bonuses
   - Volume discounts

**Steps**:
1. Sales creates contract draft
2. Define all terms
3. Set up SLA parameters
4. Legal review
5. Customer negotiation
6. Final approval
7. Contract activated
8. System enforces terms

---

### Flow 4.2: SLA Monitoring

**Trigger**: Continuous monitoring

**Metrics Tracked**:
- First response time
- Job completion time
- Quality scores
- Customer satisfaction
- Uptime (for fleet)

**Steps**:
1. Job created under contract
2. SLA timers start
3. System monitors progress
4. Alerts if approaching threshold
5. Records actual vs target
6. Calculate SLA achievement
7. Generate SLA report

**Alerts**:
- 80% of SLA time elapsed
- SLA breached
- Pattern of near-misses

---

### Flow 4.3: Contract Renewal

**Trigger**: Contract approaching expiry

**Steps**:
1. System identifies expiring contracts (90/60/30 days)
2. Generate renewal notification
3. Account manager contacts customer
4. Review performance history
5. Negotiate new terms
6. Update contract
7. Activate new period

---

## 5. Centralized Policy Management

### Location: System Settings (Enterprise)

---

### Flow 5.1: Policy Deployment

**Trigger**: New policy defined

**Policy Types**:
- Pricing policies
- Discount limits
- Approval thresholds
- Operating procedures
- Compliance requirements

**Steps**:
1. Central office defines policy
2. Policy documented
3. Select target locations
4. Deploy to locations
5. Staff notified
6. Training if required
7. Compliance monitored

---

### Flow 5.2: Price Book Management

**Trigger**: Pricing update needed

**Steps**:
1. Define standard prices
2. Set location variations:
   - Premium locations (+%)
   - Promotional rates (-%)
   - Competitive adjustments
3. Approval workflow
4. Publish to locations
5. Effective date applied
6. Old prices archived

---

## 6. Business Intelligence

### Location: `/business-intelligence-dashboard`

---

### Flow 6.1: Executive Dashboard

**Trigger**: Executive login

**Components**:
1. **Financial Overview**:
   - Revenue vs budget
   - Profit margins
   - Cash position
   - Receivables aging

2. **Operational Metrics**:
   - Capacity utilization
   - Throughput rates
   - Quality scores
   - Employee productivity

3. **Customer Metrics**:
   - Customer count
   - Retention rate
   - Satisfaction trends
   - Loyalty engagement

4. **Market Intelligence**:
   - Competitive analysis
   - Market trends
   - Growth opportunities

---

### Flow 6.2: Custom Report Builder

**Location**: `/custom-report-builder`

**Steps**:
1. Select data sources
2. Choose dimensions
3. Add measures
4. Apply filters
5. Design layout
6. Preview report
7. Save template
8. Schedule delivery

**User Scenarios**:
- Custom financial analysis
- Operational deep-dive
- Ad-hoc investigation

---

## Enterprise Feature Summary

| Feature | Description | Users |
|---------|-------------|-------|
| Multi-Location | Manage multiple branches | Franchise owners, managers |
| Command Center | Centralized oversight | Executives |
| Globalization | Multi-currency, multi-language | International operations |
| SLA Management | Contract and SLA tracking | Account managers |
| Policy Management | Centralized policies | Administrators |
| Business Intelligence | Advanced analytics | All management |

---

## Access Control Matrix

| Role | Multi-Location | Command Center | Globalization | SLAs |
|------|----------------|----------------|---------------|------|
| System Admin | Full | Full | Full | Full |
| Franchise Owner | Full | Full | View | Full |
| Regional Manager | Assigned | View | Config | Manage |
| Location Manager | Own | None | View | View |
| Staff | None | None | None | None |

