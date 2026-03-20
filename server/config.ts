/**
 * Centralized environment configuration.
 * Validates required vars on import and exports a typed config object.
 */

const REQUIRED = ['DATABASE_URL', 'SESSION_SECRET'] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`\u274C Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in the values.');
  process.exit(1);
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
