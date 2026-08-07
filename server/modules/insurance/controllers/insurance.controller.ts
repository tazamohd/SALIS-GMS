/**
 * Insurance controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract: `validatePatchBody`
 * strips protected fields and sends the 400 on invalid input, the create returns
 * 201, and each handler maps failures to the exact `{ message }` 500 body. The
 * analytics range defaults to the trailing year. No business rules, no
 * data-layer access.
 */

import type { Request, Response } from 'express';
import {
  validatePatchBody,
  createInsuranceClaimSchema,
  updateInsuranceClaimSchema,
} from '../../../routes/validators';
import type { InsuranceService } from '../services/insurance.service';
import type { CreateClaimData } from '../services/insurance.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}

export function makeInsuranceController(service: InsuranceService) {
  return {
    async createClaim(req: Request, res: Response): Promise<void> {
      try {
        const validated = validatePatchBody(req, res, createInsuranceClaimSchema);
        if (!validated.ok) return;
        const claim = await service.createClaim(garageOf(req), validated.data as CreateClaimData);
        res.status(201).json(claim);
      } catch (error) {
        console.error('Error creating insurance claim:', error);
        res.status(500).json({ message: 'Failed to create insurance claim' });
      }
    },

    async listClaims(req: Request, res: Response): Promise<void> {
      try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        res.json(await service.listClaims(garageOf(req), status));
      } catch (error) {
        console.error('Error fetching insurance claims:', error);
        res.status(500).json({ message: 'Failed to fetch insurance claims' });
      }
    },

    async updateStatus(req: Request, res: Response): Promise<void> {
      try {
        const validated = validatePatchBody(req, res, updateInsuranceClaimSchema);
        if (!validated.ok) return;
        const claim = await service.updateClaimStatus(
          req.params.id,
          validated.data.status!,
          validated.data.approvedAmount !== undefined
            ? Number(validated.data.approvedAmount)
            : undefined,
        );
        res.json(claim);
      } catch (error) {
        console.error('Error updating claim status:', error);
        res.status(500).json({ message: 'Failed to update claim status' });
      }
    },

    async analytics(req: Request, res: Response): Promise<void> {
      try {
        // Closed date range required; default to the trailing year.
        const to = new Date();
        const from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
        res.json(await service.analytics(garageOf(req), from, to));
      } catch (error) {
        console.error('Error fetching claims analytics:', error);
        res.status(500).json({ message: 'Failed to fetch claims analytics' });
      }
    },
  };
}

export type InsuranceController = ReturnType<typeof makeInsuranceController>;
