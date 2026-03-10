# Screen Documentation — Section 09: Inventory & Parts

**Screens:** 054–089  
**Section:** Parts & Inventory  
**Navigation Group:** Parts & Inventory  

---

## Overview

The Inventory & Parts section is one of the most comprehensive in SALIS AUTO, covering everything from individual part management to AI-powered demand forecasting, the B2B parts network, and the complete Purchase Agent workflow. Proper inventory management is critical to garage profitability.

---

## Screen 054 — Inventory Management (`/inventory-management`)

### Description
Master inventory control interface showing stock levels across all branches.

### Key Elements
- **Parts Table** — SKU, name, category, quantity, min/max, value
- **Stock Status Indicators** — In Stock / Low Stock / Out of Stock / Overstock
- **Branch Filter** — View inventory per branch or combined
- **Value Display** — Total inventory value (cost and retail)
- **Quick Adjust** — Add or deduct stock with reason
- **Audit Trail** — Every adjustment logged with user and reason

### Inventory Status Thresholds
| Status | Condition | Action |
|--------|-----------|--------|
| In Stock | Qty > Min | No action needed |
| Low Stock | Qty ≤ Min | Reorder suggested |
| Out of Stock | Qty = 0 | Urgent reorder |
| Overstock | Qty > Max | No new orders |

### User Scenarios

**Scenario 1: Morning Inventory Check**
> Parts Manager opens Inventory, filters by "Low Stock." Sees 8 parts below minimum. Selects all 8, clicks "Create Purchase Order," reviews suggested quantities, sends to Purchase Agent.

**Scenario 2: Stock Adjustment After Delivery**
> New delivery of 50 oil filters received. Parts Manager finds the part, clicks "Adjust Stock," enters +50, reason "Delivery PO-2024-112." Inventory updated, audit trail logged.

---

## Screen 055 — Parts Availability (`/parts-availability`)

### Description
Quick lookup tool for checking part availability across branches and the B2B network.

### Features
- **Multi-branch View** — Stock level per branch in one table
- **Transfer Option** — Transfer from branch with stock to branch without
- **Network Check** — Check if network members have the part
- **Lead Time Estimate** — How quickly can we get the part if ordering?

---

## Screen 056 — Parts Auto-Reorder (`/parts-auto-reorder`)

### Description
Rule-based automatic reorder configuration for maintaining optimal stock levels.

### Reorder Rule Configuration
| Field | Description |
|-------|-------------|
| Part | Which spare part |
| Branch | Which location |
| Min Quantity | Trigger threshold |
| Reorder Quantity | How much to order |
| Preferred Supplier | Default vendor |
| Auto-Order | Automatic PO or manual approval required |

### Process Flow
```
Stock Check (hourly) → Stock Below Min → 
  Auto-Order Enabled? 
    YES → Create PO automatically → Send to supplier
    NO → Alert sent to Parts Manager → Manual approval
```

---

## Screen 057 — Smart Parts Recommender (`/smart-parts-recommender`)

### Description
AI-powered system that recommends additional parts to be sold/installed during a service visit.

### Recommendation Logic
```
Job Context:
├── Vehicle: 2019 Toyota Camry, 85,000 km
├── Current service: Oil Change

AI Analysis:
├── At 85,000 km, air filter likely needs replacement (check → confirm)
├── Spark plugs due at this mileage (check → confirm)
├── Wiper blades (vehicle history shows never replaced)

Recommendations Displayed:
├── Air Filter — "Recommend checking" [High confidence]
├── Spark Plugs — "Due for replacement" [High confidence]
├── Wiper Blades — "Consider checking" [Medium confidence]
```

---

## Screen 058 — Smart Parts Recommendations (`/smart-parts-recommendations`)

### Description
Alternative view of the smart recommendations engine with more detailed analytics.

---

## Screen 059 — Smart Inventory Forecasting (`/smart-inventory-forecasting`)

### Description
AI-powered demand forecasting that predicts future parts requirements.

### Forecast Methodology
1. **Historical Analysis** — Past usage patterns per part
2. **Seasonal Adjustment** — Summer AC parts spike, winter battery demand
3. **Booked Job Analysis** — Known upcoming jobs that will need specific parts
4. **Trend Extrapolation** — Growing or declining demand trends

### Forecast Outputs
- 30-day demand forecast per part
- 90-day forecast (planning horizon)
- Recommended stock levels
- Budget estimate for planned purchases

---

## Screen 060 — Automated Reordering (`/automated-reordering`)

### Description
Phase 14 feature: Fully automated inventory management with AI-driven reorder decisions.

### Key Features
- **Demand Signal Integration** — Combines multiple data sources
- **Dynamic Reorder Points** — Adjusts min thresholds based on demand trends
- **Lead Time Learning** — Tracks actual supplier lead times and adjusts
- **Budget Constraints** — Respects monthly procurement budget limits
- **Approval Workflows** — High-value orders require manager approval

---

## Screen 061 — Spare Parts (`/spare-parts`)

### Description
Complete spare parts catalog management.

### Parts Record Fields
| Field | Description |
|-------|-------------|
| SKU | Unique stock code |
| Name | Part description |
| Category | Engine / Brakes / Electrical / Body / etc. |
| Brand | OEM or aftermarket brand |
| Unit Cost | Purchase price |
| Selling Price | Retail price |
| Markup % | Auto-calculated margin |
| Compatible Makes | Toyota, BMW, etc. |
| Compatible Models | Specific model names |
| Weight | For shipping calculation |
| Warranty | Supplier warranty period |

---

## Screen 062 — Barcode Scanner (`/barcode-scanner`)

### Description
In-browser barcode scanning tool for inventory operations.

### Functions
- **Part Lookup** — Scan to identify part and view details
- **Add to Job** — Scan part, associate with current job card
- **Inventory Count** — Scan to count physical stock
- **Receive Delivery** — Scan incoming goods against purchase order

### Technical Implementation
Uses device camera (mobile or USB barcode scanner) to read barcodes in real-time.

---

## Screen 063 — Internal Warehouse (`/internal-warehouse`)

### Description
Physical warehouse management with bin locations, movement tracking, and storage optimization.

### Features
- **Bin Location Management** — Aisle, Rack, Bin designation per part
- **Pick Lists** — Generate picking lists for technician parts requests
- **Put-Away Tasks** — Directed put-away for received goods
- **Cycle Count** — Scheduled mini-counts by location
- **Zone Management** — Separate zones for fast/slow moving parts

---

## Screen 064 — Interactive 3D Parts (`/interactive-3d-parts`)

### Description
3D visual parts catalog allowing interactive exploration of vehicle components.

### Features
- **3D Vehicle Model** — Select make/model → exploded view
- **Click Parts** — Click any component to see part number, availability, price
- **Compatibility Check** — Highlight compatible replacement parts
- **Add to Job** — Direct add to current job from 3D view

---

## Screen 065 — Parts Marketplace (`/parts-marketplace`)

### Description
Online marketplace for purchasing parts from multiple suppliers with price comparison.

### Marketplace Features
- Search across all registered suppliers simultaneously
- Compare prices and availability
- Review supplier ratings
- One-click order placement
- Delivery tracking integration

---

## Screen 066 — Dynamic Pricing (`/dynamic-pricing`)

### Description
Market-based pricing tool for competitive parts and labor pricing.

### Pricing Strategy Options
| Strategy | Description |
|----------|-------------|
| Cost-plus | Fixed markup over purchase cost |
| Market-based | Price based on market rates |
| Demand-based | Higher price when demand is high |
| Competitive | Match or beat competitor pricing |

---

## Screen 067 — Intelligent Price Optimizer (`/intelligent-price-optimizer`)

### Description
AI-powered pricing recommendation system that optimizes profit margins while maintaining competitiveness.

---

## Screens 068–089 — Suppliers, Purchasing & B2B Network

### Screen 068 — Suppliers (`/suppliers`)
Master supplier directory with performance metrics.

**Key Columns:** Name, contact, categories, payment terms, rating, response time, on-time delivery %

### Screen 069 — Purchase Orders (`/purchase-orders`)
Complete purchase order lifecycle management.

**PO Status Flow:**
```
Draft → Submitted → Confirmed → Partially Received → Complete
                                      ↓
                                  Cancelled
```

### Screen 070 — Vendor Supplier Portal (`/vendor-supplier-portal`)
Dedicated portal for suppliers to receive POs, submit invoices, and manage their profile.

---

## B2B Parts Network (Screens 071–078)

### Screen 071 — Parts Network Dashboard (`/parts-network`)
Overview of the garage's B2B network activity.

**Metrics Shown:**
- Active requests sent and received
- Network members count
- Today's network transactions
- My quotation success rate

### Screen 072 — Send Request (`/parts-network/send-request`)
**Use Case:** Need a part urgently. Not in stock. Can't wait for normal supplier.

**Process:**
1. Select part (name, SKU, quantity)
2. Specify urgency (immediate/today/this week)
3. Broadcast to: all members / specific members / nearby only
4. Set maximum price willing to pay
5. Click Send — network members notified instantly

### Screen 073 — My Requests (`/parts-network/my-requests`)
View all outgoing requests with their status and received quotations.

### Screen 074 — Incoming Requests (`/parts-network/incoming-requests`)
View and respond to parts requests from other network members.

**Response Process:**
1. Review request: part, quantity, urgency, buyer
2. Check your stock
3. Click "Quote" → Enter price, availability, lead time
4. Send quotation → Buyer notified

### Screen 075 — Network Quotations (`/parts-network/quotations`)
All quotations (sent and received) in one view.

### Screen 076 — Network Members (`/parts-network/members`)
Directory of all B2B network members.

**Member Profile Shows:**
- Garage name, location, specializations
- Network rating (reliability score)
- Parts categories they carry
- Response time average

### Screen 077 — Network Orders (`/parts-network/orders`)
Confirmed orders from the network marketplace.

### Screen 078 — Parts Supply Network (`/parts-supply-network`)
The public-facing landing page for the B2B network with network statistics and join information.

---

## Purchase Agent Portal (Screens 079–089)

### Screen 079 — Purchase Agent Dashboard (`/purchase-agent`)
Role-specific home for purchase agents with their daily task overview.

### Screens 080–089 — Purchase Agent Sub-Pages
| Screen | Path | Purpose |
|--------|------|---------|
| 080 | /purchase-agent/tasks | Task inbox and priorities |
| 081 | /purchase-agent/quotations | Manage supplier quotations |
| 082 | /purchase-agent/payments | Payment tracking and approval |
| 083 | /purchase-agent/delivery | Incoming delivery management |
| 084 | /purchase-agent/orders | Purchase order management |
| 085 | /purchase-agent/suppliers | Approved supplier list |
| 086 | /purchase-agent/inventory | Inventory visibility |
| 087 | /purchase-agent/price-compare | Side-by-side price comparison |
| 088 | /purchase-agent/tracking | Order tracking dashboard |
| 089 | /purchase-agent/reports | Procurement analytics |

---

## Inventory Management Flow Diagram

```
Demand Signal
├── Job Card Created → Parts Required
├── Stock Check → Below Minimum
└── Purchase Agent Request

         ↓

Source Decision
├── Internal Stock → Deduct and allocate
├── B2B Network Request → Quote received → Order
└── Supplier Purchase Order → Approve → Send

         ↓

Procurement
PO Created → Sent to Supplier → Confirmed
         ↓
Delivery → Goods Received → Inventory Updated
         ↓
Part Allocated to Job Card → Technician Uses → Deducted
         ↓
Invoice → Part Cost + Markup billed to customer
```

---

*Screen Documentation 09 — Inventory & Parts*
