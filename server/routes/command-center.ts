/**
 * SALIS AUTO - Operations Command Center API
 * Aggregates data from all departments into a single real-time view.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  jobCards, invoices, appointments, spareParts,
  sparePartInventories, purchaseOrders, users
} from '../../shared/schema';
import { eq, and, gte, sql, count } from 'drizzle-orm';
import { eventBus } from '../engine/event-bus';
import type { CommandCenterData, AlertItem } from '../../shared/workflows';

const router = Router();

// GET /api/command-center/live — Real-time aggregated dashboard data
router.get('/command-center/live', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const garageId = user.garageId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Run all queries in parallel for performance
    const [
      jobStats,
      invoiceStats,
      appointmentStats,
      inventoryStats,
      poStats,
      staffStats,
    ] = await Promise.all([
      // Service stats
      db.select({
        total: count(),
        active: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} IN ('in_progress', 'assigned'))`,
        pending: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} = 'pending')`,
        completedToday: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} IN ('completed', 'delivered', 'closed') AND ${jobCards.completedAt} >= ${today})`,
        overdue: sql<number>`COUNT(*) FILTER (WHERE ${jobCards.status} IN ('in_progress', 'assigned') AND ${jobCards.estimatedCompletionAt} < NOW())`,
      })
        .from(jobCards)
        .where(eq(jobCards.garageId, garageId)),

      // Finance - Invoice stats
      db.select({
        totalOutstanding: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('sent', 'overdue', 'partially_paid') THEN ${invoices.totalAmount}::numeric ELSE 0 END), 0)`,
        overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${invoices.status} = 'overdue')`,
        dailyRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.invoiceDate} >= ${today} THEN ${invoices.totalAmount}::numeric ELSE 0 END), 0)`,
        monthlyRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.invoiceDate} >= ${firstOfMonth} THEN ${invoices.totalAmount}::numeric ELSE 0 END), 0)`,
      })
        .from(invoices)
        .where(eq(invoices.garageId, garageId)),

      // Customer - Appointment stats
      db.select({
        todayCount: sql<number>`COUNT(*) FILTER (WHERE ${appointments.appointmentDate} >= ${today} AND ${appointments.appointmentDate} <= ${endOfDay})`,
        noShows: sql<number>`COUNT(*) FILTER (WHERE ${appointments.status} = 'no_show' AND ${appointments.appointmentDate} >= ${today})`,
      })
        .from(appointments)
        .where(eq(appointments.garageId, garageId)),

      // Parts - Inventory health
      db.select({
        totalParts: count(),
        lowStock: sql<number>`COUNT(*) FILTER (WHERE ${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold})`,
        outOfStock: sql<number>`COUNT(*) FILTER (WHERE ${sparePartInventories.stockQuantity} = 0)`,
      })
        .from(sparePartInventories)
        .where(eq(sparePartInventories.garageId, garageId)),

      // PO stats
      db.select({
        pendingPOs: sql<number>`COUNT(*) FILTER (WHERE ${purchaseOrders.status} IN ('submitted', 'approved', 'ordered', 'sent', 'confirmed'))`,
      })
        .from(purchaseOrders)
        .where(eq(purchaseOrders.garageId, garageId)),

      // HR - Staff count
      db.select({
        totalStaff: count(),
      })
        .from(users)
        .where(and(eq(users.garageId, garageId), eq(users.isActive, true))),
    ]);

    // Build alerts
    const alerts: AlertItem[] = [];

    const invStats = invoiceStats[0];
    if (invStats && Number(invStats.overdueCount) > 0) {
      alerts.push({
        id: 'alert-overdue-invoices',
        severity: 'warning',
        department: 'Finance',
        message: `${invStats.overdueCount} overdue invoices totaling outstanding amount`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    const invStatsResult = inventoryStats[0];
    if (invStatsResult && Number(invStatsResult.outOfStock) > 0) {
      alerts.push({
        id: 'alert-out-of-stock',
        severity: 'critical',
        department: 'Parts',
        message: `${invStatsResult.outOfStock} parts are out of stock`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    if (invStatsResult && Number(invStatsResult.lowStock) > 0) {
      alerts.push({
        id: 'alert-low-stock',
        severity: 'warning',
        department: 'Parts',
        message: `${invStatsResult.lowStock} parts are running low`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    const jStats = jobStats[0];
    if (jStats && Number(jStats.overdue) > 0) {
      alerts.push({
        id: 'alert-overdue-jobs',
        severity: 'critical',
        department: 'Service',
        message: `${jStats.overdue} jobs are past their estimated completion time`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // Get recent workflow events
    const recentEvents = eventBus.getRecentEvents(20, garageId);

    const totalPartsCount = Number(invStatsResult?.totalParts) || 1;
    const lowStockCount = Number(invStatsResult?.lowStock) || 0;
    const stockHealth = Math.round(((totalPartsCount - lowStockCount) / totalPartsCount) * 100);

    const data: CommandCenterData = {
      service: {
        activeJobs: Number(jStats?.active) || 0,
        pendingJobs: Number(jStats?.pending) || 0,
        completedToday: Number(jStats?.completedToday) || 0,
        avgCompletionTime: 0,
        bayUtilization: 0,
        overdueJobs: Number(jStats?.overdue) || 0,
      },
      parts: {
        stockHealth,
        pendingPOs: Number(poStats[0]?.pendingPOs) || 0,
        lowStockAlerts: lowStockCount,
        turnoverRate: 0,
        stockoutCount: Number(invStatsResult?.outOfStock) || 0,
      },
      finance: {
        dailyRevenue: Number(invStats?.dailyRevenue) || 0,
        monthlyRevenue: Number(invStats?.monthlyRevenue) || 0,
        outstandingAR: Number(invStats?.totalOutstanding) || 0,
        collectionRate: 0,
        avgMargin: 0,
        overdueInvoices: Number(invStats?.overdueCount) || 0,
      },
      hr: {
        presentToday: 0,
        totalStaff: Number(staffStats[0]?.totalStaff) || 0,
        attendanceRate: 0,
        overtimeHours: 0,
        technicianUtilization: 0,
      },
      customer: {
        appointmentsToday: Number(appointmentStats[0]?.todayCount) || 0,
        walkIns: 0,
        avgWaitTime: 0,
        npsScore: 0,
        repeatRate: 0,
        avgRating: 0,
      },
      alerts,
      recentEvents,
    };

    res.json(data);
  } catch (error) {
    console.error('[CommandCenter] Error:', error);
    res.status(500).json({ message: 'Failed to load command center data' });
  }
});

// GET /api/command-center/events — Recent workflow events
router.get('/command-center/events', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const limit = parseInt(req.query.limit as string) || 50;
    const events = eventBus.getRecentEvents(limit, user?.garageId);
    res.json(events);
  } catch (error) {
    console.error('[CommandCenter] Events error:', error);
    res.status(500).json({ message: 'Failed to load events' });
  }
});

// GET /api/command-center/event-stats — Event statistics
router.get('/command-center/event-stats', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const since = req.query.since ? new Date(req.query.since as string) : undefined;
    const stats = eventBus.getEventCounts(since, user?.garageId);
    res.json(stats);
  } catch (error) {
    console.error('[CommandCenter] Stats error:', error);
    res.status(500).json({ message: 'Failed to load event stats' });
  }
});

export default router;
