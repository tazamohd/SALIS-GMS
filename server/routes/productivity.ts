/**
 * Productivity Tracker — backs GET /api/productivity.
 * Hourly job-completion buckets + per-technician stats for a chosen period.
 */
import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { jobCards, users } from "../../shared/schema";
import { and, eq, gte, isNotNull, sql, count } from "drizzle-orm";
import { getTechnicianStats } from "../ai/business-intelligence";
import { isAuthenticated } from "../auth";

const router = Router();

interface TechStat {
  id?: string;
  name: string;
  jobs: number;
  completed: number;
  avgHours: number;
  efficiency: number;
}
interface HourRow { hour: number | string; tasks: number | string; avgHours: number | string }
interface PendingRow { techId: string | null; pending: number | string }
interface TechRow { name: string; completed: number; pending: number; avgTime: string; efficiency: number }
interface HourBucket { hour: string; tasks: number; efficiency: number }

function periodDays(period: string | undefined) {
  switch (period) {
    case "today": return 1;
    case "week": return 7;
    case "month": return 30;
    default: return 1;
  }
}

// Manager+ only — productivity tracker exposes per-technician completion stats.
const MANAGEMENT_TYPES = new Set(["admin", "manager", "owner", "accountant", "staff"]);

router.get("/productivity", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  if (user.userType && !MANAGEMENT_TYPES.has(user.userType)) {
    return res.status(403).json({ message: "Insufficient privileges for productivity tracker" });
  }
  const days = periodDays(String(req.query.period ?? "today"));

  try {
    // Hourly buckets (8AM–6PM) for completed jobs in window
    const hourlyRows = await db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${jobCards.completedAt})::int`,
      tasks: count(),
      avgHours: sql<number>`COALESCE(AVG(${jobCards.actualHours}::numeric), 0)`,
    })
      .from(jobCards)
      .where(and(
        eq(jobCards.garageId, user.garageId),
        isNotNull(jobCards.completedAt),
        gte(jobCards.completedAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`)
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${jobCards.completedAt})::int`)
      .orderBy(sql`EXTRACT(HOUR FROM ${jobCards.completedAt})::int`);

    const hourlyMap: Record<number, { tasks: number; avgHours: number }> = {};
    (hourlyRows as HourRow[]).forEach((r: HourRow) => {
      hourlyMap[Number(r.hour)] = { tasks: Number(r.tasks) || 0, avgHours: Number(r.avgHours) || 0 };
    });
    const hours = [8, 10, 12, 14, 16, 18];
    const hourlyProductivity = hours.map(h => {
      const m = hourlyMap[h] || { tasks: 0, avgHours: 0 };
      const efficiency = m.avgHours > 0 ? Math.max(60, Math.min(100, Math.round(100 - m.avgHours * 5))) : 0;
      return {
        hour: `${h <= 12 ? h : h - 12}${h < 12 ? "AM" : "PM"}`,
        tasks: m.tasks,
        efficiency,
      };
    });

    // Per-technician stats from the shared helper, augmented with pending count
    const techs = await getTechnicianStats(user.garageId, days, 6);

    const pendingRows = await db.select({
      techId: jobCards.assignedTo,
      pending: count(),
    })
      .from(jobCards)
      .where(and(
        eq(jobCards.garageId, user.garageId),
        sql`${jobCards.status} IN ('pending', 'in_progress', 'assigned')`,
        gte(jobCards.createdAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`)
      ))
      .groupBy(jobCards.assignedTo);

    const pendingMap = new Map<string, number>();
    (pendingRows as PendingRow[]).forEach((r: PendingRow) => {
      if (r.techId) pendingMap.set(String(r.techId), Number(r.pending) || 0);
    });

    const technicianStats: TechRow[] = (techs as TechStat[]).map((t: TechStat) => ({
      name: t.name,
      completed: t.completed,
      pending: pendingMap.get(String(t.id ?? "")) || 0,
      avgTime: `${(t.avgHours || 0).toFixed(1)}h`,
      efficiency: t.efficiency,
    }));

    const totalCompleted = technicianStats.reduce((s: number, t: TechRow) => s + t.completed, 0);
    const averageEfficiency = technicianStats.length
      ? Math.round(technicianStats.reduce((s: number, t: TechRow) => s + t.efficiency, 0) / technicianStats.length)
      : 0;
    const avgTaskDuration = technicianStats.length
      ? `${((techs as TechStat[]).reduce((s: number, t: TechStat) => s + (t.avgHours || 0), 0) / techs.length).toFixed(1)}h`
      : "0h";

    const top = [...technicianStats].sort((a: TechRow, b: TechRow) => b.efficiency - a.efficiency)[0];
    const mostProd = [...hourlyProductivity].sort((a: HourBucket, b: HourBucket) => b.tasks - a.tasks)[0];

    const dailyTarget = Math.max(50, totalCompleted + 8);

    res.json({
      hourlyProductivity,
      technicianStats,
      metrics: {
        tasksCompleted: totalCompleted,
        averageEfficiency,
        avgTaskDuration,
        activeTechnicians: technicianStats.length,
      },
      topPerformer: top ? { name: top.name, efficiency: top.efficiency } : null,
      mostProductiveHour: mostProd ? { range: `${mostProd.hour}`, taskCount: mostProd.tasks } : null,
      teamGoalProgress: {
        completed: totalCompleted,
        target: dailyTarget,
        percent: Math.round((totalCompleted / dailyTarget) * 100),
      },
    });
  } catch (err) {
    console.error("[productivity] error:", err);
    res.status(500).json({ message: "Failed to compute productivity" });
  }
});

export const productivityRoutes = router;
