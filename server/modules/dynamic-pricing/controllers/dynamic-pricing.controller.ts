/**
 * Dynamic-pricing controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the dynamic-pricing domain. Preserves the legacy
 * monolith contract: the garage-required / service-type-required 400s and the
 * suggestion 404 surfaced from the service, the `201`s on creates, the
 * `{ success: true }` delete bodies, and the exact per-handler
 * `{ message: error.message }` 500s (with the same console.error labels). The
 * `:id` mutations keep their route-level `requireResourceOwnership` guards.
 */

import type { Request, Response } from 'express';
import { ValidationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { DynamicPricingService } from '../services/dynamic-pricing.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function uid(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function mapDomain(res: Response, error: unknown): boolean {
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  return false;
}
function fail(res: Response, error: unknown, label: string): void {
  if (mapDomain(res, error)) return;
  console.error(label, error);
  res.status(500).json({ message: (error as Error).message });
}

export function makeDynamicPricingController(service: DynamicPricingService) {
  return {
    // Market pricing data
    async listMarketData(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listMarketData(garageOf(req), {
          region: str(req.query.region),
          serviceType: str(req.query.serviceType),
          vehicleClass: str(req.query.vehicleClass),
        }));
      } catch (error) {
        fail(res, error, 'Error fetching market pricing data:');
      }
    },
    async createMarketData(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createMarketData(req.body));
      } catch (error) {
        fail(res, error, 'Error creating market pricing data:');
      }
    },
    async updateMarketData(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateMarketData(req.params.id, req.body));
      } catch (error) {
        fail(res, error, 'Error updating market pricing data:');
      }
    },
    async deleteMarketData(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteMarketData(req.params.id));
      } catch (error) {
        fail(res, error, 'Error deleting market pricing data:');
      }
    },

    // Vehicle pricing factors
    async listVehicleFactors(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listVehicleFactors(garageOf(req), str(req.query.vehicleMake)));
      } catch (error) {
        fail(res, error, 'Error fetching vehicle pricing factors:');
      }
    },
    async createVehicleFactor(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createVehicleFactor(req.body));
      } catch (error) {
        fail(res, error, 'Error creating vehicle pricing factor:');
      }
    },
    async updateVehicleFactor(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateVehicleFactor(req.params.id, req.body));
      } catch (error) {
        fail(res, error, 'Error updating vehicle pricing factor:');
      }
    },
    async deleteVehicleFactor(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteVehicleFactor(req.params.id));
      } catch (error) {
        fail(res, error, 'Error deleting vehicle pricing factor:');
      }
    },

    // Pricing suggestions
    async listSuggestions(req: Request, res: Response): Promise<void> {
      try {
        const garageId = garageOf(req) || str(req.query.garageId);
        res.json(await service.listSuggestions(garageId, {
          vehicleId: str(req.query.vehicleId),
          status: str(req.query.status),
        }));
      } catch (error) {
        fail(res, error, 'Error fetching pricing suggestions:');
      }
    },
    async getSuggestion(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getSuggestion(req.params.id));
      } catch (error) {
        fail(res, error, 'Error fetching pricing suggestion:');
      }
    },
    async createSuggestion(req: Request, res: Response): Promise<void> {
      try {
        const garageId = garageOf(req) || (req.body?.garageId as string | undefined);
        res.status(201).json(await service.createSuggestion(garageId, req.body));
      } catch (error) {
        fail(res, error, 'Error creating pricing suggestion:');
      }
    },
    async updateSuggestion(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateSuggestion(req.params.id, uid(req), req.body));
      } catch (error) {
        fail(res, error, 'Error updating pricing suggestion:');
      }
    },
    async deleteSuggestion(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteSuggestion(req.params.id));
      } catch (error) {
        fail(res, error, 'Error deleting pricing suggestion:');
      }
    },

    // Calculation + catalogues
    async calculate(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.calculate(req.body ?? {}));
      } catch (error) {
        fail(res, error, 'Error calculating dynamic price:');
      }
    },
    async serviceTypes(_req: Request, res: Response): Promise<void> {
      try {
        res.json(service.serviceTypes());
      } catch (error) {
        fail(res, error, 'Error fetching service types:');
      }
    },
    async vehicleClasses(_req: Request, res: Response): Promise<void> {
      try {
        res.json(service.vehicleClasses());
      } catch (error) {
        fail(res, error, 'Error fetching vehicle classes:');
      }
    },
  };
}
