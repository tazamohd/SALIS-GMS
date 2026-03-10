# SALIS AUTO — Project Overview

**Document Type:** Project Overview  
**Version:** 14.0.0  
**Date:** March 2026  

---

## Executive Summary

SALIS AUTO is a world-class, enterprise-grade Automotive ERP (Enterprise Resource Planning) platform purpose-built for professional garage and automotive service operations at scale. The platform integrates every workflow a modern automotive business needs — from customer intake and vehicle inspection to AI-powered diagnostics, blockchain service records, and Saudi Arabian compliance (ZATCA, VAT, Zakat).

Built on a modern full-stack JavaScript architecture (React 18 + Express + PostgreSQL), SALIS AUTO serves small independent garages, multi-branch operations, and large franchise networks from a single unified system.

---

## Vision Statement

> "To become the automotive industry's most comprehensive, intelligent, and globally compliant ERP platform — empowering garage operators with the tools of tomorrow, today."

---

## Mission

To eliminate operational inefficiency in the automotive service industry through deep digital transformation — connecting customers, technicians, parts suppliers, and management in one seamless, AI-enhanced platform.

---

## Platform Goals

### Primary Goals
1. **Unify all garage operations** in a single system — from job card creation to final payment
2. **Empower every role** with purpose-built portals and dashboards
3. **Automate repetitive tasks** using AI, ML, and smart automation
4. **Ensure full compliance** with Saudi Arabian regulatory requirements (ZATCA, VAT, Zakat)
5. **Support global scalability** through multi-currency, multi-language (Arabic/English), and franchise management

### Secondary Goals
- Deliver predictive insights via AI/ML for maintenance, parts demand, and fraud detection
- Provide real-time visibility across service bays, technician activity, and inventory
- Build a connected B2B parts supply network for inter-garage parts sharing
- Enable cutting-edge technologies: AR repair guides, VR showrooms, blockchain records, IoT dashboards

---

## Platform Scope

### What SALIS AUTO Covers

| Domain | Coverage |
|--------|----------|
| **Customer Management** | Profiles, feedback, loyalty, reviews, LTV analysis |
| **Vehicle Management** | Registration, inspection, history, health monitoring, fleet |
| **Appointments** | Booking, reminders, AI scheduling, workshop calendar |
| **Job Cards** | Full lifecycle from intake to delivery |
| **Diagnostics** | OBD integration, predictive diagnostics, OEM software |
| **Inventory** | Parts, tools, reordering, marketplace, B2B network |
| **Invoicing & Payments** | Estimates, invoices, Stripe, PayPal, VAT |
| **Accounting** | Full double-entry accounting, 15+ financial reports |
| **HR & Payroll** | Staff, timeclock, payroll, leave, training |
| **Marketing** | Campaigns, email, social, loyalty, referrals |
| **Compliance** | ZATCA, VAT, Zakat, ISO, Safety, Environmental |
| **AI & Automation** | Chatbot, predictive maintenance, smart scheduling |
| **Emerging Tech** | AR, VR, IoT, Blockchain, Digital Twin, Drone |
| **Franchise** | Multi-location, command center, network management |
| **Mobile Apps** | Technician App, Customer App, Manager Dashboard |

---

## Target Users

### Primary Users (Internal Staff)
| Role | Count | Primary Platform |
|------|-------|-----------------|
| System Administrator | 1 per franchise | Admin Portal |
| Garage Owner | 1 per garage | Owner Dashboard |
| General Manager | 1–2 per garage | Manager Portal |
| Service Manager | 1 per branch | Branch Dashboard |
| Service Advisor | 2–5 per branch | Advisor Portal |
| Lead Technician | 1–2 per branch | Technician Portal |
| Technician | 5–20 per branch | Technician App |
| Finance Manager | 1 per garage | Finance Portal |
| Accountant | 1–2 per garage | Accounting Module |
| HR Manager | 1 per garage | HR Module |
| Parts Manager | 1 per branch | Inventory Portal |
| Purchase Agent | 1–3 per garage | Purchase Agent Portal |
| Call Center Agent | 1–5 per garage | Call Center Module |
| Marketing Manager | 1 per garage | Marketing Hub |

### Secondary Users (External)
| User | Platform |
|------|---------|
| Customers | Customer Portal + Mobile App |
| Parts Suppliers | Vendor Portal |
| Network Members | B2B Parts Network |

---

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Routing:** Wouter
- **State Management:** TanStack Query v5
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Calendar:** react-big-calendar + @dnd-kit
- **Forms:** react-hook-form + Zod

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Authentication:** Passport.js (Local Strategy)
- **Session:** express-session
- **Real-Time:** WebSocket (ws)
- **PDF:** jsPDF
- **2FA:** speakeasy + qrcode

### Database
- **DBMS:** PostgreSQL
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit
- **Tables:** 320+

### Infrastructure & Integrations
- **Payments:** Stripe + PayPal
- **AI:** OpenAI GPT-4o (via Replit AI Integrations)
- **SMS:** Twilio
- **Email:** Google Gmail API
- **Calendar:** Google Calendar API
- **Localization:** react-i18next (Arabic + English)
- **Compliance:** ZATCA E-Invoicing API

---

## Development Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Core MVP (Auth, Job Cards, Invoicing) | Complete |
| Phase 2 | Customer & Vehicle Management | Complete |
| Phase 3 | Inventory & Parts | Complete |
| Phase 4 | Technician Portal | Complete |
| Phase 5 | Financial Accounting | Complete |
| Phase 6 | HR & Payroll | Complete |
| Phase 7 | AI & Automation | Complete |
| Phase 8 | Saudi Compliance (ZATCA, VAT, Zakat) | Complete |
| Phase 9 | B2B Parts Network | Complete |
| Phase 10 | Customer Portal & Mobile Apps | Complete |
| Phase 11 | Marketing & CRM | Complete |
| Phase 12 | Emerging Technologies | Complete |
| Phase 13 | Franchise & Multi-Location | Complete |
| Phase 14 | Real-Time Features & Predictive Analytics | Complete |

---

## Platform Statistics

| Metric | Value |
|--------|-------|
| Total Pages/Screens | 235 |
| Modules | 156+ |
| Database Tables | 320+ |
| API Endpoints | 1,000+ |
| Supported Roles | 20 |
| Languages | English + Arabic (RTL) |
| Mobile Apps | 3 |
| Translation Keys | 2,000+ |
| Navigation Groups | 18 |

---

## Key Differentiators

1. **100% Arabic Language Support** — Full RTL layout with 2,000+ translation keys
2. **Saudi Regulatory Compliance** — ZATCA E-Invoicing, VAT, Zakat, TRN validation, Hijri calendar
3. **AI-Native Platform** — AI chatbot, predictive maintenance, smart scheduling, fraud detection
4. **Emerging Technology Ready** — AR repair guides, VR showrooms, IoT dashboards, blockchain records
5. **Enterprise RBAC** — 20 roles with 18 permission actions across 141+ resources
6. **Real-Time Operations** — WebSocket-powered chat, service bay monitoring, live tracking
7. **B2B Parts Network** — Inter-garage parts sharing and quotation system
8. **Complete Mobile Experience** — Dedicated apps for technicians, customers, and managers

---

*SALIS AUTO Project Overview — Version 14.0.0*
