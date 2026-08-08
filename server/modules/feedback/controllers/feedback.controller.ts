/**
 * Feedback controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the feedback domain. Preserves the legacy monolith
 * contract: the `insertServiceFeedbackSchema` Zod 400 (`sanitizeZodError`) on
 * submit, the query→filters parsing on the list, the not-found 404 / required
 * 400 surfaced from the service, and the exact per-handler `{ message }` 500
 * strings. The `:id` / job-card / technician `requireResourceOwnership` guards
 * stay on the routes.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { insertServiceFeedbackSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { ValidationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { FeedbackService } from '../services/feedback.service';

function mapDomain(res: Response, error: unknown): boolean {
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  return false;
}
function fail(res: Response, error: unknown, label: string, message: string): void {
  if (mapDomain(res, error)) return;
  console.error(label, error);
  res.status(500).json({ message });
}

export function makeFeedbackController(service: FeedbackService) {
  return {
    async submit(req: Request, res: Response): Promise<void> {
      try {
        const validated = insertServiceFeedbackSchema.parse(req.body);
        res.json(await service.createFeedback(validated));
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json(sanitizeZodError(error));
          return;
        }
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
      }
    },

    async byJobCard(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.byJobCard(req.params.jobCardId));
      } catch (error) {
        fail(res, error, 'Error fetching feedback:', 'Failed to fetch feedback');
      }
    },

    async byTechnician(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.byTechnician(req.params.technicianId));
      } catch (error) {
        fail(res, error, 'Error fetching technician feedback:', 'Failed to fetch feedback');
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        const { sentiment, minRating, maxRating, isFlagged, startDate, endDate, limit, offset } = req.query;
        const filters: Record<string, unknown> = {};
        if (sentiment) filters.sentiment = sentiment;
        if (minRating) filters.minRating = parseInt(minRating as string);
        if (maxRating) filters.maxRating = parseInt(maxRating as string);
        if (isFlagged !== undefined) filters.isFlagged = isFlagged === 'true';
        if (startDate) filters.startDate = new Date(startDate as string);
        if (endDate) filters.endDate = new Date(endDate as string);
        if (limit) filters.limit = parseInt(limit as string);
        if (offset) filters.offset = parseInt(offset as string);
        res.json(await service.list(filters));
      } catch (error) {
        fail(res, error, 'Error fetching feedback:', 'Failed to fetch feedback');
      }
    },

    async analytics(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.analytics());
      } catch (error) {
        fail(res, error, 'Error fetching feedback analytics:', 'Failed to fetch feedback analytics');
      }
    },

    async getById(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getById(req.params.id));
      } catch (error) {
        fail(res, error, 'Error fetching feedback:', 'Failed to fetch feedback');
      }
    },

    async respond(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.respond(req.params.id, req.body?.response));
      } catch (error) {
        fail(res, error, 'Error responding to feedback:', 'Failed to respond to feedback');
      }
    },

    async flag(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.flag(req.params.id, req.body?.reason));
      } catch (error) {
        fail(res, error, 'Error flagging feedback:', 'Failed to flag feedback');
      }
    },

    async unflag(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.unflag(req.params.id));
      } catch (error) {
        fail(res, error, 'Error unflagging feedback:', 'Failed to unflag feedback');
      }
    },

    async analyzeSentiment(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.analyzeSentiment(req.params.id));
      } catch (error) {
        fail(res, error, 'Error analyzing sentiment:', 'Failed to analyze sentiment');
      }
    },

    async analyzeAll(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.analyzeAll());
      } catch (error) {
        fail(res, error, 'Error analyzing all feedback:', 'Failed to analyze feedback');
      }
    },
  };
}
