# Screen Documentation — Section 10: Portals & Mobile Applications

**Screens:** 090–126  
**Section:** Multi-Portal Architecture  
**Navigation Group:** Multiple (per portal)  

---

## Overview

SALIS AUTO features a sophisticated multi-portal architecture, providing purpose-built interfaces for each user role. Each portal is a complete mini-application optimized for its specific user's daily tasks.

---

## Technician Portal (Screens 090–102)

### Purpose
Dedicated workspace for technicians — everything they need, nothing they don't. Optimized for use in a workshop environment (large buttons, minimal typing).

### Screen 090 — Technician Portal Dashboard (`/technician-portal`)
**What it shows:**
- Today's assigned jobs with priority order
- Time clock status (clocked in/out)
- Personal performance metrics this month
- Announcements from management

**Quick actions:**
- Clock In / Clock Out
- View next job
- Request parts

---

### Screen 091 — My Jobs (`/technician-portal/my-jobs`)
Complete list of all jobs assigned to this technician.

**Filters:**
- Today / This Week / All Open
- By status / By priority

**Job Card Preview:**
- Vehicle thumbnail, customer name
- Service requested
- Estimated hours
- Parts needed badge

---

### Screen 092 — Time Clock (`/technician-portal/time-clock`)
Attendance recording interface.

**Features:**
- Large Clock In / Clock Out buttons
- Break recording
- Real-time elapsed time display
- Week summary view
- Pay estimate calculator (based on hourly rate)

---

### Screen 093 — Parts Lookup (`/technician-portal/parts`)
Search available parts without leaving the portal.

**Features:**
- Fast search by name or SKU
- Stock availability at current branch
- Network availability indicator
- Request part button (alerts purchase agent)

---

### Screen 094 — Job Documentation (`/technician-portal/documentation`)
Capture and upload job documentation.

**Features:**
- Camera integration for photos
- Before/after image pairs
- Voice notes
- Text notes
- All saved directly to the job card

---

### Screen 095 — Profile (`/technician-portal/profile`)
Technician's own profile management.

**Sections:**
- Personal information
- Skills and certifications list
- Performance history chart
- Training progress

---

### Screens 096–098 — Supporting Portal Pages
| Screen | Path | Purpose |
|--------|------|---------|
| 096 | /technician-portal/attendance | View attendance history |
| 097 | /technician-portal/guides | Access repair guides library |
| 098 | /technician-portal/software | Launch OEM diagnostic software |

---

### Screens 099–102 — Technician Management (Admin Side)
| Screen | Path | Purpose |
|--------|------|---------|
| 099 | /technician-management | Manage all technicians as admin |
| 100 | /technician-leaderboards | Performance rankings |
| 101 | /technician-performance | Individual performance analytics |
| 102 | /technician-mobile | Mobile portal standalone view |

---

## Technician Mobile App (Screens 103–107)

### Purpose
Native mobile-optimized app for technicians. Uses a bottom tab navigation design pattern for thumb-friendly operation.

### Screen 103 — Home (`/technician-app`)
**Shows:**
- Today's job count
- Clock-in status
- Quick job overview cards

### Screen 104 — Jobs (`/technician-app/jobs`)
Mobile-optimized job list with swipe gestures.

**Swipe Actions:**
- Swipe right → Mark task complete
- Swipe left → Add note

### Screen 105 — Clock (`/technician-app/clock`)
Full-screen time clock with large tap targets.

### Screen 106 — Parts Lookup (`/technician-app/lookup`)
Mobile parts search with barcode scanning via camera.

### Screen 107 — Profile (`/technician-app/profile`)
Mobile profile and settings.

---

## Purchase Agent Portal (Screens 079–089)
*(Documented in Section 09 — Inventory & Parts)*

---

## Client Portal (Screens 108–116)

### Purpose
Premium customer experience portal for desktop access to vehicle and service information.

### Screen 108 — Dashboard (`/client`)
**Customer Dashboard shows:**
- Vehicle health cards
- Upcoming appointments
- Active job status (with progress)
- Recent invoices
- Loyalty points balance + tier
- Personalized service reminders

---

### Screen 109 — Vehicles (`/client/vehicles`)
Customer's vehicle management.

**Per Vehicle Shows:**
- Photo, make, model, year, plate
- Health score (color-coded)
- Last service date
- Next service due
- Mileage tracking chart

**Actions:**
- Request service for this vehicle
- View service history
- Download service records

---

### Screen 110 — Appointments (`/client/appointments`)
All past and upcoming appointments.

**Features:**
- Book new appointment (opens booking flow)
- Cancel upcoming appointment
- View appointment details
- Directions to garage

---

### Screen 111 — Invoices (`/client/invoices`)
All invoices with payment status.

**Invoice Card Shows:**
- Job description, date, amount, status (paid/unpaid)
- Download PDF button
- Pay Now button (for unpaid)
- ZATCA QR code

---

### Screens 112–116 — Client Portal Pages
| Screen | Path | Purpose |
|--------|------|---------|
| 112 | /client/profile | Manage personal info, language, notifications |
| 113 | /client/service-history | Full chronological service history |
| 114 | /client/live-tracking | Real-time vehicle tracking map |
| 115 | /client/reminders | Service reminder settings |
| 116 | /client/review-chat | Chat with service advisor, leave review |

---

## Customer Mobile App (Screens 117–121)

### Purpose
Mobile-first experience for customers to manage all garage interactions from their phone.

### Design Philosophy
- Maximum 3 taps to any action
- Large typography (accessible)
- Minimal form fields
- Proactive notifications

### Navigation Structure
```
Bottom Tab Bar:
├── 🏠 Home
├── 📅 Book
├── 🚗 Vehicles
├── 💳 Payments
└── 👤 Profile
```

### Screen 117 — Home (`/customer-app`)
**Personalized home shows:**
- Next appointment countdown
- Current vehicle status (if in service)
- Loyalty points and tier badge
- Quick action buttons

### Screen 118 — Booking (`/customer-app/booking`)
Step-by-step booking flow:
```
Step 1: Select Vehicle
Step 2: Select Service Type
Step 3: Select Date & Time (calendar picker)
Step 4: Add Notes
Step 5: Confirm Booking → SMS confirmation
```

### Screen 119 — Vehicles (`/customer-app/vehicles`)
All vehicles with service status cards.

### Screen 120 — Payments (`/customer-app/payments`)
Mobile payment history and quick payment link.

### Screen 121 — Profile (`/customer-app/profile`)
Account management: personal info, language, notification preferences, loyalty card.

---

## Portal & General Customer Portal (Screens 122–126)

### Screens 122–126 — Portal Pages
| Screen | Path | Purpose |
|--------|------|---------|
| 122 | /portal/dashboard | Alternative customer dashboard |
| 123 | /portal/appointments | Appointment management |
| 124 | /portal/invoices | Invoice history |
| 125 | /portal/vehicles | Vehicle overview |
| 126 | /portal/communications | Message history with garage |

---

## Multi-Portal Architecture Diagram

```
SALIS AUTO Platform
         │
    ┌────┴─────────────────────────────────────┐
    │                                          │
Staff Side                               Customer Side
    │                                          │
    ├── Main Admin UI (/dashboard)        ├── Client Portal (/client)
    ├── Technician Portal (/tech-portal)  ├── Customer Mobile (/customer-app)
    ├── Purchase Agent (/purchase-agent)  └── Public Tracking (/track/:token)
    └── B2B Network (/parts-network)
```

---

*Screen Documentation 10 — Portals & Mobile Applications*
