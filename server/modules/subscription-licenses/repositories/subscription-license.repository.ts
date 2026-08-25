/**
 * Subscription-license repository (Phase E). The only data-layer access for the
 * subscription-licenses domain: the `storage` license CRUD + the optional
 * branch/status filtered list and the per-license audit-log lookup.
 * Delegation only.
 */

import { storage } from '../../../storage';

export class SubscriptionLicenseRepository {
  createLicense(data: Parameters<typeof storage.createSubscriptionLicense>[0]) {
    return storage.createSubscriptionLicense(data);
  }
  getLicenses(branchId?: string, filters?: { status?: string }) {
    return storage.getSubscriptionLicenses(branchId, filters);
  }
  getLicenseById(id: string) {
    return storage.getSubscriptionLicenseById(id);
  }
  updateLicense(id: string, data: Parameters<typeof storage.updateSubscriptionLicense>[1]) {
    return storage.updateSubscriptionLicense(id, data);
  }
  deleteLicense(id: string) {
    return storage.deleteSubscriptionLicense(id);
  }
  getAuditLogs(licenseId: string) {
    return storage.getLicenseAuditLogs(licenseId);
  }
}
