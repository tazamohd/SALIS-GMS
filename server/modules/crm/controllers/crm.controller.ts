/**
 * CRM controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy `server/routes/crm.ts` contract:
 *  - every tenant query resolves the caller's garage or 403s
 *    (`{ error: "No garage associated" }`);
 *  - the dashboard GETs gracefully degrade — on any error they return HTTP 200
 *    with the documented empty/zero default so the frontend never hard-fails;
 *  - customer detail is the exception: 404 when absent, 500 otherwise;
 *  - award-points echoes the acknowledgement (validation lives on the route).
 * No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { CrmService } from '../services/crm.service';
import { EMPTY_LOYALTY_SUMMARY, EMPTY_RETENTION } from '../domain/crm.types';

/** Resolve the caller's garage or send the legacy 403 and return undefined. */
function garageOrForbid(req: Request, res: Response): string | undefined {
  const garageId = (req.user as { garageId?: string } | undefined)?.garageId;
  if (!garageId) {
    res.status(403).json({ error: 'No garage associated' });
    return undefined;
  }
  return garageId;
}

export function makeCrmController(service: CrmService) {
  return {
    async customers(req: Request, res: Response): Promise<void> {
      const garageId = garageOrForbid(req, res);
      if (!garageId) return;
      try {
        const search = (req.query.search as string) || '';
        res.json(await service.customerList(garageId, search));
      } catch (e) {
        console.error('CRM customers error:', e);
        res.json({ customers: [] });
      }
    },

    async customerDetail(req: Request, res: Response): Promise<void> {
      const garageId = garageOrForbid(req, res);
      if (!garageId) return;
      try {
        res.json(await service.customerDetail(garageId, req.params.id));
      } catch (e) {
        if (e instanceof NotFoundError) {
          res.status(404).json({ error: 'Customer not found' });
          return;
        }
        console.error('CRM customer detail error:', e);
        res.status(500).json({ error: 'Failed to load customer detail' });
      }
    },

    async segments(req: Request, res: Response): Promise<void> {
      const garageId = garageOrForbid(req, res);
      if (!garageId) return;
      try {
        res.json(await service.segments(garageId));
      } catch (e) {
        console.error('CRM segments error:', e);
        res.json({ segments: [], total: 0 });
      }
    },

    async loyaltySummary(req: Request, res: Response): Promise<void> {
      const garageId = garageOrForbid(req, res);
      if (!garageId) return;
      try {
        res.json(await service.loyaltySummary(garageId));
      } catch (e) {
        console.error('CRM loyalty summary error:', e);
        res.json({ ...EMPTY_LOYALTY_SUMMARY });
      }
    },

    async awardPoints(req: Request, res: Response): Promise<void> {
      try {
        const { customerId, points, reason } = req.body ?? {};
        if (!customerId || !points) {
          res.status(400).json({ error: 'customerId and points are required' });
          return;
        }
        res.json(service.awardPoints({ customerId, points, reason }, Date.now()));
      } catch (e) {
        console.error('CRM award points error:', e);
        res.status(500).json({ error: 'Failed to award points' });
      }
    },

    async retention(req: Request, res: Response): Promise<void> {
      const garageId = garageOrForbid(req, res);
      if (!garageId) return;
      try {
        res.json(await service.retention(garageId));
      } catch (e) {
        console.error('CRM retention error:', e);
        res.json({ ...EMPTY_RETENTION });
      }
    },

    async campaigns(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.campaigns(Date.now()));
      } catch (e) {
        console.error('CRM campaigns error:', e);
        res.json({ campaigns: [] });
      }
    },
  };
}

export type CrmController = ReturnType<typeof makeCrmController>;
