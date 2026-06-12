# API Contract: Customer Self-Service Appointment Rescheduling

New modular routes registered through the hybrid loader in `server/routes/` (file:
`appointments-self-service.ts`). All endpoints require an authenticated customer session and are
scoped server-side to the session user's `garageId` + `customerId`. Request/response bodies are
validated with the shared Zod schemas in `shared/schemas/appointmentReschedule.ts`.

Common rules:
- **Auth**: session required (passport). Unauthenticated → `401`.
- **Tenant/ownership**: the appointment must belong to the session customer and garage, else `404`
  (not `403` — the existence of others' records is never disclosed, FR-004).
- **Validation**: invalid body → `400` with field errors from the shared schema.
- **Error body**: `{ error: { code, message } }` where `code` is one of `inside_cutoff`,
  `limit_reached`, `slot_taken`, `ineligible_status`, `not_owner`, `validation_error`. The client
  maps `code` to a localized message (FR-014).

---

## GET `/api/portal/appointments/:id/available-slots`

Returns slots the customer may move this appointment to, derived from real workshop availability
(FR-006).

- **200** → `availableSlotsResponseSchema`: `{ slots: { start, end, available }[] }`
- **404** → appointment not owned by this customer/garage, or not found.
- **409** `ineligible_status` → appointment is completed/in_progress/cancelled/no_show (FR-015).

Notes: slots already at capacity or conflicting with bookings/technician availability are returned
with `available: false` (or omitted); the endpoint never invents capacity.

---

## POST `/api/portal/appointments/:id/reschedule`

Body: `rescheduleRequestSchema` → `{ newSlotStart, reason? }`.

Server flow (single DB transaction, FR-007):
1. Load appointment `FOR UPDATE`, verify ownership + garage (else `404`).
2. Verify eligibility: status ∈ {scheduled, confirmed}; outside `minNoticeHours`;
   `rescheduleCount < maxReschedules` → else `409` with the matching code.
3. Lock + re-validate the target slot's capacity; if taken → `409 slot_taken`.
4. Update `appointmentDate`, release old slot, increment `rescheduleCount`, set `lastRescheduledAt`.
5. Write `appointmentChangeLog` (action `reschedule`, old/new slot, reason) and an
   `appointmentStatusHistory`/audit entry.
6. Create staff `notifications` row (recipient = `assignedTo`, else garage front-desk/manager role)
   + WebSocket push; optionally enqueue SMS (non-blocking).

- **200** → `rescheduleResultSchema`: `{ appointmentId, newSlotStart, rescheduleCount }`
- **400 / 404 / 409** as above.

---

## POST `/api/portal/appointments/:id/cancel`

Body: `cancelRequestSchema` → `{ reason? }`.

Server flow (single DB transaction):
1. Load + verify ownership (else `404`).
2. Verify eligibility (status + cutoff) → else `409`.
3. Set status `cancelled`, set `cancellationReason`, release slot.
4. Write `appointmentChangeLog` (action `cancel`) + status history/audit.
5. Notify staff (in-app + optional SMS).

- **200** → `{ appointmentId, status: "cancelled" }`
- **400 / 404 / 409** as above.

---

## Idempotency & concurrency

- Reschedule/cancel are safe under retries: a second confirm on an already-moved/cancelled
  appointment returns the current state (no double application), because step 1 re-reads under lock.
- The contended-slot test (Vitest) fires two concurrent reschedules at the last slot and asserts
  exactly one `200` and one `409 slot_taken`, with no double-booking (SC-003).
