# Step 1: Business Context & Goals – SaaS Garage System (Middle East)

## 🎯 SaaS Purpose

A SaaS garage system tailored for the Middle East to help garage owners manage:
- Spare parts
- Services
- Appointments
- Technicians
- Purchases
- Job tracking

Includes role-based access, training tracking, and inter-garage collaboration. Supports multiple countries and languages.

---

## 👥 Target Users & Portals

| Portal               | Users                                                | Notes                                                 |
|----------------------|------------------------------------------------------|--------------------------------------------------------|
| Garage Owner Portal  | Owner, Receptionist, Technician Leader, Purchaser, Invoice Manager | Role-based views, branch control                      |
| Technician App       | Mechanical, Electrical, Assistant, Technician Leader | Skill-based step tracking, training records            |
| Customer App         | Vehicle owners                                       | Book, cancel, track, approve jobs/parts               |
| Insurance Portal     | Insurance companies                                  | View jobs, approve/reject repair cases                |
| SaaS Admin Panel     | Platform admins                                      | Manage subscriptions, tenants, abuse, usage insights  |

---

## 🏢 Multi-Branch & Domain Strategy

- Each garage can have multiple **independent branches**
- Branches have separate:
  - Inventory
  - Staff
  - Appointments
- All users log in from a **shared domain**, branch context is selected post-login

---

## 🔐 User Onboarding & Role Assignment

- Garage owners/managers can:
  - Invite users via **email or SMS**
  - Assign **role** and **branch**
  - Control access via root/sub roles
- Invites expire and use secure token authentication

---

## 🧑‍🔧 Technician & Assistant Structure

- Roles:
  - Technician (Mechanical / Electrical)
  - Assistant Technician
  - Technician Leader
- Features:
  - **Skill-based filtering** for service assignment
  - **Step-based service execution** (e.g., Dismantle, Test, Assemble)
  - Assistants are assigned to specific steps only
  - Each technician logs:
    - Step completion %
    - Time spent
    - Tools used
    - Parts consumed
  - Leader confirms work and evaluation

---

## 🎓 Technician Training Tracker

- Tracks assistant contribution per step & service
- Evaluates progress over time:
  - "Apprentice" → "Intermediate" → "Certified"
- Auto-recommends promotions based on:
  - Step completion frequency
  - Accuracy
  - Peer/leader approval

---

## 🔩 Spare Parts, Tools, and Job Cards

- Each service may require:
  - **Parts** (provided by garage or customer)
  - **Tools** (tracked and logged)
- Cost tracking includes:
  - Internal vs. customer-supplied part handling
  - Budget estimate vs. actual usage
- All job cards store historical logs of work

---

## 🔄 Inter-Garage Collaboration

- Garages can:
  - View available **parts/tools** in nearby garages
  - **Order/request** parts or tools from others
  - **Outsource services** like calibration
- Only visible to **approved partners**
- Managed by garage owner or admin

---

## 🌍 Localization & Regional Support

- Languages:
  - Arabic (RTL)
  - English (LTR)
- Currencies:
  - AED, SAR, KWD, BHD, QAR, EGP, etc.
- Timezone & date localization per country

---

## 📱 Platform Channels

- Web dashboard (responsive)
- Native mobile apps:
  - Technicians
  - Customers

---

## 💳 SaaS Business Model

- **Subscription-based plans**:
  - Free
  - Pro
  - Enterprise
- Future support for:
  - Usage-based billing
  - Add-on modules (e.g., Insurance API, Inventory Sync)

---
