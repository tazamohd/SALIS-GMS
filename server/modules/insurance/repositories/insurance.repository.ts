/**
 * Insurance repository (Phase E4 — Repository Pattern).
 *
 * The only data-layer access for the insurance-claims domain. Delegates to the
 * existing `phase6-compliance-service` facade (a strangler-fig seam that owns
 * the Drizzle queries today); the boundary is established now so the internals
 * can move without touching callers.
 */

import * as phase6Service from '../../../phase6-compliance-service';

type CreateClaimInput = Parameters<typeof phase6Service.createInsuranceClaim>[0];

export interface IInsuranceRepository {
  createClaim(data: CreateClaimInput): ReturnType<typeof phase6Service.createInsuranceClaim>;
  listClaims(garageId: string, status?: string): ReturnType<typeof phase6Service.getInsuranceClaims>;
  updateClaimStatus(
    id: string,
    status: string,
    approvedAmount?: number,
  ): ReturnType<typeof phase6Service.updateClaimStatus>;
  claimsAnalytics(
    garageId: string,
    from: Date,
    to: Date,
  ): ReturnType<typeof phase6Service.getClaimsAnalytics>;
}

export class InsuranceRepository implements IInsuranceRepository {
  createClaim(data: CreateClaimInput) {
    return phase6Service.createInsuranceClaim(data);
  }
  listClaims(garageId: string, status?: string) {
    return phase6Service.getInsuranceClaims(garageId, status);
  }
  updateClaimStatus(id: string, status: string, approvedAmount?: number) {
    return phase6Service.updateClaimStatus(id, status, approvedAmount);
  }
  claimsAnalytics(garageId: string, from: Date, to: Date) {
    return phase6Service.getClaimsAnalytics(garageId, from, to);
  }
}
