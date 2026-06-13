---
name: test-driven-development
description: Enforcing the RED-GREEN-REFACTOR loop in SALIS-GMS using Vitest + Supertest. Use when starting any new feature, route, service, or bugfix, or writing any new production code. Write one failing test, watch it fail (paste the failure), write the minimum to pass, then refactor green. Code written before its test must be deleted and rewritten test-first. Skip only for exploratory spikes or when editing existing tests.
---

# Test-Driven Development (SALIS-GMS)

## Iron law

**No production code is written before a failing test that demands it exists.**

If you wrote code first, delete it — do not comment it out, do not stash it.
Then write the test, watch it fail, and rewrite.

## The loop

### 1. RED — write one failing test
- One behavior at a time. Not a suite, one test.
- Run it and **see it fail for the right reason** (assertion, not import error).
- Paste the failing output as proof before moving on.

### 2. GREEN — minimum code to pass
- Write the least code that makes that one test pass.
- Hard-coding to get green is allowed; the next test will force generalization.
- Run the test, see it pass.

### 3. REFACTOR — clean up under green
- Remove duplication, name things well, extract helpers.
- Re-run; stay green. Then run the **full suite** (`npm test` or the narrow
  `npm run test:server`) so you didn't break a neighbor.

## How tests work in this repo

- Runner: **Vitest** (`globals: true`, forks pool, single fork). `describe/it/expect`
  are global; no imports needed for them.
- **Server / route tests** boot the real Express app and hit a real Postgres via
  Supertest. Pattern (mirror existing tests in `server/__tests__/`):

  ```ts
  import { describe, it, expect, beforeAll } from 'vitest';
  import type { Express } from 'express';
  import type supertest from 'supertest';
  import { createTestApp } from './setup';
  import { loginAsAdmin } from './helpers';

  let app: Express;
  let agent: supertest.Agent;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    ({ agent } = await loginAsAdmin(app));
  });

  describe('Widgets', () => {
    it('POST /api/widgets creates one', async () => {
      const res = await agent.post('/api/widgets').send({ name: 'x' });
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
    });
  });
  ```

- **Shared / domain tests** (`shared/*.test.ts`) are pure, need no DB — fastest
  feedback. Put logic in `shared/` and test it there when you can.
- **Client tests** run under jsdom with `@testing-library/react`.

## Running the failing test fast

- Single file: `npx vitest run server/__tests__/widgets.test.ts`
- Shared only (no DB needed): `npx vitest run shared/`
- Make sure `TEST_DATABASE_URL` points at a Postgres 16 and schema is pushed
  (`npx drizzle-kit push --force`) for server tests.

## What "done" requires

- [ ] The new behavior has a test that failed before the code existed.
- [ ] That test passes now.
- [ ] Full relevant suite is green.
- [ ] `npm run check` is clean (no new type errors).

## Red flags (you are rationalizing)

- "I'll add the test after" → No. Test first.
- "It's too simple to test" → Then the test is trivial to write. Write it.
- "The test needs the code to exist first" → Write the test against the intended
  API; let it fail on the missing export. That failure IS the RED step.
- "I'll just verify manually in the browser" → Manual checks don't prevent
  regressions. Encode it as a test.
