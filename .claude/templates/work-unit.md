# Work Unit: <short title>

> One small, independently testable slice of a larger task. Keep it shippable on its
> own and reviewable in one pass.

## Goal

What this unit changes and why (1–3 sentences).

## File scope

Only these paths may change:

- `path/one.ts`
- `path/two.tsx`

## Approach

Bullet the steps. Note reused shared schemas / `shared/*Utils.ts`, the route module,
and any migration.

## Definition of Done

- [ ] `npm run check` clean.
- [ ] Tests added/updated and `npm test` (or scoped run) green — new logic is covered.
- [ ] `npm run lint` clean for touched files.
- [ ] Coverage gate not regressed (`npm run coverage:gate` if covered code changed).
- [ ] Tenant isolation (`garageId`) and RBAC preserved; no secrets; no vendor-locked
      edits.
- [ ] <unit-specific acceptance criterion>

## Test strategy

- Unit: …
- Integration (route/Postgres): …
- Component (jsdom): …

## Risks / notes

Security-sensitive surface? Domain/compliance edge cases? Anything to flag for review.
