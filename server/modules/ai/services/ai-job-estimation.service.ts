/**
 * AI job-estimation service (Phase E5 — business layer). Owns the estimate
 * assembly (LLM result → persisted row), tenant-scoped reads, and the
 * ownership rules surfaced as domain errors: a missing row → `NotFoundError`
 * (404 "Job estimation not found"), a cross-garage row or a garage-change
 * attempt → `AuthorizationError` (403). No HTTP, no data-layer access.
 */

import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type {
  IAiJobEstimationRepository,
  JobEstimationInput,
} from '../repositories/ai-job-estimation.repository';

// storage rows are loosely typed at the seam.
type Any = any;

export interface EstimateJobBody extends JobEstimationInput {
  vehicleId?: string;
  jobCardId?: string;
}

export class AiJobEstimationService {
  constructor(private readonly repo: IAiJobEstimationRepository) {}

  async estimate(garageId: string, body: EstimateJobBody) {
    const ai = await this.repo.estimate(body);
    return this.repo.create({
      garageId,
      serviceType: body.serviceType,
      vehicleId: body.vehicleId,
      jobCardId: body.jobCardId,
      estimatedHours: ai.estimatedHours?.toString(),
      estimatedCost: ai.estimatedCost?.toString(),
      confidence: ai.confidence?.toString(),
      reasoning: ai.reasoning,
    });
  }

  list(garageId: string, vehicleId?: string) {
    return this.repo.listByGarage(garageId, vehicleId);
  }

  async get(id: string, garageId: string) {
    const row = await this.repo.getById(id);
    if (!row) throw new NotFoundError('Job estimation not found');
    if (row.garageId !== garageId) throw new AuthorizationError('Access denied');
    return row;
  }

  async update(id: string, garageId: string, data: Any) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Job estimation not found');
    if (existing.garageId !== garageId) throw new AuthorizationError('Access denied');
    if (data.garageId && data.garageId !== garageId) {
      throw new AuthorizationError('Cannot change garage');
    }
    return this.repo.update(id, data);
  }
}
