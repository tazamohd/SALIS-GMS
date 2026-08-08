/**
 * Next-gen module assembly (Phase E1/E2). Wires the thirty `/api/nextgen/*`
 * showcase resources (each a garage-scoped list + Zod-validated create,
 * generated from the resource catalogue) plus the two `/api/vision/*` handlers
 * (the simulated-AI analyze-image flow and the raw quality-checks list) into an
 * Express router via DI. All routes are `isAuthenticated`. The `/api/nextgen/seed`
 * fixture endpoint stays in the monolith (a follow-up slice).
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { NEXTGEN_SERVICE } from '../../infrastructure/di/tokens';
import { makeNextGenController } from './controllers/nextgen.controller';
import { NEXTGEN_RESOURCES } from './nextgen.resources';
import type { NextGenService } from './services/nextgen.service';

export interface NextGenModuleDeps {
  service?: NextGenService;
}

export function createNextGenModule(deps: NextGenModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(NEXTGEN_SERVICE);
  const c = makeNextGenController(service);
  const router = Router();

  // The thirty structurally-identical showcase resources (list + create each).
  for (const r of NEXTGEN_RESOURCES) {
    router.get(`/nextgen/${r.path}`, isAuthenticated, asyncHandler(c.listHandler(r)));
    router.post(`/nextgen/${r.path}`, isAuthenticated, asyncHandler(c.createHandler(r)));
  }

  // Vision AI quality-control (shares the vision storage tables).
  router.post('/vision/analyze-image', isAuthenticated, asyncHandler(c.analyzeImage));
  router.get('/vision/quality-checks', isAuthenticated, asyncHandler(c.qualityChecks));

  return router;
}

export default createNextGenModule();
