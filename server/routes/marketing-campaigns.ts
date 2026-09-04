// @ts-nocheck
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// POST /api/marketing-campaigns
router.post("/marketing-campaigns", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const data = { ...req.body, garageId: user.garageId };
    const campaign = await storage.createMarketingCampaign(data);
    res.status(201).json(campaign);
  } catch (error: any) {
    console.error("Error creating marketing campaign:", error);
    res.status(400).json({ error: error.message || "Failed to create marketing campaign" });
  }
});

// GET /api/marketing-campaigns
router.get("/marketing-campaigns", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const { status, campaignType } = req.query;
    const campaigns = await storage.getMarketingCampaigns(user.garageId, {
      status: status as string | undefined,
      campaignType: campaignType as string | undefined,
    });
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching marketing campaigns:", error);
    res.status(500).json({ error: "Failed to fetch marketing campaigns" });
  }
});

// GET /api/marketing-campaigns/:id
router.get("/marketing-campaigns/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await storage.getMarketingCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Marketing campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Error fetching marketing campaign:", error);
    res.status(500).json({ error: "Failed to fetch marketing campaign" });
  }
});

// PATCH /api/marketing-campaigns/:id
router.patch("/marketing-campaigns/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateMarketingCampaign(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating marketing campaign:", error);
    res.status(400).json({ error: error.message || "Failed to update marketing campaign" });
  }
});

// DELETE /api/marketing-campaigns/:id
router.delete("/marketing-campaigns/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteMarketingCampaign(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting marketing campaign:", error);
    res.status(500).json({ error: "Failed to delete marketing campaign" });
  }
});

// GET /api/marketing-campaigns/:campaignId/recipients
router.get("/marketing-campaigns/:campaignId/recipients", isAuthenticated, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const recipients = await storage.getCampaignRecipients(campaignId);
    res.json(recipients);
  } catch (error) {
    console.error("Error fetching campaign recipients:", error);
    res.status(500).json({ error: "Failed to fetch campaign recipients" });
  }
});

// POST /api/campaign-recipients
router.post("/campaign-recipients", isAuthenticated, async (req, res) => {
  try {
    const recipient = await storage.createCampaignRecipient(req.body);
    res.status(201).json(recipient);
  } catch (error: any) {
    console.error("Error creating campaign recipient:", error);
    res.status(400).json({ error: error.message || "Failed to create campaign recipient" });
  }
});

// PATCH /api/campaign-recipients/:id
router.patch("/campaign-recipients/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateCampaignRecipient(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating campaign recipient:", error);
    res.status(400).json({ error: error.message || "Failed to update campaign recipient" });
  }
});

// GET /api/marketing-campaigns/:campaignId/analytics
router.get("/marketing-campaigns/:campaignId/analytics", isAuthenticated, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const analytics = await storage.getCampaignAnalytics(campaignId);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching campaign analytics:", error);
    res.status(500).json({ error: "Failed to fetch campaign analytics" });
  }
});

export default router;
