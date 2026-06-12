// Hijri Calendar Utilities for Saudi Arabia
// Islamic (Hijri) calendar conversion and formatting

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameArabic: string;
}

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'
];

const HIJRI_MONTHS_ARABIC = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

/**
 * Convert Gregorian date to Hijri date
 * Using the Umm al-Qura calendar algorithm (used in Saudi Arabia)
 * 
 * Note: This is a simplified conversion. For production use in Saudi Arabia,
 * consider using a library like 'hijri-converter' or API from ummalqura.org
 * 
 * @param gregorianDate - Gregorian date
 * @returns Hijri date object
 */
export function gregorianToHijri(gregorianDate: Date): HijriDate {
  // Simplified Hijri conversion (Kuwaiti algorithm approximation)
  // For accurate Saudi calendar, integrate with official Umm al-Qura API
  
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();
  
  // Calculate Julian Day Number
  const jdn = Math.floor((1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12))) / 4) +
            Math.floor((367 * (gMonth - 2 - 12 * Math.floor((gMonth - 14) / 12))) / 12) -
            Math.floor((3 * Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100)) / 4) +
            gDay - 32075;
  
  // Hijri epoch adjustment
  const hijriEpoch = 1948440;
  const daysSinceHijriEpoch = jdn - hijriEpoch;
  
  // Approximate Hijri year (354.36708 days per year)
  const hYear = Math.floor(daysSinceHijriEpoch / 354.36708) + 1;
  
  // Calculate remaining days to find month and day
  const yearStart = Math.floor((hYear - 1) * 354.36708);
  const daysIntoYear = daysSinceHijriEpoch - yearStart;
  
  // Approximate month (29.53059 days per month)
  const hMonth = Math.min(Math.floor(daysIntoYear / 29.53059) + 1, 12);
  
  const monthStart = Math.floor((hMonth - 1) * 29.53059);
  const hDay = Math.floor(daysIntoYear - monthStart) + 1;
  
  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthName: HIJRI_MONTHS[hMonth - 1],
    monthNameArabic: HIJRI_MONTHS_ARABIC[hMonth - 1],
  };
}

/**
 * Format Hijri date for display
 * @param hijriDate - Hijri date object
 * @param locale - 'en' or 'ar'
 * @returns Formatted date string
 */
export function formatHijriDate(hijriDate: HijriDate, locale: 'en' | 'ar' = 'en'): string {
  if (locale === 'ar') {
    return `${hijriDate.day} ${hijriDate.monthNameArabic} ${hijriDate.year} هـ`;
  }
  return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`;
}

/**
 * Get current Hijri date
 * @returns Current Hijri date
 */
export function getCurrentHijriDate(): HijriDate {
  return gregorianToHijri(new Date());
}

/**
 * Check if current month is Ramadan
 * @returns boolean
 */
export function isRamadan(): boolean {
  const hijri = getCurrentHijriDate();
  return hijri.month === 9; // Ramadan is the 9th month
}

/**
 * Get Hijri month name
 * @param monthNumber - Month number (1-12)
 * @param locale - 'en' or 'ar'
 * @returns Month name
 */
export function getHijriMonthName(monthNumber: number, locale: 'en' | 'ar' = 'en'): string {
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error('Month number must be between 1 and 12');
  }
  
  if (locale === 'ar') {
    return HIJRI_MONTHS_ARABIC[monthNumber - 1];
  }
  return HIJRI_MONTHS[monthNumber - 1];
}

/**
 * Format date with both Gregorian and Hijri
 * @param date - Gregorian date
 * @param locale - 'en' or 'ar'
 * @returns Dual calendar format
 */
export function formatDualCalendar(date: Date, locale: 'en' | 'ar' = 'en'): string {
  const gregorian = date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
  const hijri = formatHijriDate(gregorianToHijri(date), locale);
  
  if (locale === 'ar') {
    return `${gregorian} (${hijri})`;
  }
  return `${gregorian} (${hijri})`;
}
