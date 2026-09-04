// @ts-nocheck
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import {
  insertFranchiseGroupSchema,
  insertFranchiseContractSchema,
  insertFranchiseKpiSchema,
  insertRevenueSharingRuleSchema,
} from '@shared/schema';

const router = Router();

// ========================================================================
// Module 56: Franchise Command Center
// ========================================================================

// Franchise Groups
router.post("/franchise-groups", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertFranchiseGroupSchema.parse(req.body);
    const group = await storage.createFranchiseGroup(validatedData);
    res.status(201).json(group);
  } catch (error: any) {
    console.error("Error creating franchise group:", error);
    res.status(400).json({ error: error.message || "Failed to create franchise group" });
  }
});

router.get("/franchise-groups", isAuthenticated, async (req, res) => {
  try {
    const groups = await storage.getFranchiseGroups();
    res.json(groups);
  } catch (error) {
    console.error("Error fetching franchise groups:", error);
    res.status(500).json({ error: "Failed to fetch franchise groups" });
  }
});

router.get("/franchise-groups/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const group = await storage.getFranchiseGroupById(id);
    if (!group) {
      return res.status(404).json({ error: "Franchise group not found" });
    }
    res.json(group);
  } catch (error) {
    console.error("Error fetching franchise group:", error);
    res.status(500).json({ error: "Failed to fetch franchise group" });
  }
});

router.patch("/franchise-groups/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateFranchiseGroup(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating franchise group:", error);
    res.status(400).json({ error: error.message || "Failed to update franchise group" });
  }
});

router.delete("/franchise-groups/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteFranchiseGroup(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting franchise group:", error);
    res.status(500).json({ error: "Failed to delete franchise group" });
  }
});

// Franchise Contracts
router.post("/franchise-contracts", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertFranchiseContractSchema.parse(req.body);
    const contract = await storage.createFranchiseContract(validatedData);
    res.status(201).json(contract);
  } catch (error: any) {
    console.error("Error creating franchise contract:", error);
    res.status(400).json({ error: error.message || "Failed to create franchise contract" });
  }
});

router.get("/franchise-contracts", isAuthenticated, async (req, res) => {
  try {
    const { franchiseGroupId } = req.query;
    const contracts = await storage.getFranchiseContracts(franchiseGroupId as string | undefined);
    res.json(contracts);
  } catch (error) {
    console.error("Error fetching franchise contracts:", error);
    res.status(500).json({ error: "Failed to fetch franchise contracts" });
  }
});

router.get("/franchise-contracts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await storage.getFranchiseContractById(id);
    if (!contract) {
      return res.status(404).json({ error: "Franchise contract not found" });
    }
    res.json(contract);
  } catch (error) {
    console.error("Error fetching franchise contract:", error);
    res.status(500).json({ error: "Failed to fetch franchise contract" });
  }
});

router.patch("/franchise-contracts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateFranchiseContract(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating franchise contract:", error);
    res.status(400).json({ error: error.message || "Failed to update franchise contract" });
  }
});

router.delete("/franchise-contracts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteFranchiseContract(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting franchise contract:", error);
    res.status(500).json({ error: "Failed to delete franchise contract" });
  }
});

// Franchise KPIs
router.post("/franchise-kpis", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertFranchiseKpiSchema.parse(req.body);
    const kpi = await storage.createFranchiseKpi(validatedData);
    res.status(201).json(kpi);
  } catch (error: any) {
    console.error("Error creating franchise KPI:", error);
    res.status(400).json({ error: error.message || "Failed to create franchise KPI" });
  }
});

router.get("/franchise-kpis", isAuthenticated, async (req: any, res) => {
  try {
    const { branchId, month } = req.query;
    if (!branchId) {
      return res.status(400).json({ error: "branchId is required" });
    }
    const kpis = await storage.getFranchiseKpis(branchId as string, {
      month: month as string | undefined
    });
    res.json(kpis);
  } catch (error) {
    console.error("Error fetching franchise KPIs:", error);
    res.status(500).json({ error: "Failed to fetch franchise KPIs" });
  }
});

router.get("/franchise-kpis/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const kpi = await storage.getFranchiseKpiById(id);
    if (!kpi) {
      return res.status(404).json({ error: "Franchise KPI not found" });
    }
    res.json(kpi);
  } catch (error) {
    console.error("Error fetching franchise KPI:", error);
    res.status(500).json({ error: "Failed to fetch franchise KPI" });
  }
});

router.patch("/franchise-kpis/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateFranchiseKpi(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating franchise KPI:", error);
    res.status(400).json({ error: error.message || "Failed to update franchise KPI" });
  }
});

// Revenue Sharing Rules
router.post("/revenue-sharing-rules", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertRevenueSharingRuleSchema.parse(req.body);
    const rule = await storage.createRevenueSharingRule(validatedData);
    res.status(201).json(rule);
  } catch (error: any) {
    console.error("Error creating revenue sharing rule:", error);
    res.status(400).json({ error: error.message || "Failed to create revenue sharing rule" });
  }
});

router.get("/revenue-sharing-rules", isAuthenticated, async (req, res) => {
  try {
    const { franchiseGroupId } = req.query;
    if (!franchiseGroupId) {
      return res.status(400).json({ error: "franchiseGroupId is required" });
    }
    const rules = await storage.getRevenueSharingRules(franchiseGroupId as string);
    res.json(rules);
  } catch (error) {
    console.error("Error fetching revenue sharing rules:", error);
    res.status(500).json({ error: "Failed to fetch revenue sharing rules" });
  }
});

router.get("/revenue-sharing-rules/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await storage.getRevenueSharingRuleById(id);
    if (!rule) {
      return res.status(404).json({ error: "Revenue sharing rule not found" });
    }
    res.json(rule);
  } catch (error) {
    console.error("Error fetching revenue sharing rule:", error);
    res.status(500).json({ error: "Failed to fetch revenue sharing rule" });
  }
});

router.patch("/revenue-sharing-rules/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateRevenueSharingRule(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating revenue sharing rule:", error);
    res.status(400).json({ error: error.message || "Failed to update revenue sharing rule" });
  }
});

router.delete("/revenue-sharing-rules/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteRevenueSharingRule(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting revenue sharing rule:", error);
    res.status(500).json({ error: "Failed to delete revenue sharing rule" });
  }
});

export default router;
