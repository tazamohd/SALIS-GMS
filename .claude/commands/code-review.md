---
description: Review the current diff for SALIS-GMS (React 18 + Express + Drizzle) — correctness, conventions, security, tests.
argument-hint: "[optional: path or 'staged' | 'branch']"
allowed-tools: Read, Grep, Glob, Bash
model: inherit
---

# SALIS-GMS Code Review

Review the code changes in scope and report findings grouped by severity. This
project is React 18 + Wouter + TanStack Query + shadcn/Radix on the client and
plain Express + Drizzle + Passport + Zod on the server. Apply the conventions in
the root `CLAUDE.md`.

## 1. Determine scope
- If `$ARGUMENTS` names a path, review that path.
- If `$ARGUMENTS` is `staged`, review `git diff --cached`.
- Otherwise review the branch diff vs the default branch:
  `git diff main...HEAD` (fall back to `git diff HEAD~1`).

Run the relevant `git diff` and read the changed files in full before judging.

## 2. Review checklist

### Correctness
- Logic errors, unhandled promise rejections, missing `await`, off-by-one,
  wrong status codes, broken multi-tenant filtering (data must be scoped by
  garage/branch where applicable).

### Project conventions (see CLAUDE.md)
- New API endpoints live in `server/routes/<domain>.routes.ts` and are mounted
  in `server/routes/index.ts` — flag any new endpoints added to the legacy
  `server/routes.ts`.
- Data access goes through `server/storage.ts` (or its domain successor), not
  ad-hoc Drizzle queries in route handlers.
- Imports use `@/*` and `@shared/*` aliases, not deep relative cross-boundary
  paths.
- Client: reuses `components/ui/*` primitives; TanStack Query for server state;
  react-hook-form + Zod for forms; Wouter for routing; user strings via i18next
  with en+ar kept in sync; `data-testid` preserved.

### Validation & types
- Request bodies validated with Zod (prefer `insert*` schemas from
  `@shared/schema`). Flag new `any`/`@ts-nocheck` (outside the known
  `storage.ts`). Code must satisfy `npm run check`.

### Security
- AuthN/AuthZ on every new endpoint (session + RBAC middleware, correct role).
- No secrets/PII in logs; parameterized queries (Drizzle) only; input
  sanitized; rate limiting where appropriate.

### Saudi compliance
- VAT/ZATCA/Hijri logic must use `@shared/vatUtils|zatcaUtils|hijriUtils` — flag
  any recomputation or hardcoded 15%/QR logic.

### Tests
- New server logic has a test in `server/routes/__tests__` using
  `createTestApp()` + `loginAsAdmin()`. Flag untested new endpoints.

## 3. Report
Group findings as **Blocking / Should-fix / Nit**, each with `file:line`, the
problem, and a concrete fix. End with whether `npm run check` and the relevant
`npm run test:*` are expected to pass. Do not modify files unless asked.
