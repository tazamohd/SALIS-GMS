import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the AI feature set. Phase E consolidated the three
 * AI route files (ai-insights, ai-predictions, ai-repair-guide) into one layered
 * module (`server/modules/ai`). Behavioral coverage lives in
 * `server/modules/ai/__tests__/ai.service.test.ts`; plan gating is exercised
 * end-to-end by the existing trial/plan integration tests.
 */
describe('AI route consolidation (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/ai/index.ts');
  const controllerSource = read('server/modules/ai/controllers/ai.controller.ts');
  const serviceSource = read('server/modules/ai/services/ai.service.ts');
  const repositorySource = read('server/modules/ai/repositories/ai.repository.ts');

  it('mounts the ai module and retires the three legacy route files', () => {
    expect(hybridRoutesSource).toMatch(/import aiRoutes from ["']\.\.\/modules\/ai["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*aiRoutes\)/);
    for (const f of ['ai-insights.ts', 'ai-predictions.ts', 'ai-repair-guide.ts']) {
      expect(fs.existsSync(path.resolve(process.cwd(), `server/routes/${f}`))).toBe(false);
    }
    expect(hybridRoutesSource).not.toMatch(/aiInsightsRoutes|aiPredictionsRoutes|aiRepairGuideRoutes/);
  });

  it('preserves the six routes with their plan gates', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/insights['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/forecast\/revenue['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/forecast\/demand['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/predictions['"],\s*isAuthenticated,\s*requirePlan\('PRO'\)/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/accuracy['"],\s*isAuthenticated,\s*requirePlan\('PRO'\)/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/repair-guide['"],\s*isAuthenticated,\s*requirePlan\('ENTERPRISE'\)/);
  });

  it('keeps garage 403 / Zod 400 in the controller and the LLM behind the repository', () => {
    expect(controllerSource).toMatch(/No garage associated/);
    expect(controllerSource).toMatch(/safeParse/);
    expect(controllerSource).toMatch(/AI_INTEGRATIONS_OPENAI_API_KEY/);
    expect(repositorySource).toMatch(/openai\.chat\.completions\.create/);
    // The service must not reach the OpenAI SDK or storage directly.
    expect(serviceSource).not.toMatch(/from '.*\/ai'/);
    expect(serviceSource).not.toMatch(/from '.*\/storage'/);
  });

  it('mounts the job-estimation routes in the ai module and retires the monolith handlers', () => {
    const legacy = read('server/routes.ts');
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/estimate-job['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/job-estimations['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/job-estimations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/ai\/job-estimations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    // the four handlers are gone from the monolith
    expect(legacy).not.toMatch(/app\.(post|get|patch)\(['"]\/api\/ai\/(estimate-job|job-estimations)/);
  });

  it('keeps the job-estimation data access (LLM + storage) behind its repository', () => {
    const jeRepo = read('server/modules/ai/repositories/ai-job-estimation.repository.ts');
    const jeSvc = read('server/modules/ai/services/ai-job-estimation.service.ts');
    expect(jeRepo).toMatch(/estimateJobTime/);
    expect(jeRepo).toMatch(/createAIJobEstimation/);
    expect(jeSvc).not.toMatch(/from '.*\/storage'/);
    expect(jeSvc).not.toMatch(/from '.*\/ai'$/m);
  });

  it('mounts the six maintenance-prediction routes and retires the monolith handlers', () => {
    const legacy = read('server/routes.ts');
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/predict-maintenance['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/predictive-diagnostics['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/maintenance-predictions['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/maintenance-predictions\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/maintenance-predictions\/:id\/acknowledge['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/maintenance-predictions\/analyze['"],\s*isAuthenticated/);
    expect(legacy).not.toMatch(/app\.(post|get)\(['"]\/api\/ai\/(predict-maintenance|predictive-diagnostics|maintenance-predictions)/);
  });

  it('keeps the maintenance data access (engines + storage) behind its repository', () => {
    const mpRepo = read('server/modules/ai/repositories/ai-maintenance-prediction.repository.ts');
    const mpSvc = read('server/modules/ai/services/ai-maintenance-prediction.service.ts');
    expect(mpRepo).toMatch(/predictMaintenance/);
    expect(mpRepo).toMatch(/analyzePredictiveMaintenance/);
    expect(mpRepo).toMatch(/generatePredictiveDiagnostic/);
    expect(mpSvc).not.toMatch(/from '.*\/storage'/);
    expect(mpSvc).not.toMatch(/from '.*\/ai-service'/);
  });

  it('mounts the four parts-recommendation routes and retires the monolith handlers', () => {
    const legacy = read('server/routes.ts');
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/recommend-parts['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/parts-recommendations['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/parts-recommendations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/ai\/parts-recommendations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(legacy).not.toMatch(/app\.(post|get|patch)\(['"]\/api\/ai\/(recommend-parts|parts-recommendations)/);
  });

  it('keeps the parts data access (LLM + storage) behind its repository', () => {
    const prRepo = read('server/modules/ai/repositories/ai-parts-recommendation.repository.ts');
    const prSvc = read('server/modules/ai/services/ai-parts-recommendation.service.ts');
    expect(prRepo).toMatch(/recommendParts/);
    expect(prRepo).toMatch(/createAIPartsRecommendation/);
    expect(prSvc).not.toMatch(/from '.*\/storage'/);
    expect(prSvc).not.toMatch(/from '.*\/ai'$/m);
  });

  it('mounts the four schedule-optimization routes and retires the monolith handlers', () => {
    const legacy = read('server/routes.ts');
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/optimize-schedule['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/schedule-optimizations['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/schedule-optimizations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/ai\/schedule-optimizations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(legacy).not.toMatch(/app\.(post|get|patch)\(['"]\/api\/ai\/(optimize-schedule|schedule-optimizations)/);
  });

  it('keeps the schedule data access (LLM + storage) behind its repository', () => {
    const soRepo = read('server/modules/ai/repositories/ai-schedule-optimization.repository.ts');
    const soSvc = read('server/modules/ai/services/ai-schedule-optimization.service.ts');
    expect(soRepo).toMatch(/optimizeSchedule/);
    expect(soRepo).toMatch(/createAIScheduleOptimization/);
    expect(soSvc).not.toMatch(/from '.*\/storage'/);
    expect(soSvc).not.toMatch(/from '.*\/ai'$/m);
  });

  it('mounts the four chat routes and retires the monolith handlers', () => {
    const legacy = read('server/routes.ts');
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/chat['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/chat-conversations['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/chat-conversations\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/chat-conversations\/:id\/handoff['"],\s*isAuthenticated,\s*requireResourceOwnership/);
    expect(legacy).not.toMatch(/app\.(post|get)\(['"]\/api\/ai\/(chat|chat-conversations)/);
  });

  it('keeps the chat data access (LLM + storage) behind its repository', () => {
    const chatRepo = read('server/modules/ai/repositories/ai-chat.repository.ts');
    const chatSvc = read('server/modules/ai/services/ai-chat.service.ts');
    expect(chatRepo).toMatch(/chatWithCustomer/);
    expect(chatRepo).toMatch(/createAIChatConversation/);
    expect(chatSvc).not.toMatch(/from '.*\/storage'/);
    expect(chatSvc).not.toMatch(/from '.*\/ai'$/m);
  });

  it('mounts the four OCR routes (parent-scoped ownership) and retires the monolith handlers', () => {
    const legacy = read('server/routes.ts');
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/ocr-documents['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/ai\/ocr-documents\/upload['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/ai\/ocr-documents\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership\(\{\s*table:\s*'ocr_documents',\s*parent:/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/ai\/ocr-documents\/:id['"],\s*isAuthenticated,\s*requireResourceOwnership\(\{\s*table:\s*'ocr_documents',\s*parent:/);
    expect(legacy).not.toMatch(/app\.(post|get|patch)\(['"]\/api\/ai\/ocr-documents/);
  });

  it('completes the /api/ai/* migration: no monolith AI handlers remain', () => {
    const legacy = read('server/routes.ts');
    expect(legacy).not.toMatch(/app\.(get|post|put|patch|delete)\(['"]\/api\/ai\//);
  });

  it('keeps the OCR data access (storage + mock extraction) behind its repository', () => {
    const ocrRepo = read('server/modules/ai/repositories/ai-ocr-document.repository.ts');
    const ocrSvc = read('server/modules/ai/services/ai-ocr-document.service.ts');
    expect(ocrRepo).toMatch(/getOCRDocuments/);
    expect(ocrRepo).toMatch(/mockExtraction/);
    expect(ocrSvc).not.toMatch(/from '.*\/storage'/);
  });
});
