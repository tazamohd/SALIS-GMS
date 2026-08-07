# ADR-0005: Strangler-Fig Domain Extraction

**Status:** Accepted · **Phase:** E2–E7

## Context

The backend carries two very large monoliths — `server/routes.ts` (~20k lines,
~1,035 endpoints) and `server/storage.ts` (~15k lines). A big-bang rewrite of
either is high-risk: it would touch every feature at once, be impossible to
review, and provide no safe rollback. But leaving them untouched means no real
domain boundaries ever appear.

## Decision

Extract domains **one at a time** using the strangler-fig pattern, keeping the
build, tests, and production behavior green after every step. The repeatable
playbook is: **Extract → Compile → Test → Verify parity → Commit.**

1. **Establish the boundary first, migrate internals later.** A new domain
   repository initially *delegates* to whatever the legacy code used — the
   `storage` facade, direct Drizzle, or an external service facade
   (`analytics-service`, `ai/business-intelligence`, the OpenAI SDK). The
   layering is enforced immediately; the repository's internals move to direct
   queries later with **no caller change**.
2. **Preserve public API behavior byte-for-byte.** Route paths, status codes,
   guards (`requirePlan`, `requireResourceOwnership`, role gates), and response
   bodies are identical to the retired handler. Divergence is a regression.
3. **Remove legacy code only after parity is confirmed** by tests. The old
   route file / monolith block is deleted in the same commit that lands the
   module, so there is never a live duplicate.
4. **Cut each branch from the previous completed head** so post-merge diffs stay
   clean and the plan document's addendum never conflicts.

Each increment ships DB-free service unit tests plus a **source-contract
meta-test** that reads the module/route source and asserts the mount, the
retirement of the legacy file, and the layer boundary.

## Consequences

- **+** Every step is small, reviewable, independently revertible, and shippable.
  22 domains have been extracted this way with zero behavioral regressions.
- **+** Risk is bounded to one domain per PR; a failure never blocks the others.
- **+** The boundary (the repository seam) is valuable even before internals are
  optimized — data access for a domain is already funnelled through one file.
- **−** The transformation is **long-running**. During it, the codebase is a
  hybrid: extracted modules alongside a still-large monolith (see the Technical
  Debt Report). "Done" is a moving target measured by the migration matrix.
- **−** Byte-for-byte parity forbids opportunistic cleanups (naming, dead
  `||` fallbacks) during extraction; those are deferred to a post-parity pass.
