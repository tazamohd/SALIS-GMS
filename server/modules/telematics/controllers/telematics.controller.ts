/**
 * Telematics controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the telematics domain. Preserves the two legacy
 * response conventions verbatim:
 *  - integration feeds/alerts: `{ data }` envelope, `{ error: message }` 500s,
 *    Zod `400` via `sanitizeZodError`.
 *  - per-vehicle device/readings: raw body, `{ message }` 500 strings (with
 *    console labels), and the device not-found `404`.
 * The `:id/resolve` + `:vehicleId` `requireResourceOwnership` guards stay on the
 * routes.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { insertTelematicsFeedSchema, insertTelematicsAlertSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { TelematicsService } from '../services/telematics.service';

function uid(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeTelematicsController(service: TelematicsService) {
  return {
    // ---- Integration feeds + alerts ({ data } / { error }) ---------------
    async listFeeds(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.listFeeds(q(req.query.vehicleId), q(req.query.deviceId)) });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async createFeed(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertTelematicsFeedSchema.parse(req.body);
        res.json({ data: await service.createFeed(validatedData) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async listAlerts(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.listAlerts(q(req.query.vehicleId), req.query.isResolved === 'true') });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async createAlert(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertTelematicsAlertSchema.parse(req.body);
        res.json({ data: await service.createAlert(validatedData) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async resolveAlert(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.resolveAlert(req.params.id, uid(req) as string) });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },

    // ---- Per-vehicle device + readings (raw / { message } / 404) ---------
    async getDevice(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getDevice(req.params.vehicleId));
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        console.error('Error fetching telematics device:', error);
        res.status(500).json({ message: 'Failed to fetch device' });
      }
    },
    async getReadings(req: Request, res: Response): Promise<void> {
      try {
        const hours = parseInt(String(req.query.hours ?? 24));
        res.json(await service.getReadings(req.params.vehicleId, q(req.query.streamType), hours));
      } catch (error) {
        console.error('Error fetching telematics readings:', error);
        res.status(500).json({ message: 'Failed to fetch readings' });
      }
    },
  };
}
