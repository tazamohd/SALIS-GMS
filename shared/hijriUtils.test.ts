/**
 * Tests for Saudi Hijri calendar utilities
 *
 * Validates the core date conversion and formatting logic
 * used by the Saudi Arabia localization features.
 */

import { describe, it, expect } from 'vitest';
import {
  gregorianToHijri,
  formatHijriDate,
  getCurrentHijriDate,
  getHijriMonthName,
  formatDualCalendar,
} from './hijriUtils';

describe('gregorianToHijri', () => {
  it('returns a valid Hijri date object', () => {
    const result = gregorianToHijri(new Date('2026-06-27'));
    expect(result).toHaveProperty('day');
    expect(result).toHaveProperty('month');
    expect(result).toHaveProperty('year');
    expect(result).toHaveProperty('monthName');
    expect(result).toHaveProperty('monthNameArabic');
  });

  it('produces a Hijri year close to 1447 for mid-2026', () => {
    const result = gregorianToHijri(new Date('2026-06-27'));
    expect(result.year).toBeGreaterThanOrEqual(1446);
    expect(result.year).toBeLessThanOrEqual(1448);
  });

  it('returns month between 1 and 12', () => {
    const result = gregorianToHijri(new Date('2026-06-27'));
    expect(result.month).toBeGreaterThanOrEqual(1);
    expect(result.month).toBeLessThanOrEqual(12);
  });

  it('returns day between 1 and 30', () => {
    const result = gregorianToHijri(new Date('2026-06-27'));
    expect(result.day).toBeGreaterThanOrEqual(1);
    expect(result.day).toBeLessThanOrEqual(30);
  });
});

describe('formatHijriDate', () => {
  it('formats in English with AH suffix', () => {
    const formatted = formatHijriDate({
      day: 15, month: 5, year: 1447,
      monthName: 'Jumada al-Awwal', monthNameArabic: 'جمادى الأولى',
    }, 'en');
    expect(formatted).toContain('Jumada');
    expect(formatted).toContain('1447');
    expect(formatted).toContain('AH');
  });

  it('formats in Arabic with هـ suffix', () => {
    const formatted = formatHijriDate({
      day: 15, month: 5, year: 1447,
      monthName: 'Jumada al-Awwal', monthNameArabic: 'جمادى الأولى',
    }, 'ar');
    expect(formatted).toContain('جمادى');
    expect(formatted).toContain('1447');
    expect(formatted).toContain('هـ');
  });
});

describe('getCurrentHijriDate', () => {
  it('returns a current Hijri date', () => {
    const hijri = getCurrentHijriDate();
    expect(hijri.year).toBeGreaterThanOrEqual(1446);
    expect(hijri.year).toBeLessThanOrEqual(1450);
  });
});

describe('getHijriMonthName', () => {
  it('returns correct English name for month 1', () => {
    expect(getHijriMonthName(1, 'en')).toBe('Muharram');
  });

  it('returns correct English name for Ramadan (month 9)', () => {
    expect(getHijriMonthName(9, 'en')).toBe('Ramadan');
  });

  it('returns correct Arabic name for month 9 (Ramadan)', () => {
    expect(getHijriMonthName(9, 'ar')).toBe('رمضان');
  });

  it('throws for month 0', () => {
    expect(() => getHijriMonthName(0)).toThrow(/between 1 and 12/);
  });

  it('throws for month 13', () => {
    expect(() => getHijriMonthName(13)).toThrow(/between 1 and 12/);
  });
});

describe('formatDualCalendar', () => {
  it('returns a string with both Gregorian and Hijri components', () => {
    const formatted = formatDualCalendar(new Date('2026-06-27'), 'en');
    expect(formatted).toContain('2026');
    expect(formatted.length).toBeGreaterThan(15);
  });

  it('handles Arabic locale', () => {
    const formatted = formatDualCalendar(new Date('2026-06-27'), 'ar');
    expect(formatted.length).toBeGreaterThan(15);
  });
});