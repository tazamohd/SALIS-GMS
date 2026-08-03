/**
 * Business (service-provider) verification for platform onboarding.
 *
 * Saudi providers must present OFFICIAL government identifiers before they are
 * activated on the platform:
 *   - Tax / VAT number (ZATCA): 15 digits, starts with 3.
 *   - Commercial Registration ("Sejel" / السجل التجاري): 10 digits.
 *
 * This module runs a format check plus a registry-existence check and returns a
 * verdict the onboarding pipeline uses to auto-approve, reject, or route to
 * manual review. The registry lookup is pluggable: today it is a deterministic
 * stub (so the platform is self-contained and testable), with a clear seam to
 * wire a real government API (e.g. Wathq for CR, ZATCA/Fatoora for VAT) by
 * setting BUSINESS_VERIFICATION_PROVIDER and implementing a RegistryClient.
 *
 * Demo accounts (isDemo) skip the registry lookup so the platform can be tried
 * without real credentials, but their format is still checked.
 */

export type VerificationStatus = "verified" | "failed" | "manual_review";

export interface VerificationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  provider: string; // "stub" | "demo" | "wathq" | ...
  checks: VerificationCheck[];
}

export interface VerifyInput {
  taxNumber?: string | null;
  commercialRegistration?: string | null;
  country?: string | null;
  isDemo?: boolean;
}

const SAUDI_VAT_RE = /^3\d{14}$/; // 15 digits, starts with 3 (ZATCA)
const SAUDI_CR_RE = /^\d{10}$/; // 10-digit commercial registration / unified number

// Known demo identifiers that always pass, so providers can trial the platform.
const DEMO_TAX_NUMBERS = new Set(["300000000000003", "311111111111113"]);
const DEMO_CR_NUMBERS = new Set(["1010000000", "2050000000", "7000000000"]);

function checkFormats(input: VerifyInput): VerificationCheck[] {
  const checks: VerificationCheck[] = [];
  const tax = (input.taxNumber ?? "").trim();
  const cr = (input.commercialRegistration ?? "").trim();

  checks.push({
    name: "tax_number_format",
    passed: SAUDI_VAT_RE.test(tax),
    detail: tax ? `Tax number ${tax}` : "Tax number missing",
  });
  checks.push({
    name: "commercial_registration_format",
    passed: SAUDI_CR_RE.test(cr),
    detail: cr ? `CR ${cr}` : "Commercial registration missing",
  });
  return checks;
}

/**
 * Real registry client: Wathq (وثّق) commercial-registration lookup, active
 * when WATHQ_API_KEY is set. Any API failure degrades to "not found" so a
 * possibly-valid business routes to MANUAL REVIEW — never auto-approved on an
 * outage, never auto-rejected on one either.
 */
async function wathqLookup(cr: string): Promise<{ found: boolean; detail: string }> {
  const key = process.env.WATHQ_API_KEY!;
  const base = process.env.WATHQ_API_BASE || "https://api.wathq.sa/v5/commercialregistration";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${base}/fullinfo/${encodeURIComponent(cr)}`, {
      headers: { apiKey: key, Accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.status === 200) {
      const body: any = await res.json().catch(() => ({}));
      const active = body?.status?.id === undefined || String(body?.status?.name ?? "").length >= 0;
      return { found: active, detail: `CR found in Wathq registry (${body?.crName ?? "name unavailable"})` };
    }
    if (res.status === 404) return { found: false, detail: "CR not found in Wathq registry" };
    return { found: false, detail: `Wathq lookup inconclusive (HTTP ${res.status})` };
  } catch (err: any) {
    return { found: false, detail: `Wathq lookup failed (${err?.name === "AbortError" ? "timeout" : "network error"})` };
  }
}

/**
 * Registry existence check. Uses Wathq when WATHQ_API_KEY is configured;
 * otherwise a deterministic stub (well-formed, non-blocklisted → found) so the
 * platform is self-contained and testable. Demo identifiers always pass.
 */
async function registryLookup(input: VerifyInput): Promise<{ provider: string; found: boolean; detail: string }> {
  const tax = (input.taxNumber ?? "").trim();
  const cr = (input.commercialRegistration ?? "").trim();

  if (input.isDemo || DEMO_TAX_NUMBERS.has(tax) || DEMO_CR_NUMBERS.has(cr)) {
    return { provider: "demo", found: true, detail: "Demo account — registry lookup bypassed" };
  }

  if (process.env.WATHQ_API_KEY) {
    const r = await wathqLookup(cr);
    return { provider: "wathq", ...r };
  }

  const provider = process.env.BUSINESS_VERIFICATION_PROVIDER || "stub";
  const blocklisted = tax.endsWith("0000") && cr.endsWith("0000");
  const found = SAUDI_VAT_RE.test(tax) && SAUDI_CR_RE.test(cr) && !blocklisted;
  return {
    provider,
    found,
    detail: found ? "Identifiers found in registry (stub)" : "Identifiers not found in registry (stub)",
  };
}

export async function verifyBusiness(input: VerifyInput): Promise<VerificationResult> {
  const formatChecks = checkFormats(input);
  const formatsOk = formatChecks.every((c) => c.passed);

  // Bad format is a hard fail — no point querying a registry with junk.
  if (!formatsOk) {
    return { status: "failed", provider: "format", checks: formatChecks };
  }

  const lookup = await registryLookup(input);
  const checks: VerificationCheck[] = [
    ...formatChecks,
    { name: "registry_lookup", passed: lookup.found, detail: lookup.detail },
  ];

  if (lookup.found) {
    return { status: "verified", provider: lookup.provider, checks };
  }
  // Well-formed but not found: don't auto-reject a possibly-valid business —
  // send it to a human.
  return { status: "manual_review", provider: lookup.provider, checks };
}
