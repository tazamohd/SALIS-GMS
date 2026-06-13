# SALIS AUTO design system — build conventions

React + Tailwind utility classes. Components come from `window.SalisUI.*`; style your own layout glue with the Tailwind classes below — they are compiled into the shipped stylesheet. Do not invent class names outside this vocabulary; for anything unusual use inline `style={{}}`.

## Setup

- No global provider is required. Exceptions: wrap `Tooltip` in `TooltipProvider`; wrap `Sidebar` in `SidebarProvider`; mount `<Toaster />` once at app root and fire notifications with `toast({ title, description })` — both exported from the bundle.
- Dark mode: add `class="dark"` on a root element (tokens flip via CSS variables).
- Fonts load from Google Fonts via `styles.css`: **Inter** is the body font, **Poppins** renders buttons/headings (`font-poppins`), **Montserrat** is available as `font-montserrat`.

## Styling vocabulary (semantic Tailwind tokens)

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent`, `bg-secondary`
- Text: `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-primary`, `text-destructive`
- Brand actions: `bg-primary text-primary-foreground` (SALIS blue), `bg-destructive text-destructive-foreground` (SALIS orange — destructive/warning/CTA accent)
- Borders & focus: `border-border`, `border-input`, `ring-ring`
- Radius: `rounded-lg` / `rounded-md` / `rounded-sm` (driven by `--radius`)
- Raw brand CSS vars (for inline styles/gradients): `--salis-blue-start` #0A5ED7, `--salis-blue-end` #0BB3FF, `--salis-navy`, `--salis-orange`, e.g. `style={{background:"var(--salis-blue-gradient)"}}`

Component look is controlled by props, not classes: `variant`/`size` on Button, Badge, Alert, Toggle, etc. (see each component's `.d.ts` for the exact unions).

## Domain status vocabulary (use these, don't restyle by hand)

- `StatusBadge status="…"`: completed/paid/delivered → green; in_progress/repair/assigned/sent → blue; pending/waiting/draft → yellow; cancelled/unpaid/overdue → red; anything else gray.
- `StatusPill variant`: `blue` (default) / `orange` / `gray` / `navy`. `StatusDot status`: `active` / `pending` / `warning` / `inactive`.
- KPI cards: `StatCard` (value + trend), `BrandCard`, `ChartCard` (metric + delta + embedded chart). Charts: build recharts inside `ChartContainer` with a `config={{ key: { label, color } }}` and `fill="var(--color-key)"`.

## Where the truth lives

Read `styles.css` → `_ds_bundle.css` (the full compiled theme; `:root` defines every token) before styling, and each component's `.prompt.md` / `.d.ts` for API + composition examples.

## Idiomatic example

```tsx
const { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } = window.SalisUI;

<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="font-poppins">Job Card JC-1042</CardTitle>
    <StatusBadge status="in_progress" />
  </CardHeader>
  <CardContent className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
    Toyota Camry 2021 — brake pad replacement
    <Button size="sm">Open</Button>
  </CardContent>
</Card>
```
