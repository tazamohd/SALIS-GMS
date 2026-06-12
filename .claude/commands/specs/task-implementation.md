---
description: Implement one SDD task file test-first, following SALIS-GMS conventions, then verify.
argument-hint: "docs/specs/<id>/tasks/TASK-NNN.md"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, TodoWrite, Task
model: inherit
---

# /specs:task-implementation — build one task (TDD)

Implement the task described in `$ARGUMENTS`. Stay within its stated scope; if
you discover it needs splitting, say so before charging ahead.

## Workflow
1. **Read** the task file and its parent `specification.md` for the acceptance
   criteria. Mark the task in-progress.
2. **Delegate to the right specialist** when it helps:
   - server/API work → `express-api-expert`
   - database/schema → `drizzle-schema-expert`
   - client/UI → `react-frontend-expert`
3. **Test first**: write or extend a failing test that encodes the acceptance
   criteria —
   - server: `server/routes/__tests__/<domain>.test.ts` with `createTestApp()` +
     `loginAsAdmin()`, following the tolerant-status pattern;
   - client: Testing Library + Vitest;
   - cross-cutting: a Playwright spec in `e2e/`.
4. **Implement** the minimum to satisfy the test, honoring `CLAUDE.md`
   conventions (domain routes, storage layer, Zod validation, RBAC, multi-tenant
   scoping, `@shared/*` compliance helpers, i18next, `data-testid`).
5. **Verify**: run `npm run check` and the relevant `npm run test:*`. If schema
   changed, note that `npm run db:push` is needed. Iterate until green.
6. **Record**: tick the acceptance criteria in the task file and report what
   changed (files + test results). Suggest the next task or
   `/specs:task-review docs/specs/<id>/`.

Do not commit unless asked. Keep `routes.ts`/`storage.ts` from growing — add to
domain modules.
