/**
 * Marketing controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the marketing-automation domain. Preserves the legacy
 * monolith conventions verbatim: raw bodies, `201` on creates, `{ error }`
 * envelopes for `400`/`404`/`500` (falling back to the fixed "Failed to …"
 * strings when the caught error carries no message), and the same
 * `console.error` labels. The monolith did no Zod validation here, so the
 * request body is forwarded as-is; only the `garageId` injection on create and
 * the list filter parsing happen at this boundary. The by-id ownership guards
 * stay on the routes.
 */

import type { Request, Response } from 'express';
import type { MarketingService } from '../services/marketing.service';

interface AuthedUser {
  id?: string;
  garageId?: string;
}
function user(req: Request): AuthedUser {
  return (req.user as AuthedUser | undefined) ?? {};
}
function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeMarketingController(service: MarketingService) {
  return {
    // ---- Marketing campaigns ----------------------------------------------
    async createCampaign(req: Request, res: Response): Promise<void> {
      try {
        const data = { ...req.body, garageId: user(req).garageId };
        res.status(201).json(await service.createCampaign(data));
      } catch (error) {
        console.error('Error creating marketing campaign:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create marketing campaign' });
      }
    },
    async listCampaigns(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listCampaigns(user(req).garageId as string, {
          status: q(req.query.status),
          campaignType: q(req.query.campaignType),
        }));
      } catch (error) {
        console.error('Error fetching marketing campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch marketing campaigns' });
      }
    },
    async getCampaign(req: Request, res: Response): Promise<void> {
      try {
        const campaign = await service.getCampaign(req.params.id);
        if (!campaign) {
          res.status(404).json({ error: 'Marketing campaign not found' });
          return;
        }
        res.json(campaign);
      } catch (error) {
        console.error('Error fetching marketing campaign:', error);
        res.status(500).json({ error: 'Failed to fetch marketing campaign' });
      }
    },
    async updateCampaign(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateCampaign(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating marketing campaign:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update marketing campaign' });
      }
    },
    async deleteCampaign(req: Request, res: Response): Promise<void> {
      try {
        await service.deleteCampaign(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting marketing campaign:', error);
        res.status(500).json({ error: 'Failed to delete marketing campaign' });
      }
    },

    // ---- Campaign recipients ----------------------------------------------
    async listRecipients(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listRecipients(req.params.campaignId));
      } catch (error) {
        console.error('Error fetching campaign recipients:', error);
        res.status(500).json({ error: 'Failed to fetch campaign recipients' });
      }
    },
    async createRecipient(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createRecipient(req.body));
      } catch (error) {
        console.error('Error creating campaign recipient:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create campaign recipient' });
      }
    },
    async updateRecipient(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateRecipient(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating campaign recipient:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update campaign recipient' });
      }
    },

    // ---- Campaign analytics -----------------------------------------------
    async getAnalytics(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getAnalytics(req.params.campaignId));
      } catch (error) {
        console.error('Error fetching campaign analytics:', error);
        res.status(500).json({ error: 'Failed to fetch campaign analytics' });
      }
    },
  };
}
