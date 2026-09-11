import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  accounts,
  ledgerTransactions,
  ledgerEntries,
  accountBalances,
} from "@shared/schema/index";
import type {
  InsertAccount,
  InsertLedgerTransaction,
  InsertLedgerEntry,
} from "@shared/schema/index";

interface EntryInput {
  accountId: string;
  direction: "debit" | "credit";
  amount: bigint;
}

interface CreateTransactionInput {
  type: string;
  reference?: string;
  description?: string;
  entries: EntryInput[];
}

export class LedgerService {
  async createAccount(input: InsertAccount) {
    const [account] = await db
      .insert(accounts)
      .values(input)
      .returning();

    await db.insert(accountBalances).values({
      accountId: account.id,
      balance: BigInt(0),
    });

    return account;
  }

  async getAccountBalance(accountId: string) {
    const [row] = await db
      .select()
      .from(accountBalances)
      .where(eq(accountBalances.accountId, accountId));
    return row?.balance ?? BigInt(0);
  }

  async postTransaction(input: CreateTransactionInput) {
    if (input.entries.length < 2) {
      throw new Error("A ledger transaction requires at least 2 entries");
    }

    let totalDebits = BigInt(0);
    let totalCredits = BigInt(0);
    for (const entry of input.entries) {
      if (entry.amount <= BigInt(0)) {
        throw new Error("Entry amount must be positive");
      }
      if (entry.direction === "debit") totalDebits += entry.amount;
      else totalCredits += entry.amount;
    }

    if (totalDebits !== totalCredits) {
      throw new Error(
        `Unbalanced transaction: debits=${totalDebits} credits=${totalCredits}`,
      );
    }

    return await db.transaction(async (tx: typeof db) => {
      const [txn] = await tx
        .insert(ledgerTransactions)
        .values({
          type: input.type,
          reference: input.reference,
          description: input.description,
          status: "posted",
        })
        .returning();

      const entryRows = input.entries.map((e) => ({
        txnId: txn.id,
        accountId: e.accountId,
        direction: e.direction,
        amount: e.amount,
      }));

      await tx.insert(ledgerEntries).values(entryRows);

      for (const entry of input.entries) {
        const delta =
          entry.direction === "credit" ? entry.amount : -entry.amount;

        await tx
          .update(accountBalances)
          .set({
            balance: sql`${accountBalances.balance} + ${delta}`,
            lastTxnId: txn.id,
            updatedAt: sql`now()`,
          })
          .where(eq(accountBalances.accountId, entry.accountId));
      }

      return txn;
    });
  }

  async getTransactionEntries(txnId: string) {
    return db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.txnId, txnId));
  }

  async getAccountEntries(accountId: string, limit = 50) {
    return db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.accountId, accountId))
      .orderBy(sql`${ledgerEntries.createdAt} desc`)
      .limit(limit);
  }
}

export const ledgerService = new LedgerService();
