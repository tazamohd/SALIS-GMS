/**
 * IoT controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the IoT domain. Preserves the legacy monolith contract:
 * the Zod 400s (`sanitizeZodError`) on the create/update/reading bodies, the
 * ownership 403 / not-found 404 / date-format 400 surfaced from the service, the
 * `201`s, and the exact per-handler `{ message }` 500 bodies. Route-level
 * `requireResourceOwnership` guards stay on the routes.
 */

import type { Request, Response } from 'express';
import { insertIoTSensorSchema, insertIoTSensorReadingSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';
import type { IotService } from '../services/iot.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function uid(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function mapDomain(res: Response, error: unknown): boolean {
  if (error instanceof AuthorizationError) {
    res.status(403).json({ message: error.message });
    return true;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  return false;
}

export function makeIotController(service: IotService) {
  return {
    async listSensors(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listSensors(garageOf(req), str(req.query.vehicleId), str(req.query.status)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching IoT sensors:', error);
        res.status(500).json({ message: 'Failed to fetch sensors' });
      }
    },
    async getSensor(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getSensor(req.params.id, garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching sensor:', error);
        res.status(500).json({ message: 'Failed to fetch sensor' });
      }
    },
    async createSensor(req: Request, res: Response): Promise<void> {
      try {
        const parsed = insertIoTSensorSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createSensor(garageOf(req), parsed.data as never));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error creating sensor:', error);
        res.status(500).json({ message: 'Failed to create sensor' });
      }
    },
    async updateSensor(req: Request, res: Response): Promise<void> {
      try {
        const parsed = insertIoTSensorSchema.partial().omit({ vehicleId: true }).safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.json(await service.updateSensor(req.params.id, garageOf(req), parsed.data));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error updating sensor:', error);
        res.status(500).json({ message: 'Failed to update sensor' });
      }
    },
    async deleteSensor(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteSensor(req.params.id, garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error deleting sensor:', error);
        res.status(500).json({ message: 'Failed to delete sensor' });
      }
    },
    async recordReading(req: Request, res: Response): Promise<void> {
      try {
        const parsed = insertIoTSensorReadingSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.recordReading(parsed.data as never));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error recording sensor reading:', error);
        res.status(500).json({ message: 'Failed to record reading' });
      }
    },
    async getReadings(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getReadings(req.params.id, garageOf(req), str(req.query.startDate), str(req.query.endDate)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching sensor readings:', error);
        res.status(500).json({ message: 'Failed to fetch readings' });
      }
    },
    async vehicleAnomalies(req: Request, res: Response): Promise<void> {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        res.json(await service.vehicleAnomalies(req.params.vehicleId, garageOf(req), limit));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching anomalies:', error);
        res.status(500).json({ message: 'Failed to fetch anomalies' });
      }
    },
    async listAlerts(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listAlerts(garageOf(req), str(req.query.vehicleId), str(req.query.status), str(req.query.severity)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching IoT alerts:', error);
        res.status(500).json({ message: 'Failed to fetch alerts' });
      }
    },
    async getAlert(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getAlert(req.params.id, garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching alert:', error);
        res.status(500).json({ message: 'Failed to fetch alert' });
      }
    },
    async acknowledgeAlert(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.acknowledgeAlert(req.params.id, garageOf(req), uid(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error acknowledging alert:', error);
        res.status(500).json({ message: 'Failed to acknowledge alert' });
      }
    },
    async dashboardSummary(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.dashboardSummary(garageOf(req)));
      } catch (error) {
        console.error('Error fetching IoT dashboard summary:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard summary' });
      }
    },
    async latestReadings(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.latestReadings(req.params.vehicleId, garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error fetching latest readings:', error);
        res.status(500).json({ message: 'Failed to fetch latest readings' });
      }
    },
    async resolveAlert(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.resolveAlert(req.params.id, garageOf(req), uid(req), req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error resolving alert:', error);
        res.status(500).json({ message: 'Failed to resolve alert' });
      }
    },
  };
}

export type IotController = ReturnType<typeof makeIotController>;
