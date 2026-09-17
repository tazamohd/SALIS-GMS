# SALIS AUTO — public portal (design spike)

> **Status: spike. Not wired into the app, not reachable by any route, not built by
> `npm run build` at the repo root.** It is a self-contained static prototype, kept here so
> the design and the flow can be reviewed as running pages rather than screenshots.
>
> **It overlaps with code that already exists.** `client/src/pages/CustomerPortal.tsx`
> (`/customer-portal`) and `client/src/pages/PublicTracking.tsx` (`/track/:token`) already
> cover much of this ground. Nothing here replaces them yet.
>
> **The OTP flow is the intended direction.** Today a customer gets in through an opaque
> token in the URL, minted by `POST /api/job-cards/:id/tracking/generate`. This spike
> instead sends a one-time code to the mobile the workshop already has on file and keeps
> the challenge in a cookie, so no page carries a plate, job card or phone number in its
> URL — a link in an SMS about a named customer's car gets forwarded, logged and
> screenshotted. Adopting it means retiring the token links, not running both.
>
> **Adopting this properly means porting it**, not shipping it: React pages under
> `client/src/pages`, `wouter` routes, strings moved into `client/src/i18n/locales/*.json`,
> and shadcn components in place of the hand-written CSS. The endpoints below do not exist
> server-side.

The customer-facing pages: look up a job, receive a one-time code, enter it, then watch the
job. Built from a Claude Design handoff.

```
src/
  landing.html          /public-portal/landing — lookup form, requests the OTP
  verify.html           /public-portal/verify  — code entry, resend
  job.html              /public-portal/job     — the authenticated view
  portal.css            tokens, base, header, buttons, fields, error state, footer
  portal.js             language toggle + get/post/safeNext/pair helpers  (window.Portal)
  fonts.css             generated @font-face rules — do not hand-edit
  fonts/                self-hosted woff2 + OFL.txt
  partials/
    head.html           charset, viewport, fonts, stylesheet link
    header.html         skip link + sticky header
    footer.html         footer
    helpline.html       included by job.html
build.mjs               resolves includes, writes dist/
tools/fetch-fonts.mjs   regenerates fonts.css + fonts/ from Google Fonts
dist/                   generated; do not edit
```

## Build

```
npm run build     # src/ -> dist/
npm run serve     # build, then serve dist/ on :8080
```

No dependencies. `build.mjs` replaces `<!-- include: name -->` with
`src/partials/<name>.html`, re-indenting to match, and copies `portal.css`, `portal.js`,
`fonts.css` and `fonts/`.
Includes may nest. A missing partial, a cycle, or an unresolved include fails the build
rather than shipping a page with a hole in it.

`dist/` is self-contained: the pages reference `portal.css` and `portal.js` relatively, so
they render correctly both when opened straight off disk and when served at
`/public-portal/landing`. `npm run serve` if you want them over HTTP.

The one shape this does not survive is a route with a trailing slash —
`/public-portal/landing/` would resolve the assets to `/public-portal/landing/portal.css`.
Every existing app route (`/login`, `/public-portal/book-demo`) is bare, so this is only a
constraint to keep in mind if that ever changes.

## Fonts

Self-hosted. Nothing is fetched from Google at page load, so no third party learns who
opened a job link — which matters on a page reached from an SMS about a named customer's
car.

`src/fonts/` and `src/fonts.css` are generated. Montserrat, Inter, JetBrains Mono and Noto
Sans Arabic ship as **variable** files — one file covers every weight the design uses, so
the whole set is 485 KB instead of the 1.4 MB the equivalent static faces would cost, with
Arabic alone dropping from 648 KB to 166 KB. Poppins has no variable build on Google
Fonts, so its two weights are static (~27 KB total).

Only the `latin`, `latin-ext` and `arabic` subsets are included, each with its
`unicode-range`, so a browser downloads only the faces the text on screen actually needs:
roughly 130 KB for an English reader, and the Arabic face only once the toggle is pressed.

Inter and Montserrat are preloaded — they are the body and display faces and are needed on
every first paint in either language.

To change a weight or add a family, edit `FAMILIES` in `tools/fetch-fonts.mjs`, then
`npm run fonts && npm run build`. The `@font-face` rules are generated, not hand-written.
The generator does not fetch licences — `fonts/OFL.txt` is updated by hand when a family
is added.

**Licensing.** All five families are under the SIL Open Font License 1.1, which permits
this bundling. `fonts/OFL.txt` carries each family's licence in full and verbatim — they
are *not* identical across families, so none is shared or summarised.

## Conventions

**Bilingual.** Every translated string ships as an adjacent pair and CSS picks the active
one, so switching language never re-fetches or re-renders:

```html
<span data-lang="en">Send one-time code</span><span data-lang="ar">أرسل الرمز</span>
```

Text produced in JS goes through `Portal.pair(el, {en, ar})`, which builds the same pair —
so a message written in English still switches when the toggle is pressed. Anything
rebuilt from a value (the resend countdown) registers `Portal.onLangChange`.

Language is per-session and starts at English; there is no persistence or `?lang=`
parameter, matching the design prototype rather than the marketing site.

**Endpoints.** All JSON, same-origin, via `Portal.get` / `Portal.post`:

| | |
|---|---|
| `POST /api/public-portal/otp` | `{mode, phone, plate_area, plate_number \| job_card}` |
| `POST /api/public-portal/otp/verify` | `{code}` |
| `POST /api/public-portal/otp/resend` | `{}` |
| `GET  /api/public-portal/job` | — |
| `POST /api/public-portal/job/approvals/<id>` | `{decision: "approve"\|"decline"}` |

Each returns `200` with an optional `{"next": "/…"}`; `Portal.safeNext` rejects anything
that is not a same-origin absolute path before redirecting. `X-CSRF-Token` is sent when a
`<meta name="csrf-token">` is on the page.

The challenge lives in the cookie the first call sets. No page carries the plate, job card
or phone number in its URL.

**Error copy is deliberately generic** — never "no such job". A lookup that distinguishes
a wrong code from an unknown vehicle is a plate-enumeration oracle.

## The job view

`GET /api/public-portal/job` returns the whole page; nothing is server-rendered into
job.html. The design promises "a live view of your job, not a screenshot from a callback",
so the page re-reads itself every 30s — but only while the tab is visible and no approval
is mid-flight, and a failed background poll never replaces what is on screen.

Shape of the payload:

```
job      {id, vehicle, plate, eta}  + branch/advisor as pairs
         + status {tone: "wait"|"done"|null, label}
stages   [{state: "done"|"now"|"pending", label, at, by}]
approvals[{id, status: "pending"|"approved"|"declined", title, amount, note}]
photos   [{url, thumb, caption, at, by}]
history  [{ref, date, summary, invoice_url}]
invoice  {status, total, pdf_url, xml_url, pay_url}  — or null
```

Every human-readable string is an `{en, ar}` pair, including money, so Arabic keeps its
own numerals (`١٨٠ ريال`). Identifiers, timestamps and URLs are plain strings rendered
`dir="ltr"`. Any section whose data is absent hides itself.

**All API values are written with `textContent` or `Portal.pair`, never interpolated into
`innerHTML`.** This page renders workshop-entered text — advisor notes, part names, photo
captions — to a customer, so it is precisely where injected markup would land.

## Open items

- `{{ challenge.phone_masked }}` in `src/verify.html` and `{{ workshop.whatsapp_e164 }}` /
  `{{ workshop.phone_e164 }}` in `partials/helpline.html` are server-rendered.
- `/public-portal/job` is the assumed post-verification destination; the server can
  override it per response via `next`.
- The job view's photo URLs are served as given. Nothing else is outstanding.

## Departures from the source design

The design covers the landing page only, in light mode, with no failure states. Added
here: the verify and job pages, error and pending styling (`--danger*`, `.btn:disabled`),
a mobile header treatment, and a working skip link. Each is commented where it lives.

The job view is not invented from nothing — the landing page's "What you'll see" section
is a mock of it, and its panels follow that mock's structure, wording and hierarchy.
