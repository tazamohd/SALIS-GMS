import { Router } from 'express';

const router = Router();

// ── Types ──────────────────────────────────────────────────────────────────

type InspectionResult = 'pass' | 'fail' | 'conditional' | 'pending';
type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';
type DefectStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface QCInspection {
  id: string;
  jobCardRef: string;
  vehicleInfo: string;
  serviceType: string;
  inspector: string;
  inspectorId: string;
  result: InspectionResult;
  notes: string;
  checklistId: string;
  completedItems: number;
  totalItems: number;
  inspectionTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

interface QCDefect {
  id: string;
  inspectionId: string;
  jobCardRef: string;
  description: string;
  severity: DefectSeverity;
  category: string;
  status: DefectStatus;
  resolutionNotes: string;
  reportedBy: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

interface ChecklistTemplate {
  id: string;
  serviceType: string;
  name: string;
  items: ChecklistItem[];
}

// ── In-Memory Storage ──────────────────────────────────────────────────────

const inspections: QCInspection[] = [];
const defects: QCDefect[] = [];

let inspectionIdCounter = 100;
let defectIdCounter = 200;

// ── Checklist Templates ────────────────────────────────────────────────────

const checklistTemplates: ChecklistTemplate[] = [
  {
    id: 'CL-001',
    serviceType: 'Oil Change',
    name: 'Oil Change Quality Checklist',
    items: [
      { id: 'OC-1', label: 'Correct oil type and grade used', required: true },
      { id: 'OC-2', label: 'Oil filter replaced', required: true },
      { id: 'OC-3', label: 'Drain plug torqued to spec', required: true },
      { id: 'OC-4', label: 'Oil level within acceptable range', required: true },
      { id: 'OC-5', label: 'No leaks detected under vehicle', required: true },
      { id: 'OC-6', label: 'Oil cap securely replaced', required: true },
      { id: 'OC-7', label: 'Service sticker updated', required: false },
      { id: 'OC-8', label: 'Work area cleaned', required: false },
    ],
  },
  {
    id: 'CL-002',
    serviceType: 'Brake Service',
    name: 'Brake Service Quality Checklist',
    items: [
      { id: 'BR-1', label: 'Brake pad thickness within spec', required: true },
      { id: 'BR-2', label: 'Rotor surface condition inspected', required: true },
      { id: 'BR-3', label: 'Brake fluid level checked', required: true },
      { id: 'BR-4', label: 'Caliper bolts torqued to spec', required: true },
      { id: 'BR-5', label: 'Brake lines inspected for wear/leaks', required: true },
      { id: 'BR-6', label: 'Parking brake operation verified', required: true },
      { id: 'BR-7', label: 'Test drive - braking performance confirmed', required: true },
      { id: 'BR-8', label: 'ABS warning light clear', required: true },
      { id: 'BR-9', label: 'Wheel nuts torqued to spec', required: true },
    ],
  },
  {
    id: 'CL-003',
    serviceType: 'AC Service',
    name: 'AC Service Quality Checklist',
    items: [
      { id: 'AC-1', label: 'Refrigerant type and charge correct', required: true },
      { id: 'AC-2', label: 'Compressor operation verified', required: true },
      { id: 'AC-3', label: 'Vent temperature within spec', required: true },
      { id: 'AC-4', label: 'No refrigerant leaks detected', required: true },
      { id: 'AC-5', label: 'Cabin filter replaced/inspected', required: false },
      { id: 'AC-6', label: 'Blower motor operation confirmed', required: true },
      { id: 'AC-7', label: 'Condenser and evaporator inspected', required: false },
    ],
  },
  {
    id: 'CL-004',
    serviceType: 'Tire Service',
    name: 'Tire Service Quality Checklist',
    items: [
      { id: 'TR-1', label: 'Correct tire size and type installed', required: true },
      { id: 'TR-2', label: 'Tire pressure set to manufacturer spec', required: true },
      { id: 'TR-3', label: 'Wheel alignment within spec', required: true },
      { id: 'TR-4', label: 'Wheel balance verified', required: true },
      { id: 'TR-5', label: 'Lug nuts torqued to spec', required: true },
      { id: 'TR-6', label: 'TPMS sensors functioning', required: true },
      { id: 'TR-7', label: 'Spare tire condition checked', required: false },
    ],
  },
  {
    id: 'CL-005',
    serviceType: 'Engine Diagnostics',
    name: 'Engine Diagnostics Quality Checklist',
    items: [
      { id: 'ED-1', label: 'OBD-II scan completed - all codes read', required: true },
      { id: 'ED-2', label: 'Root cause identified and documented', required: true },
      { id: 'ED-3', label: 'Repair verified - fault codes cleared', required: true },
      { id: 'ED-4', label: 'Test drive completed - no warning lights', required: true },
      { id: 'ED-5', label: 'All sensor readings within normal range', required: true },
      { id: 'ED-6', label: 'Customer concern resolved', required: true },
    ],
  },
  {
    id: 'CL-006',
    serviceType: 'Full Inspection',
    name: 'Comprehensive Vehicle Inspection Checklist',
    items: [
      { id: 'FI-1', label: 'Engine oil condition and level', required: true },
      { id: 'FI-2', label: 'Coolant level and condition', required: true },
      { id: 'FI-3', label: 'Brake system inspection', required: true },
      { id: 'FI-4', label: 'Suspension and steering check', required: true },
      { id: 'FI-5', label: 'Tire condition and tread depth', required: true },
      { id: 'FI-6', label: 'Battery health test', required: true },
      { id: 'FI-7', label: 'Lights and electrical systems', required: true },
      { id: 'FI-8', label: 'Exhaust system inspection', required: true },
      { id: 'FI-9', label: 'Belts and hoses condition', required: true },
      { id: 'FI-10', label: 'Wiper blades and washer fluid', required: false },
      { id: 'FI-11', label: 'Interior controls and gauges', required: false },
      { id: 'FI-12', label: 'Under-body inspection for leaks/damage', required: true },
    ],
  },
];

// ── Seed Demo Data ─────────────────────────────────────────────────────────

function seedDemoData() {
  if (inspections.length > 0) return;

  const now = new Date();
  const demoInspections: Omit<QCInspection, 'id'>[] = [
    {
      jobCardRef: 'JC-2026-0142',
      vehicleInfo: '2024 Toyota Camry (ABC-1234)',
      serviceType: 'Oil Change',
      inspector: 'Ahmed Al-Rashid',
      inspectorId: '1',
      result: 'pass',
      notes: 'All items verified. Oil level and filter in excellent condition.',
      checklistId: 'CL-001',
      completedItems: 8,
      totalItems: 8,
      inspectionTimeMinutes: 12,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0139',
      vehicleInfo: '2023 Honda Accord (DEF-5678)',
      serviceType: 'Brake Service',
      inspector: 'Mohammed Al-Fahad',
      inspectorId: '2',
      result: 'fail',
      notes: 'Brake fluid below minimum. Left caliper bolt under-torqued. Requires rework.',
      checklistId: 'CL-002',
      completedItems: 6,
      totalItems: 9,
      inspectionTimeMinutes: 25,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0137',
      vehicleInfo: '2022 Nissan Patrol (GHI-9012)',
      serviceType: 'AC Service',
      inspector: 'Ahmed Al-Rashid',
      inspectorId: '1',
      result: 'conditional',
      notes: 'AC functioning but cabin filter shows early wear. Recommend replacement within 2 months.',
      checklistId: 'CL-003',
      completedItems: 6,
      totalItems: 7,
      inspectionTimeMinutes: 18,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0135',
      vehicleInfo: '2023 Hyundai Tucson (JKL-3456)',
      serviceType: 'Tire Service',
      inspector: 'Khalid Bin Saeed',
      inspectorId: '3',
      result: 'pass',
      notes: 'All tires balanced and aligned. TPMS sensors confirmed active.',
      checklistId: 'CL-004',
      completedItems: 7,
      totalItems: 7,
      inspectionTimeMinutes: 15,
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0133',
      vehicleInfo: '2021 Toyota Land Cruiser (MNO-7890)',
      serviceType: 'Engine Diagnostics',
      inspector: 'Mohammed Al-Fahad',
      inspectorId: '2',
      result: 'pass',
      notes: 'P0300 misfire resolved. New spark plugs installed, all codes cleared. Test drive successful.',
      checklistId: 'CL-005',
      completedItems: 6,
      totalItems: 6,
      inspectionTimeMinutes: 30,
      createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 71 * 60 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0131',
      vehicleInfo: '2020 Kia Sportage (PQR-1234)',
      serviceType: 'Full Inspection',
      inspector: 'Ahmed Al-Rashid',
      inspectorId: '1',
      result: 'fail',
      notes: 'Battery health below 40%. Serpentine belt cracked. Immediate replacement needed.',
      checklistId: 'CL-006',
      completedItems: 9,
      totalItems: 12,
      inspectionTimeMinutes: 45,
      createdAt: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 95 * 60 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0144',
      vehicleInfo: '2024 Lexus ES (STU-5678)',
      serviceType: 'Oil Change',
      inspector: 'Khalid Bin Saeed',
      inspectorId: '3',
      result: 'pending',
      notes: '',
      checklistId: 'CL-001',
      completedItems: 0,
      totalItems: 8,
      inspectionTimeMinutes: 0,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
    {
      jobCardRef: 'JC-2026-0145',
      vehicleInfo: '2023 GMC Sierra (VWX-9012)',
      serviceType: 'Brake Service',
      inspector: 'Ahmed Al-Rashid',
      inspectorId: '1',
      result: 'pending',
      notes: '',
      checklistId: 'CL-002',
      completedItems: 0,
      totalItems: 9,
      inspectionTimeMinutes: 0,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
  ];

  for (const insp of demoInspections) {
    inspectionIdCounter++;
    inspections.push({ id: `QCI-${inspectionIdCounter}`, ...insp });
  }

  const demoDefects: Omit<QCDefect, 'id'>[] = [
    {
      inspectionId: inspections[1].id,
      jobCardRef: 'JC-2026-0139',
      description: 'Left front caliper bolt under-torqued (35 Nm vs required 50 Nm)',
      severity: 'high',
      category: 'Torque Specification',
      status: 'in_progress',
      resolutionNotes: 'Technician re-torquing to proper spec',
      reportedBy: 'Mohammed Al-Fahad',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      resolvedAt: null,
    },
    {
      inspectionId: inspections[1].id,
      jobCardRef: 'JC-2026-0139',
      description: 'Brake fluid level below MIN line after service',
      severity: 'critical',
      category: 'Fluid Levels',
      status: 'resolved',
      resolutionNotes: 'Brake fluid topped up to correct level. System bled.',
      reportedBy: 'Mohammed Al-Fahad',
      createdAt: new Date(now.getTime() - 4.5 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      inspectionId: inspections[5].id,
      jobCardRef: 'JC-2026-0131',
      description: 'Battery health at 38% - risk of failure',
      severity: 'high',
      category: 'Electrical',
      status: 'open',
      resolutionNotes: '',
      reportedBy: 'Ahmed Al-Rashid',
      createdAt: new Date(now.getTime() - 95 * 60 * 60 * 1000).toISOString(),
      resolvedAt: null,
    },
    {
      inspectionId: inspections[5].id,
      jobCardRef: 'JC-2026-0131',
      description: 'Serpentine belt cracked and showing signs of glazing',
      severity: 'critical',
      category: 'Belts & Hoses',
      status: 'open',
      resolutionNotes: '',
      reportedBy: 'Ahmed Al-Rashid',
      createdAt: new Date(now.getTime() - 95 * 60 * 60 * 1000).toISOString(),
      resolvedAt: null,
    },
    {
      inspectionId: inspections[2].id,
      jobCardRef: 'JC-2026-0137',
      description: 'Cabin air filter showing early contamination',
      severity: 'low',
      category: 'Filters',
      status: 'closed',
      resolutionNotes: 'Customer informed. Scheduled replacement for next visit.',
      reportedBy: 'Ahmed Al-Rashid',
      createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
    },
    {
      inspectionId: inspections[0].id,
      jobCardRef: 'JC-2026-0142',
      description: 'Minor oil residue around drain plug area (cosmetic)',
      severity: 'low',
      category: 'Workmanship',
      status: 'resolved',
      resolutionNotes: 'Area cleaned. No active leak confirmed.',
      reportedBy: 'Ahmed Al-Rashid',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const def of demoDefects) {
    defectIdCounter++;
    defects.push({ id: `DEF-${defectIdCounter}`, ...def });
  }
}

// Seed on load
seedDemoData();

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/qc/inspections — List all inspections
router.get('/inspections', (req, res) => {
  const { status, inspector, result: resultFilter } = req.query;
  let filtered = [...inspections];

  if (status && status !== 'all') {
    filtered = filtered.filter(i => i.result === status);
  }
  if (inspector) {
    filtered = filtered.filter(i => i.inspector.toLowerCase().includes((inspector as string).toLowerCase()));
  }
  if (resultFilter && resultFilter !== 'all') {
    filtered = filtered.filter(i => i.result === resultFilter);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ inspections: filtered, total: filtered.length });
});

// POST /api/qc/inspections — Create new inspection
router.post('/inspections', (req, res) => {
  const { jobCardRef, vehicleInfo, serviceType, inspector, inspectorId, checklistId, notes } = req.body;

  if (!jobCardRef || !vehicleInfo || !serviceType) {
    return res.status(400).json({ error: 'jobCardRef, vehicleInfo, and serviceType are required' });
  }

  const template = checklistTemplates.find(t => t.id === checklistId || t.serviceType === serviceType);
  inspectionIdCounter++;
  const now = new Date().toISOString();

  const inspection: QCInspection = {
    id: `QCI-${inspectionIdCounter}`,
    jobCardRef,
    vehicleInfo,
    serviceType,
    inspector: inspector || 'Unassigned',
    inspectorId: inspectorId || '0',
    result: 'pending',
    notes: notes || '',
    checklistId: template?.id || 'CL-001',
    completedItems: 0,
    totalItems: template?.items.length || 0,
    inspectionTimeMinutes: 0,
    createdAt: now,
    updatedAt: now,
  };

  inspections.push(inspection);
  res.status(201).json({ inspection });
});

// PATCH /api/qc/inspections/:id — Update inspection result
router.patch('/inspections/:id', (req, res) => {
  const inspection = inspections.find(i => i.id === req.params.id);
  if (!inspection) {
    return res.status(404).json({ error: 'Inspection not found' });
  }

  const { result, notes, completedItems, inspectionTimeMinutes } = req.body;

  if (result && !['pass', 'fail', 'conditional', 'pending'].includes(result)) {
    return res.status(400).json({ error: 'Invalid result. Must be pass, fail, conditional, or pending' });
  }

  if (result) inspection.result = result;
  if (notes !== undefined) inspection.notes = notes;
  if (completedItems !== undefined) inspection.completedItems = completedItems;
  if (inspectionTimeMinutes !== undefined) inspection.inspectionTimeMinutes = inspectionTimeMinutes;
  inspection.updatedAt = new Date().toISOString();

  res.json({ inspection });
});

// GET /api/qc/checklists — Get checklist templates
router.get('/checklists', (req, res) => {
  const { serviceType } = req.query;
  let filtered = checklistTemplates;
  if (serviceType) {
    filtered = checklistTemplates.filter(c => c.serviceType === serviceType);
  }
  res.json({ checklists: filtered });
});

// GET /api/qc/stats — QC statistics
router.get('/stats', (req, res) => {
  const completed = inspections.filter(i => i.result !== 'pending');
  const passed = inspections.filter(i => i.result === 'pass').length;
  const failed = inspections.filter(i => i.result === 'fail').length;
  const conditional = inspections.filter(i => i.result === 'conditional').length;
  const pending = inspections.filter(i => i.result === 'pending').length;

  const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0;
  const reworkRate = completed.length > 0 ? Math.round((failed / completed.length) * 100) : 0;

  const inspectionTimes = completed.filter(i => i.inspectionTimeMinutes > 0).map(i => i.inspectionTimeMinutes);
  const avgInspectionTime = inspectionTimes.length > 0
    ? Math.round(inspectionTimes.reduce((a, b) => a + b, 0) / inspectionTimes.length)
    : 0;

  // Common defect categories
  const categoryCounts: Record<string, number> = {};
  for (const d of defects) {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  }
  const commonDefects = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Trend data (last 7 days)
  const trendData: { date: string; pass: number; fail: number; conditional: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const dayInspections = inspections.filter(insp => insp.createdAt.slice(0, 10) === dateStr);
    trendData.push({
      date: dayLabel,
      pass: dayInspections.filter(x => x.result === 'pass').length,
      fail: dayInspections.filter(x => x.result === 'fail').length,
      conditional: dayInspections.filter(x => x.result === 'conditional').length,
    });
  }

  // Open defects count
  const openDefects = defects.filter(d => d.status === 'open' || d.status === 'in_progress').length;

  res.json({
    totalInspections: inspections.length,
    passed,
    failed,
    conditional,
    pending,
    passRate,
    reworkRate,
    avgInspectionTime,
    commonDefects,
    trendData,
    openDefects,
    totalDefects: defects.length,
  });
});

// GET /api/qc/defects — List defects
router.get('/defects', (req, res) => {
  const { severity, status, category } = req.query;
  let filtered = [...defects];

  if (severity && severity !== 'all') {
    filtered = filtered.filter(d => d.severity === severity);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(d => d.status === status);
  }
  if (category) {
    filtered = filtered.filter(d => d.category.toLowerCase().includes((category as string).toLowerCase()));
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ defects: filtered, total: filtered.length });
});

// POST /api/qc/defects — Log a new defect
router.post('/defects', (req, res) => {
  const { inspectionId, jobCardRef, description, severity, category, reportedBy } = req.body;

  if (!description || !severity || !category) {
    return res.status(400).json({ error: 'description, severity, and category are required' });
  }

  if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
    return res.status(400).json({ error: 'Invalid severity. Must be low, medium, high, or critical' });
  }

  defectIdCounter++;
  const defect: QCDefect = {
    id: `DEF-${defectIdCounter}`,
    inspectionId: inspectionId || '',
    jobCardRef: jobCardRef || '',
    description,
    severity,
    category,
    status: 'open',
    resolutionNotes: '',
    reportedBy: reportedBy || 'System',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };

  defects.push(defect);
  res.status(201).json({ defect });
});

export default router;
