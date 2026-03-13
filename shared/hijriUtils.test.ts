import { describe, it, expect } from 'vitest';
import { gregorianToHijri, formatHijriDate, getHijriMonthName, formatDualCalendar } from './hijriUtils';

describe('Gregorian to Hijri Conversion', () => {
  it('should return a valid HijriDate object', () => {
    const date = new Date('2025-10-30');
    const hijri = gregorianToHijri(date);
    expect(hijri).toHaveProperty('day');
    expect(hijri).toHaveProperty('month');
    expect(hijri).toHaveProperty('year');
    expect(hijri).toHaveProperty('monthName');
    expect(hijri).toHaveProperty('monthNameArabic');
  });

  it('should return a year in the 1440-1460 range for 2020-2040 dates', () => {
    const date = new Date('2025-01-15');
    const hijri = gregorianToHijri(date);
    expect(hijri.year).toBeGreaterThanOrEqual(1440);
    expect(hijri.year).toBeLessThanOrEqual(1460);
  });

  it('should return month between 1 and 12', () => {
    const hijri = gregorianToHijri(new Date('2025-06-15'));
    expect(hijri.month).toBeGreaterThanOrEqual(1);
    expect(hijri.month).toBeLessThanOrEqual(12);
  });

  it('should return day between 1 and 30', () => {
    const hijri = gregorianToHijri(new Date('2025-03-20'));
    expect(hijri.day).toBeGreaterThanOrEqual(1);
    expect(hijri.day).toBeLessThanOrEqual(30);
  });
});

describe('Format Hijri Date', () => {
  it('should format in English by default', () => {
    const hijri = { day: 15, month: 9, year: 1446, monthName: 'Ramadan', monthNameArabic: 'رمضان' };
    const formatted = formatHijriDate(hijri);
    expect(formatted).toContain('Ramadan');
    expect(formatted).toContain('AH');
  });

  it('should format in Arabic when locale is ar', () => {
    const hijri = { day: 15, month: 9, year: 1446, monthName: 'Ramadan', monthNameArabic: 'رمضان' };
    const formatted = formatHijriDate(hijri, 'ar');
    expect(formatted).toContain('رمضان');
    expect(formatted).toContain('هـ');
  });
});

describe('Get Hijri Month Name', () => {
  it('should return Muharram for month 1', () => {
    expect(getHijriMonthName(1)).toBe('Muharram');
  });

  it('should return Dhul-Hijjah for month 12', () => {
    expect(getHijriMonthName(12)).toBe('Dhul-Hijjah');
  });

  it('should throw for invalid month number', () => {
    expect(() => getHijriMonthName(0)).toThrow();
    expect(() => getHijriMonthName(13)).toThrow();
  });

  it('should return Arabic name when locale is ar', () => {
    expect(getHijriMonthName(9, 'ar')).toBe('رمضان');
  });
});

describe('Format Dual Calendar', () => {
  it('should contain both Gregorian and Hijri dates', () => {
    const result = formatDualCalendar(new Date('2025-10-30'));
    expect(result).toContain('(');
    expect(result).toContain('AH');
  });
});
