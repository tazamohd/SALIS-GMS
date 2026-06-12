# SALIS-GMS — Technology Stack

## Runtime and Language

| Concern | Choice | Version |
|---------|--------|---------|
| Language | TypeScript | 5.6.3 |
| Runtime (server) | Node.js | 20 (LTS, alpine in Docker) |
| Module system | ESM (`"type": "module"`) | — |

## Frontend

| Concern | Library / Tool | Version |
|---------|----------------|---------|
| UI framework | React | ^18.3.1 |
| Build tool | Vite | ^5.4.15 |
| Client-side routing | wouter | ^3.3.5 |
| Server state | TanStack Query (React Query) | ^5.60.5 |
| Forms | react-hook-form + @hookform/resolvers | ^7.55.0 |
| Schema validation | Zod | ^3.24.2 |
| UI components | shadcn/ui (Radix UI primitives) | various |
| Styling | Tailwind CSS v3 | ^3.4.17 |
| Animation | framer-motion | ^11.13.1 |
| Charts | recharts | ^2.15.2 |
| Calendar | react-big-calendar | ^1.19.4 |
| Drag-and-drop | @dnd-kit/core | ^6.3.1 |
| i18n | react-i18next + i18next | ^16.1.0 / ^25.6.0 |
| PDF generation | jspdf + jspdf-autotable | ^3.0.3 / ^5.0.2 |
| QR codes | qrcode | ^1.5.4 |
| PWA | Service worker via registerSW | — |

The Vite build produces manual chunks: `vendor-react`, `vendor-ui`, `vendor-charts`, `vendor-forms`, `vendor-query`. Output lands in `dist/public/`.

## Backend

| Concern | Library / Tool | Version |
|---------|----------------|---------|
| HTTP server | Express | ^4.21.2 |
| Session authentication | Passport.js + passport-local | ^0.7.0 / ^1.0.0 |
| Session store | connect-pg-simple (PostgreSQL) | ^10.0.0 |
| Password hashing | bcrypt | ^6.0.0 |
| 2FA | speakeasy | ^2.0.0 |
| Rate limiting | express-rate-limit | ^8.2.1 |
| Real-time | ws (WebSocket) | ^8.18.0 |
| OpenID / OAuth | openid-client | ^6.6.3 |
| Process runner | tsx (dev) / esbuild (prod build) | — |

Server entry is `server/index.ts`; production bundle is emitted by esbuild to `dist/index.js`.

## Database

| Concern | Choice | Version |
|---------|--------|---------|
| Database | PostgreSQL (Neon serverless) | — |
| ORM | Drizzle ORM | ^0.39.1 |
| Neon driver | @neondatabase/serverless | ^0.10.4 |
| Schema → Zod | drizzle-zod | ^0.7.0 |
| Migrations CLI | drizzle-kit | ^0.30.4 |

Schema is defined in `shared/schema.ts`. The project uses `drizzle-kit push` for schema deployment; 3 SQL migrations exist in `migrations/`. No migration runner is used in production — schema is pushed directly.

## External Integrations

| Integration | Library | Purpose |
|-------------|---------|---------|
| Stripe | stripe ^19.1.0 | Payment processing |
| PayPal | @paypal/paypal-server-sdk ^1.1.0 | Payment processing |
| Twilio | twilio ^5.10.3 | SMS campaigns, notifications |
| OpenAI | openai ^6.3.0 | AI chatbot, predictive features |
| Google APIs | googleapis ^163.0.0 | Calendar sync, Gmail |
| NHTSA | HTTP fetch | VIN decode, recall data |

## Testing

| Tool | Scope | Config file |
|------|-------|-------------|
| Vitest | Unit and integration tests | `vitest.config.ts` |
| @testing-library/react | React component tests | — |
| supertest | HTTP integration tests | — |
| Playwright | End-to-end tests | `playwright.config.ts` |

Test locations: `server/__tests__/`, `server/routes/__tests__/`, `client/src/test/`, `e2e/` (2 Playwright specs). Coverage reporting via Vitest v8 provider.

NPM scripts:
- `npm run test` — all Vitest tests
- `npm run test:server` — server unit tests only
- `npm run test:integration` — route integration tests
- `npm run test:coverage` — with coverage report
- `npx playwright test` — e2e suite

## Build and Development

```
npm run dev     # tsx server/index.ts with NODE_ENV=development + Vite HMR
npm run build   # vite build (client) + esbuild (server) → dist/
npm run start   # node dist/index.js (production)
npm run check   # tsc type check
npm run db:push # drizzle-kit push (schema to DB)
```

## Deployment Targets

**Docker** (`Dockerfile`): Multi-stage build; `node:20-alpine` builder and runner. Exposes port 5000.

**docker-compose.yml**: Application container + PostgreSQL container for local development.

**Railway** (`railway.json`): NIXPACKS builder. Start command: `npm run build && node dist/index.js`. Health check at `/api/health`. Restart policy on failure.

**Render** (`render.yaml`): Node runtime. Build: `npm ci && npm run build`. Start: `node dist/index.js`. Managed PostgreSQL database `slis-gms-db` with `DATABASE_URL` injected automatically.

## Dev Environment Requirements

- Node.js 20+
- PostgreSQL (or Neon `DATABASE_URL`)
- Environment variables: `DATABASE_URL`, `SESSION_SECRET`, and keys for Stripe, Twilio, OpenAI, Google APIs
- Port 5000 must be available (server serves both API and Vite-built SPA)
