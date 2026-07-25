/**
 * requirePlan(min) — Express middleware that rejects requests whose garage
 * is on a plan below `min`. Designed to layer with isAuthenticated.
 *
 * Usage:
 *   import { requirePlan } from "../middleware/requirePlan";
 *   router.get("/some-pro-feature", isAuthenticated, requirePlan("PRO"), handler);
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";
import { meetsMinPlan, type PlanId } from "../../shared/plans";

interface PlanReq extends Request {
  garageSubscription?: { plan: PlanId; status: string };
}

export function requirePlan(min: PlanId): RequestHandler {
  return async (req: PlanReq, res: Response, next: NextFunction) => {
    const user = req.user as { garageId?: string } | undefined;
    if (!user?.garageId) {
      return res.status(403).json({ message: "No garage associated" });
    }
    try {
      const sub = await storage.ensureSubscription(user.garageId);
      const plan = (sub.plan as PlanId) ?? "STARTER";
      if (sub.status === "canceled" || sub.status === "unpaid") {
        return res.status(402).json({
          message: "Subscription inactive",
          subscription: { plan, status: sub.status },
          upgrade: { required: min, current: plan },
        });
      }
      if (!meetsMinPlan(plan, min)) {
        return res.status(402).json({
          message: `This feature requires the ${min} plan or higher`,
          subscription: { plan, status: sub.status },
          upgrade: { required: min, current: plan },
        });
      }
      req.garageSubscription = { plan, status: sub.status };
      next();
    } catch (err) {
      console.error("[requirePlan] error:", err);
      res.status(500).json({ message: "Failed to verify subscription" });
    }
  };
}
