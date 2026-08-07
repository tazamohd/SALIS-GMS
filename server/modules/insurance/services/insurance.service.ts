/**
 * Insurance service (Phase E5 — Domain Services).
 *
 * Owns the insurance-claims business mapping: it translates the validated
 * request DTO into the persistence shape (incident-date parsing, amount
 * coercion, and the `adjusterPhone → adjuster_contact` / `description → notes`
 * field renames) exactly as the legacy monolith handler did, and delegates all
 * data access to the injected repository.
 */

import type { IInsuranceRepository } from '../repositories/insurance.repository';

/** Shape produced by `createInsuranceClaimSchema` (validated request body). */
export interface CreateClaimData {
  claimNumber: string;
  jobCardId?: string;
  customerId: string;
  vehicleId: string;
  insuranceCompany: string;
  policyNumber: string;
  claimType: string;
  incidentDate: string;
  claimAmount: string;
  deductible?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  description: string;
  documents?: string[];
}

export class InsuranceService {
  constructor(private readonly repository: IInsuranceRepository) {}

  createClaim(garageId: string, data: CreateClaimData) {
    return this.repository.createClaim({
      garageId,
      claimNumber: data.claimNumber,
      jobCardId: data.jobCardId,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      insuranceCompany: data.insuranceCompany,
      policyNumber: data.policyNumber,
      claimType: data.claimType,
      incidentDate: new Date(data.incidentDate),
      // The service takes amounts as numbers (it stringifies for the decimal
      // columns), names the contact adjuster_contact, and stores free text in
      // notes.
      claimAmount: Number(data.claimAmount) || 0,
      deductible: data.deductible !== undefined ? Number(data.deductible) || undefined : undefined,
      adjusterName: data.adjusterName,
      adjusterContact: data.adjusterPhone,
      notes: data.description,
      documents: data.documents,
    });
  }

  listClaims(garageId: string, status?: string) {
    return this.repository.listClaims(garageId, status);
  }

  updateClaimStatus(id: string, status: string, approvedAmount?: number) {
    return this.repository.updateClaimStatus(id, status, approvedAmount);
  }

  analytics(garageId: string, from: Date, to: Date) {
    return this.repository.claimsAnalytics(garageId, from, to);
  }
}
