# Screen Documentation — Section 02: Customer Management

**Screens:** 004–011  
**Section:** Customer Management & CRM  
**Navigation Group:** Customer Intake & Appointments  

---

## Overview

The Customer Management section handles the full customer relationship lifecycle — from initial registration to loyalty tracking and feedback analysis. SALIS AUTO treats customers as long-term relationships, not just one-time transactions.

---

## Screen 004 — Customers List (`/customers`)

### Description
The master customer database with search, filter, and management capabilities.

### Purpose
Central hub for all customer information and interaction history.

### Key Elements
- **Search Bar** — Search by name, phone, email, or ID number
- **Customer Table** — Name, phone, vehicle count, last visit, status
- **Add Customer Button** — Opens customer creation form
- **Filter Options** — By status (active/inactive), nationality, registration date
- **Export Button** — CSV/Excel export of customer list
- **Click Row** → Opens customer profile

### Add Customer Form Fields
| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | Yes |
| Email | Email | Yes |
| Phone | Phone | Yes |
| Nationality | Select | No |
| ID Type | Select | No |
| ID Number | Text | No |
| Preferred Language | Select (EN/AR) | No |
| Notes | Textarea | No |

### User Scenarios

**Scenario 1: New Customer Registration**
> Receptionist receives a new customer. Clicks "Add Customer," fills in name, email, phone. Customer profile is created. Proceeds to add their vehicle.

**Scenario 2: Finding a Returning Customer**
> Service advisor types the customer's phone number in the search bar. Customer record appears with full history — 12 previous visits, 2 vehicles, Gold loyalty tier.

**Scenario 3: Exporting Customer List for Marketing**
> Marketing manager filters customers by "registered this year," exports CSV, uploads to email marketing platform.

### User Flow
```
Customers List
├── Search customer → View profile → Create job card
├── Add new customer → Fill form → Save → Add vehicle
├── Filter & export → Marketing campaign use
└── Click customer → Profile → Vehicle list → Service history
```

---

## Screen 005 — Customer Feedback (`/customer-feedback`)

### Description
Customer satisfaction management hub with AI-powered sentiment analysis.

### Purpose
Collect, analyze, and act on customer feedback to continuously improve service quality.

### Key Elements
- **Feedback Table** — All feedback submissions with star rating, date, sentiment
- **AI Sentiment Badge** — Positive / Neutral / Negative (auto-analyzed by GPT-4o)
- **Average Rating Display** — Rolling 30-day satisfaction score
- **Filter by Rating** — 1–5 stars
- **Filter by Sentiment** — Positive/Neutral/Negative
- **Feedback Detail View** — Full text, customer name, vehicle, job reference
- **Response Button** — Reply to customer feedback
- **Export Analytics** — Sentiment trends over time

### AI Sentiment Analysis
When new feedback is submitted:
1. System sends feedback text to OpenAI GPT-4o-mini
2. AI returns sentiment classification + key topics mentioned
3. Sentiment badge appears on feedback record
4. Managers receive alert for negative feedback

### User Scenarios

**Scenario 1: Morning Feedback Review**
> Service Manager opens Feedback page, sees 3 new reviews from yesterday. Two are positive (5 stars), one is negative (2 stars, AI flagged as "Negative" sentiment). Opens the negative review, sees customer complaint about long wait time, responds with apology and offers 10% discount on next service.

**Scenario 2: Monthly Quality Review**
> Quality Manager exports feedback data, analyzes trend: satisfaction dipped in week 3 (correlated with new technician joining). Schedules additional training.

**Scenario 3: Marketing Testimonials**
> Marketing manager filters 5-star positive reviews, selects the best ones for website testimonials.

### User Flow
```
Customer Feedback
├── View feedback list → Sort by sentiment
├── Open negative feedback → Read full text
│   └── Click Respond → Send customer message
├── AI Analysis → Auto-classify all new submissions
└── Export data → Trend analysis in Excel
```

---

## Screen 006 — Customer Loyalty (`/customer-loyalty`)

### Description
Loyalty program administration for managing tier status, points adjustments, and program configuration.

### Purpose
Retain customers through reward-based incentives and tier benefits.

### Program Tiers
| Tier | Points | Discount | Additional Benefits |
|------|--------|----------|---------------------|
| Bronze | 0–999 | 5% | Birthday points |
| Silver | 1,000–4,999 | 10% | Priority booking |
| Gold | 5,000–9,999 | 15% | Free oil change/year |
| Platinum | 10,000+ | 20% | Dedicated advisor |

### Key Elements
- **Member Leaderboard** — Top loyalty members by points
- **Tier Distribution Chart** — How many customers at each tier
- **Recent Transactions** — Latest points earned/redeemed
- **Manual Points Adjustment** — Admin can add/deduct points
- **Program Settings** — Points per SAR, tier thresholds

### User Scenarios

**Scenario 1: Tier Upgrade Notification**
> System detects customer has crossed 5,000 points threshold. Auto-sends SMS: "Congratulations! You've been upgraded to Gold tier. Enjoy 15% discounts on your next visit."

**Scenario 2: Points Dispute**
> Customer calls claiming they didn't receive points from last visit. CSR opens loyalty page, searches customer, manually adjusts points with a note, customer is satisfied.

---

## Screen 007 — Customer Reviews & Ratings (`/customer-reviews-ratings`)

### Description
Public review management for monitoring and responding to customer ratings across all service types.

### Key Elements
- **Rating Overview** — Average rating with star distribution
- **Review Cards** — Photo, name, rating, text, date
- **Reply Interface** — Respond to reviews publicly
- **Review Filter** — By rating, date, service type
- **Sentiment Trend Chart** — Monthly average rating trend

---

## Screen 008 — Referral Program (`/referral-program`)

### Description
Customer referral management — tracking who referred whom and distributing referral rewards.

### How Referrals Work
```
Customer A → Shares unique link → Customer B registers + completes first service
└── Customer A receives 500 bonus points
└── Customer B receives 10% off first service
```

### Key Elements
- **Referral Code Generator** — Per-customer unique codes
- **Referral Tracking Table** — Referred customer, date, status, reward issued
- **Total Referrals Chart** — Monthly referral volume
- **Top Referrers Leaderboard** — Most active brand advocates

---

## Screen 009 — Customer Portal (`/customer-portal`)

### Description
Landing page for customers to access their self-service portal. Entry point to the full client experience.

### Portal Entry Points
- View my vehicles
- Book an appointment
- Track my vehicle
- View invoices
- Manage loyalty points

---

## Screen 010 — Loyalty Program (`/loyalty-program`)

### Description
Customer-facing loyalty dashboard showing their personal points, tier status, and available rewards.

### Key Elements (Customer View)
- **Current Tier Badge** — Visual tier display with progress to next tier
- **Points Balance** — Current + pending points
- **Points History Timeline** — Earned/redeemed transactions
- **Available Rewards** — Rewards that can be redeemed now
- **Points Simulator** — "How many visits until Gold?"
- **Refer a Friend CTA** — Referral link generator

---

## Screen 011 — Customer LTV Analysis (`/customer-ltv-analysis`)

### Description
Business intelligence tool for calculating and analyzing Customer Lifetime Value.

### Purpose
Identify high-value customers, predict churn, and optimize marketing investment.

### Key Metrics
- **Average LTV** — Mean revenue per customer over their relationship
- **LTV Distribution** — Histogram of customer value spread
- **Top 20% Customers** — The Pareto principle (20% of customers = 80% of revenue)
- **Churn Risk Indicator** — Customers who haven't visited in 90+ days
- **LTV by Acquisition Channel** — Which marketing channel brings the most valuable customers

### User Flow
```
Customer LTV Analysis
├── View LTV overview → Identify top customers
├── Filter at-risk customers → Export list
│   └── Marketing: Send win-back campaign
├── Analyze by channel → Optimize marketing spend
└── Drill down to individual customer → Open profile
```

---

## Section Summary

| Screen | Primary User | Main Action |
|--------|-------------|-------------|
| Customers List | Service Advisor, Receptionist | Find and manage customer records |
| Customer Feedback | Service Manager | Monitor satisfaction and respond |
| Customer Loyalty | Marketing Manager | Manage rewards program |
| Reviews & Ratings | Marketing Manager | Monitor and respond to reviews |
| Referral Program | Marketing Manager | Track referrals and distribute rewards |
| Customer Portal | Customer | Self-service access |
| Loyalty Program | Customer | View points and tier |
| Customer LTV | Owner, Analyst | Strategic customer value analysis |

---

*Screen Documentation 02 — Customer Management*
