/**
 * Warranty repository (Phase E). The only data-layer access for the warranty
 * domain: the `storage` warranty CRUD + status-window lookups and the
 * warranty-claim CRUD + per-warranty lookup. Delegation only; every method
 * forwards the caller's `garageId` so tenant scoping stays enforced in storage.
 */

import { storage } from '../../../storage';

export class WarrantyRepository {
  // ---- Warranties ---------------------------------------------------------
  createWarranty(data: Parameters<typeof storage.createWarranty>[0]) {
    return storage.createWarranty(data);
  }
  getWarrantiesByGarage(garageId: string) {
    return storage.getWarrantiesByGarage(garageId);
  }
  getActiveWarranties(garageId: string) {
    return storage.getActiveWarranties(garageId);
  }
  getExpiredWarranties(garageId: string) {
    return storage.getExpiredWarranties(garageId);
  }
  getExpiringWarranties(garageId: string, daysThreshold: number) {
    return storage.getExpiringWarranties(garageId, daysThreshold);
  }
  getWarrantiesByVehicle(vehicleId: string, garageId?: string) {
    return storage.getWarrantiesByVehicle(vehicleId, garageId);
  }
  getWarrantiesByCustomer(customerId: string, garageId?: string) {
    return storage.getWarrantiesByCustomer(customerId, garageId);
  }
  getWarrantyById(id: string, garageId?: string) {
    return storage.getWarrantyById(id, garageId);
  }
  updateWarranty(id: string, data: Parameters<typeof storage.updateWarranty>[1], garageId?: string) {
    return storage.updateWarranty(id, data, garageId);
  }
  deleteWarranty(id: string, garageId?: string) {
    return storage.deleteWarranty(id, garageId);
  }

  // ---- Warranty claims ----------------------------------------------------
  createWarrantyClaim(data: Parameters<typeof storage.createWarrantyClaim>[0]) {
    return storage.createWarrantyClaim(data);
  }
  getWarrantyClaimsByGarage(garageId: string) {
    return storage.getWarrantyClaimsByGarage(garageId);
  }
  getWarrantyClaimsByWarranty(warrantyId: string, garageId?: string) {
    return storage.getWarrantyClaimsByWarranty(warrantyId, garageId);
  }
  getWarrantyClaimById(id: string, garageId?: string) {
    return storage.getWarrantyClaimById(id, garageId);
  }
  updateWarrantyClaim(id: string, data: Parameters<typeof storage.updateWarrantyClaim>[1], garageId?: string) {
    return storage.updateWarrantyClaim(id, data, garageId);
  }
  deleteWarrantyClaim(id: string, garageId?: string) {
    return storage.deleteWarrantyClaim(id, garageId);
  }
}
