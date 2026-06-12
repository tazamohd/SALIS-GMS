# Phase 1 Data Model: Customer Self-Service Appointment Rescheduling

All changes live in `shared/schema.ts` (Drizzle) and are applied via `drizzle-kit push`. Two new
tables are added and the existing `appointments` table gains two fields. Validation contracts are
defined once in `shared/schemas/appointmentReschedule.ts` (Zod) and reused on client and server.

## Existing entities reused (no structural change except where noted)

### `appointments` (EXTEND)

Already provides: `id`, `garageId`, `customerId`, `appointmentDate`, `duration`, `status`
(`scheduled | confirmed | in_progress | completed | cancelled | no_show`), `assignedTo`,
`cancellationReason`, `updatedAt`.

Add two fields:

| Field | Type | Notes |
|-------|------|-------|
| `rescheduleCount` | integer, default 0 | Incremented on each customer reschedule; compared to policy `maxReschedules` (FR-008). |
| `lastRescheduledAt` | timestamp, nullable | Set when a customer reschedules; informational/audit. |

**Eligibility rule (derived, not stored)**: an appointment is reschedulable when `status ∈
{scheduled, confirmed}` AND `appointmentDate` is in the future AND `appointmentDate − now ≥
policy.minNoticeHours` AND `rescheduleCount < policy.maxReschedules` (FR-005, FR-008, FR-015).

### `appointmentStatusHistory` (reuse as-is)

A status-change row is written when a cancel sets status to `cancelled`.

### `notifications` (reuse as-is)

One staff-targeted row per customer reschedule/cancel (FR-009), pushed over WebSocket.

## New entities

### `reschedulePolicies` (NEW)

Per-garage configuration governing self-service changes.

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `garageId` | uuid, FK → garages.id, **unique** | Tenant scope; one policy per garage. |
| `minNoticeHours` | integer, default 24 | Cutoff before slot start (FR-005). |
| `maxReschedules` | integer, default 3 | Max self-service reschedules per appointment (FR-008). |
| `smsOnChange` | boolean, default false | Whether to also send SMS (FR-010). |
| `createdAt` / `updatedAt` | timestamp | |

Absent row → code falls back to the documented defaults (24h / 3 / no SMS).

### `appointmentChangeLog` (NEW)

Immutable audit of every customer-initiated reschedule/cancel (FR-011).

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `appointmentId` | uuid, FK → appointments.id | |
| `garageId` | uuid, FK → garages.id | Denormalized for tenant-scoped audit queries. |
| `actorUserId` | varchar, FK → users.id | The customer who made the change. |
| `action` | varchar | `reschedule` or `cancel`. |
| `previousSlot` | timestamp | Slot before the change. |
| `newSlot` | timestamp, nullable | Slot after a reschedule; null for cancel. |
| `reason` | text, nullable | Optional customer-provided reason. |
| `createdAt` | timestamp, default now | Append-only; never updated or deleted. |

## Shared validation contracts (`shared/schemas/appointmentReschedule.ts`)

Defined once with Zod and imported by both layers (Principle I):

- `rescheduleRequestSchema`: `{ appointmentId: uuid, newSlotStart: ISO datetime, reason?: string
  (max 500) }`.
- `cancelRequestSchema`: `{ appointmentId: uuid, reason?: string (max 500) }`.
- `availableSlotSchema` / `availableSlotsResponseSchema`: `{ start, end, available: boolean }[]`.
- `rescheduleResultSchema`: `{ appointmentId, newSlotStart, rescheduleCount }`.
- A discriminated error contract for the blocked cases (`inside_cutoff`, `limit_reached`,
  `slot_taken`, `ineligible_status`, `not_owner`) so the client can localize each message (FR-014).

## State transitions

```text
                 customer reschedule (eligible, slot claimed)
 scheduled ─────────────────────────────────────────────► scheduled (new appointmentDate,
 confirmed                                                  rescheduleCount += 1)

 scheduled ─────────────── customer cancel (eligible) ───► cancelled (slot released,
 confirmed                                                  cancellationReason set)
```

Transitions are rejected (with a localized reason) when the appointment is ineligible: inside the
cutoff, at the reschedule limit, not owned by the customer, in a non-reschedulable status, or when
the target slot was taken between display and confirm (FR-005, FR-007, FR-008, FR-014, FR-015).
