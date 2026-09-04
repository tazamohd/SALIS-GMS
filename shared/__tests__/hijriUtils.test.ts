import { describe, it, expect } from 'vitest';
import { gregorianToHijri, formatHijriDate } from '../hijriUtils';

describe('gregorianToHijri', () => {
  it('returns a valid HijriDate structure', () => {
    const result = gregorianToHijri(new Date(2025, 9, 30)); // Oct 30 2025
    expect(result).toHaveProperty('day');
    expect(result).toHaveProperty('month');
    expect(result).toHaveProperty('year');
    expect(result).toHaveProperty('monthName');
    expect(result).toHaveProperty('monthNameArabic');
  });

  it('produces a year in the 1440s-1450s range for 2020s dates', () => {
    const result = gregorianToHijri(new Date(2025, 0, 1));
    expect(result.year).toBeGreaterThanOrEqual(1440);
    expect(result.year).toBeLessThanOrEqual(1460);
  });

  it('month is between 1 and 12', () => {
    const result = gregorianToHijri(new Date(2025, 5, 15));
    expect(result.month).toBeGreaterThanOrEqual(1);
    expect(result.month).toBeLessThanOrEqual(12);
  });

  it('day is between 1 and 30', () => {
    const result = gregorianToHijri(new Date(2025, 5, 15));
    expect(result.day).toBeGreaterThanOrEqual(1);
    expect(result.day).toBeLessThanOrEqual(30);
  });

  it('returns English month name from the known list', () => {
    const known = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
      'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah',
    ];
    const result = gregorianToHijri(new Date(2025, 3, 10));
    expect(known).toContain(result.monthName);
  });
});

describe('formatHijriDate', () => {
  it('formats in English by default', () => {
    const hijri = gregorianToHijri(new Date(2025, 9, 30));
    const formatted = formatHijriDate(hijri);
    expect(formatted).toMatch(/\d+ \w+.* \d{4}/);
  });

  it('formats in Arabic when locale is ar', () => {
    const hijri = gregorianToHijri(new Date(2025, 9, 30));
    const formatted = formatHijriDate(hijri, 'ar');
    expect(formatted).toBeTruthy();
    expect(formatted.length).toBeGreaterThan(0);
  });
});
