---
description: Convert a functional spec in docs/specs/<id>/ into ordered, implementable task files for the SALIS-GMS stack.
argument-hint: "docs/specs/<id>/"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, TodoWrite
model: inherit
---

# /specs:spec-to-tasks — plan the implementation

Read the functional specification at `$ARGUMENTS` (default: most recent folder
under `docs/specs/`) and turn it into concrete, ordered tasks for **this repo's
actual stack** (React 18 + Wouter + TanStack Query + shadcn/Radix client; plain
Express + Drizzle + Passport + Zod server). This is the step where technology
decisions are made — grounded in `CLAUDE.md`.

## Steps
1. **Read** `specification.md` (and `user-request.md` if present).
2. **Design the technical approach**, mapping each `REQ-*` to concrete changes:
   - **Schema**: tables/columns in `shared/schema.ts` (+ `insert*` Zod schemas),
     tenant scoping, indexes. Note if `npm run db:push` is required.
   - **API**: endpoints in `server/routes/<domain>.routes.ts` (never `routes.ts`)
     mounted in `routes/index.ts`; storage methods in `server/storage.ts`; RBAC
     role(s); Zod validation.
   - **Client**: pages/components under `client/src` reusing `components/ui/*`,
     TanStack Query for data, react-hook-form + Zod for forms, i18next strings
     (en+ar), `data-testid`s.
   - **Compliance**: any VAT/ZATCA/Hijri logic must reuse `@shared/*` helpers.
3. **Write a data-model note** to `docs/specs/<id>/data-model.md` (entities,
   relationships, tenant keys) when schema changes are involved.
4. **Emit task files** `docs/specs/<id>/tasks/TASK-001.md … TASK-N.md` using
   `.claude/templates/task.md`. Order them by dependency:
   schema → storage → API (+ tests) → client (+ tests). The last two tasks are
   always: an **e2e/integration test** task and a **cleanup + `npm run check` +
   `npm run lint`** task.
5. **Write an index** `docs/specs/<id>/tasks.md` linking all tasks with a
   requirement→task traceability table.
6. Summarize and point to: `/specs:task-implementation docs/specs/<id>/tasks/TASK-001.md`.

Keep tasks small and independently verifiable. Each task states which files it
touches, its acceptance criteria, and how to verify (`npm run check`,
`npm run test:integration`, etc.).
