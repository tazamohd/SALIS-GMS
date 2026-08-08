/**
 * AI maintenance-prediction service (Phase E5 — business layer). Owns the
 * prediction assembly (engine result → persisted, garage-scoped row) for the
 * single-vehicle predict/diagnose flows, the tenant-scoped reads and the
 * ownership rules (missing → `NotFoundError` 404, cross-garage → `AuthorizationError`
 * 403), the acknowledge transition, and the batch `analyze` that walks the
 * garage's vehicles, matches job cards by VIN, and stores AI predictions. Runtime
 * values (the acknowledge timestamp) are supplied by the controller. No HTTP, no
 * data-layer access. Behavior mirrors the retired monolith handlers.
 */

import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { IAiMaintenancePredictionRepository } from '../repositories/ai-maintenance-prediction.repository';

// storage rows / engine payloads are loosely typed at the seam.
type Any = any;

export class AiMaintenancePredictionService {
  constructor(private readonly repo: IAiMaintenancePredictionRepository) {}

  async predict(garageId: string, body: Any) {
    const { vehicleId, vehicleMake, vehicleModel, vehicleYear, mileage, serviceHistory } = body ?? {};
    const ai = await this.repo.predict({
      vehicleMake, vehicleModel, vehicleYear, mileage,
      serviceHistory: serviceHistory || [],
    });
    return this.repo.create({
      garageId, vehicleId, vehicleMake, vehicleModel, vehicleYear, mileage,
      serviceHistory: serviceHistory || [],
      predictions: ai.predictions,
      status: 'pending',
    });
  }

  async diagnose(garageId: string, body: Any) {
    const {
      vehicleId, mileage, engineTemperature, oilPressure, brakePadWear, batteryVoltage,
      tireCondition, lastServiceDate, vehicleMake, vehicleModel, vehicleYear, fuelLevel,
      checkEngineLightOn, unusualNoises, additionalSymptoms,
    } = body ?? {};

    const ai = await this.repo.diagnose({
      vehicleId, mileage, engineTemperature, oilPressure, brakePadWear, batteryVoltage,
      tireCondition, lastServiceDate, vehicleMake, vehicleModel, vehicleYear, fuelLevel,
      checkEngineLightOn, unusualNoises, additionalSymptoms,
    });

    const prediction = await this.repo.create({
      garageId,
      vehicleId,
      predictedIssue: ai.predictedIssue,
      severity: ai.severity,
      recommendedAction: ai.recommendedAction,
      estimatedTimeframe: ai.estimatedTimeframe,
      confidence: ai.confidence,
      basedOnData: {
        mileage, engineTemperature, oilPressure, brakePadWear, batteryVoltage, tireCondition,
        vehicleInfo: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
        checkEngineLightOn, unusualNoises, additionalSymptoms,
        riskLevel: ai.riskLevel,
      },
      status: 'pending',
    });

    return { ...prediction, riskLevel: ai.riskLevel, additionalDetails: ai.additionalDetails };
  }

  list(garageId: string, vehicleId?: string, status?: string) {
    return this.repo.list(garageId, vehicleId, status);
  }

  async get(id: string, garageId: string) {
    const row = await this.repo.getById(id);
    if (!row) throw new NotFoundError('Maintenance prediction not found');
    if (row.garageId !== garageId) throw new AuthorizationError('Access denied');
    return row;
  }

  async acknowledge(id: string, garageId: string, acknowledgedAt: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Maintenance prediction not found');
    if (existing.garageId !== garageId) throw new AuthorizationError('Access denied');
    return this.repo.update(id, { status: 'acknowledged', acknowledgedAt });
  }

  /** Walk every vehicle, match its job cards by VIN, and store AI predictions. */
  async analyze(garageId: string) {
    const vehicles = await this.repo.listVehicles(garageId);
    const predictions: Any[] = [];

    for (const vehicle of vehicles) {
      const allJobCards = await this.repo.listJobCards(garageId);
      // Match by VIN in the vehicleInfo JSONB field.
      const jobCards = allJobCards.filter((jc: Any) => {
        const info = jc.vehicleInfo as Any;
        return info?.vin === vehicle.vin;
      });

      if (jobCards.length > 0) {
        // job_cards has no mileage column; the closest reading is the vehicle's odometer.
        const serviceHistory = jobCards.map((jc: Any) => ({
          date: jc.createdAt,
          description: jc.description || 'Service performed',
          mileage: vehicle.mileage ?? 0,
          cost: jc.totalCost || 0,
        }));

        const aiPredictions = await this.repo.analyze({
          vehicleId: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage || 50000,
          serviceHistory,
        });

        for (const aiPred of aiPredictions) {
          const prediction = await this.repo.create({
            garageId,
            vehicleId: vehicle.id,
            predictedIssue: aiPred.issue || `Maintenance needed for ${vehicle.make} ${vehicle.model}`,
            severity: aiPred.severity || 'medium',
            recommendedAction: aiPred.recommendation || 'Schedule inspection',
            estimatedTimeframe: `Around ${aiPred.estimatedMiles || (vehicle.mileage ?? 0) + 1000} miles`,
            confidence: Math.round((aiPred.probability || 0.75) * 100),
            basedOnData: {
              serviceHistory: serviceHistory.slice(-3),
              totalServices: jobCards.length,
              vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              currentMileage: vehicle.mileage || 50000,
              aiAnalysis: true,
            },
            status: 'pending',
          });
          predictions.push(prediction);
        }
      }
    }

    return {
      message: `AI analysis complete. Generated ${predictions.length} new predictions using GPT-5.`,
      predictions,
    };
  }
}
