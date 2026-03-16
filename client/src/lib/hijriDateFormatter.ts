/**
 * SALIS AUTO - Client-side Hijri Date Formatter
 * Wraps shared/hijriUtils for React components with Hijri-first display.
 */

import { gregorianToHijri, formatHijriDate, getCurrentHijriDate, isRamadan, getHijriMonthName } from '../../../shared/hijriUtils';

/** Format a date as Hijri-first: "14 Sha'ban 1447 / 16 Mar 2026" */
export function formatHijriFirst(date: Date): string {
  const hijri = gregorianToHijri(date);
  const hijriStr = `${hijri.day} ${hijri.monthName} ${hijri.year}`;
  const gregStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${hijriStr} / ${gregStr}`;
}

/** Format a date as Hijri-first with Arabic month: "١٤ شعبان ١٤٤٧ / 16 Mar 2026" */
export function formatHijriFirstArabic(date: Date): string {
  const hijri = gregorianToHijri(date);
  const hijriStr = `${hijri.day} ${hijri.monthNameArabic} ${hijri.year}`;
  const gregStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${hijriStr} / ${gregStr}`;
}

/** Get today's Hijri date info for display */
export function getTodayHijri() {
  const hijri = getCurrentHijriDate();
  return {
    ...hijri,
    isRamadan: isRamadan(),
    formatted: formatHijriFirst(new Date()),
    formattedArabic: formatHijriFirstArabic(new Date()),
  };
}

/** Format just the Hijri part: "14 Sha'ban 1447" */
export function formatHijriOnly(date: Date): string {
  const hijri = gregorianToHijri(date);
  return `${hijri.day} ${hijri.monthName} ${hijri.year}`;
}

export { gregorianToHijri, getCurrentHijriDate, isRamadan, getHijriMonthName };
