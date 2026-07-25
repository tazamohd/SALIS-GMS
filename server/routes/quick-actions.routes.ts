/**
 * Mobile quick-actions routes.
 *
 * Per-user configurable shortcuts shown on the customer/technician mobile apps
 * (the mobile_quick_actions table existed in the schema but had no API). All
 * operations are scoped to the calling user — you can only see/modify your own.
 *
 *   GET    /api/quick-actions[?appType=customer|technician]
 *   POST   /api/quick-actions
 *   PATCH  /api/quick-actions/:id      (own only)
 *   DELETE /api/quick-actions/:id      (own only)
 */
import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import { mobileQuickActions, insertMobileQuickActionSchema } from "@shared/schema";
import { logger } from "../logger";

const router = Router();

router.get("/quick-actions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const appType = req.query.appType as string | undefined;
    const conds = [eq(mobileQuickActions.userId, userId)];
    if (appType) conds.push(eq(mobileQuickActions.appType, appType));
    const rows = await db
      .select()
      .from(mobileQuickActions)
      .where(conds.length === 1 ? conds[0] : and(...conds))
      .orderBy(asc(mobileQuickActions.sortOrder));
    res.json({ data: rows });
  } catch (error: any) {
    logger.error("quick-actions list failed", { error: String(error) });
    res.status(500).json({ message: "Failed to fetch quick actions" });
  }
});

router.post("/quick-actions", isAuthenticated, async (req: any, res) => {
  try {
    // Force ownership to the caller; never trust a body userId.
    const parsed = insertMobileQuickActionSchema.safeParse({ ...req.body, userId: req.user?.id });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    const [row] = await db.insert(mobileQuickActions).values(parsed.data as any).returning();
    res.status(201).json({ data: row });
  } catch (error: any) {
    logger.error("quick-action create failed", { error: String(error) });
    res.status(500).json({ message: "Failed to create quick action" });
  }
});

async function ownedAction(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(mobileQuickActions)
    .where(and(eq(mobileQuickActions.id, id), eq(mobileQuickActions.userId, userId)))
    .limit(1);
  return row;
}

router.patch("/quick-actions/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await ownedAction(req.params.id, req.user?.id))) {
      return res.status(404).json({ message: "Quick action not found" });
    }
    // Don't allow reassigning ownership.
    const { userId: _ignore, ...patch } = req.body || {};
    const [row] = await db
      .update(mobileQuickActions)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(mobileQuickActions.id, req.params.id))
      .returning();
    res.json({ data: row });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update quick action" });
  }
});

router.delete("/quick-actions/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await ownedAction(req.params.id, req.user?.id))) {
      return res.status(404).json({ message: "Quick action not found" });
    }
    await db.delete(mobileQuickActions).where(eq(mobileQuickActions.id, req.params.id));
    res.json({ message: "Deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete quick action" });
  }
});

export default router;
