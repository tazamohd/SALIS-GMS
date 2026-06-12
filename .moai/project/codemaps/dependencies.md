# SALIS-GMS — Dependency Graph

## Internal Module Relationships

```
client/src/             shared/              server/
    |                      |                    |
    |<------ imports -------|------ imports ---->|
    |                      |                    |
    |   (never imports)     |     (never imports)|
    |<------- forbidden ----+-----  forbidden -->|
    |                                            |
    |-------- HTTP /api/* ---------------------->|
    |<-------- JSON responses -------------------|
    |                                            |
    |-------- WebSocket (ws://) ---------------->|
    |<-------- typed events ---------------------|
```

Key constraint: `client/` and `server/` share code exclusively through `shared/`. Direct cross-boundary imports are prohibited by the module alias configuration in `vite.config.ts` and `tsconfig.json`.

### Server-Internal Dependency Flow

```
server/routes/index.ts
    |
    +--> server/routes/*.routes.ts   (domain handlers)
    +--> server/routes/*.ts          (feature handlers)
    +--> server/routes.ts            (legacy monolith — last)
    |
    Each route file:
    +--> server/storage.ts           (all DB queries)
    +--> server/middleware/*         (auth, RBAC, validation)
    +--> server/services/*           (business logic)
    +--> shared/schema.ts            (Zod schemas for validation)
    |
    server/storage.ts:
    +--> server/db.ts                (Drizzle ORM client)
    +--> shared/schema.ts            (table definitions)
    |
    server/engine/*:
    +--> server/storage.ts
    +--> server/services/*
    +--> shared/workflows.ts
```

---

## External Packages — Server

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.21.2 | HTTP server framework |
| `passport` + `passport-local` | ^0.7.0 / ^1.0.0 | Session-based authentication |
| `express-session` | ^1.18.1 | Session middleware |
| `connect-pg-simple` | ^10.0.0 | PostgreSQL-backed session store |
| `bcrypt` | ^6.0.0 | Password hashing |
| `speakeasy` | ^2.0.0 | TOTP two-factor authentication |
| `express-rate-limit` | ^8.2.1 | API and auth rate limiting |
| `ws` | ^8.18.0 | WebSocket server |
| `drizzle-orm` | ^0.39.1 | Type-safe ORM with PostgreSQL |
| `@neondatabase/serverless` | ^0.10.4 | Neon serverless PostgreSQL driver |
| `drizzle-zod` | ^0.7.0 | Auto-generate Zod schemas from Drizzle tables |
| `zod` | ^3.24.2 | Runtime schema validation |
| `openai` | ^6.3.0 | OpenAI API client (chatbot, AI features) |
| `stripe` | ^19.1.0 | Stripe payment processing |
| `@paypal/paypal-server-sdk` | ^1.1.0 | PayPal payment processing |
| `twilio` | ^5.10.3 | SMS and WhatsApp messaging |
| `googleapis` | ^163.0.0 | Google Calendar and Gmail APIs |
| `openid-client` | ^6.6.3 | OpenID Connect / OAuth 2.0 |
| `memoizee` | ^0.4.17 | Function memoization for caching |
| `memorystore` | ^1.6.7 | In-memory session store (dev fallback) |
| `qrcode` | ^1.5.4 | QR code generation (ZATCA invoices) |
| `jspdf` + `jspdf-autotable` | ^3.0.3 / ^5.0.2 | PDF report generation |
| `puppeteer` | ^24.31.0 | Headless browser (PDF export, scraping) |
| `date-fns` | ^3.6.0 | Date arithmetic utilities |

## External Packages — Client (Frontend)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` + `react-dom` | ^18.3.1 | UI framework |
| `wouter` | ^3.3.5 | Lightweight client-side routing |
| `@tanstack/react-query` | ^5.60.5 | Server state management and caching |
| `react-hook-form` | ^7.55.0 | Form state management |
| `@hookform/resolvers` | ^3.10.0 | Zod resolver for react-hook-form |
| `zod` | ^3.24.2 | Form and API response schema validation |
| `@radix-ui/react-*` | various | Headless accessible UI primitives |
| `lucide-react` | ^0.453.0 | Icon set |
| `tailwindcss` | ^3.4.17 | Utility-first CSS framework |
| `framer-motion` | ^11.13.1 | Animation library |
| `recharts` | ^2.15.2 | Chart and graph components |
| `react-big-calendar` | ^1.19.4 | Calendar view for appointments |
| `react-day-picker` | ^8.10.1 | Date picker component |
| `@dnd-kit/core` + `@dnd-kit/sortable` | ^6.3.1 / ^10.0.0 | Drag-and-drop |
| `react-i18next` + `i18next` | ^16.1.0 / ^25.6.0 | Internationalization (Arabic/English) |
| `i18next-browser-languagedetector` | ^8.2.0 | Auto-detect browser language |
| `date-fns` | ^3.6.0 | Date formatting and arithmetic |
| `@stripe/react-stripe-js` + `@stripe/stripe-js` | — | Stripe payment UI |
| `jspdf` + `jspdf-autotable` | — | Client-side PDF generation |
| `@zxing/library` | ^0.21.3 | Barcode scanning (camera) |
| `cmdk` | ^1.1.1 | Command palette component |
| `embla-carousel-react` | ^8.6.0 | Carousel component |
| `react-resizable-panels` | ^2.1.7 | Split-pane layouts |
| `vaul` | ^1.1.2 | Drawer component |
| `next-themes` | ^0.4.6 | Dark/light theme toggle |

## Build-Time Dependencies

| Package | Purpose |
|---------|---------|
| `vite` ^5.4.15 | Client bundler |
| `esbuild` ^0.25.0 | Server bundler |
| `tsx` ^4.19.1 | TypeScript execution for dev server |
| `drizzle-kit` ^0.30.4 | DB schema push and migration tooling |
| `typescript` 5.6.3 | Type checker |
| `vitest` ^4.0.15 | Test runner |
| `@testing-library/react` ^16.3.0 | React component test utilities |
| `supertest` ^7.2.2 | HTTP integration test client |
| `playwright` | End-to-end browser test runner |
| `autoprefixer` + `postcss` | CSS post-processing |
| `@vitejs/plugin-react` | React fast refresh for Vite |

## External Service Integrations

| Service | Protocol | Auth Method |
|---------|----------|-------------|
| PostgreSQL (Neon) | Neon serverless WebSocket | `DATABASE_URL` env var |
| OpenAI | HTTPS REST | `OPENAI_API_KEY` |
| Stripe | HTTPS REST | `STRIPE_SECRET_KEY` |
| PayPal | HTTPS REST | Client ID + secret |
| Twilio | HTTPS REST | Account SID + auth token |
| Google APIs | OAuth 2.0 | Service account or user OAuth |
| NHTSA | HTTPS REST (public) | No auth required |
| ZATCA | HTTPS REST | Certificate-based (Phase 2) |
