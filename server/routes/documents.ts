import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';

const router = Router();

// NOTE: this router is mounted on "/api", so a router-level `router.use(...)`
// would run on every /api request. Apply `isAuthenticated` per-route instead so
// only the document endpoints are gated. Previously these endpoints (including
// DELETE) were reachable unauthenticated.

const CATEGORIES = [
  { id: 'invoices',      label: 'Invoices',           icon: 'receipt',         color: '#0A5ED7' },
  { id: 'contracts',     label: 'Contracts',          icon: 'file-signature',  color: '#7C3AED' },
  { id: 'insurance',     label: 'Insurance',          icon: 'shield',          color: '#059669' },
  { id: 'vehicle-docs',  label: 'Vehicle Documents',  icon: 'car',             color: '#D97706' },
  { id: 'employee-docs', label: 'Employee Documents', icon: 'users',           color: '#DC2626' },
  { id: 'compliance',    label: 'Compliance',         icon: 'clipboard-check', color: '#0891B2' },
] as const;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function toView(doc: any) {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    category: doc.category,
    size: doc.size,
    uploadedBy: doc.uploadedBy,
    date: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    description: doc.description || '',
  };
}

// GET /documents/categories — list document categories with counts
router.get('/documents/categories', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const all = await storage.listDocumentLibraryItems();
    const result = CATEGORIES.map((cat) => {
      const docs = all.filter((d: any) => d.category === cat.id);
      const total = docs.reduce((sum: number, d: any) => sum + (d.size ?? 0), 0);
      return {
        ...cat,
        documentCount: docs.length,
        totalSize: total,
        totalSizeFormatted: formatBytes(total),
        recentUploads: docs
          .map(toView)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
          .map((d) => ({ id: d.id, name: d.name, date: d.date })),
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Documents categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /documents/stats — aggregate statistics
router.get('/documents/stats', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const all = await storage.listDocumentLibraryItems();
    const totalStorage = all.reduce((sum: number, d: any) => sum + (d.size ?? 0), 0);
    const byCategory = CATEGORIES.map((cat) => {
      const docs = all.filter((d: any) => d.category === cat.id);
      const size = docs.reduce((sum: number, d: any) => sum + (d.size ?? 0), 0);
      return {
        category: cat.id,
        label: cat.label,
        count: docs.length,
        size,
        sizeFormatted: formatBytes(size),
      };
    });
    res.json({
      totalDocuments: all.length,
      totalStorage,
      totalStorageFormatted: formatBytes(totalStorage),
      byCategory,
    });
  } catch (err) {
    console.error('Documents stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /documents — list documents (supports ?search, ?category, ?tag)
router.get('/documents', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { search, category, tag } = req.query;
    const rows = await storage.listDocumentLibraryItems({
      category: category ? String(category) : undefined,
      tag: tag ? String(tag) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(rows.map(toView));
  } catch (err) {
    console.error('Documents list error:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// GET /documents/:id — single document detail
router.get('/documents/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const doc = await storage.getDocumentLibraryItem(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(toView(doc));
  } catch (err) {
    console.error('Documents get error:', err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// POST /documents — upload document metadata (file upload is stub)
router.post('/documents', isAuthenticated, async (req: Request, res: Response) => {
  const { name, type, category, size, tags, description } = req.body;

  if (!name || !type || !category) {
    return res.status(400).json({ error: 'name, type, and category are required' });
  }

  const validCategories = CATEGORIES.map((c) => c.id);
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  try {
    const doc = await storage.createDocumentLibraryItem({
      name,
      type: type || 'pdf',
      category,
      size: typeof size === 'number' ? size : 0,
      uploadedBy: (req as any).user?.fullName || 'System User',
      tags: Array.isArray(tags) ? tags : [],
      description: description || '',
    });
    res.status(201).json(toView(doc));
  } catch (err) {
    console.error('Documents create error:', err);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// DELETE /documents/:id — delete a document
router.delete('/documents/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteDocumentLibraryItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted', document: toView(deleted) });
  } catch (err) {
    console.error('Documents delete error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
