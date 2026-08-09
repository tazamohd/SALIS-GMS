/**
 * Marketing module assembly (Phase E1/E2). Wires the marketing-automation domain
 * (Module 42) — marketing-campaign CRUD with the filtered list, the per-campaign
 * recipients lookup, campaign-recipient create/update, and the per-campaign
 * analytics rollup — into an Express router via DI.
 *
 * By-id ownership guards mirror the monolith: `/marketing-campaigns/:id` scopes
 * on the campaign's own `garage_id`; `/campaign-recipients/:id` scopes through
 * its parent campaign (recipients carry no `garage_id`). All routes are
 * `isAuthenticated`. Route order matches the monolith.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { MARKETING_SERVICE } from '../../infrastructure/di/tokens';
import { makeMarketingController } from './controllers/marketing.controller';
import type { MarketingService } from './services/marketing.service';

export interface MarketingModuleDeps {
  service?: MarketingService;
}

export function createMarketingModule(deps: MarketingModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(MARKETING_SERVICE);
  const c = makeMarketingController(service);
  const router = Router();

  const ownCampaign = requireResourceOwnership({ table: 'marketing_campaigns' });
  const ownRecipient = requireResourceOwnership({
    table: 'campaign_recipients',
    parent: { table: 'marketing_campaigns', fk: 'campaign_id' },
  });

  // Marketing campaigns
  router.post('/marketing-campaigns', isAuthenticated, asyncHandler(c.createCampaign));
  router.get('/marketing-campaigns', isAuthenticated, asyncHandler(c.listCampaigns));
  router.get('/marketing-campaigns/:id', isAuthenticated, ownCampaign, asyncHandler(c.getCampaign));
  router.patch('/marketing-campaigns/:id', isAuthenticated, ownCampaign, asyncHandler(c.updateCampaign));
  router.delete('/marketing-campaigns/:id', isAuthenticated, ownCampaign, asyncHandler(c.deleteCampaign));

  // Campaign recipients
  router.get('/marketing-campaigns/:campaignId/recipients', isAuthenticated, asyncHandler(c.listRecipients));
  router.post('/campaign-recipients', isAuthenticated, asyncHandler(c.createRecipient));
  router.patch('/campaign-recipients/:id', isAuthenticated, ownRecipient, asyncHandler(c.updateRecipient));

  // Campaign analytics
  router.get('/marketing-campaigns/:campaignId/analytics', isAuthenticated, asyncHandler(c.getAnalytics));

  return router;
}

export default createMarketingModule();
