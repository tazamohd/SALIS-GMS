/**
 * Compliance service (Phase E — Domain Services).
 *
 * Owns the compliance domain rules: the environmental-record field mapping
 * (string→number coercions for the decimal columns, `recordDate` → `Date`), the
 * analytics trailing-year default range, and the policy / audit / task
 * passthroughs. Zod body validation stays at the controller boundary; all data
 * access flows through the repository.
 */

import type { ComplianceRepository } from '../repositories/compliance.repository';
import type { ComplianceRecordInput } from '../compliance.schemas';

export class ComplianceService {
  constructor(private readonly repository: ComplianceRepository) {}

  // ---- Environmental compliance -------------------------------------------
  createEnvironmentalRecord(garageId: string | undefined, validated: ComplianceRecordInput) {
    const recordData = {
      garageId: garageId as string,
      complianceType: validated.complianceType,
      recordDate: new Date(validated.recordDate),
      wasteType: validated.wasteType,
      // The phase6 service takes numbers and stringifies them for the decimal
      // columns itself.
      quantity: validated.quantity !== undefined ? Number(validated.quantity) || undefined : undefined,
      unit: validated.unit,
      disposalMethod: validated.disposalMethod,
      disposalCompany: validated.disposalCompany,
      certificationNumber: validated.certificationNumber,
      cost: validated.cost !== undefined ? Number(validated.cost) || undefined : undefined,
      regulatoryStandard: validated.regulatoryStandard,
      attachments: validated.attachments,
      notes: validated.notes,
    };
    return this.repository.createComplianceRecord(recordData);
  }

  listEnvironmentalRecords(garageId: string | undefined, complianceType?: string) {
    return this.repository.getComplianceRecords(garageId as string, complianceType);
  }

  environmentalAnalytics(garageId: string | undefined, startDate?: string, endDate?: string) {
    // The service aggregates over a closed date range; default to the trailing
    // year when the caller doesn't narrow it.
    const to = endDate ? new Date(endDate) : new Date();
    const from = startDate ? new Date(startDate) : new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
    return this.repository.getComplianceAnalytics(garageId as string, from, to);
  }

  // ---- Policies / audits / tasks ------------------------------------------
  listPolicies(garageId: string | undefined, status?: string) {
    return this.repository.getCompliancePolicies(garageId as string, status);
  }
  createPolicy(validated: Parameters<ComplianceRepository['createCompliancePolicy']>[0]) {
    return this.repository.createCompliancePolicy(validated);
  }
  listAudits(garageId: string | undefined, policyId?: string, status?: string) {
    return this.repository.getComplianceAudits(garageId as string, policyId, status);
  }
  createAudit(validated: Parameters<ComplianceRepository['createComplianceAudit']>[0]) {
    return this.repository.createComplianceAudit(validated);
  }
  listTasks(garageId: string | undefined, policyId?: string, status?: string) {
    return this.repository.getComplianceTasks(garageId as string, policyId, status);
  }
  createTask(validated: Parameters<ComplianceRepository['createComplianceTask']>[0]) {
    return this.repository.createComplianceTask(validated);
  }
  completeTask(id: string) {
    return this.repository.completeComplianceTask(id);
  }
}
