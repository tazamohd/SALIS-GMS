/**
 * Compliance repository (Phase E). The only data / service-seam access for the
 * compliance domain: the `phase6-compliance-service` for environmental records
 * (Drizzle-backed) and the `storage` facade for policies / audits / tasks.
 * Delegation only.
 */

import { storage } from '../../../storage';
import * as phase6ComplianceService from '../../../phase6-compliance-service';

export class ComplianceRepository {
  // Environmental compliance (phase6 service seam)
  createComplianceRecord(data: Parameters<typeof phase6ComplianceService.createComplianceRecord>[0]) {
    return phase6ComplianceService.createComplianceRecord(data);
  }
  getComplianceRecords(garageId: string, complianceType?: string) {
    return phase6ComplianceService.getComplianceRecords(garageId, complianceType);
  }
  getComplianceAnalytics(garageId: string, startDate: Date, endDate: Date) {
    return phase6ComplianceService.getComplianceAnalytics(garageId, startDate, endDate);
  }

  // Policies / audits / tasks (storage facade)
  getCompliancePolicies(garageId: string, status?: string) {
    return storage.getCompliancePolicies(garageId, status);
  }
  createCompliancePolicy(data: Parameters<typeof storage.createCompliancePolicy>[0]) {
    return storage.createCompliancePolicy(data);
  }
  getComplianceAudits(garageId: string, policyId?: string, status?: string) {
    return storage.getComplianceAudits(garageId, policyId, status);
  }
  createComplianceAudit(data: Parameters<typeof storage.createComplianceAudit>[0]) {
    return storage.createComplianceAudit(data);
  }
  getComplianceTasks(garageId: string, policyId?: string, status?: string) {
    return storage.getComplianceTasks(garageId, policyId, status);
  }
  createComplianceTask(data: Parameters<typeof storage.createComplianceTask>[0]) {
    return storage.createComplianceTask(data);
  }
  completeComplianceTask(id: string) {
    return storage.completeComplianceTask(id);
  }
}
