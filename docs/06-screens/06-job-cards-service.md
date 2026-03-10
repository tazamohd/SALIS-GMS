# Screen Documentation — Section 06: Job Cards & Service Execution

**Screens:** 041–046  
**Section:** Service Planning & Execution  
**Navigation Group:** Service Execution & Operations  

---

## Overview

The Job Card is the operational heart of SALIS AUTO. Every vehicle service is tracked as a job card from customer intake through delivery. This section covers the complete service execution workflow.

---

## Screen 041 — Job Cards (`/job-cards`)

### Description
Master job card management interface — the most used module in daily operations.

### Purpose
Track every service job from creation to completion, manage technician assignments, parts usage, and customer communication.

### Job Card Table Columns
| Column | Description |
|--------|-------------|
| Job # | Sequential job number (e.g., JC-2024-001) |
| Customer | Customer name with avatar |
| Vehicle | Make, model, plate |
| Service | Primary service description |
| Technician | Assigned technician |
| Status | Current status badge (color-coded) |
| Priority | Urgency level |
| Start Date | When work began |
| Est. Completion | Target completion time |
| Progress | Percentage complete |
| Total Cost | Current running cost |
| Actions | Open, Print, Void buttons |

### Job Card Status Flow
```
PENDING → IN_PROGRESS → QUALITY_CHECK → COMPLETED → DELIVERED
   │                                         │
   └──────────── ON_HOLD ────────────────────┘
   │
   └── CANCELLED
```

### Status Color Codes
| Status | Color | Meaning |
|--------|-------|---------|
| Pending | Gray | Created, not started |
| In Progress | Blue | Actively being worked |
| On Hold | Orange | Waiting (parts, customer approval) |
| Quality Check | Purple | Work done, being inspected |
| Completed | Green | Work done, awaiting delivery |
| Delivered | Teal | Vehicle returned to customer |
| Cancelled | Red | Job cancelled |

### Job Card Creation Form
**Required:**
- Customer (link or create new)
- Vehicle (link to existing or register new)
- Service description
- Priority level

**Optional:**
- Estimated cost
- Expected completion date
- Special instructions
- Tracking token (auto-generated)

### User Scenarios

**Scenario 1: Standard Service Job**
> Customer arrives for oil change. Receptionist creates job card: select customer "Mohammed Al-Rashid," select his Toyota Camry, service type "Oil Change," priority Normal, assigns to tech Ahmed. Job number JC-2024-0347 is created. Tracking link is sent to customer via SMS.

**Scenario 2: Complex Repair with Multiple Technicians**
> BMW 5 Series comes in for engine overhaul + electrical fault. Lead Technician creates job card, adds multiple tasks: "Engine diagnostics" (Lead Tech), "Engine strip-down" (Tech A), "Electrical fault trace" (Tech B - specialist). Each technician sees their task in their portal.

**Scenario 3: Parts Waiting Hold**
> Tech discovers a faulty part not in stock. Puts job on hold, notes "Waiting for brake caliper." Purchase agent receives notification to source the part. When part arrives, job moves back to In Progress automatically.

### User Flow
```
Job Cards List
├── New Job Card
│   ├── Select customer → vehicle
│   ├── Describe service
│   ├── Set priority
│   ├── Assign technician
│   └── Save → Tracking link generated → SMS to customer
├── Manage Existing
│   ├── Click job → View full detail
│   │   ├── Update status
│   │   ├── Add tasks
│   │   ├── Log parts
│   │   ├── Upload photos
│   │   └── Add notes
│   ├── Convert to Invoice → Billing
│   └── Print Job Card → Workshop copy
└── Filter & Search
    ├── By status, technician, date
    └── Export to Excel/PDF
```

---

## Screen 042 — Service Templates (`/service-templates`)

### Description
Predefined service packages that can be applied to job cards for common, standardized services.

### Purpose
Speed up job card creation by pre-filling common service tasks and typical parts.

### Default Templates
| Template | Tasks | Parts |
|----------|-------|-------|
| Full Oil Service | Drain oil, replace filter, top up oil | Engine oil (5L), oil filter |
| Brake Service (Front) | Remove pads, inspect discs, refit pads | Front brake pads |
| Tire Rotation | Remove all 4 tires, reposition, refit | None |
| 30,000 km Major Service | Oil, filters, plugs, belts check | Oil, oil filter, air filter, fuel filter |
| AC Service | Regas, check compressor, clean filters | Refrigerant |

### Creating Custom Templates
1. Go to Service Templates → New Template
2. Name the template
3. Add tasks (with estimated time per task)
4. Add typical parts (with quantities)
5. Set standard price (optional)
6. Save — template is available in job card creation

---

## Screen 043 — Service Bay Dashboard (`/service-bay-dashboard`)

### Description
Real-time monitoring of all service bays in the workshop — which bay is occupied, what job, which technician, how long remaining.

### Purpose
Give managers live visibility into workshop floor utilization to maximize throughput.

### Bay Card Display
Each bay card shows:
- **Bay Number** and status
- **Current Job** — Job number, customer, vehicle
- **Assigned Technician** — Photo, name
- **Time Elapsed** — How long job has been in this bay
- **Estimated Remaining** — Time to completion
- **Progress Bar** — Visual completion percentage
- **Start/End Session Buttons**

### Status Colors
- **Green** — Bay available
- **Blue** — Bay occupied (job in progress)
- **Yellow** — Bay occupied (job on hold)
- **Red** — Bay occupied (overdue job)
- **Gray** — Bay out of service/maintenance

### Real-Time Updates
- WebSocket connection pushes updates to all managers viewing the dashboard
- When a technician starts/ends a bay session, all dashboard viewers see the update instantly

### User Scenarios

**Scenario 1: Real-Time Monitoring**
> Service Manager walks the floor and checks the dashboard simultaneously. Bay 3 shows a red overdue status. Manager checks — the tech is stuck waiting for a part. Manager calls Purchase Agent to expedite the part.

**Scenario 2: Bay Availability**
> New walk-in customer with a flat tire. Manager checks dashboard — Bay 5 is available. Directs customer immediately to Bay 5. Tech starts session.

---

## Screen 044 — Live Service Tracking (`/live-service-tracking`)

### Description
Customer-facing and internal real-time job progress tracker.

### Two Views
**Internal (Staff):**
- All jobs with live progress
- Technician activity feed
- Time alerts for approaching deadlines

**External (Customer — via public URL):**
- Clean, simple status display
- Current step in progress
- Estimated completion time
- Service advisor contact button

---

## Screen 045 — Quality Control (`/quality-control`)

### Description
Pre-delivery inspection checklist ensuring every vehicle meets quality standards before being returned to the customer.

### QC Checklist (Standard)
- All reported faults resolved
- Vehicle clean (washed, vacuumed)
- No new damage from service
- All fluids topped up
- Tire pressures correct
- All caps/covers properly fitted
- Test drive completed
- Check engine light clear

### QC Pass / Fail
- **Pass** → Job moves to "Completed" status, customer notification sent
- **Fail** → Job returned to "In Progress" with QC notes for technician to address

---

## Screen 046 — Computer Vision QC (`/computer-vision-qc`)

### Description
AI-powered quality control using computer vision to automatically inspect vehicles for damage, paint quality, and cleanliness before delivery.

### How It Works
```
Camera captures vehicle images (multiple angles)
         │
         ▼
Vision AI analysis (fine paint defects, panel alignment, cleanliness)
         │
         ▼
Defects flagged with location overlay on vehicle diagram
         │
         ▼
QC Inspector reviews flags → Accept or escalate
         │
         ▼
Report generated → Attached to job card
```

---

## Complete Service Execution Flow

```
INTAKE
Customer Arrives → Check-In → Walkaround
         │
PLANNING
Service Advisor: Create Job Card
→ Apply Service Template
→ Assign Technician
→ Bay Assignment
         │
EXECUTION
Tech: Start Job → Log Tasks → Log Parts
→ Real-time Progress Update
→ Upload Photos
         │
         [Parts needed? → Purchase Agent notified]
         [Customer approval needed? → SMS sent]
         │
QUALITY
QC Inspector: Checklist
→ Computer Vision Scan
→ Pass / Fail
         │
DELIVERY
Invoice Generated → Customer Pays → Vehicle Returned
→ Service History Updated
→ Customer Satisfaction Request Sent
→ Next Service Reminder Scheduled
```

---

*Screen Documentation 06 — Job Cards & Service Execution*
