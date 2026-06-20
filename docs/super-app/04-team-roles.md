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

---

## Part D — Marketing & Growth Team

A super app is a **two-sided marketplace**, so marketing has to win **two audiences at once**:
**demand** (car owners / fleets / businesses) and **supply** (garages, drivers, tow operators,
rental & insurance partners). The team is built around that split. Mobile-first, **Arabic-first**,
tuned for KSA/GCC channels (Snapchat, TikTok, Google/YouTube, X, influencers) and seasonality
(Ramadan, Hajj, school terms, National Day).

### D1. Head of Marketing / CMO
- **Mission:** own brand, growth, and the marketing budget across all mini-apps and both sides.
- **Owns:** marketing strategy, budget & CAC/LTV targets, channel mix, brand positioning,
  team leadership, regulatory-compliant advertising.
- **Skills:** marketplace growth, KSA/GCC market, budgeting, brand strategy, leadership.

### D2. Growth / Performance Marketing Manager
- **Mission:** acquire users efficiently and scale what works.
- **Owns:** paid acquisition (Meta, Snapchat, TikTok, Google, programmatic), CAC/LTV/ROAS,
  funnel & conversion optimization, A/B experiments, attribution.
- **Skills:** performance media buying, analytics, experimentation, MMPs (AppsFlyer/Adjust).

### D3. Demand-Side Acquisition Lead (B2C)
- **Mission:** bring **car owners** into the consumer app.
- **Owns:** consumer campaigns, referrals, promos/wallet credits, app-install funnels per mini-app.
- **Skills:** consumer growth loops, referral/promo design, lifecycle hooks.

### D4. Supply-Side Acquisition Lead (B2B / partners)
- **Mission:** recruit and retain **supply** — garages, drivers, tow operators, rental/insurance partners.
- **Owns:** partner/merchant acquisition campaigns, field & event marketing, onboarding funnels,
  B2B/fleet lead generation. Works tightly with Supply/Field Ops and Partnerships/BD.
- **Skills:** B2B demand gen, channel/partner marketing, ABM, events.

### D5. Brand & Creative Lead
- **Mission:** one coherent super-app brand across mini-apps.
- **Owns:** brand identity, visual system (with Design), ad creative, video, campaign concepts,
  Arabic-first creative.
- **Skills:** brand & art direction, copy, video/motion, bilingual creative.

### D6. Content & Social Media Manager
- **Mission:** organic presence and community in Arabic + English.
- **Owns:** social calendar (TikTok/Snapchat/Instagram/X/YouTube), community management,
  UGC, content production.
- **Skills:** social-native content, community mgmt, Arabic copywriting, trend-jacking.

### D7. SEO / ASO Specialist
- **Mission:** own organic discovery on web **and** the app stores.
- **Owns:** App Store Optimization (App Store + Google Play), web SEO, keyword/ratings strategy,
  store conversion. **ASO is critical for a mobile super app.**
- **Skills:** ASO tooling, technical + content SEO, keyword research, store experimentation.

### D8. CRM / Lifecycle / Retention Marketing Manager
- **Mission:** turn installs into repeat, multi-service users (cross-sell across mini-apps).
- **Owns:** push/email/SMS/in-app journeys, segmentation, wallet/loyalty promotions, churn/winback,
  cross-mini-app cross-sell, the loyalty program.
- **Skills:** CRM platforms (Braze/CleverTap/MoEngage), segmentation, lifecycle design, loyalty.

### D9. Product Marketing Manager (PMM)
- **Mission:** position and launch each mini-app (go-to-market).
- **Owns:** positioning & messaging per service, GTM/launch plans, pricing/promo narrative,
  competitive intel, sales enablement for B2B (fleet/insurance).
- **Skills:** product marketing, GTM, messaging, competitive analysis.

### D10. PR & Communications Lead
- **Mission:** reputation, media, and government/regulatory comms.
- **Owns:** press, media relations, crisis comms, partnerships announcements, public/government affairs.
- **Skills:** PR, KSA media landscape, stakeholder comms, crisis management.

### D11. Influencer & Partnerships Marketing Manager
- **Mission:** leverage KSA's strong creator/influencer culture.
- **Owns:** influencer/KOL programs, co-marketing with partners, affiliate programs, sponsorships.
- **Skills:** influencer management, deal-making, affiliate platforms.

### D12. Marketing Analyst / Growth Analyst
- **Mission:** measure everything and find the next lever.
- **Owns:** dashboards, attribution, cohort/retention/funnel analysis, CAC/LTV reporting,
  budget-efficiency analysis. Works with the Data/AI pod.
- **Skills:** analytics (GA4, SQL, BI tools), attribution modeling, experimentation analysis.

### Marketing team — phased headcount

| Role | MVP | Growth | Scale |
|---|---|---|---|
| Head of Marketing / CMO | 1 | 1 | 1 |
| Growth / Performance | 1 | 2 | 3 |
| Demand-side lead (B2C) | 0–1 | 1 | 2 |
| Supply-side lead (B2B) | 1 | 1 | 2 |
| Brand & Creative | 1 | 2 | 3 |
| Content & Social | 1 | 2 | 3 |
| SEO / ASO | 0–1 | 1 | 1 |
| CRM / Lifecycle | 0 | 1 | 2 |
| Product Marketing (PMM) | 0 | 1–2 | 3 |
| PR & Comms | 0–1 | 1 | 2 |
| Influencer & Partnerships | 0 | 1 | 2 |
| Marketing Analyst | 0–1 | 1 | 2 |
| **Marketing total** | **~5–7** | **~15** | **~26** |

### How marketing divides the work

- **Split by marketplace side, not just channel:** Demand-side (D3) and Supply-side (D4) leads
  run independent funnels with different channels, creative, and metrics — both report to the CMO.
- **Per mini-app GTM:** a PMM (D9) pairs with each service's Product Manager so every Wave launch
  has positioning, pricing narrative, and a launch plan.
- **Acquire → Convert → Retain → Refer loop:** Growth/Performance (D2) + SEO/ASO (D7) acquire,
  Brand/Content (D5/D6) convert, CRM/Lifecycle (D8) retains & cross-sells across mini-apps,
  Influencer/Referral (D11) drives the referral loop. Marketing Analyst (D12) measures the whole loop.

### Where marketing plugs into delivery

Marketing joins the per-service **stage gates** (see `05-delivery-operating-model.md`):
- **Discover** — BA + PMM size the market and demand.
- **Plan/Build** — PMM prepares GTM; Supply-side lead pre-recruits supply so launch isn't empty.
- **Launch** — Growth + Brand + PR run the campaign; CRM arms lifecycle journeys.
- **Operate** — Growth scales ROAS, CRM drives retention/cross-sell, Analyst optimizes spend.

> Reminder: **CAC/marketing is usually the single largest cost line** in a marketplace —
> budget it as a first-class number alongside engineering and licensing (see `03-roadmap-and-resourcing.md`).
