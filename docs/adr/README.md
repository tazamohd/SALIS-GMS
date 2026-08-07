# Architecture Decision Records

This directory records the significant architectural decisions taken during
**Phase E — Enterprise Architecture Transformation** (and earlier). Each ADR is
immutable once **Accepted**; a decision is changed by adding a new ADR that
supersedes the old one, never by editing history.

| ADR | Title | Status |
| --- | ----- | ------ |
| [0001](0001-modular-monolith-architecture.md) | Domain-Driven Modular Monolith | Accepted |
| [0002](0002-response-and-error-model.md) | Response envelope & `DomainError` model | Accepted |
| [0003](0003-architecture-governance.md) | Architecture governance (`lint:arch`) | Accepted |
| [0004](0004-dependency-injection-and-composition-root.md) | Dependency injection & composition root | Accepted |
| [0005](0005-strangler-fig-domain-extraction.md) | Strangler-fig domain extraction | Accepted |
| [0006](0006-domain-error-to-legacy-wire-mapping.md) | Domain-error → legacy wire mapping | Accepted |

## Format

Every ADR follows the same shape:

- **Context** — the forces at play and the problem being solved.
- **Decision** — what we chose to do, stated in the active voice.
- **Consequences** — the trade-offs accepted, good and bad.

## How decisions relate

```
0001 Modular Monolith  ──┬─▶ 0004 DI & composition root
                         ├─▶ 0005 Strangler-fig extraction
                         └─▶ 0002 Response & error model ──▶ 0006 Error→wire mapping
0003 Governance enforces 0001, 0004, 0005 in CI
```
