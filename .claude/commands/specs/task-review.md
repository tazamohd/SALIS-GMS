---
description: Review implemented work against its SDD spec and tasks — coverage, conventions, security, tests.
argument-hint: "docs/specs/<id>/"
allowed-tools: Read, Grep, Glob, Bash
model: inherit
---

# /specs:task-review — validate against the spec

Verify that the work for the spec folder in `$ARGUMENTS` satisfies its
requirements and this repo's standards. Read-only — report, don't change code
unless asked.

## Steps
1. **Load** `specification.md` and the `tasks/` files. Build the
   requirement→task checklist.
2. **Trace coverage**: for each `REQ-*`, confirm there is implementing code AND
   a test that exercises it. Flag any requirement with no test or no
   implementation, and any task whose acceptance criteria aren't met.
3. **Convention & security pass** (reuse the `/code-review` and
   `/security-review` checklists): domain routes vs legacy `routes.ts`, storage
   layer usage, Zod validation, RBAC on every endpoint, multi-tenant isolation
   (no IDOR), `@shared/*` for VAT/ZATCA/Hijri, no new `any`/`@ts-nocheck`,
   en+ar i18n parity, `data-testid`s.
4. **Run the gates**: `npm run check`, `npm run lint`, and the relevant
   `npm run test:*`. Report pass/fail with output.
5. **Report**: a requirement-coverage table plus findings grouped
   **Blocking / Should-fix / Nit** (each with `file:line` and a fix), and a clear
   verdict on whether the spec is satisfied.
