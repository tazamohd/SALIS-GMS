# Rubric: Design Review

Applied at the plan/design gate, before code. The cheapest place to fix a bad
approach.

## Blockers

- Doesn't actually solve the stated problem, or solves it with avoidable complexity.
- Data model wrong or risky: non-additive/destructive migration without a plan;
  missing `garageId` on a tenant-scoped table; breaks referential integrity.
- API design ignores conventions: new routes not in modular `server/routes/`; not
  reusing shared Zod schemas; duplicating `shared/*Utils.ts` domain math.
- Security surface unaddressed: auth/RBAC/payments/PII touched with no plan for it.
- Not decomposable into small, independently testable work units, or DoD per unit is
  vague/unverifiable.
- Proposes editing vendor-locked files (`server/paypal.ts`).

## Majors

- No test strategy, or one that can't move the coverage gate.
- UI design ignores archetype layout wrappers, dark-theme/grayscale, or RTL/i18n.
- Unstated trade-offs; no alternative considered.
- Hidden coupling or cross-cutting blast radius not called out.

## Minors

- Naming/structure inconsistencies with existing modules; missing rollout/seed notes.

## Verdict

**APPROVE** only with zero unresolved blockers. Otherwise **REQUEST CHANGES** with
numbered, severity-tagged findings and a concrete fix each. Escalate to the human after
3 iterations.
