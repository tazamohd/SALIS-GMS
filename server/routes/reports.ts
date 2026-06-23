import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Reports expose garage-wide financials and customer PII → management-only (audit C3).
// Financial/aggregate reports: ADMIN/MANAGER/ACCOUNTANT. People reports: ADMIN/MANAGER.
const requireFinancialRole = requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']);
const requireManagementRole = requireRole(['ADMIN', 'MANAGER']);

// Tenant guard: derive garageId from the session; never fall back to a literal id
// (the old `|| '1'` fallback leaked garage 1's data to roleless principals — audit C4).
function resolveGarageId(req: any, res: any): string | null {
  const garageId = req.user?.garageId;
  if (!garageId) {
    res.status(403).json({ message: 'No garage associated' });
    return null;
  }
  return garageId;
}

// GET /api/reports/revenue - Revenue report with date range
router.get('/reports/revenue', isAuthenticated, requireFinancialRole, async (req, res) => {
  const garageId = resolveGarageId(req, res);
  if (!garageId) return;
  const { groupBy = 'month' } = req.query;
  try {
    const dateFormat = groupBy === 'day' ? 'YYYY-MM-DD' : groupBy === 'week' ? 'IYYY-IW' : 'YYYY-MM';
    const revenue = await db.execute(sql`
      SELECT TO_CHAR(i.invoice_date, ${dateFormat}) as period,
        COUNT(i.id) as "invoiceCount",
        COALESCE(SUM(CAST(i.total_amount AS numeric)), 0) as revenue,
        COALESCE(SUM(CAST(i.tax_amount AS numeric)), 0) as tax
      FROM invoices i
      WHERE i.garage_id = ${garageId} AND i.status = 'paid'
      GROUP BY period ORDER BY period
    `);
    res.json({ data: revenue.rows || [], groupBy });
  } catch (e) { console.error('[reports/revenue] query failed', e); res.status(500).json({ message: 'Failed to load revenue report' }); }
});

// GET /api/reports/technician-performance
router.get('/reports/technician-performance', isAuthenticated, requireManagementRole, async (req, res) => {
  const garageId = resolveGarageId(req, res);
  if (!garageId) return;
  try {
    const performance = await db.execute(sql`
      SELECT u.id, u.full_name as name,
        COUNT(j.id) as "totalJobs",
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as "completedJobs",
        COALESCE(AVG(EXTRACT(EPOCH FROM (j.completed_at - j.created_at))/3600), 0) as "avgHours",
        COALESCE(SUM(CAST(j.total_cost AS numeric)), 0) as "totalRevenue"
      FROM users u
      LEFT JOIN job_cards j ON j.assigned_to = u.id
      WHERE u.garage_id = ${garageId} AND u.role = 'technician'
      GROUP BY u.id, u.full_name
      ORDER BY "completedJobs" DESC
    `);
    res.json({ data: performance.rows || [] });
  } catch (e) { console.error('[reports/technician-performance] query failed', e); res.status(500).json({ message: 'Failed to load report' }); }
});

// GET /api/reports/inventory-turnover
router.get('/reports/inventory-turnover', isAuthenticated, requireFinancialRole, async (req, res) => {
  const garageId = resolveGarageId(req, res);
  if (!garageId) return;
  try {
    const turnover = await db.execute(sql`
      SELECT sp.name, sp.sku as "partNumber", sp.category,
        spi.stock_quantity, spi.min_threshold,
        CAST(spi.selling_price AS numeric) as "sellingPrice",
        CAST(spi.cost_price AS numeric) as "costPrice",
        CASE WHEN spi.stock_quantity <= spi.min_threshold THEN 'low'
             WHEN spi.stock_quantity <= spi.min_threshold * 2 THEN 'medium'
             ELSE 'healthy' END as "stockStatus"
      FROM spare_part_inventories spi
      JOIN spare_parts sp ON sp.id = spi.spare_part_id
      WHERE spi.garage_id = ${garageId}
      ORDER BY spi.stock_quantity ASC
    `);
    res.json({ data: turnover.rows || [] });
  } catch (e) { console.error('[reports/inventory-turnover] query failed', e); res.status(500).json({ message: 'Failed to load report' }); }
});

// GET /api/reports/customer-analytics
router.get('/reports/customer-analytics', isAuthenticated, requireManagementRole, async (req, res) => {
  const garageId = resolveGarageId(req, res);
  if (!garageId) return;
  try {
    const customers = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email,
        COUNT(DISTINCT j.id) as "totalVisits",
        COALESCE(SUM(CAST(i.total_amount AS numeric)), 0) as "totalSpent",
        MAX(j.created_at) as "lastVisit"
      FROM users u
      LEFT JOIN job_cards j ON j.customer_id = u.id
      LEFT JOIN invoices i ON i.customer_id = u.id AND i.status = 'paid'
      WHERE u.garage_id = ${garageId} AND u.role = 'customer'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY "totalSpent" DESC
      LIMIT 50
    `);
    res.json({ data: customers.rows || [] });
  } catch (e) { console.error('[reports/customer-analytics] query failed', e); res.status(500).json({ message: 'Failed to load report' }); }
});

// GET /api/reports/summary - Executive summary
router.get('/reports/summary', isAuthenticated, requireFinancialRole, async (req, res) => {
  const garageId = resolveGarageId(req, res);
  if (!garageId) return;
  try {
    const [revenue, jobs, customers, inventory] = await Promise.all([
      db.execute(sql`SELECT COALESCE(SUM(CAST(total_amount AS numeric)), 0) as total FROM invoices WHERE garage_id = ${garageId} AND status = 'paid'`),
      db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM job_cards WHERE garage_id = ${garageId}`),
      db.execute(sql`SELECT COUNT(*) as total FROM users WHERE garage_id = ${garageId} AND role = 'customer'`),
      db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN stock_quantity <= min_threshold THEN 1 END) as "lowStock" FROM spare_part_inventories WHERE garage_id = ${garageId}`),
    ]);
    res.json({
      totalRevenue: Number((revenue.rows as any)?.[0]?.total || 0),
      totalJobs: Number((jobs.rows as any)?.[0]?.total || 0),
      completedJobs: Number((jobs.rows as any)?.[0]?.completed || 0),
      totalCustomers: Number((customers.rows as any)?.[0]?.total || 0),
      totalParts: Number((inventory.rows as any)?.[0]?.total || 0),
      lowStockParts: Number((inventory.rows as any)?.[0]?.lowStock || 0),
    });
  } catch (e) { console.error('[reports/summary] query failed', e); res.status(500).json({ message: 'Failed to load summary report' }); }
});

export default router;
