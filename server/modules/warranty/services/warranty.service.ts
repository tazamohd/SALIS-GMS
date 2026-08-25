/**
 * Warranty service (Phase E — Domain Services).
 *
 * Owns the warranty domain rules: the warranty CRUD + status-window passthroughs
 * (active / expired / expiring, the last defaulting to a 30-day window), and the
 * claim CRUD with the review transition — when a claim moves to `approved` or
 * `rejected` the reviewing user is stamped as `reviewedBy`. Zod body validation
 * and the not-found 404s stay at the controller boundary; all data access flows
 * through the repository, which forwards `garageId` for tenant scoping.
 */

import type { WarrantyRepository } from '../repositories/warranty.repository';

const REVIEW_STATUSES = new Set(['approved', 'rejected']);

export class WarrantyService {
  constructor(private readonly repository: WarrantyRepository) {}

  // ---- Warranties ---------------------------------------------------------
  createWarranty(validated: Parameters<WarrantyRepository['createWarranty']>[0]) {
    return this.repository.createWarranty(validated);
  }
  listWarranties(garageId: string) {
    return this.repository.getWarrantiesByGarage(garageId);
  }
  listActive(garageId: string) {
    return this.repository.getActiveWarranties(garageId);
  }
  listExpired(garageId: string) {
    return this.repository.getExpiredWarranties(garageId);
  }
  listExpiring(garageId: string, daysThreshold = 30) {
    return this.repository.getExpiringWarranties(garageId, daysThreshold);
  }
  listByVehicle(vehicleId: string, garageId?: string) {
    return this.repository.getWarrantiesByVehicle(vehicleId, garageId);
  }
  listByCustomer(customerId: string, garageId?: string) {
    return this.repository.getWarrantiesByCustomer(customerId, garageId);
  }
  getWarranty(id: string, garageId?: string) {
    return this.repository.getWarrantyById(id, garageId);
  }
  updateWarranty(id: string, data: Parameters<WarrantyRepository['updateWarranty']>[1], garageId?: string) {
    return this.repository.updateWarranty(id, data, garageId);
  }
  deleteWarranty(id: string, garageId?: string) {
    return this.repository.deleteWarranty(id, garageId);
  }

  // ---- Warranty claims ----------------------------------------------------
  createClaim(validated: Parameters<WarrantyRepository['createWarrantyClaim']>[0]) {
    return this.repository.createWarrantyClaim(validated);
  }
  listClaims(garageId: string) {
    return this.repository.getWarrantyClaimsByGarage(garageId);
  }
  listClaimsByWarranty(warrantyId: string, garageId?: string) {
    return this.repository.getWarrantyClaimsByWarranty(warrantyId, garageId);
  }
  getClaim(id: string, garageId?: string) {
    return this.repository.getWarrantyClaimById(id, garageId);
  }
  updateClaim(
    id: string,
    data: Parameters<WarrantyRepository['updateWarrantyClaim']>[1] & { status?: string; reviewedBy?: string },
    reviewerId: string | undefined,
    garageId?: string,
  ) {
    // Stamp the reviewer when the claim transitions to an approved/rejected state.
    if (data.status && REVIEW_STATUSES.has(data.status) && reviewerId) {
      data.reviewedBy = reviewerId;
    }
    return this.repository.updateWarrantyClaim(id, data, garageId);
  }
  deleteClaim(id: string, garageId?: string) {
    return this.repository.deleteWarrantyClaim(id, garageId);
  }
}
