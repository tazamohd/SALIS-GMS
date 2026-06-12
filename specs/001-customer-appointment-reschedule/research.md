# Phase 0 Research: Customer Self-Service Appointment Rescheduling

This feature extends existing subsystems, so research focuses on confirming the reuse points and
resolving the one genuinely hard technical question (concurrency-safe slot booking). No open
`NEEDS CLARIFICATION` items remain.

## Decision 1 — Reuse the existing `appointments` model, don't add a parallel one

- **Decision**: Reschedule/cancel operate on the existing `appointments` table
  (`shared/schema.ts:764`), which already carries `garageId`, `customerId`, `appointmentDate`,
  `duration`, `status` (`scheduled | confirmed | in_progress | completed | cancelled | no_show`),
  `assignedTo`, and `cancellationReason`. Status changes are already recorded in
  `appointmentStatusHistory` (`shared/schema.ts:796`).
- **Rationale**: The constitution (Principle V) requires extending existing patterns. All
  ownership, tenancy, and status fields the spec needs already exist.
- **Alternatives considered**: A separate "reschedule request" workflow table — rejected as
  over-engineering for synchronous self-service; the change is applied immediately, not queued.

## Decision 2 — Concurrency-safe slot claim via transactional row locking

- **Decision**: The slot-claim step runs inside `db.transaction(...)` and locks the contended
  capacity rows (`SELECT ... FOR UPDATE`) before re-validating availability and writing the new
  `appointmentDate`, mirroring `startBaySession` in `server/storage.ts:10863` (the project's
  established race-condition guard, also called out in replit.md for service bays).
- **Rationale**: Satisfies FR-007 / SC-003 (zero double-bookings) using a pattern already proven and
  reviewed in this codebase, rather than inventing optimistic-locking or queueing.
- **Alternatives considered**:
  - *Optimistic concurrency (version column)* — viable but adds a new pattern and retry UX; the
    row-lock pattern already exists here.
  - *Application-level mutex* — rejected; does not survive multiple server instances.

## Decision 3 — Availability comes from the existing workshop calendar/availability data

- **Decision**: Offered slots are derived from existing workshop availability/capacity
  (`workshopAvailability` / `workshopResources` / service-bay capacity referenced in replit.md) and
  existing bookings, exposed through a read endpoint. No new scheduling engine is built.
- **Rationale**: Principle V (reuse) and spec FR-006 (respect *real* availability). The calendar
  already models capacity and technician availability.
- **Alternatives considered**: A bespoke availability calculator for the portal — rejected as
  duplicate logic that would drift from the staff-side calendar.

## Decision 4 — Notifications and SMS reuse existing subsystems

- **Decision**: Staff in-app notifications are written via the existing `notifications` table
  (`shared/schema.ts:1067`) and pushed over the existing WebSocket channel
  (`server/websocket.ts`); SMS uses `server/smsService.ts` (Twilio) and is gated by the garage's
  configuration and treated as non-blocking (FR-010).
- **Rationale**: FR-009/FR-010 explicitly describe reuse; Twilio + in-app notifications already
  power reminders and live updates.
- **Alternatives considered**: New notification channel — rejected.

## Decision 5 — Audit trail

- **Decision**: Each reschedule/cancel writes an immutable `appointmentChangeLog` row (actor,
  action, timestamp, previous slot, new slot, reason) in addition to the existing
  `appointmentStatusHistory` entry, and flows through the existing audit middleware
  (`server/auditMiddleware.ts`) for the action-history trail.
- **Rationale**: FR-011 needs old-slot→new-slot detail that status history alone doesn't capture;
  a dedicated change log keeps the audit query simple and tamper-evident.
- **Alternatives considered**: Overloading `appointmentStatusHistory` with slot diffs — rejected to
  keep that table's status-focused semantics clean.

## Decision 6 — Policy (cutoff + reschedule limit) is per-garage configuration

- **Decision**: A `reschedulePolicies` row per garage stores `minNoticeHours` (default 24) and
  `maxReschedules` (default 3); absent configuration falls back to those defaults.
- **Rationale**: Spec states these are configurable per garage with sensible defaults.
- **Alternatives considered**: Global constants — rejected; multi-tenant garages need independent
  policies. Per-appointment overrides — deferred (YAGNI).

## Decision 7 — Localization

- **Decision**: All strings use `react-i18next` with a new `reschedule` namespace added to
  `en.json` and `ar.json`, following the existing `t('namespace.key', 'English fallback')` pattern;
  RTL is already handled globally when Arabic is active.
- **Rationale**: Principle IV; replit.md documents 100% Arabic coverage and the fallback pattern.
- **Alternatives considered**: None — this is the house pattern.
