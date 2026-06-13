import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// GET /api/reports/revenue - Revenue report with date range
router.get('/reports/revenue', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  const { from, to, groupBy = 'month' } = req.query;
  try {
    const dateFormat = groupBy === 'day' ? 'YYYY-MM-DD' : groupBy === 'week' ? 'IYYY-IW' : 'YYYY-MM';
    const revenue = await db.execute(sql`
      SELECT TO_CHAR(i."invoiceDate", ${dateFormat}) as period,
        COUNT(i.id) as "invoiceCount",
        COALESCE(SUM(CAST(i."totalAmount" AS numeric)), 0) as revenue,
        COALESCE(SUM(CAST(i."taxAmount" AS numeric)), 0) as tax
      FROM invoices i
      WHERE i."garageId" = ${garageId} AND i.status = 'paid'
      GROUP BY period ORDER BY period
    `);
    res.json({ data: revenue.rows || [], groupBy });
  } catch (e) { res.json({ data: [], groupBy }); }
});

// GET /api/reports/technician-performance
router.get('/reports/technician-performance', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  try {
    const performance = await db.execute(sql`
      SELECT u.id, u."fullName" as name,
        COUNT(j.id) as "totalJobs",
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as "completedJobs",
        COALESCE(AVG(EXTRACT(EPOCH FROM (j."completedAt" - j."createdAt"))/3600), 0) as "avgHours",
        COALESCE(SUM(CAST(j."totalCost" AS numeric)), 0) as "totalRevenue"
      FROM users u
      LEFT JOIN job_cards j ON j."assignedTechnicianId" = u.id
      WHERE u."garageId" = ${garageId} AND u.role = 'technician'
      GROUP BY u.id, u."fullName"
      ORDER BY "completedJobs" DESC
    `);
    res.json({ data: performance.rows || [] });
  } catch (e) { res.json({ data: [] }); }
});

// GET /api/reports/inventory-turnover
router.get('/reports/inventory-turnover', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  try {
    const turnover = await db.execute(sql`
      SELECT sp.name, sp."partNumber", sp.category,
        spi."stockQuantity", spi."minQuantity",
        CAST(spi."sellingPrice" AS numeric) as "sellingPrice",
        CAST(spi."costPrice" AS numeric) as "costPrice",
        CASE WHEN spi."stockQuantity" <= spi."minQuantity" THEN 'low'
             WHEN spi."stockQuantity" <= spi."minQuantity" * 2 THEN 'medium'
             ELSE 'healthy' END as "stockStatus"
      FROM spare_part_inventories spi
      JOIN spare_parts sp ON sp.id = spi."sparePartId"
      WHERE spi."garageId" = ${garageId}
      ORDER BY spi."stockQuantity" ASC
    `);
    res.json({ data: turnover.rows || [] });
  } catch (e) { res.json({ data: [] }); }
});

// GET /api/reports/customer-analytics
router.get('/reports/customer-analytics', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  try {
    const customers = await db.execute(sql`
      SELECT u.id, u."fullName" as name, u.email,
        COUNT(DISTINCT j.id) as "totalVisits",
        COALESCE(SUM(CAST(i."totalAmount" AS numeric)), 0) as "totalSpent",
        MAX(j."createdAt") as "lastVisit"
      FROM users u
      LEFT JOIN job_cards j ON j."customerId" = u.id
      LEFT JOIN invoices i ON i."customerId" = u.id AND i.status = 'paid'
      WHERE u."garageId" = ${garageId} AND u.role = 'customer'
      GROUP BY u.id, u."fullName", u.email
      ORDER BY "totalSpent" DESC
      LIMIT 50
    `);
    res.json({ data: customers.rows || [] });
  } catch (e) { res.json({ data: [] }); }
});

// GET /api/reports/summary - Executive summary
router.get('/reports/summary', async (req, res) => {
  const garageId = (req as any).user?.garageId;
  if (!garageId) return res.status(403).json({ message: 'Garage context required' });
  try {
    const [revenue, jobs, customers, inventory] = await Promise.all([
      db.execute(sql`SELECT COALESCE(SUM(CAST("totalAmount" AS numeric)), 0) as total FROM invoices WHERE "garageId" = ${garageId} AND status = 'paid'`),
      db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM job_cards WHERE "garageId" = ${garageId}`),
      db.execute(sql`SELECT COUNT(*) as total FROM users WHERE "garageId" = ${garageId} AND role = 'customer'`),
      db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN "stockQuantity" <= "minQuantity" THEN 1 END) as "lowStock" FROM spare_part_inventories WHERE "garageId" = ${garageId}`),
    ]);
    res.json({
      totalRevenue: Number((revenue.rows as any)?.[0]?.total || 0),
      totalJobs: Number((jobs.rows as any)?.[0]?.total || 0),
      completedJobs: Number((jobs.rows as any)?.[0]?.completed || 0),
      totalCustomers: Number((customers.rows as any)?.[0]?.total || 0),
      totalParts: Number((inventory.rows as any)?.[0]?.total || 0),
      lowStockParts: Number((inventory.rows as any)?.[0]?.lowStock || 0),
    });
  } catch (e) { res.json({ totalRevenue: 0, totalJobs: 0, completedJobs: 0, totalCustomers: 0, totalParts: 0, lowStockParts: 0 }); }
});

export default router;
