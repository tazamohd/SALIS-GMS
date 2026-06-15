# Rubric: Security

Applied by the `security-auditor` to any change touching auth, RBAC, payments, PII,
tenant data, or external integrations. SALIS-GMS is multi-tenant — assume a malicious
authenticated user and an adversarial tenant.

## Critical / High (BLOCK)

- **Cross-tenant data exposure**: a tenant-scoped read/write/aggregate without
  `garageId` filtering, or trusting a client-supplied `garageId`.
- **Broken access control**: missing/incorrect RBAC check; privilege escalation; IDOR
  (object id not validated against caller's tenant/role).
- **Auth bypass in production paths**: relying on `AUTH_BYPASS` / dev-only leniency for
  real authorization.
- **Secrets**: hardcoded keys/tokens/passwords; secrets logged or returned in
  responses.
- **Injection**: SQL/command/template injection; unsanitized input reaching a query or
  the filesystem.
- **Compliance-data tampering**: VAT/ZATCA/Zakat/TRN values mutable into invalid
  invoices, or audit trail bypassed.

## Medium (fix or record risk)

- External input not validated by a Zod schema.
- Sensitive output not access-controlled (PII over-exposed in a list endpoint).
- Weak session/cookie handling; missing CSRF consideration on state-changing routes.
- Integration callers (PayPal/Twilio) mishandling errors or leaking detail.

## Low (note)

- Verbose error messages, missing rate limiting, defense-in-depth opportunities.

## Verdict

For each finding: severity, `file:line`, the attack it enables, and remediation.
Conclude **PASS** or **BLOCK**. Any unresolved Critical/High → BLOCK.
`server/paypal.ts` is vendor-locked: audit its callers, not the file.
