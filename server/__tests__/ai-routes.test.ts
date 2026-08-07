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
});
