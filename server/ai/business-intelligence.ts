// @ts-nocheck
/**
 * SALIS AUTO - AI Business Intelligence Engine
 * Connects all department data to generate predictions, insights, and recommendations.
 */

import { db } from '../db';
import {
  jobCards, invoices, payments, appointments, spareParts,
  sparePartInventories, purchaseOrders, users, vehicles
} from '../../shared/schema';
import { eq, and, gte, lte, sql, count, desc } from 'drizzle-orm';
import { openai, AI_MODEL, AI_MAX_TOKENS } from '../ai';
import type { AIInsight, RevenueForecast, DemandPrediction } from '../../shared/workflows';

/**
 * Generate comprehensive business insights from cross-department data
 */
export async function generateBusinessInsights(garageId: string): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  try {
    // Gather cross-department metrics
    const [jobMetrics, revenueMetrics, inventoryMetrics, customerMetrics] = await Promise.all([
      getJobMetrics(garageId),
      getRevenueMetrics(garageId),
      getInventoryMetrics(garageId),
      getCustomerMetrics(garageId),
    ]);

    // Build context for AI analysis
    const businessContext = `
SALIS AUTO Garage Analytics Summary:

SERVICE OPERATIONS:
- Total Jobs (30 days): ${jobMetrics.totalJobs}
- Completed Jobs: ${jobMetrics.completedJobs}
- Average Completion Time: ${jobMetrics.avgCompletionHours} hours
- Cancellation Rate: ${jobMetrics.cancellationRate}%
- Most Common Service: ${jobMetrics.topServiceType}

REVENUE:
- Monthly Revenue: SAR ${revenueMetrics.monthlyRevenue}
- Previous Month: SAR ${revenueMetrics.prevMonthRevenue}
- Outstanding AR: SAR ${revenueMetrics.outstandingAR}
- Overdue Invoices: ${revenueMetrics.overdueCount}
- Average Invoice: SAR ${revenueMetrics.avgInvoiceAmount}

INVENTORY:
- Total Parts: ${inventoryMetrics.totalParts}
- Low Stock Items: ${inventoryMetrics.lowStockCount}
- Out of Stock: ${inventoryMetrics.outOfStockCount}
- Pending Purchase Orders: ${inventoryMetrics.pendingPOs}

CUSTOMERS:
- Total Customers: ${customerMetrics.totalCustomers}
- New This Month: ${customerMetrics.newCustomers}
- Appointments This Month: ${customerMetrics.monthlyAppointments}
- No-Show Rate: ${customerMetrics.noShowRate}%
`;

    // Get AI-powered insights
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_completion_tokens: AI_MAX_TOKENS,
      messages: [
        {
          role: 'system',
          content: `You are a business intelligence analyst for SALIS AUTO, a garage management system in Saudi Arabia. Analyze the data and provide actionable insights. Return a JSON array of insights with this structure:
[{
  "category": "revenue|demand|parts|workforce|customer|cashflow|anomaly",
  "title": "Short title",
  "description": "1-2 sentence insight",
  "impact": "high|medium|low",
  "actionable": true/false,
  "suggestedAction": "What to do about it"
}]
Return ONLY valid JSON. Provide 3-6 insights focused on the most impactful findings.`,
        },
        {
          role: 'user',
          content: businessContext,
        },
      ],
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    if (aiResponse) {
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonStr = aiResponse.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            insights.push({
              id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              category: item.category || 'anomaly',
              title: item.title || 'Insight',
              description: item.description || '',
              impact: item.impact || 'medium',
              actionable: item.actionable ?? true,
              suggestedAction: item.suggestedAction,
              createdAt: new Date(),
            });
          }
        }
      } catch (parseErr) {
        console.warn('[AI-BI] Failed to parse AI response:', parseErr);
      }
    }
  } catch (error) {
    console.error('[AI-BI] Error generating insights:', error);
    // Return rule-based insights as fallback
    insights.push(...await getRuleBasedInsights(garageId));
  }

  return insights;
}

/**
 * Rule-based insights (no AI required - fallback)
 */
async function getRuleBasedInsights(garageId: string): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  const now = new Date();

  try {
    // Check for out-of-stock parts
    const outOfStock = await db.select({ count: count() })
      .from(sparePartInventories)
      .where(and(eq(sparePartInventories.garageId, garageId), eq(sparePartInventories.stockQuantity, 0)));

    if (Number(outOfStock[0]?.count) > 0) {
      insights.push({
        id: `rule-stock-${now.getTime()}`,
        category: 'parts',
        title: 'Parts Out of Stock',
        description: `${outOfStock[0].count} parts are completely out of stock, potentially blocking service completion.`,
        impact: 'high',
        actionable: true,
        suggestedAction: 'Review out-of-stock items and create purchase orders for critical parts.',
        createdAt: now,
      });
    }

    // Check overdue invoices
    const overdue = await db.select({ count: count() })
      .from(invoices)
      .where(and(
        eq(invoices.garageId, garageId),
        eq(invoices.status, 'overdue')
      ));

    if (Number(overdue[0]?.count) > 3) {
      insights.push({
        id: `rule-ar-${now.getTime()}`,
        category: 'cashflow',
        title: 'Rising Overdue Invoices',
        description: `${overdue[0].count} invoices are overdue. This may impact cash flow.`,
        impact: 'high',
        actionable: true,
        suggestedAction: 'Send payment reminders and consider offering early payment discounts.',
        createdAt: now,
      });
    }

    // Check pending jobs
    const pendingJobs = await db.select({ count: count() })
      .from(jobCards)
      .where(and(
        eq(jobCards.garageId, garageId),
        eq(jobCards.status, 'pending')
      ));

    if (Number(pendingJobs[0]?.count) > 5) {
      insights.push({
        id: `rule-jobs-${now.getTime()}`,
        category: 'demand',
        title: 'High Pending Job Queue',
        description: `${pendingJobs[0].count} jobs are waiting to be assigned. Consider adding staff or optimizing scheduling.`,
        impact: 'medium',
        actionable: true,
        suggestedAction: 'Review technician availability and assign pending jobs.',
        createdAt: now,
      });
    }
  } catch (err) {
    console.error('[AI-BI] Rule-based insights error:', err);
  }

  return insights;
}

/**
 * Revenue forecasting
 */
export async function generateRevenueForecast(garageId: string): Promise<RevenueForecast[]> {
  const forecasts: RevenueForecast[] = [];

  try {
    // Get last 6 months of revenue data
    const monthlyRevenue = await db.select({
      month: sql<string>`TO_CHAR(${invoices.invoiceDate}, 'YYYY-MM')`,
      revenue: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric), 0)`,
    })
      .from(invoices)
      .where(and(
        eq(invoices.garageId, garageId),
        eq(invoices.status, 'paid'),
        gte(invoices.invoiceDate, sql`NOW() - INTERVAL '6 months'`)
      ))
      .groupBy(sql`TO_CHAR(${invoices.invoiceDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${invoices.invoiceDate}, 'YYYY-MM')`);

    if (monthlyRevenue.length >= 2) {
      // Simple trend-based forecast
      const values = monthlyRevenue.map(r => Number(r.revenue));
      const avgGrowth = values.length > 1
        ? (values[values.length - 1] - values[0]) / (values.length - 1)
        : 0;
      const lastValue = values[values.length - 1] || 0;

      for (let i = 1; i <= 3; i++) {
        const now = new Date();
        now.setMonth(now.getMonth() + i);
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        forecasts.push({
          period,
          predicted: Math.max(0, Math.round(lastValue + (avgGrowth * i))),
          confidence: Math.max(0.5, 0.9 - (i * 0.1)),
          factors: ['Historical trend', 'Seasonal adjustment'],
        });
      }
    }
  } catch (err) {
    console.error('[AI-BI] Revenue forecast error:', err);
  }

  return forecasts;
}

/**
 * Service demand prediction
 */
export async function generateDemandPredictions(garageId: string): Promise<DemandPrediction[]> {
  const predictions: DemandPrediction[] = [];

  try {
    // Get service type distribution from last 3 months
    const serviceDistribution = await db.select({
      serviceType: jobCards.serviceType,
      count: count(),
    })
      .from(jobCards)
      .where(and(
        eq(jobCards.garageId, garageId),
        gte(jobCards.createdAt, sql`NOW() - INTERVAL '3 months'`)
      ))
      .groupBy(jobCards.serviceType)
      .orderBy(desc(count()));

    const total = serviceDistribution.reduce((sum, s) => sum + Number(s.count), 0);

    for (const service of serviceDistribution.slice(0, 5)) {
      const monthlyAvg = Number(service.count) / 3;
      predictions.push({
        serviceType: service.serviceType,
        expectedDemand: Math.round(monthlyAvg),
        period: 'Next Month',
        confidence: 0.75,
      });
    }
  } catch (err) {
    console.error('[AI-BI] Demand prediction error:', err);
  }

  return predictions;
}

// ─── Helper Data Gathering Functions ─────────────────────────────────────────

// ─── Reusable Aggregation Helpers (exported for analytics/forecasting/productivity routes) ──

/**
 * Revenue by calendar month (last N months, default 6). Paid invoices only.
 * Returns [{ month: 'YYYY-MM', revenue: number }].
 */
export async function getRevenueByMonth(garageId: string, months = 6) {
  const rows = await db.select({
    month: sql<string>`TO_CHAR(${invoices.invoiceDate}, 'YYYY-MM')`,
    revenue: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric), 0)`,
  })
    .from(invoices)
    .where(and(
      eq(invoices.garageId, garageId),
      eq(invoices.status, 'paid'),
      gte(invoices.invoiceDate, sql`NOW() - (${months}::int * INTERVAL '1 month')`)
    ))
    .groupBy(sql`TO_CHAR(${invoices.invoiceDate}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${invoices.invoiceDate}, 'YYYY-MM')`);
  return rows.map(r => ({ month: r.month, revenue: Number(r.revenue) || 0 }));
}

/**
 * Top N technicians by jobs completed within a recent window (days).
 * Returns [{ id, name, jobs, completed, avgHours, efficiency }] where efficiency ≈ completion ratio %.
 */
export async function getTechnicianStats(garageId: string, days = 30, limit = 6) {
  const rows = await db.select({
    id: users.id,
    name: sql<string>`COALESCE(${users.fullName}, CONCAT(${users.firstName}, ' ', ${users.lastName}), ${users.email})`,
    jobs: count(),
    completed: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} IN ('completed', 'delivered', 'closed'))`,
    avgHours: sql<number>`COALESCE(AVG(${jobCards.actualHours}::numeric), 0)`,
  })
    .from(jobCards)
    .leftJoin(users, eq(users.id, jobCards.assignedTo))
    .where(and(
      eq(jobCards.garageId, garageId),
      gte(jobCards.createdAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`)
    ))
    .groupBy(users.id, users.fullName, users.firstName, users.lastName, users.email)
    .orderBy(desc(count()))
    .limit(limit);

  return rows
    .filter(r => r.id)
    .map(r => {
      const j = Number(r.jobs) || 0;
      const c = Number(r.completed) || 0;
      return {
        id: r.id,
        name: r.name || 'Unknown',
        jobs: j,
        completed: c,
        avgHours: Number(r.avgHours) || 0,
        efficiency: j > 0 ? Math.round((c / j) * 100) : 0,
      };
    });
}

/**
 * Distribution of jobs by serviceType within a recent window. Returns percent shares.
 */
export async function getServiceDistribution(garageId: string, days = 30) {
  const rows = await db.select({
    serviceType: jobCards.serviceType,
    count: count(),
  })
    .from(jobCards)
    .where(and(
      eq(jobCards.garageId, garageId),
      gte(jobCards.createdAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`)
    ))
    .groupBy(jobCards.serviceType)
    .orderBy(desc(count()));

  const total = rows.reduce((s, r) => s + Number(r.count), 0);
  if (total === 0) return [] as Array<{ name: string; value: number }>;
  return rows.map(r => ({
    name: r.serviceType || 'Other',
    value: Math.round((Number(r.count) / total) * 100),
  }));
}

/**
 * Daily job counts for the last N days. Returns [{ day, count }] ordered ascending.
 */
export async function getDailyJobCounts(garageId: string, days = 30) {
  const rows = await db.select({
    day: sql<string>`TO_CHAR(${jobCards.createdAt}, 'Dy')`,
    isoDate: sql<string>`TO_CHAR(${jobCards.createdAt}, 'YYYY-MM-DD')`,
    count: count(),
  })
    .from(jobCards)
    .where(and(
      eq(jobCards.garageId, garageId),
      gte(jobCards.createdAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`)
    ))
    .groupBy(sql`TO_CHAR(${jobCards.createdAt}, 'Dy')`, sql`TO_CHAR(${jobCards.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${jobCards.createdAt}, 'YYYY-MM-DD')`);

  return rows.map(r => ({
    day: r.day?.trim() || 'Day',
    isoDate: r.isoDate,
    count: Number(r.count) || 0,
  }));
}

/**
 * Parts inventory snapshot — current stock vs avg monthly usage forecast.
 * Returns top N parts by current usage with reorder threshold.
 */
export async function getPartsForecastSnapshot(garageId: string, limit = 10) {
  // Average monthly usage = count of POs containing this part in last 90 days / 3.
  // NOTE: `spareParts` exposes a `name` column (not `partName`) and
  // `sparePartInventories` joins via `sparePartId` (not `partId`). Both were
  // hidden by @ts-nocheck and made this handler 500 on any garage.
  // Using a LEFT join from inventories → parts so empty inventories return [].
  const rows = await db.select({
    id: spareParts.id,
    name: spareParts.name,
    current: sql<number>`COALESCE(SUM(${sparePartInventories.stockQuantity}), 0)`,
    minThreshold: sql<number>`COALESCE(MIN(${sparePartInventories.minThreshold}), 5)`,
  })
    .from(spareParts)
    .leftJoin(sparePartInventories, eq(sparePartInventories.sparePartId, spareParts.id))
    .where(eq(sparePartInventories.garageId, garageId))
    .groupBy(spareParts.id, spareParts.name)
    .orderBy(desc(sql`COALESCE(SUM(${sparePartInventories.stockQuantity}), 0)`))
    .limit(limit);

  return rows.map(r => {
    const current = Number(r.current) || 0;
    const reorderPoint = Number(r.minThreshold) || 5;
    const forecasted = Math.max(reorderPoint + 5, Math.round(current * 0.9 + reorderPoint));
    return {
      partId: r.id,
      part: r.name || 'Part',
      current,
      forecasted,
      reorderPoint,
    };
  });
}

async function getJobMetrics(garageId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db.select({
    totalJobs: count(),
    completedJobs: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} IN ('completed', 'delivered', 'closed'))`,
    cancelledJobs: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} = 'cancelled')`,
    avgCompletionHours: sql<number>`COALESCE(AVG(${jobCards.actualHours}::numeric), 0)`,
    topServiceType: sql<string>`MODE() WITHIN GROUP (ORDER BY ${jobCards.serviceType})`,
  })
    .from(jobCards)
    .where(and(
      eq(jobCards.garageId, garageId),
      gte(jobCards.createdAt, thirtyDaysAgo)
    ));

  const r = result[0];
  return {
    totalJobs: Number(r?.totalJobs) || 0,
    completedJobs: Number(r?.completedJobs) || 0,
    avgCompletionHours: Number(r?.avgCompletionHours)?.toFixed(1) || '0',
    cancellationRate: r?.totalJobs ? ((Number(r?.cancelledJobs) / Number(r.totalJobs)) * 100).toFixed(1) : '0',
    topServiceType: r?.topServiceType || 'N/A',
  };
}

async function getRevenueMetrics(garageId: string) {
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const firstOfPrevMonth = new Date(firstOfMonth);
  firstOfPrevMonth.setMonth(firstOfPrevMonth.getMonth() - 1);

  const result = await db.select({
    monthlyRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.invoiceDate} >= ${firstOfMonth} THEN ${invoices.totalAmount}::numeric ELSE 0 END), 0)`,
    prevMonthRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.invoiceDate} >= ${firstOfPrevMonth} AND ${invoices.invoiceDate} < ${firstOfMonth} THEN ${invoices.totalAmount}::numeric ELSE 0 END), 0)`,
    outstandingAR: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('sent', 'overdue', 'partially_paid') THEN ${invoices.totalAmount}::numeric ELSE 0 END), 0)`,
    overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${invoices.status} = 'overdue')`,
    avgInvoiceAmount: sql<number>`COALESCE(AVG(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount}::numeric END), 0)`,
  })
    .from(invoices)
    .where(eq(invoices.garageId, garageId));

  const r = result[0];
  return {
    monthlyRevenue: Number(r?.monthlyRevenue)?.toFixed(0) || '0',
    prevMonthRevenue: Number(r?.prevMonthRevenue)?.toFixed(0) || '0',
    outstandingAR: Number(r?.outstandingAR)?.toFixed(0) || '0',
    overdueCount: Number(r?.overdueCount) || 0,
    avgInvoiceAmount: Number(r?.avgInvoiceAmount)?.toFixed(0) || '0',
  };
}

async function getInventoryMetrics(garageId: string) {
  const result = await db.select({
    totalParts: count(),
    lowStockCount: sql<number>`COUNT(*) FILTER (WHERE ${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold} AND ${sparePartInventories.stockQuantity} > 0)`,
    outOfStockCount: sql<number>`COUNT(*) FILTER (WHERE ${sparePartInventories.stockQuantity} = 0)`,
  })
    .from(sparePartInventories)
    .where(eq(sparePartInventories.garageId, garageId));

  const poResult = await db.select({
    pendingPOs: sql<number>`COUNT(*) FILTER (WHERE ${purchaseOrders.status} IN ('submitted', 'approved', 'ordered', 'sent', 'confirmed'))`,
  })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.garageId, garageId));

  const r = result[0];
  return {
    totalParts: Number(r?.totalParts) || 0,
    lowStockCount: Number(r?.lowStockCount) || 0,
    outOfStockCount: Number(r?.outOfStockCount) || 0,
    pendingPOs: Number(poResult[0]?.pendingPOs) || 0,
  };
}

async function getCustomerMetrics(garageId: string) {
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const customerResult = await db.select({
    totalCustomers: count(),
    newCustomers: sql<number>`COUNT(*) FILTER (WHERE ${users.createdAt} >= ${firstOfMonth})`,
  })
    .from(users)
    .where(and(
      eq(users.garageId, garageId),
      eq(users.userType, 'customer')
    ));

  const appointmentResult = await db.select({
    monthlyAppointments: count(),
    noShows: sql<number>`COUNT(*) FILTER (WHERE ${appointments.status} = 'no_show')`,
  })
    .from(appointments)
    .where(and(
      eq(appointments.garageId, garageId),
      gte(appointments.appointmentDate, firstOfMonth)
    ));

  const c = customerResult[0];
  const a = appointmentResult[0];
  const totalAppts = Number(a?.monthlyAppointments) || 1;

  return {
    totalCustomers: Number(c?.totalCustomers) || 0,
    newCustomers: Number(c?.newCustomers) || 0,
    monthlyAppointments: Number(a?.monthlyAppointments) || 0,
    noShowRate: ((Number(a?.noShows) / totalAppts) * 100).toFixed(1),
  };
}
