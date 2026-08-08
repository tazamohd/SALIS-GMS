/**
 * Notifications controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the notifications domain. Preserves the legacy monolith
 * contract: the 201/204, the not-found 404 surfaced from the service, the Zod
 * 400s on the email/SMS triggers (`z.ZodError` → `sanitizeZodError`), and the
 * exact per-handler success + 500 `{ message }` bodies. The 13 near-identical
 * email/SMS trigger handlers are generated from a config table. Ownership guards
 * live on the routes.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { NotificationsService } from '../services/notifications.service';
import * as S from '../notifications.schemas';

export interface TriggerConfig {
  path: string;
  schema: z.ZodTypeAny;
  template: string;
  category: string;
  metaType: string;
  ok: string;
  err: string;
}

export const EMAIL_TRIGGERS: TriggerConfig[] = [
  { path: 'appointment-confirmation', schema: S.appointmentConfirmationSchema, template: 'appointmentConfirmation', category: 'appointment', metaType: 'confirmation', ok: 'Appointment confirmation sent', err: 'Failed to send appointment confirmation' },
  { path: 'invoice', schema: S.invoiceNotificationSchema, template: 'invoiceNotification', category: 'invoice', metaType: 'invoice', ok: 'Invoice notification sent', err: 'Failed to send invoice notification' },
  { path: 'job-completed', schema: S.jobCompletedSchema, template: 'jobCompletedNotification', category: 'job_completed', metaType: 'job_completed', ok: 'Job completion notification sent', err: 'Failed to send job completion notification' },
  { path: 'feedback-request', schema: S.feedbackRequestSchema, template: 'feedbackRequest', category: 'feedback_request', metaType: 'feedback_request', ok: 'Feedback request sent', err: 'Failed to send feedback request' },
  { path: 'appointment-reminder', schema: S.appointmentReminderSchema, template: 'appointmentReminder', category: 'appointment', metaType: 'reminder', ok: 'Appointment reminder sent', err: 'Failed to send appointment reminder' },
];

export const SMS_TRIGGERS: TriggerConfig[] = [
  { path: 'appointment-reminder', schema: S.smsAppointmentReminderSchema, template: 'appointmentReminder', category: 'appointment', metaType: 'reminder', ok: 'SMS appointment reminder sent', err: 'Failed to send SMS appointment reminder' },
  { path: 'appointment-confirmation', schema: S.smsAppointmentConfirmationSchema, template: 'appointmentConfirmation', category: 'appointment', metaType: 'confirmation', ok: 'SMS appointment confirmation sent', err: 'Failed to send SMS appointment confirmation' },
  { path: 'job-status', schema: S.smsJobStatusSchema, template: 'jobStatusUpdate', category: 'job_update', metaType: 'status_update', ok: 'SMS job status update sent', err: 'Failed to send SMS job status update' },
  { path: 'job-completed', schema: S.smsJobCompletedSchema, template: 'jobCompleted', category: 'job_completed', metaType: 'job_completed', ok: 'SMS job completion notification sent', err: 'Failed to send SMS job completion notification' },
  { path: 'invoice', schema: S.smsInvoiceSchema, template: 'invoiceNotification', category: 'invoice', metaType: 'invoice', ok: 'SMS invoice notification sent', err: 'Failed to send SMS invoice notification' },
  { path: 'payment-received', schema: S.smsPaymentReceivedSchema, template: 'paymentReceived', category: 'payment', metaType: 'payment_received', ok: 'SMS payment confirmation sent', err: 'Failed to send SMS payment confirmation' },
  { path: 'estimate', schema: S.smsEstimateSchema, template: 'estimateReady', category: 'estimate', metaType: 'estimate_ready', ok: 'SMS estimate notification sent', err: 'Failed to send SMS estimate notification' },
  { path: 'feedback-request', schema: S.smsFeedbackRequestSchema, template: 'feedbackRequest', category: 'feedback_request', metaType: 'feedback_request', ok: 'SMS feedback request sent', err: 'Failed to send SMS feedback request' },
];

function uid(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeNotificationsController(service: NotificationsService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list(uid(req) as string, str(req.query.garage_id), str(req.query.status), str(req.query.type)));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
      }
    },
    async unreadCount(req: Request, res: Response): Promise<void> {
      try {
        const count = await service.unreadCount(uid(req) || 'default-user', str(req.query.garage_id));
        res.json({ count });
      } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Failed to fetch unread count' });
      }
    },
    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id));
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        console.error('Error fetching notification:', error);
        res.status(500).json({ message: 'Failed to fetch notification' });
      }
    },
    async create(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.create(req.body ?? {}));
      } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to create notification' });
      }
    },
    async update(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.update(req.params.id, req.body ?? {}));
      } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Failed to update notification' });
      }
    },
    async markRead(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.markRead(req.params.id));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
      }
    },
    async remove(req: Request, res: Response): Promise<void> {
      try {
        await service.remove(req.params.id);
        res.status(204).send();
      } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
      }
    },
    async test(req: Request, res: Response): Promise<void> {
      try {
        const garageId = (req.user as { garageId?: string } | undefined)?.garageId;
        res.status(201).json(await service.createTest(uid(req) || 'default-user', garageId));
      } catch (error) {
        console.error('Error creating test notification:', error);
        res.status(500).json({ message: 'Failed to create test notification' });
      }
    },

    // Customer self-service
    async listMine(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listMine(uid(req) as string));
      } catch (error) {
        console.error('Error listing my notifications:', error);
        res.status(500).json({ message: 'Failed to load notifications' });
      }
    },
    async markMineRead(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.markMineRead(req.params.id, uid(req) as string));
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        console.error('Error marking notification read:', error);
        res.status(500).json({ message: 'Failed to update notification' });
      }
    },

    // Config-driven trigger handlers
    emailTrigger(cfg: TriggerConfig) {
      return async (req: Request, res: Response): Promise<void> => {
        try {
          const parsed = cfg.schema.parse(req.body);
          await service.sendEmailTrigger(cfg.template, cfg.category, cfg.metaType, parsed as never);
          res.json({ message: cfg.ok });
        } catch (error) {
          if (error instanceof z.ZodError) {
            res.status(400).json(sanitizeZodError(error));
            return;
          }
          console.error(cfg.err, error);
          res.status(500).json({ message: cfg.err });
        }
      };
    },
    smsTrigger(cfg: TriggerConfig) {
      return async (req: Request, res: Response): Promise<void> => {
        try {
          const parsed = cfg.schema.parse(req.body);
          await service.sendSmsTrigger(cfg.template, cfg.category, cfg.metaType, parsed as never);
          res.json({ message: cfg.ok });
        } catch (error) {
          if (error instanceof z.ZodError) {
            res.status(400).json(sanitizeZodError(error));
            return;
          }
          console.error(cfg.err, error);
          res.status(500).json({ message: cfg.err });
        }
      };
    },
  };
}

export type NotificationsController = ReturnType<typeof makeNotificationsController>;
