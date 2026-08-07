/**
 * Content-Security-Policy for the SPA (Vite/React/Tailwind/Radix + a same-origin
 * WebSocket + Google Fonts). Extracted from index.ts so it is unit-testable
 * without booting the server.
 *
 * - Production locks script-src to same-origin hashed bundles (the built
 *   index.html has no inline scripts). Development relaxes it for Vite HMR
 *   (inline + eval + the HMR socket).
 * - Inline styles are allowed because Radix/UI components inject them.
 * - Payment-gateway frames/connects (Stripe, Moyasar, …) are NOT allowlisted by
 *   default — enable per deployment via CSP_EXTRA_FRAME / CSP_EXTRA_CONNECT /
 *   CSP_EXTRA_IMG (space- or comma-separated origins).
 * - CSP_REPORT_ONLY=true emits Content-Security-Policy-Report-Only (observe,
 *   don't block) — for a staged rollout before enforcing.
 */
export interface CspConfig {
  useDefaults: boolean;
  directives: Record<string, string[]>;
  reportOnly: boolean;
}

export function buildContentSecurityPolicy(env: NodeJS.ProcessEnv = process.env): CspConfig {
  const isProd = env.NODE_ENV === "production";
  const extra = (name: string) =>
    (env[name] || "").split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

  const scriptSrc = isProd
    ? ["'self'"]
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"]; // Vite HMR in dev only

  const directives: Record<string, string[]> = {
    defaultSrc: ["'self'"],
    scriptSrc,
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:", "https:", ...extra("CSP_EXTRA_IMG")],
    connectSrc: ["'self'", "ws:", "wss:", ...extra("CSP_EXTRA_CONNECT")],
    frameSrc: ["'self'", ...extra("CSP_EXTRA_FRAME")],
    workerSrc: ["'self'", "blob:"],
    manifestSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"], // clickjacking: no embedding
  };

  return { useDefaults: false, directives, reportOnly: env.CSP_REPORT_ONLY === "true" };
}
