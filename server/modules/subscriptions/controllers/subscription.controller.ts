/**
 * Subscription controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy contract of
 * `server/routes/subscriptions.ts`: the garage-required 403, the platform-admin
 * 403 ("Forbidden"), the Zod 400s ("Invalid plan" / "Invalid patch"), and the
 * exact per-handler `{ message }` 500 bodies. The Stripe-configured flag and the
 * current timestamp are resolved here and passed to the service. No business
 * rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import type { PlanId } from '@shared/plans';
import type { SubscriptionService } from '../services/subscription.service';

interface AuthedUser { id?: string; garageId?: string; role?: string }
const u = (req: Request): AuthedUser => (req.user as AuthedUser | undefined) ?? {};
const isPlatformAdmin = (user: AuthedUser): boolean => user.role === 'PLATFORM_ADMIN';

const changeSchema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'ENTERPRISE'] as [PlanId, ...PlanId[]]),
});
const adminPatchSchema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'ENTERPRISE'] as [PlanId, ...PlanId[]]).optional(),
  status: z.enum(['active', 'trialing', 'past_due', 'canceled', 'unpaid']).optional(),
  currentPeriodEnd: z.coerce.date().nullable().optional(),
  cancelAt: z.coerce.date().nullable().optional(),
});

export function makeSubscriptionController(service: SubscriptionService) {
  return {
    plans(_req: Request, res: Response): void {
      res.json(service.planCatalog());
    },

    async current(req: Request, res: Response): Promise<void> {
      const user = u(req);
      if (!user.garageId) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.current(user.garageId));
      } catch (err) {
        console.error('[subscriptions/current] error:', err);
        res.status(500).json({ message: 'Failed to load subscription' });
      }
    },

    async changePlan(req: Request, res: Response): Promise<void> {
      const user = u(req);
      if (!user.garageId) { res.status(403).json({ message: 'No garage associated' }); return; }
      const parsed = changeSchema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ message: 'Invalid plan', errors: parsed.error.flatten() }); return; }
      const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
      try {
        res.json(await service.changePlan(user.garageId, parsed.data.plan, new Date(), stripeConfigured));
      } catch (err) {
        console.error('[subscriptions/change-plan] error:', err);
        res.status(500).json({ message: 'Failed to change plan' });
      }
    },

    async cancel(req: Request, res: Response): Promise<void> {
      const user = u(req);
      if (!user.garageId) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.cancel(user.garageId, new Date()));
      } catch (err) {
        console.error('[subscriptions/cancel] error:', err);
        res.status(500).json({ message: 'Failed to schedule cancellation' });
      }
    },

    async resume(req: Request, res: Response): Promise<void> {
      const user = u(req);
      if (!user.garageId) { res.status(403).json({ message: 'No garage associated' }); return; }
      try {
        res.json(await service.resume(user.garageId));
      } catch (err) {
        console.error('[subscriptions/resume] error:', err);
        res.status(500).json({ message: 'Failed to resume subscription' });
      }
    },

    async listAll(req: Request, res: Response): Promise<void> {
      if (!isPlatformAdmin(u(req))) { res.status(403).json({ message: 'Forbidden' }); return; }
      try {
        res.json(await service.listAll());
      } catch (err) {
        console.error('[subscriptions/all] error:', err);
        res.status(500).json({ message: 'Failed to list subscriptions' });
      }
    },

    async adminPatch(req: Request, res: Response): Promise<void> {
      if (!isPlatformAdmin(u(req))) { res.status(403).json({ message: 'Forbidden' }); return; }
      const parsed = adminPatchSchema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ message: 'Invalid patch', errors: parsed.error.flatten() }); return; }
      try {
        res.json(await service.adminPatch(req.params.garageId, parsed.data));
      } catch (err) {
        console.error('[subscriptions/:garageId] error:', err);
        res.status(500).json({ message: 'Failed to update subscription' });
      }
    },
  };
}

export type SubscriptionController = ReturnType<typeof makeSubscriptionController>;
