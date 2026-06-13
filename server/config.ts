/**
 * Centralized environment configuration.
 * Loads .env file, validates required vars on import, and exports a typed config object.
 */
import dotenv from 'dotenv';
dotenv.config();

const REQUIRED = ['DATABASE_URL', 'SESSION_SECRET'] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`\u274C Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// FR-5: authentication must never be disablable in production.
export const AUTH_DISABLING_FLAGS = ['AUTH_BYPASS', 'DISABLE_AUTH', 'SKIP_AUTH', 'NO_AUTH'] as const;
const isTruthyEnv = (v?: string) =>
  v != null && ['1', 'true', 'yes', 'on'].includes(v.trim().toLowerCase());

/**
 * Pure decision for the auth-bypass guard, so it is unit-testable without the
 * process.exit side effect. `fatal` is true only when a bypass flag is set under
 * production \u2014 in which case the app must refuse to boot.
 */
export function evaluateAuthBypass(env: NodeJS.ProcessEnv = process.env): {
  active: string[];
  fatal: boolean;
} {
  const active = AUTH_DISABLING_FLAGS.filter((f) => isTruthyEnv(env[f]));
  return { active, fatal: active.length > 0 && env.NODE_ENV === 'production' };
}

/** True when an auth-disabling flag is currently active (always false in production). */
export function isAuthBypassActive(): boolean {
  const { active, fatal } = evaluateAuthBypass();
  return active.length > 0 && !fatal;
}

// Enforce at boot: refuse to start if bypass is set in production; warn otherwise.
{
  const { active, fatal } = evaluateAuthBypass();
  if (fatal) {
    console.error(
      `\u274C Refusing to boot: auth-disabling flag(s) set in production: ${active.join(', ')}. ` +
        `Authentication cannot be disabled in production.`,
    );
    process.exit(1);
  } else if (active.length > 0) {
    console.warn(
      `\u26A0\uFE0F  AUTH BYPASS ACTIVE via ${active.join(', ')} \u2014 non-production only. NEVER set this in production.`,
    );
  }
}

// Fallback: allow AI_INTEGRATIONS_OPENAI_API_KEY as alias
if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
}

export const config = {
  // Required
  databaseUrl: process.env.DATABASE_URL!,
  sessionSecret: process.env.SESSION_SECRET!,

  // App
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Optional integrations
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  getResponseApiKey: process.env.GETRESPONSE_API_KEY || '',
  tecdocApiKey: process.env.TECDOC_API_KEY || '',
  tecdocApiUrl: process.env.TECDOC_API_URL || '',
  zatcaApiUrl: process.env.ZATCA_API_URL || '',
  zatcaCsid: process.env.ZATCA_CSID || '',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
} as const;

/**
 * Surface which optional integrations are unconfigured at boot so silent
 * "dummy"/"empty" defaults don't hide degraded behaviour. Skipped in test
 * runs to keep CI logs quiet.
 */
const INTEGRATION_FEATURE_FLAGS: Array<{ key: string; feature: string }> = [
  { key: 'stripeSecretKey',      feature: 'Stripe payments'         },
  { key: 'openaiApiKey',         feature: 'OpenAI-powered features (AI chat, predictions)' },
  { key: 'twilioAccountSid',     feature: 'Twilio SMS notifications' },
  { key: 'getResponseApiKey',    feature: 'GetResponse email campaigns' },
  { key: 'tecdocApiKey',         feature: 'TecDoc parts catalog'    },
  { key: 'zatcaApiUrl',          feature: 'ZATCA e-invoicing'       },
];

if (process.env.NODE_ENV !== 'test') {
  const disabled = INTEGRATION_FEATURE_FLAGS.filter(({ key }) => !(config as any)[key]);
  if (disabled.length > 0) {
    console.warn(`⚠️  Disabled integrations (${disabled.length}/${INTEGRATION_FEATURE_FLAGS.length}):`);
    for (const { feature } of disabled) {
      console.warn(`   • ${feature}`);
    }
    console.warn(`   Routes that depend on these will return mock data or 503.`);
  }
}
