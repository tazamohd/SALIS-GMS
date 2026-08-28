import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertBankAccountSchema, insertBankTransactionSchema } from "../../shared/schema";
import { z } from "zod";

const router = Router();

const patchSchema = z.object({
  accountName: z.string().min(1).optional(),
  bankName: z.string().min(1).optional(),
  accountNumber: z.string().min(1).optional(),
  iban: z.string().nullable().optional(),
  swiftCode: z.string().nullable().optional(),
  currency: z.string().optional(),
  accountType: z.enum(["checking", "savings", "business", "merchant"]).optional(),
  openingBalance: z.string().optional(),
  currentBalance: z.string().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

router.get("/bank-accounts", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const accounts = await storage.getBankAccounts(user.garageId);
    res.json(accounts);
  } catch (err) {
    console.error("[bank-accounts] list error:", err);
    res.status(500).json({ message: "Failed to fetch bank accounts" });
  }
});

router.post("/bank-accounts", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = insertBankAccountSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  try {
    const created = await storage.createBankAccount(user.garageId, parsed.data);
    res.status(201).json(created);
  } catch (err) {
    console.error("[bank-accounts] create error:", err);
    res.status(500).json({ message: "Failed to create bank account" });
  }
});

router.patch("/bank-accounts/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid patch", errors: parsed.error.flatten() });
  try {
    const updated = await storage.updateBankAccount(req.params.id, user.garageId, parsed.data);
    if (!updated) return res.status(404).json({ message: "Bank account not found" });
    res.json(updated);
  } catch (err) {
    console.error("[bank-accounts] update error:", err);
    res.status(500).json({ message: "Failed to update bank account" });
  }
});

router.get("/bank-transactions", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const accountId = req.query.selectedAccountId as string | undefined;
    const transactions = await storage.getBankTransactions(user.garageId, accountId);
    res.json(transactions);
  } catch (err) {
    console.error("[bank-transactions] list error:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

router.post("/bank-transactions", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = insertBankTransactionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  try {
    const created = await storage.createBankTransaction(user.garageId, parsed.data);
    res.status(201).json(created);
  } catch (err) {
    console.error("[bank-transactions] create error:", err);
    res.status(500).json({ message: "Failed to create transaction" });
  }
});

export const bankAccountRoutes = router;
