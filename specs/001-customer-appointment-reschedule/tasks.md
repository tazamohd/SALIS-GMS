---
description: "Task list for Customer Self-Service Appointment Rescheduling"
---

# Tasks: Customer Self-Service Appointment Rescheduling

**Input**: Design documents from `specs/001-customer-appointment-reschedule/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/appointment-reschedule.md, quickstart.md

**Tests**: Included — the constitution (Principle III) and the spec require Vitest coverage,
notably the concurrency/double-booking test.

**Organization**: Tasks are grouped by user story (US1–US4) so each story stays an independently
testable slice.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 (reschedule), US2 (cancel), US3 (staff notifications), US4 (i18n)
- All paths are repo-relative.

## Path Conventions

Web app with established layering: `shared/`, `server/`, `client/src/`, `e2e/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the shared contract and i18n namespaces every story builds on.

- [X] T001 [P] Create the shared Zod contract module `shared/schemas/appointmentReschedule.ts` with `rescheduleRequestSchema`, `cancelRequestSchema`, `availableSlotSchema`, `availableSlotsResponseSchema`, `rescheduleResultSchema`, and the discriminated error-code union (`inside_cutoff | limit_reached | slot_taken | ineligible_status | not_owner | validation_error`), per contracts/appointment-reschedule.md.
- [X] T002 [P] Add the `reschedule` i18n namespace keys (labels, slot/date strings, confirmations, every error-code message) to `client/src/i18n/locales/en.json`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema + policy + reusable storage primitives that ALL stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Extend `shared/schema.ts`: add `rescheduleCount` (integer, default 0) and `lastRescheduledAt` (timestamp, nullable) to the existing `appointments` table, per data-model.md.
- [X] T004 [P] Add the `reschedulePolicies` table (per-garage: `garageId` unique, `minNoticeHours` default 24, `maxReschedules` default 3, `smsOnChange` default false) to `shared/schema.ts` with drizzle-zod insert/select schemas.
- [X] T005 [P] Add the append-only `appointmentChangeLog` table (`appointmentId`, `garageId`, `actorUserId`, `action`, `previousSlot`, `newSlot?`, `reason?`, `createdAt`) to `shared/schema.ts`.
- [X] T006 Apply the schema changes to the dev database with `npm run db:push` and confirm `npm run check` is clean.
- [X] T007 Add an eligibility helper (pure function) `server/utils/` computing reschedulable status from `{ status, appointmentDate, rescheduleCount, policy, now }` returning `ok` or a specific error code (FR-005/FR-008/FR-015), reused by all mutating endpoints.
- [X] T008 Add a policy-resolution helper in `server/storage.ts` that loads the garage's `reschedulePolicies` row or falls back to documented defaults (depends on T004).
- [X] T009 Register a new modular route file `server/routes/appointments-self-service.ts` in the hybrid loader (`server/routes/index.ts`) behind session auth + RBAC (customer scope), with no handlers yet (wiring only).

**Checkpoint**: Schema, policy, eligibility logic, and route wiring exist — stories can begin.

---

## Phase 3: User Story 1 - Reschedule to an available slot (Priority: P1) 🎯 MVP

**Goal**: A customer moves their own eligible appointment to a genuinely-available slot, safely
under concurrency, with audit.

**Independent Test**: As `client@salisauto.com`, open an upcoming appointment, pick an available
slot, confirm, and see the move reflected for customer and garage; the old slot is freed.

### Tests for User Story 1 ⚠️ (write first, ensure they fail)

- [X] T010 [P] [US1] Integration test: `GET /api/portal/appointments/:id/available-slots` returns only real availability and `404`s for non-owned/cross-garage appointments — `server/routes/__tests__/appointments-self-service.test.ts`.
- [X] T011 [P] [US1] Integration test: happy-path reschedule updates `appointmentDate`, increments `rescheduleCount`, frees the old slot, and writes an `appointmentChangeLog` row — same test file.
- [X] T012 [P] [US1] **Concurrency test (KEY)**: two simultaneous reschedules at the last remaining slot yield exactly one `200` and one `409 slot_taken`, with no double-booking (SC-003) — same test file.
- [X] T013 [P] [US1] Unit test for the eligibility helper covering cutoff and limit boundaries — `server/utils/__tests__/`.

### Implementation for User Story 1

- [X] T014 [US1] Implement an availability read in `server/storage.ts` that derives offered slots from existing workshop availability/capacity + existing bookings (reuse, do not rebuild), scoped by `garageId`.
- [X] T015 [US1] Implement `GET /api/portal/appointments/:id/available-slots` in `server/routes/appointments-self-service.ts`: verify ownership/garage (404 on miss), reject ineligible status (409), return `availableSlotsResponseSchema`.
- [X] T016 [US1] **Transactional slot claim (KEY)**: implement `rescheduleAppointment` in `server/storage.ts` inside `db.transaction(...)` with row-locking (`FOR UPDATE`) on the contended capacity + appointment rows, mirroring `startBaySession` (`server/storage.ts:10863`); re-validate slot, write new `appointmentDate`, release old slot, bump `rescheduleCount`/`lastRescheduledAt`, and write `appointmentChangeLog` — all atomic.
- [X] T017 [US1] Implement `POST /api/portal/appointments/:id/reschedule`: validate body with `rescheduleRequestSchema`, enforce eligibility via the helper, call the storage method, map error codes to `400/404/409`, return `rescheduleResultSchema`.
- [X] T018 [P] [US1] Build the customer page `client/src/pages/CustomerAppointmentReschedule.tsx` using an existing archetype wrapper + shadcn/ui, wired with TanStack Query to the slots + reschedule endpoints, with a confirm step (FR-013), localized error handling including the empty-availability case (FR-014), and an entry point (link/action) from the existing client-portal appointment list (FR-001 — no new browsing screen).
- [X] T019 [P] [US1] Build `client/src/components/appointments/SlotPicker.tsx` (available-slot selector, disabled/unavailable slots non-selectable), and add the portal route in the client router.

**Checkpoint**: US1 is the shippable MVP — reschedule works end-to-end and is concurrency-safe.

---

## Phase 4: User Story 2 - Cancel an upcoming appointment (Priority: P2)

**Goal**: A customer cancels their own eligible appointment; the slot is released and audited.

**Independent Test**: Cancel an eligible appointment → status `cancelled`, slot freed,
`appointmentChangeLog` cancel row written.

### Tests for User Story 2 ⚠️

- [ ] T020 [P] [US2] Integration test: cancel sets status `cancelled`, sets `cancellationReason`, releases the slot, writes change-log + status-history rows; cutoff/ownership violations rejected — `server/routes/__tests__/appointments-self-service.test.ts`.

### Implementation for User Story 2

- [ ] T021 [US2] Implement `cancelAppointment` in `server/storage.ts` (transactional): verify ownership + eligibility, set status `cancelled` + `cancellationReason`, release slot, write `appointmentChangeLog` (action `cancel`) and `appointmentStatusHistory`.
- [ ] T022 [US2] Implement `POST /api/portal/appointments/:id/cancel` validating `cancelRequestSchema`, enforcing eligibility, mapping error codes.
- [ ] T023 [P] [US2] Add the cancel action + confirmation dialog (FR-013) to `client/src/pages/CustomerAppointmentReschedule.tsx`, localized.

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - Staff notified of customer changes (Priority: P2)

**Goal**: Garage staff get an in-app notification (and optional SMS) on every customer reschedule/cancel.

**Independent Test**: Trigger a reschedule and a cancel; verify distinct staff in-app notifications
with correct details; with `smsOnChange` enabled, an SMS attempt is logged.

### Tests for User Story 3 ⚠️

- [ ] T024 [P] [US3] Integration test: reschedule and cancel each create a staff `notifications` row with correct old/new slot detail, addressed to `assignedTo` when set and to the front-desk/manager role when `assignedTo` is null (FR-009); SMS path invoked only when `smsOnChange` is set and never blocks the response (FR-010) — same test file (SMS mocked).

### Implementation for User Story 3

- [ ] T025 [US3] Add a notification step to both storage mutations: resolve the recipient as the appointment's `assignedTo` staff when set, otherwise the garage's front-desk/manager RBAC role (FR-009); write a staff-targeted `notifications` row and push it over the existing WebSocket channel (`server/websocket.ts`) — reuse existing notification helpers.
- [ ] T026 [US3] Add a non-blocking SMS dispatch via `server/smsService.ts`, gated by the garage's `smsOnChange`; failures are logged via `server/logger.ts`, never surfaced as request errors.

**Checkpoint**: Changes are now observable by staff in real time.

---

## Phase 6: User Story 4 - Arabic / English localization (Priority: P3)

**Goal**: The whole flow works in Arabic (RTL) and English with no hard-coded text.

**Independent Test**: Switch portal to Arabic, complete a reschedule and a cancel; all text Arabic,
RTL layout, localized dates; repeat in English. No untranslated keys.

### Tests for User Story 4 ⚠️

- [ ] T027 [P] [US4] Playwright e2e covering the reschedule + cancel flow in both English and Arabic (asserting RTL and translated strings) — `e2e/customer-appointment-reschedule.spec.ts`.

### Implementation for User Story 4

- [ ] T028 [US4] Add the Arabic `reschedule` namespace keys (mirroring T002) to `client/src/i18n/locales/ar.json`.
- [ ] T029 [US4] Audit `CustomerAppointmentReschedule.tsx` + `SlotPicker.tsx` for any hard-coded strings or LTR-only layout; route all text through `t('reschedule.*','fallback')` and verify RTL date/time formatting (FR-012).

**Checkpoint**: All four stories independently functional and localized.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T030 [P] Add a per-garage reschedule-policy admin affordance (or seed defaults) so `reschedulePolicies` is configurable; document defaults.
- [ ] T031 Run the full gate: `npm run check`, `npm run lint`, `npm test`, and the Playwright spec — all green (Constitution quality gates).
- [ ] T032 Execute `specs/001-customer-appointment-reschedule/quickstart.md` manual scenarios 1–9 and confirm behavior, including timing the happy-path reschedule against the <90s target (SC-001).
- [ ] T033 [P] Update relevant docs (portal/customer feature docs under `docs/`) to mention self-service reschedule/cancel.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories**.
- **User Stories (Phases 3–6)**: all depend on Foundational. US1 is the MVP. US2 and US3 depend
  only on Foundational (US3 attaches to the US1/US2 mutations but is independently testable). US4
  layers on the US1/US2 UI.
- **Polish (Phase 7)**: after the desired stories are complete.

### Within Each User Story

- Tests written first and failing → storage method → endpoint → UI.
- Models/contracts before services; services before endpoints; core before integration.

### Parallel Opportunities

- T001, T002 (Setup) in parallel.
- T004, T005 in parallel (distinct tables); T003 then T006 are sequential (push after schema edits).
- All `[P]` test tasks within a story run in parallel.
- T018 and T019 (different client files) in parallel.
- Across stories: once Phase 2 is done, US1/US2 backends can be built by different developers; US3
  integrates into both; US4 follows the UI.

---

## Parallel Example: User Story 1

```bash
# Tests first (parallel):
Task: "Integration test available-slots ownership/availability (T010)"
Task: "Integration test happy-path reschedule (T011)"
Task: "Concurrency double-booking test (T012)"
Task: "Eligibility helper unit test (T013)"

# Then UI in parallel with each other:
Task: "CustomerAppointmentReschedule.tsx page (T018)"
Task: "SlotPicker.tsx component (T019)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & VALIDATE** the
   concurrency-safe reschedule → demo. This alone removes the phone call for the most common change.

### Incremental Delivery

US1 (MVP) → US2 cancel → US3 staff notifications → US4 localization. Each ships independently
without breaking the previous.

---

## Notes

- `[P]` = different files, no incomplete-task dependency.
- The two highest-risk tasks are **T016** (transactional row-locked slot claim) and **T012** (its
  concurrency test) — get these right first; they anchor SC-003.
- Tenant isolation (`garageId` + ownership) is enforced server-side in every storage method and
  endpoint, never on the client.
- Commit after each task or logical group; keep `npm run check` green throughout.
