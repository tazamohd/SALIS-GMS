/**
 * CRM repository (Phase E4 — Repository Pattern).
 *
 * Owns every raw SQL query behind the CRM dashboards — customer 360 lists and
 * detail, segment counts, loyalty aggregates, and retention analytics — all
 * previously inlined in `server/routes/crm.ts`. Returns raw query rows /
 * primitives; the JS-side classification and shaping live in the service. This
 * is the only data-layer access for the CRM module.
 */

import { db } from '../../../db';
import { sql } from 'drizzle-orm';

type Row = Record<string, unknown>;

export interface ICrmRepository {
  customerList(garageId: string, search: string): Promise<Row[]>;
  customerBase(garageId: string, id: string): Promise<Row | undefined>;
  customerJobs(garageId: string, id: string): Promise<Row[]>;
  customerInvoices(garageId: string, id: string): Promise<Row[]>;
  customerAppointments(garageId: string, id: string): Promise<Row[]>;
  segments(garageId: string): Promise<Row[]>;
  loyaltyMembers(garageId: string): Promise<number>;
  loyaltyRevenue(garageId: string): Promise<number>;
  loyaltyTiers(garageId: string): Promise<Row[]>;
  retentionRepeat(garageId: string): Promise<Row>;
  retentionLtv(garageId: string): Promise<Row>;
  retentionChurnRisk(garageId: string): Promise<Row[]>;
  retentionTrend(garageId: string): Promise<Row[]>;
}

export class CrmRepository implements ICrmRepository {
  async customerList(garageId: string, search: string): Promise<Row[]> {
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
        WHERE j.customer_id = u.id AND j.garage_id = ${garageId}::uuid
      ) stats ON true
      WHERE u.garage_id = ${garageId}::uuid
        AND (u.user_type = 'customer' OR u.role = 'CUSTOMER' OR EXISTS (
          SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id
        ))
      ${searchFilter}
      ORDER BY stats.total_spend DESC NULLS LAST
      LIMIT 200
    `);
    return result.rows || [];
  }

  async customerBase(garageId: string, id: string): Promise<Row | undefined> {
    const result = await db.execute(sql`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.phone,
        u.created_at AS "createdAt",
        u.profile_image_url AS "profileImageUrl"
      FROM users u WHERE u.id = ${id} AND u.garage_id = ${garageId}::uuid
    `);
    return result.rows?.[0];
  }

  async customerJobs(garageId: string, id: string): Promise<Row[]> {
    const result = await db.execute(sql`
      SELECT j.id, j.job_number AS "jobNumber", j.service_type AS "serviceType",
        j.description, j.status, j.total_cost AS "totalCost",
        j.created_at AS "createdAt", j.completed_at AS "completedAt"
      FROM job_cards j WHERE j.customer_id = ${id} AND j.garage_id = ${garageId}::uuid
      ORDER BY j.created_at DESC LIMIT 50
    `);
    return result.rows || [];
  }

  async customerInvoices(garageId: string, id: string): Promise<Row[]> {
    const result = await db.execute(sql`
      SELECT i.id, i.invoice_number AS "invoiceNumber", i.status,
        i.total_amount AS "totalAmount", i.paid_amount AS "paidAmount",
        i.invoice_date AS "invoiceDate"
      FROM invoices i WHERE i.customer_id = ${id} AND i.garage_id = ${garageId}::uuid
      ORDER BY i.invoice_date DESC LIMIT 50
    `);
    return result.rows || [];
  }

  async customerAppointments(garageId: string, id: string): Promise<Row[]> {
    const result = await db.execute(sql`
      SELECT a.id, a.appointment_number AS "appointmentNumber",
        a.service_type AS "serviceType", a.status,
        a.appointment_date AS "scheduledDate"
      FROM appointments a WHERE a.customer_id = ${id} AND a.garage_id = ${garageId}::uuid
      ORDER BY a.appointment_date DESC LIMIT 50
    `);
    return result.rows || [];
  }

  async segments(garageId: string): Promise<Row[]> {
    const result = await db.execute(sql`
      WITH customer_stats AS (
        SELECT
          u.id,
          COALESCE(COUNT(DISTINCT j.id), 0)::int AS visit_count,
          MAX(j.completed_at) AS last_visit,
          COALESCE(SUM(i.total_amount), 0)::numeric AS total_spend
        FROM users u
        LEFT JOIN job_cards j ON j.customer_id = u.id AND j.garage_id = ${garageId}::uuid
        LEFT JOIN invoices i ON i.customer_id = u.id AND i.garage_id = ${garageId}::uuid
        WHERE u.garage_id = ${garageId}::uuid
          AND (u.user_type = 'customer' OR u.role = 'CUSTOMER'
            OR EXISTS (SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id))
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
    return result.rows || [];
  }

  async loyaltyMembers(garageId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(DISTINCT u.id)::int AS total_members
      FROM users u
      WHERE u.garage_id = ${garageId}::uuid
        AND (u.user_type = 'customer' OR u.role = 'CUSTOMER'
          OR EXISTS (SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id))
    `);
    return Number((result.rows?.[0] as Row | undefined)?.total_members || 0);
  }

  async loyaltyRevenue(garageId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT
        COALESCE(SUM(i.total_amount), 0)::numeric AS total_revenue,
        COALESCE(SUM(i.paid_amount), 0)::numeric AS total_paid
      FROM invoices i
      WHERE i.garage_id = ${garageId}::uuid
    `);
    return Number((result.rows?.[0] as Row | undefined)?.total_revenue || 0);
  }

  async loyaltyTiers(garageId: string): Promise<Row[]> {
    const result = await db.execute(sql`
      WITH cs AS (
        SELECT u.id, COALESCE(SUM(i.total_amount), 0)::numeric AS total_spend
        FROM users u
        LEFT JOIN invoices i ON i.customer_id = u.id AND i.garage_id = ${garageId}::uuid
        WHERE u.garage_id = ${garageId}::uuid
          AND (u.user_type = 'customer' OR u.role = 'CUSTOMER'
            OR EXISTS (SELECT 1 FROM job_cards jc WHERE jc.customer_id = u.id))
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
    return result.rows || [];
  }

  async retentionRepeat(garageId: string): Promise<Row> {
    const result = await db.execute(sql`
      WITH cj AS (
        SELECT customer_id, COUNT(*)::int AS job_count
        FROM job_cards
        WHERE customer_id IS NOT NULL AND garage_id = ${garageId}::uuid
        GROUP BY customer_id
      )
      SELECT
        COUNT(*)::int AS total_customers,
        COUNT(*) FILTER (WHERE job_count > 1)::int AS repeat_customers,
        ROUND(AVG(job_count), 1) AS avg_visits
      FROM cj
    `);
    return (result.rows?.[0] as Row | undefined) || {};
  }

  async retentionLtv(garageId: string): Promise<Row> {
    const result = await db.execute(sql`
      SELECT
        ROUND(AVG(cs.total_spend), 2) AS avg_ltv,
        ROUND(MAX(cs.total_spend), 2) AS max_ltv
      FROM (
        SELECT customer_id, COALESCE(SUM(total_amount), 0)::numeric AS total_spend
        FROM invoices
        WHERE customer_id IS NOT NULL AND garage_id = ${garageId}::uuid
        GROUP BY customer_id
      ) cs
    `);
    return (result.rows?.[0] as Row | undefined) || {};
  }

  async retentionChurnRisk(garageId: string): Promise<Row[]> {
    const result = await db.execute(sql`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.phone,
        MAX(j.completed_at) AS "lastVisit",
        COUNT(j.id)::int AS "visitCount",
        COALESCE(SUM(i.total_amount), 0)::numeric AS "totalSpend"
      FROM users u
      JOIN job_cards j ON j.customer_id = u.id AND j.garage_id = ${garageId}::uuid
      LEFT JOIN invoices i ON i.customer_id = u.id AND i.garage_id = ${garageId}::uuid
      WHERE u.garage_id = ${garageId}::uuid
        AND j.completed_at < NOW() - INTERVAL '60 days'
      GROUP BY u.id, u.full_name, u.email, u.phone
      HAVING MAX(j.completed_at) < NOW() - INTERVAL '60 days'
      ORDER BY MAX(j.completed_at) ASC
      LIMIT 20
    `);
    return result.rows || [];
  }

  async retentionTrend(garageId: string): Promise<Row[]> {
    const result = await db.execute(sql`
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
                AND garage_id = ${garageId}::uuid
            )
          )::int AS returning_customers
        FROM job_cards j
        WHERE j.completed_at >= NOW() - INTERVAL '6 months'
          AND j.customer_id IS NOT NULL
          AND j.garage_id = ${garageId}::uuid
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
    return result.rows || [];
  }
}
