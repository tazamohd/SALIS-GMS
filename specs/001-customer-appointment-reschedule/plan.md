# Implementation Plan: Customer Self-Service Appointment Rescheduling

**Branch**: `001-customer-appointment-reschedule` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-customer-appointment-reschedule/spec.md`

## Summary

Add a self-service capability to the existing client portal that lets an authenticated customer
reschedule or cancel their own upcoming appointment, choosing from genuinely-available workshop
slots, with strict tenant isolation, a concurrency-safe booking step, staff notification, an audit
trail, and full Arabic/English localization. The work extends existing subsystems
(`appointments`, workshop availability, notifications/SMS, audit history, i18n) rather than
introducing new ones. The central technical risk is double-booking under concurrency, addressed
with a transactional, row-locked slot-claim that mirrors the existing `startBaySession` pattern in
`server/storage.ts`.

## Technical Context

**Language/Version**: TypeScript (strict) on Node.js; React 18.

**Primary Dependencies**: Express + hybrid route loader (`server/routes/`), Drizzle ORM
(PostgreSQL), passport.js session auth, RBAC middleware (`server/rbac-middleware.ts`), TanStack
Query, wouter, shadcn/ui (Radix), Tailwind, react-i18next, Twilio (`server/smsService.ts`),
WebSocket notifications (`server/websocket.ts`).

**Storage**: PostgreSQL via Drizzle; schema in `shared/schema.ts`, data access through the storage
interface in `server/storage.ts`. Reuses `appointments`, `appointmentStatusHistory`, and
`notifications`; adds a per-garage reschedule policy and a reschedule/cancel audit table (see
data-model.md).

**Testing**: Vitest unit + integration (`server/routes/__tests__`), including a concurrency test for
double-booking; Playwright e2e for the customer flow in both languages.

**Target Platform**: Web (responsive PWA client portal + Express API).

**Project Type**: Web application (existing `client/` + `server/` + `shared/` layering).

**Performance Goals**: Customer completes a reschedule in <90s (SC-001); slot listing feels instant
(<1s perceived). No new scale requirements beyond existing appointment volume.

**Constraints**: Zero `tsc` errors; shared Zod contracts; `garageId` tenant isolation enforced
server-side; no double-booking under concurrency (SC-003); Arabic RTL + English parity.

**Scale/Scope**: One new customer-portal page/flow, a small set of API endpoints under
`server/routes/`, one shared contract module, two new tables, and reuse of existing notification /
audit / availability code.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan satisfies it |
|-----------|----------------------------|
| **I. Type Safety & Shared Contracts** | Request/response shapes defined once as Zod schemas in `shared/` (e.g. `shared/schemas/appointmentReschedule.ts`) and consumed by both the Express handlers and the React/TanStack-Query client. No `any`. `npm run check` must stay green. |
| **II. Multi-Tenant Isolation & Security** | Every read/write is scoped by the session user's `garageId` **and** `customerId`; ownership is verified server-side before any mutation. Endpoints sit behind session auth + RBAC middleware. `AUTH_BYPASS` remains dev-only. No reliance on client-side filtering. |
| **III. Spec-Driven, Test-Backed Changes** | Vitest integration tests cover each FR, including a concurrency test proving FR-007 (no double-booking) and cutoff/limit enforcement (FR-005/FR-008). Cutoff/limit pure logic gets unit tests mirroring `shared/*.test.ts`. |
| **IV. Saudi Compliance by Default** | All customer-facing strings go through `react-i18next` (`t('key','fallback')`) with Arabic keys added to `client/src/i18n/locales/ar.json`; layout verified RTL; dates/times localized. No hard-coded English. |
| **V. Consistent Architecture & Design System** | New page uses an existing archetype wrapper (FormPage / StandardPageLayout) and shadcn/ui components; new routes go in `server/routes/` via the hybrid loader; notifications/SMS/audit/availability are reused, not rebuilt; grayscale dark/light respected. |

**Result**: PASS. No violations; Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-customer-appointment-reschedule/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract)
│   └── appointment-reschedule.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (from /speckit-specify)
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
shared/
├── schema.ts                         # EXTEND: add reschedulePolicies + appointmentChangeLog tables;
│                                     #         add reschedule fields to existing appointments table
└── schemas/
    └── appointmentReschedule.ts      # NEW: shared Zod contracts (request/response/validation)

server/
├── routes/
│   ├── appointments-self-service.ts  # NEW: customer reschedule/cancel + availability endpoints
│   └── __tests__/
│       └── appointments-self-service.test.ts  # NEW: integration + concurrency tests
└── storage.ts                        # EXTEND: ownership-scoped reads, transactional slot claim
                                       #         (mirror startBaySession row-locking), audit + notify

client/src/
├── pages/
│   └── CustomerAppointmentReschedule.tsx  # NEW: portal page (archetype wrapper + shadcn/ui)
├── components/appointments/
│   └── SlotPicker.tsx                # NEW: available-slot selector (reused availability data)
└── i18n/locales/
    ├── en.json                       # EXTEND: reschedule namespace
    └── ar.json                       # EXTEND: reschedule namespace (Arabic)

e2e/
└── customer-appointment-reschedule.spec.ts  # NEW: Playwright flow (en + ar)
```

**Structure Decision**: Web application using the established `client/` + `server/` + `shared/`
layering. No new top-level structure; the feature is a thin vertical slice that extends existing
modules and registers new modular routes through the hybrid loader.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
