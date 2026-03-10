# Screen Documentation — Section 05: Diagnostics & OBD

**Screens:** 037–040  
**Section:** Diagnostics & Assessment  
**Navigation Group:** Diagnostics & Assessment  

---

## Overview

The Diagnostics section integrates physical vehicle diagnostic tools with the SALIS AUTO platform, enabling data-driven service recommendations and predictive maintenance.

---

## Screen 037 — Diagnostics OBD Hub (`/diagnostics-obd`)

### Description
Central hub for OBD (On-Board Diagnostics) device integration and fault code management.

### Purpose
Read vehicle fault codes directly from connected OBD devices, translate them to service recommendations, and create job cards from diagnostic findings.

### Key Elements
- **Connected Devices Panel** — Active OBD scanners and their status
- **Vehicle Connection** — Link device reading to specific vehicle
- **Fault Code Table** — P-codes (Powertrain), B-codes (Body), C-codes (Chassis), U-codes (Network)
- **Code Translator** — Plain-language explanation of each fault code
- **Severity Indicator** — Critical / Moderate / Minor
- **Create Job Card** — One-click job creation from fault codes
- **History Log** — Previous diagnostic sessions per vehicle

### Fault Code Structure
```
P0420 — Catalyst System Efficiency Below Threshold (Bank 1)
│├── P = Powertrain
│├── 0 = Generic (SAE standard)
│├── 4 = Fuel and air metering (auxiliary emission controls)
│└── 20 = Specific fault code
```

### User Scenarios

**Scenario 1: Diagnostic Check-In**
> Customer arrives with check engine light. Technician connects OBD scanner, pairs to SALIS AUTO, vehicle's fault codes appear. System shows P0420 (catalyst efficiency) and P0300 (random misfire). AI recommends: "Inspect catalytic converter, check spark plugs." Technician creates job card with pre-filled service recommendations.

**Scenario 2: Preventive Diagnostics**
> During routine oil change, technician runs quick OBD scan. No fault codes, but live data shows battery voltage reading low (12.1V, threshold: 12.4V). System flags for battery testing. Customer is advised proactively.

### User Flow
```
OBD Hub
├── Connect OBD device → Select vehicle
├── Run diagnostic scan
│   ├── Read fault codes
│   ├── View live data streams (RPM, temp, O2 sensors, etc.)
│   └── Save scan results to vehicle record
├── Create job from findings
│   ├── Select relevant codes
│   ├── Auto-fill service recommendations
│   └── Create job card → assign technician
└── Review diagnostic history
    └── Compare to previous scans → Identify progressive issues
```

---

## Screen 038 — Predictive Diagnostics (`/predictive-diagnostics`)

### Description
AI-powered diagnostic prediction based on vehicle history, mileage patterns, and known failure rates.

### How Prediction Works
```
Input Data:
├── Vehicle age and mileage
├── Service history (what's been replaced)
├── Known failure patterns for make/model
├── OBD historical data
└── Regional driving conditions

Output:
├── Predicted failure components (with probability %)
├── Estimated time to failure
├── Recommended preventive actions
└── Cost estimate for recommended service
```

### Prediction Categories
- **Imminent** (0–30 days, high confidence) — Take action now
- **Near-term** (1–3 months) — Schedule service
- **Medium-term** (3–12 months) — Plan and budget
- **Long-term** (12+ months) — Awareness only

### User Scenarios

**Scenario 1: Proactive Customer Contact**
> System flags that a 2019 Toyota Camry with 85,000 km has a 78% probability of needing water pump replacement within 60 days (based on model failure data). System auto-sends SMS to customer: "Diagnostic analysis of your Camry suggests your water pump may need attention. Book a free inspection today."

**Scenario 2: Service Upsell During Visit**
> Customer is in for brake service. Predictive diagnostics shows 65% probability of alternator failure within 3 months. Service advisor mentions this to customer, who agrees to additional check.

---

## Screen 039 — Predictive Maintenance (`/predictive-maintenance`)

### Description
Maintenance schedule prediction based on manufacturer recommendations and actual usage patterns.

### Maintenance Intervals Tracked
| Service | Standard Interval | AI-Adjusted Interval |
|---------|------------------|---------------------|
| Oil Change | 5,000 km | Adjusted by driving style |
| Air Filter | 15,000 km | Adjusted by dust exposure |
| Brake Pads | 30,000 km | Adjusted by brake usage |
| Timing Belt | 60,000 km | Fixed (safety critical) |
| Spark Plugs | 30,000 km | Based on fuel quality |

### Features
- Vehicle-specific maintenance schedules
- Mileage-based and time-based triggers
- Integration with appointment reminders
- Fleet-wide maintenance overview
- Cost forecasting for planned maintenance

---

## Screen 040 — OEM Software Subscriptions (`/oem-software`)

### Description
Management of licensed OEM (Original Equipment Manufacturer) diagnostic software subscriptions.

### Purpose
Professional garages need OEM software access to properly diagnose and program modern vehicles. This module manages these subscriptions.

### Supported OEM Software
| OEM | Software | Usage |
|-----|---------|-------|
| Toyota/Lexus | Techstream | Diagnostics, programming |
| BMW | ISTA | Fault codes, coding |
| Mercedes | XENTRY | Full diagnostic |
| Ford | IDS | Module programming |
| GM | GDS2 | Diagnostics |
| Honda | HDS | ECU reset |

### Subscription Management
- License key storage (encrypted)
- Expiry date tracking with renewal alerts
- Cost tracking and budgeting
- Usage logs (which technician used which software)
- Access control (not all technicians need all OEM software)

---

## Diagnostics Flow Diagram

```
Vehicle Arrives with Issue
         │
         ▼
OBD Diagnostic Scan
         │
    ┌────┴────┐
    │         │
Fault Codes  No Codes
    │         │
    ▼         ▼
Code Analysis  Live Data Review
    │         │
    ▼         ▼
AI Recommendation → Service Plan
         │
         ▼
Create Job Card (pre-filled)
         │
         ▼
Assign to Certified Technician
         │
         ▼
Repair + Clear Codes
         │
         ▼
Post-Repair Scan (verify codes cleared)
         │
         ▼
Diagnostic Report to Customer
```

---

*Screen Documentation 05 — Diagnostics & OBD*
