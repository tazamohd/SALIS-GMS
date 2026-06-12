# Feature Specification: Push Notifications

**Feature Branch**: `001-push-notifications`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Push notifications for SALIS AUTO (roadmap Phase 15): notify customers and staff about job-card status changes, appointment reminders/confirmations, invoice issuance/payment, and low-stock alerts. Delivery channels: web push (PWA) plus in-app notification center, building on the existing WebSocket notification layer; per-user notification preferences with opt-in/opt-out per category; full i18n (English + Arabic RTL); respects existing RBAC and multi-tenant garage/branch scoping."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer is notified when their vehicle's job status changes (Priority: P1)

A customer drops off their vehicle for service. As the job card moves through its
lifecycle (created → in progress → complete → delivered), the customer receives a
notification at each meaningful transition — in the in-app notification center always,
and as a web push notification on devices where they have granted permission — so they
know when their car is ready without calling the garage.

**Why this priority**: Job-status visibility is the single most requested communication
touchpoint between garages and customers, directly reduces inbound "is my car ready?"
calls, and exercises the full notification pipeline end to end. Shipping only this story
is already a viable product increment.

**Independent Test**: Can be fully tested by changing a job card's status as a staff user
and verifying the owning customer receives the corresponding notification in their
notification center (and via web push when subscribed), in their chosen language.

**Acceptance Scenarios**:

1. **Given** a customer with an open job card and notifications enabled, **When** a staff
   member moves the job card to "complete", **Then** the customer sees a "vehicle ready"
   notification in their notification center within seconds.
2. **Given** a customer who has granted browser push permission, **When** their job card
   status changes while the app is closed, **Then** a web push notification is delivered
   to their device with the vehicle and new status.
3. **Given** a customer whose interface language is Arabic, **When** any notification is
   generated for them, **Then** its title and body render in Arabic with correct RTL
   layout.
4. **Given** a customer with no relationship to a job card, **When** that job card changes
   status, **Then** that customer receives no notification about it.

---

### User Story 2 - Staff receive operational alerts (appointments and low stock) (Priority: P2)

Garage staff receive notifications relevant to their role: service advisors get
appointment confirmations/reminders and upcoming-appointment alerts; inventory managers
get low-stock alerts when a spare part falls below its reorder threshold. Staff in one
branch never receive alerts belonging to another garage or branch.

**Why this priority**: Closes the loop on internal operations — missed appointments and
stock-outs are the two highest-cost operational failures — but depends on the delivery
pipeline proven in Story 1.

**Independent Test**: Can be tested by creating an appointment (or decrementing stock
below threshold) in one branch and verifying that only appropriately-roled staff of that
branch are notified.

**Acceptance Scenarios**:

1. **Given** a service advisor in branch A, **When** a customer books an appointment at
   branch A, **Then** the advisor receives an appointment notification.
2. **Given** an inventory manager in branch A, **When** a part's stock at branch A drops
   below its reorder level, **Then** the manager receives a low-stock alert naming the
   part and remaining quantity.
3. **Given** staff in branch B, **When** events occur in branch A, **Then** branch B staff
   receive no notifications for them.
4. **Given** a staff member without inventory permissions, **When** a low-stock event
   occurs, **Then** they do not receive the alert.

---

### User Story 3 - Users manage notification preferences (Priority: P3)

Any user (customer or staff) can open a notification-preferences screen and opt in or out
of each notification category (job status, appointments, invoices/payments, inventory)
independently, and enable/disable web push per device. Preferences take effect
immediately.

**Why this priority**: Required for a respectful notification system and for regulatory
hygiene, but the system can launch with sensible defaults (all relevant categories on,
push off until permission granted) before the preferences UI exists.

**Independent Test**: Can be tested by toggling a category off, triggering an event of
that category, and verifying no notification is delivered, then toggling back on and
verifying delivery resumes.

**Acceptance Scenarios**:

1. **Given** a user who disabled the "invoices" category, **When** an invoice is issued to
   them, **Then** no invoice notification is delivered to them in any channel.
2. **Given** a user who disabled web push but kept categories on, **When** an event
   occurs, **Then** they see it in the in-app notification center only.
3. **Given** a user changing a preference, **When** the change is saved, **Then** it
   applies to the very next notification-worthy event without re-login.

---

### Edge Cases

- A user revokes browser push permission at the browser level: delivery to that
  subscription fails permanently and the stale subscription must be cleaned up without
  affecting in-app delivery.
- A user is logged in on multiple devices/browsers: push goes to all active subscriptions;
  reading a notification on one device marks it read everywhere.
- A notification-worthy event occurs while the recipient has never logged in (e.g., a
  walk-in customer with no portal account): the event is recorded for the notification
  center but no push is attempted.
- A burst of events (e.g., bulk job-card status update) must not flood a user: identical
  notifications for the same entity within a short window are coalesced.
- The push delivery service is unreachable: in-app notifications still work; push delivery
  is retried with backoff and eventually dropped without blocking the originating action
  (a job-card update must never fail because notification delivery failed).
- An unread notification refers to an entity that was since deleted: opening it shows a
  graceful "no longer available" state rather than an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate notifications for these event categories: job-card
  status changes, appointment confirmations and reminders, invoice issuance and payment
  receipt, and low-stock alerts.
- **FR-002**: System MUST deliver every notification to the recipient's in-app
  notification center, and additionally via web push to each device where the recipient
  has an active push subscription and the category enabled.
- **FR-003**: Notification center MUST show unread count, allow marking individual or all
  notifications as read, and retain at least the most recent 90 days of notifications.
- **FR-004**: Each notification MUST deep-link to the relevant entity (job card,
  appointment, invoice, or part) when opened.
- **FR-005**: Users MUST be able to opt in/out of each notification category
  independently, and changes MUST take effect immediately.
- **FR-006**: System MUST render every notification in the recipient's chosen language
  (English or Arabic, with RTL support in Arabic) at delivery time.
- **FR-007**: Recipients MUST be determined by relationship and authorization: customers
  receive only notifications about their own vehicles/jobs/invoices; staff receive only
  categories permitted by their role; all recipients MUST belong to the garage/branch
  where the event occurred.
- **FR-008**: Failure or delay of any notification delivery MUST NOT block or fail the
  business action that triggered it.
- **FR-009**: System MUST deactivate push subscriptions that are revoked or permanently
  failing, without user-visible errors.
- **FR-010**: System MUST coalesce duplicate notifications for the same entity and event
  type occurring within a short window into a single notification.
- **FR-011**: Notification generation MUST be auditable: each sent notification records
  its triggering event, recipient, channels attempted, and delivery outcome.

### Key Entities

- **Notification**: a message addressed to one user about one event; has category, title,
  body (localized), link target, read state, created/read timestamps, and originating
  garage/branch scope.
- **Notification Preference**: per-user, per-category opt-in/out flags plus a per-device
  web-push enablement state.
- **Push Subscription**: a device/browser endpoint registered by a user for web push;
  active or revoked; owned by exactly one user.
- **Notification Event**: the domain occurrence (job status change, appointment, invoice,
  stock threshold breach) that fans out to one or more Notifications.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of notifications appear in the recipient's notification center within
  5 seconds of the triggering event.
- **SC-002**: Customers with active job cards check in by phone at least 30% less often
  within two months of rollout (measured against pre-rollout call logs).
- **SC-003**: Zero cross-tenant or cross-branch notification deliveries in testing and in
  the first 90 days of production audit logs.
- **SC-004**: 100% of notification text is sourced from the localization catalog — no
  hardcoded notification strings in either language.
- **SC-005**: Business operations (job updates, invoicing, stock changes) complete
  successfully even when push delivery is fully unavailable.

## Assumptions

- Web push (PWA) and the in-app notification center are the only channels in scope; SMS,
  WhatsApp, and email notifications remain on the existing channels and are out of scope
  for this feature.
- Native mobile (iOS/Android) push is out of scope until the React Native apps exist
  (roadmap Phase 15 remainder).
- The existing WebSocket notification layer is reused for real-time in-app delivery;
  this feature adds persistence, preferences, categories, and web push on top of it.
- Default preferences: all categories relevant to the user's role are enabled; web push
  is disabled until the user grants browser permission on a device.
- Notification reminders for appointments use the appointment's existing reminder timing
  rules; this feature does not introduce new scheduling semantics.
- Existing authentication, RBAC roles, and garage/branch tenancy models are reused as-is.
