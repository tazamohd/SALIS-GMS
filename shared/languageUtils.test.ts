import { describe, it, expect } from 'vitest';
import {
  isArabicLocale,
  containsArabic,
  detectArabicRequest,
  ARABIC_SUPPORT_ROLE,
} from './languageUtils';

describe('isArabicLocale', () => {
  it('matches Arabic locale codes', () => {
    expect(isArabicLocale('ar')).toBe(true);
    expect(isArabicLocale('ar-SA')).toBe(true);
    expect(isArabicLocale('AR')).toBe(true);
  });

  it('rejects non-Arabic or empty locales', () => {
    expect(isArabicLocale('en')).toBe(false);
    expect(isArabicLocale('en-US')).toBe(false);
    expect(isArabicLocale('')).toBe(false);
    expect(isArabicLocale(null)).toBe(false);
    expect(isArabicLocale(undefined)).toBe(false);
  });
});

describe('containsArabic', () => {
  it('detects Arabic script in text', () => {
    expect(containsArabic('مرحبا، سيارتي تحتاج صيانة')).toBe(true);
    expect(containsArabic('Hello مرحبا')).toBe(true);
  });

  it('returns false for non-Arabic text', () => {
    expect(containsArabic('My car needs service')).toBe(false);
    expect(containsArabic('12345')).toBe(false);
    expect(containsArabic('')).toBe(false);
    expect(containsArabic(null)).toBe(false);
  });
});

describe('detectArabicRequest', () => {
  it('detects via UI locale', () => {
    expect(detectArabicRequest({ locale: 'ar' })).toBe(true);
  });

  it('detects via profile language preference', () => {
    expect(detectArabicRequest({ profileLanguage: 'ar' })).toBe(true);
  });

  it('detects via Arabic message content', () => {
    expect(detectArabicRequest({ locale: 'en', text: 'سيارتي لا تعمل' })).toBe(true);
  });

  it('returns false when no signal indicates Arabic', () => {
    expect(
      detectArabicRequest({ locale: 'en', profileLanguage: 'en', text: 'Brake issue' })
    ).toBe(false);
    expect(detectArabicRequest({})).toBe(false);
  });
});

describe('ARABIC_SUPPORT_ROLE', () => {
  it('is the canonical role string', () => {
    expect(ARABIC_SUPPORT_ROLE).toBe('arabic_support_agent');
  });
});
