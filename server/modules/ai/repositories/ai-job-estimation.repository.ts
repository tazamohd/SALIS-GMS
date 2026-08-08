/**
 * AI job-estimation repository (Phase E4). The only data-layer access for the
 * AI job-estimation surface: the `estimateJobTime` LLM helper (external
 * integration treated as the data layer) plus the `storage` CRUD for persisted
 * estimations. Extracted from the monolith `/api/ai/job-estimations*` handlers.
 */

import { storage } from '../../../storage';
import { estimateJobTime } from '../../../ai';

// storage AI-estimation rows and the LLM helper are loosely typed.
type Any = any;

export interface JobEstimationInput {
  serviceType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  historicalJobs?: Any;
}

export interface IAiJobEstimationRepository {
  estimate(input: JobEstimationInput): Promise<Any>;
  create(data: Any): Promise<Any>;
  listByGarage(garageId: string, vehicleId?: string): Promise<Any[]>;
  getById(id: string): Promise<Any | undefined>;
  update(id: string, data: Any): Promise<Any>;
}

export class AiJobEstimationRepository implements IAiJobEstimationRepository {
  estimate(input: JobEstimationInput) {
    return estimateJobTime({
      serviceType: input.serviceType || '',
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
      vehicleYear: input.vehicleYear,
      historicalJobs: input.historicalJobs,
    });
  }
  create(data: Any) { return storage.createAIJobEstimation(data); }
  listByGarage(garageId: string, vehicleId?: string) { return storage.getAIJobEstimations(garageId, vehicleId); }
  getById(id: string) { return storage.getAIJobEstimation(id); }
  update(id: string, data: Any) { return storage.updateAIJobEstimation(id, data); }
}
