/**
 * AI parts-recommendation repository (Phase E4). The only data-layer access for
 * the AI parts-recommendation surface: the `recommendParts` LLM helper (external
 * integration) and the `storage` CRUD for persisted recommendations. Extracted
 * from the monolith `/api/ai/parts-recommendations*` handlers.
 */

import { storage } from '../../../storage';
import { recommendParts } from '../../../ai';

// storage rows and the LLM helper are loosely typed at the seam.
type Any = any;

export interface PartsRecommendationInput {
  serviceType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  description?: string;
}

export interface IAiPartsRecommendationRepository {
  recommend(input: PartsRecommendationInput): Promise<Any>;
  create(data: Any): Promise<Any>;
  list(garageId: string, vehicleId?: string, status?: string): Promise<Any[]>;
  getById(id: string): Promise<Any | undefined>;
  update(id: string, data: Any): Promise<Any>;
}

export class AiPartsRecommendationRepository implements IAiPartsRecommendationRepository {
  recommend(input: PartsRecommendationInput) {
    // The engine's param is strictly typed; the legacy handler passed raw
    // (any) request fields, so cast at the seam to preserve that behavior.
    return recommendParts({
      serviceType: input.serviceType,
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
      vehicleYear: input.vehicleYear,
      description: input.description || undefined,
    } as Any);
  }
  create(data: Any) { return storage.createAIPartsRecommendation(data); }
  list(garageId: string, vehicleId?: string, status?: string) {
    return storage.getAIPartsRecommendations(garageId, vehicleId, status);
  }
  getById(id: string) { return storage.getAIPartsRecommendation(id); }
  update(id: string, data: Any) { return storage.updateAIPartsRecommendation(id, data); }
}
