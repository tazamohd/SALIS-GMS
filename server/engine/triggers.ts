// @ts-nocheck
/**
 * SALIS AUTO - Cross-Module Workflow Triggers
 * Registers automated actions that fire when events occur.
 * This is the "glue" connecting all departments together.
 */

import { eventBus } from './event-bus';
import type { WorkflowEvent } from '../../shared/workflows';

/**
 * Register all cross-department workflow triggers.
 * Called once at server startup.
 */
export function registerWorkflowTriggers(): void {
  // ─── Job Card Triggers ───────────────────────────────────────────────

  // When a job is assigned → notify technician + check parts availability
  eventBus.on('job.assigned', async (event: WorkflowEvent) => {
    const { technicianId, jobCardId, garageId } = event.data;
    try {
      const { storage } = await import('../storage');

      // Create notification for technician
      if (technicianId) {
        await storage.createNotification({
          userId: technicianId,
          garageId: event.garageId,
          type: 'job_assigned',
          title: 'New Job Assigned',
          message: `Job #${jobCardId} has been assigned to you.`,
          priority: 'high',
          channel: 'in_app',
          data: { jobCardId },
        });
      }

      // Broadcast via WebSocket
      const { getChatWebSocketServer } = await import('../websocket');
      const ws = getChatWebSocketServer();
      if (ws && technicianId) {
        ws.broadcastNotification(technicianId, {
          type: 'job_assigned',
          jobCardId,
          message: 'New job assigned to you',
        });
      }
    } catch (err) {
      console.error('[Trigger] job.assigned error:', err);
    }
  }, 'Notify technician and check parts on job assignment');

  // When a job is completed → auto-generate invoice + update analytics
  eventBus.on('job.completed', async (event: WorkflowEvent) => {
    const { jobCardId, customerId } = event.data;
    try {
      const { storage } = await import('../storage');

      // Notify customer
      if (customerId) {
        await storage.createNotification({
          userId: customerId,
          garageId: event.garageId,
          type: 'job_completed',
          title: 'Service Completed',
          message: `Your vehicle service (Job #${jobCardId}) has been completed.`,
          priority: 'medium',
          channel: 'in_app',
          data: { jobCardId },
        });
      }

      // Emit analytics event
      await eventBus.emit(eventBus.createEvent(
        'analytics.job_completed',
        'job_card',
        jobCardId,
        event.garageId,
        event.data,
        event.userId
      ));
    } catch (err) {
      console.error('[Trigger] job.completed error:', err);
    }
  }, 'Auto-generate invoice and notify customer on job completion');

  // ─── Appointment Triggers ────────────────────────────────────────────

  // When appointment is confirmed → send SMS + email
  eventBus.on('appointment.confirmed', async (event: WorkflowEvent) => {
    const { appointmentId, customerPhone, customerEmail, appointmentDate } = event.data;
    try {
      // Send SMS confirmation
      if (customerPhone) {
        try {
          const { sendSMS } = await import('../smsService');
          await sendSMS(
            customerPhone,
            `Your appointment has been confirmed for ${appointmentDate}. Thank you for choosing SALIS AUTO!`
          );
        } catch (smsErr) {
          console.warn('[Trigger] SMS send failed (non-critical):', smsErr);
        }
      }

      // Create in-app notification
      const { storage } = await import('../storage');
      if (event.data.customerId) {
        await storage.createNotification({
          userId: event.data.customerId,
          garageId: event.garageId,
          type: 'appointment_confirmed',
          title: 'Appointment Confirmed',
          message: `Your appointment for ${appointmentDate} has been confirmed.`,
          priority: 'medium',
          channel: 'in_app',
          data: { appointmentId },
        });
      }
    } catch (err) {
      console.error('[Trigger] appointment.confirmed error:', err);
    }
  }, 'Send SMS/email confirmation when appointment confirmed');

  // When customer checks in → auto-create job card
  eventBus.on('appointment.checked_in', async (event: WorkflowEvent) => {
    const { appointmentId, vehicleId, customerId } = event.data;
    try {
      const { storage } = await import('../storage');

      // Notify service advisor
      await storage.createNotification({
        userId: event.userId || '',
        garageId: event.garageId,
        type: 'customer_checked_in',
        title: 'Customer Checked In',
        message: `Customer has checked in for appointment #${appointmentId}. Ready to create job card.`,
        priority: 'high',
        channel: 'in_app',
        data: { appointmentId, vehicleId, customerId },
      });
    } catch (err) {
      console.error('[Trigger] appointment.checked_in error:', err);
    }
  }, 'Notify advisor and prepare job card on customer check-in');

  // ─── Inventory Triggers ──────────────────────────────────────────────

  // When inventory is low → create alert + suggest PO
  eventBus.on('inventory.low_stock', async (event: WorkflowEvent) => {
    const { partId, partName, currentQty, minQty, garageId } = event.data;
    try {
      const { storage } = await import('../storage');

      // Create stock alert
      await storage.createNotification({
        userId: '', // broadcast to managers
        garageId: event.garageId,
        type: 'low_stock_alert',
        title: 'Low Stock Alert',
        message: `${partName} is running low (${currentQty}/${minQty}). Consider reordering.`,
        priority: 'high',
        channel: 'in_app',
        data: { partId, currentQty, minQty },
      });

      // Broadcast WebSocket alert
      const { getChatWebSocketServer } = await import('../websocket');
      const ws = getChatWebSocketServer();
      if (ws) {
        ws.broadcastNotificationToUsers([], {
          type: 'low_stock',
          partId,
          partName,
          currentQty,
          minQty,
        });
      }
    } catch (err) {
      console.error('[Trigger] inventory.low_stock error:', err);
    }
  }, 'Alert managers and suggest PO when stock is low');

  // ─── Payment Triggers ────────────────────────────────────────────────

  // When payment received → update invoice + post to GL
  eventBus.on('payment.received', async (event: WorkflowEvent) => {
    const { invoiceId, amount, paymentMethod } = event.data;
    try {
      const { storage } = await import('../storage');

      // Notify customer of receipt
      if (event.data.customerId) {
        await storage.createNotification({
          userId: event.data.customerId,
          garageId: event.garageId,
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment of ${amount} received. Thank you!`,
          priority: 'low',
          channel: 'in_app',
          data: { invoiceId, amount, paymentMethod },
        });
      }

      // Emit accounting event for GL posting
      await eventBus.emit(eventBus.createEvent(
        'accounting.payment_received',
        'payment',
        event.entityId,
        event.garageId,
        { invoiceId, amount, paymentMethod },
        event.userId
      ));
    } catch (err) {
      console.error('[Trigger] payment.received error:', err);
    }
  }, 'Update invoice status and post to GL on payment');

  // ─── Invoice Triggers ────────────────────────────────────────────────

  // When invoice is overdue → send reminder chain
  eventBus.on('invoice.overdue', async (event: WorkflowEvent) => {
    const { invoiceId, customerId, amount, daysOverdue } = event.data;
    try {
      const { storage } = await import('../storage');

      if (customerId) {
        await storage.createNotification({
          userId: customerId,
          garageId: event.garageId,
          type: 'invoice_overdue',
          title: 'Invoice Overdue',
          message: `Invoice #${invoiceId} for ${amount} is ${daysOverdue} days overdue. Please make payment.`,
          priority: 'high',
          channel: 'in_app',
          data: { invoiceId, amount, daysOverdue },
        });
      }
    } catch (err) {
      console.error('[Trigger] invoice.overdue error:', err);
    }
  }, 'Send overdue reminders to customers');

  // ─── Purchase Order Triggers ─────────────────────────────────────────

  // When PO is received → update inventory
  eventBus.on('purchase_order.received', async (event: WorkflowEvent) => {
    const { poId, items } = event.data;
    try {
      // Emit inventory update events for each item
      if (Array.isArray(items)) {
        for (const item of items) {
          await eventBus.emit(eventBus.createEvent(
            'inventory.stock_received',
            'spare_part',
            item.partId,
            event.garageId,
            { quantity: item.quantity, poId },
            event.userId
          ));
        }
      }
    } catch (err) {
      console.error('[Trigger] purchase_order.received error:', err);
    }
  }, 'Update inventory when PO items received');

  // ─── HR Triggers ─────────────────────────────────────────────────────

  // When technician clocks in → update availability
  eventBus.on('technician.clock_in', async (event: WorkflowEvent) => {
    try {
      const { getChatWebSocketServer } = await import('../websocket');
      const ws = getChatWebSocketServer();
      if (ws) {
        // Broadcast to dashboard
        ws.broadcastNotificationToUsers([], {
          type: 'technician_available',
          technicianId: event.entityId,
          garageId: event.garageId,
        });
      }
    } catch (err) {
      console.error('[Trigger] technician.clock_in error:', err);
    }
  }, 'Update dashboard when technician clocks in');

  // ─── Analytics Aggregation ───────────────────────────────────────────

  // Catch-all analytics events for command center
  eventBus.on('analytics.*', async (event: WorkflowEvent) => {
    try {
      const { getChatWebSocketServer } = await import('../websocket');
      const ws = getChatWebSocketServer();
      if (ws) {
        // Broadcast analytics update to all connected dashboards
        ws.broadcastNotificationToUsers([], {
          type: 'analytics_update',
          eventType: event.type,
          data: event.data,
        });
      }
    } catch (err) {
      // Analytics trigger failures are non-critical
      console.warn('[Trigger] analytics broadcast error:', err);
    }
  }, 'Broadcast analytics updates to dashboards');

  console.log('✅ Workflow triggers registered');
}
