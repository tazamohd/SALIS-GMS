// Analytics Service for SALIS AUTO - Phase 2: Advanced Analytics
// Real SQL aggregation queries with error handling and pagination

import { db } from "./db";
import { sql } from "drizzle-orm";
import { 
  jobCards, 
  invoices, 
  payments, 
  customerProfiles, 
  vehicles,
  technicianProfiles,
  appointments as appointmentsTable
} from "@shared/schema";

// Helper function to safely execute SQL with error handling
async function safeExecuteSQL<T>(query: Promise<any>, defaultValue: T): Promise<T> {
  try {
    const result = await query;
    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    return defaultValue;
  }
}

// Business Intelligence Dashboard - Custom Reports & KPIs
export async function generateBusinessIntelligenceReport(
  garageId: string, 
  dateRange?: { start: Date; end: Date },
  limit: number = 100
) {
  try {
    const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = dateRange?.end || new Date();

  // Revenue metrics
  const revenueData = await db.execute(sql`
    SELECT 
      COUNT(*) as total_jobs,
      COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_revenue,
      COALESCE(AVG(CAST(total_amount AS DECIMAL)), 0) as avg_job_value,
      COUNT(DISTINCT customer_id) as unique_customers
    FROM ${jobCards}
    WHERE garage_id = ${garageId}
      AND created_at >= ${start}
      AND created_at <= ${end}
  `);

  // Payment collection rate
  const paymentData = await db.execute(sql`
    SELECT 
      COUNT(*) as total_invoices,
      COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_invoiced,
      COALESCE(SUM(CAST(amount_paid AS DECIMAL)), 0) as total_collected
    FROM ${invoices}
    WHERE garage_id = ${garageId}
      AND created_at >= ${start}
      AND created_at <= ${end}
  `);

  // Top services by revenue
  const topServices = await db.execute(sql`
    SELECT 
      service_type,
      COUNT(*) as service_count,
      COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as revenue
    FROM ${jobCards}
    WHERE garage_id = ${garageId}
      AND created_at >= ${start}
      AND created_at <= ${end}
      AND service_type IS NOT NULL
    GROUP BY service_type
    ORDER BY revenue DESC
    LIMIT 10
  `);

    return {
      period: { start, end },
      revenue: revenueData.rows[0] || {},
      payments: paymentData.rows[0] || {},
      topServices: topServices.rows || []
    };
  } catch (error) {
    console.error('BI Report generation error:', error);
    return {
      period: { start: new Date(), end: new Date() },
      revenue: {},
      payments: {},
      topServices: []
    };
  }
}

// Profit Margin Analysis (with error handling)
export async function analyzeProfitMargins(garageId: string, groupBy: 'service' | 'technician' | 'customer', limit: number = 50) {
  try {
  if (groupBy === 'service') {
    const result = await db.execute(sql`
      SELECT 
        service_type,
        COUNT(*) as job_count,
        COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_revenue,
        COALESCE(SUM(CAST(parts_cost AS DECIMAL)), 0) as parts_cost,
        COALESCE(SUM(CAST(labor_cost AS DECIMAL)), 0) as labor_cost,
        COALESCE(SUM(CAST(total_amount AS DECIMAL)) - SUM(CAST(parts_cost AS DECIMAL)) - SUM(CAST(labor_cost AS DECIMAL)), 0) as gross_profit,
        CASE 
          WHEN SUM(CAST(total_amount AS DECIMAL)) > 0 
          THEN ((SUM(CAST(total_amount AS DECIMAL)) - SUM(CAST(parts_cost AS DECIMAL)) - SUM(CAST(labor_cost AS DECIMAL))) / SUM(CAST(total_amount AS DECIMAL))) * 100
          ELSE 0 
        END as profit_margin_percent
      FROM ${jobCards}
      WHERE garage_id = ${garageId}
        AND service_type IS NOT NULL
      GROUP BY service_type
      ORDER BY gross_profit DESC
    `);
    return result.rows;
  }

  if (groupBy === 'technician') {
    const result = await db.execute(sql`
      SELECT 
        assigned_to as technician_id,
        COUNT(*) as job_count,
        COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_revenue,
        COALESCE(SUM(CAST(parts_cost AS DECIMAL)), 0) as parts_cost,
        COALESCE(SUM(CAST(labor_cost AS DECIMAL)), 0) as labor_cost,
        COALESCE(SUM(CAST(total_amount AS DECIMAL)) - SUM(CAST(parts_cost AS DECIMAL)) - SUM(CAST(labor_cost AS DECIMAL)), 0) as gross_profit,
        CASE 
          WHEN SUM(CAST(total_amount AS DECIMAL)) > 0 
          THEN ((SUM(CAST(total_amount AS DECIMAL)) - SUM(CAST(parts_cost AS DECIMAL)) - SUM(CAST(labor_cost AS DECIMAL))) / SUM(CAST(total_amount AS DECIMAL))) * 100
          ELSE 0 
        END as profit_margin_percent
      FROM ${jobCards}
      WHERE garage_id = ${garageId}
        AND assigned_to IS NOT NULL
      GROUP BY assigned_to
      ORDER BY gross_profit DESC
    `);
    return result.rows;
  }

  // groupBy customer
  const result = await db.execute(sql`
    SELECT 
      customer_id,
      COUNT(*) as job_count,
      COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_revenue,
      COALESCE(SUM(CAST(parts_cost AS DECIMAL)), 0) as parts_cost,
      COALESCE(SUM(CAST(labor_cost AS DECIMAL)), 0) as labor_cost,
      COALESCE(SUM(CAST(total_amount AS DECIMAL)) - SUM(CAST(parts_cost AS DECIMAL)) - SUM(CAST(labor_cost AS DECIMAL)), 0) as gross_profit,
      CASE 
        WHEN SUM(CAST(total_amount AS DECIMAL)) > 0 
        THEN ((SUM(CAST(total_amount AS DECIMAL)) - SUM(CAST(parts_cost AS DECIMAL)) - SUM(CAST(labor_cost AS DECIMAL))) / SUM(CAST(total_amount AS DECIMAL))) * 100
        ELSE 0 
      END as profit_margin_percent
    FROM ${jobCards}
    WHERE garage_id = ${garageId}
      AND customer_id IS NOT NULL
    GROUP BY customer_id
    ORDER BY gross_profit DESC
    LIMIT ${limit}
  `);
    return result.rows;
  } catch (error) {
    console.error('Profit margin analysis error:', error);
    return [];
  }
}

// Customer Lifetime Value Analysis (with error handling)
export async function analyzeCustomerLTV(garageId: string, limit: number = 100) {
  try {
  const result = await db.execute(sql`
    WITH customer_metrics AS (
      SELECT 
        jc.customer_id,
        COUNT(DISTINCT jc.id) as total_jobs,
        COALESCE(SUM(CAST(jc.total_amount AS DECIMAL)), 0) as total_spent,
        MIN(jc.created_at) as first_visit,
        MAX(jc.created_at) as last_visit,
        EXTRACT(EPOCH FROM (MAX(jc.created_at) - MIN(jc.created_at))) / 86400 as customer_age_days
      FROM ${jobCards} jc
      WHERE jc.garage_id = ${garageId}
        AND jc.customer_id IS NOT NULL
      GROUP BY jc.customer_id
    )
    SELECT 
      customer_id,
      total_jobs,
      total_spent,
      first_visit,
      last_visit,
      customer_age_days,
      CASE 
        WHEN customer_age_days > 0 
        THEN total_spent / (customer_age_days / 365.0)
        ELSE total_spent 
      END as annual_value,
      CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - last_visit)) / 86400 > 180 THEN 'high'
        WHEN EXTRACT(EPOCH FROM (NOW() - last_visit)) / 86400 > 90 THEN 'medium'
        ELSE 'low'
      END as churn_risk,
      CASE 
        WHEN total_jobs >= 10 THEN 'vip'
        WHEN total_jobs >= 5 THEN 'regular'
        ELSE 'new'
      END as customer_segment
    FROM customer_metrics
    ORDER BY total_spent DESC
    LIMIT ${limit}
  `);

    return result.rows;
  } catch (error) {
    console.error('Customer LTV analysis error:', error);
    return [];
  }
}

// Business Heat Maps - Demand Forecasting (with error handling)
export async function generateBusinessHeatMaps(garageId: string, mapType: 'time' | 'service' | 'technician') {
  try {
  if (mapType === 'time') {
    // Time-based demand (hour of day + day of week)
    const result = await db.execute(sql`
      SELECT 
        EXTRACT(DOW FROM scheduled_date) as day_of_week,
        EXTRACT(HOUR FROM scheduled_date) as hour_of_day,
        COUNT(*) as appointment_count,
        AVG(CAST(estimated_duration AS INTEGER)) as avg_duration
      FROM ${appointmentsTable}
      WHERE garage_id = ${garageId}
        AND scheduled_date >= NOW() - INTERVAL '90 days'
      GROUP BY day_of_week, hour_of_day
      ORDER BY day_of_week, hour_of_day
    `);
    return result.rows;
  }

  if (mapType === 'service') {
    // Service demand over time
    const result = await db.execute(sql`
      SELECT 
        service_type,
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as job_count,
        AVG(CAST(total_amount AS DECIMAL)) as avg_revenue
      FROM ${jobCards}
      WHERE garage_id = ${garageId}
        AND created_at >= NOW() - INTERVAL '90 days'
        AND service_type IS NOT NULL
      GROUP BY service_type, week
      ORDER BY week DESC, job_count DESC
    `);
    return result.rows;
  }

  // Technician utilization heat map
  const result = await db.execute(sql`
    SELECT 
      assigned_to as technician_id,
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as jobs_assigned,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as jobs_completed,
      CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100
        ELSE 0 
      END as completion_rate
    FROM ${jobCards}
    WHERE garage_id = ${garageId}
      AND created_at >= NOW() - INTERVAL '30 days'
      AND assigned_to IS NOT NULL
    GROUP BY assigned_to, date
    ORDER BY date DESC, jobs_assigned DESC
  `);
    return result.rows;
  } catch (error) {
    console.error('Heat map generation error:', error);
    return [];
  }
}

// Real-time KPIs for dashboards (with error handling)
export async function getRealtimeKPIs(garageId: string) {
  try {
  // Today's metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMetrics = await db.execute(sql`
    SELECT 
      COUNT(*) as jobs_today,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_today,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as revenue_today
    FROM ${jobCards}
    WHERE garage_id = ${garageId}
      AND created_at >= ${today}
  `);

  // Active technicians today
  const activeTechs = await db.execute(sql`
    SELECT COUNT(DISTINCT assigned_to) as active_technicians
    FROM ${jobCards}
    WHERE garage_id = ${garageId}
      AND created_at >= ${today}
      AND assigned_to IS NOT NULL
  `);

  // Pending appointments today
  const appointmentsToday = await db.execute(sql`
    SELECT COUNT(*) as appointments_today
    FROM ${appointmentsTable}
    WHERE garage_id = ${garageId}
      AND DATE(scheduled_date) = DATE(${today})
  `);

    return {
      ...todayMetrics.rows[0],
      ...activeTechs.rows[0],
      ...appointmentsToday.rows[0]
    };
  } catch (error) {
    console.error('Realtime KPIs error:', error);
    return {
      jobs_today: 0,
      completed_today: 0,
      in_progress: 0,
      revenue_today: 0,
      active_technicians: 0,
      appointments_today: 0
    };
  }
}
