/**
 * Tests for the Fluent-inspired i18n enhancements:
 *  - inline formatters (currency / number / percent / datetime / hijri)
 *  - CLDR plural categories (English 2-form, Arabic 6-form)
 *  - gender selection via i18next `context`
 *
 * Each test builds an isolated i18next instance so we don't depend on the
 * browser-only side effects in config.ts (localStorage, document.dir).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createInstance, type i18n as I18nInstance } from 'i18next';
import { registerFluentFormatters } from './formatters';
import { formatCurrency } from '../lib/currency';
import { formatHijriFirst, formatHijriFirstArabic, formatHijriOnly } from '../lib/hijriDateFormatter';

const enFixture = {
  invoice: {
    sar: 'Total due: {{amount, sar}}',
    aed: 'Total due: {{amount, currency(currency: AED)}}',
  },
  stats: {
    visits: '{{value, number}} visits',
    growth: 'Up {{value, percent}}',
  },
  report: {
    gregorian: 'Generated on {{date, datetime}}',
    hijri: 'Generated on {{date, hijri}}',
    hijriOnly: 'Generated on {{date, hijri(mode: only)}}',
  },
  count: {
    vehicles_one: '{{count}} vehicle',
    vehicles_other: '{{count}} vehicles',
  },
  greeting: {
    welcome: 'Welcome, {{name}}',
    welcome_male: 'Welcome, Mr. {{name}}',
    welcome_female: 'Welcome, Ms. {{name}}',
  },
};

const arFixture = {
  invoice: {
    sar: 'المبلغ المستحق: {{amount, sar}}',
    hijri: 'صدر بتاريخ {{date, hijri}}',
  },
  count: {
    vehicles_zero: 'لا توجد مركبات',
    vehicles_one: 'مركبة واحدة',
    vehicles_two: 'مركبتان',
    vehicles_few: '{{count}} مركبات',
    vehicles_many: '{{count}} مركبة',
    vehicles_other: '{{count}} مركبة',
  },
};

async function makeInstance(): Promise<I18nInstance> {
  const i18n = createInstance();
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: enFixture },
      ar: { translation: arFixture },
    },
    interpolation: { escapeValue: false },
  });
  registerFluentFormatters(i18n);
  return i18n;
}

describe('Fluent-inspired inline formatters', () => {
  let i18n: I18nInstance;
  beforeAll(async () => {
    i18n = await makeInstance();
  });

  it('formats SAR currency via the {{amount, sar}} formatter', () => {
    const result = i18n.t('invoice.sar', { amount: 1500 });
    // Should equal the library's own currency formatting, embedded in the message.
    expect(result).toBe(`Total due: ${formatCurrency(1500, 'SAR')}`);
  });

  it('formats an arbitrary currency via currency(currency: AED)', () => {
    const result = i18n.t('invoice.aed', { amount: 1500 });
    expect(result).toBe(`Total due: ${formatCurrency(1500, 'AED')}`);
  });

  it('formats numbers with locale grouping', () => {
    expect(i18n.t('stats.visits', { value: 12500 })).toBe('12,500 visits');
  });

  it('formats a ratio as a percentage', () => {
    expect(i18n.t('stats.growth', { value: 0.15 })).toBe('Up 15%');
  });

  it('formats a Gregorian date inline', () => {
    const date = new Date('2026-03-16T10:00:00Z');
    const expected = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
    expect(i18n.t('report.gregorian', { date })).toBe(`Generated on ${expected}`);
  });

  it('formats a Hijri date inline (English month names)', () => {
    const date = new Date('2026-03-16T10:00:00Z');
    expect(i18n.t('report.hijri', { date })).toBe(`Generated on ${formatHijriFirst(date)}`);
  });

  it('supports hijri(mode: only)', () => {
    const date = new Date('2026-03-16T10:00:00Z');
    expect(i18n.t('report.hijriOnly', { date })).toBe(`Generated on ${formatHijriOnly(date)}`);
  });

  it('uses Arabic month names for the hijri formatter under the ar locale', async () => {
    await i18n.changeLanguage('ar');
    const date = new Date('2026-03-16T10:00:00Z');
    expect(i18n.t('invoice.hijri', { date })).toBe(`صدر بتاريخ ${formatHijriFirstArabic(date)}`);
    await i18n.changeLanguage('en');
  });

  it('falls back to the raw value for non-numeric currency input', () => {
    expect(i18n.t('invoice.sar', { amount: 'n/a' })).toBe('Total due: n/a');
  });
});

describe('CLDR plural categories (Fluent select-on-count)', () => {
  let i18n: I18nInstance;
  beforeAll(async () => {
    i18n = await makeInstance();
  });

  it('selects English one/other correctly', () => {
    expect(i18n.t('count.vehicles', { count: 1 })).toBe('1 vehicle');
    expect(i18n.t('count.vehicles', { count: 5 })).toBe('5 vehicles');
  });

  it('selects all six Arabic plural categories', async () => {
    await i18n.changeLanguage('ar');
    // Arabic CLDR: 0=zero, 1=one, 2=two, 3-10=few, 11-99=many, 100+=other
    expect(i18n.t('count.vehicles', { count: 0 })).toBe('لا توجد مركبات');
    expect(i18n.t('count.vehicles', { count: 1 })).toBe('مركبة واحدة');
    expect(i18n.t('count.vehicles', { count: 2 })).toBe('مركبتان');
    expect(i18n.t('count.vehicles', { count: 3 })).toBe('3 مركبات');
    expect(i18n.t('count.vehicles', { count: 11 })).toBe('11 مركبة');
    expect(i18n.t('count.vehicles', { count: 100 })).toBe('100 مركبة');
    await i18n.changeLanguage('en');
  });
});

describe('Gender selection via context (Fluent SELECT)', () => {
  let i18n: I18nInstance;
  beforeAll(async () => {
    i18n = await makeInstance();
  });

  it('picks the gendered variant, falling back to the default (Fluent *)', () => {
    expect(i18n.t('greeting.welcome', { context: 'male', name: 'Ali' })).toBe('Welcome, Mr. Ali');
    expect(i18n.t('greeting.welcome', { context: 'female', name: 'Sara' })).toBe('Welcome, Ms. Sara');
    // Unknown context falls back to the base key — the default variant.
    expect(i18n.t('greeting.welcome', { context: 'unknown', name: 'Sam' })).toBe('Welcome, Sam');
    // No context at all also resolves to the default.
    expect(i18n.t('greeting.welcome', { name: 'Sam' })).toBe('Welcome, Sam');
  });
});
