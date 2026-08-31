// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// ========================================================================
// Loyalty Programs
// ========================================================================

router.post("/loyalty-programs", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const data = { ...req.body, garageId: user.garageId };
    const program = await storage.createLoyaltyProgram(data);
    res.status(201).json(program);
  } catch (error: any) {
    console.error("Error creating loyalty program:", error);
    res.status(400).json({ error: error.message || "Failed to create loyalty program" });
  }
});

router.get("/loyalty-programs", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const programs = await storage.getLoyaltyPrograms(user.garageId);
    res.json(programs);
  } catch (error) {
    console.error("Error fetching loyalty programs:", error);
    res.status(500).json({ error: "Failed to fetch loyalty programs" });
  }
});

router.get("/loyalty-programs/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const program = await storage.getLoyaltyProgramById(id);
    if (!program) {
      return res.status(404).json({ error: "Loyalty program not found" });
    }
    res.json(program);
  } catch (error) {
    console.error("Error fetching loyalty program:", error);
    res.status(500).json({ error: "Failed to fetch loyalty program" });
  }
});

router.patch("/loyalty-programs/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateLoyaltyProgram(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating loyalty program:", error);
    res.status(400).json({ error: error.message || "Failed to update loyalty program" });
  }
});

router.delete("/loyalty-programs/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteLoyaltyProgram(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting loyalty program:", error);
    res.status(500).json({ error: "Failed to delete loyalty program" });
  }
});

// ========================================================================
// Loyalty Accounts
// ========================================================================

router.post("/loyalty-accounts", isAuthenticated, async (req, res) => {
  try {
    const account = await storage.createCustomerLoyaltyAccount(req.body);
    res.status(201).json(account);
  } catch (error: any) {
    console.error("Error creating loyalty account:", error);
    res.status(400).json({ error: error.message || "Failed to create loyalty account" });
  }
});

router.get("/loyalty-accounts", isAuthenticated, async (req, res) => {
  try {
    const { programId, customerId } = req.query;
    const accounts = await storage.getCustomerLoyaltyAccounts(
      programId as string | undefined,
      customerId as string | undefined
    );
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching loyalty accounts:", error);
    res.status(500).json({ error: "Failed to fetch loyalty accounts" });
  }
});

router.get("/loyalty-accounts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await storage.getLoyaltyAccountById(id);
    if (!account) {
      return res.status(404).json({ error: "Loyalty account not found" });
    }
    res.json(account);
  } catch (error) {
    console.error("Error fetching loyalty account:", error);
    res.status(500).json({ error: "Failed to fetch loyalty account" });
  }
});

router.get("/loyalty-accounts/customer/:customerId", isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const account = await storage.getCustomerLoyaltyAccountByCustomer(customerId);
    res.json(account || null);
  } catch (error) {
    console.error("Error fetching loyalty account by customer:", error);
    res.status(500).json({ error: "Failed to fetch loyalty account" });
  }
});

router.patch("/loyalty-accounts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateCustomerLoyaltyAccount(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating loyalty account:", error);
    res.status(400).json({ error: error.message || "Failed to update loyalty account" });
  }
});

// Loyalty Account point operations

router.post("/loyalty-accounts/:id/add-points", isAuthenticated, async (req: any, res) => {
  try {
    const { points } = req.body;
    const account = await storage.addLoyaltyPoints(req.params.id, points);
    res.json(account);
  } catch (error: any) {
    console.error("Error adding loyalty points:", error);
    res.status(500).json({ message: error.message || "Failed to add loyalty points" });
  }
});

router.post("/loyalty-accounts/:id/redeem-points", isAuthenticated, async (req: any, res) => {
  try {
    const { points } = req.body;
    const account = await storage.redeemLoyaltyPoints(req.params.id, points);
    res.json(account);
  } catch (error: any) {
    console.error("Error redeeming loyalty points:", error);
    res.status(500).json({ message: error.message || "Failed to redeem loyalty points" });
  }
});

// ========================================================================
// Loyalty Transactions
// ========================================================================

router.post("/loyalty-transactions", isAuthenticated, async (req, res) => {
  try {
    const transaction = await storage.createLoyaltyTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error: any) {
    console.error("Error creating loyalty transaction:", error);
    res.status(400).json({ error: error.message || "Failed to create loyalty transaction" });
  }
});

router.get("/loyalty-accounts/:accountId/transactions", isAuthenticated, async (req, res) => {
  try {
    const { accountId } = req.params;
    const transactions = await storage.getLoyaltyTransactions(accountId);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching loyalty transactions:", error);
    res.status(500).json({ error: "Failed to fetch loyalty transactions" });
  }
});

router.get("/loyalty-transactions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await storage.getLoyaltyTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ error: "Loyalty transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    console.error("Error fetching loyalty transaction:", error);
    res.status(500).json({ error: "Failed to fetch loyalty transaction" });
  }
});

// ========================================================================
// Loyalty Rewards
// ========================================================================

router.post("/loyalty-rewards", isAuthenticated, async (req, res) => {
  try {
    const reward = await storage.createLoyaltyReward(req.body);
    res.status(201).json(reward);
  } catch (error: any) {
    console.error("Error creating loyalty reward:", error);
    res.status(400).json({ error: error.message || "Failed to create loyalty reward" });
  }
});

router.get("/loyalty-programs/:programId/rewards", isAuthenticated, async (req, res) => {
  try {
    const { programId } = req.params;
    const { isActive } = req.query;
    const rewards = await storage.getLoyaltyRewards(programId, {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    res.json(rewards);
  } catch (error) {
    console.error("Error fetching loyalty rewards:", error);
    res.status(500).json({ error: "Failed to fetch loyalty rewards" });
  }
});

router.get("/loyalty-rewards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await storage.getLoyaltyRewardById(id);
    if (!reward) {
      return res.status(404).json({ error: "Loyalty reward not found" });
    }
    res.json(reward);
  } catch (error) {
    console.error("Error fetching loyalty reward:", error);
    res.status(500).json({ error: "Failed to fetch loyalty reward" });
  }
});

router.patch("/loyalty-rewards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateLoyaltyReward(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating loyalty reward:", error);
    res.status(400).json({ error: error.message || "Failed to update loyalty reward" });
  }
});

router.delete("/loyalty-rewards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteLoyaltyReward(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting loyalty reward:", error);
    res.status(500).json({ error: "Failed to delete loyalty reward" });
  }
});

// ========================================================================
// Loyalty Redemptions
// ========================================================================

router.post("/loyalty-redemptions", isAuthenticated, async (req, res) => {
  try {
    const redemption = await storage.createLoyaltyRedemption(req.body);
    res.status(201).json(redemption);
  } catch (error: any) {
    console.error("Error creating loyalty redemption:", error);
    res.status(400).json({ error: error.message || "Failed to create loyalty redemption" });
  }
});

router.get("/loyalty-redemptions", isAuthenticated, async (req, res) => {
  try {
    const { accountId, status } = req.query;
    const redemptions = await storage.getLoyaltyRedemptions(
      accountId as string | undefined,
      { status: status as string | undefined }
    );
    res.json(redemptions);
  } catch (error) {
    console.error("Error fetching loyalty redemptions:", error);
    res.status(500).json({ error: "Failed to fetch loyalty redemptions" });
  }
});

router.get("/loyalty-redemptions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const redemption = await storage.getLoyaltyRedemptionById(id);
    if (!redemption) {
      return res.status(404).json({ error: "Loyalty redemption not found" });
    }
    res.json(redemption);
  } catch (error) {
    console.error("Error fetching loyalty redemption:", error);
    res.status(500).json({ error: "Failed to fetch loyalty redemption" });
  }
});

router.patch("/loyalty-redemptions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateLoyaltyRedemption(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating loyalty redemption:", error);
    res.status(400).json({ error: error.message || "Failed to update loyalty redemption" });
  }
});

// ========================================================================
// Loyalty Tiers
// ========================================================================

router.get("/loyalty-tiers", isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    if (!garageId) return res.status(400).json({ message: "garageId is required" });
    const tiers = await storage.getLoyaltyTiers(garageId as string);
    res.json(tiers);
  } catch (error: any) {
    console.error("Error fetching loyalty tiers:", error);
    res.status(500).json({ message: "Failed to fetch loyalty tiers" });
  }
});

router.post("/loyalty-tiers", isAuthenticated, async (req: any, res) => {
  try {
    const tier = await storage.createLoyaltyTier(req.body);
    res.status(201).json(tier);
  } catch (error: any) {
    console.error("Error creating loyalty tier:", error);
    res.status(500).json({ message: "Failed to create loyalty tier" });
  }
});

router.patch("/loyalty-tiers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const tier = await storage.updateLoyaltyTier(req.params.id, req.body);
    res.json(tier);
  } catch (error: any) {
    console.error("Error updating loyalty tier:", error);
    res.status(500).json({ message: "Failed to update loyalty tier" });
  }
});

router.delete("/loyalty-tiers/:id", isAuthenticated, async (req: any, res) => {
  try {
    await storage.deleteLoyaltyTier(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting loyalty tier:", error);
    res.status(500).json({ message: "Failed to delete loyalty tier" });
  }
});

// ========================================================================
// Loyalty Offers
// ========================================================================

router.get("/loyalty-offers", isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, isActive } = req.query;
    const offers = await storage.getLoyaltyOffers(garageId as string, isActive === 'true');
    res.json(offers);
  } catch (error: any) {
    console.error("Error fetching loyalty offers:", error);
    res.status(500).json({ message: "Failed to fetch loyalty offers" });
  }
});

router.get("/loyalty-offers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const offer = await storage.getLoyaltyOffer(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  } catch (error: any) {
    console.error("Error fetching loyalty offer:", error);
    res.status(500).json({ message: "Failed to fetch loyalty offer" });
  }
});

router.post("/loyalty-offers", isAuthenticated, async (req: any, res) => {
  try {
    const offer = await storage.createLoyaltyOffer(req.body);
    res.status(201).json(offer);
  } catch (error: any) {
    console.error("Error creating loyalty offer:", error);
    res.status(500).json({ message: "Failed to create loyalty offer" });
  }
});

router.patch("/loyalty-offers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const offer = await storage.updateLoyaltyOffer(req.params.id, req.body);
    res.json(offer);
  } catch (error: any) {
    console.error("Error updating loyalty offer:", error);
    res.status(500).json({ message: "Failed to update loyalty offer" });
  }
});

router.delete("/loyalty-offers/:id", isAuthenticated, async (req: any, res) => {
  try {
    await storage.deleteLoyaltyOffer(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting loyalty offer:", error);
    res.status(500).json({ message: "Failed to delete loyalty offer" });
  }
});

export default router;
