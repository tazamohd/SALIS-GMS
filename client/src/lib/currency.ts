// Currency formatting utilities - Saudi Arabia focused with GCC support

export interface CurrencyConfig {
  code: string;
  symbol: string;
  nameEn: string;
  nameAr: string;
  decimals: number;
  locale?: string;
  country: string;
}

// Main currency is SAR (Saudi Riyal) with GCC and international options
export const CURRENCIES: Record<string, CurrencyConfig> = {
  // Primary - Saudi Arabia
  SAR: { code: 'SAR', symbol: 'ر.س', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', decimals: 2, locale: 'ar-SA', country: 'Saudi Arabia' },
  
  // GCC Countries
  AED: { code: 'AED', symbol: 'د.إ', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', decimals: 2, locale: 'ar-AE', country: 'UAE' },
  BHD: { code: 'BHD', symbol: 'د.ب', nameEn: 'Bahraini Dinar', nameAr: 'دينار بحريني', decimals: 3, locale: 'ar-BH', country: 'Bahrain' },
  KWD: { code: 'KWD', symbol: 'د.ك', nameEn: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', decimals: 3, locale: 'ar-KW', country: 'Kuwait' },
  OMR: { code: 'OMR', symbol: 'ر.ع', nameEn: 'Omani Rial', nameAr: 'ريال عماني', decimals: 3, locale: 'ar-OM', country: 'Oman' },
  QAR: { code: 'QAR', symbol: 'ر.ق', nameEn: 'Qatari Riyal', nameAr: 'ريال قطري', decimals: 2, locale: 'ar-QA', country: 'Qatar' },
  
  // International
  USD: { code: 'USD', symbol: '$', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', decimals: 2, locale: 'en-US', country: 'USA' },
  EUR: { code: 'EUR', symbol: '€', nameEn: 'Euro', nameAr: 'يورو', decimals: 2, locale: 'de-DE', country: 'EU' },
  GBP: { code: 'GBP', symbol: '£', nameEn: 'British Pound', nameAr: 'جنيه إسترليني', decimals: 2, locale: 'en-GB', country: 'UK' },
};

// Exchange rates relative to SAR (Saudi Riyal as base)
const EXCHANGE_RATES: Record<string, number> = {
  SAR: 1,
  AED: 0.98,      // 1 SAR ≈ 0.98 AED
  BHD: 0.10,      // 1 SAR ≈ 0.10 BHD
  KWD: 0.082,     // 1 SAR ≈ 0.082 KWD
  OMR: 0.103,     // 1 SAR ≈ 0.103 OMR
  QAR: 0.97,      // 1 SAR ≈ 0.97 QAR
  USD: 0.27,      // 1 SAR ≈ 0.27 USD
  EUR: 0.25,      // 1 SAR ≈ 0.25 EUR
  GBP: 0.21,      // 1 SAR ≈ 0.21 GBP
};

// Default currency is SAR
export const DEFAULT_CURRENCY = 'SAR';

/**
 * Format amount in the specified currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.SAR;
  
  try {
    const formatter = new Intl.NumberFormat(currency.locale || 'ar-SA', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
      ...options,
    });
    return formatter.format(amount);
  } catch {
    // Fallback formatting
    return `${currency.symbol} ${amount.toFixed(currency.decimals)}`;
  }
}

/**
 * Format amount with symbol only (shorter format)
 */
export function formatCurrencyShort(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.SAR;
  return `${currency.symbol} ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals 
  })}`;
}

/**
 * Convert amount from one currency to another (SAR as base)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to SAR first, then to target currency
  const sarAmount = amount / fromRate;
  return sarAmount * toRate;
}

/**
 * Format and convert currency
 */
export function formatAndConvertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  options?: Intl.NumberFormatOptions
): string {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(convertedAmount, toCurrency, options);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and formatting (including Arabic)
  const cleaned = currencyString
    .replace(/[^\d.-]/g, '')
    .replace(/,/g, '');
  
  return parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.symbol || 'ر.س';
}

/**
 * Get currency display name
 */
export function getCurrencyName(currencyCode: string, language: 'en' | 'ar' = 'en'): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return currencyCode;
  return language === 'ar' ? currency.nameAr : currency.nameEn;
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}

/**
 * Get GCC currencies only
 */
export function getGCCCurrencies(): CurrencyConfig[] {
  return ['SAR', 'AED', 'BHD', 'KWD', 'OMR', 'QAR'].map(code => CURRENCIES[code]);
}

/**
 * Hook to get user's currency settings
 */
export async function getUserCurrency(): Promise<string> {
  try {
    const response = await fetch('/api/settings');
    const data = await response.json();
    return data.currency || DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

// Payment method types for Saudi Arabia
export interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  type: 'card' | 'bank' | 'wallet' | 'local';
  icon: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  // Local Saudi Payment Methods
  { id: 'mada', name: 'Mada', nameAr: 'مدى', type: 'local', icon: 'mada', enabled: true },
  { id: 'stc_pay', name: 'STC Pay', nameAr: 'إس تي سي باي', type: 'wallet', icon: 'stc', enabled: true },
  { id: 'stc_bank', name: 'STC Bank', nameAr: 'بنك إس تي سي', type: 'bank', icon: 'stc_bank', enabled: true },
  
  // International Cards
  { id: 'visa', name: 'Visa', nameAr: 'فيزا', type: 'card', icon: 'visa', enabled: true },
  { id: 'mastercard', name: 'Mastercard', nameAr: 'ماستركارد', type: 'card', icon: 'mastercard', enabled: true },
  { id: 'amex', name: 'American Express', nameAr: 'أمريكان إكسبريس', type: 'card', icon: 'amex', enabled: true },
  
  // Bank Transfer
  { id: 'bank_transfer', name: 'Bank Transfer', nameAr: 'تحويل بنكي', type: 'bank', icon: 'bank', enabled: true },
  
  // Other Wallets
  { id: 'apple_pay', name: 'Apple Pay', nameAr: 'آبل باي', type: 'wallet', icon: 'apple', enabled: true },
];

export function getPaymentMethods(type?: PaymentMethod['type']): PaymentMethod[] {
  if (type) {
    return PAYMENT_METHODS.filter(m => m.type === type && m.enabled);
  }
  return PAYMENT_METHODS.filter(m => m.enabled);
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(m => m.id === id);
}
