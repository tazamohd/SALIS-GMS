# ADR-0004: Dependency Injection & Composition Root

**Status:** Accepted · **Phase:** E3

## Context

Under ADR-0001 each domain is a layered slice (`controller → service →
repository`). Something has to construct those objects and connect a service to
its repository. If each module `new`s its own dependencies, construction logic
leaks into business code, tests can't substitute fakes, and the dependency
graph becomes implicit and un-auditable.

## Decision

Introduce a tiny, dependency-free **DI container** (`server/infrastructure/di/
container.ts`) with **typed tokens** (`tokens.ts`) and a single **composition
root** (`composition-root.ts`).

- A `token<T>('Name')` is a typed identifier; providers and consumers agree on
  identity *and* type at compile time.
- The composition root is the **only** place concrete classes are wired:

  ```ts
  c.register(FEATURE_FLAG_REPOSITORY, () => new FeatureFlagRepository());
  c.register(FEATURE_FLAG_SERVICE,
    (ctx) => new FeatureFlagService(ctx.resolve(FEATURE_FLAG_REPOSITORY)));
  ```

- Modules resolve their service lazily at assembly time
  (`getAppContainer().resolve(X_SERVICE)`), and every module accepts an
  optional injected dependency so tests can bypass the container entirely.
- Services take their collaborators as constructor arguments — never global
  singletons — so a unit test constructs `new XService(fakeRepo)` with no
  container in sight.

The event bus is registered in the same root and passed to the services that
publish, keeping wiring in one auditable file.

## Consequences

- **+** The whole dependency graph is readable in one file; adding a domain is a
  three-line change (token pair + registration).
- **+** Services are trivially unit-testable with hand-written fakes; the DB is
  never touched in a service test.
- **+** Construction is centralized, so cross-cutting concerns (logging, dead-
  letter handling, future caching decorators) can be introduced at the root
  without touching business code.
- **−** One indirection to learn: "where is X built?" is always answered by the
  composition root, but newcomers must be told that.
- **−** The container is resolved at module-load time; a missing registration
  surfaces at first request rather than at compile time. Mitigated by the
  typed tokens and the module's optional-injection constructor.
