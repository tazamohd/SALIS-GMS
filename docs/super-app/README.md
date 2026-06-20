# SALIS Super App — START POINT

> This folder is the saved checkpoint for the SALIS automotive **super app** initiative.
> When you say **"go back to the start point,"** this is it. Read the files in order.

## What this is

A plan to evolve **SALIS AUTO** (the existing multi-tenant garage-management ERP) into an
**automotive super app** for **Saudi Arabia / GCC** — "Careem/Uber for everything automotive."
B2B (garage/fleet supply) and B2C (car-owner demand) are built **in parallel**, on a shared
platform, with services delivered in **waves**.

## The 7 target services

Garage service booking · Parts marketplace · Roadside assistance/towing · Fleet management ·
Insurance · Car rentals · Ride-share. (Periodic inspection added as an easy Wave-1 bonus.)

## Core decisions locked so far

1. **Evolve SALIS, don't greenfield.** It is the supply backbone.
2. **Modular monolith first**; extract the dispatch engine to its own service first.
3. **Build the shared rails once** (Identity, Wallet/Ledger, Payments, Notifications, Orders);
   every mini-app reuses them.
4. **Sequence the 7 services into 3 waves** by supply-readiness + regulatory weight.
5. **Mobile-first** consumer + provider apps via **React Native (Expo)**; keep React web for B2B/admin.
6. **Regulatory/licensing starts day one** — it is the long pole, not the code.

## Index

| File | Contents |
|---|---|
| `01-strategy-and-architecture.md` | Concept, 7 services → 3 waves, target architecture, KSA regulatory map |
| `02-tech-stack.md` | Full stack: keep vs add |
| `03-roadmap-and-resourcing.md` | Phased timeline, headcount & burn by phase |
| `04-team-roles.md` | Every role + required knowledge/skills (governance/planning core, delivery roles, and the **marketing & growth team**) |
| `05-delivery-operating-model.md` | Pods, ownership matrix, stage gates, RACI, cadence |
| `06-agent-org.md` | The **AI agent army** (`.claude/agents/`) and how it maps to human roles |
| `07-master-plan-and-schedule.md` | Living master plan: gap analysis, epics, estimates, dependencies, **sprint schedule** |

## How to resume

1. Re-read this README + `04-team-roles.md` and `05-delivery-operating-model.md` (most recent focus).
2. Next concrete engineering step (not yet started): design the **shared-rail Drizzle schema**
   (Identity, Wallet/Ledger, Catalog, Orders) on top of `shared/schema.ts`.

_Status: planning checkpoint. No super-app code written yet. Last updated by planning session._
