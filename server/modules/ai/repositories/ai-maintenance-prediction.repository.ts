/**
 * AI maintenance-prediction repository (Phase E4). The only data-layer access
 * for the AI maintenance-prediction surface: the three prediction engines
 * (predictMaintenance, generatePredictiveDiagnostic, analyzePredictiveMaintenance
 * — external integrations treated as the data layer), the `storage` CRUD for
 * persisted predictions, and the vehicle/job-card reads the batch analyze needs.
 * Extracted from the monolith `/api/ai/maintenance-predictions*` handlers.
 */

import { storage } from '../../../storage';
import { predictMaintenance } from '../../../ai';
import { analyzePredictiveMaintenance } from '../../../ai-service';
import { generatePredictiveDiagnostic } from '../../../services/predictiveDiagnostics';

// The AI engines and storage rows are loosely typed at the seam.
type Any = any;

export interface IAiMaintenancePredictionRepository {
  predict(input: Any): Promise<Any>;
  diagnose(input: Any): Promise<Any>;
  analyze(input: Any): Promise<Any[]>;
  create(data: Any): Promise<Any>;
  list(garageId: string, vehicleId?: string, status?: string): Promise<Any[]>;
  getById(id: string): Promise<Any | undefined>;
  update(id: string, data: Any): Promise<Any>;
  listVehicles(garageId: string): Promise<Any[]>;
  listJobCards(garageId: string): Promise<Any[]>;
}

export class AiMaintenancePredictionRepository implements IAiMaintenancePredictionRepository {
  predict(input: Any) { return predictMaintenance(input); }
  diagnose(input: Any) { return generatePredictiveDiagnostic(input); }
  analyze(input: Any) { return analyzePredictiveMaintenance(input); }
  create(data: Any) { return storage.createAIMaintenancePrediction(data); }
  list(garageId: string, vehicleId?: string, status?: string) {
    return storage.getAIMaintenancePredictions(garageId, vehicleId, status);
  }
  getById(id: string) { return storage.getAIMaintenancePrediction(id); }
  update(id: string, data: Any) { return storage.updateAIMaintenancePrediction(id, data); }
  listVehicles(garageId: string) { return storage.getVehicles(garageId); }
  listJobCards(garageId: string) { return storage.getJobCards(garageId); }
}
