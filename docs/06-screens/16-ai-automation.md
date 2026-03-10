# Screen Documentation — Section 16: AI & Automation

**Screens:** 193–201  
**Section:** AI & Automation Hub  
**Navigation Group:** AI & Automation Hub  

---

## Overview

SALIS AUTO's AI & Automation section represents the platform's most advanced capabilities. Powered by OpenAI GPT-4o and custom ML models, these features transform reactive garage operations into proactive, intelligent service delivery.

---

## Screen 193 — AI Automation (`/ai-automation`)

### Description
The central hub for all AI and automation features in the platform.

### Purpose
Provide a unified entry point for AI-powered features and automation configuration.

### Key Elements
- **AI Feature Cards** — Overview of all active AI modules
- **AI Performance Metrics** — Accuracy scores, usage statistics
- **Enable/Disable Controls** — Toggle AI features per module
- **Training Status** — Data quality indicators for each model

### AI Features Overview
| Feature | Status | Accuracy |
|---------|--------|---------|
| Job Cost Estimation | Active | 94% |
| Predictive Maintenance | Active | 89% |
| Parts Recommendations | Active | 91% |
| Chatbot | Active | — |
| Smart Scheduling | Active | 87% |
| Fraud Detection | Active | 96% |
| Sentiment Analysis | Active | 93% |

---

## Screen 194 — AI Chatbot (`/ai-chatbot`)

### Description
Customer-facing AI chatbot powered by OpenAI GPT-4o.

### Capabilities
- **Service Questions** — "What does an oil change cost?" "How long does a tire rotation take?"
- **Appointment Booking** — Guide through booking process
- **Job Status Queries** — "What's the status of my car?"
- **Technical Questions** — "My car is making a knocking noise, what could it be?"
- **Arabic Support** — Full conversation in Arabic with natural responses

### Technical Implementation
```
User Message
    ↓
POST /api/ai/chat
    ↓
OpenAI GPT-4o (with system prompt for automotive context)
    ↓
Response rendered in chat UI
    ↓
Conversation saved to ai_chat_conversations table
```

### System Prompt Context
The chatbot is provided with:
- Garage name and service offerings
- Current pricing (from invoice data)
- Available appointment slots
- Customer's vehicle history (if logged in)

---

## Screen 195 — AI Chatbot Assistant (`/ai-chatbot-assistant`)

### Description
Staff-facing AI assistant for internal queries and task assistance.

### Capabilities for Staff
- **Job Estimation** — "How long should a BMW 3 Series timing belt take?"
- **Technical Guidance** — "What's the torque spec for a Toyota Camry head bolt?"
- **Parts Lookup** — "What part number is the oil filter for a 2020 Kia Sportage?"
- **Procedure Guidance** — Step-by-step repair guidance
- **Report Generation** — "Summarize this week's revenue"

### Difference from Customer Chatbot
| Feature | Customer Chatbot | Staff Assistant |
|---------|-----------------|-----------------|
| Access | Anyone | Authenticated staff |
| Knowledge | Service & booking | Technical & operational |
| Data Access | Public info | Full garage data |
| Tone | Customer-friendly | Technical, detailed |

---

## Screen 196 — AI Service Advisor (`/ai-service-advisor`)

### Description
AI-powered service advisor that assists staff in creating comprehensive service recommendations.

### Service Advisor Workflow
```
Input:
├── Vehicle details (make, model, year, mileage)
├── Customer complaint description
├── Last service date and what was done
└── OBD fault codes (if available)

AI Output:
├── Ranked list of recommended services
├── Rationale for each recommendation
├── Estimated cost per service
├── Time estimate per service
├── Priority level (safety-critical vs. maintenance vs. cosmetic)
└── Customer communication script
```

### User Scenario
> Service Advisor is with a customer whose 2018 BMW 5 Series has 70,000 km and hasn't been serviced in 18 months. Advisor enters these details in AI Service Advisor. AI returns: "Priority 1: Brake fluid change (safety-critical, moisture absorption), Priority 2: Cabin and engine air filters, Priority 3: Spark plugs (for N20 engine), Priority 4: Transmission service (due at 70k km)." Advisor uses this as talking points with the customer.

---

## Screen 197 — Voice Commands (`/voice-commands`)

### Description
Voice command configuration and management interface.

### Supported Commands
| Command | Action |
|---------|--------|
| "New job card" | Opens job card creation |
| "Find customer [name]" | Searches customer database |
| "Check stock [part name]" | Inventory lookup |
| "Clock in" | Records attendance |
| "Next appointment" | Shows next scheduled appointment |
| "Bay [number] status" | Reports bay status |

---

## Screen 198 — Voice Command Interface (`/voice-command-interface`)

### Description
Active voice command session interface for hands-free operation.

### Use Case
Technicians working in the bay with greasy hands can control SALIS AUTO by voice:
- "Log 5 liters of Castrol 5W-30 to job 347"
- "Job 347 complete"
- "Request front brake pads for job 362"

---

## Screen 199 — Smart Damage Assessment (`/smart-damage-assessment`)

### Description
Computer vision system for automated vehicle damage detection and estimation.

### Process Flow
```
Upload Photos (multi-angle vehicle images)
    ↓
Computer Vision Analysis (trained automotive damage model)
    ↓
Damage Detection:
├── Location on vehicle (panel identification)
├── Damage type (scratch, dent, crack, corrosion)
├── Severity (minor, moderate, major)
└── Affected area size estimate
    ↓
Repair Cost Estimate
├── Labor hours estimate
├── Parts likely needed
├── Total repair cost range
    ↓
Assessment Report (PDF) → Linked to customer record
```

### Use Cases
- **Insurance Claims** — Fast, objective damage documentation
- **Pre-purchase Inspection** — Assess vehicle before buying
- **Fleet Damage Tracking** — Document new damage after each usage
- **QC Verification** — Confirm no new damage after service

---

## Screen 200 — ML Fraud Detection (`/ml-fraud-detection`)

### Description
Machine learning system that analyzes transactions for signs of fraudulent activity.

### What It Detects
| Pattern | Indicator |
|---------|-----------|
| Excessive labor hours vs. job complexity | Labor fraud |
| Parts charged but not logged to inventory | Parts theft |
| Discount patterns (excessive discounts) | Revenue leakage |
| Repeat customers with unusual claims | Insurance fraud |
| After-hours transactions | Unauthorized activity |

### Alert Levels
- **Low Risk** — Logged, no action
- **Medium Risk** — Manager notification
- **High Risk** — Transaction flagged, manager approval required

---

## Screen 201 — Neural Network Prediction (`/neural-network-prediction`)

### Description
Advanced ML prediction engine for business intelligence and operational forecasting.

### Prediction Models
1. **Revenue Forecasting** — Next 30/90 days revenue prediction
2. **Demand Forecasting** — Parts demand per category
3. **Churn Prediction** — Which customers likely to leave
4. **Capacity Planning** — Optimal staffing for predicted demand
5. **Failure Prediction** — Probability of component failure per vehicle model

### Visualization
- Time series charts with confidence intervals
- Feature importance explanations
- Prediction accuracy tracking over time

---

## AI Integration Architecture

```
SALIS AUTO Platform
         │
    AI Hub Layer
         │
    ┌────┴────────────┐
    │                 │
OpenAI GPT-4o       Custom ML Models
    │                 │
    ├── Chatbot       ├── Predictive Maintenance
    ├── Service Advisor├── Fraud Detection
    ├── Voice Commands └── Demand Forecasting
    └── Sentiment Analysis

Data Flow:
Platform Data → ML Processing → Predictions → UI Display
→ Actions (create job, send reminder, flag transaction)
```

---

*Screen Documentation 16 — AI & Automation*
