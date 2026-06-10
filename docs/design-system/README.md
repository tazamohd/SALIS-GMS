# Design System

Components, tokens, and tooling for the SALIS AUTO UI.

## Tokens

Semantic HSL tokens defined in [`client/src/index.css`](../../client/src/index.css):

| Token | Use for |
|---|---|
| `--background` / `--foreground` | Page surface and primary text |
| `--card` / `--card-foreground` | Card surface and text |
| `--muted` / `--muted-foreground` | Secondary surfaces and text |
| `--primary` / `--primary-foreground` | Brand primary action |
| `--secondary` / `--secondary-foreground` | Brand secondary action |
| `--success` / `--success-foreground` | Final positive states |
| `--info` / `--info-foreground` | In-flight informational states |
| `--warning` / `--warning-foreground` | Needs attention but not failed |
| `--destructive` / `--destructive-foreground` | Failed / terminal-negative |
| `--accent` / `--accent-foreground` | Hover / focus / selection backgrounds |
| `--border` / `--input` / `--ring` | Borders, input outlines, focus rings |

Dark mode handled by `.dark` overrides of the same vars — components reference the var once, no `dark:` branches needed.

## Documented components

| Component | Doc |
|---|---|
| `<StatusBadge>` | [StatusBadge.md](./StatusBadge.md) |

More to come as the system matures. See the audit in [`docs/14-testing/TESTING_STRATEGY_GUIDE.md`](../14-testing/TESTING_STRATEGY_GUIDE.md) (or the audit transcript) for the documentation backlog.

## Tooling

### `npm run lint:colors`

Scans `client/src/**/*.{ts,tsx,css}` for two banned patterns:

1. **Arbitrary-hex Tailwind classes** — `text-[#0A5ED7]`, `bg-[#F97316]/30`, etc.
2. **Raw Tailwind palette utilities** — `text-green-700`, `bg-blue-100`, etc.

Both bypass the semantic tokens above and were identified in the design-system audit as the source of cross-page color drift.

**Today's baseline:** ~28,000 violations across ~316 files. Not wired into CI yet — running it would block every PR. The script is an opt-in backlog tool; run it to find the worst offenders, fix one file at a time, and consider gating CI when the count is low enough that a single PR can clear it.

Suggested workflow:

```bash
# Find the worst-offending file
npm run lint:colors 2>&1 | grep -E "^  client" | head -10

# After cleaning a file, verify
npm run lint:colors 2>&1 | grep <file-path>
```

The scanner respects an `ALLOWED` set at the top of `scripts/check-hex-classes.mjs` — add files there only when they legitimately need to reference brand hex (e.g. the `index.css` token definitions themselves).

### Mapping cheat sheet

| Banned | Use instead |
|---|---|
| `bg-[#0A5ED7]` | `bg-primary` |
| `text-green-700` | `text-[hsl(var(--success))]` |
| `bg-red-100` | `bg-[hsl(var(--destructive)/0.12)]` |
| `text-yellow-700` | `text-[hsl(var(--warning))]` |
| `bg-blue-100` | `bg-[hsl(var(--info)/0.12)]` |
| `text-[#9BA4B0]` | `text-muted-foreground` |

For status-pill rendering specifically, **use `<StatusBadge>` instead** of writing the classes by hand — it already handles tone (subtle/strong) and variant inference.
