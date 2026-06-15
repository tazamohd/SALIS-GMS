# SALIS AUTO — Automotive ERP / Garage Management System

Project memory for Claude Code. This repo is wired to the **ECC** operator layer
(installed globally at `~/.claude`). This file tells Claude *which* ECC agents,
skills, and commands to reach for given SALIS AUTO's stack and risk surface.

## Stack

- **Language:** TypeScript (strict, `noEmit`), ESM (`"type": "module"`)
- **Client:** React + Vite + Tailwind + Radix UI (`client/`)
- **Server:** Express + WebSocket (`server/`)
- **Data:** Drizzle ORM on Neon/Postgres (`shared/schema.ts`, `migrations/`)
- **Payments:** Stripe + PayPal (`server/paypal.ts`, Stripe SDK)
- **Auth:** session auth, RBAC (`server/rbac-*.ts`), 2FA/TOTP (`server/twoFactorAuth.ts`)
- **AI:** OpenAI integration (`server/ai*.ts`)
- **Compliance:** Saudi ZATCA e-invoicing, 15% VAT, Zakat, Hijri (`shared/zatcaUtils.ts`, `shared/vatUtils.ts`, `shared/hijriUtils.ts`)
- **Tests:** Vitest (unit/integration) + Playwright (e2e in `e2e/`)
- **Deploy:** Docker / docker-compose, Railway, Render, Replit

## Commands

| Purpose   | Command                  |
|-----------|--------------------------|
| Dev       | `npm run dev`            |
| Build     | `npm run build`          |
| Typecheck | `npm run check` (`tsc`)  |
| Lint      | `npm run lint`           |
| Format    | `npm run format`         |
| Unit test | `npm test`               |
| Server    | `npm run test:server`    |
| Integration | `npm run test:integration` |
| Coverage  | `npm run test:coverage`  |
| DB push   | `npm run db:push`        |
| DB seed   | `npm run db:seed`        |
| E2E       | `npx playwright test`    |

Always run `npm run check` and `npm test` before declaring a change done.

## ECC: best fit for this project

ECC was detected as a **typescript + react + docker** project with a
Postgres/Express backend handling payments, auth, and regulated tax data. The
highest-value ECC surfaces here:

### Use these agents (via the Agent tool / subagents)

- **`security-reviewer`** — MUST run on any change to auth, RBAC, 2FA, payments
  (`server/paypal.ts`, Stripe), API routes, or anything touching customer PII or
  ZATCA/VAT data. Highest priority given this is a financial + regulated app.
- **`typescript-reviewer`** — all `.ts` changes (type safety, async correctness, Node security).
- **`react-reviewer`** — any `client/**/*.tsx` change (hooks, render perf, a11y).
- **`database-reviewer`** — Drizzle schema edits, new `migrations/`, query changes.
- **`silent-failure-hunter`** — swallowed errors / bad fallbacks, especially in
  payment, webhook, and integration code paths.
- **`tdd-guide`** — new features and bug fixes (tests first).
- **`e2e-runner`** — critical Playwright flows (checkout, invoicing, login/2FA).

### Use these commands / skills

- `/code-review` — review local uncommitted changes before commit.
- `/security-review` — deep security pass for payment/auth/compliance work.
- `/feature-dev` and `/plan` — scoping new modules.
- `/react-test`, `/react-review`, `/react-build` — frontend work.
- `tdd-workflow`, `verification-loop` — enforce test-first + verify loops.
- `database-migrations` — generating/reviewing Drizzle migrations.
- `docker-patterns`, `deployment-patterns` — Dockerfile / Railway / Render changes.

### Recommended workflow

1. `/plan` → restate + risk-assess before touching code on non-trivial work.
2. TDD via `tdd-guide` / `/react-test`: write the failing test first.
3. Implement; keep `tsc` strict-clean.
4. `/code-review`; for payment/auth/compliance/PII changes **also** run
   `security-reviewer`.
5. `npm run check && npm test` (+ relevant e2e) before commit.

## Project rules (travel with the repo)

SALIS-tuned rules live in `.claude/rules/` and extend the global ECC packs:

- `.claude/rules/security.md` — **highest priority**: payments, auth/RBAC/2FA, PII, ZATCA/VAT.
- `.claude/rules/typescript.md` — strict TS + Express boundary validation.
- `.claude/rules/react.md` — client conventions (TanStack Query, Radix, RTL/a11y).
- `.claude/rules/database.md` — Drizzle/Neon schema, migrations, money-as-integer.
- `.claude/rules/testing.md` — Vitest + Playwright, TDD, compliance-math coverage.

## Project-specific guardrails

- **Never** weaken `strict` in `tsconfig.json` to make types pass.
- **Never** log or commit secrets, card data, TRNs, or full customer PII.
  `.env`, `*.key`, `*.pem`, `user_credentials.csv` are gitignored — keep it that way.
- Money is integer minor units / Drizzle numeric — never use floats for currency or VAT.
- RBAC: gate new routes through existing `rbac-middleware.ts`; don't bypass it.
- Schema changes go through Drizzle (`shared/schema.ts` → `npm run db:push` / migration), not raw SQL drift.
- Validate inbound payloads at API boundaries (Zod / drizzle-zod) before trusting them.
