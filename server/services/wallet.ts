import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { accounts } from "@shared/schema/index";
import { ledgerService } from "./ledger";

export class WalletService {
  async getOrCreateUserWallet(userId: string) {
    const [existing] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.ownerType, "user"),
          eq(accounts.ownerId, userId),
          eq(accounts.kind, "wallet"),
        ),
      );

    if (existing) return existing;

    return ledgerService.createAccount({
      ownerType: "user",
      ownerId: userId,
      kind: "wallet",
      currency: "SAR",
      status: "active",
    });
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateUserWallet(userId);
    return {
      accountId: wallet.id,
      balance: await ledgerService.getAccountBalance(wallet.id),
      currency: wallet.currency,
    };
  }

  async topUp(userId: string, amount: bigint, reference?: string) {
    const wallet = await this.getOrCreateUserWallet(userId);

    const [platformAccount] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.ownerType, "platform"),
          eq(accounts.kind, "receivable"),
        ),
      );

    if (!platformAccount) {
      throw new Error("Platform receivable account not configured");
    }

    return ledgerService.postTransaction({
      type: "topup",
      reference,
      description: `Wallet top-up for user ${userId}`,
      entries: [
        { accountId: platformAccount.id, direction: "debit", amount },
        { accountId: wallet.id, direction: "credit", amount },
      ],
    });
  }

  async pay(
    userId: string,
    providerId: string,
    amount: bigint,
    orderId: string,
  ) {
    const wallet = await this.getOrCreateUserWallet(userId);
    const balance = await ledgerService.getAccountBalance(wallet.id);

    if (balance < amount) {
      throw new Error("Insufficient wallet balance");
    }

    const [providerAccount] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.ownerType, "provider"),
          eq(accounts.ownerId, providerId),
          eq(accounts.kind, "receivable"),
        ),
      );

    if (!providerAccount) {
      throw new Error(`Provider account not found for ${providerId}`);
    }

    return ledgerService.postTransaction({
      type: "payment",
      reference: orderId,
      description: `Payment for order ${orderId}`,
      entries: [
        { accountId: wallet.id, direction: "debit", amount },
        { accountId: providerAccount.id, direction: "credit", amount },
      ],
    });
  }

  async getHistory(userId: string, limit = 50) {
    const wallet = await this.getOrCreateUserWallet(userId);
    return ledgerService.getAccountEntries(wallet.id, limit);
  }
}

export const walletService = new WalletService();
