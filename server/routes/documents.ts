import { Router, Request, Response } from 'express';

const router = Router();

// ── Types ────────────────────────────────────────────────────────────

interface Document {
  id: string;
  name: string;
  type: string;        // pdf, docx, xlsx, png, jpg, etc.
  category: string;    // invoices | contracts | insurance | vehicle-docs | employee-docs | compliance
  size: number;        // bytes
  uploadedBy: string;
  date: string;        // ISO date
  tags: string[];
  description: string;
}

const CATEGORIES = [
  { id: 'invoices',      label: 'Invoices',           icon: 'receipt',       color: '#0A5ED7' },
  { id: 'contracts',     label: 'Contracts',          icon: 'file-signature', color: '#7C3AED' },
  { id: 'insurance',     label: 'Insurance',          icon: 'shield',        color: '#059669' },
  { id: 'vehicle-docs',  label: 'Vehicle Documents',  icon: 'car',           color: '#D97706' },
  { id: 'employee-docs', label: 'Employee Documents', icon: 'users',         color: '#DC2626' },
  { id: 'compliance',    label: 'Compliance',         icon: 'clipboard-check', color: '#0891B2' },
] as const;

// ── In-Memory Storage with 12 Demo Documents ─────────────────────────

let documents: Document[] = [
  {
    id: 'doc-001',
    name: 'Invoice #2024-0156',
    type: 'pdf',
    category: 'invoices',
    size: 245_760,
    uploadedBy: 'Ahmed Al-Rashid',
    date: '2026-03-15T10:30:00Z',
    tags: ['customer', 'toyota', 'service'],
    description: 'Service invoice for Toyota Camry brake replacement',
  },
  {
    id: 'doc-002',
    name: 'Supplier Agreement - AutoParts Co',
    type: 'docx',
    category: 'contracts',
    size: 1_048_576,
    uploadedBy: 'Fatima Hassan',
    date: '2026-03-10T09:15:00Z',
    tags: ['supplier', 'agreement', 'parts'],
    description: 'Annual supply agreement with AutoParts Co for OEM parts',
  },
  {
    id: 'doc-003',
    name: 'Workshop Insurance Policy',
    type: 'pdf',
    category: 'insurance',
    size: 3_145_728,
    uploadedBy: 'Mohammed Saleh',
    date: '2026-02-28T14:00:00Z',
    tags: ['insurance', 'annual', 'workshop'],
    description: 'Comprehensive workshop insurance policy 2026',
  },
  {
    id: 'doc-004',
    name: 'Vehicle Registration - Fleet #12',
    type: 'pdf',
    category: 'vehicle-docs',
    size: 512_000,
    uploadedBy: 'Khalid Nasser',
    date: '2026-03-12T11:45:00Z',
    tags: ['fleet', 'registration', 'van'],
    description: 'Registration renewal for fleet service van #12',
  },
  {
    id: 'doc-005',
    name: 'Employee Onboarding - Ali Khan',
    type: 'pdf',
    category: 'employee-docs',
    size: 768_000,
    uploadedBy: 'HR Department',
    date: '2026-03-01T08:00:00Z',
    tags: ['onboarding', 'technician', 'new-hire'],
    description: 'Complete onboarding package for new technician Ali Khan',
  },
  {
    id: 'doc-006',
    name: 'Environmental Compliance Certificate',
    type: 'pdf',
    category: 'compliance',
    size: 409_600,
    uploadedBy: 'Mohammed Saleh',
    date: '2026-01-20T16:30:00Z',
    tags: ['environment', 'certificate', 'annual'],
    description: 'Annual environmental compliance certification for waste disposal',
  },
  {
    id: 'doc-007',
    name: 'Invoice #2024-0187',
    type: 'pdf',
    category: 'invoices',
    size: 198_656,
    uploadedBy: 'Ahmed Al-Rashid',
    date: '2026-03-18T13:20:00Z',
    tags: ['customer', 'nissan', 'oil-change'],
    description: 'Nissan Patrol full service with oil and filter change',
  },
  {
    id: 'doc-008',
    name: 'Lease Agreement - Workshop B',
    type: 'docx',
    category: 'contracts',
    size: 2_097_152,
    uploadedBy: 'Fatima Hassan',
    date: '2026-02-15T10:00:00Z',
    tags: ['lease', 'property', 'workshop'],
    description: 'Commercial lease agreement for Workshop B expansion',
  },
  {
    id: 'doc-009',
    name: 'Vehicle Inspection Report - BMW X5',
    type: 'xlsx',
    category: 'vehicle-docs',
    size: 348_160,
    uploadedBy: 'Technician Omar',
    date: '2026-03-14T15:10:00Z',
    tags: ['inspection', 'bmw', 'detailed'],
    description: 'Pre-purchase multi-point inspection report for BMW X5 2024',
  },
  {
    id: 'doc-010',
    name: 'Safety Training Certificate',
    type: 'pdf',
    category: 'employee-docs',
    size: 614_400,
    uploadedBy: 'HR Department',
    date: '2026-03-05T09:30:00Z',
    tags: ['safety', 'training', 'certificate'],
    description: 'Workshop safety training completion certificate for Q1 2026',
  },
  {
    id: 'doc-011',
    name: 'Fire Safety Compliance Report',
    type: 'pdf',
    category: 'compliance',
    size: 921_600,
    uploadedBy: 'Safety Officer',
    date: '2026-02-10T12:00:00Z',
    tags: ['fire-safety', 'inspection', 'compliance'],
    description: 'Annual fire safety inspection and compliance report',
  },
  {
    id: 'doc-012',
    name: 'Fleet Insurance Renewal',
    type: 'pdf',
    category: 'insurance',
    size: 1_536_000,
    uploadedBy: 'Fatima Hassan',
    date: '2026-03-08T10:45:00Z',
    tags: ['fleet', 'insurance', 'renewal'],
    description: 'Fleet vehicle comprehensive insurance renewal documentation',
  },
];

let nextId = 13;

// ── Helpers ──────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── Routes ───────────────────────────────────────────────────────────

// GET /documents/categories — list document categories
router.get('/documents/categories', (_req: Request, res: Response) => {
  const categoriesWithCounts = CATEGORIES.map((cat) => {
    const docs = documents.filter((d) => d.category === cat.id);
    return {
      ...cat,
      documentCount: docs.length,
      totalSize: docs.reduce((sum, d) => sum + d.size, 0),
      totalSizeFormatted: formatBytes(docs.reduce((sum, d) => sum + d.size, 0)),
      recentUploads: docs
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map((d) => ({ id: d.id, name: d.name, date: d.date })),
    };
  });
  res.json(categoriesWithCounts);
});

// GET /documents/stats — aggregate statistics
router.get('/documents/stats', (_req: Request, res: Response) => {
  const totalDocs = documents.length;
  const totalStorage = documents.reduce((sum, d) => sum + d.size, 0);
  const byCategory = CATEGORIES.map((cat) => {
    const docs = documents.filter((d) => d.category === cat.id);
    return {
      category: cat.id,
      label: cat.label,
      count: docs.length,
      size: docs.reduce((sum, d) => sum + d.size, 0),
      sizeFormatted: formatBytes(docs.reduce((sum, d) => sum + d.size, 0)),
    };
  });

  res.json({
    totalDocuments: totalDocs,
    totalStorage,
    totalStorageFormatted: formatBytes(totalStorage),
    byCategory,
  });
});

// GET /documents — list documents (supports ?search, ?category, ?tag query params)
router.get('/documents', (req: Request, res: Response) => {
  let result = [...documents];
  const { search, category, tag } = req.query;

  if (category && typeof category === 'string') {
    result = result.filter((d) => d.category === category);
  }
  if (tag && typeof tag === 'string') {
    result = result.filter((d) => d.tags.includes(tag));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.uploadedBy.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(result);
});

// GET /documents/:id — single document detail
router.get('/documents/:id', (req: Request, res: Response) => {
  const doc = documents.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

// POST /documents — upload document metadata (file upload is stub)
router.post('/documents', (req: Request, res: Response) => {
  const { name, type, category, size, tags, description } = req.body;

  if (!name || !type || !category) {
    return res.status(400).json({ error: 'name, type, and category are required' });
  }

  const validCategories = CATEGORIES.map((c) => c.id);
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  const newDoc: Document = {
    id: `doc-${String(nextId++).padStart(3, '0')}`,
    name,
    type: type || 'pdf',
    category,
    size: size || 0,
    uploadedBy: (req as any).user?.fullName || 'System User',
    date: new Date().toISOString(),
    tags: tags || [],
    description: description || '',
  };

  documents.push(newDoc);
  res.status(201).json(newDoc);
});

// DELETE /documents/:id — delete a document
router.delete('/documents/:id', (req: Request, res: Response) => {
  const index = documents.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const deleted = documents.splice(index, 1)[0];
  res.json({ message: 'Document deleted', document: deleted });
});

export default router;
