/**
 * Subscription-license service (Phase E — Domain Services).
 *
 * Owns the subscription-licenses domain: the license CRUD with the optional
 * branch/status filtered list and the per-license audit-log lookup. Zod body
 * validation and the by-id 404 stay at the controller boundary. All data access
 * flows through the repository.
 */

import type { SubscriptionLicenseRepository } from '../repositories/subscription-license.repository';

export class SubscriptionLicenseService {
  constructor(private readonly repository: SubscriptionLicenseRepository) {}

  createLicense(validated: Parameters<SubscriptionLicenseRepository['createLicense']>[0]) {
    return this.repository.createLicense(validated);
  }
  listLicenses(branchId?: string, filters?: { status?: string }) {
    return this.repository.getLicenses(branchId, filters);
  }
  getLicense(id: string) {
    return this.repository.getLicenseById(id);
  }
  updateLicense(id: string, data: Parameters<SubscriptionLicenseRepository['updateLicense']>[1]) {
    return this.repository.updateLicense(id, data);
  }
  deleteLicense(id: string) {
    return this.repository.deleteLicense(id);
  }
  listAuditLogs(licenseId: string) {
    return this.repository.getAuditLogs(licenseId);
  }
}
