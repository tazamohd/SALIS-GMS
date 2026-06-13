import { Router } from 'express';
import { storage } from '../storage';

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

type CurrencyTxType = 'invoice' | 'payment' | 'refund' | 'expense';

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
const currencySettings: CurrencySettings = {
  defaultCurrency: 'SAR',
  decimalPlaces: 2,
  numberFormat: 'en',
  autoConversion: true,
};

// Transactions now live in the currency_transactions Drizzle table; see
// server/seed.ts for the 10 demo seeds.

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
router.get('/currency/transactions', async (req, res) => {
  try {
    const { type, currency, limit: rawLimit } = req.query;
    const limit = rawLimit ? parseInt(rawLimit as string, 10) : 50;

    const rows = await storage.listCurrencyTransactions({
      type: type ? String(type) : undefined,
      currency: currency ? String(currency) : undefined,
      limit,
    });

    const view = rows.map((t: any) => ({
      id: t.id,
      date: t.txDate instanceof Date ? t.txDate.toISOString() : t.txDate,
      description: t.description,
      originalAmount: parseFloat(t.originalAmount),
      originalCurrency: t.originalCurrency,
      rateUsed: parseFloat(t.rateUsed),
      sarEquivalent: parseFloat(t.sarEquivalent),
      type: t.type,
      reference: t.reference,
      customerName: t.customerName,
    }));

    const totalSAR = view.reduce((sum, t) => {
      if (t.type === 'refund') return sum - t.sarEquivalent;
      return sum + t.sarEquivalent;
    }, 0);

    res.json({
      transactions: view,
      summary: {
        count: view.length,
        totalSAR: parseFloat(totalSAR.toFixed(2)),
        currencies: [...new Set(view.map(t => t.originalCurrency))],
      },
    });
  } catch (err) {
    console.error('Currency transactions error:', err);
    res.status(500).json({ error: 'Failed to list currency transactions' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/currency/transactions
// Body: { description, originalAmount, originalCurrency, type, reference?, customerName? }
// ---------------------------------------------------------------------------
router.post('/currency/transactions', async (req, res) => {
  const { description, originalAmount, originalCurrency, type, reference, customerName, date } = req.body;

  if (!description || typeof originalAmount !== 'number' || !originalCurrency || !type) {
    return res.status(400).json({ error: 'description, originalAmount, originalCurrency, and type are required' });
  }
  if (!['invoice', 'payment', 'refund', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'type must be invoice, payment, refund, or expense' });
  }

  const sar = convert(originalAmount, originalCurrency, 'SAR');
  if (!sar) {
    return res.status(400).json({ error: 'Invalid currency code' });
  }

  try {
    const row = await storage.createCurrencyTransaction({
      txDate: date ? new Date(date) : new Date(),
      description,
      originalAmount: String(originalAmount),
      originalCurrency,
      rateUsed: String(1 / (exchangeRates.find(r => r.code === originalCurrency)?.midRate ?? 1)),
      sarEquivalent: sar.result.toFixed(4),
      type: type as CurrencyTxType,
      reference: reference || null,
      customerName: customerName || null,
    });
    res.status(201).json({
      id: row.id,
      date: row.txDate,
      description: row.description,
      originalAmount: parseFloat(row.originalAmount),
      originalCurrency: row.originalCurrency,
      rateUsed: parseFloat(row.rateUsed),
      sarEquivalent: parseFloat(row.sarEquivalent),
      type: row.type,
      reference: row.reference,
      customerName: row.customerName,
    });
  } catch (err) {
    console.error('Currency transaction create error:', err);
    res.status(500).json({ error: 'Failed to create currency transaction' });
  }
});

export default router;
