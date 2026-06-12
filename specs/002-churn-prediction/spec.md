# Feature Specification: Customer Churn Prediction

**Feature Branch**: `002-churn-prediction`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Predictive customer churn detection (roadmap Phase 16): flag customers unlikely to return based on visit history; analytics + dashboard surface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manager sees at-risk customers on a churn dashboard (Priority: P1)

A garage manager opens a "Customer Retention" view and sees a ranked list of customers
flagged as at risk of not returning, each with a risk level (high/medium/low), the
reasons behind the flag (e.g., overdue for service based on their visit cadence, declining
visit frequency, unresolved complaint), their lifetime value, and the date of their last
visit — scoped to the manager's garage/branch.

**Why this priority**: Surfacing the at-risk list is the core value of the feature; even
with no other story implemented, a manager can act on it manually (call the customer,
send an offer). It is independently demonstrable and testable.

**Independent Test**: Seed customers with distinct visit histories (regular returner,
lapsed, one-time visitor) and verify the dashboard ranks and labels them correctly with
explainable reasons, and that staff of another branch cannot see them.

**Acceptance Scenarios**:

1. **Given** a customer whose average service interval is 3 months and whose last visit
   was 7 months ago, **When** the manager opens the retention dashboard, **Then** that
   customer appears flagged at high risk with "overdue for expected service" as a reason.
2. **Given** a customer who visited last week within their normal cadence, **When** the
   dashboard loads, **Then** that customer is not flagged.
3. **Given** a manager of branch A, **When** they view the dashboard, **Then** only
   branch A customers appear.
4. **Given** a flagged customer, **When** the manager opens their entry, **Then** they see
   the contributing factors and the customer's visit/revenue history supporting them.

---

### User Story 2 - Risk scores stay current automatically (Priority: P2)

Churn risk is recalculated on a regular schedule and after relevant customer events
(completed visit, cancelled appointment, complaint logged), so the dashboard reflects
reality without anyone triggering a recalculation manually.

**Why this priority**: Without freshness the list decays into noise, but a manually
refreshed list (Story 1) is still useful on day one.

**Independent Test**: Flag a lapsed customer, then record a completed visit for them and
verify their risk drops on the next recalculation without manual intervention.

**Acceptance Scenarios**:

1. **Given** a high-risk customer, **When** they complete a new service visit, **Then**
   their risk level is reduced in the next scheduled recalculation.
2. **Given** the daily recalculation window, **When** it completes, **Then** every active
   customer's score carries a "last evaluated" timestamp from that run.
3. **Given** a recalculation failure, **When** the dashboard is viewed, **Then** the most
   recent successful scores remain visible together with their evaluation date.

---

### User Story 3 - Retention metrics for the business (Priority: P3)

The analytics area includes retention KPIs: churn rate over time, count of at-risk
customers by branch, revenue at risk (lifetime value of flagged customers), and a record
of whether flagged customers subsequently returned — so owners can judge whether
retention efforts work.

**Why this priority**: Valuable management insight, but consumes the outputs of Stories
1–2 rather than enabling them.

**Independent Test**: With a seeded population of flagged/returned customers, verify the
KPI tiles compute the expected rates and totals per branch and per period.

**Acceptance Scenarios**:

1. **Given** a quarter in which 10 of 100 regular customers lapsed, **When** the owner
   views retention analytics for that quarter, **Then** churn rate displays 10%.
2. **Given** flagged customers with known lifetime values, **When** the dashboard loads,
   **Then** "revenue at risk" equals the sum of their lifetime values.
3. **Given** a flagged customer who returned within 60 days, **When** the recovery metric
   is viewed, **Then** that customer counts as recovered.

---

### Edge Cases

- Brand-new customers with a single visit have no cadence to judge: they are excluded
  from risk scoring until a minimum history exists (rather than all being flagged).
- A customer with multiple vehicles serviced at different intervals: cadence is judged
  per customer across all their vehicles, not per vehicle.
- Customers marked inactive/archived or deceased must never be flagged or counted in
  churn KPIs.
- A garage with very little history (newly onboarded tenant): the dashboard states that
  scores are provisional until sufficient history accumulates.
- Two branches share a customer: the customer's risk is evaluated within each branch
  relationship independently and shown only to the branch that owns the relationship.
- Bulk data imports (migrated visit history) trigger a full rescore rather than being
  treated as a burst of fresh visits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute a churn risk level (high/medium/low, with a numeric
  score) for every active customer with sufficient visit history, scoped per
  garage/branch relationship.
- **FR-002**: Every risk flag MUST carry human-readable contributing reasons derived from
  the customer's own history (e.g., overdue versus personal cadence, declining frequency,
  declining spend, unresolved complaints, cancelled appointments).
- **FR-003**: System MUST recalculate scores at least daily and after churn-relevant
  customer events, recording a "last evaluated" timestamp per customer.
- **FR-004**: Dashboard MUST list at-risk customers ranked by risk and lifetime value,
  filterable by risk level and branch, with access restricted by existing role
  permissions for customer data.
- **FR-005**: Each at-risk entry MUST link to the full customer record and recent
  visit/invoice history.
- **FR-006**: Analytics MUST report churn rate over time, at-risk counts, revenue at
  risk, and recovery rate (flagged customers who returned), per branch and per period.
- **FR-007**: Customers below a minimum-history threshold, and inactive/archived
  customers, MUST be excluded from scoring and KPIs.
- **FR-008**: All dashboard and notification text MUST be localized (English and Arabic
  with RTL).
- **FR-009**: Scoring MUST be explainable and deterministic for a given input history —
  identical history yields identical scores — so flags can be audited.
- **FR-010**: Score computation MUST NOT degrade interactive use of the system; dashboard
  reads MUST serve precomputed results.

### Key Entities

- **Churn Score**: per customer-branch relationship; numeric score, risk level,
  contributing reasons, last-evaluated timestamp, and the data window it was computed
  from.
- **Churn Event Log**: record of recalculations and the events that triggered them, for
  auditability.
- **Retention KPI Snapshot**: per branch and period; churn rate, at-risk count, revenue
  at risk, recovery rate.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Managers can identify their top 10 at-risk customers in under 30 seconds
  from opening the retention view.
- **SC-002**: At least 60% of customers flagged high-risk had genuinely lapsed (no return
  visit in the following 90 days) when evaluated retrospectively against historical data.
- **SC-003**: Retention dashboard loads its ranked list in under 2 seconds for a branch
  with 10,000 customers.
- **SC-004**: Zero customers of one tenant/branch ever appear in another's retention
  view (validated in testing and 90 days of production audit).
- **SC-005**: Recovery rate of contacted at-risk customers is measurable in analytics
  within one release cycle of launch, enabling before/after comparison of retention
  campaigns.

## Assumptions

- Scoring v1 is rule-based and statistical (per-customer cadence, recency, frequency,
  monetary trend, complaints) — explainable by design; machine-learned models are a
  possible future enhancement, not in scope.
- "Visit" means a completed job card; cancelled or no-show appointments count as negative
  signals, not visits.
- Outreach actions (calling, sending offers) happen through existing channels; automated
  campaign triggering is out of scope for v1 (the push-notification feature may later
  subscribe to churn flags).
- Lifetime value is computed from existing invoice history.
- Existing RBAC roles govern who can view retention data (managers/owners; not
  technicians).
