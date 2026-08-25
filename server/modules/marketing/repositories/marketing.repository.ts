/**
 * Marketing repository (Phase E). The only data-layer access for the
 * marketing-automation domain (Module 42): the `storage` marketing-campaign
 * CRUD + filtered list, the campaign-recipient get/create/update, and the
 * campaign analytics rollup. Delegation only.
 */

import { storage } from '../../../storage';

export class MarketingRepository {
  // ---- Marketing campaigns ------------------------------------------------
  createMarketingCampaign(data: Parameters<typeof storage.createMarketingCampaign>[0]) {
    return storage.createMarketingCampaign(data);
  }
  getMarketingCampaigns(garageId: string, filters?: { status?: string; campaignType?: string }) {
    return storage.getMarketingCampaigns(garageId, filters);
  }
  getMarketingCampaignById(id: string) {
    return storage.getMarketingCampaignById(id);
  }
  updateMarketingCampaign(id: string, data: Parameters<typeof storage.updateMarketingCampaign>[1]) {
    return storage.updateMarketingCampaign(id, data);
  }
  deleteMarketingCampaign(id: string) {
    return storage.deleteMarketingCampaign(id);
  }

  // ---- Campaign recipients ------------------------------------------------
  getCampaignRecipients(campaignId: string) {
    return storage.getCampaignRecipients(campaignId);
  }
  createCampaignRecipient(data: Parameters<typeof storage.createCampaignRecipient>[0]) {
    return storage.createCampaignRecipient(data);
  }
  updateCampaignRecipient(id: string, data: Parameters<typeof storage.updateCampaignRecipient>[1]) {
    return storage.updateCampaignRecipient(id, data);
  }

  // ---- Campaign analytics -------------------------------------------------
  getCampaignAnalytics(campaignId: string) {
    return storage.getCampaignAnalytics(campaignId);
  }
}
