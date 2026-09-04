// @ts-nocheck
/**
 * Analytics & Business Intelligence routes — extracted from the monolith (routes.ts).
 *
 * Covers:
 *   /api/analytics/dashboard-metrics
 *   /api/analytics/custom-reports        (GET, POST)
 *   /api/analytics/custom-reports/:id/run (POST)
 *   /api/analytics/profit-analysis
 *   /api/analytics/customer-ltv
 *   /api/analytics/heatmaps
 *   /api/analytics/bi-report
 *   /api/analytics/realtime-kpis
 *   /api/analytics/profit-margins
 *   /api/analytics/custom-report          (POST — singular variant)
 *   /api/analytics/widgets                (GET, POST)
 *   /api/bi/profitable-services
 *   /api/bi/peak-hours
 *   /api/bi/technician-utilization
 *   /api/bi/customer-acquisition-cost
 *   /api/bi/customer-lifetime-value
 *
 * NOTE: /api/analytics/performance is served by analytics-performance.ts — not duplicated here.
 */
import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// ──────────────────────────────────────────────
// /api/analytics/*  (mounted at /api prefix)
// ──────────────────────────────────────────────

// Dashboard metrics (Phase 2)
router.get("/analytics/dashboard-metrics", isAuthenticated, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;
    const { period } = req.query;
    const { generateBusinessIntelligenceReport, getRealtimeKPIs } = await import("../analytics-service");

    // Calculate date range from period
    const dateRange = (() => {
      const now = new Date();
      const start = new Date();
      switch (period) {
        case "week":
          start.setDate(now.getDate() - 7);
          break;
        case "month":
          start.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          start.setMonth(now.getMonth() - 3);
          break;
        case "year":
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start.setMonth(now.getMonth() - 1);
      }
      return { start, end: now };
    })();

    // Get real analytics data from service
    const report = await generateBusinessIntelligenceReport(garageId, dateRange);
    const kpis = await getRealtimeKPIs(garageId);

    // Transform to frontend contract (camelCase, flat structure)
    const revenue: any = report.revenue || {};
    const payments: any = report.payments || {};

    const totalRevenue = Number(revenue.total_revenue || 0);
    const totalInvoiced = Number(payments.total_invoiced || 0);
    const totalCollected = Number(payments.total_collected || 0);

    // Calculate costs estimate (assuming 65% margin)
    const totalCosts = totalRevenue * 0.65;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.json({
      totalRevenue,
      totalCosts: Math.round(totalCosts),
      netProfit: Math.round(netProfit),
      profitMargin: Number(profitMargin.toFixed(1)),
      activeCustomers: Number(revenue.unique_customers || 0),
      jobCards: Number(revenue.total_jobs || 0),
      period,
      ...kpis,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ message: "Failed to fetch dashboard metrics" });
  }
});

// Custom reports — list
router.get("/analytics/custom-reports", isAuthenticated, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;
    // Return empty array for now - reports can be created
    res.json([]);
  } catch (error) {
    console.error("Error fetching custom reports:", error);
    res.status(500).json({ message: "Failed to fetch custom reports" });
  }
});

// Custom reports — create
router.post("/analytics/custom-reports", isAuthenticated, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;
    const userId = req.user?.id || "default-user";
    const { name, description, reportType, schedule } = req.body;

    // Mock creation - would use storage in production
    const report = {
      id: Math.random().toString(36).substring(7),
      garageId,
      name,
      description,
      reportType,
      schedule,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    res.json(report);
  } catch (error) {
    console.error("Error creating custom report:", error);
    res.status(500).json({ message: "Failed to create custom report" });
  }
});

// Custom reports — run one
router.post("/analytics/custom-reports/:id/run", isAuthenticated, async (req: any, res: Response) => {
  try {
    // Mock running a report
    res.json({ success: true, message: "Report generated successfully" });
  } catch (error) {
    console.error("Error running report:", error);
    res.status(500).json({ message: "Failed to run report" });
  }
});

// Profit analysis
router.get("/analytics/profit-analysis", isAuthenticated, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;
    const { periodType = "service" } = req.query;
    const { analyzeProfitMargins } = await import("../analytics-service");

    // Get real profit analysis from service
    const analysis: any = await analyzeProfitMargins(
      garageId,
      periodType as "service" | "technician" | "customer"
    );

    // Transform snake_case to camelCase for frontend
    const transformRow = (row: any) => ({
      name: row.service_type || row.technician_name || row.customer_name || row.name || "Unknown",
      totalRevenue: Number(row.total_revenue || row.revenue || 0),
      totalCosts: Number(row.total_costs || row.costs || 0),
      netProfit: Number(row.net_profit || row.profit || 0),
      profitMargin: Number(row.profit_margin || row.margin || 0),
      jobCount: Number(row.job_count || row.jobs || 0),
    });

    const data = Array.isArray(analysis) ? analysis.map(transformRow) : (analysis.data || []).map(transformRow);

    res.json({
      data,
      periodType,
      totalRevenue: data.reduce((sum: number, row: any) => sum + row.totalRevenue, 0),
      totalCosts: data.reduce((sum: number, row: any) => sum + row.totalCosts, 0),
      netProfit: data.reduce((sum: number, row: any) => sum + row.netProfit, 0),
    });
  } catch (error) {
    console.error("Error fetching profit analysis:", error);
    res.status(500).json({ message: "Failed to fetch profit analysis" });
  }
});

// Customer lifetime value
router.get("/analytics/customer-ltv", isAuthenticated, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;
    const { riskFilter } = req.query;
    const { analyzeCustomerLTV } = await import("../analytics-service");

    // Get real customer LTV analysis from service
    const ltvAnalysis: any = await analyzeCustomerLTV(garageId);

    // Transform snake_case to camelCase
    const transformCustomer = (c: any) => ({
      customerId: c.customer_id || c.id,
      customerName: c.customer_name || c.name,
      lifetimeValue: Number(c.lifetime_value || c.ltv || 0),
      totalJobs: Number(c.total_jobs || c.jobs || 0),
      totalSpent: Number(c.total_spent || c.spent || 0),
      avgJobValue: Number(c.avg_job_value || c.avgValue || 0),
      lastVisit: c.last_visit || c.lastVisit,
      churnRisk: c.churn_risk || c.risk || "low",
      segment: c.segment || "regular",
    });

    // Extract customers array (handles both array and object response)
    let customers = Array.isArray(ltvAnalysis) ? ltvAnalysis : (ltvAnalysis.customers || ltvAnalysis.data || []);
    customers = customers.map(transformCustomer);

    // Apply risk filter if provided
    if (riskFilter) {
      customers = customers.filter((c: any) => c.churnRisk === riskFilter);
    }

    res.json(customers);
  } catch (error) {
    console.error("Error fetching customer LTV:", error);
    res.status(500).json({ message: "Failed to fetch customer LTV data" });
  }
});

// Heatmaps
router.get("/analytics/heatmaps", isAuthenticated, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;
    const { heatmapType = "time", period } = req.query;
    const { generateBusinessHeatMaps } = await import("../analytics-service");

    // Get real heat map data from service
    const heatmap: any = await generateBusinessHeatMaps(
      garageId,
      heatmapType as "time" | "service" | "technician"
    );

    // Transform snake_case to camelCase
    const transformDataPoint = (point: any) => ({
      label: point.hour_of_day || point.day_of_week || point.service_type || point.technician_name || point.label || "Unknown",
      value: Number(point.job_count || point.count || point.value || 0),
      revenue: Number(point.revenue || point.total_revenue || 0),
      avgValue: Number(point.avg_value || point.avg_job_value || 0),
    });

    // Extract data array (handles both array and object response)
    const data = Array.isArray(heatmap) ? heatmap.map(transformDataPoint) : (heatmap.data || heatmap.points || []).map(transformDataPoint);

    res.json(data);
  } catch (error) {
    console.error("Error fetching heatmaps:", error);
    res.status(500).json({ message: "Failed to fetch heatmap data" });
  }
});

// BI report (Phase 2 advanced analytics)
router.get("/analytics/bi-report", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const { generateBusinessIntelligenceReport } = await import("../analytics-service");

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string),
    } : undefined;

    const report = await generateBusinessIntelligenceReport(req.user?.garageId, dateRange);
    res.json(report);
  } catch (error) {
    console.error("Error generating BI report:", error);
    res.status(500).json({ message: "Failed to generate BI report" });
  }
});

// Real-time KPIs
router.get("/analytics/realtime-kpis", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { getRealtimeKPIs } = await import("../analytics-service");
    const kpis = await getRealtimeKPIs(req.user?.garageId);
    res.json(kpis);
  } catch (error) {
    console.error("Error fetching real-time KPIs:", error);
    res.status(500).json({ message: "Failed to fetch KPIs" });
  }
});

// Profit margins (raw SQL variant)
router.get("/analytics/profit-margins", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { groupBy } = req.query;
    const { analyzeProfitMargins } = await import("../analytics-service");

    const analysis = await analyzeProfitMargins(
      req.user?.garageId,
      (groupBy as "service" | "technician" | "customer") || "service"
    );

    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing profit margins:", error);
    res.status(500).json({ message: "Failed to analyze profit margins" });
  }
});

// Custom report — singular variant (Phase 2 builder)
router.post("/analytics/custom-report", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { reportType, filters, dateRange } = req.body;

    // TODO: Implement createCustomReport in storage
    res.status(201).json({
      id: "report-new",
      userId: req.user?.id,
      garageId: req.user?.garageId,
      reportName: reportType,
      filters,
      dateRange,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating custom report:", error);
    res.status(500).json({ message: "Failed to create custom report" });
  }
});

// Dashboard widgets — create
router.post("/analytics/widgets", isAuthenticated, async (req: any, res: Response) => {
  try {
    // TODO: Implement createDashboardWidget in storage
    res.status(201).json({
      id: "widget-new",
      ...req.body,
      userId: req.user?.id,
      garageId: req.user?.garageId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating widget:", error);
    res.status(500).json({ message: "Failed to create widget" });
  }
});

// Dashboard widgets — list
router.get("/analytics/widgets", isAuthenticated, async (req: any, res: Response) => {
  try {
    // TODO: Implement getDashboardWidgets in storage
    res.json([]);
  } catch (error) {
    console.error("Error fetching widgets:", error);
    res.status(500).json({ message: "Failed to fetch widgets" });
  }
});

// ──────────────────────────────────────────────
// /api/bi/*  (Business Intelligence — Module 30)
// ──────────────────────────────────────────────

router.get("/bi/profitable-services", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { garageId, startDate, endDate } = req.query;

    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }

    const result = await storage.getMostProfitableServices(
      garageId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching profitable services:", error);
    res.status(500).json({ message: "Failed to fetch profitable services data" });
  }
});

router.get("/bi/peak-hours", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { garageId, startDate, endDate } = req.query;

    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }

    const result = await storage.getPeakHoursAnalysis(
      garageId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching peak hours:", error);
    res.status(500).json({ message: "Failed to fetch peak hours data" });
  }
});

router.get("/bi/technician-utilization", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { garageId, startDate, endDate } = req.query;

    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }

    const result = await storage.getTechnicianUtilizationRates(
      garageId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching technician utilization:", error);
    res.status(500).json({ message: "Failed to fetch technician utilization data" });
  }
});

router.get("/bi/customer-acquisition-cost", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { garageId, startDate, endDate } = req.query;

    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }

    const result = await storage.getCustomerAcquisitionCost(
      garageId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching customer acquisition cost:", error);
    res.status(500).json({ message: "Failed to fetch customer acquisition cost data" });
  }
});

router.get("/bi/customer-lifetime-value", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { garageId, startDate, endDate } = req.query;

    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }

    const result = await storage.getCustomerAnalytics(
      garageId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching customer lifetime value:", error);
    res.status(500).json({ message: "Failed to fetch customer lifetime value data" });
  }
});

export default router;
