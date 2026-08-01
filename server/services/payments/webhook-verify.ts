/**
 * Gateway webhook signature verification (deep-audit blocker B8).
 *
 * The unified webhook route settles invoices from asynchronous gateway
 * callbacks. Without verification, anyone who can POST to the public
 * /api/payments/webhook/:gateway endpoint could forge a `completed` event and
 * settle an invoice for free. This module verifies the callback's signature
 * against a per-gateway shared secret and is FAIL-CLOSED:
 *
 *   - if no webhook secret is configured for the gateway  → reject (do not settle)
 *   - if the signature header is missing                  → reject
 *   - if the HMAC does not match (constant-time)          → reject
 *
 * The secure default is therefore "never settle an unverifiable webhook". A
 * deployment MUST set the gateway's webhook secret for online settlement to
 * proceed; during gateway onboarding the exact signature scheme/header is
 * confirmed against the provider's docs (the env + header maps below are the
 * conventional names and can be tuned per gateway).
 */
import crypto from "crypto";
import type { GatewayId } from "./types";

/** Env var holding each gateway's webhook-verification secret. */
const SECRET_ENV: Partial<Record<GatewayId, string>> = {
  stripe: "STRIPE_WEBHOOK_SECRET",
  moyasar: "MOYASAR_WEBHOOK_SECRET",
  tap: "TAP_WEBHOOK_SECRET",
  tabby: "TABBY_WEBHOOK_SECRET",
  tamara: "TAMARA_NOTIFICATION_TOKEN",
  paypal: "PAYPAL_WEBHOOK_SECRET",
  hyperpay: "HYPERPAY_WEBHOOK_SECRET",
};

/** Header carrying the gateway's signature. */
const SIG_HEADER: Partial<Record<GatewayId, string>> = {
  stripe: "stripe-signature",
  moyasar: "x-moyasar-signature",
  tap: "x-tap-signature",
  tabby: "x-tabby-signature",
  tamara: "tamara-signature",
  paypal: "paypal-transmission-sig",
  hyperpay: "x-hyperpay-signature",
};

export interface WebhookVerifyInput {
  headers: Record<string, any>;
  rawBody: Buffer | string;
}

export interface WebhookVerifyResult {
  ok: boolean;
  reason: string;
}

function headerValue(headers: Record<string, any>, name: string): string {
  const v = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
}

/** Constant-time compare of two strings via equal-length SHA-256 digests. */
function safeEqual(a: string, b: string): boolean {
  const da = crypto.createHash("sha256").update(a).digest();
  const db = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(da, db);
}

export function verifyGatewayWebhook(
  gateway: GatewayId,
  input: WebhookVerifyInput,
): WebhookVerifyResult {
  const secretEnv = SECRET_ENV[gateway];
  if (!secretEnv) {
    return { ok: false, reason: `no signature scheme for gateway "${gateway}"` };
  }
  const secret = process.env[secretEnv];
  if (!secret) {
    // FAIL-CLOSED: without a configured secret we cannot trust the callback.
    return { ok: false, reason: `webhook secret not configured (${secretEnv})` };
  }

  const headerName = SIG_HEADER[gateway] || "x-webhook-signature";
  const provided = headerValue(input.headers, headerName);
  if (!provided) {
    return { ok: false, reason: `missing signature header (${headerName})` };
  }

  const raw =
    typeof input.rawBody === "string" ? input.rawBody : input.rawBody?.toString("utf8") || "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

  // Some providers prefix the scheme (e.g. "sha256="); compare against the tail token.
  const providedToken = provided.includes("=") ? provided.split("=").pop() || provided : provided;

  const ok = safeEqual(providedToken, expected);
  return { ok, reason: ok ? "verified" : "signature mismatch" };
}
