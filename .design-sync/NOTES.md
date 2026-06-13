# design-sync notes — SALIS-GMS

Repo-specific knowledge for future syncs. Read this before re-running anything.

## Shape & wiring

- This is a full app (Express + Vite React client), NOT a packaged design system. The DS layer is `client/src/components/ui/` (shadcn/ui "new-york" style: Radix + Tailwind 3 + cva). There is no Storybook and no DS `dist/`.
- The converter entry is the committed barrel `.design-sync/ds-entry.ts` (one `export *` per ui file). **Add a line there when a new component file lands in `client/src/components/ui/`.**
- Prop contracts come from generated declarations: `package.json` has `"types": "types/.design-sync/ds-entry.d.ts"` and `cfg.buildCmd` runs `tsc -p .design-sync/tsconfig.dts.json` (with `--noCheck` not needed — emit is clean as of 2026-06). `types/` is gitignored and must be regenerated before every converter run (buildCmd does it).
- The stylesheet is compiled Tailwind: `cfg.buildCmd` compiles `client/src/index.css` through `.design-sync/tailwind.sync.config.ts` (the app's tailwind.config plus `.design-sync/previews/**` in content, so preview utility classes are generated) into `.design-sync/.cache/tailwind.css` (= `cfg.cssEntry`). **Always re-run buildCmd after editing previews and before package-build**, or new utility classes silently miss the bundle.
- `componentSrcMap` enumerates 56 roots (pins) and nulls ~198 subcomponent exports (DialogTrigger, CardHeader, …) because the generated d.ts has no compound/namespace info — all 254 exports still ship in the bundle (`window.SalisUI`, 260 exports). When adding a component file: add the barrel line, a root pin, and nulls for its subcomponent exports.
- Grouping is via stub docs: `.design-sync/docs/group-<name>.md` (frontmatter `category:` only) mapped per-component in `cfg.docsMap`. Empty-bodied stubs keep the synthesized .prompt.md. 8 groups: actions, forms, layout, navigation, overlay, feedback, data-display, brand.
- `guidelinesGlob` is pinned to `docs/USER_SCENARIOS.md` only — the default glob would pull in `docs/README.md` and `docs/SYSTEM_ARCHITECTURE.md`, which are backend/app docs, not design guidance. USER_SCENARIOS is kept deliberately: domain context (roles, garage workflows) for the design agent.

## Environment

- Render check/capture browser: playwright npm package is installed into `.ds-sync/` but no playwright browser download — set `DS_CHROMIUM_PATH` to puppeteer's chrome-headless-shell, e.g. `$(ls -d ~/.cache/puppeteer/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell)`. Puppeteer (a repo dependency) provides it after `npm ci`. If `~/.cache/puppeteer` is empty, run `npx puppeteer browsers install chrome-headless-shell`.
- This sync ran in a remote session WITHOUT the DesignSync upload tool — local-only build; no claude.ai/design project exists yet, so there is no `projectId` pin and no uploaded `_ds_sync.json` anchor. The first run from a DesignSync-capable session must create the project and do the first upload (everything is already verified locally).

## Known render warns (triaged legitimate)

- `[TOKENS_MISSING] --radix-accordion-content-height, --radix-navigation-menu-viewport-{width,height}` — set at runtime by Radix; expected.
- `[TOKENS_MISSING] --sidebar-border, --sidebar-accent` — referenced by sidebar.tsx utility classes but not defined in `client/src/index.css` either; the real app has the same gap (sidebar falls back). App-level quirk, not a sync bug.
- `[FONT_REMOTE]` — Inter/Montserrat/Poppins (+SF Pro etc. fallbacks) load via the Google Fonts `@import url(...)` retained at the top of styles.css; nothing to ship.

## Fonts / typography

- Brand fonts are Google-hosted (Inter primary, Poppins for buttons, Montserrat) via remote @import in `client/src/index.css`. No local font files in the repo.
