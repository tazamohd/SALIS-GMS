// Currency formatting utilities

export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimals: number;
  locale?: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', decimals: 2, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', decimals: 2, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', decimals: 2, locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0, locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'C$', decimals: 2, locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', decimals: 2, locale: 'en-AU' },
  CHF: { code: 'CHF', symbol: 'CHF', decimals: 2, locale: 'de-CH' },
  CNY: { code: 'CNY', symbol: '¥', decimals: 2, locale: 'zh-CN' },
  INR: { code: 'INR', symbol: '₹', decimals: 2, locale: 'en-IN' },
};

// Exchange rates (mock - in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
};

/**
 * Format amount in the specified currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  const formatter = new Intl.NumberFormat(currency.locale || 'en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    ...options,
  });

  return formatter.format(amount);
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
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
  // Remove currency symbols and formatting
  const cleaned = currencyString
    .replace(/[^\d.-]/g, '')
    .replace(/,/g, '');
  
  return parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.symbol || '$';
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}

/**
 * Hook to get user's currency settings
 */
export async function getUserCurrency(): Promise<string> {
  try {
    const response = await fetch('/api/settings');
    const data = await response.json();
    return data.currency || 'USD';
  } catch {
    return 'USD';
  }
}
