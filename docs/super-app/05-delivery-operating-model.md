# 05 — Delivery & Operating Model

## How we divide the work: two-axis pod model

Horizontal pods build the shared rails once; vertical "mission" pods own a service end-to-end
and **reuse** the rails (never fork them).

```
HORIZONTAL (platform pods — build once, everyone reuses)
 ├─ Platform/Core pod ....... Identity · Wallet/Ledger · Payments · Notifications · API gateway
 ├─ Dispatch pod ............ PostGIS · matching · live tracking (shared by roadside/ride/tow)
 ├─ DevOps/SRE/Security pod . infra · CI/CD · observability · security gates
 └─ Data/AI pod ............. pipeline · pricing · fraud · recommendations

VERTICAL (mission pods — full-stack, own one service start→finish)
 ├─ Garage Services pod ..... booking + inspection (reuses rails + SALIS supply)
 ├─ Marketplace pod ......... parts + search + logistics
 ├─ Fleet pod ............... fleet mgmt + Wasl + telematics (B2B)
 └─ (later) Insurance / Rentals / Ride-share pods
```

### Ownership matrix

| Capability | Owner pod | Consumers |
|---|---|---|
| Login / KYC / Nafath | Platform | all |
| Wallet / payments / payouts | Platform | all |
| Geo dispatch & tracking | Dispatch | roadside, ride-share, tow |
| Booking flow | Garage Services | consumer app |
| Parts catalog/search | Marketplace | consumer app |
| Fleet + Wasl | Fleet | B2B web |
| CI/CD, infra, monitoring | DevOps/SRE | all |
| Pricing / fraud / analytics | Data/AI | all |

## Start → end: per-service stage gates

Each service passes the same gates, so every new mini-app ships faster.

| Stage | What happens | Owner | Accelerated by (skills) |
|---|---|---|---|
| 1. Discover | market + regulatory check, supply readiness, success metrics | BA / PM | `spec-miner` |
| 2. Define | EARS requirements, user stories, acceptance criteria, SRS | System Analyst | `feature-forge` |
| 3. Design | ADRs, Drizzle data model, API contracts, UX flows | System Architect | `architecture-designer`, `api-designer`, `postgres-pro` |
| 4. Plan | WBS, estimates, sequencing, release plan | Dev&Planning Architect | `feature-forge`, `devops-engineer` |
| 5. Build | full-stack against shared rails, feature-flagged | Mission pod | `fullstack-guardian`, `react-expert`, `typescript-pro`, `websocket-engineer` |
| 6. Verify | unit/integration/e2e, load test, security review pre-merge | QA + Security | `test-master`, `playwright-expert`, `code-reviewer`, `security-reviewer`, `secure-code-guardian` |
| 7. Launch | canary / limited region → compliance sign-off → GA | DevOps/SRE + PM | `devops-engineer`, `sre-engineer`, `monitoring-expert` |
| 8. Operate | SLOs, dashboards, runbooks, growth experiments | SRE + Data/AI | `sre-engineer`, `monitoring-expert` |

## Cadence & quality gates

- **2-week sprints**; quarterly roadmap per pod; program-level milestone review monthly.
- **Definition of Done:** CI green (Vitest + Playwright) · code review approved · security review
  for anything touching auth/money · docs updated · behind a feature flag.
- **Sequencing rule:** build the **rails first**, then Wave-1 mission pods, then Waves 2–3 —
  while regulatory/BD runs in parallel from day one.

## Decision ownership (lightweight)

- Architecture/tech → System Architect (A), pods (R)
- Priority / what to build → Product + BA (A)
- Can we legally ship → Regulatory/Legal (A) — a **hard gate** for roadside/insurance/rentals/ride-share
- Reliable/secure → SRE + Security (A)
- Schedule/budget/coordination → Project Manager (A)
