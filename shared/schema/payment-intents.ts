import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "../schema";
import { ledgerTransactions } from "./ledger";

// Payment intents bridge external PSPs (mada, STC Pay, Apple Pay, Stripe)
// to the internal ledger. A successful PSP webhook posts a ledger transaction.
// Wallet stored-value in KSA requires a SAMA-licensed PSP partner.

export const paymentIntents = pgTable(
  "payment_intents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id),
    provider: text("provider").notNull(), // stripe | mada | stcpay | applepay | paypal
    externalId: text("external_id"),
    amount: bigint("amount", { mode: "bigint" }).notNull(), // minor units
    currency: text("currency").notNull().default("SAR"),
    status: text("status").notNull().default("requires_payment"),
    // requires_payment | processing | succeeded | failed | cancelled | refunded
    ledgerTxnId: uuid("ledger_txn_id").references(() => ledgerTransactions.id),
    metadata: text("metadata"), // JSON: PSP-specific payload
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byUser: index("pi_user_idx").on(t.userId),
    byExternal: index("pi_external_idx").on(t.provider, t.externalId),
  }),
);

export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    providerId: uuid("provider_id").notNull(), // references catalog.providers
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    currency: text("currency").notNull().default("SAR"),
    status: text("status").notNull().default("pending"),
    // pending | processing | completed | failed
    externalRef: text("external_ref"),
    ledgerTxnId: uuid("ledger_txn_id").references(() => ledgerTransactions.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byProvider: index("payout_provider_idx").on(t.providerId),
  }),
);

export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type InsertPaymentIntent = typeof paymentIntents.$inferInsert;
export const insertPaymentIntentSchema = createInsertSchema(paymentIntents).omit(
  { id: true, createdAt: true, updatedAt: true },
);

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;
export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
});
