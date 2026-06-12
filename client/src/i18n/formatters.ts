/**
 * Fluent-inspired inline formatters for i18next.
 *
 * Project Fluent (https://projectfluent.org) lets translators reference
 * locale-aware formatters *inside* a message, e.g.
 *
 *   total = You owe { NUMBER($amount, style: "currency", currency: "SAR") }
 *
 * react-i18next has no equivalent for our domain-specific formatters out of
 * the box (Saudi currency rules, the Umm al-Qura Hijri calendar). This module
 * borrows that idea: it registers named formatters so translation strings can
 * embed locale-correct currency, numbers and Hijri/Gregorian dates without the
 * calling component pre-formatting and concatenating strings.
 *
 * Usage in a translation value:
 *   "invoice.total": "Total due: {{amount, sar}}"
 *   "invoice.totalIn": "Total due: {{amount, currency(currency: AED)}}"
 *   "report.generatedOn": "Generated on {{date, hijri}}"
 *   "stats.visits": "{{value, number}} visits"
 *
 * and from a component:
 *   t('invoice.total', { amount: 1500 })
 *   t('report.generatedOn', { date: new Date() })
 */

import type { i18n as I18nInstance } from 'i18next';
import { formatCurrency, CURRENCIES, DEFAULT_CURRENCY } from '../lib/currency';
import { formatHijriFirst, formatHijriFirstArabic, formatHijriOnly } from '../lib/hijriDateFormatter';

/** Map an i18next language code to a full BCP-47 locale for Intl. */
function resolveLocale(lng: string | undefined): string {
  if (!lng) return 'en-US';
  // Arabic content in this app targets Saudi Arabia.
  if (lng === 'ar') return 'ar-SA';
  return lng;
}

/** Recognised Intl.DateTimeFormat option keys (i18next mixes t() values into options). */
const DATETIME_OPTION_KEYS = [
  'dateStyle', 'timeStyle', 'weekday', 'era', 'year', 'month', 'day',
  'hour', 'minute', 'second', 'fractionalSecondDigits', 'dayPeriod',
  'timeZoneName', 'hour12', 'hourCycle', 'calendar', 'numberingSystem',
  'timeZone', 'formatMatcher',
] as const;

/** Coerce an interpolation value into a Date, tolerating ISO strings/timestamps. */
function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Register all Fluent-inspired formatters onto an i18next instance.
 *
 * Safe to call once after `i18n.init()`. Each formatter receives
 * `(value, lng, options)` where `options` carries any inline format params
 * (e.g. `currency(currency: AED)` -> `options.currency === 'AED'`).
 */
export function registerFluentFormatters(i18n: I18nInstance): void {
  const formatter = i18n.services?.formatter;
  if (!formatter) {
    // Formatter service only exists after init; guard so this never throws.
    return;
  }

  /**
   * Currency, defaulting to SAR. Mirrors Fluent's
   * `NUMBER($v, style: "currency", currency: "…")`.
   *   {{amount, sar}}                       -> Saudi Riyal
   *   {{amount, currency(currency: AED)}}   -> any supported currency
   */
  const currencyFormatter = (value: unknown, _lng: string | undefined, options: Record<string, unknown> = {}) => {
    const amount = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(amount)) return String(value ?? '');
    const code = typeof options.currency === 'string' && CURRENCIES[options.currency]
      ? options.currency
      : DEFAULT_CURRENCY;
    return formatCurrency(amount, code);
  };
  formatter.add('currency', currencyFormatter);
  // Convenience alias for the primary market currency.
  formatter.add('sar', (value, lng, options = {}) =>
    currencyFormatter(value, lng, { ...options, currency: 'SAR' }));

  /**
   * Locale-aware decimal number. Mirrors Fluent's `NUMBER($v)`.
   *   {{value, number}}
   *   {{value, number(maximumFractionDigits: 1)}}
   */
  formatter.add('number', (value, lng, options = {}) => {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return String(value ?? '');
    try {
      return new Intl.NumberFormat(resolveLocale(lng), options as Intl.NumberFormatOptions).format(num);
    } catch {
      return String(num);
    }
  });

  /**
   * Percentage. Expects a ratio (0.15 -> "15%").
   *   {{value, percent}}
   */
  formatter.add('percent', (value, lng) => {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return String(value ?? '');
    try {
      return new Intl.NumberFormat(resolveLocale(lng), { style: 'percent', maximumFractionDigits: 2 }).format(num);
    } catch {
      return `${(num * 100).toFixed(0)}%`;
    }
  });

  /**
   * Gregorian date/time. Mirrors Fluent's `DATETIME($d, …)`.
   *   {{date, datetime}}
   *   {{date, datetime(dateStyle: medium; timeStyle: short)}}
   */
  formatter.add('datetime', (value, lng, options = {}) => {
    const date = toDate(value);
    if (!date) return String(value ?? '');
    // i18next merges the t() values into `options`, so we cannot pass the whole
    // object to Intl — pick only recognised DateTimeFormat keys, and default to
    // a medium date when the message specifies no format params.
    const opts: Intl.DateTimeFormatOptions = {};
    for (const key of DATETIME_OPTION_KEYS) {
      if (key in options) (opts as Record<string, unknown>)[key] = options[key];
    }
    if (Object.keys(opts).length === 0) opts.dateStyle = 'medium';
    try {
      return new Intl.DateTimeFormat(resolveLocale(lng), opts).format(date);
    } catch {
      return date.toLocaleString();
    }
  });

  /**
   * Hijri (Umm al-Qura) calendar, the Saudi civil calendar. No Fluent/Intl
   * built-in covers our dual-calendar display, so this bridges the existing
   * Hijri utilities into the message layer.
   *   {{date, hijri}}              -> "14 Sha'ban 1447 / 16 Mar 2026" (en)
   *                                    "١٤ شعبان ١٤٤٧ / 16 Mar 2026" (ar)
   *   {{date, hijri(mode: only)}}  -> "14 Sha'ban 1447"
   */
  formatter.add('hijri', (value, lng, options = {}) => {
    const date = toDate(value);
    if (!date) return String(value ?? '');
    if (options.mode === 'only') return formatHijriOnly(date);
    return lng === 'ar' ? formatHijriFirstArabic(date) : formatHijriFirst(date);
  });
}
