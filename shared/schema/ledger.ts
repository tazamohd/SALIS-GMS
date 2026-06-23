import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Double-entry ledger: the authoritative source of truth for all money in
// the super-app. Amounts are stored as integer minor units (halalas for SAR,
// cents for USD). Entries are immutable; corrections are posted as new
// reversal transactions. Balance = Σcredits − Σdebits per account.

export const accounts = pgTable(
  "ledger_accounts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ownerType: text("owner_type").notNull(), // user | provider | platform | escrow | tax
    ownerId: uuid("owner_id"), // null for platform/system accounts
    kind: text("kind").notNull(), // wallet | payable | receivable | revenue | tax | escrow
    currency: text("currency").notNull().default("SAR"),
    status: text("status").notNull().default("active"), // active | frozen | closed
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byOwner: index("acct_owner_idx").on(t.ownerType, t.ownerId),
  }),
);

export const ledgerTransactions = pgTable("ledger_transactions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // topup | payment | payout | refund | fee | hold | release
  reference: text("reference"), // order id, payout id, or external ref
  status: text("status").notNull().default("posted"), // posted | pending | reversed
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Immutable double-entry rows. Every transaction MUST have entries that sum
// to zero (total debits = total credits). Enforced at the application layer
// and verified by a periodic reconciliation job.
export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    txnId: uuid("txn_id")
      .notNull()
      .references(() => ledgerTransactions.id),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    direction: text("direction").notNull(), // debit | credit
    amount: bigint("amount", { mode: "bigint" }).notNull(), // minor units (halalas)
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byAccount: index("entry_acct_idx").on(t.accountId),
    byTxn: index("entry_txn_idx").on(t.txnId),
  }),
);

// Materialized balance for fast reads. Updated in the same DB transaction
// that inserts ledger entries. Stale-check via reconciliation.
export const accountBalances = pgTable(
  "account_balances",
  {
    accountId: uuid("account_id")
      .primaryKey()
      .references(() => accounts.id),
    balance: bigint("balance", { mode: "bigint" }).notNull().default(BigInt(0)),
    lastTxnId: uuid("last_txn_id").references(() => ledgerTransactions.id),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
);

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export type LedgerTransaction = typeof ledgerTransactions.$inferSelect;
export type InsertLedgerTransaction = typeof ledgerTransactions.$inferInsert;
export const insertLedgerTransactionSchema = createInsertSchema(
  ledgerTransactions,
).omit({ id: true, createdAt: true });

export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type InsertLedgerEntry = typeof ledgerEntries.$inferInsert;
export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({
  id: true,
  createdAt: true,
});

export type AccountBalance = typeof accountBalances.$inferSelect;
