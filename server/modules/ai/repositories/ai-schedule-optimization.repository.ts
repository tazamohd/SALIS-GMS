/**
 * AI schedule-optimization repository (Phase E4). The only data-layer access for
 * the AI schedule-optimization surface: the `optimizeSchedule` LLM helper
 * (external integration) and the `storage` CRUD for persisted optimizations.
 * Extracted from the monolith `/api/ai/schedule-optimizations*` handlers.
 */

import { storage } from '../../../storage';
import { optimizeSchedule } from '../../../ai';

// storage rows and the LLM helper are loosely typed at the seam.
type Any = any;

export interface IAiScheduleOptimizationRepository {
  optimize(input: { appointments: Any[]; technicians: Any[] }): Promise<Any>;
  create(data: Any): Promise<Any>;
  list(garageId: string, status?: string): Promise<Any[]>;
  getById(id: string): Promise<Any | undefined>;
  update(id: string, data: Any): Promise<Any>;
}

export class AiScheduleOptimizationRepository implements IAiScheduleOptimizationRepository {
  optimize(input: { appointments: Any[]; technicians: Any[] }) {
    return optimizeSchedule({
      appointments: input.appointments || [],
      technicians: input.technicians || [],
    } as Any);
  }
  create(data: Any) { return storage.createAIScheduleOptimization(data); }
  list(garageId: string, status?: string) { return storage.getAIScheduleOptimizations(garageId, status); }
  getById(id: string) { return storage.getAIScheduleOptimization(id); }
  update(id: string, data: Any) { return storage.updateAIScheduleOptimization(id, data); }
}
