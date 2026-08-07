# Coding Standards & Contribution Guide

How to add or change backend code under the Domain-Driven Modular Monolith. If
you follow this guide, `lint:arch`, `tsc`, and ESLint will pass and your change
will match every existing module.

## Golden rules

1. **Respect the layers.** `controller → service → repository → data`. One
   direction only.
   - Controllers: thin HTTP adapters. No business rules, **no** `storage`/`db`.
   - Services: business rules + tenant scoping + events. **No** `storage`/`db` —
     go through a repository.
   - Repositories: the **only** place that touches `storage`, `db`, or a service
     facade.
2. **No cross-module data access.** Never import another module's repository.
   Communicate via domain events or compose at the root.
3. **Preserve public API behavior** when migrating (ADR-0005). Same paths, status
   codes, guards, and response bodies as the code you replace.
4. **Validate at the boundary.** Parse input with Zod in the controller; the
   service receives typed, trusted data.
5. **Every step compiles, lints, and passes tests before commit.**

## Adding a new domain module

Copy the shape of an existing module (`customers` is the reference). Minimum
structure:

```
server/modules/<domain>/
  repositories/<domain>.repository.ts   # interface + class; the only data access
  services/<domain>.service.ts          # business rules; throws DomainError
  controllers/<domain>.controller.ts    # thin adapter; maps errors to wire shape
  index.ts                              # DI resolve + Express Router
  __tests__/<domain>.service.test.ts    # DB-free unit tests
```

Then wire it in three places:

```ts
// 1. infrastructure/di/tokens.ts
export const X_REPOSITORY = token<IXRepository>('XRepository');
export const X_SERVICE    = token<XService>('XService');

// 2. infrastructure/di/composition-root.ts
c.register(X_REPOSITORY, () => new XRepository());
c.register(X_SERVICE, (ctx) => new XService(ctx.resolve(X_REPOSITORY)));

// 3. server/routes/index.ts
import xRoutes from "../modules/x";
app.use("/api", xRoutes);
```

Finally, add a **source-contract meta-test** under `server/__tests__/` that
asserts the mount, the retirement of any legacy file, the routes + guards, and
the layer boundary.

## Layer templates

**Repository** — interface first, then a class; tenant-scope every query:

```ts
export interface IXRepository { getForGarage(id: string, garageId: string): Promise<X | undefined>; }
export class XRepository implements IXRepository {
  async getForGarage(id: string, garageId: string) {
    const [row] = await db.select().from(x).where(and(eq(x.id, id), eq(x.garageId, garageId)));
    return row as X | undefined;
  }
}
```

**Service** — business rules, domain errors, no HTTP:

```ts
export class XService {
  constructor(private readonly repo: IXRepository) {}
  async get(id: string, garageId: string): Promise<X> {
    const row = await this.repo.getForGarage(id, garageId);
    if (!row) throw new NotFoundError('X not found');
    return row;
  }
}
```

**Controller** — thin; map domain errors to the legacy wire shape (ADR-0006):

```ts
export function makeXController(service: XService) {
  const guard = (fn, failMsg) => async (req, res) => {
    try { await fn(req, res); }
    catch (e) {
      if (e instanceof NotFoundError)   return void res.status(404).json({ message: e.message });
      if (e instanceof ValidationError) return void res.status(400).json({ message: e.message });
      console.error(`${failMsg}:`, e);  res.status(500).json({ message: failMsg });
    }
  };
  return { get: guard(async (req, res) => res.json(await service.get(req.params.id, garageOf(req))), 'Failed to fetch X') };
}
```

## Conventions

- **TypeScript strict mode** is on. No implicit `any`; where an external facade
  is loosely typed, isolate it in the repository with a local `type Any = any`
  and a plain comment — do **not** add an unused `eslint-disable`.
- **Files stay under 500 lines.** Split large services into a `domain/` helper
  (see `ai/domain/repair-presets.ts`).
- **Read a file before editing it.** Never overwrite uncommitted work.
- **No secrets** in code, commits, or `.env`. Validate input at every system
  boundary.
- **Commit messages:** conventional prefix (`refactor(<domain>): …`), an
  imperative summary, and a body describing the layer split and the gate
  results. **No `Co-Authored-By` trailer** (project rule #2078).
- **Match the surrounding code** — comment density, naming, and idiom.

## Definition of done (per increment)

- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` + `npm run lint:arch` → clean
- [ ] `npm run test` → domain suite green; full suite has no **new** failures
- [ ] Legacy route/handler removed in the same commit (no live duplicate)
- [ ] Meta-test asserts the mount, boundary, and retirement
- [ ] Behavior verified byte-for-byte against the code replaced
