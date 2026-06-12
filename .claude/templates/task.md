# TASK-NNN — <short title>

- **Spec**: <NNN-feature-name>
- **Satisfies**: REQ-00X, REQ-00Y
- **Depends on**: TASK-00Z (or none)
- **Layer**: schema | storage | api | client | test | cleanup

## Goal
One or two sentences: what this task delivers.

## Files to touch
- `shared/schema.ts` — …
- `server/storage.ts` — …
- `server/routes/<domain>.routes.ts` (+ mount in `routes/index.ts`) — …
- `client/src/...` — …
- `server/routes/__tests__/<domain>.test.ts` — …

## Implementation notes
Conventions that apply (RBAC role, Zod `insert*` schema, tenant scoping,
`@shared/*` compliance helper, TanStack Query, i18next en+ar, `data-testid`).

## Acceptance criteria
- [ ] …
- [ ] Tests added/extended and passing
- [ ] `npm run check` clean (+ `npm run db:push` noted if schema changed)

## Verification
```bash
npm run check
npm run test:integration   # or test:server / vitest <file>
```
