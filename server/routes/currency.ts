import { Router } from 'express';

const router = Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  buyRate: number;
  sellRate: number;
  midRate: number;
  lastUpdated: string;
}

interface CurrencySettings {
  defaultCurrency: string;
  decimalPlaces: number;
  numberFormat: 'en' | 'eu'; // en = 1,234.56 | eu = 1.234,56
  autoConversion: boolean;
}

interface CurrencyTransaction {
  id: number;
  date: string;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  rateUsed: number;
  sarEquivalent: number;
  type: 'invoice' | 'payment' | 'refund' | 'expense';
  reference: string;
  customerName: string;
}

// ---------------------------------------------------------------------------
// Hardcoded exchange rates (SAR base — realistic as of early 2026)
// ---------------------------------------------------------------------------
const exchangeRates: CurrencyRate[] = [
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    flag: '\ud83c\uddf8\ud83c\udde6',
    buyRate: 1.0,
    sellRate: 1.0,
    midRate: 1.0,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    flag: '\ud83c\uddfa\ud83c\uddf8',
    buyRate: 0.2655,
    sellRate: 0.2675,
    midRate: 0.2666,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'EUR',
    name: 'Euro',
    flag: '\ud83c\uddea\ud83c\uddfa',
    buyRate: 0.2430,
    sellRate: 0.2460,
    midRate: 0.2445,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    flag: '\ud83c\uddec\ud83c\udde7',
    buyRate: 0.2090,
    sellRate: 0.2120,
    midRate: 0.2105,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    flag: '\ud83c\udde6\ud83c\uddea',
    buyRate: 0.9790,
    sellRate: 0.9810,
    midRate: 0.9800,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    flag: '\ud83c\uddf0\ud83c\uddfc',
    buyRate: 0.0815,
    sellRate: 0.0830,
    midRate: 0.0822,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'BHD',
    name: 'Bahraini Dinar',
    flag: '\ud83c\udde7\ud83c\udded',
    buyRate: 0.1002,
    sellRate: 0.1012,
    midRate: 0.1007,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'EGP',
    name: 'Egyptian Pound',
    flag: '\ud83c\uddea\ud83c\uddec',
    buyRate: 13.10,
    sellRate: 13.30,
    midRate: 13.20,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
  {
    code: 'JOD',
    name: 'Jordanian Dinar',
    flag: '\ud83c\uddef\ud83c\uddf4',
    buyRate: 0.1885,
    sellRate: 0.1905,
    midRate: 0.1895,
    lastUpdated: '2026-03-20T08:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// In-memory settings
// ---------------------------------------------------------------------------
let currencySettings: CurrencySettings = {
  defaultCurrency: 'SAR',
  decimalPlaces: 2,
  numberFormat: 'en',
  autoConversion: true,
};

// ---------------------------------------------------------------------------
// Sample transactions
// ---------------------------------------------------------------------------
let nextTxId = 11;
const transactions: CurrencyTransaction[] = [
  {
    id: 1, date: '2026-03-19T14:30:00Z', description: 'Full service — Toyota Camry',
    originalAmount: 450.00, originalCurrency: 'USD', rateUsed: 3.7536,
    sarEquivalent: 1689.12, type: 'invoice', reference: 'INV-2026-0412',
    customerName: 'James Wilson',
  },
  {
    id: 2, date: '2026-03-19T11:15:00Z', description: 'Brake pad replacement',
    originalAmount: 320.00, originalCurrency: 'EUR', rateUsed: 4.0816,
    sarEquivalent: 1306.11, type: 'invoice', reference: 'INV-2026-0411',
    customerName: 'Hans Mueller',
  },
  {
    id: 3, date: '2026-03-18T16:45:00Z', description: 'Engine diagnostics',
    originalAmount: 180.00, originalCurrency: 'GBP', rateUsed: 4.7506,
    sarEquivalent: 855.11, type: 'payment', reference: 'PAY-2026-0298',
    customerName: 'Oliver Smith',
  },
  {
    id: 4, date: '2026-03-18T10:00:00Z', description: 'Oil change service',
    originalAmount: 350.00, originalCurrency: 'AED', rateUsed: 1.0204,
    sarEquivalent: 357.14, type: 'payment', reference: 'PAY-2026-0297',
    customerName: 'Mohammed Al-Maktoum',
  },
  {
    id: 5, date: '2026-03-17T09:20:00Z', description: 'Transmission repair',
    originalAmount: 120.00, originalCurrency: 'KWD', rateUsed: 12.1655,
    sarEquivalent: 1459.85, type: 'invoice', reference: 'INV-2026-0408',
    customerName: 'Abdullah Al-Sabah',
  },
  {
    id: 6, date: '2026-03-17T13:00:00Z', description: 'Refund — incorrect part charged',
    originalAmount: 85.00, originalCurrency: 'USD', rateUsed: 3.7536,
    sarEquivalent: 319.06, type: 'refund', reference: 'REF-2026-0045',
    customerName: 'James Wilson',
  },
  {
    id: 7, date: '2026-03-16T15:30:00Z', description: 'AC compressor parts import',
    originalAmount: 2200.00, originalCurrency: 'USD', rateUsed: 3.7536,
    sarEquivalent: 8257.92, type: 'expense', reference: 'EXP-2026-0189',
    customerName: 'AutoParts International',
  },
  {
    id: 8, date: '2026-03-16T08:45:00Z', description: 'Suspension overhaul',
    originalAmount: 75.00, originalCurrency: 'BHD', rateUsed: 9.9304,
    sarEquivalent: 744.78, type: 'invoice', reference: 'INV-2026-0405',
    customerName: 'Ali Al-Khalifa',
  },
  {
    id: 9, date: '2026-03-15T12:00:00Z', description: 'Windshield replacement',
    originalAmount: 8500.00, originalCurrency: 'EGP', rateUsed: 0.2841,
    sarEquivalent: 2414.77, type: 'payment', reference: 'PAY-2026-0291',
    customerName: 'Ahmed Mostafa',
  },
  {
    id: 10, date: '2026-03-15T09:00:00Z', description: 'Annual inspection fee',
    originalAmount: 45.00, originalCurrency: 'JOD', rateUsed: 5.2770,
    sarEquivalent: 237.47, type: 'payment', reference: 'PAY-2026-0290',
    customerName: 'Faisal Al-Hashemi',
  },
];

// ---------------------------------------------------------------------------
// Helper: convert between currencies via SAR midRate
// ---------------------------------------------------------------------------
function convert(amount: number, fromCode: string, toCode: string): { result: number; rate: number } | null {
  const fromRate = exchangeRates.find(r => r.code === fromCode);
  const toRate = exchangeRates.find(r => r.code === toCode);
  if (!fromRate || !toRate) return null;

  // amount in FROM -> SAR -> TO
  const amountInSAR = amount / fromRate.midRate; // e.g. 100 USD / 0.2666 = 375.09 SAR
  const result = amountInSAR * toRate.midRate;    // e.g. 375.09 SAR * 0.2445 = 91.71 EUR
  const rate = toRate.midRate / fromRate.midRate;

  return { result: parseFloat(result.toFixed(6)), rate: parseFloat(rate.toFixed(6)) };
}

// ---------------------------------------------------------------------------
// GET /api/currency/rates
// ---------------------------------------------------------------------------
router.get('/currency/rates', (_req, res) => {
  res.json({ rates: exchangeRates });
});

// ---------------------------------------------------------------------------
// POST /api/currency/convert
// Body: { amount: number, from: string, to: string }
// ---------------------------------------------------------------------------
router.post('/currency/convert', (req, res) => {
  const { amount, from, to } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (!from || !to) {
    return res.status(400).json({ error: 'from and to currency codes are required' });
  }

  const result = convert(amount, from, to);
  if (!result) {
    return res.status(400).json({ error: 'Invalid currency code' });
  }

  res.json({
    from,
    to,
    amount,
    convertedAmount: result.result,
    rate: result.rate,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// GET /api/currency/settings
// ---------------------------------------------------------------------------
router.get('/currency/settings', (_req, res) => {
  res.json({ settings: currencySettings });
});

// ---------------------------------------------------------------------------
// PUT /api/currency/settings
// ---------------------------------------------------------------------------
router.put('/currency/settings', (req, res) => {
  const { defaultCurrency, decimalPlaces, numberFormat, autoConversion } = req.body;

  if (defaultCurrency !== undefined) {
    const valid = exchangeRates.find(r => r.code === defaultCurrency);
    if (!valid) return res.status(400).json({ error: 'Invalid currency code' });
    currencySettings.defaultCurrency = defaultCurrency;
  }
  if (decimalPlaces !== undefined) {
    if (typeof decimalPlaces !== 'number' || decimalPlaces < 0 || decimalPlaces > 4) {
      return res.status(400).json({ error: 'decimalPlaces must be between 0 and 4' });
    }
    currencySettings.decimalPlaces = decimalPlaces;
  }
  if (numberFormat !== undefined) {
    if (!['en', 'eu'].includes(numberFormat)) {
      return res.status(400).json({ error: 'numberFormat must be "en" or "eu"' });
    }
    currencySettings.numberFormat = numberFormat;
  }
  if (autoConversion !== undefined) {
    currencySettings.autoConversion = !!autoConversion;
  }

  res.json({ settings: currencySettings });
});

// ---------------------------------------------------------------------------
// GET /api/currency/transactions
// ---------------------------------------------------------------------------
router.get('/currency/transactions', (req, res) => {
  const { type, currency, limit: rawLimit } = req.query;
  let filtered = [...transactions];

  if (type && type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }
  if (currency && currency !== 'all') {
    filtered = filtered.filter(t => t.originalCurrency === currency);
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const limit = rawLimit ? parseInt(rawLimit as string, 10) : 50;
  filtered = filtered.slice(0, limit);

  const totalSAR = filtered.reduce((sum, t) => {
    if (t.type === 'refund') return sum - t.sarEquivalent;
    return sum + t.sarEquivalent;
  }, 0);

  res.json({
    transactions: filtered,
    summary: {
      count: filtered.length,
      totalSAR: parseFloat(totalSAR.toFixed(2)),
      currencies: [...new Set(filtered.map(t => t.originalCurrency))],
    },
  });
});

export default router;
