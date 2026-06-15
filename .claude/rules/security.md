# Rule: Security

Always-on security guardrails for SALIS-GMS. This is a multi-tenant ERP that
handles financial, tax, and customer PII data — treat security as load-bearing.

- **No secrets in the repo.** Credentials live in `.env` (gitignored).
  `.env.example` documents required keys with no values.
- **`AUTH_BYPASS=true` is development only.** Never enable, hardcode, or default
  it on in code paths that can reach production.
- **Tenant isolation.** Many queries filter by `garageId`. Production must
  enforce `garageId` scoping; do not ship handlers that leak cross-tenant rows.
  Dev-mode "return all when no garageId" shortcuts must not bleed into prod.
- **Respect RBAC.** Route protection goes through `rbac-middleware` /
  `rbac-config`. New endpoints must declare and enforce the right permissions —
  don't add unauthenticated or unauthorized routes.
- **Validate all input with Zod** at the boundary (shared schemas), server-side,
  before it reaches storage. Never trust client input.
- **Auth & sessions.** Passwords via bcrypt; sessions via passport +
  `express-session`. Don't weaken hashing, session, or 2FA logic.
- **Compliance data integrity.** VAT / ZATCA / Zakat / TRN logic has legal
  weight — changes need tests and care, not guesses.
