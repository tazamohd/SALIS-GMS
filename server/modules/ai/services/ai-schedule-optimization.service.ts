/**
 * AI schedule-optimization service (Phase E5 — business layer). Owns the
 * optimization assembly (LLM result → persisted, garage-scoped row), the
 * status-scoped reads, and the ownership rules as domain errors: missing row →
 * `NotFoundError` (404), cross-garage row or a garage-change attempt →
 * `AuthorizationError` (403). No HTTP, no data-layer access.
 */

import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { IAiScheduleOptimizationRepository } from '../repositories/ai-schedule-optimization.repository';

// storage rows are loosely typed at the seam.
type Any = any;

export class AiScheduleOptimizationService {
  constructor(private readonly repo: IAiScheduleOptimizationRepository) {}

  async optimize(garageId: string, body: Any) {
    const ai = await this.repo.optimize({
      appointments: body?.appointments || [],
      technicians: body?.technicians || [],
    });
    return this.repo.create({
      garageId,
      conflicts: ai.conflicts,
      suggestions: ai.suggestions,
      potentialTimeSaved: ai.totalPotentialTimeSaved,
      reasoning: ai.reasoning,
      status: 'pending',
    });
  }

  list(garageId: string, status?: string) {
    return this.repo.list(garageId, status);
  }

  async get(id: string, garageId: string) {
    const row = await this.repo.getById(id);
    if (!row) throw new NotFoundError('Schedule optimization not found');
    if (row.garageId !== garageId) throw new AuthorizationError('Access denied');
    return row;
  }

  async update(id: string, garageId: string, data: Any) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Schedule optimization not found');
    if (existing.garageId !== garageId) throw new AuthorizationError('Access denied');
    if (data.garageId && data.garageId !== garageId) {
      throw new AuthorizationError('Cannot change garage');
    }
    return this.repo.update(id, data);
  }
}
