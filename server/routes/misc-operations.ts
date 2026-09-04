// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import {
  insertCurrencyRateSchema,
  insertTaxRegionSchema,
  insertTimezoneRuleSchema,
  insertNetworkPartnerSchema,
} from "@shared/schema";

const router = Router();

// ========================================================================
// Misc Operations Routes
// (extracted from monolith routes.ts)
// ========================================================================

// --------------- Document Categories ---------------

router.post("/document-categories", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const data = { ...req.body, garageId: user.garageId };
    const category = await storage.createDocumentCategory(data);
    res.status(201).json(category);
  } catch (error: any) {
    console.error("Error creating document category:", error);
    res.status(400).json({ error: error.message || "Failed to create document category" });
  }
});

router.get("/document-categories", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const categories = await storage.getDocumentCategories(user.garageId);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching document categories:", error);
    res.status(500).json({ error: "Failed to fetch document categories" });
  }
});

router.get("/document-categories/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await storage.getDocumentCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: "Document category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching document category:", error);
    res.status(500).json({ error: "Failed to fetch document category" });
  }
});

router.patch("/document-categories/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateDocumentCategory(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating document category:", error);
    res.status(400).json({ error: error.message || "Failed to update document category" });
  }
});

router.delete("/document-categories/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteDocumentCategory(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting document category:", error);
    res.status(500).json({ error: "Failed to delete document category" });
  }
});

// --------------- Documents ---------------

router.patch("/documents/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateDocument(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating document:", error);
    res.status(400).json({ error: error.message || "Failed to update document" });
  }
});

// --------------- Document Access Logs ---------------

router.post("/document-access-logs", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const data = { ...req.body, userId: user.id };
    const log = await storage.createDocumentAccessLog(data);
    res.status(201).json(log);
  } catch (error: any) {
    console.error("Error creating document access log:", error);
    res.status(400).json({ error: error.message || "Failed to create document access log" });
  }
});

router.get("/documents/:documentId/access-logs", isAuthenticated, async (req, res) => {
  try {
    const { documentId } = req.params;
    const logs = await storage.getDocumentAccessLogs(documentId);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching document access logs:", error);
    res.status(500).json({ error: "Failed to fetch document access logs" });
  }
});

// --------------- Currency Rates ---------------

router.post("/currency-rates", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertCurrencyRateSchema.parse(req.body);
    const rate = await storage.createCurrencyRate(validatedData);
    res.status(201).json(rate);
  } catch (error: any) {
    console.error("Error creating currency rate:", error);
    res.status(400).json({ error: error.message || "Failed to create currency rate" });
  }
});

router.get("/currency-rates", isAuthenticated, async (req, res) => {
  try {
    const { fromCurrency, toCurrency } = req.query;
    const rates = await storage.getCurrencyRates(
      fromCurrency as string | undefined,
      toCurrency as string | undefined
    );
    res.json(rates);
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    res.status(500).json({ error: "Failed to fetch currency rates" });
  }
});

router.get("/currency-rates/latest", isAuthenticated, async (req, res) => {
  try {
    const { fromCurrency, toCurrency } = req.query;
    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ error: "fromCurrency and toCurrency are required" });
    }
    const rate = await storage.getLatestCurrencyRate(fromCurrency as string, toCurrency as string);
    res.json(rate);
  } catch (error) {
    console.error("Error fetching latest currency rate:", error);
    res.status(500).json({ error: "Failed to fetch latest currency rate" });
  }
});

// --------------- Tax Regions ---------------

router.post("/tax-regions", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertTaxRegionSchema.parse(req.body);
    const region = await storage.createTaxRegion(validatedData);
    res.status(201).json(region);
  } catch (error: any) {
    console.error("Error creating tax region:", error);
    res.status(400).json({ error: error.message || "Failed to create tax region" });
  }
});

router.get("/tax-regions", isAuthenticated, async (req, res) => {
  try {
    const { countryCode } = req.query;
    const regions = await storage.getTaxRegions(countryCode as string | undefined);
    res.json(regions);
  } catch (error) {
    console.error("Error fetching tax regions:", error);
    res.status(500).json({ error: "Failed to fetch tax regions" });
  }
});

router.get("/tax-regions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const region = await storage.getTaxRegionById(id);
    if (!region) {
      return res.status(404).json({ error: "Tax region not found" });
    }
    res.json(region);
  } catch (error) {
    console.error("Error fetching tax region:", error);
    res.status(500).json({ error: "Failed to fetch tax region" });
  }
});

router.patch("/tax-regions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateTaxRegion(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating tax region:", error);
    res.status(400).json({ error: error.message || "Failed to update tax region" });
  }
});

router.delete("/tax-regions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteTaxRegion(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting tax region:", error);
    res.status(500).json({ error: "Failed to delete tax region" });
  }
});

// --------------- Timezone Rules ---------------

router.post("/timezone-rules", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertTimezoneRuleSchema.parse(req.body);
    const rule = await storage.createTimezoneRule(validatedData);
    res.status(201).json(rule);
  } catch (error: any) {
    console.error("Error creating timezone rule:", error);
    res.status(400).json({ error: error.message || "Failed to create timezone rule" });
  }
});

router.get("/timezone-rules", isAuthenticated, async (req, res) => {
  try {
    const { branchId } = req.query;
    const rules = await storage.getTimezoneRules(branchId as string | undefined);
    res.json(rules);
  } catch (error) {
    console.error("Error fetching timezone rules:", error);
    res.status(500).json({ error: "Failed to fetch timezone rules" });
  }
});

router.get("/timezone-rules/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await storage.getTimezoneRuleById(id);
    if (!rule) {
      return res.status(404).json({ error: "Timezone rule not found" });
    }
    res.json(rule);
  } catch (error) {
    console.error("Error fetching timezone rule:", error);
    res.status(500).json({ error: "Failed to fetch timezone rule" });
  }
});

router.patch("/timezone-rules/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateTimezoneRule(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating timezone rule:", error);
    res.status(400).json({ error: error.message || "Failed to update timezone rule" });
  }
});

// --------------- Network Partners ---------------

router.post("/network-partners", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertNetworkPartnerSchema.parse(req.body);
    const partner = await storage.createNetworkPartner(validatedData);
    res.status(201).json(partner);
  } catch (error: any) {
    console.error("Error creating network partner:", error);
    res.status(400).json({ error: error.message || "Failed to create network partner" });
  }
});

router.get("/network-partners", isAuthenticated, async (req, res) => {
  try {
    const { partnerType, country } = req.query;
    const partners = await storage.getNetworkPartners({
      partnerType: partnerType as string | undefined,
      country: country as string | undefined
    });
    res.json(partners);
  } catch (error) {
    console.error("Error fetching network partners:", error);
    res.status(500).json({ error: "Failed to fetch network partners" });
  }
});

router.get("/network-partners/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await storage.getNetworkPartnerById(id);
    if (!partner) {
      return res.status(404).json({ error: "Network partner not found" });
    }
    res.json(partner);
  } catch (error) {
    console.error("Error fetching network partner:", error);
    res.status(500).json({ error: "Failed to fetch network partner" });
  }
});

router.patch("/network-partners/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateNetworkPartner(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating network partner:", error);
    res.status(400).json({ error: error.message || "Failed to update network partner" });
  }
});

router.delete("/network-partners/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteNetworkPartner(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting network partner:", error);
    res.status(500).json({ error: "Failed to delete network partner" });
  }
});

export default router;
