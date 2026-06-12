/**
 * Language detection helpers shared between client and server.
 *
 * Used to route Arabic-language support requests to a dedicated Arabic
 * support agent (and, when none is available, to an Arabic-speaking AI
 * assistant). A request is treated as Arabic when ANY of the available
 * signals indicate Arabic:
 *   1. The active UI locale at the time the request was made (e.g. "ar").
 *   2. The customer's stored language preference on their profile.
 *   3. The actual text the customer typed containing Arabic script.
 */

/** Canonical role string for the dedicated Arabic support agent. */
export const ARABIC_SUPPORT_ROLE = "arabic_support_agent";

/**
 * Matches any character in the core Arabic Unicode blocks (Arabic,
 * Arabic Supplement, Arabic Extended-A, and Arabic Presentation Forms).
 */
const ARABIC_SCRIPT_REGEX =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** Returns true if a locale/language code refers to Arabic (e.g. "ar", "ar-SA"). */
export function isArabicLocale(locale?: string | null): boolean {
  if (!locale) return false;
  return locale.trim().toLowerCase().startsWith("ar");
}

/** Returns true if the given text contains any Arabic-script characters. */
export function containsArabic(text?: string | null): boolean {
  if (!text) return false;
  return ARABIC_SCRIPT_REGEX.test(text);
}

export interface ArabicDetectionSignals {
  /** The active UI locale when the request was created (e.g. "ar"). */
  locale?: string | null;
  /** The customer's stored language preference (e.g. "ar"). */
  profileLanguage?: string | null;
  /** Free-text the customer typed (subject, first message, etc.). */
  text?: string | null;
}

/**
 * Returns true when any available signal indicates the request is in Arabic.
 * Each signal is optional; callers pass whatever they have.
 */
export function detectArabicRequest(signals: ArabicDetectionSignals): boolean {
  return (
    isArabicLocale(signals.locale) ||
    isArabicLocale(signals.profileLanguage) ||
    containsArabic(signals.text)
  );
}
