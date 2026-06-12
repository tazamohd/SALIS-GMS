# SALIS-GMS - Project Overview

**Date:** 2026-06-12
**Type:** Web Application (full-stack)
**Architecture:** Client–server monorepo (SPA + REST API + shared schema)

## Executive Summary

SALIS-GMS ("SALIS AUTO") is an automotive ERP / **Garage Management System** — an operational backbone for single-location and multi-tenant franchise garage networks. It covers the full garage workflow: customers and vehicles, appointments and job cards, technician assignment and tracking, parts/inventory, invoicing and payments, reporting, and a customer/technician portal. It is built for the Saudi market with first-class compliance (ZATCA Phase-2 e-invoicing, 15% VAT, Zakat, Hijri calendar, TRN) and ships with a 7-language UI (English, Arabic/RTL, French, Spanish, German, Chinese, Hindi).

The system is a multi-tenant platform: a **garage** (organization) owns **branches** (locations) and **users** with role-based access. Optional integrations (Stripe/PayPal, Twilio, OpenAI, Google APIs) are feature-flagged and env-gated.

## Project Classification

- **Repository Type:** Single-repo monorepo (directory separation: `client/`, `server/`, `shared/`)
- **Project Type(s):** Web (frontend + backend + shared)
- **Primary Language(s):** TypeScript (5.6.3), SQL (migrations)
- **Architecture Pattern:** SPA frontend + REST/WebSocket backend; the Express server also serves the built SPA. Backend routing is a hybrid of modular domain routers and a legacy monolithic router.

## Technology Stack Summary

| Area | Technology | Version |
|------|-----------|---------|
| Language | TypeScript | 5.6.3 (strict) |
| Runtime | Node.js | 20 |
| Frontend | React | 18.3.1 |
| Client routing | wouter | 3.3.5 |
| Server state | TanStack React Query | 5.60.5 |
| UI / styling | shadcn/ui (Radix) + Tailwind CSS | 3.4.17 |
| Forms / validation | react-hook-form + Zod | 7.55.0 / 3.24.2 |
| i18n | react-i18next / i18next | 16.1.0 / 25.6.0 |
| Backend | Express.js | 4.21.2 |
| Database | PostgreSQL | 16 |
| ORM | Drizzle ORM / drizzle-kit | 0.39.1 / 0.30.4 |
| Auth | Passport (local) + bcrypt | 0.7.0 / 6.0.0 |
| Sessions | express-session + connect-pg-simple | 1.18.1 / 10.0.0 |
| Realtime | ws (WebSocket) | 8.18.0 |
| Build | Vite (client) + esbuild (server) | 5.4.15 / 0.25.0 |
| Unit tests | Vitest | 4.0.15 |
| E2E tests | Playwright | — |
| Payments (opt) | Stripe / PayPal | 19.1.0 / 1.1.0 |
| SMS (opt) | Twilio | 5.10.3 |
| AI (opt) | OpenAI | 6.3.0 |

## Key Features

- Multi-tenant garage → branch → user model with role-based access (Super Admin, Garage Owner, Manager, Service Advisor, Technician, Parts Manager, Accountant, …).
- Job-card lifecycle: creation, task breakdown, technician assignment, customer-visible tracking events, public tracking token.
- Appointments & scheduling with availability/time-slots and reminders.
- Inventory & parts (spare parts, stock, supplier availability/price lists, purchase orders).
- Financials: invoices, invoice items, payments, refunds, estimates; VAT/ZATCA tax handling.
- Customer and technician portals (dedicated layouts and sub-pages), plus mobile-optimized pages and a PWA service worker.
- Real-time chat & notifications over WebSocket (`/ws/chat`).
- Saudi compliance: ZATCA Phase-2 QR e-invoicing, VAT, Zakat, Hijri dates.
- Optional AI (chatbot, predictive maintenance/diagnostics), payments, SMS/WhatsApp, Google Calendar/Gmail.
- 7-language i18n with RTL support for Arabic.

## Architecture Highlights

- **Single port (5000):** in dev, `tsx` runs `server/index.ts` with Vite middleware (HMR) integrated; in prod, Express serves the built SPA from `dist/public` plus the `/api/*` REST surface.
- **Hybrid backend routing:** newer domain routers (`server/routes/*.routes.ts`) are mounted first, with the legacy `server/routes.ts` monolith (~760 endpoints) as fallback — ~860 endpoints total during an in-progress refactor (see `ROUTES_REFACTORING_SUMMARY.md`).
- **Type-safe data layer:** Drizzle schema in `shared/schema.ts` (~10,961 lines, 400+ tables); Zod insert/select schemas derived from it are shared by client and server validation.
- **Security middleware:** security headers, global rate limiting (200/15m API, 10/15m auth), session-based Passport auth, role/plan guards.
- **Fail-fast config:** `server/config.ts` validates required env (`DATABASE_URL`, `SESSION_SECRET`) at import and exits on missing values.

## Development Overview

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (local container via `docker-compose`, or a Neon serverless `DATABASE_URL`)
- A `.env` file with at least `DATABASE_URL` and `SESSION_SECRET`

### Getting Started

```bash
npm install
cp .env.example .env      # then set DATABASE_URL and SESSION_SECRET
npm run db:push           # apply Drizzle schema
npm run db:seed           # seed sample data + compliance/config tables
npm run dev               # dev server + Vite HMR on http://localhost:5000
```

### Key Commands

- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build` (Vite client → `dist/public`, esbuild server → `dist/index.js`)
- **Start (prod):** `npm start`
- **Type-check:** `npm run check`
- **Test:** `npm run test` (also `test:watch`, `test:server`, `test:integration`, `test:coverage`)
- **DB:** `npm run db:push` / `db:seed` / `db:verify`
- **Format / Lint:** `npm run format` (Prettier) / `npm run lint` (`eslint .`; no root ESLint config file present)

## Repository Structure

```
client/    React 18 SPA (pages, components, hooks, lib, i18n)  — entry: client/src/main.tsx
server/    Express API (modular + legacy routes, services, middleware, ws) — entry: server/index.ts
shared/    Drizzle schema + domain utils (VAT, ZATCA, Hijri, plans) shared by client & server
migrations/ Drizzle SQL migrations
e2e/       Playwright end-to-end specs
public/    PWA manifest + icons
docs/      Project documentation (numbered sections + these generated docs)
```

## Documentation Map

For detailed information, see:

- [index.md](./index.md) — Master documentation index
- [source-tree-analysis.md](./source-tree-analysis.md) — Annotated directory structure
- `../_bmad-output/project-context.md` — Lean AI-agent implementation rules (BMAD project context)

---

_Generated using BMAD Method `document-project` workflow (executed autonomously)._
