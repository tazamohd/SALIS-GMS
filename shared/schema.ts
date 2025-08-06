import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// SaaS Plans
export const saasPlans = pgTable("saas_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  maxUsers: integer("max_users").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Garages
export const garages = pgTable("garages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  saasPlanId: uuid("saas_plan_id").references(() => saasPlans.id),
  workingHours: varchar("working_hours", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Branches
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Roles
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  scope: varchar("scope", { length: 100 }),
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  nationalId: varchar("national_id", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  accessEndDate: timestamp("access_end_date"),
  garageId: uuid("garage_id").references(() => garages.id),
  userType: varchar("user_type", { length: 50 }),
  // Keep these for Replit Auth compatibility
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Role Branch (Many-to-Many relationship)
export const userRoleBranch = pgTable("user_role_branch", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roleId: uuid("role_id").references(() => roles.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isPrimaryRole: boolean("is_primary_role").default(false),
});

// Profile tables
export const technicianProfiles = pgTable("technician_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  skills: text("skills"),
  isLead: boolean("is_lead").default(false),
  certifications: text("certifications"),
});

export const customerProfiles = pgTable("customer_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  address: varchar("address", { length: 500 }),
  nationality: varchar("nationality", { length: 100 }),
  preferredLanguage: varchar("preferred_language", { length: 50 }),
});

export const assistantProfiles = pgTable("assistant_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  assignedTasks: text("assigned_tasks"),
  trainingLevel: varchar("training_level", { length: 100 }),
});

// Logging tables
export const sessionLogs = pgTable("session_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  loginTime: timestamp("login_time").defaultNow(),
  logoutTime: timestamp("logout_time"),
  ipAddress: varchar("ip_address", { length: 45 }),
  deviceType: varchar("device_type", { length: 100 }),
  isImpersonated: boolean("is_impersonated").default(false),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security tables
export const mfaStatuses = pgTable("mfa_statuses", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  method: varchar("method", { length: 50 }),
  isEnabled: boolean("is_enabled").default(false),
  lastChangedAt: timestamp("last_changed_at").defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  channel: text("channel"),
  eventMap: text("event_map"),
  isLockedByAdmin: boolean("is_locked_by_admin").default(false),
});

// Feature flags
export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  flagName: varchar("flag_name", { length: 255 }).notNull(),
  isEnabled: boolean("is_enabled").default(false),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const garagesRelations = relations(garages, ({ one, many }) => ({
  saasPlan: one(saasPlans, {
    fields: [garages.saasPlanId],
    references: [saasPlans.id],
  }),
  branches: many(branches),
  users: many(users),
  featureFlags: many(featureFlags),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  garage: one(garages, {
    fields: [branches.garageId],
    references: [garages.id],
  }),
  userRoleBranches: many(userRoleBranch),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  garage: one(garages, {
    fields: [users.garageId],
    references: [garages.id],
  }),
  userRoleBranches: many(userRoleBranch),
  technicianProfile: one(technicianProfiles),
  customerProfile: one(customerProfiles),
  assistantProfile: one(assistantProfiles),
  sessionLogs: many(sessionLogs),
  activityLogs: many(activityLogs),
  mfaStatus: one(mfaStatuses),
  notificationPreferences: one(notificationPreferences),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoleBranches: many(userRoleBranch),
}));

export const userRoleBranchRelations = relations(userRoleBranch, ({ one }) => ({
  user: one(users, {
    fields: [userRoleBranch.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoleBranch.roleId],
    references: [roles.id],
  }),
  branch: one(branches, {
    fields: [userRoleBranch.branchId],
    references: [branches.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = createSelectSchema(users);
export const insertGarageSchema = createInsertSchema(garages);
export const selectGarageSchema = createSelectSchema(garages);
export const insertBranchSchema = createInsertSchema(branches);
export const selectBranchSchema = createSelectSchema(branches);
export const insertRoleSchema = createInsertSchema(roles);
export const selectRoleSchema = createSelectSchema(roles);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Garage = typeof garages.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type UserRoleBranch = typeof userRoleBranch.$inferSelect;
export type TechnicianProfile = typeof technicianProfiles.$inferSelect;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type AssistantProfile = typeof assistantProfiles.$inferSelect;
