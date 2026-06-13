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

## Preview-authoring learnings (folded from the 2026-06 wave)

### Capture mechanics
- The capture card wrapper sets `transform: translateZ(0)`, making it the containing block for `position: fixed` descendants — Radix `ToastViewport` (and anything fixed, non-portaled) anchors to the card, not the page. Toast.tsx passes `<ToastViewport style={{position:"static"}}>`; Sidebar uses the in-flow `collapsible="none"` variant (the default `offcanvas` variant is `fixed h-svh` and clips).
- Kill chart/CSS animations for deterministic captures: `isAnimationActive={false}` on every recharts `Bar`/`Line`/`Area`, and ChartCard's own `.chart-animate` clip-path reveal needs an injected `animation:none/clip-path:none` style override (see previews/ChartCard.tsx).
- ScrollArea: pass `type="always"` or the scrollbar is invisible in static shots.
- Radix open-state tricks that work statically: `open` prop (Dialog/AlertDialog/Sheet/Popover/HoverCard/Tooltip-in-provider/DropdownMenu/Select), controlled `value` (Menubar root + MenubarMenu, NavigationMenu root + item), vaul Drawer needs `shouldScaleBackground={false}`, ContextMenu has NO open prop — dispatch a synthetic `contextmenu` MouseEvent on mount (see previews/ContextMenu.tsx).
- react-hook-form `useForm({ defaultValues, errors })` renders FormMessage/destructive labels statically — no setError hack.

### Precompiled-CSS gotchas (previews capture BEFORE the orchestrator's tailwind recompile)
- Utilities confirmed MISSING from the app-compiled cache at authoring time: `mr-1.5`, `leading-snug`, `size-8`, `bg-primary/10`, `line-through`, gradient color stops, arbitrary values (`w-[340px]`). Prefer `gap-*`, `h-8 w-8`, inline styles. After a full buildCmd run the previews' own classes ARE compiled in (previews/ is in the tailwind content globs).

### DS-source observations (app-level, not sync bugs)
- Slider: `disabled:opacity-50` sits on the Thumb span where `:disabled` never matches (Radix emits `data-disabled`) — disabled sliders look enabled. Fix in source: `data-[disabled]:opacity-50` on Root.
- Toggle default variant is `bg-transparent` when off (reads as bare text); Slider's unfilled track is bright cyan `bg-secondary`; Sidebar active-item accent is very light — all faithful to tokens.
- EmptyState hard-codes its `FileQuestion` icon and `h-[400px]`; only title/description/actionLabel/onAction props.
- StatusBadge status→color map: completed/paid/delivered=green; in_progress/repair/assigned/sent=blue; pending/waiting/draft=yellow; cancelled/unpaid/overdue=red; else gray. StatusPill variants: blue/orange/gray/navy. StatusDot: active #0BB3FF, inactive #9BA4B0, warning #F97316, pending #0A5ED7.
- `toast`/`useToast` are re-exported from ds-entry.ts (added post-wave) so Toaster is previewable and designs can fire toasts from the bundle.

### Skipped states (interaction-only, by design)
- Hover/focus states everywhere; Select keyboard highlight; CommandDialog overlay variant (inline Command shown); Sidebar collapsed/mobile modes; Carousel slides beyond the first; InputOTP fake caret.

## Re-sync risks (watch-list for the next run)

- **No upload has happened yet** — this entire campaign was local-only (no DesignSync tool in the session). There is no projectId pin and no remote `_ds_sync.json`; the next DesignSync-capable run is a FIRST sync: create a fresh project (§1), and grades will NOT carry (verification state lives in the gitignored `.cache/` and in the uploaded anchor, neither of which exists remotely). Re-verifying everything on that run is expected and correct; the committed previews make it mostly mechanical.
- The barrel (`ds-entry.ts`), `componentSrcMap`, and the group `docsMap` are hand-enumerated — a new component file in `client/src/components/ui/` is INVISIBLE to the sync until all three are updated (barrel line + root pin + subcomponent nulls + group mapping).
- `package.json` `"types"` points at the gitignored `types/` tree — `buildCmd` must run before the converter on a fresh clone or prop extraction silently degrades.
- Status vocabularies (StatusBadge/StatusPill/StatusDot maps) are documented in conventions.md and previews — if the source enums change, both go stale; the validation pass in the conventions step will NOT catch enum drift (the class names still exist).
- Google-Fonts remote @import is the only font source; captures in an offline environment will fall back silently.
- Tailwind compiled CSS is content-scanned: previews authored in a future wave capture against the PREVIOUS compile until buildCmd re-runs (see precompiled-CSS gotchas above).
- `toast`/`useToast` ride on ds-entry.ts — if someone regenerates the barrel mechanically from the ui/ dir, that line is lost and the Toaster preview breaks.
