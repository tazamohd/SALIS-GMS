/**
 * Compliance controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the compliance domain. Preserves the two distinct
 * legacy response conventions verbatim:
 *  - environmental: `201` bare-body create, `{ message }` 500 strings
 *    (with the `console.error` labels), Zod `400` via `sanitizeZodError`.
 *  - policies / audits / tasks: `{ data }` envelope, `{ error: message }` 500s,
 *    Zod `400` via `sanitizeZodError`.
 * The `:id/complete` route keeps its route-level `requireResourceOwnership` guard.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  insertCompliancePolicySchema,
  insertComplianceAuditSchema,
  insertComplianceTaskSchema,
} from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { complianceRecordSchema } from '../compliance.schemas';
import type { ComplianceService } from '../services/compliance.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeComplianceController(service: ComplianceService) {
  return {
    // ---- Environmental ({ message } 500s, 201 create) --------------------
    async createEnvironmental(req: Request, res: Response): Promise<void> {
      try {
        const validated = complianceRecordSchema.parse(req.body);
        const record = await service.createEnvironmentalRecord(garageOf(req), validated);
        res.status(201).json(record);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        console.error('Error creating compliance record:', error);
        res.status(500).json({ message: 'Failed to create compliance record' });
      }
    },
    async listEnvironmental(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listEnvironmentalRecords(garageOf(req), q(req.query.complianceType)));
      } catch (error) {
        console.error('Error fetching compliance records:', error);
        res.status(500).json({ message: 'Failed to fetch compliance records' });
      }
    },
    async environmentalAnalytics(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.environmentalAnalytics(garageOf(req), q(req.query.startDate), q(req.query.endDate)));
      } catch (error) {
        console.error('Error fetching compliance analytics:', error);
        res.status(500).json({ message: 'Failed to fetch compliance analytics' });
      }
    },

    // ---- Policies / audits / tasks ({ data } envelope, { error } 500s) ---
    async listPolicies(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.listPolicies(garageOf(req), q(req.query.status)) });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async createPolicy(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertCompliancePolicySchema.parse(req.body);
        res.json({ data: await service.createPolicy(validatedData) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async listAudits(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.listAudits(garageOf(req), q(req.query.policyId), q(req.query.status)) });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async createAudit(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertComplianceAuditSchema.parse(req.body);
        res.json({ data: await service.createAudit(validatedData) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async listTasks(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.listTasks(garageOf(req), q(req.query.policyId), q(req.query.status)) });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async createTask(req: Request, res: Response): Promise<void> {
      try {
        const validatedData = insertComplianceTaskSchema.parse(req.body);
        res.json({ data: await service.createTask(validatedData) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        res.status(500).json({ error: (error as Error).message });
      }
    },
    async completeTask(req: Request, res: Response): Promise<void> {
      try {
        res.json({ data: await service.completeTask(req.params.id) });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    },
  };
}
