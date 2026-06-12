# Quickstart / Validation Guide: Customer Self-Service Appointment Rescheduling

How to validate the feature end-to-end once implemented. References `contracts/appointment-reschedule.md`
and `data-model.md` for detail rather than repeating it.

## Prerequisites

- Local dev DB running; schema synced: `npm run db:push`
- Seed data present (`npm run db:seed`) so at least one garage, one customer, one upcoming
  appointment in `scheduled`/`confirmed` status, and some workshop availability exist.
- Dev server: `npm run dev`
- Test customer (from replit.md test credentials): `client@salisauto.com` / `client123`.

## Automated validation

```bash
npm run check        # zero TypeScript errors (Constitution I)
npm run lint
npm test             # unit + integration, incl. concurrency/double-booking test
npm run test:integration   # server/routes/__tests__ only, if iterating
npx playwright test e2e/customer-appointment-reschedule.spec.ts   # en + ar flows
```

Expected: all green. The integration suite must include the contended-slot concurrency test
asserting exactly one success and one `slot_taken` (SC-003).

## Manual validation scenarios

1. **Happy-path reschedule (US1)**: Sign in as the test customer → open an upcoming appointment →
   pick an available slot → confirm. Expect confirmation with the new date/time; verify the garage
   calendar shows the move and the old slot is free.
2. **Tenant isolation (FR-004 / SC-002)**: Call
   `POST /api/portal/appointments/:id/reschedule` with another customer's appointment id → expect
   `404` and no data leakage.
3. **Cutoff block (FR-005)**: Attempt to reschedule an appointment inside the garage's
   `minNoticeHours` → expect `409 inside_cutoff` and a localized message.
4. **Reschedule limit (FR-008)**: Reschedule the same appointment past `maxReschedules` → expect
   `409 limit_reached`.
5. **Concurrency (FR-007)**: Fire two reschedules at the last remaining slot simultaneously →
   exactly one succeeds; the other gets `409 slot_taken`; no double-booking.
6. **Cancel (US2)**: Cancel an eligible appointment → status `cancelled`, slot released,
   `appointmentChangeLog` row written.
7. **Staff notification (US3)**: As staff, confirm an in-app notification appears for both the
   reschedule and the cancel; if the garage has `smsOnChange`, confirm an SMS attempt is logged.
8. **Localization (US4 / FR-012)**: Switch portal to Arabic, repeat the reschedule → all text in
   Arabic, RTL layout, localized dates; repeat in English. No untranslated keys.
9. **Audit (FR-011)**: After steps above, query `appointmentChangeLog` and confirm actor,
   timestamp, previous/new slot, and reason are recorded.

## Done signal

Feature is validated when all automated suites pass and manual scenarios 1–9 behave as described,
with the Constitution Check in `plan.md` still holding (no `any`, shared Zod contracts, server-side
`garageId` scoping, RTL parity).
