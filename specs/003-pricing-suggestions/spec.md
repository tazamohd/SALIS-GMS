# Feature Specification: Real-Time Pricing Suggestions

**Feature Branch**: `003-pricing-suggestions`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Real-time pricing suggestions (roadmap Phase 16): AI-assisted pricing hints on job cards/quotes using parts cost + labor history."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Advisor sees a suggested price while quoting a job (Priority: P1)

While building a quote or job card, a service advisor adds line items (parts and labor).
For each labor line and for the overall job, the system shows a suggested price alongside
the advisor's entry: derived from this garage's own history for the same service and
vehicle class (typical charged price, typical hours), current part costs with the
garage's standard margin, and a clear breakdown of how the suggestion was formed. The
advisor stays in control — suggestions are hints, never auto-applied.

**Why this priority**: Quoting is where money is won or lost; inconsistent pricing
between advisors is the pain this feature exists to fix. A suggestion shown at quote time
with an explanation is independently valuable and testable.

**Independent Test**: Seed historical job cards for a service (e.g., front brake pads on
a mid-size sedan), open a new quote for the same service/vehicle class, and verify the
suggestion matches the seeded history's typical price with a visible breakdown.

**Acceptance Scenarios**:

1. **Given** a garage with 20 completed brake-pad jobs on similar vehicles, **When** an
   advisor adds a brake-pad labor line to a new quote, **Then** a suggested price appears
   reflecting the historical typical price, with its basis (sample size, typical hours,
   part cost + margin) viewable.
2. **Given** an advisor enters a price more than a configurable percentage below the
   suggestion, **When** the line is saved, **Then** the deviation is visibly indicated on
   the line (no blocking).
3. **Given** a service/vehicle combination with no usable history, **When** the advisor
   adds the line, **Then** no number is invented — the system states that no suggestion
   is available and falls back to the standard price list if one exists.
4. **Given** an Arabic-language user, **When** suggestions and breakdowns render,
   **Then** all text is localized with correct RTL layout.

---

### User Story 2 - Suggestions reflect current part costs and stay fresh (Priority: P2)

Suggested prices incorporate the current supplier cost of the parts on the quote (not
stale averages), apply the garage's configured margin rules, and update immediately when
the advisor swaps a part for an alternative or changes quantities.

**Why this priority**: Part costs move constantly; a suggestion based on outdated costs
erodes trust in the entire feature. Depends on Story 1's surface.

**Independent Test**: Change a part's supplier cost in inventory, reopen a quote using
that part, and verify the parts portion of the suggestion reflects the new cost; swap the
part on the quote and verify the suggestion updates without a page reload.

**Acceptance Scenarios**:

1. **Given** a part whose recorded cost increased 20% yesterday, **When** a new quote
   includes it, **Then** the parts component of the suggestion uses the new cost.
2. **Given** an open quote, **When** the advisor replaces a part with a cheaper
   alternative, **Then** the suggested total updates immediately.
3. **Given** margin rules configured per part category, **When** suggestions are
   computed, **Then** each part's suggested sell price applies its category's margin.

---

### User Story 3 - Owner tunes pricing rules and reviews adherence (Priority: P3)

The garage owner configures the inputs (margin per part category, labor rate, deviation
threshold that triggers the indicator) and can review how quoted prices compared to
suggestions over time — by advisor, service type, and branch — to spot systematic
under-pricing.

**Why this priority**: Governance and tuning layer; the defaults work without it, but it
turns the feature from a hint into a management tool.

**Independent Test**: Change the labor rate, verify new suggestions use it; create quotes
above/below suggestions and verify the adherence report aggregates deviations correctly
per advisor.

**Acceptance Scenarios**:

1. **Given** an owner raises the standard labor rate, **When** the next suggestion is
   computed, **Then** the labor component uses the new rate (existing quotes are
   unchanged).
2. **Given** a month of quoting activity, **When** the owner opens the adherence report,
   **Then** they see average deviation from suggestions per advisor and per service type.
3. **Given** a staff member without pricing-configuration permission, **When** they open
   settings, **Then** pricing rules are not editable.

---

### Edge Cases

- History contains outliers (a goodwill freebie, a mis-keyed price): suggestions must be
  robust to extremes rather than skewed by them.
- Very small sample sizes (1–2 historical jobs): the suggestion is shown as low-confidence
  or withheld below a minimum sample threshold.
- Multi-branch garages with different cost bases: suggestions use the quoting branch's
  history and rates first, widening to the garage network only when branch history is
  insufficient (and saying so).
- VAT: suggestions are expressed consistently with the quote's tax treatment (pre-tax),
  and the existing tax engine applies VAT afterwards — the suggestion never bakes in its
  own tax math.
- Currency/locale formatting follows the garage's existing settings.
- The suggestion service being slow or unavailable must not block quote editing: the
  quote form works normally and suggestions appear when available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a suggested price for each labor line and a suggested
  total for the job on quote and job-card editing screens, computed from the garage's
  historical completed jobs for the same service type and vehicle class, current part
  costs, configured margins, and labor rates.
- **FR-002**: Every suggestion MUST expose its basis on demand: sample size and period of
  history used, typical hours, part cost components, applied margin and labor rate, and a
  confidence indication.
- **FR-003**: Suggestions MUST be advisory only — never auto-applied, never blocking save.
- **FR-004**: System MUST visibly indicate when an entered price deviates from the
  suggestion beyond a configurable threshold.
- **FR-005**: Suggestions MUST withhold rather than fabricate: below a minimum-history
  threshold the system states no suggestion is available and offers the standard price
  list value if configured.
- **FR-006**: Suggestions MUST recompute immediately when quote composition changes
  (parts swapped, quantities changed, service type changed).
- **FR-007**: Suggestion computation MUST be robust to outlier historical prices.
- **FR-008**: Owners MUST be able to configure margin rules per part category, labor
  rates, deviation threshold, and minimum sample size; configuration access MUST be
  permission-gated.
- **FR-009**: System MUST record each suggestion shown and the price actually quoted, and
  report adherence/deviation by advisor, service type, branch, and period.
- **FR-010**: Suggestions MUST respect tenancy: only the garage's (and branch's) own
  history and rates feed its suggestions; no cross-tenant data leakage.
- **FR-011**: All suggestion UI text MUST be localized (English and Arabic with RTL), and
  amounts MUST follow existing currency and VAT presentation rules.
- **FR-012**: Unavailability of the suggestion capability MUST NOT impair quote or
  job-card editing.

### Key Entities

- **Price Suggestion**: computed hint for a quote line or job total; components (labor,
  parts, margin), basis (history window, sample size, confidence), timestamp; linked to
  the quote/job-card line it was shown for.
- **Pricing Rule Set**: per garage (optionally per branch); margin per part category,
  labor rate(s), deviation threshold, minimum sample size.
- **Suggestion Adherence Record**: suggestion shown versus price quoted, advisor, service
  type, branch, date — the raw material of the adherence report.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Suggestions appear within 2 seconds of adding or editing a quote line in
  95% of cases.
- **SC-002**: Price variance for the same service on comparable vehicles within a branch
  decreases by at least 30% within two months of rollout.
- **SC-003**: At least 70% of advisors' final quoted prices land within the configured
  deviation threshold of suggestions after the first month.
- **SC-004**: Zero suggestions computed from another tenant's data (validated in testing
  and production audit).
- **SC-005**: Quote editing remains fully functional with the suggestion capability
  disabled or failing (verified by fault-injection testing).

## Assumptions

- v1 suggestion logic is statistical over the garage's own history (typical/median
  pricing, trimmed for outliers) combined with deterministic cost+margin rules;
  generative-AI assistance is out of scope for pricing numbers.
- "Service type" classification reuses the existing job-card service/operation
  catalog; vehicle class derives from existing vehicle data.
- Part costs come from existing inventory/supplier cost records; no new procurement
  integration is introduced.
- VAT and ZATCA handling remain entirely with the existing invoicing pipeline.
- The existing standard price list (if maintained) serves as fallback, not as the
  suggestion source.
