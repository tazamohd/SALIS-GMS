/**
 * Marketing service (Phase E — Domain Services).
 *
 * Owns the marketing-automation domain (Module 42): marketing-campaign CRUD with
 * the status / campaignType filtered list, campaign-recipient get/create/update,
 * and the campaign analytics rollup. The monolith performed no body validation
 * here (it forwarded `req.body` straight to storage) so none is introduced; the
 * `garageId` injection and the by-id 404s stay at the controller boundary. All
 * data access flows through the repository.
 */

import type { MarketingRepository } from '../repositories/marketing.repository';

export class MarketingService {
  constructor(private readonly repository: MarketingRepository) {}

  // ---- Marketing campaigns ------------------------------------------------
  createCampaign(data: Parameters<MarketingRepository['createMarketingCampaign']>[0]) {
    return this.repository.createMarketingCampaign(data);
  }
  listCampaigns(garageId: string, filters?: { status?: string; campaignType?: string }) {
    return this.repository.getMarketingCampaigns(garageId, filters);
  }
  getCampaign(id: string) {
    return this.repository.getMarketingCampaignById(id);
  }
  updateCampaign(id: string, data: Parameters<MarketingRepository['updateMarketingCampaign']>[1]) {
    return this.repository.updateMarketingCampaign(id, data);
  }
  deleteCampaign(id: string) {
    return this.repository.deleteMarketingCampaign(id);
  }

  // ---- Campaign recipients ------------------------------------------------
  listRecipients(campaignId: string) {
    return this.repository.getCampaignRecipients(campaignId);
  }
  createRecipient(data: Parameters<MarketingRepository['createCampaignRecipient']>[0]) {
    return this.repository.createCampaignRecipient(data);
  }
  updateRecipient(id: string, data: Parameters<MarketingRepository['updateCampaignRecipient']>[1]) {
    return this.repository.updateCampaignRecipient(id, data);
  }

  // ---- Campaign analytics -------------------------------------------------
  getAnalytics(campaignId: string) {
    return this.repository.getCampaignAnalytics(campaignId);
  }
}
