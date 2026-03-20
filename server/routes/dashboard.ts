import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/dashboard/summary
 * Aggregated KPIs: today's revenue, jobs in progress, appointments today,
 * pending invoices, low stock items, technician utilization.
 */
router.get('/dashboard/summary', async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's revenue from paid invoices
    const revenueResult = await db.execute(sql`
      SELECT COALESCE(SUM(CAST("total_amount" AS numeric)), 0) as "todayRevenue"
      FROM invoices
      WHERE "garage_id" = ${garageId}
        AND status = 'paid'
        AND "paid_at" >= ${todayStart.toISOString()}
        AND "paid_at" <= ${todayEnd.toISOString()}
    `);

    // Jobs in progress
    const jobsResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'in_progress') as "jobsInProgress",
        COUNT(*) FILTER (WHERE status = 'pending') as "pendingJobs",
        COUNT(*) FILTER (WHERE status = 'completed' AND "completed_at" >= ${todayStart.toISOString()}) as "completedToday"
      FROM job_cards
      WHERE "garage_id" = ${garageId}
    `);

    // Appointments today
    const apptResult = await db.execute(sql`
      SELECT COUNT(*) as "appointmentsToday"
      FROM appointments
      WHERE "garage_id" = ${garageId}
        AND "appointment_date" >= ${todayStart.toISOString()}
        AND "appointment_date" <= ${todayEnd.toISOString()}
    `);

    // Pending invoices (draft or sent, not paid)
    const pendingInvResult = await db.execute(sql`
      SELECT COUNT(*) as "pendingInvoices",
        COALESCE(SUM(CAST("balance_amount" AS numeric)), 0) as "outstandingAmount"
      FROM invoices
      WHERE "garage_id" = ${garageId}
        AND status IN ('draft', 'sent', 'overdue')
    `);

    // Low stock items
    const lowStockResult = await db.execute(sql`
      SELECT COUNT(*) as "lowStockItems"
      FROM spare_part_inventories
      WHERE "garage_id" = ${garageId}
        AND "stock_quantity" <= "min_threshold"
        AND "is_enabled" = true
    `);

    // Technician utilization (active task assignments / total technicians)
    const techResult = await db.execute(sql`
      SELECT
        COUNT(DISTINCT ta."assigned_to") FILTER (WHERE ta.status = 'in_progress') as "activeTechs",
        COUNT(DISTINCT u.id) as "totalTechs"
      FROM users u
      LEFT JOIN task_assignments ta ON ta."assigned_to" = u.id AND ta.status = 'in_progress'
      WHERE u."user_type" = 'technician'
    `);

    const jobRow = (jobsResult.rows?.[0] || {}) as any;
    const techRow = (techResult.rows?.[0] || {}) as any;
    const totalTechs = parseInt(techRow.totalTechs || '1') || 1;
    const activeTechs = parseInt(techRow.activeTechs || '0');
    const utilization = Math.round((activeTechs / totalTechs) * 100);

    res.json({
      todayRevenue: parseFloat((revenueResult.rows?.[0] as any)?.todayRevenue || '0'),
      jobsInProgress: parseInt(jobRow.jobsInProgress || '0'),
      pendingJobs: parseInt(jobRow.pendingJobs || '0'),
      completedToday: parseInt(jobRow.completedToday || '0'),
      appointmentsToday: parseInt((apptResult.rows?.[0] as any)?.appointmentsToday || '0'),
      pendingInvoices: parseInt((pendingInvResult.rows?.[0] as any)?.pendingInvoices || '0'),
      outstandingAmount: parseFloat((pendingInvResult.rows?.[0] as any)?.outstandingAmount || '0'),
      lowStockItems: parseInt((lowStockResult.rows?.[0] as any)?.lowStockItems || '0'),
      technicianUtilization: utilization,
      activeTechnicians: activeTechs,
      totalTechnicians: totalTechs,
    });
  } catch (e: any) {
    console.error('Dashboard summary error:', e.message);
    res.json({
      todayRevenue: 0,
      jobsInProgress: 0,
      pendingJobs: 0,
      completedToday: 0,
      appointmentsToday: 0,
      pendingInvoices: 0,
      outstandingAmount: 0,
      lowStockItems: 0,
      technicianUtilization: 0,
      activeTechnicians: 0,
      totalTechnicians: 0,
    });
  }
});

/**
 * GET /api/dashboard/recent-activity
 * Last 10 activities across all modules (job updates, payments, appointments, etc.)
 */
router.get('/dashboard/recent-activity', async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
  try {
    const activities = await db.execute(sql`
      (
        SELECT 'job_update' as type,
          'Job ' || COALESCE(j."job_number", '') || ' moved to ' || j.status as description,
          j."updated_at" as timestamp,
          j.id as "entityId",
          'job_card' as "entityType",
          j.status as status
        FROM job_cards j
        WHERE j."garage_id" = ${garageId}
        ORDER BY j."updated_at" DESC NULLS LAST
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'payment' as type,
          'Payment of ' || COALESCE(CAST(p.amount AS text), '0') || ' received' as description,
          p."created_at" as timestamp,
          p.id as "entityId",
          'payment' as "entityType",
          p."payment_method" as status
        FROM payments p
        JOIN invoices i ON p."invoice_id" = i.id
        WHERE i."garage_id" = ${garageId}
        ORDER BY p."created_at" DESC NULLS LAST
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 'appointment' as type,
          'Appointment for ' || COALESCE(a."customer_name", 'Customer') || ' - ' || a.status as description,
          a."updated_at" as timestamp,
          a.id as "entityId",
          'appointment' as "entityType",
          a.status as status
        FROM appointments a
        WHERE a."garage_id" = ${garageId}
        ORDER BY a."updated_at" DESC NULLS LAST
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 'invoice' as type,
          'Invoice ' || COALESCE(inv."invoice_number", '') || ' ' || inv.status as description,
          inv."updated_at" as timestamp,
          inv.id as "entityId",
          'invoice' as "entityType",
          inv.status as status
        FROM invoices inv
        WHERE inv."garage_id" = ${garageId}
        ORDER BY inv."updated_at" DESC NULLS LAST
        LIMIT 3
      )
      ORDER BY timestamp DESC NULLS LAST
      LIMIT 10
    `);

    res.json({ activities: activities.rows || [] });
  } catch (e: any) {
    console.error('Dashboard recent-activity error:', e.message);
    res.json({ activities: [] });
  }
});

/**
 * GET /api/dashboard/trends
 * Weekly trends for revenue, jobs, customer visits (last 4 weeks)
 */
router.get('/dashboard/trends', async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
  try {
    // Revenue trend - last 4 weeks
    const revenueTrend = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('week', "paid_at"), 'MM/DD') as week,
        COALESCE(SUM(CAST("total_amount" AS numeric)), 0) as revenue
      FROM invoices
      WHERE "garage_id" = ${garageId}
        AND status = 'paid'
        AND "paid_at" >= NOW() - INTERVAL '4 weeks'
      GROUP BY DATE_TRUNC('week', "paid_at")
      ORDER BY DATE_TRUNC('week', "paid_at")
    `);

    // Jobs trend - last 4 weeks
    const jobsTrend = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('week', "created_at"), 'MM/DD') as week,
        COUNT(*) as jobs
      FROM job_cards
      WHERE "garage_id" = ${garageId}
        AND "created_at" >= NOW() - INTERVAL '4 weeks'
      GROUP BY DATE_TRUNC('week', "created_at")
      ORDER BY DATE_TRUNC('week', "created_at")
    `);

    // Appointments trend - last 4 weeks
    const visitsTrend = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('week', "appointment_date"), 'MM/DD') as week,
        COUNT(*) as visits
      FROM appointments
      WHERE "garage_id" = ${garageId}
        AND "appointment_date" >= NOW() - INTERVAL '4 weeks'
      GROUP BY DATE_TRUNC('week', "appointment_date")
      ORDER BY DATE_TRUNC('week', "appointment_date")
    `);

    // Calculate percentage changes (current week vs previous week)
    const calcChange = (rows: any[]) => {
      if (rows.length < 2) return 0;
      const current = parseFloat(rows[rows.length - 1]?.revenue || rows[rows.length - 1]?.jobs || rows[rows.length - 1]?.visits || '0');
      const previous = parseFloat(rows[rows.length - 2]?.revenue || rows[rows.length - 2]?.jobs || rows[rows.length - 2]?.visits || '0');
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const revenueRows = revenueTrend.rows || [];
    const jobsRows = jobsTrend.rows || [];
    const visitsRows = visitsTrend.rows || [];

    res.json({
      revenue: {
        data: revenueRows,
        change: calcChange(revenueRows as any[]),
      },
      jobs: {
        data: jobsRows,
        change: calcChange(jobsRows as any[]),
      },
      visits: {
        data: visitsRows,
        change: calcChange(visitsRows as any[]),
      },
    });
  } catch (e: any) {
    console.error('Dashboard trends error:', e.message);
    res.json({
      revenue: { data: [], change: 0 },
      jobs: { data: [], change: 0 },
      visits: { data: [], change: 0 },
    });
  }
});

export default router;
