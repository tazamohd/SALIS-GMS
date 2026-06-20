# 04 — Team Roles & Required Knowledge

This file defines **every role**, what they own, and the knowledge/skills they need.
Part A covers the **governance & planning roles** (the leadership/coordination core).
Part B covers the **delivery roles** (build the product). Part C clarifies overlapping
boundaries and gives a lifecycle RACI.

---

## Part A — Governance & Planning Core

These six roles run the program. They are mostly **upstream** (discovery → definition →
design → planning) and **cross-cutting** (coordinate everyone). Get these right and the
delivery pods can move fast.

### A1. Project Manager (PM)
- **Mission:** deliver the right scope, on time, on budget, with risks controlled.
- **Owns:** project plan, schedule, budget, resourcing, risk/issue register, dependencies,
  stakeholder communication, vendor/partner coordination, status reporting.
- **Does NOT own:** *what* to build (Product) or *how* it's architected (Architect). PM owns
  the **when / how-much / who / coordination**.
- **Knowledge & skills:** Agile/Scrum + classic PM (PMP/PRINCE2), roadmapping, estimation,
  budgeting, risk management, RAID logs, Jira/Linear, vendor & regulatory-timeline management.
- **Key deliverables:** master plan & milestones, RAID log, sprint/release calendar,
  budget tracker, weekly status report, dependency map.
- **Works with:** everyone — the connective tissue.

### A2. System Architect
- **Mission:** own the end-to-end technical architecture and non-functional integrity.
- **Owns:** target architecture, technology standards, integration design (KSA gov + payment
  systems), security/scalability/reliability (NFRs), ADRs, build-vs-buy calls, the
  modular-monolith→microservices evolution, the shared-rail boundaries.
- **Knowledge & skills:** distributed systems, event-driven & DDD, API/contract design,
  data modeling, cloud architecture, security architecture, performance/scaling, the SALIS
  stack (TS, Postgres/Drizzle, Redis, PostGIS).
- **Key deliverables:** architecture diagrams (C4), ADRs, NFR catalog, integration specs,
  reference implementation of the shared rails.
- **Maps to skills:** `architecture-designer`, `api-designer`, `legacy-modernizer`, `cloud-architect`.

### A3. System Analyst
- **Mission:** translate business requirements into precise **system** specifications.
- **Owns:** functional specs, use cases / user-story acceptance criteria, data flow diagrams,
  state machines, system sequence diagrams, interface specs between mini-apps and rails,
  data dictionary. The bridge **between BA and engineering**.
- **Knowledge & skills:** requirements analysis, UML/BPMN, data modeling, SQL literacy,
  API/contract reading, gap analysis, traceability (requirement → spec → test).
- **Key deliverables:** Software/Functional Requirements Spec (SRS/FRS), use-case catalog,
  DFDs, sequence diagrams, data dictionary, requirements-traceability matrix.
- **Maps to skills:** `spec-miner` (extract specs from existing SALIS code), `feature-forge`.

### A4. Business Analyst (BA)
- **Mission:** understand the business + market + regulation and turn them into requirements.
- **Owns:** stakeholder elicitation, business process modeling (as-is / to-be), business
  requirements (BRD), market & competitor analysis, regulatory requirement gathering
  (TGA / Insurance Authority / SAMA / ZATCA), KPI/success-metric definition, cost-benefit.
- **Knowledge & skills:** requirements elicitation, BPMN, stakeholder management, marketplace
  economics, KSA automotive/fintech domain, regulatory awareness, basic data analysis.
- **Key deliverables:** BRD, process maps, stakeholder map, requirement backlog (business-level),
  success metrics, regulatory requirement list.
- **Maps to skills:** `feature-forge`.

### A5. Documentation Specialist (Technical Writer)
- **Mission:** make knowledge findable, accurate, and current across the whole program.
- **Owns:** the documentation system — requirements/architecture docs formatting, **API docs
  (OpenAPI/Swagger)**, developer guides, user manuals (Arabic + English), runbooks, release
  notes, onboarding docs, the knowledge base / doc portal, doc standards & templates.
- **Knowledge & skills:** technical writing, Markdown/Docusaurus/MkDocs, OpenAPI, diagramming,
  information architecture, **Arabic + English** authoring, docs-as-code (versioned in git).
- **Key deliverables:** doc portal, API reference, user guides, runbooks, templates, glossary.
- **Maps to skills:** `code-documenter`.

### A6. Development & Planning Architect (Delivery Architect)
- **Mission:** convert architecture + requirements into an **executable build plan** and keep
  delivery technically coherent across pods.
- **Owns:** technical roadmap & sequencing, work breakdown structure (epics → stories → tasks),
  estimation & capacity planning, cross-pod dependency sequencing, sprint/release planning from
  a technical standpoint, technical-debt budget, definition-of-done & engineering standards,
  ensuring pods don't fork the shared rails.
- **The bridge between System Architect (the "what/how" of design) and the PM (the "when/who").**
- **Knowledge & skills:** software delivery at scale, estimation, dependency mapping,
  release/branching strategy, CI/CD, feature flags, Agile engineering practice, the SALIS stack.
- **Key deliverables:** technical roadmap, WBS/epic breakdown, estimates, release plan,
  engineering standards & DoD, dependency/sequencing plan.
- **Maps to skills:** `architecture-designer`, `feature-forge`, `devops-engineer`.

---

## Part B — Delivery Roles (build the product)

| Specialty | Must know | Maps to installed skill |
|---|---|---|
| Backend / Platform Engineer | TS, Node/Express(or NestJS), API/BFF, Postgres+Drizzle, Redis, OIDC, ledger/payments, multi-tenancy | `typescript-pro`, `api-designer`, `postgres-pro`, `fullstack-guardian` |
| Mobile Engineer | React Native/Expo, push, Maps SDK, live tracking, offline/sync | `react-expert` |
| Web/Frontend Engineer | React 18, Vite, Tailwind/Radix, design system, i18n + Arabic RTL, a11y | `react-expert`, `typescript-pro` |
| Real-time / Dispatch Engineer | PostGIS, geo indexing, Redis pub/sub, WebSockets, matching/ETA | `websocket-engineer`, `database-optimizer` |
| Data / AI Engineer | event pipelines, BigQuery, OpenAI, pricing/fraud/recommendations | `prompt-engineer`, `sql-pro` |
| DevOps / SRE | Docker, CI/CD, Terraform, K8s, observability, SLOs | `devops-engineer`, `sre-engineer`, `monitoring-expert`, `cloud-architect` |
| Security Engineer | OWASP, PCI basics, secrets/KMS, KSA data residency, threat modeling | `secure-code-guardian`, `security-reviewer` |
| QA / Test Automation | Vitest, Playwright e2e, contract tests, k6 load testing | `test-master`, `playwright-expert` |
| Product Manager (per cluster) | two-sided marketplace metrics, requirements | `feature-forge` |
| UX / UI / Design-system Designer | super-app shell, Arabic-first design, Figma | — |

**Domain / regulatory / ops** (non-build but essential): Regulatory Affairs, Legal Counsel,
Payments/Fintech specialist, Finance/Accounting (ZATCA), Supply/Field Ops, Partnerships/BD,
Customer Support (AR/EN), Growth/Marketing, Data Analyst. (Detail in `03-roadmap-and-resourcing.md`.)

---

## Part C — Role boundaries & lifecycle RACI

Because BA / System Analyst / System Architect / Dev&Planning Architect / PM overlap, here is
the clean split:

| Question answered | Role |
|---|---|
| **Why** (business goal, market, regulation) | Business Analyst |
| **What the system must do** (functional spec) | System Analyst |
| **How it's built** (architecture, tech, NFRs) | System Architect |
| **In what order / broken into what work** | Development & Planning Architect |
| **When, how much, who, coordination** | Project Manager |
| **Captured & published** (all of the above) | Documentation Specialist |

### Lifecycle RACI (R=responsible, A=accountable, C=consulted, I=informed)

| Stage | BA | Sys Analyst | Sys Architect | Dev&Plan Arch | PM | Doc Spec |
|---|---|---|---|---|---|---|
| Discover | A/R | C | C | I | R | C |
| Define (requirements) | C | A/R | C | C | R | R |
| Design (architecture) | I | C | A/R | C | C | R |
| Plan (WBS/sequence) | I | C | C | A/R | R | C |
| Build | I | C | C (advise) | R | R(coord) | C |
| Verify | I | C | C | C | R | C |
| Launch | C | I | C | C | A/R | R |
| Operate/Iterate | C | C | C | C | R | R |
