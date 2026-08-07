# Dependency Graph

How the modular architecture is allowed to depend on itself — and the
dependencies that are **forbidden** and enforced in CI by
`scripts/check-architecture.mjs` (`npm run lint:arch`).

## Layer dependency direction (within a module)

Dependencies flow one way. A layer may call the layer below it and nothing above.

```mermaid
flowchart TD
    R["HTTP route (index.ts)\nmiddleware: auth · requirePlan · guards"] --> C["Controller\n(thin HTTP adapter)"]
    C --> S["Service\n(business rules, tenant scoping, events)"]
    S --> Repo["Repository\n(the ONLY data-layer access)"]
    Repo --> D["Data layer\nstorage · db (Drizzle) · service facades · SDKs"]

    C -. "❌ forbidden" .-> Repo
    C -. "❌ forbidden" .-> D
    S -. "❌ forbidden" .-> D
```

**Rules enforced by `lint:arch`:**

1. Controllers must **not** import the data layer (`storage` / `db`) directly.
2. Services must **not** import the data layer directly — they go through a
   repository.
3. No module may import **another module's repository** (no cross-module data
   access). The composition root is the only external wiring point.

## Module ↔ infrastructure

Every domain module depends **inward** on shared infrastructure, never on another
domain module.

```mermaid
flowchart LR
    subgraph Modules["server/modules/* (22)"]
      M1["customers"]
      M2["invoices"]
      M3["ai"]
      Mx["… 19 more"]
    end

    subgraph Infra["server/infrastructure/*"]
      DI["di/ (container · tokens · composition-root)"]
      ERR["errors/ (DomainError hierarchy)"]
      EVT["events/ (event-bus)"]
      HTTP["http/ (response envelope)"]
      PERM["permissions/ (RBAC registry)"]
      BASE["repository/ (base contracts)"]
    end

    subgraph Data["Data layer (shared)"]
      STORE["storage facade"]
      DB["db (Drizzle) + shared/schema"]
      FAC["service facades\n(analytics · business-intelligence · compliance)"]
    end

    Modules --> DI
    Modules --> ERR
    Modules --> EVT
    Modules --> PERM
    Modules -->|repository only| STORE
    Modules -->|repository only| DB
    Modules -->|repository only| FAC

    M1 -. "❌ module → module" .-> M2
```

## Composition root — the one wiring point

The composition root is deliberately the **only** place that knows about
concrete classes from more than one module. It builds the event bus, then
registers each domain's repository and service.

```mermaid
flowchart TD
    CR["composition-root.ts"] --> BUS["EventBus"]
    CR --> P1["FeatureFlagRepository → FeatureFlagService"]
    CR --> P2["InvoiceRepository → InvoiceService"]
    CR --> P3["… 27 more repo→service pairs"]
    BUS --> H1["customer.handlers"]
    BUS --> H2["estimate.handlers"]
    BUS --> H3["invoice.handlers"]
    BUS --> H4["payment.handlers"]
```

## Event flow (in-process bus)

Write-path domains publish domain events; subscribers react without a compile-
time dependency on the publisher. Delivery is idempotent with retry/backoff and
dead-letter capture.

```mermaid
flowchart LR
    EST["estimates"] -->|estimate.converted_to_invoice| BUS(("event-bus"))
    INV["invoices"] -->|invoice.created| BUS
    PAY["payments"] -->|payment.received / reversed| BUS
    CUS["customers"] -->|customer.*| BUS
    BUS --> RH["reconciliation / projection handlers"]
```

## Forbidden dependencies (summary)

| From | To | Verdict | Enforced by |
|------|----|---------|-------------|
| Controller | `storage` / `db` | ❌ | `lint:arch` rule 1 + ESLint `no-restricted-imports` |
| Service | `storage` / `db` | ❌ | `lint:arch` rule 2 |
| Module A | Module B's repository | ❌ | `lint:arch` rule 3 |
| Module | another Module | ❌ (communicate via events / composition root) | review + `lint:arch` |
| Repository | Controller / Service | ❌ (upward) | layering / review |

Current status: **0 violations** across `server/modules/**`.
