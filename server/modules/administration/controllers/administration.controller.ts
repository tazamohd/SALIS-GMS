/**
 * Administration controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the platform-admin surface. Preserves the legacy
 * monolith contract: the raw `{ message: error.message }` 500s on the
 * cross-tenant reads/writes, the fixed 500 strings on the application /
 * subscription-request handlers, the `201` on garage creation, and the
 * validation / not-found / conflict rules surfaced from the service as domain
 * errors (400 / 404 / 409). Auth (`requirePlatformAdmin`) + audit logging stay
 * on the routes. No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/errors/domain-errors';
import type { AdministrationService } from '../services/administration.service';

function adminId(req: Request): string {
  return (req.user as { id?: string } | undefined)?.id as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function msg(error: unknown): string {
  return (error as { message?: string })?.message ?? 'Internal error';
}

/** Map a domain error to its legacy status/body; returns true if handled. */
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

export function makeAdministrationController(service: AdministrationService) {
  return {
    async stats(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getStats());
      } catch (error) {
        res.status(500).json({ message: msg(error) });
      }
    },

    async listGarages(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listGarages());
      } catch (error) {
        res.status(500).json({ message: msg(error) });
      }
    },

    async createGarage(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createGarage(req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error creating garage:', error);
        res.status(500).json({ message: msg(error) });
      }
    },

    async setGarageStatus(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.setGarageStatus(req.params.id, req.body?.status));
      } catch (error) {
        res.status(500).json({ message: msg(error) });
      }
    },

    async listSuppliers(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listSuppliers());
      } catch (error) {
        res.status(500).json({ message: msg(error) });
      }
    },

    async listSupportTickets(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listSupportTickets());
      } catch (error) {
        res.status(500).json({ message: msg(error) });
      }
    },

    async updateSupportTicket(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateSupportTicket(req.params.id, req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        res.status(500).json({ message: msg(error) });
      }
    },

    async systemHealth(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getSystemHealth());
      } catch (error) {
        res.status(500).json({ message: msg(error) });
      }
    },

    async listGarageApplications(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listGarageApplications(str(req.query.status)));
      } catch (error) {
        console.error('Error listing garage applications:', error);
        res.status(500).json({ message: 'Failed to list applications' });
      }
    },

    async approveGarageApplication(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.approveGarageApplication(req.params.id, adminId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error approving garage application:', error);
        res.status(500).json({ message: msg(error) || 'Failed to approve application' });
      }
    },

    async rejectGarageApplication(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.rejectGarageApplication(req.params.id, adminId(req), req.body?.reason));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error rejecting garage application:', error);
        res.status(500).json({ message: 'Failed to reject application' });
      }
    },

    async listSubscriptionRequests(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listSubscriptionRequests(str(req.query.status)));
      } catch (error) {
        console.error('Error listing subscription requests:', error);
        res.status(500).json({ message: 'Failed to list requests' });
      }
    },

    async approveSubscriptionRequest(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.approveSubscriptionRequest(req.params.id, adminId(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error approving subscription request:', error);
        res.status(500).json({ message: 'Failed to approve request' });
      }
    },

    async rejectSubscriptionRequest(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.rejectSubscriptionRequest(req.params.id, adminId(req), req.body?.reason));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error rejecting subscription request:', error);
        res.status(500).json({ message: 'Failed to reject request' });
      }
    },
  };
}

export type AdministrationController = ReturnType<typeof makeAdministrationController>;
