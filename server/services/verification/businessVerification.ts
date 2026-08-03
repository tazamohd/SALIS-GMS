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
 * Registry existence check. The stub treats correctly-formatted numbers as
 * "found" unless they are on a small blocklist, and demo numbers as found.
 * Replace this with a real government API client when available.
 */
function registryLookup(input: VerifyInput): { provider: string; found: boolean; detail: string } {
  const tax = (input.taxNumber ?? "").trim();
  const cr = (input.commercialRegistration ?? "").trim();

  if (input.isDemo || DEMO_TAX_NUMBERS.has(tax) || DEMO_CR_NUMBERS.has(cr)) {
    return { provider: "demo", found: true, detail: "Demo account — registry lookup bypassed" };
  }

  const provider = process.env.BUSINESS_VERIFICATION_PROVIDER || "stub";
  // Seam: a real client would call the government registry here and return its
  // result. The stub confirms existence for well-formed, non-blocklisted ids.
  const blocklisted = tax.endsWith("0000") && cr.endsWith("0000");
  const found = SAUDI_VAT_RE.test(tax) && SAUDI_CR_RE.test(cr) && !blocklisted;
  return {
    provider,
    found,
    detail: found ? "Identifiers found in registry (stub)" : "Identifiers not found in registry (stub)",
  };
}

export function verifyBusiness(input: VerifyInput): VerificationResult {
  const formatChecks = checkFormats(input);
  const formatsOk = formatChecks.every((c) => c.passed);

  // Bad format is a hard fail — no point querying a registry with junk.
  if (!formatsOk) {
    return { status: "failed", provider: "format", checks: formatChecks };
  }

  const lookup = registryLookup(input);
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
