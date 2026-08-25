/**
 * Subscription-license controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the subscription-licenses domain. Preserves the legacy
 * monolith conventions verbatim: `insertSubscriptionLicenseSchema.parse` on
 * create with `201`, raw bodies on reads/updates, `{ error }` envelopes for
 * `400`/`404`/`500` (with the `"Failed to …"` fallbacks), the
 * `"Subscription license not found"` 404, the optional `branchId` / `status`
 * list filters, and the same `console.error` labels. The parent-scoped
 * ownership guards stay on the routes.
 */

import type { Request, Response } from 'express';
import { insertSubscriptionLicenseSchema } from '@shared/schema';
import type { SubscriptionLicenseService } from '../services/subscription-license.service';

function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeSubscriptionLicenseController(service: SubscriptionLicenseService) {
  return {
    async create(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertSubscriptionLicenseSchema.parse(req.body);
        res.status(201).json(await service.createLicense(validatedData));
      } catch (error) {
        console.error('Error creating subscription license:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create subscription license' });
      }
    },
    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listLicenses(q(req.query.branchId), { status: q(req.query.status) }));
      } catch (error) {
        console.error('Error fetching subscription licenses:', error);
        res.status(500).json({ error: 'Failed to fetch subscription licenses' });
      }
    },
    async getById(req: Request, res: Response): Promise<void> {
      try {
        const license = await service.getLicense(req.params.id);
        if (!license) {
          res.status(404).json({ error: 'Subscription license not found' });
          return;
        }
        res.json(license);
      } catch (error) {
        console.error('Error fetching subscription license:', error);
        res.status(500).json({ error: 'Failed to fetch subscription license' });
      }
    },
    async update(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateLicense(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating subscription license:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update subscription license' });
      }
    },
    async remove(req: Request, res: Response): Promise<void> {
      try {
        await service.deleteLicense(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting subscription license:', error);
        res.status(500).json({ error: 'Failed to delete subscription license' });
      }
    },
    async listAuditLogs(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listAuditLogs(req.params.licenseId));
      } catch (error) {
        console.error('Error fetching license audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch license audit logs' });
      }
    },
  };
}
