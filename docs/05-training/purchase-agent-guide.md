# SALIS AUTO — Purchase Agent Guide

**Document Type:** Training Manual  
**Audience:** Purchase Agents, Parts Managers  
**Level:** Standard  
**Version:** 14.0.0  

---

## Introduction

As a Purchase Agent at SALIS AUTO, you are responsible for ensuring the garage has the right parts at the right time at the best prices. Your dedicated portal provides all the tools you need to manage procurement efficiently.

**Login:** agent@salisauto.com (demo) or your assigned credentials  
**Start Page:** `/purchase-agent`

---

## Chapter 1: Purchase Agent Dashboard (`/purchase-agent`)

Your dashboard provides a real-time overview of:
- **Pending Tasks** — quotation requests awaiting action
- **Active Purchase Orders** — orders in flight
- **Low Stock Alerts** — parts needing immediate ordering
- **Pending Deliveries** — expected arrivals
- **Budget Utilization** — spending vs. budget this month

---

## Chapter 2: Managing Tasks (`/purchase-agent/tasks`)

### 2.1 Task Inbox
Your task inbox shows all outstanding actions:
- Parts requests from technicians
- Quotation approvals pending
- Purchase orders to place
- Deliveries to confirm

### 2.2 Processing a Parts Request
1. Review the request: part name, quantity, urgency, job card reference
2. Check current inventory at branch
3. If in stock → assign from existing inventory, close the task
4. If not in stock → move to quotation process

### 2.3 Task Priority Levels
| Priority | SLA | Action Required |
|----------|-----|----------------|
| Critical | 2 hours | Urgent job waiting for part |
| High | Same day | Job scheduled within 24 hours |
| Normal | 48 hours | Planned maintenance |
| Low | 1 week | Stock replenishment |

---

## Chapter 3: Quotation Management (`/purchase-agent/quotations`)

### 3.1 Requesting Quotations from Suppliers
1. Go to **Quotations** in your portal
2. Click **New Quotation Request**
3. Select suppliers to invite (from your approved supplier list)
4. Specify part details: SKU, name, quantity, required date
5. Set quotation deadline
6. Click **Send Request**
7. Suppliers receive notification and submit their prices

### 3.2 Evaluating Quotations
When supplier responses arrive:
1. View side-by-side price comparison
2. Consider: unit price, delivery time, supplier rating, warranty terms
3. Price Comparison tool (`/purchase-agent/price-compare`) auto-ranks by value score
4. Select preferred quotation
5. Click **Convert to Purchase Order**

### 3.3 B2B Parts Network Quotations
For urgent requests, use the network:
1. Go to **Parts Network → Send Request** (`/parts-network/send-request`)
2. Broadcast request to all network members
3. Receive competitive quotations within minutes
4. Select best offer and confirm

---

## Chapter 4: Purchase Orders (`/purchase-agent/orders`)

### 4.1 Creating a Purchase Order
1. Go to **Orders** in your portal
2. Click **New Purchase Order**
3. Select supplier from approved list
4. Add line items (parts, quantities, prices)
5. Set expected delivery date
6. Add delivery address (branch)
7. Click **Submit Order**
8. Order is sent to supplier automatically

### 4.2 Purchase Order Statuses
| Status | Meaning |
|--------|---------|
| Draft | Being prepared, not sent |
| Submitted | Sent to supplier |
| Confirmed | Supplier acknowledged |
| Partially Received | Some items received |
| Complete | All items received |
| Cancelled | Order cancelled |

### 4.3 Following Up on Orders
1. Go to **Tracking** (`/purchase-agent/tracking`)
2. View all active orders on a timeline
3. See expected delivery dates
4. Flag overdue orders for follow-up

---

## Chapter 5: Supplier Management (`/purchase-agent/suppliers`)

### 5.1 Approved Supplier List
Your approved supplier list shows:
- Supplier name and contact
- Product categories they supply
- Payment terms
- Average delivery time
- Performance rating

### 5.2 Evaluating Supplier Performance
Monthly review metrics:
- **On-time delivery rate** — % of orders delivered on scheduled date
- **Quality rate** — % of parts accepted without returns
- **Price competitiveness** — price index vs. market
- **Response time** — average quotation response time

### 5.3 Adding a New Supplier
1. Click **Add Supplier**
2. Fill in company details, contact, payment terms
3. Submit for approval to your manager
4. Approved suppliers appear in your approved list

---

## Chapter 6: Inventory Management (`/purchase-agent/inventory`)

### 6.1 Monitoring Stock Levels
View inventory across all branches:
- Current quantity per part per branch
- Minimum threshold levels
- Estimated days until stockout (based on usage rate)
- Parts currently on order

### 6.2 Reviewing Auto-Reorder Suggestions
1. Go to **Inventory → Parts Auto-Reorder**
2. Review system-generated reorder suggestions
3. Approve or modify quantities
4. Convert to purchase orders with one click

### 6.3 Demand Forecasting
The AI system predicts future demand:
1. Go to **Automated Reordering** (`/automated-reordering`)
2. View demand forecasts per part per month
3. Forecast accounts for: historical usage, seasonal patterns, scheduled jobs
4. Adjust order quantities based on forecasts

---

## Chapter 7: Delivery Tracking (`/purchase-agent/delivery`)

### 7.1 Monitoring Incoming Deliveries
1. Go to **Delivery** in your portal
2. See all expected deliveries with tracking information
3. Filter by: today's deliveries, this week, overdue

### 7.2 Receiving a Delivery
When goods arrive at the branch:
1. Open the delivery record
2. Count and verify received items against the purchase order
3. Check for damage
4. Click **Receive Delivery**
5. Enter actual quantities received
6. System automatically updates inventory levels
7. If discrepancy: flag for follow-up with supplier

---

## Chapter 8: Reporting (`/purchase-agent/reports`)

### 8.1 Available Reports
| Report | Frequency | Purpose |
|--------|-----------|---------|
| Spending by Category | Monthly | Budget tracking |
| Supplier Performance | Monthly | Vendor review |
| Inventory Turnover | Weekly | Efficiency |
| Purchase Order Cycle Time | Monthly | Process improvement |
| Price Variance | Monthly | Cost control |

### 8.2 Budget vs. Actual Spending
1. Go to **Reports → Spending Report**
2. View current period spending vs. budget
3. Break down by: supplier, category, branch
4. Export for management review

---

## Chapter 9: Smart Price Optimization

### 9.1 Dynamic Pricing Tool (`/dynamic-pricing`)
View real-time market pricing for common parts:
- Compare your purchase price vs. market rates
- Identify opportunities to reduce procurement costs
- Track price trends over time

### 9.2 Intelligent Price Optimizer (`/intelligent-price-optimizer`)
AI-powered tool that:
- Analyzes your purchase history
- Recommends optimal reorder timing
- Identifies bulk purchase opportunities
- Suggests alternative suppliers with better pricing

---

## Quick Reference

| Task | Location |
|------|---------|
| View task inbox | /purchase-agent/tasks |
| Get quotations | /purchase-agent/quotations |
| Create purchase order | /purchase-agent/orders |
| Track deliveries | /purchase-agent/delivery |
| Monitor inventory | /purchase-agent/inventory |
| Compare prices | /purchase-agent/price-compare |
| View reports | /purchase-agent/reports |
| Network quotations | /parts-network/send-request |

---

*SALIS AUTO Purchase Agent Guide — Version 14.0.0*
