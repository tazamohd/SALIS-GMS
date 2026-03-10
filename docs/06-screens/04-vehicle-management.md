# Screen Documentation — Section 04: Vehicle Management

**Screens:** 019–036  
**Section:** Vehicle Management  
**Navigation Group:** Vehicle Management  

---

## Overview

Vehicle Management is one of the most comprehensive sections in SALIS AUTO, covering everything from basic registration to advanced telematics integration. Every vehicle has a complete digital profile that grows richer with each service visit.

---

## Screen 019 — Vehicles (`/vehicles`)

### Description
Enhanced vehicle management with comprehensive filtering, search, and vehicle catalog integration.

### Purpose
Master database of all vehicles served by the garage.

### Key Elements
- **Vehicle Cards / Table View** — Toggle display mode
- **Search** — By plate number, VIN, make, model, customer name
- **Filter** — By make, model, year, fuel type, status
- **Add Vehicle Button** — Opens vehicle registration form
- **Vehicle Health Indicator** — Color-coded health status badge

### Add Vehicle Form

The vehicle registration form uses dependent dropdown selectors:
1. **Select Make** → populates Model dropdown
2. **Select Model** → populates Year options
3. Available makes include 57+ brands with logos/emojis

**Form Fields:**
| Field | Type | Options |
|-------|------|---------|
| Customer | Search select | Existing customers |
| Make | Select | 57 makes (Toyota, BMW, Mercedes, etc.) |
| Model | Select (dependent) | 200+ models (filtered by make) |
| Year | Select | 1990–current |
| Color | Color picker / text | Standard colors |
| VIN | Text (17 char) | Auto-decode button |
| License Plate | Text | Saudi format |
| Fuel Type | Select | Petrol/Diesel/Electric/Hybrid |
| Current Mileage | Number | Odometer reading |
| Notes | Textarea | Special notes |

### User Scenarios

**Scenario 1: New Vehicle Registration**
> Customer brings new car. Receptionist clicks "Add Vehicle," selects customer, picks Toyota from makes dropdown (corolla models auto-load), selects Corolla 2023, enters plate number and VIN, clicks "Decode VIN" to auto-fill remaining details. Saves.

**Scenario 2: Finding a Vehicle**
> Customer calls about their Mercedes E-Class. Advisor types "Mercedes" in search, filters by customer name, vehicle appears immediately.

---

## Screen 020 — Vehicles List (`/vehicles-list`)

### Description
Alternative list view of all vehicles — same data, optimized for bulk operations.

### Differences from /vehicles
- Table format with sortable columns
- Bulk selection for batch operations
- Export-focused layout
- Pagination for large fleets

---

## Screen 021 — Vehicle Inspections (`/vehicle-inspections`)

### Description
Pre-service and delivery inspection management.

### Inspection Types
| Type | When | Purpose |
|------|------|---------|
| Pre-Service | On arrival | Document existing condition |
| Mid-Service | During work | Discover additional issues |
| Delivery | Before handover | Confirm quality |
| Annual | Yearly | Comprehensive vehicle health |

### Inspection Checklist Items
- Exterior body condition (all panels)
- Interior condition
- Tire condition and pressure
- Lights and electrical
- Fluid levels (oil, coolant, brake fluid)
- Brake condition
- Windshield / wipers
- Battery condition

### Digital Signature
After inspection, customer signs the inspection report digitally on a tablet, confirming agreement with documented condition.

---

## Screen 022 — Vehicle Checklist (`/vehicle-checklist`)

### Description
Standardized pre/post service checklist with photo documentation.

### Key Features
- **Configurable checklist items** per service type
- **Photo upload** for each checklist item
- **Pass/Fail/N.A.** designation per item
- **Technician signature** on completion
- **Printable report** for customer

---

## Screen 023 — Vehicle History (`/vehicle-history`)

### Description
Complete chronological service history for any vehicle.

### History Timeline Shows
- Date and mileage of each visit
- Services performed
- Parts replaced
- Technician who performed work
- Total cost of each visit
- Notes and observations
- Photos from inspection

### Blockchain Integration
When blockchain is enabled, each service history entry is hashed and stored on-chain, creating a tamper-proof vehicle history record — valuable for vehicle resale.

---

## Screen 024 — Vehicle Health Monitoring (`/vehicle-health-monitoring`)

### Description
Real-time and predictive vehicle health dashboard aggregating data from OBD, telematics, and service history.

### Health Score Components
| Factor | Weight | Source |
|--------|--------|--------|
| Last service freshness | 25% | Service history |
| Mileage vs. service interval | 25% | Odometer records |
| Known fault codes | 30% | OBD data |
| Age of wear items | 20% | Parts history |

### Health Score Colors
- **Green (80–100)** — Vehicle in good condition
- **Yellow (60–79)** — Some attention needed
- **Orange (40–59)** — Service overdue
- **Red (0–39)** — Immediate attention required

### User Scenarios

**Scenario 1: Proactive Outreach**
> Monday morning, Service Manager reviews health dashboard. Notices 5 vehicles with Red health scores. System auto-triggers SMS to those customers: "Your vehicle's health score indicates service is overdue. Book today and receive 10% off."

---

## Screen 025 — Vehicle Tracking (`/vehicle-tracking`)

### Description
Real-time location tracking for vehicles currently in service or being transported.

### Features
- **GPS Map View** — Live location on map
- **Status Overlay** — Vehicle status badge on map
- **History Playback** — Replay vehicle's movement timeline
- **Geofence Alerts** — Notify if vehicle exits allowed area

---

## Screen 026 — Vehicle Storage (`/vehicle-storage`)

### Description
Tracking for vehicles being stored at the garage (awaiting parts, customer hasn't picked up, long-term storage).

### Storage Records Track
- Check-in date and condition
- Expected pickup date
- Storage fee calculation
- Daily status updates
- Customer notification for overdue pickup

---

## Screen 027 — VIN Decoder (`/vin-decoder`)

### Description
Standalone VIN (Vehicle Identification Number) decoding tool.

### How VIN Decoding Works
```
VIN: 1HGBH41JXMN109186
│├── [1] Country: USA
│├── [H] Manufacturer: Honda
│├── [G] Vehicle Type: Passenger car
│├── [BH41J] Vehicle descriptor (model, body, restraints)
│├── [X] Check digit
│├── [M] Model year: 2021
│├── [N] Plant: Alliston, Ontario
│└── [109186] Sequential production number
```

### Decoded Information Displayed
- Manufacturer and brand
- Vehicle type and body style
- Engine type and displacement
- Model year
- Country of manufacture
- Assembly plant

### Integration
- Automatically populated when adding a vehicle
- Can decode any standalone VIN for research
- Connects to NHTSA (National Highway Traffic Safety Administration) database

---

## Screen 028 — Fleet Management (`/fleet-management`)

### Description
Management interface for corporate fleets — multiple vehicles owned by a single business customer.

### Fleet Dashboard Shows
- Total fleet size
- Vehicles by status (in service, available, out of service)
- Fleet-wide service due dates
- Total spend this period vs. budget
- Fleet health score average

### Fleet Features
- **Group Management** — Manage all fleet vehicles simultaneously
- **Bulk Scheduling** — Schedule maintenance for entire fleet
- **Fleet Account Billing** — Consolidated invoicing to the business
- **Fleet Reports** — Cost per vehicle, utilization reports

---

## Screen 029 — Fleet Tracking (`/fleet-tracking`)

### Description
Real-time GPS tracking dashboard for fleet vehicles.

### Key Features
- Map view showing all fleet vehicles
- Vehicle status overlay (moving/idle/parked)
- Driver assignment per vehicle
- Mileage tracking and reporting
- Fuel consumption monitoring

---

## Screen 030 — Tire Management (`/tire-management`)

### Description
Specialized module for tracking tire condition, rotation schedules, and replacements.

### Tracked Per Vehicle
- Current tire brand and model per axle
- Tire installation date and mileage
- Tread depth readings (history)
- Rotation schedule and history
- Next rotation/replacement due

### Alerts
- Tread depth below safe minimum
- Rotation overdue
- Seasonal tire change reminders

---

## Screen 031 — Loaner Vehicles (`/loaner-vehicles`)

### Description
Management of the garage's loaner/courtesy vehicle fleet for customers whose vehicles are in extended service.

### Loaner Booking Process
```
Customer vehicle in extended service
└── Advisor books loaner
    ├── Check loaner availability
    ├── Record checkout: date, mileage, customer
    ├── Customer signs agreement
    ├── Return: Record return date, mileage, condition
    └── Charge for excess mileage or damage (if applicable)
```

---

## Screen 032 — Towing Assistance (`/towing-assistance`)

### Description
Coordinating towing services for vehicles that cannot drive to the garage.

### Features
- Request towing service for a customer
- Track towing truck location
- Estimated arrival time
- Towing cost tracking
- Link to job card when vehicle arrives

---

## Screen 033 — Towing Services (`/towing-services`)

### Description
Administrative view of all towing service requests and fleet (if garage owns tow trucks).

---

## Screen 034 — Telematics Integration (`/telematics-integration`)

### Description
Integration with vehicle telematics providers to receive continuous vehicle health data.

### Data Received
- Real-time GPS location
- Speed and driving behavior
- Engine fault codes (OBD-II)
- Fuel level
- Mileage updates
- Driver identification

---

## Screen 035 — Digital Vehicle Walkaround (`/digital-vehicle-walkaround`)

### Description
Tablet-based pre-service vehicle condition documentation with photo markup.

### Walkaround Process
```
Vehicle Arrives → Inspection Mode
├── 360° Vehicle Diagram displayed
├── Tap any panel to mark damage
│   ├── Type of damage (scratch, dent, crack, etc.)
│   ├── Photo upload for that area
│   └── Description
├── Customer reviews and e-signs
└── Report saved to vehicle record
```

---

## Screen 036 — License Plate Recognition (`/license-plate`)

### Description
LPR (License Plate Recognition) camera integration for automatic customer identification.

### Integration Points
- Camera system detects plate
- SALIS AUTO looks up plate → finds vehicle → loads customer profile
- Reception screen shows customer name and vehicle before they reach the desk
- Logs entry/exit times

---

## Vehicle Management Flow Diagram

```
New Customer with Vehicle
         │
         ▼
  Register Customer
         │
         ▼
  Register Vehicle (VIN Decode)
         │
         ▼
  Digital Walkaround (pre-service condition)
         │
         ▼
  Vehicle Inspection Checklist
         │
         ▼
  Create Job Card
         │
         ▼
  Service Performed → Parts Logged
         │
         ▼
  QC Inspection
         │
         ▼
  Update Vehicle History + Blockchain Record
         │
         ▼
  Delivery Walkaround (confirm condition)
         │
         ▼
  Service Reminder Scheduled
```

---

*Screen Documentation 04 — Vehicle Management*
