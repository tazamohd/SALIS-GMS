/**
 * Sentry initialisation (server). Key-deferred: a no-op unless SENTRY_DSN is
 * set, so it's safe to ship with no account. Imported early in server/index.ts
 * (after ./config has loaded dotenv) so errors are captured platform-wide.
 *
 * To enable: set SENTRY_DSN (+ optionally SENTRY_TRACES_SAMPLE_RATE) in the env.
 */
import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    sendDefaultPii: false,
  });
  // eslint-disable-next-line no-console
  console.log("🛡️  Sentry error tracking enabled");
}

export const sentryEnabled = !!dsn;
export { Sentry };
