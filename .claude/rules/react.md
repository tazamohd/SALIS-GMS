# SALIS — React / Client Rules

> Extends `~/.claude/rules/ecc/react/*` and `ecc/web/*`.
> SALIS-specific notes only.

## Stack conventions

- React + Vite + Tailwind + **Radix UI** primitives live in `client/`.
- Server state uses **TanStack Query** — do not duplicate server data into local
  state or hand-roll fetch caching. Derive, don't mirror.
- Forms use **react-hook-form** + `@hookform/resolvers` with the same Zod schema
  the API validates against. Keep client/server validation in sync.

## Hooks & rendering

- Follow the rules of hooks; complete dependency arrays. No conditional hooks.
- Heavy widgets (calendars, dnd-kit boards, charts) should be memoized and, where
  large, dynamically imported. Keep the landing/app bundle within ECC web budgets.

## Accessibility & i18n

- This app ships **Arabic RTL**. Components must work in both LTR and RTL — use
  logical CSS properties, never hardcode left/right.
- Radix gives a11y primitives; preserve their ARIA/focus behavior, don't strip it.

## When changing `client/**/*.tsx`

Run the `react-reviewer` agent (and `typescript-reviewer` alongside). Use
`/react-test` for new components and `/react-build` if the Vite build breaks.
