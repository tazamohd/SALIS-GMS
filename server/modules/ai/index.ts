/**
 * AI module assembly (Phase E1/E2). Consolidates the three AI route files
 * (ai-insights, ai-predictions, ai-repair-guide) into one layered router via DI:
 * business insights + revenue/demand forecasts, the PRO-gated statistical
 * predictions/accuracy, and the ENTERPRISE-gated repair guide. Route paths, the
 * `requirePlan` gates, the session-garage 403s, and response shapes are
 * identical to the legacy route files they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requirePlan } from '../../middleware/requirePlan';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { AI_SERVICE, AI_JOB_ESTIMATION_SERVICE, AI_MAINTENANCE_PREDICTION_SERVICE, AI_PARTS_RECOMMENDATION_SERVICE, AI_SCHEDULE_OPTIMIZATION_SERVICE, AI_CHAT_SERVICE, AI_OCR_DOCUMENT_SERVICE } from '../../infrastructure/di/tokens';
import { makeAiController } from './controllers/ai.controller';
import { makeAiJobEstimationController } from './controllers/ai-job-estimation.controller';
import { makeAiMaintenancePredictionController } from './controllers/ai-maintenance-prediction.controller';
import { makeAiPartsRecommendationController } from './controllers/ai-parts-recommendation.controller';
import { makeAiScheduleOptimizationController } from './controllers/ai-schedule-optimization.controller';
import { makeAiChatController } from './controllers/ai-chat.controller';
import { makeAiOcrDocumentController } from './controllers/ai-ocr-document.controller';
import type { AiService } from './services/ai.service';
import type { AiJobEstimationService } from './services/ai-job-estimation.service';
import type { AiMaintenancePredictionService } from './services/ai-maintenance-prediction.service';
import type { AiPartsRecommendationService } from './services/ai-parts-recommendation.service';
import type { AiScheduleOptimizationService } from './services/ai-schedule-optimization.service';
import type { AiChatService } from './services/ai-chat.service';
import type { AiOcrDocumentService } from './services/ai-ocr-document.service';

export interface AiModuleDeps {
  service?: AiService;
  jobEstimationService?: AiJobEstimationService;
  maintenancePredictionService?: AiMaintenancePredictionService;
  partsRecommendationService?: AiPartsRecommendationService;
  scheduleOptimizationService?: AiScheduleOptimizationService;
  chatService?: AiChatService;
  ocrDocumentService?: AiOcrDocumentService;
}

export function createAiModule(deps: AiModuleDeps = {}): Router {
  const container = getAppContainer();
  const c = makeAiController(deps.service ?? container.resolve(AI_SERVICE));
  const je = makeAiJobEstimationController(
    deps.jobEstimationService ?? container.resolve(AI_JOB_ESTIMATION_SERVICE),
  );
  const mp = makeAiMaintenancePredictionController(
    deps.maintenancePredictionService ?? container.resolve(AI_MAINTENANCE_PREDICTION_SERVICE),
  );
  const pr = makeAiPartsRecommendationController(
    deps.partsRecommendationService ?? container.resolve(AI_PARTS_RECOMMENDATION_SERVICE),
  );
  const so = makeAiScheduleOptimizationController(
    deps.scheduleOptimizationService ?? container.resolve(AI_SCHEDULE_OPTIMIZATION_SERVICE),
  );
  const chat = makeAiChatController(
    deps.chatService ?? container.resolve(AI_CHAT_SERVICE),
  );
  const ocr = makeAiOcrDocumentController(
    deps.ocrDocumentService ?? container.resolve(AI_OCR_DOCUMENT_SERVICE),
  );
  const router = Router();

  // Business intelligence (all authenticated users).
  router.get('/ai/insights', isAuthenticated, asyncHandler(c.insights));
  router.get('/ai/forecast/revenue', isAuthenticated, asyncHandler(c.forecastRevenue));
  router.get('/ai/forecast/demand', isAuthenticated, asyncHandler(c.forecastDemand));

  // Statistical predictions (PRO plan).
  router.get('/ai/predictions', isAuthenticated, requirePlan('PRO'), asyncHandler(c.predictions));
  router.get('/ai/accuracy', isAuthenticated, requirePlan('PRO'), asyncHandler(c.accuracy));

  // LLM repair guide (ENTERPRISE plan).
  router.post('/ai/repair-guide', isAuthenticated, requirePlan('ENTERPRISE'), asyncHandler(c.repairGuide));

  // Job estimations (LLM-assisted; per-garage ownership on the :id routes).
  router.post('/ai/estimate-job', isAuthenticated, asyncHandler(je.estimate));
  router.get('/ai/job-estimations', isAuthenticated, asyncHandler(je.list));
  router.get('/ai/job-estimations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_job_estimations' }), asyncHandler(je.get));
  router.patch('/ai/job-estimations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_job_estimations' }), asyncHandler(je.update));

  // Maintenance predictions (LLM-assisted; per-garage ownership on the :id routes).
  router.post('/ai/predict-maintenance', isAuthenticated, asyncHandler(mp.predict));
  router.post('/ai/predictive-diagnostics', isAuthenticated, asyncHandler(mp.diagnose));
  router.get('/ai/maintenance-predictions', isAuthenticated, asyncHandler(mp.list));
  router.get('/ai/maintenance-predictions/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_maintenance_predictions' }), asyncHandler(mp.get));
  router.post('/ai/maintenance-predictions/:id/acknowledge', isAuthenticated, requireResourceOwnership({ table: 'ai_maintenance_predictions' }), asyncHandler(mp.acknowledge));
  router.post('/ai/maintenance-predictions/analyze', isAuthenticated, asyncHandler(mp.analyze));

  // Parts recommendations (LLM-assisted; per-garage ownership on the :id routes).
  router.post('/ai/recommend-parts', isAuthenticated, asyncHandler(pr.recommend));
  router.get('/ai/parts-recommendations', isAuthenticated, asyncHandler(pr.list));
  router.get('/ai/parts-recommendations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_parts_recommendations' }), asyncHandler(pr.get));
  router.patch('/ai/parts-recommendations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_parts_recommendations' }), asyncHandler(pr.update));

  // Schedule optimizations (LLM-assisted; per-garage ownership on the :id routes).
  router.post('/ai/optimize-schedule', isAuthenticated, asyncHandler(so.optimize));
  router.get('/ai/schedule-optimizations', isAuthenticated, asyncHandler(so.list));
  router.get('/ai/schedule-optimizations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_schedule_optimizations' }), asyncHandler(so.get));
  router.patch('/ai/schedule-optimizations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_schedule_optimizations' }), asyncHandler(so.update));

  // Customer chat (LLM-assisted; per-garage ownership on the :id routes).
  router.post('/ai/chat', isAuthenticated, asyncHandler(chat.chat));
  router.get('/ai/chat-conversations', isAuthenticated, asyncHandler(chat.list));
  router.get('/ai/chat-conversations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_chat_conversations' }), asyncHandler(chat.get));
  router.post('/ai/chat-conversations/:id/handoff', isAuthenticated, requireResourceOwnership({ table: 'ai_chat_conversations' }), asyncHandler(chat.handoff));

  // OCR documents (parent-scoped ownership on the :id routes).
  router.get('/ai/ocr-documents', isAuthenticated, asyncHandler(ocr.list));
  router.post('/ai/ocr-documents/upload', isAuthenticated, asyncHandler(ocr.upload));
  router.get('/ai/ocr-documents/:id', isAuthenticated, requireResourceOwnership({ table: 'ocr_documents', parent: { table: 'vehicles', fk: 'vehicle_id' } }), asyncHandler(ocr.get));
  router.patch('/ai/ocr-documents/:id', isAuthenticated, requireResourceOwnership({ table: 'ocr_documents', parent: { table: 'vehicles', fk: 'vehicle_id' } }), asyncHandler(ocr.update));

  return router;
}

export default createAiModule();
