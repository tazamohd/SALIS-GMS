# `<StatusBadge>`

Single source of truth for status visuals — small inline labels that communicate state at a glance (e.g. job-card status, invoice paid/overdue, customer activity).

**Location:** `client/src/components/ui/status-badge.tsx`

---

## When to use it

- A short label (1–2 words) communicating state
- Inside dense layouts: tables, list items, card headers, inline next to titles
- Whenever a designer would otherwise reach for a "colored pill"

**Don't** use it for:
- Long-form sentences — use plain text with semantic color utility classes instead
- Toggle / clickable affordances — use `<Button variant="ghost">` or `<Toggle>`
- KPI numbers / metrics — use `<Badge>` (count badge) or a stat card

---

## Variants

Five semantic intents, each backed by a design-system token:

| Variant | Token | Use when |
|---|---|---|
| `success` | `--success` | Final positive states: `completed`, `paid`, `delivered`, `active`, `approved` |
| `info` | `--info` | In-flight informational states: `in_progress`, `assigned`, `sent`, `scheduled`, `shipped` |
| `warning` | `--warning` | Needs attention but not failed: `pending`, `waiting`, `draft`, `on_hold` |
| `destructive` | `--destructive` | Failed / terminal-negative: `cancelled`, `unpaid`, `overdue`, `failed`, `rejected` |
| `neutral` (default) | `--muted` | Unknown status / fallback |

Inference: if you pass a known domain status string (e.g. `status="in_progress"`), the variant is inferred automatically. Extend the map in `STATUS_VARIANT_MAP` when a new status string appears — never reach for another component.

---

## Props

| Property | Type | Default | Description |
|---|---|---|---|
| `status` | `string` | — | Domain status. Drives variant inference and provides the prettified label when no children are passed. |
| `variant` | `StatusVariant` | inferred from `status`, else `"neutral"` | Explicit override. Wins over `status` inference. |
| `tone` | `"subtle" \| "strong"` | `"subtle"` | Visual emphasis. `subtle` = tinted background + semantic-colored text. `strong` = solid fill + foreground-color text. |
| `children` | `ReactNode` | prettified `status` | Custom label. |
| `className` | `string` | — | For layout overrides only — don't override colors here. |

---

## Tones

| Tone | Visual | When to use |
|---|---|---|
| `subtle` (default) | Tinted background (12% alpha) + semantic-colored text | Inside tables, list items, dense screens — softer, doesn't fight other content |
| `strong` | Solid semantic fill + white/inverted text | Hero cards, dashboards, anywhere the status is the headline |

Both tones use the **same** semantic tokens — only the alpha and text mapping differ. Dark mode handled automatically via the CSS vars (no per-mode props, no `dark:` overrides).

---

## States

`StatusBadge` is non-interactive — no hover, focus, or pressed visuals.

| State | Visual | Behavior |
|---|---|---|
| Default | Tinted (subtle) or solid (strong) | Static — read-only signal |
| Within `<button>` parent | Inherits parent's focus ring | Don't add a separate ring |

If you need a clickable status (e.g. a quick filter), wrap in a `<Button variant="ghost">` and place the badge inside.

---

## Accessibility

- **Role:** none assigned (it's a visual label, not an interactive control). Screen readers will read the text content.
- **Color contrast:** all five tone × variant combinations meet WCAG AA against the surfaces where they're used (light/dark mode both). This is enforced by the `--foreground`/`--*-foreground` tokens.
- **Color-only meaning:** never communicate state with color alone — the badge always renders text, so screen readers and color-blind users get the same signal.
- **`data-testid`:** the badge auto-renders `status-badge-<normalized-status>` for test selectors.

---

## Do's and Don'ts

| Do | Don't |
|---|---|
| Pass `status={item.status}` and let inference do the work | Hand-pick a color: `text-green-600` everywhere |
| Add new status strings to `STATUS_VARIANT_MAP` | Create a new component for one new status |
| Use `tone="strong"` only when the badge is a focal point | Mix tones randomly within the same screen |
| Use `variant="neutral"` for unknown / catch-all | Default to `info` when you mean "no specific intent" |
| Wrap in `<Button variant="ghost">` to make it clickable | Add `onClick` to the badge itself |

---

## Code examples

### The 90% case

```tsx
<StatusBadge status={item.status} />
// status="completed" → green subtle pill, label "Completed"
// status="in_progress" → blue subtle pill, label "In Progress"
// status="cancelled" → red subtle pill, label "Cancelled"
// status="something_unknown" → neutral subtle pill, label "Something Unknown"
```

### Explicit variant + custom label

```tsx
<StatusBadge variant="success">All set</StatusBadge>
<StatusBadge variant="warning">Review required</StatusBadge>
<StatusBadge variant="destructive" tone="strong">Action needed</StatusBadge>
```

### Inside a table cell

```tsx
<TableCell>
  <StatusBadge status={order.status} />
</TableCell>
```

### Inside a clickable filter chip

```tsx
<Button variant="ghost" size="sm" onClick={() => filterBy("paid")}>
  <StatusBadge status="paid" />
  <span>23</span>
</Button>
```

---

## Replaces

This component is the result of consolidating three earlier implementations (audit-flagged):

- ~~`<StatusPill>`~~ — deleted, was using hardcoded brand hex
- ~~`<StatusDot>`~~ — deleted, same hex problem
- ~~`.status-pill-blue` / `-orange` / `-gray`~~ CSS classes — deleted from `index.css`

If you find a reference to any of those in code review, it's stale — they should all route through `<StatusBadge>` now.

---

## Related

- [`<Badge>`](../../client/src/components/ui/badge.tsx) — the underlying shadcn primitive for plain badges/chips
- [`<Button variant="ghost">`](../../client/src/components/ui/button.tsx) — wrap a `<StatusBadge>` in this to make it clickable
- Semantic tokens defined in [`client/src/index.css`](../../client/src/index.css) (`--success`, `--warning`, `--info`, `--destructive`, `--muted`)
