// @ts-nocheck
/**
 * Smart Contracts — backs /api/smart-contracts.
 * Thin alias over the existing storage.getSmartContracts/createSmartContract
 * (already used by /api/nextgen/smart-contracts), plus a new PATCH for status moves.
 */
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertSmartContractSchema } from "../../shared/schema";

const router = Router();

const STATUSES = ["draft", "pending_signature", "signed", "active", "executed", "completed"] as const;
const patchSchema = z.object({ status: z.enum(STATUSES) });

router.get("/smart-contracts", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const contracts = await storage.getSmartContracts(user.garageId);
    res.json(contracts);
  } catch (err) {
    console.error("[smart-contracts] list error:", err);
    res.status(500).json({ message: "Failed to fetch smart contracts" });
  }
});

router.post("/smart-contracts", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = insertSmartContractSchema.safeParse({ ...req.body, garageId: user.garageId });
  if (!parsed.success) return res.status(400).json({ message: "Invalid contract", errors: parsed.error.flatten() });
  try {
    const created = await storage.createSmartContract(parsed.data);
    res.status(201).json(created);
  } catch (err) {
    console.error("[smart-contracts] create error:", err);
    res.status(500).json({ message: "Failed to create smart contract" });
  }
});

router.patch("/smart-contracts/:id", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid status", errors: parsed.error.flatten() });
  try {
    const updated = await storage.updateSmartContractStatus(req.params.id, user.garageId, parsed.data.status);
    if (!updated) return res.status(404).json({ message: "Contract not found" });
    res.json(updated);
  } catch (err) {
    console.error("[smart-contracts] update error:", err);
    res.status(500).json({ message: "Failed to update contract status" });
  }
});

export const smartContractsRoutes = router;
