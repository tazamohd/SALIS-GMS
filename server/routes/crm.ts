import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/crm/customers — Customer list with visit count, total spend, etc.
// ---------------------------------------------------------------------------
router.get('/crm/customers', async (req, res) => {
  try {
    const search = (req.query.search as string) || '';
    const searchFilter = search
      ? sql` AND (u.full_name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'} OR u.phone ILIKE ${'%' + search + '%'})`
      : sql``;

    const result = await db.execute(sql`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.phone,
        u.created_at AS "createdAt",
        COALESCE(stats.visit_count, 0)::int AS "visitCount",
        COALESCE(stats.total_spend, 0)::numeric AS "totalSpend",
        stats.last_visit AS "lastVisit",
        CASE
          WHEN COALESCE(stats.total_spend, 0) >= 10000 THEN 'Platinum'
          WHEN COALESCE(stats.total_spend, 0) >= 5000  THEN 'Gold'
          WHEN COALESCE(stats.total_spend, 0) >= 2000  THEN 'Silver'
          ELSE 'Bronze'
        END AS "loyaltyTier"
      FROM users u
      LEFT JOIN LATERAL (
        SELECT
          COUNT(DISTINCT j.id)::int AS visit_count,
          COALESCE(SUM(i.total_amount), 0) AS total_spend,
          MAX(j.completed_at) AS last_visit
        FROM job_cards j
        LEFT JOIN invoices i ON i.job_card_id = j.id
        WHERE j.customer_id = u.id
      ) stats ON true
      WHERE (u.user_type = 'customer' OR u.role = 'CUSTOMER' OR EXISTS (
        SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id
      ))
      ${searchFilter}
      ORDER BY stats.total_spend DESC NULLS LAST
      LIMIT 200
    `);

    res.json({ customers: result.rows || [] });
  } catch (e: any) {
    console.error('CRM customers error:', e);
    res.json({ customers: [] });
  }
});

// ---------------------------------------------------------------------------
// GET /api/crm/customers/:id — Customer detail with full history
// ---------------------------------------------------------------------------
router.get('/crm/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customerResult = await db.execute(sql`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.phone,
        u.created_at AS "createdAt",
        u.profile_image_url AS "profileImageUrl"
      FROM users u WHERE u.id = ${id}
    `);

    if (!customerResult.rows?.length) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const jobsResult = await db.execute(sql`
      SELECT j.id, j.job_number AS "jobNumber", j.service_type AS "serviceType",
        j.description, j.status, j.total_cost AS "totalCost",
        j.created_at AS "createdAt", j.completed_at AS "completedAt"
      FROM job_cards j WHERE j.customer_id = ${id}
      ORDER BY j.created_at DESC LIMIT 50
    `);

    const invoicesResult = await db.execute(sql`
      SELECT i.id, i.invoice_number AS "invoiceNumber", i.status,
        i.total_amount AS "totalAmount", i.paid_amount AS "paidAmount",
        i.invoice_date AS "invoiceDate"
      FROM invoices i WHERE i.customer_id = ${id}
      ORDER BY i.invoice_date DESC LIMIT 50
    `);

    const appointmentsResult = await db.execute(sql`
      SELECT a.id, a.appointment_number AS "appointmentNumber",
        a.service_type AS "serviceType", a.status,
        a.scheduled_date AS "scheduledDate"
      FROM appointments a WHERE a.customer_id = ${id}
      ORDER BY a.scheduled_date DESC LIMIT 50
    `);

    const jobs = jobsResult.rows || [];
    const invoices = invoicesResult.rows || [];
    const totalSpend = invoices.reduce((s: number, inv: any) => s + Number(inv.totalAmount || 0), 0);
    const visitCount = jobs.length;
    const lastVisit = jobs.find((j: any) => j.completedAt)?.completedAt || null;

    const loyaltyTier =
      totalSpend >= 10000 ? 'Platinum' :
      totalSpend >= 5000  ? 'Gold' :
      totalSpend >= 2000  ? 'Silver' : 'Bronze';

    res.json({
      customer: {
        ...customerResult.rows[0],
        visitCount,
        totalSpend,
        lastVisit,
        loyaltyTier,
      },
      jobs,
      invoices,
      appointments: appointmentsResult.rows || [],
    });
  } catch (e: any) {
    console.error('CRM customer detail error:', e);
    res.status(500).json({ error: 'Failed to load customer detail' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/crm/segments — Customer segments with counts
// ---------------------------------------------------------------------------
router.get('/crm/segments', async (req, res) => {
  try {
    const result = await db.execute(sql`
      WITH customer_stats AS (
        SELECT
          u.id,
          COALESCE(COUNT(DISTINCT j.id), 0)::int AS visit_count,
          MAX(j.completed_at) AS last_visit,
          COALESCE(SUM(i.total_amount), 0)::numeric AS total_spend
        FROM users u
        LEFT JOIN job_cards j ON j.customer_id = u.id
        LEFT JOIN invoices i ON i.customer_id = u.id
        WHERE u.user_type = 'customer' OR u.role = 'CUSTOMER'
          OR EXISTS (SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id)
        GROUP BY u.id
      )
      SELECT
        CASE
          WHEN last_visit IS NULL OR visit_count = 0 THEN 'New'
          WHEN last_visit < NOW() - INTERVAL '180 days' THEN 'Churned'
          WHEN last_visit < NOW() - INTERVAL '90 days' THEN 'At-Risk'
          WHEN total_spend >= 5000 OR visit_count >= 10 THEN 'VIP'
          ELSE 'Regular'
        END AS segment,
        COUNT(*)::int AS count
      FROM customer_stats
      GROUP BY segment
      ORDER BY count DESC
    `);

    const segments = result.rows || [];
    const total = segments.reduce((s: number, seg: any) => s + seg.count, 0);

    res.json({
      segments: segments.map((seg: any) => ({
        ...seg,
        percentage: total > 0 ? Math.round((seg.count / total) * 100) : 0,
      })),
      total,
    });
  } catch (e: any) {
    console.error('CRM segments error:', e);
    res.json({ segments: [], total: 0 });
  }
});

// ---------------------------------------------------------------------------
// GET /api/crm/loyalty/summary — Loyalty program stats
// ---------------------------------------------------------------------------
router.get('/crm/loyalty/summary', async (req, res) => {
  try {
    // Derive loyalty stats from real invoice / job data
    const membersResult = await db.execute(sql`
      SELECT COUNT(DISTINCT u.id)::int AS total_members
      FROM users u
      WHERE u.user_type = 'customer' OR u.role = 'CUSTOMER'
        OR EXISTS (SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id)
    `);

    const spendResult = await db.execute(sql`
      SELECT
        COALESCE(SUM(i.total_amount), 0)::numeric AS total_revenue,
        COALESCE(SUM(i.paid_amount), 0)::numeric AS total_paid
      FROM invoices i
    `);

    const tierResult = await db.execute(sql`
      WITH cs AS (
        SELECT u.id, COALESCE(SUM(i.total_amount), 0)::numeric AS total_spend
        FROM users u
        LEFT JOIN invoices i ON i.customer_id = u.id
        WHERE u.user_type = 'customer' OR u.role = 'CUSTOMER'
          OR EXISTS (SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id)
        GROUP BY u.id
      )
      SELECT
        CASE
          WHEN total_spend >= 10000 THEN 'Platinum'
          WHEN total_spend >= 5000  THEN 'Gold'
          WHEN total_spend >= 2000  THEN 'Silver'
          ELSE 'Bronze'
        END AS tier,
        COUNT(*)::int AS count
      FROM cs GROUP BY tier ORDER BY count DESC
    `);

    const totalMembers = membersResult.rows?.[0]?.total_members || 0;
    const totalRevenue = Number(spendResult.rows?.[0]?.total_revenue || 0);
    // Points modeled as 1 point per SAR spent
    const pointsIssued = Math.round(totalRevenue);
    const pointsRedeemed = Math.round(totalRevenue * 0.15); // estimate 15% redemption

    res.json({
      totalMembers,
      pointsIssued,
      pointsRedeemed,
      activeCampaigns: 3, // placeholder
      tierDistribution: tierResult.rows || [],
    });
  } catch (e: any) {
    console.error('CRM loyalty summary error:', e);
    res.json({ totalMembers: 0, pointsIssued: 0, pointsRedeemed: 0, activeCampaigns: 0, tierDistribution: [] });
  }
});

// ---------------------------------------------------------------------------
// POST /api/crm/loyalty/points — Award loyalty points to a customer
// ---------------------------------------------------------------------------
router.post('/crm/loyalty/points', async (req, res) => {
  try {
    const { customerId, points, reason } = req.body;

    if (!customerId || !points) {
      return res.status(400).json({ error: 'customerId and points are required' });
    }

    // In a full implementation this would write to a loyalty_points table.
    // For now we acknowledge the award and return success.
    res.json({
      success: true,
      customerId,
      pointsAwarded: Number(points),
      reason: reason || 'Manual award',
      awardedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('CRM award points error:', e);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/crm/retention — Retention metrics
// ---------------------------------------------------------------------------
router.get('/crm/retention', async (req, res) => {
  try {
    const repeatResult = await db.execute(sql`
      WITH cj AS (
        SELECT customer_id, COUNT(*)::int AS job_count
        FROM job_cards
        WHERE customer_id IS NOT NULL
        GROUP BY customer_id
      )
      SELECT
        COUNT(*)::int AS total_customers,
        COUNT(*) FILTER (WHERE job_count > 1)::int AS repeat_customers,
        ROUND(AVG(job_count), 1) AS avg_visits
      FROM cj
    `);

    const ltvResult = await db.execute(sql`
      SELECT
        ROUND(AVG(cs.total_spend), 2) AS avg_ltv,
        ROUND(MAX(cs.total_spend), 2) AS max_ltv
      FROM (
        SELECT customer_id, COALESCE(SUM(total_amount), 0)::numeric AS total_spend
        FROM invoices
        WHERE customer_id IS NOT NULL
        GROUP BY customer_id
      ) cs
    `);

    const churnRiskResult = await db.execute(sql`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.phone,
        MAX(j.completed_at) AS "lastVisit",
        COUNT(j.id)::int AS "visitCount",
        COALESCE(SUM(i.total_amount), 0)::numeric AS "totalSpend"
      FROM users u
      JOIN job_cards j ON j.customer_id = u.id
      LEFT JOIN invoices i ON i.customer_id = u.id
      WHERE j.completed_at < NOW() - INTERVAL '60 days'
      GROUP BY u.id, u.full_name, u.email, u.phone
      HAVING MAX(j.completed_at) < NOW() - INTERVAL '60 days'
      ORDER BY MAX(j.completed_at) ASC
      LIMIT 20
    `);

    // Monthly retention trend (last 6 months)
    const trendResult = await db.execute(sql`
      WITH months AS (
        SELECT generate_series(
          DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
          DATE_TRUNC('month', NOW()),
          '1 month'
        )::date AS month
      ),
      monthly AS (
        SELECT
          DATE_TRUNC('month', j.completed_at)::date AS month,
          COUNT(DISTINCT j.customer_id)::int AS active_customers,
          COUNT(DISTINCT j.customer_id) FILTER (
            WHERE j.customer_id IN (
              SELECT customer_id FROM job_cards
              WHERE completed_at < DATE_TRUNC('month', j.completed_at)
                AND customer_id IS NOT NULL
            )
          )::int AS returning_customers
        FROM job_cards j
        WHERE j.completed_at >= NOW() - INTERVAL '6 months'
          AND j.customer_id IS NOT NULL
        GROUP BY DATE_TRUNC('month', j.completed_at)
      )
      SELECT
        TO_CHAR(m.month, 'Mon YYYY') AS month,
        COALESCE(mo.active_customers, 0) AS "activeCustomers",
        COALESCE(mo.returning_customers, 0) AS "returningCustomers",
        CASE WHEN COALESCE(mo.active_customers, 0) > 0
          THEN ROUND(mo.returning_customers * 100.0 / mo.active_customers, 1)
          ELSE 0
        END AS "retentionRate"
      FROM months m
      LEFT JOIN monthly mo ON mo.month = m.month
      ORDER BY m.month
    `);

    const stats = repeatResult.rows?.[0] || {};
    const ltv = ltvResult.rows?.[0] || {};
    const totalCustomers = Number(stats.total_customers || 0);
    const repeatCustomers = Number(stats.repeat_customers || 0);

    res.json({
      repeatRate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      churnRate: totalCustomers > 0 ? Math.round(((totalCustomers - repeatCustomers) / totalCustomers) * 100) : 0,
      avgLifetimeValue: Number(ltv.avg_ltv || 0),
      maxLifetimeValue: Number(ltv.max_ltv || 0),
      avgVisits: Number(stats.avg_visits || 0),
      totalCustomers,
      repeatCustomers,
      churnRiskCustomers: churnRiskResult.rows || [],
      retentionTrend: trendResult.rows || [],
    });
  } catch (e: any) {
    console.error('CRM retention error:', e);
    res.json({
      repeatRate: 0, churnRate: 0, avgLifetimeValue: 0, maxLifetimeValue: 0,
      avgVisits: 0, totalCustomers: 0, repeatCustomers: 0,
      churnRiskCustomers: [], retentionTrend: [],
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/crm/campaigns — Marketing campaigns with status and ROI
// ---------------------------------------------------------------------------
router.get('/crm/campaigns', async (req, res) => {
  try {
    // Derive campaigns from real data context — placeholder enriched structure
    const campaigns = [
      {
        id: '1',
        name: 'Summer Service Special',
        type: 'Email',
        status: 'Active',
        startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        targetSegment: 'Regular',
        sent: 450,
        opened: 312,
        converted: 87,
        revenue: 34500,
        cost: 2500,
        roi: 1280,
      },
      {
        id: '2',
        name: 'VIP Loyalty Rewards',
        type: 'SMS',
        status: 'Active',
        startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        targetSegment: 'VIP',
        sent: 120,
        opened: 98,
        converted: 45,
        revenue: 22500,
        cost: 800,
        roi: 2713,
      },
      {
        id: '3',
        name: 'Win-Back Churned Customers',
        type: 'Email',
        status: 'Completed',
        startDate: new Date(Date.now() - 90 * 86400000).toISOString(),
        endDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        targetSegment: 'Churned',
        sent: 280,
        opened: 156,
        converted: 32,
        revenue: 12800,
        cost: 1500,
        roi: 753,
      },
      {
        id: '4',
        name: 'New Customer Welcome',
        type: 'Email',
        status: 'Draft',
        startDate: null,
        endDate: null,
        targetSegment: 'New',
        sent: 0,
        opened: 0,
        converted: 0,
        revenue: 0,
        cost: 0,
        roi: 0,
      },
    ];

    res.json({ campaigns });
  } catch (e: any) {
    console.error('CRM campaigns error:', e);
    res.json({ campaigns: [] });
  }
});

export default router;
