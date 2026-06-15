# Rule: Code style

Always-on style guardrails for SALIS-GMS.

- **TypeScript, strict.** `tsconfig` has `strict: true` and the repo holds a
  zero-TS-error bar — `npm run check` must stay green. Avoid `any`; prefer
  precise types and inference from Zod/Drizzle.
- **ESM only** (`"type": "module"`). Use `import`/`export`, not CommonJS.
- **Path aliases:** import via `@/*` (client) and `@shared/*` (shared) rather
  than long relative paths.
- **Format with Prettier** (`npm run format`) and keep `npm run lint` clean for
  files you touch.
- **Schema first.** `shared/schema.ts` is the source of truth; derive types and
  Zod validators from it instead of redefining shapes.
- **Reuse UI archetypes.** Build pages from the shadcn/ui archetype wrappers
  (StandardPageLayout, StandardTablePage, DashboardPage, FormPage,
  AnalyticsPage, MobileCardPage, TabsPageLayout) — don't hand-roll page chrome.
- **Dark, monochrome design.** Dark theme is enforced; avoid white backgrounds
  and off-palette colors.
- **i18n + RTL.** No hardcoded user-facing strings — key them in i18next with
  ar + en parity and keep layouts RTL-aware.
- **Match surrounding code.** Mirror the existing file's naming, structure, and
  comment density rather than importing a different style.
