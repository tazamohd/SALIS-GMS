import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "../schema";

// External identity providers linked to an existing SALIS user.
// Supports Nafath (KSA national SSO), Absher, Google, Apple, OTP-only.
export const userIdentities = pgTable(
  "user_identities",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    provider: text("provider").notNull(), // nafath | absher | google | apple | otp
    externalId: text("external_id").notNull(),
    metadata: text("metadata"), // JSON blob from the IdP (tokens, claims)
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniqueProviderExternal: unique("uq_identity_provider_ext").on(
      t.provider,
      t.externalId,
    ),
    byUser: index("identity_user_idx").on(t.userId),
  }),
);

// Super-app membership: user ↔ tenant (garage | fleet | provider | platform) ↔ role.
// Replaces per-table role columns with a single universal membership model.
// SALIS's existing userRoleBranch remains for backwards compat; new flows use this.
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    tenantType: text("tenant_type").notNull(), // garage | fleet | provider | platform
    tenantId: uuid("tenant_id").notNull(),
    role: text("role").notNull(), // owner | manager | staff | driver | technician | viewer
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byUser: index("mem_user_idx").on(t.userId),
    byTenant: index("mem_tenant_idx").on(t.tenantType, t.tenantId),
  }),
);

// KYC verification records. One row per verification attempt.
export const kycVerifications = pgTable(
  "kyc_verifications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    provider: text("provider").notNull(), // nafath | absher | manual
    status: text("status").notNull().default("pending"), // pending | verified | rejected | expired
    verifiedAt: timestamp("verified_at"),
    expiresAt: timestamp("expires_at"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byUser: index("kyc_user_idx").on(t.userId),
  }),
);

export type UserIdentity = typeof userIdentities.$inferSelect;
export type InsertUserIdentity = typeof userIdentities.$inferInsert;
export const insertUserIdentitySchema = createInsertSchema(userIdentities).omit({
  id: true,
  createdAt: true,
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;
export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = typeof kycVerifications.$inferInsert;
export const insertKycVerificationSchema = createInsertSchema(kycVerifications).omit({
  id: true,
  createdAt: true,
});
