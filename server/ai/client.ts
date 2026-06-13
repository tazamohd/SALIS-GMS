import OpenAI from "openai";

/**
 * Single shared OpenAI client for the whole server.
 *
 * Every AI call site imports `openai` from here so there is exactly one place
 * that constructs the client and one place to configure routing. Because the
 * base URL is env-driven, pointing `AI_INTEGRATIONS_OPENAI_BASE_URL` at any
 * OpenAI-compatible proxy (e.g. a Headroom context-compression proxy)
 * transparently routes every AI request through it with no code changes.
 *
 * This is using Replit's AI Integrations service by default, which provides
 * OpenAI-compatible access without requiring your own OpenAI API key.
 */

// True only when both the base URL and key are present. Call sites guard on
// this to return deterministic fallbacks when AI is not configured.
export const AI_AVAILABLE = !!(
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL &&
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY
);

if (!AI_AVAILABLE) {
  console.warn(
    "⚠️  OpenAI credentials not found. AI features will return mock/fallback responses."
  );
}

// The placeholder key keeps the SDK from throwing at construction time when the
// integration is unconfigured (e.g. the test suite booting the full route
// tree); call sites guard on AI_AVAILABLE before issuing requests.
export const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "not-configured",
});

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export const AI_MODEL = "gpt-5";
export const AI_MAX_TOKENS = 8192;
