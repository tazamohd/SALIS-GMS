/**
 * Licensing controller (Phase D.1 — controller layer).
 *
 * Thin HTTP adapter for the license subsystem. Maps the service's domain errors
 * to status codes (400 / 404 / 409), returns `201` on issue, and keeps
 * `validate` as an always-200 result object (a failed check is data, not an
 * HTTP error). No business rules, no data access. Auth (`requirePlatformAdmin` /
 * `isAuthenticated`) + `auditLog` live on the routes.
 */

import type { Request, Response } from 'express';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/errors/domain-errors';
import type { LicensingService } from '../services/licensing.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function userId(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function mapDomain(res: Response, error: unknown): boolean {
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  if (error instanceof ConflictError) {
    res.status(409).json({ message: error.message });
    return true;
  }
  return false;
}

export function makeLicensingController(service: LicensingService) {
  return {
    async issue(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.issue(req.body ?? {}, userId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error issuing license:', error);
        res.status(500).json({ message: 'Failed to issue license' });
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list({ status: str(req.query.status), boundGarageId: str(req.query.garageId) }));
      } catch (error) {
        console.error('Error listing licenses:', error);
        res.status(500).json({ message: 'Failed to list licenses' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id));
      } catch (error) {
        if (mapDomain(res, error)) return;
        res.status(500).json({ message: 'Failed to load license' });
      }
    },

    async activations(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.activations(req.params.id));
      } catch (error) {
        if (mapDomain(res, error)) return;
        res.status(500).json({ message: 'Failed to load activations' });
      }
    },

    async activate(req: Request, res: Response): Promise<void> {
      try {
        const licenseKey = str(req.body?.licenseKey) ?? '';
        res.json(await service.activate(licenseKey, garageOf(req), userId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error activating license:', error);
        res.status(500).json({ message: 'Failed to activate license' });
      }
    },

    async validate(req: Request, res: Response): Promise<void> {
      try {
        const licenseKey = str(req.body?.licenseKey) ?? '';
        res.json(await service.validate(licenseKey));
      } catch (error) {
        console.error('Error validating license:', error);
        res.status(500).json({ message: 'Failed to validate license' });
      }
    },

    async renew(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.renew(req.params.id, Number(req.body?.extendDays), userId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error renewing license:', error);
        res.status(500).json({ message: 'Failed to renew license' });
      }
    },

    async revoke(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.revoke(req.params.id, str(req.body?.reason), userId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error revoking license:', error);
        res.status(500).json({ message: 'Failed to revoke license' });
      }
    },

    async deactivate(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deactivate(req.params.id, userId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error deactivating license:', error);
        res.status(500).json({ message: 'Failed to deactivate license' });
      }
    },
  };
}

export type LicensingController = ReturnType<typeof makeLicensingController>;
