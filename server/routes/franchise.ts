import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../auth';

const router = Router();

/**
 * Franchise HQ views: deliberately cross-garage, so they are gated to
 * PLATFORM_ADMIN — with plain isAuthenticated any tenant could read every
 * other garage's revenue, jobs and stock. All queries are written against
 * the real snake_case columns; the original camelCase identifiers threw on
 * every request and the catch blocks served empty payloads.
 */
function requirePlatformAdmin(req: any, res: any): boolean {
  if ((req.user as any)?.role !== 'PLATFORM_ADMIN') {
    res.status(403).json({ message: 'Franchise views require platform admin' });
    return false;
  }
  return true;
}

// GET /api/franchise/locations - List all garage locations
router.get('/franchise/locations', isAuthenticated, async (req, res) => {
  if (!requirePlatformAdmin(req, res)) return;
  try {
    // garages carries name/country/city — there are no address/phone columns.
    const locations = await db.execute(sql`
      SELECT id, name, country, city,
        is_active AS "isActive", created_at AS "createdAt"
      FROM garages
      ORDER BY name
    `);
    res.json({ locations: locations.rows || [] });
  } catch (e) {
    console.error('franchise locations error:', e);
    res.status(500).json({ locations: [] });
  }
});

// GET /api/franchise/analytics - Cross-location analytics
router.get('/franchise/analytics', isAuthenticated, async (req, res) => {
  if (!requirePlatformAdmin(req, res)) return;
  try {
    const revenueByLocation = await db.execute(sql`
      SELECT g.name as location,
        COALESCE(SUM(i.total_amount::numeric), 0) as revenue,
        COUNT(i.id) as "invoiceCount"
      FROM garages g
      LEFT JOIN invoices i ON i.garage_id = g.id AND i.status = 'paid'
      GROUP BY g.id, g.name
      ORDER BY revenue DESC
    `);

    const jobsByLocation = await db.execute(sql`
      SELECT g.name as location,
        COUNT(j.id) as "totalJobs",
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as "completedJobs",
        COUNT(CASE WHEN j.status = 'in_progress' THEN 1 END) as "activeJobs"
      FROM garages g
      LEFT JOIN job_cards j ON j.garage_id = g.id
      GROUP BY g.id, g.name
    `);

    const customersByLocation = await db.execute(sql`
      SELECT g.name as location, COUNT(DISTINCT u.id) as customers
      FROM garages g
      LEFT JOIN users u ON u.garage_id = g.id
        AND (u.user_type = 'customer' OR u.role = 'CUSTOMER')
      GROUP BY g.id, g.name
    `);

    res.json({
      revenueByLocation: revenueByLocation.rows || [],
      jobsByLocation: jobsByLocation.rows || [],
      customersByLocation: customersByLocation.rows || [],
      summary: {
        totalLocations: (revenueByLocation.rows || []).length,
        totalRevenue: (revenueByLocation.rows || []).reduce((s: number, r: any) => s + Number(r.revenue || 0), 0),
        totalJobs: (jobsByLocation.rows || []).reduce((s: number, r: any) => s + Number(r.totalJobs || 0), 0),
        totalCustomers: (customersByLocation.rows || []).reduce((s: number, r: any) => s + Number(r.customers || 0), 0),
      }
    });
  } catch (e) {
    console.error('franchise analytics error:', e);
    res.status(500).json({ revenueByLocation: [], jobsByLocation: [], customersByLocation: [], summary: { totalLocations: 0, totalRevenue: 0, totalJobs: 0, totalCustomers: 0 } });
  }
});

// GET /api/franchise/inventory-sharing - Cross-location inventory availability
router.get('/franchise/inventory-sharing', isAuthenticated, async (req, res) => {
  if (!requirePlatformAdmin(req, res)) return;
  try {
    // spare_parts identifies parts by sku; per-garage stock lives on
    // spare_part_inventories (stock_quantity / min_threshold / selling_price).
    const inventory = await db.execute(sql`
      SELECT g.name as location, sp.name as "partName", sp.sku,
        spi.stock_quantity AS "stockQuantity",
        spi.min_threshold AS "minQuantity",
        spi.selling_price AS "sellingPrice"
      FROM spare_part_inventories spi
      JOIN spare_parts sp ON sp.id = spi.spare_part_id
      JOIN garages g ON g.id = spi.garage_id
      WHERE spi.stock_quantity > 0
      ORDER BY sp.name, g.name
    `);
    res.json({ inventory: inventory.rows || [] });
  } catch (e) {
    console.error('franchise inventory error:', e);
    res.status(500).json({ inventory: [] });
  }
});

// GET /api/franchise/performance - Location performance comparison
router.get('/franchise/performance', isAuthenticated, async (req, res) => {
  if (!requirePlatformAdmin(req, res)) return;
  try {
    const performance = await db.execute(sql`
      SELECT g.name as location,
        COALESCE(SUM(i.total_amount::numeric), 0) as revenue,
        COUNT(DISTINCT j.id) as jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed,
        CASE WHEN COUNT(DISTINCT j.id) > 0
          THEN ROUND(COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END)::numeric / COUNT(DISTINCT j.id) * 100, 1)
          ELSE 0 END as "completionRate"
      FROM garages g
      LEFT JOIN job_cards j ON j.garage_id = g.id
      LEFT JOIN invoices i ON i.garage_id = g.id AND i.status = 'paid'
      GROUP BY g.id, g.name
      ORDER BY revenue DESC
    `);
    res.json({ performance: performance.rows || [] });
  } catch (e) {
    console.error('franchise performance error:', e);
    res.status(500).json({ performance: [] });
  }
});

export default router;
