/**
 * SALIS AUTO - Workflow Hooks
 * Intercepts entity status changes and routes them through the workflow engine
 * for validated state transitions, auto-created job cards, and inventory alerts.
 */

import { Router, Request, Response } from 'express';
import { workflowEngine } from '../engine/workflow-engine';
import { eventBus } from '../engine/event-bus';
import { db } from '../db';
import { jobCards, invoices, appointments, sparePartInventories, spareParts } from '../../shared/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { validate } from '../middleware/validate';
import { jobTransitionSchema, appointmentCheckInSchema, inventoryCheckSchema } from '../schemas/validation';

const router = Router();

// ─── POST /api/job-cards/:id/transition ───────────────────────────────────
// Validated state transition for job cards via the workflow engine.

router.post('/job-cards/:id/transition', validate(jobTransitionSchema), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const { toStatus, notes } = req.body;

    if (!toStatus) {
      return res.status(400).json({ message: 'Missing required field: toStatus' });
    }

    // Fetch the current job card
    const [jobCard] = await db
      .select()
      .from(jobCards)
      .where(
        and(
          eq(jobCards.id, id),
          eq(jobCards.garageId, user.garageId),
        ),
      )
      .limit(1);

    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    // Validate and execute the transition through the workflow engine
    const userRoles = user.roles?.map((r: any) => r.name || r) || [];
    if (user.userType) userRoles.push(user.userType);

    const result = await workflowEngine.processTransition({
      entityType: 'jobCard',
      entityId: id,
      garageId: user.garageId,
      fromStatus: jobCard.status,
      toStatus,
      userId: user.id,
      userRoles,
      data: { notes, jobNumber: jobCard.jobNumber },
    });

    if (!result.success) {
      return res.status(400).json({
        message: result.error,
        currentStatus: jobCard.status,
        transition: result.transition,
      });
    }

    // Build the update payload based on the target status
    const updateData: Record<string, any> = {
      status: toStatus,
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (toStatus === 'in_progress' && !jobCard.startedAt) {
      updateData.startedAt = new Date();
    }

    if (['completed', 'delivered', 'closed'].includes(toStatus) && !jobCard.completedAt) {
      updateData.completedAt = new Date();
    }

    // Persist the status change
    const [updated] = await db
      .update(jobCards)
      .set(updateData)
      .where(eq(jobCards.id, id))
      .returning();

    res.json({
      message: `Job card ${jobCard.jobNumber} transitioned: ${jobCard.status} -> ${toStatus}`,
      jobCard: updated,
      transition: result.transition,
    });
  } catch (error) {
    console.error('[WorkflowHooks] Job card transition error:', error);
    res.status(500).json({ message: 'Failed to process job card transition' });
  }
});

// ─── POST /api/appointments/:id/check-in ──────────────────────────────────
// Checks in an appointment and auto-creates a draft job card.

router.post('/appointments/:id/check-in', validate(appointmentCheckInSchema), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    // Fetch the appointment
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.garageId, user.garageId),
        ),
      )
      .limit(1);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'checked_in' || appointment.status === 'in_service') {
      return res.status(400).json({ message: 'Appointment is already checked in' });
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({ message: `Cannot check in a ${appointment.status} appointment` });
    }

    // Validate the transition through the workflow engine
    const userRoles = user.roles?.map((r: any) => r.name || r) || [];
    if (user.userType) userRoles.push(user.userType);

    const transitionResult = await workflowEngine.processTransition({
      entityType: 'appointment',
      entityId: id,
      garageId: user.garageId,
      fromStatus: appointment.status,
      toStatus: 'checked_in',
      userId: user.id,
      userRoles,
      data: { appointmentNumber: appointment.appointmentNumber },
    });

    if (!transitionResult.success) {
      return res.status(400).json({
        message: transitionResult.error,
        currentStatus: appointment.status,
      });
    }

    // Update appointment status
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ status: 'checked_in', updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    // Auto-create a draft job card from the appointment
    const jobNumber = `JC-${Date.now().toString(36).toUpperCase()}`;
    const [newJobCard] = await db
      .insert(jobCards)
      .values({
        jobNumber,
        garageId: user.garageId,
        branchId: appointment.branchId,
        customerId: appointment.customerId,
        vehicleInfo: appointment.vehicleInfo,
        serviceType: appointment.serviceType,
        description: appointment.description || `Service from appointment ${appointment.appointmentNumber}`,
        status: 'pending',
        priority: 'medium',
        createdBy: user.id,
        assignedTo: appointment.assignedTo,
        scheduledDate: appointment.appointmentDate,
        notes: `Auto-created from appointment ${appointment.appointmentNumber}`,
      })
      .returning();

    // Emit event for the auto-created job card
    await workflowEngine.emitEvent(
      'job.auto_created',
      'job_card',
      newJobCard.id,
      user.garageId,
      {
        appointmentId: id,
        appointmentNumber: appointment.appointmentNumber,
        jobNumber: newJobCard.jobNumber,
      },
      user.id,
    );

    res.json({
      message: `Appointment checked in. Job card ${jobNumber} created.`,
      appointment: updatedAppointment,
      jobCard: newJobCard,
    });
  } catch (error) {
    console.error('[WorkflowHooks] Check-in error:', error);
    res.status(500).json({ message: 'Failed to process appointment check-in' });
  }
});

// ─── POST /api/inventory/check-levels ─────────────────────────────────────
// Checks all inventory levels and emits low-stock events for items below threshold.

router.post('/inventory/check-levels', validate(inventoryCheckSchema), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const garageId = user.garageId;

    // Find items at or below their minimum threshold
    const lowStockItems = await db
      .select({
        inventoryId: sparePartInventories.id,
        sparePartId: sparePartInventories.sparePartId,
        partName: spareParts.name,
        partNumber: spareParts.sku,
        stockQuantity: sparePartInventories.stockQuantity,
        minThreshold: sparePartInventories.minThreshold,
        purchasePrice: sparePartInventories.purchasePrice,
        location: sparePartInventories.location,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(
        and(
          eq(sparePartInventories.garageId, garageId),
          eq(sparePartInventories.isEnabled, true),
          sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`,
        ),
      );

    // Emit low-stock events for each item
    const alerts: Array<{
      partName: string;
      partNumber: string | null;
      stockQuantity: number | null;
      minThreshold: number | null;
      isOutOfStock: boolean;
    }> = [];

    for (const item of lowStockItems) {
      const isOutOfStock = (item.stockQuantity ?? 0) === 0;
      const eventType = isOutOfStock ? 'inventory.out_of_stock' : 'inventory.low_stock';

      await workflowEngine.emitEvent(
        eventType,
        'spare_part',
        item.sparePartId,
        garageId,
        {
          inventoryId: item.inventoryId,
          partName: item.partName,
          partNumber: item.partNumber,
          stockQuantity: item.stockQuantity,
          minThreshold: item.minThreshold,
          purchasePrice: item.purchasePrice,
          location: item.location,
        },
        user.id,
      );

      alerts.push({
        partName: item.partName,
        partNumber: item.partNumber,
        stockQuantity: item.stockQuantity,
        minThreshold: item.minThreshold,
        isOutOfStock,
      });
    }

    res.json({
      message: `Inventory check complete. ${alerts.length} item(s) below threshold.`,
      lowStockCount: alerts.filter(a => !a.isOutOfStock).length,
      outOfStockCount: alerts.filter(a => a.isOutOfStock).length,
      alerts,
    });
  } catch (error) {
    console.error('[WorkflowHooks] Inventory check error:', error);
    res.status(500).json({ message: 'Failed to check inventory levels' });
  }
});

export default router;
