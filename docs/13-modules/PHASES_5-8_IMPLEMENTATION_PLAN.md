# Phases 5-8 Implementation Plan
## SALIS AUTO Enterprise ERP - Remaining Features

**Status:** Planning complete, ready for implementation  
**Approach:** UI-first with mock data, backend integration later  
**Design System:** SALIS AUTO monochrome (bg-gray-50 dark:bg-salis-black)

---

## Phase 5: Operations & Efficiency (5 features)

### 1. AI-Powered Scheduling Optimizer
**File:** `client/src/pages/AIScheduling.tsx`  
**Features:**
- Scheduling rules management (technician skills, workload, parts availability)
- Optimization history with efficiency metrics
- Technician utilization dashboard
- Apply/reject AI suggestions interface

**Mock Data:**
- 3-5 scheduling rules
- Optimization history showing 10-15% efficiency gains
- Technician utilization heatmap

**Routes:**
- GET `/api/scheduling/rules` - List rules
- POST `/api/scheduling/optimize` - Run optimization
- GET `/api/scheduling/optimizations` - History

---

### 2. Parts Auto-Reordering System
**File:** `client/src/pages/PartsAutoReorder.tsx`  
**Features:**
- Reorder rules configuration (reorder point, quantity, supplier)
- Auto-reorder history with status tracking
- Manual trigger option
- Stock level monitoring

**Mock Data:**
- 10-15 reorder rules for common parts
- Reorder history showing automated purchases

**Routes:**
- GET `/api/auto-reorder/rules` - List rules
- POST `/api/auto-reorder/rules` - Create rule
- GET `/api/auto-reorder/history` - Reorder history

---

### 3. Multi-Location Routing Optimizer
**File:** `client/src/pages/RoutingOptimizer.tsx`  
**Features:**
- Route planning interface (parts transfer, towing, mobile service)
- Map visualization of optimized routes
- Distance and time calculations
- Driver assignment

**Mock Data:**
- 3-5 planned routes
- Optimized stop sequences
- Distance/time metrics

**Routes:**
- GET `/api/routing/routes` - List routes
- POST `/api/routing/optimize` - Optimize route
- PATCH `/api/routing/routes/:id` - Update route

---

### 4. Time Clock & Payroll Integration
**File:** `client/src/pages/TimeClockPayroll.tsx`  
**Features:**
- Clock in/out interface
- Time entry review and approval
- Payroll period management
- Payroll calculation with overtime, commission, deductions
- Export to accounting systems

**Mock Data:**
- Current pay period with 5-10 employees
- Time entries for past 2 weeks
- Calculated payroll totals

**Routes:**
- POST `/api/timeclock/clock-in` - Clock in
- POST `/api/timeclock/clock-out` - Clock out
- GET `/api/payroll/periods` - List periods
- POST `/api/payroll/calculate` - Calculate payroll

---

### 5. Equipment Calibration Tracking
**File:** `client/src/pages/EquipmentCalibration.tsx`  
**Features:**
- Calibration records management
- Due date tracking and reminders
- Certification document uploads
- Calibration status dashboard (valid, due, overdue)

**Mock Data:**
- 10-15 calibration records for tools
- 2-3 overdue calibrations
- Upcoming calibration reminders

**Routes:**
- GET `/api/calibration/records` - List calibrations
- POST `/api/calibration/records` - Add calibration
- GET `/api/calibration/reminders` - Get reminders

---

## Phase 6: Compliance & Quality (4 features)

### 6. Environmental Compliance Tracking
**File:** `client/src/pages/EnvironmentalCompliance.tsx`  
**Features:**
- Hazardous waste tracking
- Disposal records
- Emissions monitoring
- Regulatory compliance reports

**Schema:** `environmental_compliance_records`, `waste_disposal_logs`

---

### 7. ISO 9001 Quality Management
**File:** `client/src/pages/ISOQualityManagement.tsx`  
**Features:**
- Quality control checklists
- Non-conformance tracking
- Corrective action management
- Audit trail

**Schema:** `quality_checklists`, `non_conformances`, `corrective_actions`

---

### 8. Safety Incident Reporting
**File:** `client/src/pages/SafetyIncidents.tsx`  
**Features:**
- Incident reporting form
- Investigation tracking
- Root cause analysis
- OSHA compliance

**Schema:** `safety_incidents`, `incident_investigations`

---

### 9. Insurance Claims Integration
**File:** `client/src/pages/InsuranceClaims.tsx`  
**Features:**
- Claim submission
- Status tracking
- Document management
- Insurer API integration

**Schema:** `insurance_claims`, `claim_documents`

---

## Phase 7: Advanced Hardware (5 features)

### 10. Barcode/QR Scanner Integration
**File:** `client/src/pages/BarcodeScanner.tsx`  
**Features:**
- Part scanning for inventory
- QR code check-in for vehicles
- Real-time inventory updates
- Scan history

**Schema:** `barcode_scans`, `scan_history`

---

### 11. Digital Signage System
**File:** `client/src/pages/DigitalSignage.tsx`  
**Features:**
- Waiting room display management
- Service status updates
- Promotional content
- Screen layout designer

**Schema:** `signage_displays`, `signage_content`

---

### 12. Kiosk Check-In Interface
**File:** `client/src/pages/KioskCheckIn.tsx`  
**Features:**
- Customer self-check-in
- Appointment confirmation
- Service request submission
- Digital signature capture

**Schema:** `kiosk_sessions`, `kiosk_checkins`

---

### 13. Security Camera Integration
**File:** `client/src/pages/SecurityCameras.tsx`  
**Features:**
- Camera feed management
- Vehicle association
- Incident review
- Recording retention

**Schema:** `security_cameras`, `camera_recordings`

---

### 14. License Plate Recognition
**File:** `client/src/pages/LicensePlateRecognition.tsx`  
**Features:**
- Automatic vehicle identification
- Customer matching
- Entry/exit logging
- Integration with check-in

**Schema:** `license_plate_scans`, `vehicle_entry_logs`

---

## Phase 8: Mobile Apps (3 features)

### 15. Technician Mobile App
**Technology:** React Native (iOS/Android)  
**Features:**
- Job card access
- Photo/video capture
- Parts scanning
- Time tracking
- Offline mode

**Documentation File:** `docs/TECHNICIAN_MOBILE_APP.md`

---

### 16. Customer Mobile App  
**Technology:** React Native (iOS/Android)  
**Features:**
- Appointment booking
- Service history
- Real-time tracking
- Payment processing
- Push notifications

**Documentation File:** `docs/CUSTOMER_MOBILE_APP.md`

---

### 17. Manager Dashboard Mobile App
**Technology:** React Native (iOS/Android)  
**Features:**
- Real-time KPIs
- Approval workflows
- Team management
- Financial reports
- Analytics

**Documentation File:** `docs/MANAGER_MOBILE_APP.md`

---

## Navigation Structure

New sidebar groups to add:

```typescript
{
  group: "⚙️ Operations & Efficiency",
  items: [
    { path: "/ai-scheduling", icon: Calendar, label: "AI Scheduling" },
    { path: "/parts-auto-reorder", icon: RefreshCw, label: "Auto Reordering" },
    { path: "/routing-optimizer", icon: MapPin, label: "Route Optimizer" },
    { path: "/timeclock-payroll", icon: Clock, label: "Time & Payroll" },
    { path: "/equipment-calibration", icon: Tool, label: "Calibration" },
  ],
},
{
  group: "📋 Compliance & Quality",
  items: [
    { path: "/environmental-compliance", icon: Leaf, label: "Environmental" },
    { path: "/iso-quality", icon: Award, label: "ISO 9001 QMS" },
    { path: "/safety-incidents", icon: AlertTriangle, label: "Safety Incidents" },
    { path: "/insurance-claims", icon: Shield, label: "Insurance Claims" },
  ],
},
{
  group: "🔧 Hardware Integration",
  items: [
    { path: "/barcode-scanner", icon: Scan, label: "Barcode Scanner" },
    { path: "/digital-signage", icon: Monitor, label: "Digital Signage" },
    { path: "/kiosk-checkin", icon: TabletSmartphone, label: "Kiosk Check-In" },
    { path: "/security-cameras", icon: Camera, label: "Security Cameras" },
    { path: "/license-plate", icon: Car, label: "Plate Recognition" },
  ],
},
```

---

## Implementation Priority

**High Priority (Build first):**
1. Time Clock & Payroll - Core business need
2. Equipment Calibration - Compliance requirement
3. Safety Incident Reporting - Legal requirement
4. Barcode Scanner - Operational efficiency

**Medium Priority:**
5. AI Scheduling
6. Parts Auto-Reordering  
7. Environmental Compliance
8. ISO Quality Management

**Lower Priority (Document only):**
9-17. All others + Mobile apps

---

## Next Steps

1. ✅ Phase 5 schemas added to `shared/schema.ts`
2. ⏳ Add Phase 6-7 schemas
3. ⏳ Build high-priority UIs (4 features)
4. ⏳ Add routing and backend routes
5. ⏳ Architect review
6. ⏳ Update replit.md

**Estimated tokens for full implementation:** ~40-50k remaining work
