/**
 * Fleet controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy `server/routes/fleet.ts` contract:
 * garage scope resolves via `resolveGarageScope`, the create keeps the explicit
 * `companyName` 400, account detail 404s a missing account, and every handler
 * maps failures to the exact `{ message }` 500 body. No business rules, no
 * data-layer access.
 */

import type { Request, Response } from 'express';
import { resolveGarageScope } from '../../../middleware/garageScope';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { FleetService } from '../services/fleet.service';

function accountId(req: Request): string | undefined {
  return typeof req.query.accountId === 'string' ? req.query.accountId : undefined;
}

export function makeFleetController(service: FleetService) {
  return {
    async listAccounts(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listAccounts(resolveGarageScope(req)));
      } catch (err) {
        console.error('Fleet accounts list error:', err);
        res.status(500).json({ message: 'Failed to load fleet accounts' });
      }
    },

    async accountDetail(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.accountDetail(req.params.id, resolveGarageScope(req)));
      } catch (err) {
        if (err instanceof NotFoundError) {
          res.status(404).json({ message: 'Fleet account not found' });
          return;
        }
        console.error('Fleet account detail error:', err);
        res.status(500).json({ message: 'Failed to load fleet account' });
      }
    },

    async createAccount(req: Request, res: Response): Promise<void> {
      const { companyName } = req.body ?? {};
      if (!companyName) {
        res.status(400).json({ message: 'companyName is required' });
        return;
      }
      try {
        const result = await service.createAccount(resolveGarageScope(req), req.body);
        res.status(201).json(result);
      } catch (err) {
        console.error('Fleet account create error:', err);
        res.status(500).json({ message: 'Failed to create fleet account' });
      }
    },

    async listVehicles(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listVehicles(resolveGarageScope(req), accountId(req)));
      } catch (err) {
        console.error('Fleet vehicles list error:', err);
        res.status(500).json({ message: 'Failed to load fleet vehicles' });
      }
    },

    async maintenanceSchedule(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.maintenanceSchedule(resolveGarageScope(req), accountId(req)));
      } catch (err) {
        console.error('Fleet maintenance schedule error:', err);
        res.status(500).json({ message: 'Failed to load maintenance schedule' });
      }
    },

    async analytics(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.analytics(resolveGarageScope(req)));
      } catch (err) {
        console.error('Fleet analytics error:', err);
        res.status(500).json({ message: 'Failed to compute fleet analytics' });
      }
    },
  };
}

export type FleetController = ReturnType<typeof makeFleetController>;
