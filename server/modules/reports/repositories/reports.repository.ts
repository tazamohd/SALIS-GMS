/**
 * Reports repository (Phase E4). The only data-layer access for the management
 * reporting surface; owns every aggregate query behind the revenue, technician,
 * inventory-turnover, customer-analytics, and executive-summary reports. Query
 * text is lifted verbatim from `server/routes/reports.ts`.
 */

import { db } from '../../../db';
import { sql } from 'drizzle-orm';

type Row = Record<string, unknown>;

export interface SummaryRows {
  revenue: Row[];
  jobs: Row[];
  customers: Row[];
  inventory: Row[];
}

export interface IReportsRepository {
  revenue(garageId: string, dateFormat: string): Promise<Row[]>;
  technicianPerformance(garageId: string): Promise<Row[]>;
  inventoryTurnover(garageId: string): Promise<Row[]>;
  customerAnalytics(garageId: string): Promise<Row[]>;
  summaryRows(garageId: string): Promise<SummaryRows>;
}

export class ReportsRepository implements IReportsRepository {
  async revenue(garageId: string, dateFormat: string) {
    // Revenue is VAT-EXCLUSIVE net sales (total minus output VAT) so it agrees
    // with the P&L / journal definition (revenue = total - tax). Recognition
    // basis is cash (status = 'paid').
    const revenue = await db.execute(sql`
      SELECT TO_CHAR(i.invoice_date, ${dateFormat}) as period,
        COUNT(i.id) as "invoiceCount",
        COALESCE(SUM(CAST(i.total_amount AS numeric) - CAST(i.tax_amount AS numeric)), 0) as revenue,
        COALESCE(SUM(CAST(i.tax_amount AS numeric)), 0) as tax
      FROM invoices i
      WHERE i.garage_id = ${garageId} AND i.status = 'paid'
      GROUP BY period ORDER BY period
    `);
    return revenue.rows || [];
  }

  async technicianPerformance(garageId: string) {
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
    return performance.rows || [];
  }

  async inventoryTurnover(garageId: string) {
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
    return turnover.rows || [];
  }

  async customerAnalytics(garageId: string) {
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
    return customers.rows || [];
  }

  async summaryRows(garageId: string): Promise<SummaryRows> {
    const [revenue, jobs, customers, inventory] = await Promise.all([
      // VAT-exclusive net revenue, consistent with the revenue report and the P&L.
      db.execute(sql`SELECT COALESCE(SUM(CAST(total_amount AS numeric) - CAST(tax_amount AS numeric)), 0) as total FROM invoices WHERE garage_id = ${garageId} AND status = 'paid'`),
      db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM job_cards WHERE garage_id = ${garageId}`),
      db.execute(sql`SELECT COUNT(*) as total FROM users WHERE garage_id = ${garageId} AND role = 'customer'`),
      db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN stock_quantity <= min_threshold THEN 1 END) as "lowStock" FROM spare_part_inventories WHERE garage_id = ${garageId}`),
    ]);
    return {
      revenue: revenue.rows || [],
      jobs: jobs.rows || [],
      customers: customers.rows || [],
      inventory: inventory.rows || [],
    };
  }
}
