# Feature Specification: Customer Self-Service Appointment Rescheduling

**Feature Branch**: `001-customer-appointment-reschedule`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Customer self-service appointment rescheduling via the client portal. Let an authenticated customer reschedule (and cancel) their own upcoming service appointment from the client portal, without phoning the garage, while keeping the garage's calendar and tenant boundaries intact."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reschedule an upcoming appointment to an available slot (Priority: P1)

A customer with a confirmed upcoming service appointment signs in to the client portal, opens
the appointment, picks a new date and time from the slots the garage actually has available,
optionally adds a reason, and confirms. The appointment moves to the new slot, the customer sees
immediate confirmation, and the garage is notified.

**Why this priority**: This is the core value of the feature — it removes the phone call from the
single most common change a customer makes, and it is the slice that makes the feature worth
shipping on its own. Cancellation and notifications add value but are meaningless without the
ability to actually move an appointment.

**Independent Test**: Sign in as a customer with one upcoming appointment, open it, select a
different available slot, confirm, and verify the appointment now shows the new date/time in both
the customer's portal and the garage calendar. Delivers the complete self-service reschedule.

**Acceptance Scenarios**:

1. **Given** an authenticated customer with an upcoming appointment outside the reschedule
   cutoff, **When** they choose an available future slot and confirm, **Then** the appointment is
   updated to the new slot, the old slot is released, and they see a confirmation showing the new
   date and time.
2. **Given** the customer is viewing available slots, **When** the garage has no open capacity on
   a chosen day, **Then** that day/slot is shown as unavailable and cannot be selected.
3. **Given** two customers attempt to take the same last remaining slot at the same time,
   **When** both confirm, **Then** exactly one succeeds and the other is told the slot is no
   longer available and prompted to pick another, with no double-booking created.
4. **Given** a successful reschedule, **When** it completes, **Then** an audit record is created
   capturing who changed it, when, the previous slot, the new slot, and the reason (if provided).

---

### User Story 2 - Cancel an upcoming appointment (Priority: P2)

A customer who no longer needs their service cancels the upcoming appointment from the portal,
optionally giving a reason. The slot is released back to the garage's availability and staff are
notified.

**Why this priority**: Cancellation frees capacity and reduces no-shows, but it is secondary to
rescheduling because a cancelled appointment is lost revenue the garage would prefer to retain by
offering a new slot first.

**Independent Test**: Sign in as a customer with an upcoming appointment, cancel it, and verify
the appointment shows as cancelled for the customer, the slot becomes available again, and staff
receive a cancellation notification.

**Acceptance Scenarios**:

1. **Given** an authenticated customer with an upcoming appointment outside the cancellation
   cutoff, **When** they cancel and confirm, **Then** the appointment status becomes cancelled,
   its slot is released, and an audit record is written.
2. **Given** a cancellation is requested, **When** the customer is about to confirm, **Then** they
   must confirm the irreversible action before it is applied.

---

### User Story 3 - Garage staff are notified of customer changes (Priority: P2)

When a customer reschedules or cancels, the appointment's assigned garage staff (or, if none is
assigned, the garage's front-desk/manager role) receive an in-app notification showing the
appointment, the customer, and the change (old slot → new slot, or cancelled), so the workshop
schedule stays trustworthy without staff watching the calendar continuously.

**Why this priority**: Without notification, staff lose confidence in self-service because changes
happen silently. It is P2 because the change itself is already persisted and visible on the
calendar; the notification improves trust and responsiveness rather than correctness.

**Independent Test**: As staff, trigger a customer reschedule and a customer cancel, and verify a
distinct in-app notification appears for each with the correct appointment and change details.

**Acceptance Scenarios**:

1. **Given** a customer reschedules an appointment, **When** the change is saved, **Then** the
   garage staff associated with that appointment receive an in-app notification describing the old
   and new slot.
2. **Given** the appointment has no assigned staff member, **When** a customer reschedules or
   cancels it, **Then** the garage's front-desk/manager role receives the notification instead, so
   the change is never silently lost.
3. **Given** a customer cancels an appointment, **When** the change is saved, **Then** the garage
   staff receive an in-app cancellation notification.
4. **Given** the garage has SMS reminders enabled, **When** a reschedule or cancel occurs, **Then**
   an SMS notification MAY also be sent (SMS is optional and gated by the garage's configuration).

---

### User Story 4 - Use the portal in Arabic or English (Priority: P3)

A customer using the portal in Arabic sees the entire reschedule and cancel flow — labels, slot
times, dates, validation messages, and confirmations — correctly localized and laid out
right-to-left, matching the rest of the portal; the same flow works in English left-to-right.

**Why this priority**: Localization is a market requirement, but the flow can be demonstrated and
tested in one language first, so it rides on top of the functional slices above.

**Independent Test**: Switch the portal to Arabic, complete a reschedule, and verify all text is
translated, dates/times render correctly, the layout is right-to-left, and no untranslated keys or
hard-coded English remain; repeat in English.

**Acceptance Scenarios**:

1. **Given** the portal language is Arabic, **When** the customer opens the reschedule flow,
   **Then** all visible text is in Arabic, laid out right-to-left, with locale-appropriate date and
   time formatting.
2. **Given** any validation error (e.g., slot taken, inside cutoff), **When** it is shown, **Then**
   the message appears in the customer's selected language.

---

### Edge Cases

- **Inside the cutoff window**: When the appointment is within the configured minimum-notice
  window (e.g., fewer than X hours away), reschedule and cancel are blocked and the customer is
  told to contact the garage directly.
- **Reschedule limit reached**: When an appointment has already been rescheduled the maximum
  number of times, further self-service reschedules are blocked with a clear explanation, while
  cancellation may still be allowed.
- **Not the customer's appointment**: An attempt to view or modify an appointment that belongs to
  another customer or another garage is rejected and reveals no information about it.
- **Stale slot**: The chosen slot becomes unavailable between the moment it was displayed and the
  moment the customer confirms — the customer is told and asked to choose again.
- **Already-changed appointment**: The appointment was cancelled or rescheduled by staff (or in
  another browser tab) after the customer loaded the page — the customer sees the current state and
  is prevented from acting on stale data.
- **Non-reschedulable status**: The appointment is already completed, in progress, cancelled, or a
  no-show — it is not offered for rescheduling.
- **No availability anywhere**: The garage has no open slots in the bookable horizon — the customer
  is told none are available and offered cancellation or contacting the garage.
- **Notification delivery failure**: An SMS or in-app notification fails to send — the reschedule or
  cancel still succeeds and the failure is logged rather than blocking the customer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated customer to view their own upcoming
  appointments that are eligible for self-service change, surfaced through the existing client
  portal appointment list (the reschedule/cancel flow is reached by opening one of those
  appointments); this feature does not introduce a separate appointment-browsing screen.
- **FR-002**: The system MUST allow a customer to reschedule an eligible appointment to a different
  date and time chosen from slots the garage genuinely has available.
- **FR-003**: The system MUST allow a customer to cancel an eligible appointment.
- **FR-004**: The system MUST restrict every customer to viewing and modifying only appointments
  that belong to their own account and their own garage; cross-customer and cross-tenant access
  MUST be impossible and MUST NOT leak the existence of other records.
- **FR-005**: The system MUST enforce a configurable minimum-notice cutoff before the appointment
  start, below which self-service reschedule and cancel are blocked.
- **FR-006**: The system MUST only offer and accept new slots that respect real workshop
  availability — no slot may be booked that exceeds capacity or conflicts with existing bookings or
  technician availability.
- **FR-007**: The system MUST prevent double-booking under concurrent requests, guaranteeing that a
  single remaining slot is granted to at most one appointment.
- **FR-008**: The system MUST enforce a configurable maximum number of self-service reschedules per
  appointment and block further reschedules once the limit is reached.
- **FR-009**: The system MUST notify the garage staff associated with an appointment, via in-app
  notification, whenever a customer reschedules or cancels it. The recipient is the appointment's
  assigned staff member when one is set; when no staff is assigned, the notification MUST fall back
  to the garage's front-desk/manager role so no customer change goes unseen.
- **FR-010**: The system MUST optionally send an SMS notification on reschedule or cancel when the
  garage has SMS notifications enabled, and MUST treat SMS delivery as non-blocking.
- **FR-011**: The system MUST record an audit entry for every reschedule and cancel, capturing the
  actor, timestamp, previous slot, new slot (for reschedules), and reason when provided.
- **FR-012**: The system MUST present the entire flow — controls, slot times, dates, validations,
  and confirmations — in both Arabic (right-to-left) and English, with no hard-coded,
  untranslatable text and locale-appropriate date/time formatting.
- **FR-013**: The system MUST require explicit confirmation before applying a cancellation and
  before finalizing a reschedule.
- **FR-014**: The system MUST clearly communicate why an action is unavailable (inside cutoff,
  limit reached, slot taken, ineligible status) so the customer knows their alternative.
- **FR-015**: The system MUST exclude appointments that are completed, in progress, cancelled, or
  marked no-show from self-service rescheduling.
- **FR-016**: Upon a successful reschedule, the system MUST release the previously held slot back to
  available capacity.

### Key Entities *(include if feature involves data)*

- **Appointment**: A customer's scheduled service visit, belonging to one customer and one garage,
  with a time slot, a status, an assigned staff/resource, and a count of how many times it has been
  rescheduled.
- **Availability Slot**: A bookable window of workshop capacity for a garage, reflecting bay /
  technician availability and existing bookings, which determines whether a chosen time can be
  taken.
- **Reschedule/Cancel Audit Record**: An immutable log entry tied to an appointment capturing the
  actor, the action (reschedule or cancel), timestamp, previous slot, new slot, and optional reason.
- **Notification**: A message delivered to garage staff (in-app, optionally SMS) describing a
  customer-initiated reschedule or cancellation.
- **Reschedule Policy**: The garage-configurable rules governing the minimum-notice cutoff and the
  maximum number of self-service reschedules per appointment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A customer can reschedule an eligible appointment to an available slot in under 90
  seconds from opening the appointment to seeing confirmation.
- **SC-002**: 100% of attempts to view or modify another customer's or another garage's appointment
  are rejected with no information disclosed.
- **SC-003**: Zero double-bookings result from concurrent reschedule attempts in load testing of
  contended slots.
- **SC-004**: 100% of customer-initiated reschedules and cancellations produce both an audit record
  and a staff notification.
- **SC-005**: The reschedule and cancel flow is fully usable in Arabic (right-to-left) and English,
  with no untranslated or mislaid-out elements observed in review.
- **SC-006**: At least 60% of appointment changes that previously required a phone call are
  completed via self-service within three months of launch.
- **SC-007**: No self-service reschedule or cancel succeeds when the appointment is within the
  configured cutoff or has reached the reschedule limit.

## Assumptions

- An existing client portal with authenticated customer sessions is reused; this feature adds the
  reschedule/cancel capability rather than building portal authentication.
- Appointments, the workshop calendar/availability, staff notifications, SMS sending, audit
  logging, and i18n already exist as platform capabilities and are reused, not rebuilt.
- The minimum-notice cutoff and maximum-reschedule count are configured per garage; sensible
  defaults apply where a garage has not set them (assumed default cutoff: 24 hours; assumed default
  maximum: 3 reschedules per appointment).
- Creating brand-new appointments from scratch, staff-side rescheduling, and any payment or deposit
  changes tied to rescheduling are out of scope for this feature.
- "Eligible" appointments are those that are upcoming, not yet started, and in a confirmed/booked
  status; the precise set of statuses is taken from the existing appointment model.
- Customers are notified of the outcome in-portal; whether customers also receive their own
  SMS/email confirmation follows the garage's existing reminder configuration and is not newly
  mandated here.
- The customer's list of upcoming appointments is provided by the existing client portal; this
  feature adds the reschedule/cancel actions reached from an opened appointment rather than a new
  browsing screen (see FR-001).
- Staff notification recipients are resolved from the existing RBAC roles: the appointment's
  assigned staff when set, otherwise the garage's front-desk/manager role; no new role is
  introduced.
