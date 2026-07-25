import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import * as phase5Service from '../phase5-operations-service';

const router = Router();

const autoReorderRuleSchema = z.object({
  partId: z.string(),
  minQuantity: z.number().int().positive().optional(),
  reorderPoint: z.number().int().positive().optional(),
  reorderQuantity: z.number().int().positive(),
  preferredSupplierId: z.string().optional(),
  preferredSupplier: z.string().optional(),
  maxPrice: z.union([z.string(), z.number()]).optional(),
}).refine((data) => data.minQuantity !== undefined || data.reorderPoint !== undefined, {
  message: 'Either minQuantity or reorderPoint is required',
  path: ['reorderPoint'],
});

function sanitizeZodError(error: z.ZodError) {
  return {
    message: 'Invalid request body',
    errors: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

function parseLimit(limit: unknown, fallback: number) {
  if (typeof limit !== 'string') {
    return fallback;
  }

  const parsed = Number.parseInt(limit, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

router.post('/auto-reorder/rules', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) {
      return res.status(400).json({
        message: 'Garage ID is required. Please ensure you are associated with a garage.',
      });
    }

    const validated = autoReorderRuleSchema.parse(req.body);
    const rule = await phase5Service.createAutoReorderRule({
      garageId,
      partId: validated.partId,
      reorderPoint: validated.reorderPoint ?? validated.minQuantity,
      reorderQuantity: validated.reorderQuantity,
      preferredSupplier: validated.preferredSupplier ?? validated.preferredSupplierId,
      maxPrice: validated.maxPrice,
    });

    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error('Error creating auto-reorder rule:', error);
    res.status(500).json({ message: 'Failed to create auto-reorder rule' });
  }
});

router.get('/auto-reorder/rules', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const rules = await phase5Service.getAutoReorderRules(garageId);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching auto-reorder rules:', error);
    res.status(500).json({ message: 'Failed to fetch auto-reorder rules' });
  }
});

router.post('/auto-reorder/check', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) {
      return res.status(400).json({
        message: 'Garage ID is required. Please ensure you are associated with a garage.',
      });
    }

    const triggeredOrders = await phase5Service.checkAndTriggerReorders(garageId);
    res.json({ triggered: triggeredOrders.length, orders: triggeredOrders });
  } catch (error) {
    console.error('Error checking auto-reorders:', error);
    res.status(500).json({ message: 'Failed to check auto-reorders' });
  }
});

router.get('/auto-reorder/history', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const history = await phase5Service.getReorderHistory(garageId, parseLimit(limit, 50));
    res.json(history);
  } catch (error) {
    console.error('Error fetching reorder history:', error);
    res.status(500).json({ message: 'Failed to fetch reorder history' });
  }
});

export default router;
