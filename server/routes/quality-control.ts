import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireManagerOrAbove } from '../middleware/requireRole';
import { storage } from '../storage';

const router = Router();

// ── Types (kept for clarity; tables defined in shared/schema.ts) ──────────

type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

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

// ── Checklist Templates (config — kept in-memory) ─────────────────────────

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

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/qc/inspections — List all inspections
router.get('/inspections', isAuthenticated, async (req, res) => {
  const { status, inspector, result: resultFilter } = req.query;
  try {
    // Both 'status' and 'result' query params filter by inspection.result
    const resultParam = (resultFilter as string) || (status as string) || undefined;
    const inspections = await storage.listQcInspections({
      result: resultParam,
      inspector: inspector ? String(inspector) : undefined,
    });
    res.json({ inspections, total: inspections.length });
  } catch (err) {
    console.error('QC inspections list error:', err);
    res.status(500).json({ error: 'Failed to list inspections' });
  }
});

// POST /api/qc/inspections — Create new inspection
router.post('/inspections', isAuthenticated, async (req, res) => {
  const { jobCardRef, vehicleInfo, serviceType, inspector, inspectorId, checklistId, notes } = req.body;

  if (!jobCardRef || !vehicleInfo || !serviceType) {
    return res.status(400).json({ error: 'jobCardRef, vehicleInfo, and serviceType are required' });
  }

  const template = checklistTemplates.find(t => t.id === checklistId || t.serviceType === serviceType);

  try {
    const inspection = await storage.createQcInspection({
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
    });
    res.status(201).json({ inspection });
  } catch (err) {
    console.error('QC inspection create error:', err);
    res.status(500).json({ error: 'Failed to create inspection' });
  }
});

// PATCH /api/qc/inspections/:id — Update inspection result (manager+)
router.patch('/inspections/:id', isAuthenticated, requireManagerOrAbove, async (req, res) => {
  const { result, notes, completedItems, inspectionTimeMinutes } = req.body;

  if (result && !['pass', 'fail', 'conditional', 'pending'].includes(result)) {
    return res.status(400).json({ error: 'Invalid result. Must be pass, fail, conditional, or pending' });
  }

  try {
    const patch: Record<string, unknown> = {};
    if (result) patch.result = result;
    if (notes !== undefined) patch.notes = notes;
    if (completedItems !== undefined) patch.completedItems = completedItems;
    if (inspectionTimeMinutes !== undefined) patch.inspectionTimeMinutes = inspectionTimeMinutes;

    const inspection = await storage.updateQcInspection(req.params.id, patch as any);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json({ inspection });
  } catch (err) {
    console.error('QC inspection update error:', err);
    res.status(500).json({ error: 'Failed to update inspection' });
  }
});

// GET /api/qc/checklists — Get checklist templates
router.get('/checklists', isAuthenticated, (req, res) => {
  const { serviceType } = req.query;
  let filtered = checklistTemplates;
  if (serviceType) {
    filtered = checklistTemplates.filter(c => c.serviceType === serviceType);
  }
  res.json({ checklists: filtered });
});

// GET /api/qc/stats — QC statistics
router.get('/stats', isAuthenticated, async (_req, res) => {
  try {
    const [inspections, defects] = await Promise.all([
      storage.listQcInspections(),
      storage.listQcDefects(),
    ]);

    const completed = inspections.filter((i: any) => i.result !== 'pending');
    const passed = inspections.filter((i: any) => i.result === 'pass').length;
    const failed = inspections.filter((i: any) => i.result === 'fail').length;
    const conditional = inspections.filter((i: any) => i.result === 'conditional').length;
    const pending = inspections.filter((i: any) => i.result === 'pending').length;

    const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0;
    const reworkRate = completed.length > 0 ? Math.round((failed / completed.length) * 100) : 0;

    const inspectionTimes = completed.filter((i: any) => (i.inspectionTimeMinutes ?? 0) > 0).map((i: any) => i.inspectionTimeMinutes ?? 0);
    const avgInspectionTime = inspectionTimes.length > 0
      ? Math.round(inspectionTimes.reduce((a: number, b: number) => a + b, 0) / inspectionTimes.length)
      : 0;

    const categoryCounts: Record<string, number> = {};
    for (const d of defects as any[]) {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    }
    const commonDefects = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const trendData: { date: string; pass: number; fail: number; conditional: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayInspections = inspections.filter((insp: any) => {
        const created = insp.createdAt instanceof Date ? insp.createdAt.toISOString() : String(insp.createdAt);
        return created.slice(0, 10) === dateStr;
      });
      trendData.push({
        date: dayLabel,
        pass: dayInspections.filter((x: any) => x.result === 'pass').length,
        fail: dayInspections.filter((x: any) => x.result === 'fail').length,
        conditional: dayInspections.filter((x: any) => x.result === 'conditional').length,
      });
    }

    const openDefects = (defects as any[]).filter(d => d.status === 'open' || d.status === 'in_progress').length;

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
  } catch (err) {
    console.error('QC stats error:', err);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// GET /api/qc/defects — List defects
router.get('/defects', isAuthenticated, async (req, res) => {
  const { severity, status, category } = req.query;
  try {
    const defects = await storage.listQcDefects({
      severity: severity ? String(severity) : undefined,
      status: status ? String(status) : undefined,
      category: category ? String(category) : undefined,
    });
    res.json({ defects, total: defects.length });
  } catch (err) {
    console.error('QC defects list error:', err);
    res.status(500).json({ error: 'Failed to list defects' });
  }
});

// POST /api/qc/defects — Log a new defect
router.post('/defects', isAuthenticated, async (req, res) => {
  const { inspectionId, jobCardRef, description, severity, category, reportedBy } = req.body;

  if (!description || !severity || !category) {
    return res.status(400).json({ error: 'description, severity, and category are required' });
  }

  if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
    return res.status(400).json({ error: 'Invalid severity. Must be low, medium, high, or critical' });
  }

  try {
    const defect = await storage.createQcDefect({
      inspectionId: inspectionId || null,
      jobCardRef: jobCardRef || null,
      description,
      severity: severity as DefectSeverity,
      category,
      status: 'open',
      reportedBy: reportedBy || 'System',
    });
    res.status(201).json({ defect });
  } catch (err) {
    console.error('QC defect create error:', err);
    res.status(500).json({ error: 'Failed to create defect' });
  }
});

export default router;
