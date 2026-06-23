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
import { providers, servicesCatalog } from "./catalog";
import { paymentIntents } from "./payment-intents";

// Shared order rail: every mini-app creates orders here. This is the flywheel
// join between consumer demand and SALIS/provider supply. Fleet maintenance,
// garage booking, parts purchase, roadside dispatch — all flow through orders.

export const orders = pgTable(
  "super_orders",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    providerId: uuid("provider_id").references(() => providers.id),
    miniApp: text("mini_app").notNull(),
    // booking | parts | roadside | fleet | insurance | rental | ride
    status: text("status").notNull().default("created"),
    // created | confirmed | in_progress | completed | cancelled | refunded
    total: bigint("total", { mode: "bigint" }), // minor units
    currency: text("currency").notNull().default("SAR"),
    paymentIntentId: uuid("payment_intent_id").references(
      () => paymentIntents.id,
    ),
    metadata: text("metadata"), // JSON: mini-app-specific data
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byUser: index("sord_user_idx").on(t.userId),
    byProvider: index("sord_provider_idx").on(t.providerId),
    byMiniApp: index("sord_miniapp_idx").on(t.miniApp),
  }),
);

export const orderItems = pgTable(
  "super_order_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id").references(() => servicesCatalog.id),
    description: text("description"),
    quantity: bigint("quantity", { mode: "bigint" }).notNull().default(BigInt(1)),
    unitPrice: bigint("unit_price", { mode: "bigint" }).notNull(), // minor units
    currency: text("currency").notNull().default("SAR"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byOrder: index("soi_order_idx").on(t.orderId),
  }),
);

// Audit trail + state machine: every status transition is recorded.
export const orderEvents = pgTable(
  "super_order_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actor: varchar("actor").references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byOrder: index("soe_order_idx").on(t.orderId),
  }),
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export type OrderEvent = typeof orderEvents.$inferSelect;
export type InsertOrderEvent = typeof orderEvents.$inferInsert;
export const insertOrderEventSchema = createInsertSchema(orderEvents).omit({
  id: true,
  createdAt: true,
});
