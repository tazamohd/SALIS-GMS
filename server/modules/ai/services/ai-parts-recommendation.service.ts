/**
 * AI parts-recommendation service (Phase E5 — business layer). Owns the
 * recommendation assembly (LLM result → persisted, garage-scoped row),
 * tenant-scoped reads, and the ownership rules as domain errors: missing row →
 * `NotFoundError` (404), cross-garage row or a garage-change attempt →
 * `AuthorizationError` (403). No HTTP, no data-layer access.
 */

import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type {
  IAiPartsRecommendationRepository,
  PartsRecommendationInput,
} from '../repositories/ai-parts-recommendation.repository';

// storage rows are loosely typed at the seam.
type Any = any;

export interface RecommendPartsBody extends PartsRecommendationInput {
  vehicleId?: string;
  jobCardId?: string;
}

export class AiPartsRecommendationService {
  constructor(private readonly repo: IAiPartsRecommendationRepository) {}

  async recommend(garageId: string, body: RecommendPartsBody) {
    const ai = await this.repo.recommend(body);
    return this.repo.create({
      garageId,
      vehicleId: body.vehicleId,
      serviceType: body.serviceType,
      jobCardId: body.jobCardId,
      recommendedParts: ai.parts,
      totalEstimatedCost: ai.totalEstimatedCost,
      reasoning: ai.reasoning,
      confidence: ai.confidence,
      status: 'pending',
    });
  }

  list(garageId: string, vehicleId?: string, status?: string) {
    return this.repo.list(garageId, vehicleId, status);
  }

  async get(id: string, garageId: string) {
    const row = await this.repo.getById(id);
    if (!row) throw new NotFoundError('Parts recommendation not found');
    if (row.garageId !== garageId) throw new AuthorizationError('Access denied');
    return row;
  }

  async update(id: string, garageId: string, data: Any) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Parts recommendation not found');
    if (existing.garageId !== garageId) throw new AuthorizationError('Access denied');
    if (data.garageId && data.garageId !== garageId) {
      throw new AuthorizationError('Cannot change garage');
    }
    return this.repo.update(id, data);
  }
}
