// Saudi Arabia VAT Calculation Utilities
// VAT Rate: 15% (standard rate in Saudi Arabia)
// TRN Format: 15-digit Tax Registration Number

export const SAUDI_VAT_RATE = 0.15; // 15%
export const ZAKAT_RATE = 0.025; // 2.5%

export interface VATCalculation {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatRate: number;
}

export interface ZakatCalculation {
  zakatableAmount: number;
  zakatAmount: number;
  zakatRate: number;
}

/**
 * Calculate VAT from subtotal
 * @param subtotal - Amount before VAT
 * @param vatRate - VAT rate (default 15% for Saudi Arabia)
 * @returns VATCalculation object with subtotal, VAT amount, and total
 */
export function calculateVAT(
  subtotal: number,
  vatRate: number = SAUDI_VAT_RATE
): VATCalculation {
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    vatRate,
  };
}

/**
 * Calculate subtotal from total (reverse VAT)
 * @param total - Total amount including VAT
 * @param vatRate - VAT rate (default 15% for Saudi Arabia)
 * @returns VATCalculation object
 */
export function reverseVAT(
  total: number,
  vatRate: number = SAUDI_VAT_RATE
): VATCalculation {
  const subtotal = total / (1 + vatRate);
  const vatAmount = total - subtotal;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    vatRate,
  };
}

/**
 * Calculate Zakat (Islamic tax) on zakatable assets
 * @param zakatableAmount - Total zakatable wealth/assets
 * @param zakatRate - Zakat rate (default 2.5%)
 * @returns ZakatCalculation object
 */
export function calculateZakat(
  zakatableAmount: number,
  zakatRate: number = ZAKAT_RATE
): ZakatCalculation {
  const zakatAmount = zakatableAmount * zakatRate;

  return {
    zakatableAmount: parseFloat(zakatableAmount.toFixed(2)),
    zakatAmount: parseFloat(zakatAmount.toFixed(2)),
    zakatRate,
  };
}

/**
 * Validate Saudi TRN (Tax Registration Number)
 * Format: 15 digits
 * @param trn - Tax Registration Number
 * @returns boolean indicating if TRN is valid
 */
export function validateTRN(trn: string): boolean {
  // TRN should be exactly 15 digits
  const trnRegex = /^\d{15}$/;
  return trnRegex.test(trn);
}

/**
 * Format TRN for display (adds spaces for readability)
 * @param trn - Tax Registration Number
 * @returns Formatted TRN (e.g., "300 1234 5678 90123")
 */
export function formatTRN(trn: string): string {
  if (!validateTRN(trn)) return trn;
  
  // Format as: 300 1234 5678 90123
  return `${trn.slice(0, 3)} ${trn.slice(3, 7)} ${trn.slice(7, 11)} ${trn.slice(11)}`;
}

/**
 * Calculate invoice breakdown with VAT
 * @param items - Array of line items with amount
 * @param vatRate - VAT rate (default 15%)
 * @returns Detailed breakdown
 */
export function calculateInvoiceWithVAT(
  items: Array<{ amount: number }>,
  vatRate: number = SAUDI_VAT_RATE
) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  return calculateVAT(subtotal, vatRate);
}
