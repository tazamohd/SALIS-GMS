/**
 * Feedback module assembly (Phase E1/E2). Wires the customer-feedback domain —
 * submission, per-job-card / per-technician / filtered lookups, analytics,
 * respond / flag / unflag, and the single + bulk OpenAI sentiment analysis —
 * into an Express router via DI. The lookup + `:id` routes keep their
 * (parent-scoped) `requireResourceOwnership` guards; all routes are
 * `isAuthenticated`. `analytics` is registered before `:id` so the literal wins.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { FEEDBACK_SERVICE } from '../../infrastructure/di/tokens';
import { makeFeedbackController } from './controllers/feedback.controller';
import type { FeedbackService } from './services/feedback.service';

export interface FeedbackModuleDeps {
  service?: FeedbackService;
}

export function createFeedbackModule(deps: FeedbackModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(FEEDBACK_SERVICE);
  const c = makeFeedbackController(service);
  const router = Router();
  const ownJobCard = requireResourceOwnership({ table: 'job_cards', idParam: 'jobCardId' });
  const ownTechnicianFeedback = requireResourceOwnership({
    table: 'service_feedback',
    idParam: 'technicianId',
    parent: { table: 'job_cards', fk: 'job_card_id' },
  });
  const ownFeedback = requireResourceOwnership({
    table: 'service_feedback',
    parent: { table: 'job_cards', fk: 'job_card_id' },
  });

  router.post('/feedback', isAuthenticated, asyncHandler(c.submit));
  router.get('/feedback/job-card/:jobCardId', isAuthenticated, ownJobCard, asyncHandler(c.byJobCard));
  router.get('/feedback/technician/:technicianId', isAuthenticated, ownTechnicianFeedback, asyncHandler(c.byTechnician));
  router.get('/feedback', isAuthenticated, asyncHandler(c.list));
  router.get('/feedback/analytics', isAuthenticated, asyncHandler(c.analytics));
  router.get('/feedback/:id', isAuthenticated, ownFeedback, asyncHandler(c.getById));
  router.post('/feedback/:id/respond', isAuthenticated, ownFeedback, asyncHandler(c.respond));
  router.post('/feedback/:id/flag', isAuthenticated, ownFeedback, asyncHandler(c.flag));
  router.post('/feedback/:id/unflag', isAuthenticated, ownFeedback, asyncHandler(c.unflag));
  router.post('/feedback/:id/analyze-sentiment', isAuthenticated, ownFeedback, asyncHandler(c.analyzeSentiment));
  router.post('/feedback/analyze-all', isAuthenticated, asyncHandler(c.analyzeAll));

  return router;
}

export default createFeedbackModule();
