/**
 * Fleet-management controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapters for the fleet-management CRUD surface. Each handler
 * preserves the legacy monolith contract exactly: the `garageId` / `createdBy`
 * derivation on create, the 201/204 statuses, the by-id 404 (rendered from the
 * service's NotFoundError), and the per-handler `{ message }` 500 bodies.
 * No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { FleetManagementService } from '../services/fleet-management.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function userIdOf(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeFleetManagementController(service: FleetManagementService) {
  /** Wrap a read/write with the legacy per-handler `{ message }` 500. */
  const guard = (fn: (req: Request, res: Response) => Promise<void>, failMsg: string, notFoundMsg?: string) =>
    async (req: Request, res: Response): Promise<void> => {
      try {
        await fn(req, res);
      } catch (error) {
        if (notFoundMsg && error instanceof NotFoundError) {
          res.status(404).json({ message: notFoundMsg });
          return;
        }
        console.error(`${failMsg}:`, error);
        res.status(500).json({ message: failMsg });
      }
    };

  return {
    // --- Groups ---
    createGroup: guard(async (req, res) => {
      res.status(201).json(await service.createGroup({ ...req.body, garageId: garageOf(req) }));
    }, 'Failed to create fleet group'),
    listGroups: guard(async (req, res) => {
      res.json(await service.listGroups(garageOf(req)));
    }, 'Failed to fetch fleet groups'),
    getGroup: guard(async (req, res) => {
      res.json(await service.getGroup(req.params.id));
    }, 'Failed to fetch fleet group', 'Fleet group not found'),
    updateGroup: guard(async (req, res) => {
      res.json(await service.updateGroup(req.params.id, req.body));
    }, 'Failed to update fleet group'),
    deleteGroup: guard(async (req, res) => {
      await service.deleteGroup(req.params.id);
      res.status(204).send();
    }, 'Failed to delete fleet group'),

    // --- Vehicles ---
    createVehicle: guard(async (req, res) => {
      res.status(201).json(await service.createVehicle(req.body));
    }, 'Failed to create fleet vehicle'),
    listVehiclesByGroup: guard(async (req, res) => {
      res.json(await service.listVehiclesByGroup(req.params.fleetGroupId));
    }, 'Failed to fetch fleet vehicles'),
    getVehicle: guard(async (req, res) => {
      res.json(await service.getVehicle(req.params.id));
    }, 'Failed to fetch fleet vehicle', 'Fleet vehicle not found'),
    updateVehicle: guard(async (req, res) => {
      res.json(await service.updateVehicle(req.params.id, req.body));
    }, 'Failed to update fleet vehicle'),
    deleteVehicle: guard(async (req, res) => {
      await service.deleteVehicle(req.params.id);
      res.status(204).send();
    }, 'Failed to delete fleet vehicle'),

    // --- Contracts ---
    createContract: guard(async (req, res) => {
      res.status(201).json(await service.createContract({ ...req.body, createdBy: userIdOf(req) }));
    }, 'Failed to create fleet contract'),
    listContractsByGroup: guard(async (req, res) => {
      res.json(await service.listContractsByGroup(req.params.fleetGroupId));
    }, 'Failed to fetch fleet contracts'),
    getContract: guard(async (req, res) => {
      res.json(await service.getContract(req.params.id));
    }, 'Failed to fetch fleet contract', 'Fleet contract not found'),
    updateContract: guard(async (req, res) => {
      res.json(await service.updateContract(req.params.id, req.body));
    }, 'Failed to update fleet contract'),
    deleteContract: guard(async (req, res) => {
      await service.deleteContract(req.params.id);
      res.status(204).send();
    }, 'Failed to delete fleet contract'),

    // --- Pricing tiers ---
    createPricingTier: guard(async (req, res) => {
      res.status(201).json(await service.createPricingTier({ ...req.body, garageId: garageOf(req) }));
    }, 'Failed to create pricing tier'),
    listPricingTiers: guard(async (req, res) => {
      res.json(await service.listPricingTiers(garageOf(req), str(req.query.fleetGroupId)));
    }, 'Failed to fetch pricing tiers'),
    getPricingTier: guard(async (req, res) => {
      res.json(await service.getPricingTier(req.params.id));
    }, 'Failed to fetch pricing tier', 'Pricing tier not found'),
    updatePricingTier: guard(async (req, res) => {
      res.json(await service.updatePricingTier(req.params.id, req.body));
    }, 'Failed to update pricing tier'),
    deletePricingTier: guard(async (req, res) => {
      await service.deletePricingTier(req.params.id);
      res.status(204).send();
    }, 'Failed to delete pricing tier'),

    // --- Maintenance schedules ---
    createMaintenanceSchedule: guard(async (req, res) => {
      res.status(201).json(await service.createMaintenanceSchedule(req.body));
    }, 'Failed to create maintenance schedule'),
    listMaintenanceSchedulesByGroup: guard(async (req, res) => {
      res.json(await service.listMaintenanceSchedulesByGroup(req.params.fleetGroupId));
    }, 'Failed to fetch maintenance schedules'),
    getMaintenanceSchedule: guard(async (req, res) => {
      res.json(await service.getMaintenanceSchedule(req.params.id));
    }, 'Failed to fetch maintenance schedule', 'Maintenance schedule not found'),
    updateMaintenanceSchedule: guard(async (req, res) => {
      res.json(await service.updateMaintenanceSchedule(req.params.id, req.body));
    }, 'Failed to update maintenance schedule'),
    deleteMaintenanceSchedule: guard(async (req, res) => {
      await service.deleteMaintenanceSchedule(req.params.id);
      res.status(204).send();
    }, 'Failed to delete maintenance schedule'),
  };
}

export type FleetManagementController = ReturnType<typeof makeFleetManagementController>;
