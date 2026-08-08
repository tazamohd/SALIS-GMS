/**
 * Next-gen controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the next-gen showcase domain. Preserves the legacy
 * monolith contract: the `{ data }` list/create envelope, the Zod `400`
 * (`sanitizeZodError`) with `{...body, garageId}` injection on create, the
 * verbatim per-resource `{ error }` 500 strings, and the two `/api/vision/*`
 * handlers (the analyze-image summary body + the raw quality-checks array).
 * `listHandler`/`createHandler` are generated per resource from the catalogue.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { sanitizeZodError } from '../../../utils/validation-errors';
import type { NextGenResource } from '../nextgen.resources';
import type { NextGenService } from '../services/nextgen.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function uid(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}

export function makeNextGenController(service: NextGenService) {
  return {
    listHandler(r: NextGenResource) {
      return async (req: Request, res: Response): Promise<void> => {
        try {
          res.json({ data: await service.list(r.path, garageOf(req) as string) });
        } catch {
          res.status(500).json({ error: r.fetchErr });
        }
      };
    },

    createHandler(r: NextGenResource) {
      return async (req: Request, res: Response): Promise<void> => {
        try {
          const validated = r.schema.parse({ ...req.body, garageId: garageOf(req) });
          res.json({ data: await service.create(r.path, validated) });
        } catch (error) {
          if (error instanceof z.ZodError) {
            res.status(400).json(sanitizeZodError(error));
          } else {
            res.status(500).json({ error: r.createErr });
          }
        }
      };
    },

    async analyzeImage(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.analyzeImage(garageOf(req) as string, uid(req) as string, req.body ?? {}));
      } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
      }
    },

    async qualityChecks(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listQualityChecks(garageOf(req) as string));
      } catch {
        res.status(500).json({ error: 'Failed to fetch quality checks' });
      }
    },
  };
}
