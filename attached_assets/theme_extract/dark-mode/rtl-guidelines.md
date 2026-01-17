# RTL Rules (KSA-ready)

## Non-negotiables
- Use logical properties: `margin-inline`, `padding-inline`, `inset-inline`, `border-inline`.
- Avoid `left/right` in CSS unless you are intentionally overriding something.
- Icons that imply direction (chevrons/arrows/breadcrumbs) flip in RTL.
- Codes/IDs/VIN/SKU/email/URLs stay LTR inside RTL blocks.

## CSS Snippet
```css
.card { padding-block: 16px; padding-inline: 18px; border-radius: 16px; }

html[dir="rtl"] .row { flex-direction: row-reverse; }

.code, .vin, .sku, .email, .url {
  direction: ltr;
  unicode-bidi: plaintext;
  font-variant-numeric: tabular-nums;
}
```

## Component mapping
- Sidebar: left (LTR) → right (RTL)
- Search icon: stays at **start**
- KPI icon: **start**
- Trend arrows: flip only if directional
