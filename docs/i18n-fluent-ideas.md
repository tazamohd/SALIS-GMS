# i18n: Ideas borrowed from Project Fluent

SALIS-GMS uses [react-i18next](https://react.i18next.com/), not
[Project Fluent](https://projectfluent.org/). We did **not** migrate to Fluent —
instead we borrowed three of its best ideas and implemented them on top of the
existing i18next stack, so translation strings carry their own
locale-correctness instead of pushing it onto every component.

| Fluent concept | What it does | How we do it here |
| --- | --- | --- |
| `NUMBER()` / `DATETIME()` inline references | Format inside the message | i18next custom formatters (`client/src/i18n/formatters.ts`) |
| Select on `$count` with plural categories | `[one] … [few] … *[other]` | i18next CLDR plurals (`_one`, `_two`, `_few`, `_many`, `_zero`, `_other`) |
| `SELECT` with a default `*` variant | Gender / variant selection | i18next `context`, with the base key as the default |

All three are wired up in `client/src/i18n/config.ts` and covered by
`client/src/i18n/formatters.test.ts`.

---

## 1. Inline formatters (`NUMBER` / `DATETIME` equivalent)

Reference a formatter directly inside a translation value with
`{{value, formatterName}}`. The component just passes the raw value — locale,
currency rules and the Hijri calendar are applied in the message layer.

```jsonc
{
  "invoice": {
    "total":   "Total due: {{amount, sar}}",
    "totalIn": "Total due: {{amount, currency(currency: AED)}}",
    "tax":     "Includes {{rate, percent}} VAT"
  },
  "stats":  { "visits": "{{value, number}} visits" },
  "report": {
    "gregorian": "Generated on {{date, datetime}}",
    "atTime":    "Generated on {{date, datetime(dateStyle: long; timeStyle: short)}}",
    "hijri":     "Generated on {{date, hijri}}",
    "hijriOnly": "Generated on {{date, hijri(mode: only)}}"
  }
}
```

```ts
t('invoice.total', { amount: 1500 });        // "Total due: ‏1,500.00 ر.س.‏" (ar) / "SAR 1,500.00" (en)
t('stats.visits', { value: 12500 });         // "12,500 visits" / "١٢٬٥٠٠ زيارة"
t('report.hijri', { date: new Date() });     // "14 Sha'ban 1447 / 16 Mar 2026"
```

| Formatter | Backed by | Notes |
| --- | --- | --- |
| `sar` | `lib/currency.formatCurrency` | Saudi Riyal shortcut |
| `currency(currency: CODE)` | `lib/currency.formatCurrency` | Any code in `CURRENCIES` (SAR, AED, KWD, USD…) |
| `number` / `number(maximumFractionDigits: 1)` | `Intl.NumberFormat` | Locale grouping & digits |
| `percent` | `Intl.NumberFormat` | Expects a ratio (`0.15` → `15%`) |
| `datetime` / `datetime(dateStyle: …; timeStyle: …)` | `Intl.DateTimeFormat` | Gregorian; defaults to a medium date |
| `hijri` / `hijri(mode: only)` | `lib/hijriDateFormatter` | Umm al-Qura; Arabic month names under `ar` |

Adding a new formatter: register it in `registerFluentFormatters()` in
`client/src/i18n/formatters.ts`. The signature is `(value, lng, options)` where
`options` carries the inline format params (and i18next also mixes the `t()`
values in — read only the keys you expect, as the datetime formatter does).

## 2. Plural categories

i18next (v25) resolves the correct CLDR plural category from `Intl.PluralRules`
automatically. Provide a key per category your locale uses and pass `count`:

```ts
t('count.vehicles', { count: 3 });
```

English uses two forms; **Arabic uses all six** — `_zero`, `_one`, `_two`,
`_few`, `_many`, `_other`:

```jsonc
// en.json
"count": { "vehicles_one": "{{count}} vehicle", "vehicles_other": "{{count}} vehicles" }

// ar.json  (0=zero, 1=one, 2=two, 3–10=few, 11–99=many, 100+=other)
"count": {
  "vehicles_zero": "لا توجد مركبات",
  "vehicles_one":  "مركبة واحدة",
  "vehicles_two":  "مركبتان",
  "vehicles_few":  "{{count}} مركبات",
  "vehicles_many": "{{count}} مركبة",
  "vehicles_other":"{{count}} مركبة"
}
```

> Prefer a single `count.*` plural key over separate `vehicle` / `vehicles`
> strings + manual `if (n === 1)` checks — only the plural form gets Arabic
> right.

## 3. Gender / variant selection (Fluent `SELECT`)

Use i18next `context`. Define the base key as the **default variant** (Fluent's
`*`), then add `_<variant>` overrides. Unknown or missing context falls back to
the base:

```jsonc
"greeting": {
  "welcome":        "Welcome, {{name}}",
  "welcome_male":   "Welcome, Mr. {{name}}",
  "welcome_female": "Welcome, Ms. {{name}}"
}
```

```ts
t('greeting.welcome', { context: customer.gender, name }); // male / female / default
t('greeting.welcome', { name });                           // default
```
