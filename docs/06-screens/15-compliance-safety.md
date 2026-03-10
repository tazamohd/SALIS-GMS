# Screen Documentation — Section 15: Compliance & Safety

**Screens:** 182–192  
**Section:** Compliance & Safety  
**Navigation Group:** Compliance & Safety  

---

## Screen 182 — Compliance Management (`/compliance-management`)

### Description
Central compliance dashboard for monitoring all regulatory obligations.

### Compliance Areas Tracked
| Area | Authority | Status |
|------|-----------|--------|
| ZATCA E-Invoicing | ZATCA | Live/Certified |
| VAT Registration | ZATCA | Active |
| Zakat | ZATCA | Annual |
| ISO 9001 | ISO | In Progress |
| Safety Compliance | Ministry of Labor | Active |
| Environmental | Ministry of Environment | Active |

### Compliance Calendar
- Upcoming filing deadlines
- Certificate renewal dates
- Annual inspection dates
- Training certification expiries

---

## Screen 183 — ZATCA Settings (`/zatca-settings`)

### Description
Complete ZATCA e-invoicing configuration.

### Configuration Fields
- Seller name (Arabic + English)
- VAT registration number (15 digits)
- Company registration number (CRN)
- ZATCA certificate (Phase 2)
- Compliance Unit ID
- E-invoice version (Phase 1 or 2)

### Testing Tools
- Generate test invoice
- Submit to ZATCA sandbox
- View acceptance/rejection response
- Troubleshoot errors

---

## Screen 184 — VAT Settings (`/vat-settings`)

### Description
Value Added Tax configuration and reporting.

### Settings
- VAT rate (default 15%)
- VAT number display format
- Exempt categories
- VAT return period (quarterly)
- Filing deadline reminders

### VAT Report Preview
- Total output VAT collected
- Total input VAT paid
- Net VAT payable
- Export in ZATCA-accepted XML format

---

## Screen 185 — Zakat Settings (`/zakat-settings`)

### Description
Islamic charitable contribution calculation and tracking.

### Calculation Method
```
Zakatable Assets:
├── Cash and bank balances
├── Trade receivables
├── Inventory value (cost)
└── Short-term investments

Minus:
├── Accounts payable
└── Short-term liabilities

Net Zakatable Amount × 2.5% = Annual Zakat Due
```

---

## Screen 186 — Safety Incidents (`/safety-incidents`)

### Description
Workshop safety incident recording and reporting.

### Incident Record
- Date, time, location
- Involved personnel
- Incident description
- Injury details (if any)
- Witnesses
- Corrective action taken
- Follow-up required

### Reports
- Monthly incident count
- Near-miss tracking
- Corrective action effectiveness
- Safety trend analysis

---

## Screen 187 — Environmental Compliance (`/environmental-compliance`)

### Description
Environmental regulation compliance tracking for automotive workshops.

### Regulated Items
| Item | Regulation | Disposal Method |
|------|-----------|----------------|
| Used oil | Ministry of Environment | Licensed collector |
| Brake fluid | Hazardous waste | Licensed disposal |
| Battery acid | Environmental law | Specialist disposal |
| Refrigerant (AC) | F-gas regulations | Recovery equipment |
| Contaminated rags | Hazardous waste | Specialist disposal |

### Compliance Records
- Disposal certificates (per batch)
- Licensed disposal contractor details
- Monthly disposal volume tracking
- Annual environmental report

---

## Screen 188 — ISO Quality Management (`/iso-quality`)

### Description
ISO 9001 quality management system documentation and tracking.

### ISO 9001 Requirements Covered
- Document and record control
- Management review processes
- Customer focus indicators
- Process monitoring and measurement
- Non-conformity management
- Corrective and preventive actions

---

## Screen 189 — Equipment Calibration (`/equipment-calibration`)

### Description
Calibration schedule management for workshop measuring equipment.

### Equipment List
| Equipment | Calibration Frequency |
|-----------|---------------------|
| Torque wrenches | Annual |
| Pressure gauges | Annual |
| Wheel alignment machine | 6 months |
| Brake testing equipment | Annual |
| Emission testing equipment | 6 months |
| AC recovery machine | Annual |

---

## Screens 190–192 — Franchise & Multi-Location

### Screen 190 — Franchise Management (`/franchise-management`)
Manage franchise network: member garages, standards, royalties, performance.

### Screen 191 — Globalization Layer (`/globalization`)
Multi-currency, multi-language, and multi-country configuration.

**Supported Configurations:**
- Multiple currency support with live exchange rates
- Country-specific tax rules
- Regional compliance settings
- Language packs management

### Screen 192 — Multi-Location Dashboard (`/multi-location-dashboard`)
Consolidated view of all branches in a single dashboard.

**Cross-Location Visibility:**
- Revenue per location
- Bay utilization comparison
- Staff headcount per branch
- Inventory position across network
- Top performing locations ranking

---

*Screen Documentation 15 — Compliance & Safety*
