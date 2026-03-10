# Screen Documentation — Section 03: Appointments & Scheduling

**Screens:** 012–018  
**Section:** Appointments & Scheduling  
**Navigation Group:** Customer Intake & Appointments  

---

## Overview

The Scheduling section manages the full appointment lifecycle from customer booking through workshop calendar management. It integrates AI-powered scheduling optimization and drag-and-drop calendar functionality.

---

## Screen 012 — Appointments (`/appointments`)

### Description
Central appointment management hub for all scheduled service bookings.

### Purpose
Manage the complete flow of appointment booking, confirmation, check-in, and conversion to job cards.

### Key Elements
- **Calendar View / List View** — Toggle between calendar and table views
- **Today's Appointments** — Highlighted current day schedule
- **Appointment Cards** — Customer, vehicle, service type, time, status, bay assignment
- **Status Filter** — Scheduled / Confirmed / Checked-In / Completed / No-Show / Cancelled
- **Technician Filter** — View appointments by assigned technician
- **Add Appointment Button** — Manual booking
- **Convert to Job Card** — One-click conversion when customer arrives

### Appointment Status Flow
```
Scheduled → Confirmed → Checked-In → [Job Card Created] → Completed
                     ↓
                  Cancelled / No-Show
```

### User Scenarios

**Scenario 1: Morning Appointment Check-In**
> It's 9:00 AM. Service Advisor opens Appointments, sees Mr. Abdullah arriving for his scheduled oil change. Clicks "Check-In," then "Convert to Job Card." The job card is created pre-filled with customer, vehicle, and requested service. Advisor assigns to available technician.

**Scenario 2: Last-Minute Reschedule**
> Customer calls to reschedule. Service Advisor finds appointment, clicks Edit, changes time slot (system shows available slots in real-time), saves. Customer receives automatic SMS/email confirmation of new time.

**Scenario 3: No-Show Handling**
> Customer didn't show up. Advisor marks appointment as "No-Show." System records this (affects customer's reliability score) and sends automated follow-up message.

### User Flow
```
Appointments
├── View today's schedule
│   ├── Customer arrives → Check In → Convert to Job Card
│   └── Customer no-show → Mark No-Show → Auto follow-up
├── Add new appointment
│   ├── Select customer (existing or new)
│   ├── Select vehicle
│   ├── Choose service type
│   ├── Pick available time slot
│   └── Confirm → Customer notification sent
└── Manage existing
    ├── Reschedule
    ├── Cancel
    └── Add notes
```

---

## Screen 013 — Appointment Reminders (`/appointment-reminders`)

### Description
Automated communication system for reducing appointment no-shows.

### Reminder Schedule
| Reminder | Timing | Channel |
|----------|--------|---------|
| Confirmation | Immediately after booking | Email + SMS |
| Advance reminder | 24 hours before | SMS |
| Day-of reminder | Morning of appointment | SMS |
| Follow-up | 24 hours after | Email (review request) |

### Configuration
- Set reminder timing (1 day, 2 days, 1 week before)
- Choose channels (SMS via Twilio, Email via Gmail)
- Set language per customer preference (Arabic/English)
- Customize message templates

### User Scenarios

**Scenario 1: Appointment Booked**
> Customer books appointment for Monday 10 AM. They immediately receive WhatsApp/SMS: "Your appointment at SALIS AUTO is confirmed for Monday at 10:00 AM. Ref: APT-2024-001"

**Scenario 2: Reminder Delivery**
> Sunday evening, system automatically sends: "Reminder: Your vehicle service is tomorrow at 10:00 AM. Reply CANCEL to cancel."

---

## Screen 014 — Calendar (`/calendar`)

### Description
General-purpose calendar for viewing all garage events: appointments, meetings, maintenance days, holidays.

### Key Elements
- **Month/Week/Day views** — Toggle calendar perspective
- **Event Types** — Appointments (blue), Meetings (green), Maintenance Days (orange), Holidays (red)
- **Drag to Reschedule** — Move events between time slots
- **Event Creation** — Click any empty slot to add event
- **Filter by Type** — Show/hide event categories

---

## Screen 015 — Workshop Calendar (`/workshop-calendar`)

### Description
Advanced drag-and-drop scheduling tool for managing the entire workshop's workload.

### Purpose
Visual operations management — see all bays, all technicians, and all jobs on a single timeline.

### Key Elements
- **Timeline View** — Rows for each technician/bay, columns for time slots
- **Drag-and-Drop Jobs** — Drag jobs between technicians or time slots
- **Color-coded Jobs** — By status (pending, in-progress, complete) or priority
- **Technician Availability Overlay** — Shows who is available at each time
- **Bay Assignment** — Assign jobs to specific service bays
- **Capacity Warning** — Alerts when overbooking is detected
- **Week Navigation** — Browse forward/backward through the week

### Technical Implementation
- Uses `react-big-calendar` for calendar rendering
- Uses `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop
- WebSocket connection for real-time updates (when one user moves a job, others see it immediately)

### User Scenarios

**Scenario 1: Daily Scheduling**
> Service Manager arrives at 7:30 AM, opens Workshop Calendar, drag-drops today's appointments to available technicians based on skill requirements and current workload.

**Scenario 2: Emergency Rescheduling**
> A technician calls in sick. Manager opens calendar, sees all that tech's jobs, quickly drag-drops them to other available technicians.

**Scenario 3: Capacity Planning**
> Manager sees Tuesday is heavily booked (calendar cells turning red). Proactively calls customers to offer Wednesday alternatives.

### User Flow
```
Workshop Calendar
├── View current week
│   ├── Drag job to different technician
│   ├── Drag job to different time slot
│   └── Click job → View job card details
├── Add new job to calendar
│   ├── Click empty slot → Create appointment
│   └── Link to existing job card
└── Print daily schedule → For workshop floor
```

---

## Screen 016 — AI Scheduling (`/ai-scheduling`)

### Description
AI-powered scheduling optimization that recommends optimal appointment times and technician assignments.

### How AI Scheduling Works
```
Input:
├── Available time slots
├── Technician skills and certifications
├── Current workload per technician
├── Historical job duration data
├── Vehicle make/model (specialty requirement check)
└── Customer preferences (preferred time/technician)

Output:
├── Recommended appointment time slot
├── Recommended technician assignment
├── Estimated job duration
└── Confidence score
```

### Key Features
- **Auto-Schedule Button** — Let AI optimize the entire day's schedule
- **Manual Override** — Advisors can override AI suggestions
- **Skill Matching** — AI only assigns technicians certified for the vehicle/service
- **What-if Analysis** — "What if I add 3 more jobs today?"

---

## Screen 017 — Smart Assignment (`/smart-assignment`)

### Description
Intelligent job-to-technician assignment tool based on skills, certifications, and real-time workload.

### Assignment Logic
```
Job Requirements:
├── Vehicle type (car, truck, motorcycle)
├── Service type (engine, electrical, bodywork)
└── Required certifications

Technician Profile:
├── Skills list
├── Certifications (OEM, ISO)
├── Current workload (jobs in progress)
└── Estimated completion time

Match Score:
└── Weighted combination of above factors
```

### User Scenarios

**Scenario 1: Auto-Assignment**
> 5 new jobs need assignment. Manager clicks "Auto-Assign All." Smart Assignment analyzes each job's requirements against all available technicians and assigns based on match score and workload balance.

---

## Screen 018 — Routing Optimizer (`/routing-optimizer`)

### Description
Logistics optimization for mobile/field service operations — optimizes technician travel routes for off-site jobs.

### Use Case
For garages offering home service or fleet service at customer locations.

### Features
- **Stop Input** — Enter multiple service addresses
- **Route Optimization** — Calculates most efficient sequence
- **Distance/Time Estimates** — Per stop
- **Traffic Integration** — Real-time traffic consideration
- **Assign to Technician** — Send route to technician's mobile app

---

## Scheduling Flow Diagram

```
Customer Request
      │
      ▼
Available Slots Check
      │
      ▼
Slot Selection (Customer or Advisor)
      │
      ▼
AI Scheduling Recommendation (optional)
      │
      ▼
Appointment Created
      │
      ├── Confirmation Sent to Customer (SMS/Email)
      ├── Added to Workshop Calendar
      │
      ▼
Day of Appointment
      │
      ▼
Customer Arrives → Check-In
      │
      ▼
Convert to Job Card
      │
      ▼
Smart Assignment → Technician Assigned
      │
      ▼
Job Starts → Service Bay Occupied
```

---

*Screen Documentation 03 — Appointments & Scheduling*
