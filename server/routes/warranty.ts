import { Router } from 'express';

const router = Router();

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------
interface WarrantyContract {
  id: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  planType: 'Basic' | 'Standard' | 'Premium';
  coverageType: string;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  monthlyPremium: number;
  claimsCount: number;
  createdAt: string;
}

interface WarrantyClaim {
  id: number;
  claimNumber: string;
  contractId: number;
  contractRef: string;
  customerId: number;
  customerName: string;
  jobCardId: number | null;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submittedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  notes: string;
}

let nextContractId = 7;
let nextClaimId = 6;

const contracts: WarrantyContract[] = [
  {
    id: 1, customerId: 1, customerName: 'Ahmed Al-Rashidi', vehicleId: 101,
    vehicleName: '2023 Toyota Camry', licensePlate: 'ABC 1234',
    planType: 'Premium', coverageType: 'Full Coverage',
    coverageAmount: 25000, startDate: '2025-06-01', endDate: '2027-06-01',
    status: 'active', monthlyPremium: 450, claimsCount: 2, createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 2, customerId: 2, customerName: 'Fatima Al-Saud', vehicleId: 102,
    vehicleName: '2022 Honda Accord', licensePlate: 'XYZ 5678',
    planType: 'Standard', coverageType: 'Powertrain',
    coverageAmount: 15000, startDate: '2025-03-15', endDate: '2026-09-15',
    status: 'active', monthlyPremium: 300, claimsCount: 1, createdAt: '2025-03-15T09:00:00Z',
  },
  {
    id: 3, customerId: 3, customerName: 'Mohammed Al-Qahtani', vehicleId: 103,
    vehicleName: '2024 Hyundai Sonata', licensePlate: 'DEF 9012',
    planType: 'Basic', coverageType: 'Engine & Transmission',
    coverageAmount: 8000, startDate: '2025-09-01', endDate: '2026-09-01',
    status: 'active', monthlyPremium: 150, claimsCount: 0, createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 4, customerId: 4, customerName: 'Sara Al-Dosari', vehicleId: 104,
    vehicleName: '2021 Nissan Altima', licensePlate: 'GHI 3456',
    planType: 'Premium', coverageType: 'Full Coverage',
    coverageAmount: 20000, startDate: '2024-01-01', endDate: '2026-01-01',
    status: 'expired', monthlyPremium: 400, claimsCount: 3, createdAt: '2024-01-01T12:00:00Z',
  },
  {
    id: 5, customerId: 5, customerName: 'Khalid Al-Mutairi', vehicleId: 105,
    vehicleName: '2023 Kia K5', licensePlate: 'JKL 7890',
    planType: 'Standard', coverageType: 'Powertrain',
    coverageAmount: 12000, startDate: '2025-07-01', endDate: '2027-01-01',
    status: 'active', monthlyPremium: 250, claimsCount: 1, createdAt: '2025-07-01T11:00:00Z',
  },
  {
    id: 6, customerId: 6, customerName: 'Nora Al-Harbi', vehicleId: 106,
    vehicleName: '2024 Toyota RAV4', licensePlate: 'MNO 2345',
    planType: 'Premium', coverageType: 'Full Coverage',
    coverageAmount: 30000, startDate: '2025-11-01', endDate: '2027-11-01',
    status: 'active', monthlyPremium: 500, claimsCount: 0, createdAt: '2025-11-01T14:00:00Z',
  },
];

const claims: WarrantyClaim[] = [
  {
    id: 1, claimNumber: 'WC-2026-001', contractId: 1, contractRef: 'Premium - Ahmed Al-Rashidi',
    customerId: 1, customerName: 'Ahmed Al-Rashidi', jobCardId: 1001,
    description: 'Engine overheating — thermostat and water pump replacement',
    amount: 3200, status: 'completed', submittedAt: '2025-12-15T09:00:00Z',
    resolvedAt: '2025-12-18T16:00:00Z', resolvedBy: 'Manager Ali', notes: 'Parts replaced under warranty',
  },
  {
    id: 2, claimNumber: 'WC-2026-002', contractId: 1, contractRef: 'Premium - Ahmed Al-Rashidi',
    customerId: 1, customerName: 'Ahmed Al-Rashidi', jobCardId: 1015,
    description: 'Transmission fluid leak and seal replacement',
    amount: 1800, status: 'approved', submittedAt: '2026-01-20T10:30:00Z',
    resolvedAt: '2026-01-22T14:00:00Z', resolvedBy: 'Manager Ali', notes: 'Approved — covered under full coverage',
  },
  {
    id: 3, claimNumber: 'WC-2026-003', contractId: 2, contractRef: 'Standard - Fatima Al-Saud',
    customerId: 2, customerName: 'Fatima Al-Saud', jobCardId: 1022,
    description: 'Alternator failure replacement',
    amount: 2400, status: 'completed', submittedAt: '2026-02-05T08:00:00Z',
    resolvedAt: '2026-02-07T17:00:00Z', resolvedBy: 'Manager Yusuf', notes: 'Covered under powertrain plan',
  },
  {
    id: 4, claimNumber: 'WC-2026-004', contractId: 4, contractRef: 'Premium - Sara Al-Dosari',
    customerId: 4, customerName: 'Sara Al-Dosari', jobCardId: null,
    description: 'Cosmetic paint damage — door panel scratch',
    amount: 900, status: 'rejected', submittedAt: '2026-02-28T11:00:00Z',
    resolvedAt: '2026-03-01T09:00:00Z', resolvedBy: 'Manager Ali', notes: 'Cosmetic damage not covered',
  },
  {
    id: 5, claimNumber: 'WC-2026-005', contractId: 5, contractRef: 'Standard - Khalid Al-Mutairi',
    customerId: 5, customerName: 'Khalid Al-Mutairi', jobCardId: null,
    description: 'AC compressor failure — full replacement needed',
    amount: 4100, status: 'pending', submittedAt: '2026-03-18T13:00:00Z',
    resolvedAt: null, resolvedBy: null, notes: 'Awaiting inspection',
  },
];

// ---------------------------------------------------------------------------
// GET /api/warranty/contracts — List all contracts
// ---------------------------------------------------------------------------
router.get('/warranty/contracts', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...contracts];

  if (status && status !== 'all') {
    filtered = filtered.filter(c => c.status === status);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(c =>
      c.customerName.toLowerCase().includes(s) ||
      c.vehicleName.toLowerCase().includes(s) ||
      c.licensePlate.toLowerCase().includes(s)
    );
  }

  res.json({ contracts: filtered });
});

// ---------------------------------------------------------------------------
// POST /api/warranty/contracts — Create new contract
// ---------------------------------------------------------------------------
router.post('/warranty/contracts', (req, res) => {
  const {
    customerId, customerName, vehicleId, vehicleName, licensePlate,
    planType, coverageType, coverageAmount, startDate, endDate, monthlyPremium,
  } = req.body;

  if (!customerName || !vehicleName || !planType || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const contract: WarrantyContract = {
    id: nextContractId++,
    customerId: customerId || 0,
    customerName,
    vehicleId: vehicleId || 0,
    vehicleName,
    licensePlate: licensePlate || '',
    planType,
    coverageType: coverageType || planType,
    coverageAmount: coverageAmount || 10000,
    startDate,
    endDate,
    status: 'active',
    monthlyPremium: monthlyPremium || 200,
    claimsCount: 0,
    createdAt: new Date().toISOString(),
  };

  contracts.push(contract);
  res.status(201).json({ contract });
});

// ---------------------------------------------------------------------------
// GET /api/warranty/contracts/:id — Contract detail with claims
// ---------------------------------------------------------------------------
router.get('/warranty/contracts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contract = contracts.find(c => c.id === id);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  const contractClaims = claims.filter(cl => cl.contractId === id);
  res.json({ contract, claims: contractClaims });
});

// ---------------------------------------------------------------------------
// POST /api/warranty/claims — Submit a warranty claim
// ---------------------------------------------------------------------------
router.post('/warranty/claims', (req, res) => {
  const { contractId, description, amount, jobCardId, notes } = req.body;

  const contract = contracts.find(c => c.id === contractId);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  if (!description || !amount) {
    return res.status(400).json({ error: 'Missing required fields (description, amount)' });
  }

  const claim: WarrantyClaim = {
    id: nextClaimId++,
    claimNumber: `WC-2026-${String(nextClaimId - 1).padStart(3, '0')}`,
    contractId,
    contractRef: `${contract.planType} - ${contract.customerName}`,
    customerId: contract.customerId,
    customerName: contract.customerName,
    jobCardId: jobCardId || null,
    description,
    amount,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    notes: notes || '',
  };

  contract.claimsCount += 1;
  claims.push(claim);
  res.status(201).json({ claim });
});

// ---------------------------------------------------------------------------
// GET /api/warranty/claims — List all claims
// ---------------------------------------------------------------------------
router.get('/warranty/claims', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...claims];

  if (status && status !== 'all') {
    filtered = filtered.filter(cl => cl.status === status);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(cl =>
      cl.claimNumber.toLowerCase().includes(s) ||
      cl.customerName.toLowerCase().includes(s) ||
      cl.description.toLowerCase().includes(s)
    );
  }

  res.json({ claims: filtered });
});

// ---------------------------------------------------------------------------
// PATCH /api/warranty/claims/:id — Approve or reject a claim
// ---------------------------------------------------------------------------
router.patch('/warranty/claims/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const claim = claims.find(cl => cl.id === id);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  const { status, resolvedBy, notes } = req.body;
  if (status && ['approved', 'rejected', 'completed'].includes(status)) {
    claim.status = status;
    claim.resolvedAt = new Date().toISOString();
    claim.resolvedBy = resolvedBy || 'System';
  }
  if (notes !== undefined) {
    claim.notes = notes;
  }

  res.json({ claim });
});

// ---------------------------------------------------------------------------
// GET /api/warranty/stats — Dashboard statistics
// ---------------------------------------------------------------------------
router.get('/warranty/stats', (req, res) => {
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalContracts = contracts.length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const claimsThisMonth = claims.filter(cl => new Date(cl.submittedAt) >= startOfMonth).length;

  const resolvedClaims = claims.filter(cl => cl.status === 'approved' || cl.status === 'completed');
  const totalResolvable = claims.filter(cl => cl.status !== 'pending').length;
  const approvalRate = totalResolvable > 0
    ? Math.round((resolvedClaims.length / totalResolvable) * 100)
    : 0;

  const monthlyRevenue = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyPremium, 0);

  const totalClaimAmount = claims.reduce((sum, cl) => sum + cl.amount, 0);
  const avgClaimValue = claims.length > 0 ? Math.round(totalClaimAmount / claims.length) : 0;

  // Claims by month for chart (last 6 months)
  const claimsByMonth: { month: string; count: number; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    const monthClaims = claims.filter(cl => {
      const submitted = new Date(cl.submittedAt);
      return submitted >= d && submitted <= monthEnd;
    });
    claimsByMonth.push({
      month: monthLabel,
      count: monthClaims.length,
      amount: monthClaims.reduce((sum, cl) => sum + cl.amount, 0),
    });
  }

  res.json({
    activeContracts,
    totalContracts,
    claimsThisMonth,
    approvalRate,
    monthlyRevenue,
    avgClaimValue,
    totalClaims: claims.length,
    claimsByMonth,
  });
});

export default router;
