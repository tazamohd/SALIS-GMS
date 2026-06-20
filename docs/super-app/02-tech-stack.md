# 02 — Tech Stack

Keep the SALIS core; add the super-app rails. TypeScript end-to-end.

| Layer | Keep (have in SALIS) | Add for super app | Why |
|---|---|---|---|
| Language | TypeScript everywhere | — | one language web→mobile→backend |
| Web | React 18 + Vite + Radix + Tailwind | shared **design-system package** | reuse across admin/provider/fleet portals |
| Mobile | — | **React Native (Expo)** | consumer + provider/driver apps, shares TS logic |
| Backend | Express + TS | keep; add **BFF / API gateway**; NestJS optional | one API surface for 3+ clients |
| DB | PostgreSQL + Drizzle | **PostGIS**; **double-entry wallet ledger** | geo queries + auditable money |
| Cache/Queue | — | **Redis (Upstash)** + **BullMQ** | sessions, geo, jobs, dispatch |
| Real-time/Dispatch | `ws` WebSockets | Redis pub/sub geo-matching | match demand ↔ nearest provider |
| Identity | Passport + sessions + 2FA | centralize **one SSO/OIDC module** + Nafath/Absher KYC | one account across mini-apps |
| Payments | Stripe, PayPal | **mada, STC Pay, Apple Pay, SADAD** + wallet/ledger; **SAMA-licensed PSP** partner | super apps live on the wallet |
| Maps | — | **Google Maps** or **Mapbox** + PostGIS | booking, tracking, ETA, dispatch |
| Notifications | Twilio SMS | **FCM/APNs push** + email + in-app hub | multi-channel per mini-app |
| Search | — | Typesense / Meilisearch | parts marketplace |
| Infra | Docker, Railway/Render | managed Postgres+Redis now; **Kubernetes** at scale | don't over-provision early |
| Observability | logger, audit middleware | **Sentry + OpenTelemetry + Prometheus/Grafana** | reliability + incident response |
| AI | OpenAI | recommendations, support bot, dynamic pricing, fraud | growth + ops efficiency |
| Data | — | event pipeline → **BigQuery** (later) | analytics warehouse |

Many of these map to the installed `.claude/skills/`: `websocket-engineer` (dispatch),
`postgres-pro`/`database-optimizer` (geo + ledger), `secure-code-guardian` (wallet/auth),
`devops-engineer`/`sre-engineer`/`monitoring-expert` (scale), `prompt-engineer` (AI).
