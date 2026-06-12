# <Feature name>

- **ID**: <NNN-feature-name>
- **Date**: <YYYY-MM-DD>
- **Status**: Draft | Approved | Implemented
- **Author**: <name>

## 1. Business context
What problem does this solve, and why now? One or two paragraphs, no technology.

## 2. Roles & tenancy
- **Roles affected** (of the 7): Super Admin, Garage Owner, Manager, Service
  Advisor, Technician, Parts Manager, Accountant.
- **Tenant scope**: is this data scoped per garage/branch? (Almost always yes.)

## 3. Functional requirements
Use IDs + obligation keywords (SHALL/SHOULD/MAY). Technology-agnostic.

- **REQ-001** The system SHALL …
- **REQ-002** The system SHALL …
- **REQ-003** When <trigger>, the system SHALL …

### Data requirements
| Field | Description | Required | Notes |
|-------|-------------|----------|-------|
|       |             |          |       |

## 4. User flows
- **Primary flow**: step-by-step happy path.
- **Alternative flows**: variations.
- **Error scenarios**: what the user sees when things go wrong.

## 5. Acceptance criteria
Testable, one per line. Reference the REQ they satisfy.
- [ ] Given … when … then … (REQ-001)
- [ ] …

## 6. Saudi / compliance considerations
Any VAT (15%), ZATCA e-invoicing, Hijri date, Zakat, TRN, or Arabic-RTL impact.
State the behaviour; implementation must reuse `@shared/*` helpers.

## 7. Negative requirements (≥3)
Things the system SHALL NOT do — security, data integrity, tenant isolation.
- **NEG-001** The system SHALL NOT allow a user to read data outside their
  garage/branch.
- **NEG-002** …
- **NEG-003** …

## 8. Non-goals (≥3)
Explicitly out of scope (with a one-line reason each).
- …

## 9. Assumptions
- …

## 10. Open questions
Max 3, only blocking ones.
- [NEEDS CLARIFICATION] … (impact + proposed default)
