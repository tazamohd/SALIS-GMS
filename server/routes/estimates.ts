import { Router } from 'express';
import { isAuthenticated } from '../auth';

const router = Router();

// ── Types ──────────────────────────────────────────────────────────────────

type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';

interface LineItem {
  id: string;
  type: 'labor' | 'parts';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Estimate {
  id: string;
  estimateNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleVin: string;
  lineItems: LineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: EstimateStatus;
  notes: string;
  validUntil: string;
  convertedJobCardId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────

function generateId(): string {
  return 'est-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function generateLineItemId(): string {
  return 'li-' + Math.random().toString(36).slice(2, 10);
}

const VAT_RATE = 0.15; // 15% Saudi VAT

function calcTotals(items: LineItem[]): { subtotal: number; vatAmount: number; total: number } {
  const subtotal = items.reduce((sum, li) => sum + li.total, 0);
  const vatAmount = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, vatAmount, total };
}

const now = new Date();
function daysAgo(d: number): string {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}
function daysFromNow(d: number): string {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString();
}

const demoEstimates: Estimate[] = [
  {
    id: 'est-001',
    estimateNumber: 'EST-2026-0001',
    customerId: 'cust-1',
    customerName: 'Ahmed Al-Rashidi',
    customerEmail: 'ahmed@example.com',
    customerPhone: '+966501234567',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2023,
    vehiclePlate: 'ABC 1234',
    vehicleVin: '1HGBH41JXMN109186',
    lineItems: [
      { id: 'li-001', type: 'labor', description: 'Full brake inspection & adjustment', quantity: 1, unitPrice: 350, total: 350 },
      { id: 'li-002', type: 'parts', description: 'Front brake pads (premium)', quantity: 2, unitPrice: 220, total: 440 },
      { id: 'li-003', type: 'parts', description: 'Brake fluid DOT 4', quantity: 1, unitPrice: 85, total: 85 },
    ],
    subtotal: 875,
    vatRate: VAT_RATE,
    vatAmount: 131.25,
    total: 1006.25,
    status: 'approved',
    notes: 'Customer requested premium brake pads.',
    validUntil: daysFromNow(14),
    convertedJobCardId: null,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
  },
  {
    id: 'est-002',
    estimateNumber: 'EST-2026-0002',
    customerId: 'cust-2',
    customerName: 'Fatima Al-Harbi',
    customerEmail: 'fatima@example.com',
    customerPhone: '+966509876543',
    vehicleMake: 'Hyundai',
    vehicleModel: 'Tucson',
    vehicleYear: 2022,
    vehiclePlate: 'XYZ 5678',
    vehicleVin: '5XYZU3LB5EG123456',
    lineItems: [
      { id: 'li-004', type: 'labor', description: 'AC system diagnostic & recharge', quantity: 1, unitPrice: 280, total: 280 },
      { id: 'li-005', type: 'parts', description: 'Refrigerant R134a (2 cans)', quantity: 2, unitPrice: 120, total: 240 },
      { id: 'li-006', type: 'parts', description: 'Cabin air filter', quantity: 1, unitPrice: 65, total: 65 },
    ],
    subtotal: 585,
    vatRate: VAT_RATE,
    vatAmount: 87.75,
    total: 672.75,
    status: 'sent',
    notes: 'AC not cooling properly in summer heat.',
    validUntil: daysFromNow(10),
    convertedJobCardId: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'est-003',
    estimateNumber: 'EST-2026-0003',
    customerId: 'cust-3',
    customerName: 'Mohammed Al-Saud',
    customerEmail: 'mohammed@example.com',
    customerPhone: '+966551112233',
    vehicleMake: 'GMC',
    vehicleModel: 'Yukon',
    vehicleYear: 2024,
    vehiclePlate: 'KSA 9012',
    vehicleVin: '1GKS1BKC5FR123456',
    lineItems: [
      { id: 'li-007', type: 'labor', description: 'Engine oil change (full synthetic)', quantity: 1, unitPrice: 200, total: 200 },
      { id: 'li-008', type: 'parts', description: 'Mobil 1 5W-30 (8L)', quantity: 8, unitPrice: 55, total: 440 },
      { id: 'li-009', type: 'parts', description: 'Oil filter (OEM)', quantity: 1, unitPrice: 95, total: 95 },
      { id: 'li-010', type: 'labor', description: 'Multi-point inspection', quantity: 1, unitPrice: 150, total: 150 },
    ],
    subtotal: 885,
    vatRate: VAT_RATE,
    vatAmount: 132.75,
    total: 1017.75,
    status: 'converted',
    notes: 'Regular maintenance — 20K km service.',
    validUntil: daysAgo(1),
    convertedJobCardId: 'jc-2026-0042',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(7),
  },
  {
    id: 'est-004',
    estimateNumber: 'EST-2026-0004',
    customerId: 'cust-4',
    customerName: 'Sara Al-Fahad',
    customerEmail: 'sara@example.com',
    customerPhone: '+966504445566',
    vehicleMake: 'Nissan',
    vehicleModel: 'Patrol',
    vehicleYear: 2021,
    vehiclePlate: 'RUH 3456',
    vehicleVin: 'JN1TBNT30Z0000001',
    lineItems: [
      { id: 'li-011', type: 'labor', description: 'Transmission fluid flush', quantity: 1, unitPrice: 450, total: 450 },
      { id: 'li-012', type: 'parts', description: 'ATF fluid (12L)', quantity: 12, unitPrice: 45, total: 540 },
      { id: 'li-013', type: 'parts', description: 'Transmission filter kit', quantity: 1, unitPrice: 180, total: 180 },
    ],
    subtotal: 1170,
    vatRate: VAT_RATE,
    vatAmount: 175.5,
    total: 1345.5,
    status: 'draft',
    notes: 'Customer reporting rough shifting.',
    validUntil: daysFromNow(21),
    convertedJobCardId: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'est-005',
    estimateNumber: 'EST-2026-0005',
    customerId: 'cust-5',
    customerName: 'Khalid Al-Otaibi',
    customerEmail: 'khalid@example.com',
    customerPhone: '+966507778899',
    vehicleMake: 'Ford',
    vehicleModel: 'Explorer',
    vehicleYear: 2022,
    vehiclePlate: 'JED 7890',
    vehicleVin: '1FMSK8DH5NGA12345',
    lineItems: [
      { id: 'li-014', type: 'labor', description: 'Suspension overhaul (front & rear)', quantity: 1, unitPrice: 1200, total: 1200 },
      { id: 'li-015', type: 'parts', description: 'Front struts (pair)', quantity: 2, unitPrice: 650, total: 1300 },
      { id: 'li-016', type: 'parts', description: 'Rear shocks (pair)', quantity: 2, unitPrice: 480, total: 960 },
      { id: 'li-017', type: 'parts', description: 'Sway bar links (set of 4)', quantity: 1, unitPrice: 320, total: 320 },
      { id: 'li-018', type: 'labor', description: 'Wheel alignment (4-wheel)', quantity: 1, unitPrice: 250, total: 250 },
    ],
    subtotal: 4030,
    vatRate: VAT_RATE,
    vatAmount: 604.5,
    total: 4634.5,
    status: 'rejected',
    notes: 'Customer found the price too high. Offered 10% discount — awaiting response.',
    validUntil: daysAgo(3),
    convertedJobCardId: null,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(10),
  },
  {
    id: 'est-006',
    estimateNumber: 'EST-2026-0006',
    customerId: 'cust-6',
    customerName: 'Nora Al-Ghamdi',
    customerEmail: 'nora@example.com',
    customerPhone: '+966502223344',
    vehicleMake: 'Lexus',
    vehicleModel: 'ES 350',
    vehicleYear: 2023,
    vehiclePlate: 'DMM 4321',
    vehicleVin: 'JTHBK1GG5E2123456',
    lineItems: [
      { id: 'li-019', type: 'labor', description: 'Timing belt replacement', quantity: 1, unitPrice: 800, total: 800 },
      { id: 'li-020', type: 'parts', description: 'Timing belt kit (OEM)', quantity: 1, unitPrice: 950, total: 950 },
      { id: 'li-021', type: 'parts', description: 'Water pump', quantity: 1, unitPrice: 420, total: 420 },
      { id: 'li-022', type: 'labor', description: 'Coolant flush & refill', quantity: 1, unitPrice: 180, total: 180 },
    ],
    subtotal: 2350,
    vatRate: VAT_RATE,
    vatAmount: 352.5,
    total: 2702.5,
    status: 'expired',
    notes: 'Preventive maintenance at 100K km.',
    validUntil: daysAgo(7),
    convertedJobCardId: null,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(25),
  },
  {
    id: 'est-007',
    estimateNumber: 'EST-2026-0007',
    customerId: 'cust-7',
    customerName: 'Omar Al-Zahrani',
    customerEmail: 'omar@example.com',
    customerPhone: '+966506667788',
    vehicleMake: 'Chevrolet',
    vehicleModel: 'Tahoe',
    vehicleYear: 2024,
    vehiclePlate: 'TAB 6543',
    vehicleVin: '1GNSKBKC0LR123456',
    lineItems: [
      { id: 'li-023', type: 'labor', description: 'Battery replacement & electrical check', quantity: 1, unitPrice: 150, total: 150 },
      { id: 'li-024', type: 'parts', description: 'AGM Battery 80Ah', quantity: 1, unitPrice: 680, total: 680 },
    ],
    subtotal: 830,
    vatRate: VAT_RATE,
    vatAmount: 124.5,
    total: 954.5,
    status: 'sent',
    notes: 'Battery dead — vehicle would not start.',
    validUntil: daysFromNow(7),
    convertedJobCardId: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'est-008',
    estimateNumber: 'EST-2026-0008',
    customerId: 'cust-8',
    customerName: 'Layla Al-Mutairi',
    customerEmail: 'layla@example.com',
    customerPhone: '+966508889900',
    vehicleMake: 'Kia',
    vehicleModel: 'Sportage',
    vehicleYear: 2023,
    vehiclePlate: 'RYD 8765',
    vehicleVin: 'KNDPM3AC6N7123456',
    lineItems: [
      { id: 'li-025', type: 'labor', description: 'Windshield replacement', quantity: 1, unitPrice: 300, total: 300 },
      { id: 'li-026', type: 'parts', description: 'OEM Windshield glass', quantity: 1, unitPrice: 1100, total: 1100 },
      { id: 'li-027', type: 'parts', description: 'Windshield molding & sealant', quantity: 1, unitPrice: 150, total: 150 },
    ],
    subtotal: 1550,
    vatRate: VAT_RATE,
    vatAmount: 232.5,
    total: 1782.5,
    status: 'approved',
    notes: 'Cracked windshield from road debris.',
    validUntil: daysFromNow(5),
    convertedJobCardId: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
];

let estimates: Estimate[] = [...demoEstimates];
let nextNumber = 9;

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/estimates/stats — Aggregate stats
router.get('/estimates/stats', isAuthenticated, (_req, res) => {
  const total = estimates.length;
  const converted = estimates.filter(e => e.status === 'converted').length;
  const conversionRate = total > 0 ? Math.round((converted / total) * 10000) / 100 : 0;
  const avgValue = total > 0 ? Math.round(estimates.reduce((s, e) => s + e.total, 0) / total * 100) / 100 : 0;
  const pending = estimates.filter(e => e.status === 'sent').length;
  const byStatus: Record<string, number> = {};
  for (const e of estimates) {
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
  }

  // Conversion funnel
  const funnel = {
    created: total,
    sent: estimates.filter(e => ['sent', 'approved', 'rejected', 'expired', 'converted'].includes(e.status)).length,
    approved: estimates.filter(e => ['approved', 'converted'].includes(e.status)).length,
    converted,
  };

  res.json({
    totalEstimates: total,
    conversionRate,
    avgValue,
    pendingCount: pending,
    byStatus,
    funnel,
  });
});

// GET /api/estimates — List all estimates
router.get('/estimates', isAuthenticated, (req, res) => {
  let result = [...estimates];
  const { status, search } = req.query;
  if (status && status !== 'all') {
    result = result.filter(e => e.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(e =>
      e.estimateNumber.toLowerCase().includes(q) ||
      e.customerName.toLowerCase().includes(q) ||
      e.vehicleMake.toLowerCase().includes(q) ||
      e.vehicleModel.toLowerCase().includes(q) ||
      e.vehiclePlate.toLowerCase().includes(q)
    );
  }
  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

// GET /api/estimates/:id — Single estimate detail
router.get('/estimates/:id', isAuthenticated, (req, res) => {
  const est = estimates.find(e => e.id === req.params.id);
  if (!est) return res.status(404).json({ error: 'Estimate not found' });
  res.json(est);
});

// POST /api/estimates — Create new estimate
router.post('/estimates', isAuthenticated, (req, res) => {
  const {
    customerName, customerEmail, customerPhone,
    vehicleMake, vehicleModel, vehicleYear, vehiclePlate, vehicleVin,
    lineItems: rawItems, notes, validDays,
  } = req.body;

  if (!customerName || !vehicleMake || !rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ error: 'Customer name, vehicle make, and at least one line item are required.' });
  }

  const lineItems: LineItem[] = rawItems.map((li: any) => {
    const parsedQty = Number(li.quantity);
    const qty = Number.isFinite(parsedQty) && parsedQty >= 0 ? parsedQty : 1;
    const parsedPrice = Number(li.unitPrice);
    const price = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;
    return {
      id: generateLineItemId(),
      type: li.type === 'labor' ? 'labor' : 'parts',
      description: li.description || '',
      quantity: qty,
      unitPrice: price,
      total: Math.round(qty * price * 100) / 100,
    };
  });

  const { subtotal, vatAmount, total } = calcTotals(lineItems);
  const estNumber = `EST-2026-${String(nextNumber++).padStart(4, '0')}`;
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + (Number(validDays) || 14));

  const estimate: Estimate = {
    id: generateId(),
    estimateNumber: estNumber,
    customerId: 'cust-' + Math.random().toString(36).slice(2, 6),
    customerName,
    customerEmail: customerEmail || '',
    customerPhone: customerPhone || '',
    vehicleMake,
    vehicleModel: vehicleModel || '',
    vehicleYear: Number(vehicleYear) || new Date().getFullYear(),
    vehiclePlate: vehiclePlate || '',
    vehicleVin: vehicleVin || '',
    lineItems,
    subtotal,
    vatRate: VAT_RATE,
    vatAmount,
    total,
    status: 'draft',
    notes: notes || '',
    validUntil: validUntilDate.toISOString(),
    convertedJobCardId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  estimates.unshift(estimate);
  res.status(201).json(estimate);
});

// PATCH /api/estimates/:id/status — Update status
router.patch('/estimates/:id/status', isAuthenticated, (req, res) => {
  const est = estimates.find(e => e.id === req.params.id);
  if (!est) return res.status(404).json({ error: 'Estimate not found' });

  const { action } = req.body;
  const validTransitions: Record<string, EstimateStatus[]> = {
    draft: ['sent'],
    sent: ['approved', 'rejected', 'expired'],
    approved: ['converted'],
    rejected: [],
    expired: ['sent'], // allow re-send
    converted: [],
  };

  const actionToStatus: Record<string, EstimateStatus> = {
    send: 'sent',
    approve: 'approved',
    reject: 'rejected',
    expire: 'expired',
    convert: 'converted',
  };

  const targetStatus = actionToStatus[action];
  if (!targetStatus) {
    return res.status(400).json({ error: `Invalid action "${action}". Valid: send, approve, reject, expire, convert.` });
  }
  if (!validTransitions[est.status]?.includes(targetStatus)) {
    return res.status(400).json({ error: `Cannot transition from "${est.status}" to "${targetStatus}".` });
  }

  est.status = targetStatus;
  est.updatedAt = new Date().toISOString();

  if (targetStatus === 'converted') {
    est.convertedJobCardId = 'jc-2026-' + String(Math.floor(Math.random() * 9000 + 1000));
  }

  res.json(est);
});

export default router;
