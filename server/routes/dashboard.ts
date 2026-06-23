import { Router } from 'express';
import { db } from '../db';
import { sql, type SQL } from 'drizzle-orm';
import { isAuthenticated } from '../auth';
import { resolveGarageScope, isCrossGarageRole } from '../middleware/garageScope';

const router = Router();

/**
 * Every `garage_id` column expression referenced by the dashboard queries.
 * Constraining `garageScopeSql` to this closed literal union keeps `sql.raw`
 * provably free of user input — there is no call site through which untrusted
 * text could reach the raw fragment.
 */
type GarageColumn =
  | '"garage_id"'
  | 'j."garage_id"'
  | 'i."garage_id"'
  | 'a."garage_id"'
  | 'inv."garage_id"'
  | 'u."garage_id"';

/** Narrow an unknown thrown value to a log-safe message. */
const errMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/**
 * Garage-scoping predicate for the raw dashboard aggregations.
 *
 * `garage_id` is a UUID column everywhere (shared/schema.ts), so a literal
 * fallback like `'1'` is not a valid value — it throws
 * `invalid input syntax for type uuid` and the error gets swallowed by the
 * handler's try/catch, silently returning empty data. Instead we derive the
 * scope from `resolveGarageScope(req)`:
 *
 *  - defined → `column = <uuid>` (ordinary staff, or a platform admin with an
 *    explicit `?garage_id` override),
 *  - undefined → `TRUE`, used only for cross-garage admin roles so the
 *    dashboard aggregates across all garages (garageless ordinary callers are
 *    short-circuited to an empty payload before any query runs).
 *
 * `column` is a trusted, hard-coded identifier (never user input), so
 * `sql.raw` here is safe; the garageId value is always parameterised.
 */
const garageScopeSql = (column: GarageColumn, garageId: string | undefined): SQL =>
  garageId ? sql`${sql.raw(column)} = ${garageId}` : sql`TRUE`;

const EMPTY_SUMMARY = {
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
};

const EMPTY_TRENDS = {
  revenue: { data: [] as unknown[], change: 0 },
  jobs: { data: [] as unknown[], change: 0 },
  visits: { data: [] as unknown[], change: 0 },
};

/**
 * Resolve the garage scope for a dashboard request.
 *
 * Returns `{ scoped: true, garageId }` when the caller has a garage (or is a
 * cross-garage admin who legitimately sees everything — garageId may be
 * undefined there, meaning "all garages"). Returns `{ scoped: false }` for a
 * garageless ordinary caller, signalling the handler to respond with an
 * explicit empty payload rather than running a query with no valid garage to
 * scope to.
 */
function resolveDashboardScope(req: Parameters<typeof resolveGarageScope>[0]):
  | { scoped: true; garageId: string | undefined }
  | { scoped: false } {
  const garageId = resolveGarageScope(req);
  if (!garageId && !isCrossGarageRole(req)) {
    return { scoped: false };
  }
  return { scoped: true, garageId };
}

/**
 * GET /api/dashboard/summary
 * Aggregated KPIs: today's revenue, jobs in progress, appointments today,
 * pending invoices, low stock items, technician utilization.
 */
router.get('/dashboard/summary', isAuthenticated, async (req, res) => {
  const scope = resolveDashboardScope(req);
  if (!scope.scoped) {
    return res.json(EMPTY_SUMMARY);
  }
  const { garageId } = scope;
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's revenue from paid invoices
    const revenueResult = await db.execute(sql`
      SELECT COALESCE(SUM(CAST("total_amount" AS numeric)), 0) as "todayRevenue"
      FROM invoices
      WHERE ${garageScopeSql('"garage_id"', garageId)}
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
      WHERE ${garageScopeSql('"garage_id"', garageId)}
    `);

    // Appointments today
    const apptResult = await db.execute(sql`
      SELECT COUNT(*) as "appointmentsToday"
      FROM appointments
      WHERE ${garageScopeSql('"garage_id"', garageId)}
        AND "appointment_date" >= ${todayStart.toISOString()}
        AND "appointment_date" <= ${todayEnd.toISOString()}
    `);

    // Pending invoices (draft or sent, not paid)
    const pendingInvResult = await db.execute(sql`
      SELECT COUNT(*) as "pendingInvoices",
        COALESCE(SUM(CAST("balance_amount" AS numeric)), 0) as "outstandingAmount"
      FROM invoices
      WHERE ${garageScopeSql('"garage_id"', garageId)}
        AND status IN ('draft', 'sent', 'overdue')
    `);

    // Low stock items
    const lowStockResult = await db.execute(sql`
      SELECT COUNT(*) as "lowStockItems"
      FROM spare_part_inventories
      WHERE ${garageScopeSql('"garage_id"', garageId)}
        AND "stock_quantity" <= "min_threshold"
        AND "is_enabled" = true
    `);

    // Technician utilization (active task assignments / total technicians),
    // scoped to the caller's garage so one garage's dashboard does not count
    // another tenant's technicians.
    const techResult = await db.execute(sql`
      SELECT
        COUNT(DISTINCT ta."assigned_to") FILTER (WHERE ta.status = 'in_progress') as "activeTechs",
        COUNT(DISTINCT u.id) as "totalTechs"
      FROM users u
      LEFT JOIN task_assignments ta ON ta."assigned_to" = u.id AND ta.status = 'in_progress'
      WHERE u."user_type" = 'technician'
        AND ${garageScopeSql('u."garage_id"', garageId)}
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
  } catch (e: unknown) {
    console.error('Dashboard summary error:', errMessage(e));
    res.json(EMPTY_SUMMARY);
  }
});

/**
 * GET /api/dashboard/recent-activity
 * Last 10 activities across all modules (job updates, payments, appointments, etc.)
 */
router.get('/dashboard/recent-activity', isAuthenticated, async (req, res) => {
  const scope = resolveDashboardScope(req);
  if (!scope.scoped) {
    return res.json({ activities: [] });
  }
  const { garageId } = scope;
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
        WHERE ${garageScopeSql('j."garage_id"', garageId)}
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
        WHERE ${garageScopeSql('i."garage_id"', garageId)}
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
        WHERE ${garageScopeSql('a."garage_id"', garageId)}
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
        WHERE ${garageScopeSql('inv."garage_id"', garageId)}
        ORDER BY inv."updated_at" DESC NULLS LAST
        LIMIT 3
      )
      ORDER BY timestamp DESC NULLS LAST
      LIMIT 10
    `);

    res.json({ activities: activities.rows || [] });
  } catch (e: unknown) {
    console.error('Dashboard recent-activity error:', errMessage(e));
    res.json({ activities: [] });
  }
});

/**
 * GET /api/dashboard/trends
 * Weekly trends for revenue, jobs, customer visits (last 4 weeks)
 */
router.get('/dashboard/trends', isAuthenticated, async (req, res) => {
  const scope = resolveDashboardScope(req);
  if (!scope.scoped) {
    return res.json(EMPTY_TRENDS);
  }
  const { garageId } = scope;
  try {
    // Revenue trend - last 4 weeks
    const revenueTrend = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('week', "paid_at"), 'MM/DD') as week,
        COALESCE(SUM(CAST("total_amount" AS numeric)), 0) as revenue
      FROM invoices
      WHERE ${garageScopeSql('"garage_id"', garageId)}
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
      WHERE ${garageScopeSql('"garage_id"', garageId)}
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
      WHERE ${garageScopeSql('"garage_id"', garageId)}
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
  } catch (e: unknown) {
    console.error('Dashboard trends error:', errMessage(e));
    res.json(EMPTY_TRENDS);
  }
});

export default router;
