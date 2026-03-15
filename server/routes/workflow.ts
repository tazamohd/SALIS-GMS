/**
 * SALIS AUTO - Workflow API Routes
 * Provides state transition validation and cross-module automation endpoints.
 */

import { Router, Request, Response } from 'express';
import { workflowEngine } from '../engine/workflow-engine';
import { eventBus } from '../engine/event-bus';
import type { EntityType } from '../engine/state-machines';

const router = Router();

// POST /api/workflow/transition — Execute a validated state transition
router.post('/workflow/transition', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { entityType, entityId, fromStatus, toStatus, data } = req.body;

    if (!entityType || !entityId || !fromStatus || !toStatus) {
      return res.status(400).json({
        message: 'Missing required fields: entityType, entityId, fromStatus, toStatus',
      });
    }

    // Get user roles
    const userRoles = user.roles?.map((r: any) => r.name || r) || [];
    if (user.userType) userRoles.push(user.userType);

    const result = await workflowEngine.processTransition({
      entityType: entityType as EntityType,
      entityId,
      garageId: user.garageId,
      fromStatus,
      toStatus,
      userId: user.id,
      userRoles,
      data: data || {},
    });

    if (!result.success) {
      return res.status(400).json({
        message: result.error,
        transition: result.transition,
      });
    }

    res.json({
      message: `Transition successful: ${fromStatus} → ${toStatus}`,
      transition: result.transition,
      event: result.event,
    });
  } catch (error) {
    console.error('[Workflow] Transition error:', error);
    res.status(500).json({ message: 'Failed to process transition' });
  }
});

// GET /api/workflow/transitions/:entityType/:status — Get available next states
router.get('/workflow/transitions/:entityType/:status', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { entityType, status } = req.params;

    const userRoles = user?.roles?.map((r: any) => r.name || r) || [];
    if (user?.userType) userRoles.push(user.userType);

    const transitions = workflowEngine.getAvailableTransitions(
      entityType as EntityType,
      status,
      userRoles
    );

    res.json(transitions);
  } catch (error) {
    console.error('[Workflow] Get transitions error:', error);
    res.status(500).json({ message: 'Failed to get available transitions' });
  }
});

// POST /api/workflow/emit — Emit a custom workflow event
router.post('/workflow/emit', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { type, entityType, entityId, data } = req.body;

    if (!type || !entityType || !entityId) {
      return res.status(400).json({
        message: 'Missing required fields: type, entityType, entityId',
      });
    }

    await workflowEngine.emitEvent(
      type,
      entityType,
      entityId,
      user.garageId,
      data || {},
      user.id
    );

    res.json({ message: 'Event emitted successfully', type });
  } catch (error) {
    console.error('[Workflow] Emit error:', error);
    res.status(500).json({ message: 'Failed to emit event' });
  }
});

// GET /api/workflow/subscriptions — List all registered event subscriptions (debug/monitoring)
router.get('/workflow/subscriptions', async (_req: Request, res: Response) => {
  try {
    const subscriptions = eventBus.getSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    console.error('[Workflow] Subscriptions error:', error);
    res.status(500).json({ message: 'Failed to list subscriptions' });
  }
});

export default router;
