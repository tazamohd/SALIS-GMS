/**
 * Warranty controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the warranty domain. Preserves the legacy monolith
 * response conventions verbatim: raw bodies (no envelope), `{ error: message }`
 * for Zod/`400` failures and for the by-id `404`s (`"Warranty not found"` /
 * `"Warranty claim not found"`), and `{ message }` 500 strings with the same
 * `console.error` labels. Body validation (with the `garageId` / `createdBy` /
 * `submittedBy` injections) stays here at the boundary; the by-id ownership
 * guards stay on the routes.
 */

import type { Request, Response } from 'express';
import { insertWarrantySchema, insertWarrantyClaimSchema } from '@shared/schema';
import type { WarrantyService } from '../services/warranty.service';

interface AuthedUser {
  id?: string;
  garageId?: string;
}
function user(req: Request): AuthedUser {
  return (req.user as AuthedUser | undefined) ?? {};
}

export function makeWarrantyController(service: WarrantyService) {
  return {
    // ---- Warranties -------------------------------------------------------
    async create(req: Request, res: Response): Promise<void> {
      try {
        const u = user(req);
        const data = insertWarrantySchema.parse({
          ...req.body,
          garageId: u.garageId,
          createdBy: u.id,
        });
        res.json(await service.createWarranty(data));
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    },
    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listWarranties(user(req).garageId as string));
      } catch (error) {
        console.error('Error fetching warranties:', error);
        res.status(500).json({ message: 'Failed to fetch warranties' });
      }
    },
    async listActive(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listActive(user(req).garageId as string));
      } catch (error) {
        console.error('Error fetching active warranties:', error);
        res.status(500).json({ message: 'Failed to fetch active warranties' });
      }
    },
    async listExpired(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listExpired(user(req).garageId as string));
      } catch (error) {
        console.error('Error fetching expired warranties:', error);
        res.status(500).json({ message: 'Failed to fetch expired warranties' });
      }
    },
    async listExpiring(req: Request, res: Response): Promise<void> {
      try {
        const daysThreshold = parseInt(req.query.days as string) || 30;
        res.json(await service.listExpiring(user(req).garageId as string, daysThreshold));
      } catch (error) {
        console.error('Error fetching expiring warranties:', error);
        res.status(500).json({ message: 'Failed to fetch expiring warranties' });
      }
    },
    async listByVehicle(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listByVehicle(req.params.vehicleId, user(req).garageId));
      } catch (error) {
        console.error('Error fetching warranties by vehicle:', error);
        res.status(500).json({ message: 'Failed to fetch warranties' });
      }
    },
    async listByCustomer(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listByCustomer(req.params.customerId, user(req).garageId));
      } catch (error) {
        console.error('Error fetching warranties by customer:', error);
        res.status(500).json({ message: 'Failed to fetch warranties' });
      }
    },
    async getById(req: Request, res: Response): Promise<void> {
      try {
        const warranty = await service.getWarranty(req.params.id, user(req).garageId);
        if (!warranty) {
          res.status(404).json({ error: 'Warranty not found' });
          return;
        }
        res.json(warranty);
      } catch (error) {
        console.error('Error fetching warranty:', error);
        res.status(500).json({ message: 'Failed to fetch warranty' });
      }
    },
    async update(req: Request, res: Response): Promise<void> {
      try {
        const data = insertWarrantySchema.partial().parse(req.body);
        const warranty = await service.updateWarranty(req.params.id, data, user(req).garageId);
        if (!warranty) {
          res.status(404).json({ error: 'Warranty not found' });
          return;
        }
        res.json(warranty);
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    },
    async remove(req: Request, res: Response): Promise<void> {
      try {
        const ok = await service.deleteWarranty(req.params.id, user(req).garageId);
        if (!ok) {
          res.status(404).json({ error: 'Warranty not found' });
          return;
        }
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting warranty:', error);
        res.status(500).json({ message: 'Failed to delete warranty' });
      }
    },

    // ---- Warranty claims --------------------------------------------------
    async createClaim(req: Request, res: Response): Promise<void> {
      try {
        const data = insertWarrantyClaimSchema.parse({
          ...req.body,
          submittedBy: user(req).id,
        });
        res.json(await service.createClaim(data));
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    },
    async listClaims(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listClaims(user(req).garageId as string));
      } catch (error) {
        console.error('Error fetching warranty claims:', error);
        res.status(500).json({ message: 'Failed to fetch warranty claims' });
      }
    },
    async listClaimsByWarranty(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listClaimsByWarranty(req.params.warrantyId, user(req).garageId));
      } catch (error) {
        console.error('Error fetching warranty claims by warranty:', error);
        res.status(500).json({ message: 'Failed to fetch warranty claims' });
      }
    },
    async getClaimById(req: Request, res: Response): Promise<void> {
      try {
        const claim = await service.getClaim(req.params.id, user(req).garageId);
        if (!claim) {
          res.status(404).json({ error: 'Warranty claim not found' });
          return;
        }
        res.json(claim);
      } catch (error) {
        console.error('Error fetching warranty claim:', error);
        res.status(500).json({ message: 'Failed to fetch warranty claim' });
      }
    },
    async updateClaim(req: Request, res: Response): Promise<void> {
      try {
        const u = user(req);
        const data = insertWarrantyClaimSchema.partial().parse(req.body);
        const claim = await service.updateClaim(req.params.id, data, u.id, u.garageId);
        if (!claim) {
          res.status(404).json({ error: 'Warranty claim not found' });
          return;
        }
        res.json(claim);
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    },
    async removeClaim(req: Request, res: Response): Promise<void> {
      try {
        const ok = await service.deleteClaim(req.params.id, user(req).garageId);
        if (!ok) {
          res.status(404).json({ error: 'Warranty claim not found' });
          return;
        }
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting warranty claim:', error);
        res.status(500).json({ message: 'Failed to delete warranty claim' });
      }
    },
  };
}
