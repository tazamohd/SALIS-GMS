import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// GET /api/franchise/locations - List all garage locations
router.get('/franchise/locations', async (req, res) => {
  try {
    const locations = await db.execute(sql`
      SELECT id, name, address, phone, email, "isActive", "createdAt"
      FROM garages
      ORDER BY name
    `);
    res.json({ locations: locations.rows || [] });
  } catch (e) {
    res.json({ locations: [] });
  }
});

// GET /api/franchise/analytics - Cross-location analytics
router.get('/franchise/analytics', async (req, res) => {
  try {
    // Revenue by location
    const revenueByLocation = await db.execute(sql`
      SELECT g.name as location,
        COALESCE(SUM(CAST(i."totalAmount" AS numeric)), 0) as revenue,
        COUNT(i.id) as "invoiceCount"
      FROM garages g
      LEFT JOIN invoices i ON i."garageId" = g.id AND i.status = 'paid'
      GROUP BY g.id, g.name
      ORDER BY revenue DESC
    `);

    // Jobs by location
    const jobsByLocation = await db.execute(sql`
      SELECT g.name as location,
        COUNT(j.id) as "totalJobs",
        COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as "completedJobs",
        COUNT(CASE WHEN j.status = 'in_progress' THEN 1 END) as "activeJobs"
      FROM garages g
      LEFT JOIN job_cards j ON j."garageId" = g.id
      GROUP BY g.id, g.name
    `);

    // Customer count by location
    const customersByLocation = await db.execute(sql`
      SELECT g.name as location, COUNT(DISTINCT u.id) as customers
      FROM garages g
      LEFT JOIN users u ON u."garageId" = g.id AND u.role = 'customer'
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
    res.json({ revenueByLocation: [], jobsByLocation: [], customersByLocation: [], summary: { totalLocations: 0, totalRevenue: 0, totalJobs: 0, totalCustomers: 0 } });
  }
});

// GET /api/franchise/inventory-sharing - Cross-location inventory availability
router.get('/franchise/inventory-sharing', async (req, res) => {
  try {
    const inventory = await db.execute(sql`
      SELECT g.name as location, sp.name as "partName", sp."partNumber",
        spi."stockQuantity", spi."minQuantity", spi."sellingPrice"
      FROM spare_part_inventories spi
      JOIN spare_parts sp ON sp.id = spi."sparePartId"
      JOIN garages g ON g.id = spi."garageId"
      WHERE spi."stockQuantity" > 0
      ORDER BY sp.name, g.name
    `);
    res.json({ inventory: inventory.rows || [] });
  } catch (e) {
    res.json({ inventory: [] });
  }
});

// GET /api/franchise/performance - Location performance comparison
router.get('/franchise/performance', async (req, res) => {
  try {
    const performance = await db.execute(sql`
      SELECT g.name as location,
        COALESCE(SUM(CAST(i."totalAmount" AS numeric)), 0) as revenue,
        COUNT(DISTINCT j.id) as jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed,
        CASE WHEN COUNT(DISTINCT j.id) > 0
          THEN ROUND(COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END)::numeric / COUNT(DISTINCT j.id) * 100, 1)
          ELSE 0 END as "completionRate"
      FROM garages g
      LEFT JOIN job_cards j ON j."garageId" = g.id
      LEFT JOIN invoices i ON i."garageId" = g.id AND i.status = 'paid'
      GROUP BY g.id, g.name
      ORDER BY revenue DESC
    `);
    res.json({ performance: performance.rows || [] });
  } catch (e) {
    res.json({ performance: [] });
  }
});

export default router;
