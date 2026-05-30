import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  maxUsers: integer("max_users").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Garages
export const garages = pgTable("garages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  saasPlanId: uuid("saas_plan_id").references(() => saasPlans.id),
  workingHours: varchar("working_hours", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  // Subscription plan for feature gating: STARTER, PRO, ENTERPRISE
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("STARTER"),
});

// Branches
export const branches = pgTable("branches", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Roles
export const roles = pgTable("roles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  scope: varchar("scope", { length: 100 }),
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User storage table.
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  nationalId: varchar("national_id", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  accessEndDate: timestamp("access_end_date"),
  garageId: uuid("garage_id").references(() => garages.id),
  userType: varchar("user_type", { length: 50 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Role for access control: ADMIN, MANAGER, ADVISOR, TECHNICIAN, ACCOUNTANT
  role: varchar("role", { length: 50 }).default("ADVISOR"),
});

// User Role Branch (Many-to-Many relationship)
export const userRoleBranch = pgTable("user_role_branch", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  roleId: uuid("role_id")
    .references(() => roles.id)
    .notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isPrimaryRole: boolean("is_primary_role").default(false),
});

// Profile tables
export const technicianProfiles = pgTable("technician_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id),
  skills: text("skills"),
  isLead: boolean("is_lead").default(false),
  certifications: text("certifications"),
  qualifications: text("qualifications"), // Education, diplomas, degrees
  speciality: varchar("speciality", { length: 255 }), // Main area of expertise
  level: varchar("level", { length: 50 }).default("junior"), // "junior", "intermediate", "senior", "master"
  yearsOfExperience: integer("years_of_experience"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  schedule: jsonb("schedule"), // Working hours and availability {monday: {start: "08:00", end: "17:00", available: true}, ...}
  maxConcurrentJobs: integer("max_concurrent_jobs").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerProfiles = pgTable("customer_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id),
  address: varchar("address", { length: 500 }),
  nationality: varchar("nationality", { length: 100 }),
  preferredLanguage: varchar("preferred_language", { length: 50 }),
});

export const assistantProfiles = pgTable("assistant_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id),
  assignedTasks: text("assigned_tasks"),
  trainingLevel: varchar("training_level", { length: 100 }),
});

// Logging tables
export const sessionLogs = pgTable("session_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  loginTime: timestamp("login_time").defaultNow(),
  logoutTime: timestamp("logout_time"),
  ipAddress: varchar("ip_address", { length: 45 }),
  deviceType: varchar("device_type", { length: 100 }),
  isImpersonated: boolean("is_impersonated").default(false),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security tables
export const mfaStatuses = pgTable("mfa_statuses", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id),
  method: varchar("method", { length: 50 }),
  isEnabled: boolean("is_enabled").default(false),
  lastChangedAt: timestamp("last_changed_at").defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id),
  channel: text("channel"),
  eventMap: text("event_map"),
  isLockedByAdmin: boolean("is_locked_by_admin").default(false),
});

// Feature flags
export const featureFlags = pgTable("feature_flags", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
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

// Job Cards Schema - Module 8: Job Cards & Task Assignment
export const jobCards = pgTable("job_cards", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobNumber: varchar("job_number").notNull().unique(),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  customerId: varchar("customer_id"), // Will be connected to customers table later
  vehicleInfo: jsonb("vehicle_info").notNull(), // {make, model, year, licensePlate, vin}
  serviceType: varchar("service_type").notNull(), // "maintenance", "repair", "diagnostic", etc.
  description: text("description").notNull(),
  status: varchar("status").notNull().default("pending"), // "pending", "assigned", "in_progress", "completed", "cancelled"
  priority: varchar("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id), // Primary technician
  scheduledDate: timestamp("scheduled_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedCompletionAt: timestamp("estimated_completion_at"),
  etaLastCalculatedAt: timestamp("eta_last_calculated_at"),
  etaManualOverride: boolean("eta_manual_override").default(false),
  publicTrackingToken: varchar("public_tracking_token", { length: 64 }).unique(), // SHA-256 hash of UUID
  publicTrackingTokenExpiresAt: timestamp("public_tracking_token_expires_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  publicTrackingTokenIdx: index("job_cards_public_tracking_token_idx").on(table.publicTrackingToken),
}));

// Task Assignment Schema
export const taskAssignments = pgTable("task_assignments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id")
    .notNull()
    .references(() => jobCards.id),
  taskName: varchar("task_name").notNull(),
  taskType: varchar("task_type").notNull(), // "diagnostic", "repair", "assembly", "disassembly", "cleaning", "inspection"
  description: text("description").notNull(),
  assignedTo: varchar("assigned_to")
    .notNull()
    .references(() => users.id),
  assignedBy: varchar("assigned_by")
    .notNull()
    .references(() => users.id),
  userType: varchar("user_type").notNull(), // "technician", "assistant", "both"
  status: varchar("status").notNull().default("assigned"), // "assigned", "accepted", "rejected", "in_progress", "completed"
  priority: varchar("priority").notNull().default("medium"),
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes"),
  progressPercentage: integer("progress_percentage").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Progress Logs
export const taskProgressLogs = pgTable("task_progress_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  taskId: uuid("task_id")
    .notNull()
    .references(() => taskAssignments.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  progressPercentage: integer("progress_percentage").notNull(),
  stepDescription: text("step_description"),
  timeSpent: integer("time_spent"), // minutes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Tracking Events - Customer-facing status updates
export const jobTrackingEvents = pgTable("job_tracking_events", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id")
    .notNull()
    .references(() => jobCards.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => taskAssignments.id, { onDelete: "set null" }), // Optional task link
  eventType: varchar("event_type").notNull(), // "status_change", "eta_update", "message", "completed_task"
  title: varchar("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional structured data (e.g., old/new status, task details)
  isVisibleToCustomer: boolean("is_visible_to_customer").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobCardIdCreatedAtIdx: index("job_tracking_events_job_card_created_idx").on(table.jobCardId, table.createdAt),
  visibleEventsIdx: index("job_tracking_events_visible_idx").on(table.jobCardId).where(sql`${table.isVisibleToCustomer} = true`),
}));

// Job Card Parts - tracks parts used in a job card
export const jobCardParts = pgTable("job_card_parts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id")
    .notNull()
    .references(() => jobCards.id, { onDelete: "cascade" }),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  sparePartInventoryId: uuid("spare_part_inventory_id")
    .references(() => sparePartInventories.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }),
  isDeducted: boolean("is_deducted").default(false),
  deductedAt: timestamp("deducted_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type JobCardPart = typeof jobCardParts.$inferSelect;
export type InsertJobCardPart = typeof jobCardParts.$inferInsert;
export const insertJobCardPartSchema = createInsertSchema(jobCardParts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Service Templates - for common service types
export const serviceTemplates = pgTable("service_templates", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // "maintenance", "repair", "diagnostic"
  description: text("description"),
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }),
  standardCost: decimal("standard_cost", { precision: 10, scale: 2 }),
  taskSteps: jsonb("task_steps").notNull(), // Array of predefined steps
  requiredSkills: jsonb("required_skills"), // Array of skill requirements
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tools Schema - Module 7: Tool Management
export const tools = pgTable("tools", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  toolType: varchar("tool_type").notNull(), // "diagnostic", "mechanical", "electrical"
  brand: varchar("brand"),
  manufacturer: varchar("manufacturer"),
  tags: jsonb("tags"), // Array of tags
  compatibleVehicles: jsonb("compatible_vehicles"), // Array of vehicle models
  linkedServiceIds: jsonb("linked_service_ids"), // Array of service template IDs
  linkedPartIds: jsonb("linked_part_ids"), // Array of spare part IDs
  media: jsonb("media"), // Array of image/video URLs
  documents: jsonb("documents"), // Array of document URLs
  isGlobal: boolean("is_global").default(false), // Shared globally or local
  visibility: varchar("visibility").default("private"), // "public", "private", "shared"
  editableBy: varchar("editable_by").default("garage_admin"), // "saas_admin", "garage_admin"
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tool Availability - tracks tool inventory per garage/branch
export const toolAvailability = pgTable("tool_availability", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  toolId: uuid("tool_id")
    .notNull()
    .references(() => tools.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  quantity: integer("quantity").default(1),
  status: varchar("status").default("available"), // "available", "in_use", "under_maintenance"
  allowOverrideFields: boolean("allow_override_fields").default(false),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tool Usage Logs - tracks when tools are used in job cards
export const toolUsageLogs = pgTable("tool_usage_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  toolId: uuid("tool_id")
    .notNull()
    .references(() => tools.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  taskId: uuid("task_id").references(() => taskAssignments.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 12: Spare Parts & Inventory Management
export const spareParts = pgTable("spare_parts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // "engine", "brakes", "electrical", "fluids", "filters"
  subcategory: varchar("subcategory"),
  brand: varchar("brand"),
  manufacturer: varchar("manufacturer"),
  sku: varchar("sku").notNull().unique(),
  barcode: varchar("barcode"),
  partType: varchar("part_type").notNull().default("generic"), // "oem", "generic", "consumable"
  unitOfMeasure: varchar("unit_of_measure").default("pcs"), // "pcs", "liters", "kg", "boxes"
  compatibleVehicles: jsonb("compatible_vehicles"), // Array of vehicle models
  linkedServiceIds: jsonb("linked_service_ids"), // Array of service template IDs
  linkedToolIds: jsonb("linked_tool_ids"), // Array of tool IDs
  tags: jsonb("tags"), // Array of tags
  media: jsonb("media"), // Array of image URLs
  documents: jsonb("documents"), // Array of document URLs
  notes: text("notes"),
  isGlobal: boolean("is_global").default(false),
  visibility: varchar("visibility").default("private"), // "public", "private", "shared"
  editableBy: varchar("editable_by").default("garage_admin"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spare Part Inventory - tracks inventory per garage
export const sparePartInventories = pgTable("spare_part_inventories", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  stockQuantity: integer("stock_quantity").default(0),
  minThreshold: integer("min_threshold").default(5),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  purchaseTaxRate: decimal("purchase_tax_rate", {
    precision: 5,
    scale: 2,
  }).default("0"),
  saleTaxRate: decimal("sale_tax_rate", { precision: 5, scale: 2 }).default(
    "0",
  ),
  location: varchar("location"), // Storage location (shelf, bin, etc.)
  lastRestockedAt: timestamp("last_restocked_at"),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 10: Customer Management - Vehicles
export const vehicles = pgTable("vehicles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  licensePlate: varchar("license_plate", { length: 50 }).notNull(),
  vin: varchar("vin", { length: 100 }),
  color: varchar("color", { length: 50 }),
  mileage: integer("mileage"),
  engineType: varchar("engine_type", { length: 100 }), // "gasoline", "diesel", "electric", "hybrid"
  transmissionType: varchar("transmission_type", { length: 50 }), // "automatic", "manual"

  // Warranty tracking
  warrantyProvider: varchar("warranty_provider", { length: 255 }),
  warrantyType: varchar("warranty_type", { length: 100 }), // "manufacturer", "extended", "powertrain", "bumper-to-bumper"
  warrantyStartDate: timestamp("warranty_start_date"),
  warrantyEndDate: timestamp("warranty_end_date"),
  warrantyMileageLimit: integer("warranty_mileage_limit"),
  warrantyNotes: text("warranty_notes"),

  // Vehicle photos
  photos: text("photos").array(), // Array of image URLs

  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicle Service History - tracks all services performed on a vehicle
export const vehicleServiceHistory = pgTable("vehicle_service_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  serviceDate: timestamp("service_date").notNull(),
  serviceType: varchar("service_type", { length: 255 }).notNull(),
  description: text("description"),
  mileageAtService: integer("mileage_at_service"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  performedBy: varchar("performed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Maintenance Schedules - manufacturer recommended maintenance
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  description: text("description"),
  intervalType: varchar("interval_type").notNull(), // "mileage", "time", "both"
  intervalMileage: integer("interval_mileage"), // Miles between services
  intervalMonths: integer("interval_months"), // Months between services
  lastServiceDate: timestamp("last_service_date"),
  lastServiceMileage: integer("last_service_mileage"),
  nextDueDate: timestamp("next_due_date"),
  nextDueMileage: integer("next_due_mileage"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Reminders - automated reminders for upcoming services
export const serviceReminders = pgTable("service_reminders", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id), // Customer-scoped for client portal
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  maintenanceScheduleId: uuid("maintenance_schedule_id").references(
    () => maintenanceSchedules.id,
    { onDelete: "cascade" },
  ),
  reminderType: varchar("reminder_type").notNull(), // "mileage", "date", "both"
  reminderTitle: varchar("reminder_title", { length: 255 }).notNull(),
  reminderMessage: text("reminder_message"),
  triggerMileage: integer("trigger_mileage"), // Trigger when vehicle reaches this mileage
  triggerDate: timestamp("trigger_date"), // Trigger on specific date
  advanceDays: integer("advance_days").default(7), // Days before due date to send reminder
  advanceMiles: integer("advance_miles").default(500), // Miles before due mileage to send reminder
  status: varchar("status").default("pending"), // "pending", "sent", "acknowledged", "completed"
  sentAt: timestamp("sent_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Notes - for tracking customer interactions
export const customerNotes = pgTable("customer_notes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  noteType: varchar("note_type", { length: 50 }).notNull(), // "general", "complaint", "feedback", "reminder"
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isImportant: boolean("is_important").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Signatures - digital signatures for service approvals
export const serviceSignatures = pgTable("service_signatures", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id")
    .notNull()
    .references(() => jobCards.id),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  signatureData: text("signature_data").notNull(),
  signedAt: timestamp("signed_at").defaultNow(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Chat Messages - chat between customers and garage during service
export const serviceChatMessages = pgTable("service_chat_messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id")
    .notNull()
    .references(() => jobCards.id),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // "customer" or "garage"
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Reviews - customer reviews for completed services
export const serviceReviews = pgTable("service_reviews", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id")
    .notNull()
    .references(() => jobCards.id),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  categories: jsonb("categories"), // {service_quality, communication, pricing, etc}
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 9: Appointments & Scheduling
export const appointments = pgTable("appointments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appointmentNumber: varchar("appointment_number").notNull().unique(),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  customerId: varchar("customer_id").references(() => users.id),
  customerName: varchar("customer_name").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  customerEmail: varchar("customer_email"),
  vehicleInfo: jsonb("vehicle_info").notNull(), // {make, model, year, licensePlate}
  serviceType: varchar("service_type").notNull(), // "maintenance", "repair", "diagnostic", "inspection"
  description: text("description"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull().default(60), // Duration in minutes
  status: varchar("status").notNull().default("scheduled"), // "scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"
  assignedTo: varchar("assigned_to").references(() => users.id), // Assigned technician
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointment Status History - track all status changes
export const appointmentStatusHistory = pgTable("appointment_status_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id),
  previousStatus: varchar("previous_status"),
  newStatus: varchar("new_status").notNull(),
  changedBy: varchar("changed_by")
    .notNull()
    .references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointment Reminders - automated reminder tracking
export const appointmentReminders = pgTable("appointment_reminders", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id),
  reminderType: varchar("reminder_type").notNull(), // "sms", "email", "push"
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: varchar("status").notNull().default("pending"), // "pending", "sent", "failed"
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 23: Estimates & Quotes
export const estimates = pgTable("estimates", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  estimateNumber: varchar("estimate_number", { length: 50 }).notNull().unique(),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  vehicleInfo: jsonb("vehicle_info"), // {make, model, year, licensePlate}
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("draft"), // "draft", "sent", "viewed", "approved", "rejected", "expired", "converted"
  subtotal: decimal("subtotal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  validUntil: timestamp("valid_until"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  convertedToJobCardId: uuid("converted_to_job_card_id").references(
    () => jobCards.id,
  ),
  convertedToInvoiceId: uuid("converted_to_invoice_id").references(
    () => invoices.id,
  ),
  notes: text("notes"),
  terms: text("terms"), // Terms and conditions
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const estimateItems = pgTable("estimate_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  estimateId: uuid("estimate_id")
    .notNull()
    .references(() => estimates.id, { onDelete: "cascade" }),
  itemType: varchar("item_type").notNull(), // "service", "part", "labor", "other"
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }), // For profit margin analysis
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  discountId: uuid("discount_id").references(() => discountsPromotions.id), // Applied discount
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }), // Calculated discount
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 11: Purchase Orders & Supplier Integration
export const suppliers = pgTable("suppliers", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  paymentTerms: varchar("payment_terms", { length: 100 }), // "net30", "net60", "cod"
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  status: varchar("status").notNull().default("draft"), // "draft", "sent", "confirmed", "partial", "received", "cancelled"
  subtotal: decimal("subtotal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  purchaseOrderId: uuid("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  partNumber: varchar("part_number", { length: 100 }),
  partName: varchar("part_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull(),
  receivedQuantity: integer("received_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 12: Invoice & Billing
export const invoices = pgTable("invoices", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  invoiceDate: timestamp("invoice_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status").notNull().default("draft"), // "draft", "sent", "paid", "overdue", "cancelled"
  subtotal: decimal("subtotal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  balanceAmount: decimal("balance_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 50 }).notNull(), // "service", "part", "labor"
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }), // For profit margin analysis
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  discountId: uuid("discount_id").references(() => discountsPromotions.id), // Applied discount
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }), // Calculated discount
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // "cash", "card", "transfer", "check"
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 21: Notifications & Communication
export const notifications = pgTable("notifications", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull(), // "email", "sms", "in-app", "push"
  category: varchar("category", { length: 50 }).notNull(), // "appointment", "invoice", "job_completed", "feedback_request", "general"
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "sent", "delivered", "failed", "read"
  recipientId: varchar("recipient_id")
    .notNull()
    .references(() => users.id),
  garageId: uuid("garage_id").references(() => garages.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // Additional data: appointmentId, invoiceId, jobCardId, etc.
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Schedules - For automated/scheduled notifications
export const notificationSchedules = pgTable("notification_schedules", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  triggerType: varchar("trigger_type").notNull(), // "appointment_24h_before", "appointment_1h_before", "job_completed", "invoice_created", etc.
  channels: jsonb("channels").notNull(), // ["email", "sms", "in-app"] - which channels to use
  isEnabled: boolean("is_enabled").default(true),
  templateData: jsonb("template_data"), // Template customization per garage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type JobCard = typeof jobCards.$inferSelect;
export type InsertJobCard = typeof jobCards.$inferInsert;
export const insertJobCardSchema = createInsertSchema(jobCards);
export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;
export type TaskProgressLog = typeof taskProgressLogs.$inferSelect;
export type InsertTaskProgressLog = typeof taskProgressLogs.$inferInsert;
export type JobTrackingEvent = typeof jobTrackingEvents.$inferSelect;
export type InsertJobTrackingEvent = typeof jobTrackingEvents.$inferInsert;
export const insertJobTrackingEventSchema = createInsertSchema(jobTrackingEvents).omit({
  id: true,
  createdAt: true,
});
export type ServiceTemplate = typeof serviceTemplates.$inferSelect;
export type InsertServiceTemplate = typeof serviceTemplates.$inferInsert;
export const insertServiceTemplateSchema = createInsertSchema(
  serviceTemplates,
).omit({ id: true, createdAt: true, updatedAt: true });
export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;
export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export type ToolAvailability = typeof toolAvailability.$inferSelect;
export type InsertToolAvailability = typeof toolAvailability.$inferInsert;
export type SparePart = typeof spareParts.$inferSelect;
export type InsertSparePart = typeof spareParts.$inferInsert;
export const insertSparePartSchema = createInsertSchema(spareParts).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export type SparePartInventory = typeof sparePartInventories.$inferSelect;
export type InsertSparePartInventory = typeof sparePartInventories.$inferInsert;
export const insertSparePartInventorySchema = createInsertSchema(
  sparePartInventories,
).omit({ id: true, createdAt: true, updatedAt: true });
export type ToolUsageLog = typeof toolUsageLogs.$inferSelect;
export type InsertToolUsageLog = typeof toolUsageLogs.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  appointmentNumber: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export type AppointmentStatusHistory =
  typeof appointmentStatusHistory.$inferSelect;
export type InsertAppointmentStatusHistory =
  typeof appointmentStatusHistory.$inferInsert;
export type AppointmentReminder = typeof appointmentReminders.$inferSelect;
export type InsertAppointmentReminder =
  typeof appointmentReminders.$inferInsert;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VehicleServiceHistory = typeof vehicleServiceHistory.$inferSelect;
export type InsertVehicleServiceHistory =
  typeof vehicleServiceHistory.$inferInsert;
export const insertVehicleServiceHistorySchema = createInsertSchema(
  vehicleServiceHistory,
).omit({ id: true, createdAt: true });

export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule =
  typeof maintenanceSchedules.$inferInsert;
export const insertMaintenanceScheduleSchema = createInsertSchema(
  maintenanceSchedules,
).omit({ id: true, createdAt: true, updatedAt: true });

export type ServiceReminder = typeof serviceReminders.$inferSelect;
export type InsertServiceReminder = typeof serviceReminders.$inferInsert;
export const insertServiceReminderSchema = createInsertSchema(
  serviceReminders,
).omit({ id: true, createdAt: true, updatedAt: true });

export type CustomerNote = typeof customerNotes.$inferSelect;
export type InsertCustomerNote = typeof customerNotes.$inferInsert;
export const insertCustomerNoteSchema = createInsertSchema(customerNotes).omit({
  id: true,
  createdBy: true,
  createdAt: true,
});

export type ServiceSignature = typeof serviceSignatures.$inferSelect;
export type InsertServiceSignature = typeof serviceSignatures.$inferInsert;
export const insertServiceSignatureSchema = createInsertSchema(serviceSignatures).omit({
  id: true,
  createdAt: true,
  signedAt: true,
});

export type ServiceChatMessage = typeof serviceChatMessages.$inferSelect;
export type InsertServiceChatMessage = typeof serviceChatMessages.$inferInsert;
export const insertServiceChatMessageSchema = createInsertSchema(serviceChatMessages).omit({
  id: true,
  createdAt: true,
});

export type ServiceReview = typeof serviceReviews.$inferSelect;
export type InsertServiceReview = typeof serviceReviews.$inferInsert;
export const insertServiceReviewSchema = createInsertSchema(serviceReviews).omit({
  id: true,
  createdAt: true,
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export const insertPurchaseOrderSchema = createInsertSchema(
  purchaseOrders,
).omit({
  id: true,
  poNumber: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export const insertPurchaseOrderItemSchema = createInsertSchema(
  purchaseOrderItems,
).omit({ id: true, createdAt: true });

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdBy: true,
  createdAt: true,
});

export type Garage = typeof garages.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type UserRoleBranch = typeof userRoleBranch.$inferSelect;
export type TechnicianProfile = typeof technicianProfiles.$inferSelect;
export type InsertTechnicianProfile = typeof technicianProfiles.$inferInsert;
export const insertTechnicianProfileSchema = createInsertSchema(
  technicianProfiles,
).omit({ createdAt: true, updatedAt: true });
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type AssistantProfile = typeof assistantProfiles.$inferSelect;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NotificationSchedule = typeof notificationSchedules.$inferSelect;
export type InsertNotificationSchedule = typeof notificationSchedules.$inferInsert;
export const insertNotificationScheduleSchema = createInsertSchema(notificationSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Estimate = typeof estimates.$inferSelect;
export type InsertEstimate = typeof estimates.$inferInsert;
export const insertEstimateSchema = createInsertSchema(estimates).omit({
  id: true,
  estimateNumber: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});
export type EstimateItem = typeof estimateItems.$inferSelect;
export type InsertEstimateItem = typeof estimateItems.$inferInsert;
export const insertEstimateItemSchema = createInsertSchema(estimateItems).omit({
  id: true,
  createdAt: true,
});

// Technician Availability - Module 26: Scheduling & Calendar
export const technicianAvailability = pgTable("technician_availability", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id")
    .notNull()
    .references(() => users.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  dayOfWeek: integer("day_of_week"), // 0-6 (Sunday-Saturday), null for specific dates
  startDate: timestamp("start_date"), // For specific date ranges
  endDate: timestamp("end_date"),
  startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "17:00"
  isAvailable: boolean("is_available").default(true), // true = working, false = time off
  availabilityType: varchar("availability_type", { length: 50 }).notNull(), // "working_hours", "time_off", "break", "meeting"
  reason: text("reason"), // Reason for time off or special event
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring Appointments - Module 26: Scheduling & Calendar
export const recurringAppointments = pgTable("recurring_appointments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  customerId: varchar("customer_id").references(() => users.id),
  customerName: varchar("customer_name").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  customerEmail: varchar("customer_email"),
  vehicleInfo: jsonb("vehicle_info").notNull(),
  serviceType: varchar("service_type").notNull(),
  description: text("description"),
  duration: integer("duration").notNull().default(60),
  assignedTo: varchar("assigned_to").references(() => users.id),
  recurrencePattern: varchar("recurrence_pattern", { length: 50 }).notNull(), // "daily", "weekly", "biweekly", "monthly"
  recurrenceInterval: integer("recurrence_interval").default(1), // Every X days/weeks/months
  dayOfWeek: integer("day_of_week"), // For weekly patterns (0-6)
  dayOfMonth: integer("day_of_month"), // For monthly patterns (1-31)
  startTime: varchar("start_time", { length: 5 }).notNull(), // "14:00"
  startDate: timestamp("start_date").notNull(), // When recurrence starts
  endDate: timestamp("end_date"), // When recurrence ends (null = indefinite)
  maxOccurrences: integer("max_occurrences"), // Alternative to endDate
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Events - Module 26: Scheduling & Calendar
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // "blocked_time", "meeting", "holiday", "maintenance", "training"
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  affectedTechnicians: jsonb("affected_technicians"), // Array of technician IDs, null = all
  isAllDay: boolean("is_all_day").default(false),
  color: varchar("color", { length: 7 }).default("#000000"), // Hex color for calendar display
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TechnicianAvailability = typeof technicianAvailability.$inferSelect;
export type InsertTechnicianAvailability =
  typeof technicianAvailability.$inferInsert;
export const insertTechnicianAvailabilitySchema = createInsertSchema(
  technicianAvailability,
).omit({ id: true, createdAt: true, updatedAt: true });

export type RecurringAppointment = typeof recurringAppointments.$inferSelect;
export type InsertRecurringAppointment =
  typeof recurringAppointments.$inferInsert;
export const insertRecurringAppointmentSchema = createInsertSchema(
  recurringAppointments,
).omit({ id: true, createdBy: true, createdAt: true, updatedAt: true });

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
export const insertCalendarEventSchema = createInsertSchema(
  calendarEvents,
).omit({ id: true, createdBy: true, createdAt: true, updatedAt: true });

// Module 27: Inventory & Parts Management
// Stock Alerts - Low stock alert configurations
export const stockAlerts = pgTable("stock_alerts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // "low_stock", "out_of_stock", "expiring_soon"
  threshold: integer("threshold").notNull(),
  currentQuantity: integer("current_quantity").notNull(),
  alertStatus: varchar("alert_status", { length: 50 }).default("active"), // "active", "acknowledged", "resolved"
  notifiedUsers: jsonb("notified_users"), // Array of user IDs who were notified
  lastNotifiedAt: timestamp("last_notified_at"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reorder Settings - Automatic reordering configuration
export const reorderSettings = pgTable("reorder_settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  isAutoReorderEnabled: boolean("is_auto_reorder_enabled").default(false),
  reorderPoint: integer("reorder_point").notNull(), // Quantity threshold to trigger reorder
  reorderQuantity: integer("reorder_quantity").notNull(), // Quantity to order
  maxStockLevel: integer("max_stock_level"), // Maximum stock to maintain
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  leadTimeDays: integer("lead_time_days").default(7), // Expected delivery time
  lastReorderDate: timestamp("last_reorder_date"),
  nextReorderDate: timestamp("next_reorder_date"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing History - Track price changes over time
export const pricingHistory = pgTable("pricing_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  priceType: varchar("price_type", { length: 50 }).notNull(), // "purchase", "selling", "cost"
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  changeReason: varchar("change_reason", { length: 255 }), // "market_adjustment", "supplier_change", "promotion", "manual"
  notes: text("notes"),
  effectiveDate: timestamp("effective_date").defaultNow(),
  changedBy: varchar("changed_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory Audit Trail - Track all inventory changes
export const inventoryAuditTrail = pgTable("inventory_audit_trail", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  actionType: varchar("action_type", { length: 50 }).notNull(), // "add", "remove", "adjust", "transfer", "purchase", "sale", "return", "damage", "theft"
  quantityBefore: integer("quantity_before").notNull(),
  quantityChange: integer("quantity_change").notNull(), // Positive for add, negative for remove
  quantityAfter: integer("quantity_after").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  referenceType: varchar("reference_type", { length: 50 }), // "job_card", "purchase_order", "invoice", "transfer", "manual"
  referenceId: uuid("reference_id"), // ID of the related document
  reason: varchar("reason", { length: 255 }),
  notes: text("notes"),
  performedBy: varchar("performed_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory Transfers - Multi-location inventory movement
export const inventoryTransfers = pgTable("inventory_transfers", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(),
  sparePartId: uuid("spare_part_id")
    .notNull()
    .references(() => spareParts.id),
  fromGarageId: uuid("from_garage_id")
    .notNull()
    .references(() => garages.id),
  fromBranchId: uuid("from_branch_id").references(() => branches.id),
  toGarageId: uuid("to_garage_id")
    .notNull()
    .references(() => garages.id),
  toBranchId: uuid("to_branch_id").references(() => branches.id),
  quantity: integer("quantity").notNull(),
  transferStatus: varchar("transfer_status", { length: 50 }).default("pending"), // "pending", "in_transit", "completed", "cancelled"
  requestedBy: varchar("requested_by")
    .notNull()
    .references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  completedBy: varchar("completed_by").references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  shippedAt: timestamp("shipped_at"),
  completedAt: timestamp("completed_at"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  reason: varchar("reason", { length: 255 }),
  notes: text("notes"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TecDoc Integration Cache - Cache TecDoc API responses
export const tecDocCache = pgTable("tecdoc_cache", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  searchQuery: varchar("search_query", { length: 500 }).notNull(),
  searchType: varchar("search_type", { length: 50 }).notNull(), // "part_number", "vin", "vehicle_model"
  response: jsonb("response").notNull(), // Cached API response
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = typeof stockAlerts.$inferInsert;
export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ReorderSetting = typeof reorderSettings.$inferSelect;
export type InsertReorderSetting = typeof reorderSettings.$inferInsert;
export const insertReorderSettingSchema = createInsertSchema(
  reorderSettings,
).omit({ id: true, createdBy: true, createdAt: true, updatedAt: true });

export type PricingHistory = typeof pricingHistory.$inferSelect;
export type InsertPricingHistory = typeof pricingHistory.$inferInsert;
export const insertPricingHistorySchema = createInsertSchema(
  pricingHistory,
).omit({ id: true, createdAt: true });

export type InventoryAuditTrail = typeof inventoryAuditTrail.$inferSelect;
export type InsertInventoryAuditTrail = typeof inventoryAuditTrail.$inferInsert;
export const insertInventoryAuditTrailSchema = createInsertSchema(
  inventoryAuditTrail,
).omit({ id: true, createdAt: true });

export type InventoryTransfer = typeof inventoryTransfers.$inferSelect;
export type InsertInventoryTransfer = typeof inventoryTransfers.$inferInsert;
export const insertInventoryTransferSchema = createInsertSchema(
  inventoryTransfers,
).omit({ id: true, transferNumber: true, createdAt: true, updatedAt: true });

export type TecDocCache = typeof tecDocCache.$inferSelect;
export type InsertTecDocCache = typeof tecDocCache.$inferInsert;

// Module 28: Advanced Financial Features
// Payment Plans - Installment payment tracking
export const paymentPlans = pgTable("payment_plans", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  numberOfInstallments: integer("number_of_installments").notNull(),
  installmentAmount: decimal("installment_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull().default("monthly"), // "weekly", "biweekly", "monthly"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // "active", "completed", "defaulted", "cancelled"
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Installments - Individual payment schedule
export const installments = pgTable("installments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  paymentPlanId: uuid("payment_plan_id")
    .notNull()
    .references(() => paymentPlans.id, { onDelete: "cascade" }),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "paid", "partial", "overdue"
  paidAt: timestamp("paid_at"),
  paymentId: uuid("payment_id").references(() => payments.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Refunds - Refund management
export const refunds = pgTable("refunds", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  refundNumber: varchar("refund_number", { length: 50 }).notNull().unique(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  paymentId: uuid("payment_id").references(() => payments.id),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  refundMethod: varchar("refund_method", { length: 50 }).notNull(), // "original_payment", "cash", "store_credit", "bank_transfer"
  reason: varchar("reason", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "approved", "processed", "rejected", "cancelled"
  requestedBy: varchar("requested_by")
    .notNull()
    .references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  processedBy: varchar("processed_by").references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax Configurations - Automated tax calculation rules
export const taxConfigurations = pgTable("tax_configurations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  taxName: varchar("tax_name", { length: 100 }).notNull(),
  taxType: varchar("tax_type", { length: 50 }).notNull(), // "percentage", "fixed", "tiered"
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  applicableCategories: text("applicable_categories").array(), // ["service", "parts", "labor"]
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }),
  region: varchar("region", { length: 100 }), // State/province for location-based tax
  zipCodes: text("zip_codes").array(), // Specific zip codes for tax application
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discounts & Promotions - Promotional pricing rules
export const discountsPromotions = pgTable("discounts_promotions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // "percentage", "fixed_amount", "buy_x_get_y"
  discountValue: decimal("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  minPurchaseAmount: decimal("min_purchase_amount", {
    precision: 10,
    scale: 2,
  }),
  maxDiscountAmount: decimal("max_discount_amount", {
    precision: 10,
    scale: 2,
  }),
  applicableCategories: text("applicable_categories").array(), // ["service", "parts", "labor"]
  applicableServices: text("applicable_services").array(), // Specific service IDs
  applicableParts: text("applicable_parts").array(), // Specific part IDs
  usageLimit: integer("usage_limit"), // Total usage limit
  usageCount: integer("usage_count").notNull().default(0),
  perCustomerLimit: integer("per_customer_limit"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discount Usage Tracking
export const discountUsage = pgTable("discount_usage", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  discountId: uuid("discount_id")
    .notNull()
    .references(() => discountsPromotions.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  estimateId: uuid("estimate_id").references(() => estimates.id),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => users.id),
  discountAmount: decimal("discount_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  appliedAt: timestamp("applied_at").defaultNow(),
});

// ============= Module 29: Search & Filtering =============

// Saved Filter Presets
export const savedFilterPresets = pgTable("saved_filter_presets", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // "job_cards", "invoices", "customers", etc.
  filterConfig: jsonb("filter_config").notNull(), // Stores the filter configuration {field: "status", operator: "equals", value: "completed"}
  isGlobal: boolean("is_global").notNull().default(false), // If true, shared with all users in garage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export Jobs (for tracking async export operations)
export const exportJobs = pgTable("export_jobs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  module: varchar("module", { length: 50 }).notNull(), // Module being exported
  format: varchar("format", { length: 20 }).notNull(), // "csv", "json", "excel"
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "processing", "completed", "failed"
  fileName: varchar("file_name", { length: 255 }),
  fileUrl: text("file_url"), // S3 or local storage URL
  filterConfig: jsonb("filter_config"), // Optional filters applied to export
  recordCount: integer("record_count"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// ============= Module 31: Staff & HR Management =============

// Employee Attendance
export const employeeAttendance = pgTable("employee_attendance", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  employeeId: varchar("employee_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull().default("present"), // "present", "absent", "late", "half_day", "on_leave"
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift Templates
export const shiftTemplates = pgTable("shift_templates", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  name: varchar("name", { length: 100 }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 10 }).notNull(), // "17:00"
  breakDuration: integer("break_duration").notNull().default(60), // in minutes
  daysOfWeek: text("days_of_week").array().notNull(), // ["monday", "tuesday", ...]
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift Assignments
export const shiftAssignments = pgTable("shift_assignments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  employeeId: varchar("employee_id")
    .notNull()
    .references(() => users.id),
  shiftTemplateId: uuid("shift_template_id").references(
    () => shiftTemplates.id,
  ),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"), // "scheduled", "completed", "cancelled", "no_show"
  notes: text("notes"),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission Rules
export const commissionRules = pgTable("commission_rules", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ruleType: varchar("rule_type", { length: 30 }).notNull(), // "percentage", "fixed_per_job", "tiered"
  basePercentage: decimal("base_percentage", { precision: 5, scale: 2 }), // For percentage type
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }), // For fixed type
  tierConfig: jsonb("tier_config"), // For tiered: [{minRevenue: 0, maxRevenue: 1000, percentage: 5}, ...]
  applicableServices: text("applicable_services").array(), // Specific service types
  minJobValue: decimal("min_job_value", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calculated Commissions
export const commissions = pgTable("commissions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  technicianId: varchar("technician_id")
    .notNull()
    .references(() => users.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  commissionRuleId: uuid("commission_rule_id").references(
    () => commissionRules.id,
  ),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(), // Job/Invoice amount
  commissionAmount: decimal("commission_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // Percentage used
  period: varchar("period", { length: 20 }).notNull(), // "2025-01" for monthly
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "approved", "paid"
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance Reviews
export const performanceReviews = pgTable("performance_reviews", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  employeeId: varchar("employee_id")
    .notNull()
    .references(() => users.id),
  reviewerId: varchar("reviewer_id")
    .notNull()
    .references(() => users.id),
  reviewPeriod: varchar("review_period", { length: 50 }).notNull(), // "Q1 2025", "2024-Annual"
  overallRating: decimal("overall_rating", {
    precision: 3,
    scale: 2,
  }).notNull(), // 1.00 to 5.00
  technicalSkills: decimal("technical_skills", { precision: 3, scale: 2 }),
  customerService: decimal("customer_service", { precision: 3, scale: 2 }),
  teamwork: decimal("teamwork", { precision: 3, scale: 2 }),
  punctuality: decimal("punctuality", { precision: 3, scale: 2 }),
  productivity: decimal("productivity", { precision: 3, scale: 2 }),
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  goals: text("goals"), // Goals for next period
  comments: text("comments"),
  employeeComments: text("employee_comments"), // Employee's response
  status: varchar("status", { length: 20 }).notNull().default("draft"), // "draft", "submitted", "acknowledged"
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training & Certifications
export const trainings = pgTable("trainings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  provider: varchar("provider", { length: 200 }),
  trainingType: varchar("training_type", { length: 50 }).notNull(), // "certification", "workshop", "online_course", "on_job"
  duration: integer("duration"), // in hours
  cost: decimal("cost", { precision: 10, scale: 2 }),
  isRecurring: boolean("is_recurring").notNull().default(false),
  validityPeriod: integer("validity_period"), // in months, for certifications
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Training Records
export const employeeTrainings = pgTable("employee_trainings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .notNull()
    .references(() => garages.id),
  employeeId: varchar("employee_id")
    .notNull()
    .references(() => users.id),
  trainingId: uuid("training_id")
    .notNull()
    .references(() => trainings.id),
  status: varchar("status", { length: 20 }).notNull().default("enrolled"), // "enrolled", "in_progress", "completed", "failed", "expired"
  enrolledDate: timestamp("enrolled_date").notNull().defaultNow(),
  completedDate: timestamp("completed_date"),
  expiryDate: timestamp("expiry_date"), // For certifications
  score: decimal("score", { precision: 5, scale: 2 }), // If applicable
  certificateUrl: text("certificate_url"), // Document storage URL
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = typeof paymentPlans.$inferInsert;
export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;
export const insertInstallmentSchema = createInsertSchema(installments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Refund = typeof refunds.$inferSelect;
export type InsertRefund = typeof refunds.$inferInsert;
export const insertRefundSchema = createInsertSchema(refunds).omit({
  id: true,
  refundNumber: true,
  createdAt: true,
  updatedAt: true,
});

export type TaxConfiguration = typeof taxConfigurations.$inferSelect;
export type InsertTaxConfiguration = typeof taxConfigurations.$inferInsert;
export const insertTaxConfigurationSchema = createInsertSchema(
  taxConfigurations,
).omit({ id: true, createdAt: true, updatedAt: true });

export type DiscountPromotion = typeof discountsPromotions.$inferSelect;
export type InsertDiscountPromotion = typeof discountsPromotions.$inferInsert;
export const insertDiscountPromotionSchema = createInsertSchema(
  discountsPromotions,
).omit({ id: true, createdAt: true, updatedAt: true });

export type DiscountUsage = typeof discountUsage.$inferSelect;
export type InsertDiscountUsage = typeof discountUsage.$inferInsert;
export const insertDiscountUsageSchema = createInsertSchema(discountUsage).omit(
  { id: true },
);

export type SavedFilterPreset = typeof savedFilterPresets.$inferSelect;
export type InsertSavedFilterPreset = typeof savedFilterPresets.$inferInsert;
export const insertSavedFilterPresetSchema = createInsertSchema(
  savedFilterPresets,
).omit({ id: true, createdAt: true, updatedAt: true });

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;
export const insertExportJobSchema = createInsertSchema(exportJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Module 31: Staff & HR types
export type EmployeeAttendance = typeof employeeAttendance.$inferSelect;
export type InsertEmployeeAttendance = typeof employeeAttendance.$inferInsert;
export const insertEmployeeAttendanceSchema = createInsertSchema(
  employeeAttendance,
).omit({ id: true, createdAt: true, updatedAt: true });

export type ShiftTemplate = typeof shiftTemplates.$inferSelect;
export type InsertShiftTemplate = typeof shiftTemplates.$inferInsert;
export const insertShiftTemplateSchema = createInsertSchema(
  shiftTemplates,
).omit({ id: true, createdAt: true, updatedAt: true });

export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
export type InsertShiftAssignment = typeof shiftAssignments.$inferInsert;
export const insertShiftAssignmentSchema = createInsertSchema(
  shiftAssignments,
).omit({ id: true, createdAt: true, updatedAt: true });

export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = typeof commissionRules.$inferInsert;
export const insertCommissionRuleSchema = createInsertSchema(
  commissionRules,
).omit({ id: true, createdAt: true, updatedAt: true });

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;
export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = typeof performanceReviews.$inferInsert;
export const insertPerformanceReviewSchema = createInsertSchema(
  performanceReviews,
).omit({ id: true, createdAt: true, updatedAt: true });

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = typeof trainings.$inferInsert;
export const insertTrainingSchema = createInsertSchema(trainings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmployeeTraining = typeof employeeTrainings.$inferSelect;
export type InsertEmployeeTraining = typeof employeeTrainings.$inferInsert;
export const insertEmployeeTrainingSchema = createInsertSchema(
  employeeTrainings,
).omit({ id: true, createdAt: true, updatedAt: true });

// Module 32: AI Automation & Insights

export const aiJobEstimations = pgTable("ai_job_estimations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  serviceType: varchar("service_type", { length: 255 }),
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  reasoning: text("reasoning"),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiMaintenancePredictions = pgTable("ai_maintenance_predictions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  predictedIssue: text("predicted_issue").notNull(),
  severity: varchar("severity", { length: 50 }),
  recommendedAction: text("recommended_action"),
  estimatedTimeframe: varchar("estimated_timeframe", { length: 100 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  basedOnData: jsonb("based_on_data"),
  status: varchar("status", { length: 50 }).default("pending"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiPartsRecommendations = pgTable("ai_parts_recommendations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  recommendedParts: jsonb("recommended_parts").notNull(),
  reasoning: text("reasoning"),
  totalEstimatedCost: decimal("total_estimated_cost", {
    precision: 10,
    scale: 2,
  }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  appliedToJobCard: boolean("applied_to_job_card").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiScheduleOptimizations = pgTable("ai_schedule_optimizations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  optimizationType: varchar("optimization_type", { length: 100 }),
  suggestions: jsonb("suggestions").notNull(),
  reasoning: text("reasoning"),
  potentialTimeSaved: decimal("potential_time_saved", {
    precision: 10,
    scale: 2,
  }),
  status: varchar("status", { length: 50 }).default("pending"),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiChatConversations = pgTable("ai_chat_conversations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  customerId: varchar("customer_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  messages: jsonb("messages").notNull(),
  status: varchar("status", { length: 50 }).default("active"),
  handoffTo: varchar("handoff_to").references(() => users.id),
  handoffReason: text("handoff_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AIJobEstimation = typeof aiJobEstimations.$inferSelect;
export type InsertAIJobEstimation = typeof aiJobEstimations.$inferInsert;
export const insertAIJobEstimationSchema = createInsertSchema(
  aiJobEstimations,
).omit({ id: true, createdAt: true });

export type AIMaintenancePrediction =
  typeof aiMaintenancePredictions.$inferSelect;
export type InsertAIMaintenancePrediction =
  typeof aiMaintenancePredictions.$inferInsert;
export const insertAIMaintenancePredictionSchema = createInsertSchema(
  aiMaintenancePredictions,
).omit({ id: true, createdAt: true });

export type AIPartsRecommendation = typeof aiPartsRecommendations.$inferSelect;
export type InsertAIPartsRecommendation =
  typeof aiPartsRecommendations.$inferInsert;
export const insertAIPartsRecommendationSchema = createInsertSchema(
  aiPartsRecommendations,
).omit({ id: true, createdAt: true });

export type AIScheduleOptimization =
  typeof aiScheduleOptimizations.$inferSelect;
export type InsertAIScheduleOptimization =
  typeof aiScheduleOptimizations.$inferInsert;
export const insertAIScheduleOptimizationSchema = createInsertSchema(
  aiScheduleOptimizations,
).omit({ id: true, createdAt: true });

export type AIChatConversation = typeof aiChatConversations.$inferSelect;
export type InsertAIChatConversation = typeof aiChatConversations.$inferInsert;
export const insertAIChatConversationSchema = createInsertSchema(
  aiChatConversations,
).omit({ id: true, createdAt: true, updatedAt: true });

// Module 33: Third-Party Integrations
export const integrationConnections = pgTable("integration_connections", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  integrationType: varchar("integration_type", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrationSyncLogs = pgTable("integration_sync_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  connectionId: uuid("connection_id").references(
    () => integrationConnections.id,
  ),
  syncType: varchar("sync_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  recordsProcessed: integer("records_processed").default(0),
  errorMessage: text("error_message"),
  syncData: jsonb("sync_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountingTransactions = pgTable("accounting_transactions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  externalId: varchar("external_id", { length: 255 }),
  transactionType: varchar("transaction_type", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  description: text("description"),
  transactionDate: timestamp("transaction_date").notNull(),
  syncStatus: varchar("sync_status", { length: 50 }).default("pending"),
  syncedAt: timestamp("synced_at"),
  accountingData: jsonb("accounting_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const obdDiagnosticData = pgTable("obd_diagnostic_data", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  diagnosticCodes: jsonb("diagnostic_codes").notNull(),
  liveData: jsonb("live_data"),
  freezeFrameData: jsonb("freeze_frame_data"),
  readinessStatus: jsonb("readiness_status"),
  vehicleInfo: jsonb("vehicle_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type IntegrationConnection = typeof integrationConnections.$inferSelect;
export type InsertIntegrationConnection =
  typeof integrationConnections.$inferInsert;
export const insertIntegrationConnectionSchema = createInsertSchema(
  integrationConnections,
).omit({ id: true, createdAt: true, updatedAt: true });

export type IntegrationSyncLog = typeof integrationSyncLogs.$inferSelect;
export type InsertIntegrationSyncLog = typeof integrationSyncLogs.$inferInsert;
export const insertIntegrationSyncLogSchema = createInsertSchema(
  integrationSyncLogs,
).omit({ id: true, createdAt: true });

export type AccountingTransaction = typeof accountingTransactions.$inferSelect;
export type InsertAccountingTransaction =
  typeof accountingTransactions.$inferInsert;
export const insertAccountingTransactionSchema = createInsertSchema(
  accountingTransactions,
).omit({ id: true, createdAt: true });

export type OBDDiagnosticData = typeof obdDiagnosticData.$inferSelect;
export type InsertOBDDiagnosticData = typeof obdDiagnosticData.$inferInsert;
export const insertOBDDiagnosticDataSchema = createInsertSchema(
  obdDiagnosticData,
).omit({ id: true, createdAt: true });

// Module 34: Security & Compliance
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const twoFactorAuth = pgTable("two_factor_auth", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  secret: varchar("secret", { length: 255 }).notNull(),
  isEnabled: boolean("is_enabled").default(false),
  backupCodes: jsonb("backup_codes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const backupJobs = pgTable("backup_jobs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  jobType: varchar("job_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"),
  dataTypes: jsonb("data_types"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gdprDataRequests = pgTable("gdpr_data_requests", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  userId: varchar("user_id").references(() => users.id),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userConsents = pgTable("user_consents", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  consentType: varchar("consent_type", { length: 100 }).notNull(),
  consentGiven: boolean("consent_given").notNull(),
  consentVersion: varchar("consent_version", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions - defines all possible permissions in the system
export const permissions = pgTable("permissions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  isSystemPermission: boolean("is_system_permission").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role Permissions - maps permissions to roles
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  roleId: uuid("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  permissionId: uuid("permission_id")
    .references(() => permissions.id, { onDelete: "cascade" })
    .notNull(),
  granted: boolean("granted").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const permissionOverrides = pgTable("permission_overrides", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  allowed: boolean("allowed").notNull(),
  reason: text("reason"),
  createdBy: varchar("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 35: System Improvements - User Settings
export const userSettings = pgTable("user_settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  dateFormat: varchar("date_format", { length: 20 }).default("MM/DD/YYYY"),
  timeFormat: varchar("time_format", { length: 10 }).default("12h"),
  theme: varchar("theme", { length: 20 }).default("light"),
  fontSize: varchar("font_size", { length: 10 }).default("medium"),
  compactMode: boolean("compact_mode").default(false),
  enableNotifications: boolean("enable_notifications").default(true),
  enableSounds: boolean("enable_sounds").default(true),
  enableKeyboardShortcuts: boolean("enable_keyboard_shortcuts").default(true),
  printSettings: jsonb("print_settings").default({
    paperSize: "A4",
    includeHeader: true,
    includeFooter: true,
    showLogo: true,
  }),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Undo/Redo History
export const actionHistory = pgTable("action_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  canUndo: boolean("can_undo").default(true),
  undoneAt: timestamp("undone_at"),
  redoneAt: timestamp("redone_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = typeof twoFactorAuth.$inferInsert;
export const insertTwoFactorAuthSchema = createInsertSchema(twoFactorAuth).omit(
  { id: true, createdAt: true, updatedAt: true },
);

export type BackupJob = typeof backupJobs.$inferSelect;
export type InsertBackupJob = typeof backupJobs.$inferInsert;
export const insertBackupJobSchema = createInsertSchema(backupJobs).omit({
  id: true,
  createdAt: true,
});

export type GdprDataRequest = typeof gdprDataRequests.$inferSelect;
export type InsertGdprDataRequest = typeof gdprDataRequests.$inferInsert;
export const insertGdprDataRequestSchema = createInsertSchema(
  gdprDataRequests,
).omit({ id: true, createdAt: true });

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;
export const insertUserConsentSchema = createInsertSchema(userConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true, createdAt: true });

export type PermissionOverride = typeof permissionOverrides.$inferSelect;
export type InsertPermissionOverride = typeof permissionOverrides.$inferInsert;
export const insertPermissionOverrideSchema = createInsertSchema(
  permissionOverrides,
).omit({ id: true, createdAt: true });

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ActionHistory = typeof actionHistory.$inferSelect;
export type InsertActionHistory = typeof actionHistory.$inferInsert;
export const insertActionHistorySchema = createInsertSchema(actionHistory).omit(
  { id: true, createdAt: true },
);

// Module 36: In-App Chat Support
export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  title: varchar("title", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull().default("direct"), // "direct", "group", "support"
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  lastMessageAt: timestamp("last_message_at"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id")
    .references(() => chatConversations.id)
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  role: varchar("role", { length: 50 }).default("member"), // "admin", "member"
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id")
    .references(() => chatConversations.id)
    .notNull(),
  senderId: varchar("sender_id")
    .references(() => users.id)
    .notNull(),
  messageType: varchar("message_type", { length: 50 }).default("text"), // "text", "file", "image", "system"
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]), // Array of file metadata
  metadata: jsonb("metadata").default({}),
  replyToId: uuid("reply_to_id").references((): any => chatMessages.id),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessageReactions = pgTable("chat_message_reactions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  messageId: uuid("message_id")
    .references(() => chatMessages.id)
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  reaction: varchar("reaction", { length: 10 }).notNull(), // emoji
  createdAt: timestamp("created_at").defaultNow(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;
export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  id: true,
  joinedAt: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type ChatMessageReaction = typeof chatMessageReactions.$inferSelect;
export type InsertChatMessageReaction = typeof chatMessageReactions.$inferInsert;
export const insertChatMessageReactionSchema = createInsertSchema(chatMessageReactions).omit({
  id: true,
  createdAt: true,
});

// Support Tickets - extends chat conversations for support use cases
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").references(() => chatConversations.id).notNull().unique(),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  subject: varchar("subject", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // technical, billing, general, feature_request
  priority: varchar("priority", { length: 50 }).default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 50 }).default("open"), // open, in_progress, waiting_customer, resolved, closed
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  resolutionNotes: text("resolution_notes"),
  slaDeadline: timestamp("sla_deadline"),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTicketEvents = pgTable("support_ticket_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: uuid("ticket_id").references(() => supportTickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // created, assigned, status_changed, priority_changed, resolved, closed
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Attachments - metadata for file uploads in chat
export const chatAttachments = pgTable("chat_attachments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: uuid("message_id").references(() => chatMessages.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SupportTicketEvent = typeof supportTicketEvents.$inferSelect;
export type InsertSupportTicketEvent = typeof supportTicketEvents.$inferInsert;
export const insertSupportTicketEventSchema = createInsertSchema(supportTicketEvents).omit({
  id: true,
  createdAt: true,
});

export type ChatAttachment = typeof chatAttachments.$inferSelect;
export type InsertChatAttachment = typeof chatAttachments.$inferInsert;
export const insertChatAttachmentSchema = createInsertSchema(chatAttachments).omit({
  id: true,
  createdAt: true,
});

// Module 37: Customer Self-Service Portal
export const customerPortalSessions = pgTable("customer_portal_sessions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerPortalSettings = pgTable("customer_portal_settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  allowOnlineBooking: boolean("allow_online_booking").default(true),
  allowEstimateApproval: boolean("allow_estimate_approval").default(true),
  allowOnlinePayment: boolean("allow_online_payment").default(true),
  allowServiceHistoryView: boolean("allow_service_history_view").default(true),
  requireEmailVerification: boolean("require_email_verification").default(true),
  customBranding: jsonb("custom_branding").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 38: Digital Signatures & Media Documentation
export const digitalSignatures = pgTable("digital_signatures", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  relatedType: varchar("related_type", { length: 50 }).notNull(), // "job_card", "estimate", "invoice", "vehicle_inspection"
  relatedId: uuid("related_id").notNull(),
  signedBy: varchar("signed_by")
    .references(() => users.id)
    .notNull(),
  signatureData: text("signature_data").notNull(), // Base64 encoded signature image
  signatureType: varchar("signature_type", { length: 50 }).default("customer"), // "customer", "technician", "manager"
  ipAddress: varchar("ip_address", { length: 50 }),
  deviceInfo: varchar("device_info", { length: 255 }),
  consentText: text("consent_text"),
  consentGiven: boolean("consent_given").default(false),
  signedAt: timestamp("signed_at"), // Client-provided signature timestamp
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaAttachments = pgTable("media_attachments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  relatedType: varchar("related_type", { length: 50 }).notNull(), // "job_card", "vehicle", "inspection", "estimate"
  relatedId: uuid("related_id").notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(), // "photo", "video", "audio", "document"
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  category: varchar("category", { length: 100 }), // "before", "after", "damage", "walkaround", "invoice", "estimate"
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 39: QR Code Check-In System
export const qrCodeTokens = pgTable("qr_code_tokens", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  qrCodeData: varchar("qr_code_data", { length: 500 }).notNull().unique(),
  qrCodeImageUrl: varchar("qr_code_image_url", { length: 500 }),
  tokenType: varchar("token_type", { length: 50 }).default("appointment"), // "appointment", "vehicle_dropoff", "loyalty_card"
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qrScanLogs = pgTable("qr_scan_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  qrCodeId: uuid("qr_code_id")
    .references(() => qrCodeTokens.id)
    .notNull(),
  scannedBy: varchar("scanned_by").references(() => users.id),
  scanLocation: varchar("scan_location", { length: 255 }),
  deviceInfo: varchar("device_info", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  scanResult: varchar("scan_result", { length: 50 }).default("success"), // "success", "expired", "invalid", "already_used"
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 40: Fleet Management
export const fleetGroups = pgTable("fleet_groups", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  fleetName: varchar("fleet_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  billingAddress: text("billing_address"),
  taxId: varchar("tax_id", { length: 100 }),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  paymentTerms: varchar("payment_terms", { length: 100 }), // "net_30", "net_60", "prepaid"
  preferredPaymentMethod: varchar("preferred_payment_method", { length: 50 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fleetVehicles = pgTable("fleet_vehicles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fleetGroupId: uuid("fleet_group_id")
    .references(() => fleetGroups.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  fleetNumber: varchar("fleet_number", { length: 100 }),
  department: varchar("department", { length: 100 }),
  assignedDriver: varchar("assigned_driver", { length: 255 }),
  driverPhone: varchar("driver_phone", { length: 20 }),
  averageMonthlyMileage: integer("average_monthly_mileage"),
  customMaintenanceSchedule: jsonb("custom_maintenance_schedule").default([]),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const fleetContracts = pgTable("fleet_contracts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fleetGroupId: uuid("fleet_group_id")
    .references(() => fleetGroups.id)
    .notNull(),
  contractNumber: varchar("contract_number", { length: 100 }).notNull().unique(),
  contractType: varchar("contract_type", { length: 50 }).notNull(), // "maintenance", "full_service", "parts_only"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  contractValue: decimal("contract_value", { precision: 12, scale: 2 }), // Total contract value
  serviceCap: decimal("service_cap", { precision: 12, scale: 2 }), // Service spending limit
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  includedServices: jsonb("included_services").default([]),
  excludedServices: jsonb("excluded_services").default([]),
  maxVehicles: integer("max_vehicles"),
  billingCycle: varchar("billing_cycle", { length: 50 }).default("monthly"), // "monthly", "quarterly", "annual"
  autoRenew: boolean("auto_renew").default(false),
  renewalNoticeDays: integer("renewal_notice_days").default(30), // Days before expiry to send renewal notice
  slaResponseTime: integer("sla_response_time"), // Response time in minutes
  slaCompletionTime: integer("sla_completion_time"), // Job completion time in hours
  slaUptimePercentage: decimal("sla_uptime_percentage", { precision: 5, scale: 2 }), // Expected service availability
  penaltyRate: decimal("penalty_rate", { precision: 5, scale: 2 }), // Penalty % for SLA breaches
  status: varchar("status", { length: 50 }).default("active"), // "draft", "active", "expired", "cancelled", "pending_renewal"
  terms: text("terms"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contract Utilization Tracking
export const contractUtilization = pgTable("contract_utilization", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id")
    .references(() => fleetContracts.id, { onDelete: "cascade" })
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  serviceDate: timestamp("service_date").notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0"),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  isCoveredByContract: boolean("is_covered_by_contract").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SLA Compliance Tracking
export const contractSLAMetrics = pgTable("contract_sla_metrics", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id")
    .references(() => fleetContracts.id, { onDelete: "cascade" })
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // "response_time", "completion_time", "uptime"
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }).notNull(),
  complianceStatus: varchar("compliance_status", { length: 50 }).notNull(), // "met", "breached", "warning"
  breachSeverity: varchar("breach_severity", { length: 50 }), // "minor", "moderate", "critical"
  penaltyApplied: decimal("penalty_applied", { precision: 10, scale: 2 }).default("0"),
  incidentDate: timestamp("incident_date").notNull(),
  resolutionDate: timestamp("resolution_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contract Renewal Workflow
export const contractRenewals = pgTable("contract_renewals", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id")
    .references(() => fleetContracts.id, { onDelete: "cascade" })
    .notNull(),
  renewalType: varchar("renewal_type", { length: 50 }).notNull(), // "automatic", "manual", "renegotiation"
  proposedStartDate: timestamp("proposed_start_date").notNull(),
  proposedEndDate: timestamp("proposed_end_date").notNull(),
  proposedMonthlyFee: decimal("proposed_monthly_fee", { precision: 10, scale: 2 }),
  proposedChanges: jsonb("proposed_changes"), // JSON of proposed changes
  notificationSentAt: timestamp("notification_sent_at"),
  customerResponse: varchar("customer_response", { length: 50 }), // "accepted", "rejected", "pending", "negotiating"
  customerResponseDate: timestamp("customer_response_date"),
  renewedContractId: uuid("renewed_contract_id").references(() => fleetContracts.id),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "notified", "accepted", "rejected", "completed"
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fleetPricingTiers = pgTable("fleet_pricing_tiers", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  fleetGroupId: uuid("fleet_group_id").references(() => fleetGroups.id, { onDelete: "cascade" }), // NULL for global tiers
  tierName: varchar("tier_name", { length: 255 }).notNull(),
  minVehicles: integer("min_vehicles").notNull(),
  maxVehicles: integer("max_vehicles"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).notNull(),
  applicableServices: text("applicable_services").array(), // Array of service types
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fleetMaintenanceSchedules = pgTable("fleet_maintenance_schedules", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fleetGroupId: uuid("fleet_group_id")
    .references(() => fleetGroups.id, { onDelete: "cascade" })
    .notNull(),
  scheduleName: varchar("schedule_name", { length: 255 }).notNull(),
  description: text("description"),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  intervalType: varchar("interval_type").notNull(), // "mileage", "time", "both"
  intervalMileage: integer("interval_mileage"),
  intervalMonths: integer("interval_months"),
  applicableVehicleTypes: text("applicable_vehicle_types").array(), // Array of vehicle types this applies to
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GPS Tracking & Fleet Management Enhancement
// Note: Using double precision for GPS coordinates to enable efficient geospatial queries
// Consider PostGIS extension for production deployment with heavy geospatial operations
export const vehicleLocationHistory = pgTable("vehicle_location_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, { onDelete: "cascade" })
    .notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  altitude: doublePrecision("altitude"),
  speed: doublePrecision("speed"), // km/h
  heading: doublePrecision("heading"), // degrees (0-360)
  accuracy: doublePrecision("accuracy"), // meters
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  source: varchar("source", { length: 50 }).default("gps"), // "gps", "manual", "estimated"
  driverId: varchar("driver_id").references(() => users.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  mileage: integer("mileage"), // Odometer reading at this location
  engineStatus: varchar("engine_status", { length: 20 }), // "running", "idle", "off"
  fuelLevel: doublePrecision("fuel_level"), // percentage
  batteryVoltage: doublePrecision("battery_voltage"),
}, (table) => ({
  vehicleTimestampIdx: index("vehicle_location_history_vehicle_timestamp_idx").on(table.vehicleId, table.timestamp.desc()),
  timestampIdx: index("vehicle_location_history_timestamp_idx").on(table.timestamp.desc()),
  // Removed time-window predicate — Postgres rejects NOW() in partial-index WHERE (not IMMUTABLE).
  // The vehicle+timestamp ordering index above is sufficient; queries should filter by time directly.
  vehicleLatestIdx: index("vehicle_location_history_vehicle_latest_idx").on(table.vehicleId, table.timestamp.desc()),
}));

export const geofenceZones = pgTable("geofence_zones", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  zoneType: varchar("zone_type", { length: 50 }).notNull(), // "service_area", "restricted", "preferred_route", "customer_location"
  geometry: jsonb("geometry").notNull(), // GeoJSON polygon or circle {type: "Point"/"Polygon", coordinates: [...]}
  centerLatitude: doublePrecision("center_latitude"),
  centerLongitude: doublePrecision("center_longitude"),
  radius: doublePrecision("radius"), // meters for circular zones
  alertOnEntry: boolean("alert_on_entry").default(false),
  alertOnExit: boolean("alert_on_exit").default(false),
  isActive: boolean("is_active").default(true),
  color: varchar("color", { length: 20 }).default("#3B82F6"), // Hex color for map display
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  garageActiveIdx: index("geofence_zones_garage_active_idx").on(table.garageId, table.isActive),
}));

// Normalized link table for geofence zone vehicle access
export const geofenceZoneVehicles = pgTable("geofence_zone_vehicles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  geofenceZoneId: uuid("geofence_zone_id")
    .references(() => geofenceZones.id, { onDelete: "cascade" })
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  zoneVehicleIdx: uniqueIndex("geofence_zone_vehicles_zone_vehicle_idx").on(table.geofenceZoneId, table.vehicleId),
}));

// Normalized link table for geofence alert recipients
export const geofenceAlertRecipients = pgTable("geofence_alert_recipients", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  geofenceZoneId: uuid("geofence_zone_id")
    .references(() => geofenceZones.id, { onDelete: "cascade" })
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  notificationMethod: varchar("notification_method", { length: 50 }).default("email"), // "email", "sms", "push", "all"
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  zoneUserIdx: uniqueIndex("geofence_alert_recipients_zone_user_idx").on(table.geofenceZoneId, table.userId),
}));

export const geofenceEvents = pgTable("geofence_events", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  geofenceZoneId: uuid("geofence_zone_id")
    .references(() => geofenceZones.id, { onDelete: "cascade" })
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, { onDelete: "cascade" })
    .notNull(),
  eventType: varchar("event_type", { length: 20 }).notNull(), // "entry", "exit", "dwell"
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  driverId: varchar("driver_id").references(() => users.id),
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  dwellDurationMinutes: integer("dwell_duration_minutes"), // For dwell events
  metadata: jsonb("metadata"), // Additional context
}, (table) => ({
  geofenceTimestampIdx: index("geofence_events_geofence_timestamp_idx").on(table.geofenceZoneId, table.timestamp.desc()),
  vehicleTimestampIdx: index("geofence_events_vehicle_timestamp_idx").on(table.vehicleId, table.timestamp.desc()),
  timestampIdx: index("geofence_events_timestamp_idx").on(table.timestamp.desc()),
  // NOW() removed from predicate — Postgres requires IMMUTABLE functions in partial-index WHERE.
  // The notification_sent = false filter is enough; recency belongs in queries, not the index.
  pendingNotificationIdx: index("geofence_events_pending_notification_idx").on(table.notificationSent).where(sql`notification_sent = false`),
}));

export const fleetRoutes = pgTable("fleet_routes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  routeName: varchar("route_name", { length: 255 }).notNull(),
  description: text("description"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  driverId: varchar("driver_id").references(() => users.id),
  jobCardIds: text("job_card_ids").array(), // Array of job card IDs in order
  startLocation: jsonb("start_location").notNull(), // {lat, lng, address}
  endLocation: jsonb("end_location"), // {lat, lng, address}
  waypoints: jsonb("waypoints"), // Array of {lat, lng, address, jobCardId}
  optimizedRoute: jsonb("optimized_route"), // Optimized waypoint order
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }), // km
  estimatedDuration: integer("estimated_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  status: varchar("status", { length: 50 }).default("planned"), // "planned", "in_progress", "completed", "cancelled"
  scheduledStartTime: timestamp("scheduled_start_time"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  routePolyline: text("route_polyline"), // Encoded polyline for map display
  trafficConditions: varchar("traffic_conditions", { length: 50 }), // "light", "moderate", "heavy"
  fuelEstimate: decimal("fuel_estimate", { precision: 8, scale: 2 }), // liters
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routeCheckpoints = pgTable("route_checkpoints", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  routeId: uuid("route_id")
    .references(() => fleetRoutes.id, { onDelete: "cascade" })
    .notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  checkpointType: varchar("checkpoint_type", { length: 50 }).notNull(), // "pickup", "delivery", "service", "break"
  location: jsonb("location").notNull(), // {lat, lng, address}
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  customerId: varchar("customer_id").references(() => users.id),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  estimatedDeparture: timestamp("estimated_departure"),
  actualDeparture: timestamp("actual_departure"),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "in_transit", "arrived", "completed", "skipped"
  notes: text("notes"),
  completedBy: varchar("completed_by").references(() => users.id),
  metadata: jsonb("metadata"),
}, (table) => ({
  routeSequenceIdx: index("route_checkpoints_route_sequence_idx").on(table.routeId, table.sequenceNumber),
}));

// Module 41: Warranty Tracking
export const warranties = pgTable("warranties", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  warrantyType: varchar("warranty_type", { length: 50 }).notNull(), // "parts", "labor", "combined"
  relatedType: varchar("related_type", { length: 50 }).notNull(), // "job_card", "spare_part", "service"
  relatedId: uuid("related_id").notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  customerId: varchar("customer_id").references(() => users.id),
  warrantyNumber: varchar("warranty_number", { length: 100 }).unique(),
  provider: varchar("provider", { length: 255 }), // "manufacturer", "garage", "third_party"
  providerName: varchar("provider_name", { length: 255 }),
  coverageDescription: text("coverage_description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  mileageLimit: integer("mileage_limit"),
  currentMileage: integer("current_mileage"),
  terms: text("terms"),
  exclusions: text("exclusions"),
  status: varchar("status", { length: 50 }).default("active"), // "active", "expired", "claimed", "voided"
  isTransferable: boolean("is_transferable").default(false),
  documentUrl: varchar("document_url", { length: 500 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const warrantyClaims = pgTable("warranty_claims", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  warrantyId: uuid("warranty_id")
    .references(() => warranties.id)
    .notNull(),
  claimNumber: varchar("claim_number", { length: 100 }).unique(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  claimDate: timestamp("claim_date").notNull(),
  issueDescription: text("issue_description").notNull(),
  claimAmount: decimal("claim_amount", { precision: 10, scale: 2 }),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("submitted"), // "submitted", "under_review", "approved", "rejected", "paid"
  submittedBy: varchar("submitted_by").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  approvalNotes: text("approval_notes"),
  paymentDate: timestamp("payment_date"),
  supportingDocuments: jsonb("supporting_documents").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 42: Marketing Automation
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  campaignName: varchar("campaign_name", { length: 255 }).notNull(),
  campaignType: varchar("campaign_type", { length: 50 }).notNull(), // "email", "sms", "both"
  category: varchar("category", { length: 100 }), // "service_reminder", "promotion", "birthday", "retention", "review_request"
  targetAudience: varchar("target_audience", { length: 50 }).default("all"), // "all", "active", "inactive", "high_value", "custom"
  targetFilters: jsonb("target_filters").default({}),
  subject: varchar("subject", { length: 500 }),
  emailContent: text("email_content"),
  smsContent: text("sms_content"),
  scheduledDate: timestamp("scheduled_date"),
  sendImmediately: boolean("send_immediately").default(false),
  status: varchar("status", { length: 50 }).default("draft"), // "draft", "scheduled", "sending", "sent", "cancelled"
  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  unsubscribedCount: integer("unsubscribed_count").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignRecipients = pgTable("campaign_recipients", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id")
    .references(() => marketingCampaigns.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "sent", "delivered", "bounced", "opened", "clicked", "unsubscribed"
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 43: Vendor/Supplier Portal (extends existing suppliers table from Module 11)
export const supplierPriceList = pgTable("supplier_price_list", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  sparePartId: uuid("spare_part_id").references(() => spareParts.id),
  partName: varchar("part_name", { length: 255 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  minimumOrderQuantity: integer("minimum_order_quantity").default(1),
  leadTimeDays: integer("lead_time_days"),
  availability: varchar("availability", { length: 50 }).default("in_stock"), // "in_stock", "limited", "out_of_stock", "discontinued"
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const supplierPerformance = pgTable("supplier_performance", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  period: varchar("period", { length: 50 }).notNull(), // "2025-01", "2025-Q1"
  totalOrders: integer("total_orders").default(0),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default("0.00"),
  onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }), // Percentage
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }), // 0-100
  defectRate: decimal("defect_rate", { precision: 5, scale: 2 }), // Percentage
  averageLeadTime: decimal("average_lead_time", { precision: 5, scale: 2 }), // Days
  priceCompetitiveness: decimal("price_competitiveness", { precision: 5, scale: 2 }), // 0-100
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }), // 0.00 to 5.00
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supplierPartsAvailability = pgTable(
  "supplier_parts_availability",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    garageId: uuid("garage_id")
      .references(() => garages.id)
      .notNull(),
    sparePartId: uuid("spare_part_id").references(() => spareParts.id),
    supplierId: uuid("supplier_id")
      .references(() => suppliers.id)
      .notNull(),
    
    quantityAvailable: integer("quantity_available").default(0),
    leadTimeDays: integer("lead_time_days"),
    pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    
    externalPartNumber: varchar("external_part_number", { length: 255 }),
    externalSku: varchar("external_sku", { length: 255 }),
    supplierSource: varchar("supplier_source", { length: 50 }), // "tecdoc", "manual", "api"
    
    lastSyncedAt: timestamp("last_synced_at").defaultNow(),
    status: varchar("status", { length: 20 }).default("active"), // active, discontinued, backordered
    notes: text("notes"),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    garagePartSupplierIdx: index("spa_garage_part_supplier_idx").on(
      table.garageId,
      table.sparePartId,
      table.supplierId,
    ),
    supplierSyncIdx: index("spa_supplier_sync_idx").on(
      table.supplierId,
      table.lastSyncedAt,
    ),
  }),
);

// Module 44: Customer Loyalty Program
export const loyaltyProgram = pgTable("loyalty_program", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  programName: varchar("program_name", { length: 255 }).notNull(),
  description: text("description"),
  pointsPerDollar: decimal("points_per_dollar", { precision: 5, scale: 2 }).default("1.00"),
  pointsExpireDays: integer("points_expire_days"), // null = never expire
  referralBonusPoints: integer("referral_bonus_points").default(0),
  birthdayBonusPoints: integer("birthday_bonus_points").default(0),
  tierSystem: jsonb("tier_system").default([]), // Array of {name, minPoints, benefits, discount}
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerLoyaltyAccounts = pgTable("customer_loyalty_accounts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  programId: uuid("program_id")
    .references(() => loyaltyProgram.id)
    .notNull(),
  totalPointsEarned: integer("total_points_earned").default(0),
  currentPoints: integer("current_points").default(0),
  lifetimeSpent: decimal("lifetime_spent", { precision: 12, scale: 2 }).default("0.00"),
  currentTier: varchar("current_tier", { length: 50 }).default("bronze"), // "bronze", "silver", "gold", "platinum"
  tierSince: timestamp("tier_since").defaultNow(),
  referralCode: varchar("referral_code", { length: 50 }).unique(),
  successfulReferrals: integer("successful_referrals").default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id")
    .references(() => customerLoyaltyAccounts.id)
    .notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // "earn", "redeem", "expire", "adjust", "referral", "birthday"
  points: integer("points").notNull(), // Positive for earn, negative for redeem
  relatedType: varchar("related_type", { length: 50 }), // "invoice", "referral", "manual", "birthday"
  relatedId: uuid("related_id"),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  programId: uuid("program_id")
    .references(() => loyaltyProgram.id)
    .notNull(),
  rewardName: varchar("reward_name", { length: 255 }).notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // "discount", "free_service", "gift", "upgrade"
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }),
  availability: integer("availability"), // null = unlimited
  redeemed: integer("redeemed").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  terms: text("terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyRedemptions = pgTable("loyalty_redemptions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id")
    .references(() => customerLoyaltyAccounts.id)
    .notNull(),
  rewardId: uuid("reward_id")
    .references(() => loyaltyRewards.id)
    .notNull(),
  pointsRedeemed: integer("points_redeemed").notNull(),
  redemptionCode: varchar("redemption_code", { length: 100 }).unique(),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "approved", "used", "expired", "cancelled"
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  relatedInvoiceId: uuid("related_invoice_id").references(() => invoices.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 45: Vehicle Inspection Checklists
export const inspectionTemplates = pgTable("inspection_templates", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "general", "pre_purchase", "seasonal", "safety", "state_inspection"
  vehicleTypes: jsonb("vehicle_types").default([]), // ["car", "truck", "motorcycle"]
  checklistItems: jsonb("checklist_items").notNull(), // Array of {section, item, type, required, passCriteria}
  estimateRules: jsonb("estimate_rules").default([]), // Auto-generate estimates based on findings
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicleInspections = pgTable("vehicle_inspections", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  inspectionNumber: varchar("inspection_number", { length: 100 }).unique(),
  templateId: uuid("template_id").references(() => inspectionTemplates.id),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  inspectorId: varchar("inspector_id")
    .references(() => users.id)
    .notNull(),
  currentMileage: integer("current_mileage"),
  inspectionType: varchar("inspection_type", { length: 50 }).notNull(),
  overallStatus: varchar("overall_status", { length: 50 }).default("in_progress"), // "in_progress", "completed", "failed", "passed"
  findings: jsonb("findings").notNull(), // Array of {item, status, severity, notes, photoUrls}
  recommendations: jsonb("recommendations").default([]),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimateGenerated: boolean("estimate_generated").default(false),
  estimateId: uuid("estimate_id").references(() => estimates.id),
  customerNotified: boolean("customer_notified").default(false),
  customerSignatureId: uuid("customer_signature_id").references(() => digitalSignatures.id),
  inspectionDate: timestamp("inspection_date").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 46: Towing & Roadside Assistance
export const towingRequests = pgTable("towing_requests", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  requestNumber: varchar("request_number", { length: 100 }).unique(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // "towing", "jumpstart", "tire_change", "fuel_delivery", "lockout"
  pickupLocation: text("pickup_location").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 7 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 10, scale: 7 }),
  dropoffLocation: text("dropoff_location"),
  dropoffLatitude: decimal("dropoff_latitude", { precision: 10, scale: 7 }),
  dropoffLongitude: decimal("dropoff_longitude", { precision: 10, scale: 7 }),
  urgency: varchar("urgency", { length: 50 }).default("normal"), // "normal", "urgent", "emergency"
  status: varchar("status", { length: 50 }).default("requested"), // "requested", "assigned", "en_route", "arrived", "in_progress", "completed", "cancelled"
  assignedDriverId: varchar("assigned_driver_id").references(() => users.id),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  serviceCost: decimal("service_cost", { precision: 10, scale: 2 }),
  distance: decimal("distance", { precision: 8, scale: 2 }), // in miles/km
  notes: text("notes"),
  customerNotes: text("customer_notes"),
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const towTrucks = pgTable("tow_trucks", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  truckName: varchar("truck_name", { length: 255 }).notNull(),
  truckNumber: varchar("truck_number", { length: 100 }),
  licensePlate: varchar("license_plate", { length: 50 }),
  capacity: varchar("capacity", { length: 100 }), // "light_duty", "medium_duty", "heavy_duty"
  currentDriverId: varchar("current_driver_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("available"), // "available", "on_job", "maintenance", "offline"
  currentLocation: text("current_location"),
  gpsEnabled: boolean("gps_enabled").default(false),
  lastKnownLatitude: decimal("last_known_latitude", { precision: 10, scale: 7 }),
  lastKnownLongitude: decimal("last_known_longitude", { precision: 10, scale: 7 }),
  lastLocationUpdate: timestamp("last_location_update"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 47: Document Management
export const documentCategories = pgTable("document_categories", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  description: text("description"),
  requiresExpiration: boolean("requires_expiration").default(false),
  expirationWarningDays: integer("expiration_warning_days").default(30),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  categoryId: uuid("category_id").references(() => documentCategories.id),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  description: text("description"),
  relatedType: varchar("related_type", { length: 50 }), // "vehicle", "customer", "employee", "garage", "supplier"
  relatedId: varchar("related_id"),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  documentNumber: varchar("document_number", { length: 100 }),
  issueDate: timestamp("issue_date"),
  expirationDate: timestamp("expiration_date"),
  reminderSent: boolean("reminder_sent").default(false),
  status: varchar("status", { length: 50 }).default("active"), // "active", "expired", "archived"
  tags: jsonb("tags").default([]),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentAccessLog = pgTable("document_access_log", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  documentId: uuid("document_id")
    .references(() => documents.id)
    .notNull(),
  accessedBy: varchar("accessed_by")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 50 }).notNull(), // "view", "download", "update", "delete"
  ipAddress: varchar("ip_address", { length: 50 }),
  deviceInfo: varchar("device_info", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 48: Loaner Vehicle Management
export const loanerVehicles = pgTable("loaner_vehicles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  loanerNumber: varchar("loaner_number", { length: 100 }).unique(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  licensePlate: varchar("license_plate", { length: 50 }),
  vin: varchar("vin", { length: 17 }),
  color: varchar("color", { length: 50 }),
  currentMileage: integer("current_mileage"),
  dailyRate: decimal("daily_rate", { precision: 8, scale: 2 }).default("0.00"),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).default("0.00"),
  insuranceCoverage: text("insurance_coverage"),
  status: varchar("status", { length: 50 }).default("available"), // "available", "reserved", "on_loan", "maintenance", "retired"
  condition: varchar("condition", { length: 50 }).default("good"), // "excellent", "good", "fair", "poor"
  lastServiceDate: timestamp("last_service_date"),
  nextServiceDue: integer("next_service_due"),
  features: jsonb("features").default([]),
  restrictions: text("restrictions"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loanerReservations = pgTable("loaner_reservations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  loanerVehicleId: uuid("loaner_vehicle_id")
    .references(() => loanerVehicles.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  reservationNumber: varchar("reservation_number", { length: 100 }).unique(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  actualReturnDate: timestamp("actual_return_date"),
  startMileage: integer("start_mileage"),
  endMileage: integer("end_mileage"),
  startFuelLevel: varchar("start_fuel_level", { length: 20 }), // "empty", "quarter", "half", "three_quarters", "full"
  endFuelLevel: varchar("end_fuel_level", { length: 20 }),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }),
  depositRefunded: decimal("deposit_refunded", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  damageReported: boolean("damage_reported").default(false),
  damageDescription: text("damage_description"),
  damagePhotos: jsonb("damage_photos").default([]),
  damageCharge: decimal("damage_charge", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("reserved"), // "reserved", "active", "returned", "late", "cancelled"
  agreementSignatureId: uuid("agreement_signature_id").references(() => digitalSignatures.id),
  returnSignatureId: uuid("return_signature_id").references(() => digitalSignatures.id),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for new modules (37-48)

// Module 37: Customer Portal
export type CustomerPortalSession = typeof customerPortalSessions.$inferSelect;
export type InsertCustomerPortalSession = typeof customerPortalSessions.$inferInsert;
export const insertCustomerPortalSessionSchema = createInsertSchema(customerPortalSessions).omit({
  id: true,
  createdAt: true,
});

export type CustomerPortalSettings = typeof customerPortalSettings.$inferSelect;
export type InsertCustomerPortalSettings = typeof customerPortalSettings.$inferInsert;
export const insertCustomerPortalSettingsSchema = createInsertSchema(customerPortalSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Module 38: Digital Signatures & Media
export type DigitalSignature = typeof digitalSignatures.$inferSelect;
export type InsertDigitalSignature = typeof digitalSignatures.$inferInsert;
export const insertDigitalSignatureSchema = createInsertSchema(digitalSignatures).omit({
  id: true,
  createdAt: true,
});

export type MediaAttachment = typeof mediaAttachments.$inferSelect;
export type InsertMediaAttachment = typeof mediaAttachments.$inferInsert;
export const insertMediaAttachmentSchema = createInsertSchema(mediaAttachments).omit({
  id: true,
  createdAt: true,
});

// Module 39: QR Code System
export type QrCodeToken = typeof qrCodeTokens.$inferSelect;
export type InsertQrCodeToken = typeof qrCodeTokens.$inferInsert;
export const insertQrCodeTokenSchema = createInsertSchema(qrCodeTokens).omit({
  id: true,
  createdAt: true,
});

export type QrScanLog = typeof qrScanLogs.$inferSelect;
export type InsertQrScanLog = typeof qrScanLogs.$inferInsert;
export const insertQrScanLogSchema = createInsertSchema(qrScanLogs).omit({
  id: true,
  createdAt: true,
});

// Module 40: Fleet Management
export type FleetGroup = typeof fleetGroups.$inferSelect;
export type InsertFleetGroup = typeof fleetGroups.$inferInsert;
export const insertFleetGroupSchema = createInsertSchema(fleetGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FleetVehicle = typeof fleetVehicles.$inferSelect;
export type InsertFleetVehicle = typeof fleetVehicles.$inferInsert;
export const insertFleetVehicleSchema = createInsertSchema(fleetVehicles).omit({
  id: true,
  assignedAt: true,
});

export type FleetContract = typeof fleetContracts.$inferSelect;
export type InsertFleetContract = typeof fleetContracts.$inferInsert;
export const insertFleetContractSchema = createInsertSchema(fleetContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ContractUtilization = typeof contractUtilization.$inferSelect;
export type InsertContractUtilization = typeof contractUtilization.$inferInsert;
export const insertContractUtilizationSchema = createInsertSchema(contractUtilization).omit({
  id: true,
  createdAt: true,
});

export type ContractSLAMetric = typeof contractSLAMetrics.$inferSelect;
export type InsertContractSLAMetric = typeof contractSLAMetrics.$inferInsert;
export const insertContractSLAMetricSchema = createInsertSchema(contractSLAMetrics).omit({
  id: true,
  createdAt: true,
});

export type ContractRenewal = typeof contractRenewals.$inferSelect;
export type InsertContractRenewal = typeof contractRenewals.$inferInsert;
export const insertContractRenewalSchema = createInsertSchema(contractRenewals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FleetPricingTier = typeof fleetPricingTiers.$inferSelect;
export type InsertFleetPricingTier = typeof fleetPricingTiers.$inferInsert;
export const insertFleetPricingTierSchema = createInsertSchema(fleetPricingTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FleetMaintenanceSchedule = typeof fleetMaintenanceSchedules.$inferSelect;
export type InsertFleetMaintenanceSchedule = typeof fleetMaintenanceSchedules.$inferInsert;
export const insertFleetMaintenanceScheduleSchema = createInsertSchema(fleetMaintenanceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// GPS Tracking & Fleet Management Enhancement
export type VehicleLocationHistory = typeof vehicleLocationHistory.$inferSelect;
export type InsertVehicleLocationHistory = typeof vehicleLocationHistory.$inferInsert;
export const insertVehicleLocationHistorySchema = createInsertSchema(vehicleLocationHistory).omit({
  id: true,
});

export type GeofenceZone = typeof geofenceZones.$inferSelect;
export type InsertGeofenceZone = typeof geofenceZones.$inferInsert;
export const insertGeofenceZoneSchema = createInsertSchema(geofenceZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GeofenceZoneVehicle = typeof geofenceZoneVehicles.$inferSelect;
export type InsertGeofenceZoneVehicle = typeof geofenceZoneVehicles.$inferInsert;
export const insertGeofenceZoneVehicleSchema = createInsertSchema(geofenceZoneVehicles).omit({
  id: true,
  createdAt: true,
});

export type GeofenceAlertRecipient = typeof geofenceAlertRecipients.$inferSelect;
export type InsertGeofenceAlertRecipient = typeof geofenceAlertRecipients.$inferInsert;
export const insertGeofenceAlertRecipientSchema = createInsertSchema(geofenceAlertRecipients).omit({
  id: true,
  createdAt: true,
});

export type GeofenceEvent = typeof geofenceEvents.$inferSelect;
export type InsertGeofenceEvent = typeof geofenceEvents.$inferInsert;
export const insertGeofenceEventSchema = createInsertSchema(geofenceEvents).omit({
  id: true,
});

export type FleetRoute = typeof fleetRoutes.$inferSelect;
export type InsertFleetRoute = typeof fleetRoutes.$inferInsert;
export const insertFleetRouteSchema = createInsertSchema(fleetRoutes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RouteCheckpoint = typeof routeCheckpoints.$inferSelect;
export type InsertRouteCheckpoint = typeof routeCheckpoints.$inferInsert;
export const insertRouteCheckpointSchema = createInsertSchema(routeCheckpoints).omit({
  id: true,
});

// Module 41: Warranty Tracking
export type Warranty = typeof warranties.$inferSelect;
export type InsertWarranty = typeof warranties.$inferInsert;
export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WarrantyClaim = typeof warrantyClaims.$inferSelect;
export type InsertWarrantyClaim = typeof warrantyClaims.$inferInsert;
export const insertWarrantyClaimSchema = createInsertSchema(warrantyClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Module 42: Marketing Automation
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;
export const insertCampaignRecipientSchema = createInsertSchema(campaignRecipients).omit({
  id: true,
  createdAt: true,
});

// Module 43: Vendor/Supplier Portal (Supplier types already exported in Module 11)
export type SupplierPriceList = typeof supplierPriceList.$inferSelect;
export type InsertSupplierPriceList = typeof supplierPriceList.$inferInsert;
export const insertSupplierPriceListSchema = createInsertSchema(supplierPriceList).omit({
  id: true,
  lastUpdated: true,
});

export type SupplierPerformance = typeof supplierPerformance.$inferSelect;
export type InsertSupplierPerformance = typeof supplierPerformance.$inferInsert;
export const insertSupplierPerformanceSchema = createInsertSchema(supplierPerformance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SupplierPartsAvailability = typeof supplierPartsAvailability.$inferSelect;
export type InsertSupplierPartsAvailability = typeof supplierPartsAvailability.$inferInsert;
export const insertSupplierPartsAvailabilitySchema = createInsertSchema(supplierPartsAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Module 44: Customer Loyalty Program
export type LoyaltyProgram = typeof loyaltyProgram.$inferSelect;
export type InsertLoyaltyProgram = typeof loyaltyProgram.$inferInsert;
export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyProgram).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CustomerLoyaltyAccount = typeof customerLoyaltyAccounts.$inferSelect;
export type InsertCustomerLoyaltyAccount = typeof customerLoyaltyAccounts.$inferInsert;
export const insertCustomerLoyaltyAccountSchema = createInsertSchema(customerLoyaltyAccounts).omit({
  id: true,
  enrolledAt: true,
  tierSince: true,
});

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;
export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = typeof loyaltyRewards.$inferInsert;
export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards).omit({
  id: true,
  createdAt: true,
});

export type LoyaltyRedemption = typeof loyaltyRedemptions.$inferSelect;
export type InsertLoyaltyRedemption = typeof loyaltyRedemptions.$inferInsert;
export const insertLoyaltyRedemptionSchema = createInsertSchema(loyaltyRedemptions).omit({
  id: true,
  createdAt: true,
});

// Module 45: Vehicle Inspection Checklists
export type InspectionTemplate = typeof inspectionTemplates.$inferSelect;
export type InsertInspectionTemplate = typeof inspectionTemplates.$inferInsert;
export const insertInspectionTemplateSchema = createInsertSchema(inspectionTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VehicleInspection = typeof vehicleInspections.$inferSelect;
export type InsertVehicleInspection = typeof vehicleInspections.$inferInsert;
export const insertVehicleInspectionSchema = createInsertSchema(vehicleInspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Module 46: Towing & Roadside Assistance
export type TowingRequest = typeof towingRequests.$inferSelect;
export type InsertTowingRequest = typeof towingRequests.$inferInsert;
export const insertTowingRequestSchema = createInsertSchema(towingRequests).omit({
  id: true,
  createdAt: true,
});

export type TowTruck = typeof towTrucks.$inferSelect;
export type InsertTowTruck = typeof towTrucks.$inferInsert;
export const insertTowTruckSchema = createInsertSchema(towTrucks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Module 47: Document Management
export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = typeof documentCategories.$inferInsert;
export const insertDocumentCategorySchema = createInsertSchema(documentCategories).omit({
  id: true,
  createdAt: true,
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DocumentAccessLog = typeof documentAccessLog.$inferSelect;
export type InsertDocumentAccessLog = typeof documentAccessLog.$inferInsert;
export const insertDocumentAccessLogSchema = createInsertSchema(documentAccessLog).omit({
  id: true,
  createdAt: true,
});

// Module 48: Loaner Vehicle Management
export type LoanerVehicle = typeof loanerVehicles.$inferSelect;
export type InsertLoanerVehicle = typeof loanerVehicles.$inferInsert;
export const insertLoanerVehicleSchema = createInsertSchema(loanerVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LoanerReservation = typeof loanerReservations.$inferSelect;
export type InsertLoanerReservation = typeof loanerReservations.$inferInsert;
export const insertLoanerReservationSchema = createInsertSchema(loanerReservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// ENTERPRISE ERP MODULES (56-60)
// ============================================================================

// Module 56: Franchise Command Center
export const franchiseGroups = pgTable("franchise_groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  headquarters: varchar("headquarters", { length: 500 }),
  totalBranches: integer("total_branches").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const franchiseContracts = pgTable("franchise_contracts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseGroupId: uuid("franchise_group_id").references(() => franchiseGroups.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  contractNumber: varchar("contract_number", { length: 100 }).notNull().unique(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  royaltyPercentage: decimal("royalty_percentage", { precision: 5, scale: 2 }),
  marketingFeePercentage: decimal("marketing_fee_percentage", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("active"),
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const franchiseRoles = pgTable("franchise_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  franchiseGroupId: uuid("franchise_group_id").references(() => franchiseGroups.id),
  permissions: jsonb("permissions"),
  level: varchar("level", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const revenueSharingRules = pgTable("revenue_sharing_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseGroupId: uuid("franchise_group_id").references(() => franchiseGroups.id).notNull(),
  revenueType: varchar("revenue_type", { length: 100 }).notNull(),
  franchisePercentage: decimal("franchise_percentage", { precision: 5, scale: 2 }).notNull(),
  corporatePercentage: decimal("corporate_percentage", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const franchiseKpis = pgTable("franchise_kpis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  totalJobCards: integer("total_job_cards").default(0),
  customerSatisfaction: decimal("customer_satisfaction", { precision: 3, scale: 2 }),
  royaltyPaid: decimal("royalty_paid", { precision: 12, scale: 2 }).default("0"),
  marketingFeePaid: decimal("marketing_fee_paid", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const franchiseBranches = pgTable("franchise_branches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseGroupId: uuid("franchise_group_id").references(() => franchiseGroups.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  franchiseeOwnerId: varchar("franchisee_owner_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  status: varchar("status", { length: 50 }).default("active"),
});

// Module 59: Globalization Layer
export const locales = pgTable("locales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  englishName: varchar("english_name", { length: 100 }),
  isRtl: boolean("is_rtl").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const translationResources = pgTable("translation_resources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  localeId: uuid("locale_id").references(() => locales.id).notNull(),
  translationKey: varchar("translation_key", { length: 255 }).notNull(),
  translationValue: text("translation_value").notNull(),
  namespace: varchar("namespace", { length: 100 }),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const currencyRates = pgTable("currency_rates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taxRegions = pgTable("tax_regions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: varchar("country_code", { length: 3 }).notNull(),
  regionCode: varchar("region_code", { length: 10 }),
  regionName: varchar("region_name", { length: 255 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxType: varchar("tax_type", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timezoneRules = pgTable("timezone_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: uuid("branch_id").references(() => branches.id),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  utcOffset: varchar("utc_offset", { length: 10 }),
  supportsDst: boolean("supports_dst").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 60: Parts Supply Network
export const networkPartners = pgTable("network_partners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  partnerType: varchar("partner_type", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const partnerContracts = pgTable("partner_contracts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: uuid("partner_id").references(() => networkPartners.id).notNull(),
  contractNumber: varchar("contract_number", { length: 100 }).notNull().unique(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  paymentTerms: varchar("payment_terms", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fulfillmentOrders = pgTable("fulfillment_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(),
  partnerId: uuid("partner_id").references(() => networkPartners.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  requestedDeliveryDate: timestamp("requested_delivery_date"),
  status: varchar("status", { length: 50 }).default("pending"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shipmentEvents = pgTable("shipment_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fulfillmentOrderId: uuid("fulfillment_order_id").references(() => fulfillmentOrders.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventDate: timestamp("event_date").defaultNow(),
  location: varchar("location", { length: 500 }),
  description: text("description"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const warehouseNodes = pgTable("warehouse_nodes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  partnerId: uuid("partner_id").references(() => networkPartners.id),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  capacity: integer("capacity"),
  currentStock: integer("current_stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crossBorderDocs = pgTable("cross_border_docs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fulfillmentOrderId: uuid("fulfillment_order_id").references(() => fulfillmentOrders.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  documentNumber: varchar("document_number", { length: 100 }),
  documentUrl: varchar("document_url", { length: 500 }),
  issuedDate: timestamp("issued_date"),
  expiryDate: timestamp("expiry_date"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 57: Diagnostics & OBD Hub
export const obdDevices = pgTable("obd_devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id", { length: 100 }).notNull().unique(),
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  protocolVersion: varchar("protocol_version", { length: 50 }),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  branchId: uuid("branch_id").references(() => branches.id),
  status: varchar("status", { length: 50 }).default("active"),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deviceAssignments = pgTable("device_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: uuid("device_id").references(() => obdDevices.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  unassignedAt: timestamp("unassigned_at"),
  status: varchar("status", { length: 50 }).default("active"),
});

export const realtimeStreams = pgTable("realtime_streams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: uuid("device_id").references(() => obdDevices.id).notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  streamType: varchar("stream_type", { length: 50 }),
  dataPayload: jsonb("data_payload"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const obdSessions = pgTable("obd_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  deviceId: uuid("device_id").references(() => obdDevices.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  technicianId: varchar("technician_id").references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diagnosticReports = pgTable("diagnostic_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").references(() => obdSessions.id).notNull(),
  reportType: varchar("report_type", { length: 100 }),
  faultCodes: text("fault_codes").array(),
  liveData: jsonb("live_data"),
  recommendations: text("recommendations"),
  severity: varchar("severity", { length: 50 }),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 58: OEM Software Subscriptions
export const vendorCatalogs = pgTable("vendor_catalogs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  vendorCode: varchar("vendor_code", { length: 50 }).notNull().unique(),
  description: text("description"),
  website: varchar("website", { length: 500 }),
  supportEmail: varchar("support_email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const oemProducts = pgTable("oem_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorCatalogId: uuid("vendor_catalog_id").references(() => vendorCatalogs.id).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productCode: varchar("product_code", { length: 100 }).notNull(),
  softwareType: varchar("software_type", { length: 100 }),
  version: varchar("version", { length: 50 }),
  licensingModel: varchar("licensing_model", { length: 50 }),
  pricePerSeat: decimal("price_per_seat", { precision: 10, scale: 2 }),
  pricePerYear: decimal("price_per_year", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionLicenses = pgTable("subscription_licenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseKey: varchar("license_key", { length: 255 }).notNull().unique(),
  oemProductId: uuid("oem_product_id").references(() => oemProducts.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxSeats: integer("max_seats").default(1),
  usedSeats: integer("used_seats").default(0),
  status: varchar("status", { length: 50 }).default("active"),
  autoRenew: boolean("auto_renew").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const licenseAuditLogs = pgTable("license_audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseId: uuid("license_id").references(() => subscriptionLicenses.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  eventDetails: text("event_details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const entitlementAssignments = pgTable("entitlement_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseId: uuid("license_id").references(() => subscriptionLicenses.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports and insert schemas for Module 56: Franchise Command Center
export type FranchiseGroup = typeof franchiseGroups.$inferSelect;
export type InsertFranchiseGroup = typeof franchiseGroups.$inferInsert;
export const insertFranchiseGroupSchema = createInsertSchema(franchiseGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FranchiseContract = typeof franchiseContracts.$inferSelect;
export type InsertFranchiseContract = typeof franchiseContracts.$inferInsert;
export const insertFranchiseContractSchema = createInsertSchema(franchiseContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FranchiseRole = typeof franchiseRoles.$inferSelect;
export type InsertFranchiseRole = typeof franchiseRoles.$inferInsert;
export const insertFranchiseRoleSchema = createInsertSchema(franchiseRoles).omit({
  id: true,
  createdAt: true,
});

export type RevenueSharingRule = typeof revenueSharingRules.$inferSelect;
export type InsertRevenueSharingRule = typeof revenueSharingRules.$inferInsert;
export const insertRevenueSharingRuleSchema = createInsertSchema(revenueSharingRules).omit({
  id: true,
  createdAt: true,
});

export type FranchiseKpi = typeof franchiseKpis.$inferSelect;
export type InsertFranchiseKpi = typeof franchiseKpis.$inferInsert;
export const insertFranchiseKpiSchema = createInsertSchema(franchiseKpis).omit({
  id: true,
  createdAt: true,
});

export type FranchiseBranch = typeof franchiseBranches.$inferSelect;
export type InsertFranchiseBranch = typeof franchiseBranches.$inferInsert;
export const insertFranchiseBranchSchema = createInsertSchema(franchiseBranches).omit({
  id: true,
  joinedAt: true,
});

// Type exports and insert schemas for Module 59: Globalization Layer
export type Locale = typeof locales.$inferSelect;
export type InsertLocale = typeof locales.$inferInsert;
export const insertLocaleSchema = createInsertSchema(locales).omit({
  id: true,
  createdAt: true,
});

export type TranslationResource = typeof translationResources.$inferSelect;
export type InsertTranslationResource = typeof translationResources.$inferInsert;
export const insertTranslationResourceSchema = createInsertSchema(translationResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CurrencyRate = typeof currencyRates.$inferSelect;
export type InsertCurrencyRate = typeof currencyRates.$inferInsert;
export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({
  id: true,
  createdAt: true,
});

export type TaxRegion = typeof taxRegions.$inferSelect;
export type InsertTaxRegion = typeof taxRegions.$inferInsert;
export const insertTaxRegionSchema = createInsertSchema(taxRegions).omit({
  id: true,
  createdAt: true,
});

export type TimezoneRule = typeof timezoneRules.$inferSelect;
export type InsertTimezoneRule = typeof timezoneRules.$inferInsert;
export const insertTimezoneRuleSchema = createInsertSchema(timezoneRules).omit({
  id: true,
  createdAt: true,
});

// Type exports and insert schemas for Module 60: Parts Supply Network
export type NetworkPartner = typeof networkPartners.$inferSelect;
export type InsertNetworkPartner = typeof networkPartners.$inferInsert;
export const insertNetworkPartnerSchema = createInsertSchema(networkPartners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PartnerContract = typeof partnerContracts.$inferSelect;
export type InsertPartnerContract = typeof partnerContracts.$inferInsert;
export const insertPartnerContractSchema = createInsertSchema(partnerContracts).omit({
  id: true,
  createdAt: true,
});

export type FulfillmentOrder = typeof fulfillmentOrders.$inferSelect;
export type InsertFulfillmentOrder = typeof fulfillmentOrders.$inferInsert;
export const insertFulfillmentOrderSchema = createInsertSchema(fulfillmentOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ShipmentEvent = typeof shipmentEvents.$inferSelect;
export type InsertShipmentEvent = typeof shipmentEvents.$inferInsert;
export const insertShipmentEventSchema = createInsertSchema(shipmentEvents).omit({
  id: true,
  createdAt: true,
});

export type WarehouseNode = typeof warehouseNodes.$inferSelect;
export type InsertWarehouseNode = typeof warehouseNodes.$inferInsert;
export const insertWarehouseNodeSchema = createInsertSchema(warehouseNodes).omit({
  id: true,
  createdAt: true,
});

export type CrossBorderDoc = typeof crossBorderDocs.$inferSelect;
export type InsertCrossBorderDoc = typeof crossBorderDocs.$inferInsert;
export const insertCrossBorderDocSchema = createInsertSchema(crossBorderDocs).omit({
  id: true,
  createdAt: true,
});

// Type exports and insert schemas for Module 57: Diagnostics & OBD Hub
export type ObdDevice = typeof obdDevices.$inferSelect;
export type InsertObdDevice = typeof obdDevices.$inferInsert;
export const insertObdDeviceSchema = createInsertSchema(obdDevices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DeviceAssignment = typeof deviceAssignments.$inferSelect;
export type InsertDeviceAssignment = typeof deviceAssignments.$inferInsert;
export const insertDeviceAssignmentSchema = createInsertSchema(deviceAssignments).omit({
  id: true,
  assignedAt: true,
});

export type RealtimeStream = typeof realtimeStreams.$inferSelect;
export type InsertRealtimeStream = typeof realtimeStreams.$inferInsert;
export const insertRealtimeStreamSchema = createInsertSchema(realtimeStreams).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export type ObdSession = typeof obdSessions.$inferSelect;
export type InsertObdSession = typeof obdSessions.$inferInsert;
export const insertObdSessionSchema = createInsertSchema(obdSessions).omit({
  id: true,
  createdAt: true,
  startTime: true,
});

export type DiagnosticReport = typeof diagnosticReports.$inferSelect;
export type InsertDiagnosticReport = typeof diagnosticReports.$inferInsert;
export const insertDiagnosticReportSchema = createInsertSchema(diagnosticReports).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

// Type exports and insert schemas for Module 58: OEM Software Subscriptions
export type VendorCatalog = typeof vendorCatalogs.$inferSelect;
export type InsertVendorCatalog = typeof vendorCatalogs.$inferInsert;
export const insertVendorCatalogSchema = createInsertSchema(vendorCatalogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OemProduct = typeof oemProducts.$inferSelect;
export type InsertOemProduct = typeof oemProducts.$inferInsert;
export const insertOemProductSchema = createInsertSchema(oemProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SubscriptionLicense = typeof subscriptionLicenses.$inferSelect;
export type InsertSubscriptionLicense = typeof subscriptionLicenses.$inferInsert;
export const insertSubscriptionLicenseSchema = createInsertSchema(subscriptionLicenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LicenseAuditLog = typeof licenseAuditLogs.$inferSelect;
export type InsertLicenseAuditLog = typeof licenseAuditLogs.$inferInsert;
export const insertLicenseAuditLogSchema = createInsertSchema(licenseAuditLogs).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export type EntitlementAssignment = typeof entitlementAssignments.$inferSelect;
export type InsertEntitlementAssignment = typeof entitlementAssignments.$inferInsert;
export const insertEntitlementAssignmentSchema = createInsertSchema(entitlementAssignments).omit({
  id: true,
  createdAt: true,
  assignedAt: true,
});

// =============================================================================
// PHASE 1: AI & AUTOMATION (Modules 61-66) - Additional Tables
// =============================================================================

// Module 61: AI Chatbot - Additional message history table (companion to existing aiChatConversations)
export const aiChatMessages = pgTable("ai_chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").references(() => aiChatConversations.id).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // user, assistant, system
  content: text("content").notNull(),
  intent: varchar("intent", { length: 100 }), // book_appointment, check_status, get_quote, etc.
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  actionTaken: text("action_taken"), // JSON of actions performed
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 64: Voice Commands
export const voiceCommands = pgTable("voice_commands", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  transcript: text("transcript").notNull(),
  intent: varchar("intent", { length: 100 }).notNull(), // navigate, search, create, update, etc.
  entities: jsonb("entities"), // Extracted entities from command
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  actionExecuted: text("action_executed"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  responseTime: integer("response_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 65: Document OCR
export const ocrDocuments = pgTable("ocr_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  documentType: varchar("document_type", { length: 100 }).notNull(), // invoice, receipt, vin_sticker, insurance_card, etc.
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  extractedData: jsonb("extracted_data"), // JSON of extracted fields
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  customerId: varchar("customer_id").references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Module 66: AI Service Assistant (combines multiple AI features)
export const aiServiceSuggestions = pgTable("ai_service_suggestions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  suggestionType: varchar("suggestion_type", { length: 100 }).notNull(), // upsell, preventive, recall, warranty
  serviceDescription: text("service_description").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  reasoning: text("reasoning"), // AI explanation of why this service is suggested
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  relatedJobCardId: uuid("related_job_card_id").references(() => jobCards.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, presented, accepted, declined
  presentedAt: timestamp("presented_at"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports and insert schemas for Phase 1: AI & Automation (Additional Tables)
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;
export const insertAiChatMessageSchema = createInsertSchema(aiChatMessages).omit({
  id: true,
  createdAt: true,
});

export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = typeof voiceCommands.$inferInsert;
export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  createdAt: true,
});

export type OcrDocument = typeof ocrDocuments.$inferSelect;
export type InsertOcrDocument = typeof ocrDocuments.$inferInsert;
export const insertOcrDocumentSchema = createInsertSchema(ocrDocuments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  verifiedAt: true,
});

export type AiServiceSuggestion = typeof aiServiceSuggestions.$inferSelect;
export type InsertAiServiceSuggestion = typeof aiServiceSuggestions.$inferInsert;
export const insertAiServiceSuggestionSchema = createInsertSchema(aiServiceSuggestions).omit({
  id: true,
  createdAt: true,
  presentedAt: true,
  decidedAt: true,
});

// ============================================================================
// Phase 2: Advanced Analytics
// ============================================================================

// Module 67: Custom Reports & Dashboards
export const customReports = pgTable("custom_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  reportType: varchar("report_type", { length: 100 }).notNull(), // revenue, expenses, inventory, performance, custom
  configuration: jsonb("configuration").notNull(), // Filters, grouping, chart types, etc.
  schedule: varchar("schedule", { length: 100 }), // daily, weekly, monthly, custom cron
  recipients: jsonb("recipients"), // Array of user IDs or emails
  lastRunAt: timestamp("last_run_at"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  widgetType: varchar("widget_type", { length: 100 }).notNull(), // kpi, chart, table, metric
  title: varchar("title", { length: 255 }).notNull(),
  dataSource: varchar("data_source", { length: 255 }).notNull(), // invoices, job_cards, customers, etc.
  configuration: jsonb("configuration").notNull(),
  position: jsonb("position"), // { x, y, width, height }
  refreshInterval: integer("refresh_interval"), // seconds
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 68: Profit Margin Analysis
export const profitAnalysis = pgTable("profit_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  periodType: varchar("period_type", { length: 50 }).notNull(), // daily, weekly, monthly, quarterly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  totalCosts: decimal("total_costs", { precision: 12, scale: 2 }).notNull(),
  laborCosts: decimal("labor_costs", { precision: 12, scale: 2 }),
  partsCosts: decimal("parts_costs", { precision: 12, scale: 2 }),
  overheadCosts: decimal("overhead_costs", { precision: 12, scale: 2 }),
  grossProfit: decimal("gross_profit", { precision: 12, scale: 2 }).notNull(),
  netProfit: decimal("net_profit", { precision: 12, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).notNull(), // percentage
  topServiceRevenue: jsonb("top_service_revenue"), // Top revenue-generating services
  topTechnicianRevenue: jsonb("top_technician_revenue"),
  topCustomerRevenue: jsonb("top_customer_revenue"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceTypeProfitability = pgTable("service_type_profitability", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  serviceType: varchar("service_type", { length: 255 }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  jobCount: integer("job_count").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  avgRevenue: decimal("avg_revenue", { precision: 10, scale: 2 }),
  avgCost: decimal("avg_cost", { precision: 10, scale: 2 }),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 69: Customer Lifetime Value (LTV)
export const customerLtvAnalysis = pgTable("customer_ltv_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  totalVisits: integer("total_visits").notNull().default(0),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }),
  firstVisitDate: timestamp("first_visit_date"),
  lastVisitDate: timestamp("last_visit_date"),
  daysSinceLastVisit: integer("days_since_last_visit"),
  visitFrequency: decimal("visit_frequency", { precision: 5, scale: 2 }), // visits per year
  predictedLtv: decimal("predicted_ltv", { precision: 12, scale: 2 }),
  retentionRisk: varchar("retention_risk", { length: 50 }), // low, medium, high
  retentionScore: decimal("retention_score", { precision: 5, scale: 2 }), // 0-100
  churnProbability: decimal("churn_probability", { precision: 5, scale: 2 }), // percentage
  recommendedAction: text("recommended_action"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 70: Heat Maps & Business Intelligence
export const businessHeatmaps = pgTable("business_heatmaps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  heatmapType: varchar("heatmap_type", { length: 100 }).notNull(), // time_demand, service_demand, geographic, technician_utilization
  periodType: varchar("period_type", { length: 50 }).notNull(), // day, week, month
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  dataPoints: jsonb("data_points").notNull(), // Array of {label, value, metadata}
  aggregationLevel: varchar("aggregation_level", { length: 50 }), // hourly, daily, weekly
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

export const demandForecasts = pgTable("demand_forecasts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  forecastType: varchar("forecast_type", { length: 100 }).notNull(), // appointments, revenue, parts_demand
  targetDate: timestamp("target_date").notNull(),
  predictedValue: decimal("predicted_value", { precision: 12, scale: 2 }).notNull(),
  confidenceInterval: jsonb("confidence_interval"), // {lower, upper}
  actualValue: decimal("actual_value", { precision: 12, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // percentage
  modelUsed: varchar("model_used", { length: 100 }), // linear_regression, arima, prophet, etc.
  inputFeatures: jsonb("input_features"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Phase 2
export type CustomReport = typeof customReports.$inferSelect;
export type InsertCustomReport = typeof customReports.$inferInsert;
export const insertCustomReportSchema = createInsertSchema(customReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRunAt: true,
});

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = typeof dashboardWidgets.$inferInsert;
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
});

export type ProfitAnalysis = typeof profitAnalysis.$inferSelect;
export type InsertProfitAnalysis = typeof profitAnalysis.$inferInsert;
export const insertProfitAnalysisSchema = createInsertSchema(profitAnalysis).omit({
  id: true,
  createdAt: true,
});

export type ServiceTypeProfitability = typeof serviceTypeProfitability.$inferSelect;
export type InsertServiceTypeProfitability = typeof serviceTypeProfitability.$inferInsert;
export const insertServiceTypeProfitabilitySchema = createInsertSchema(serviceTypeProfitability).omit({
  id: true,
  createdAt: true,
});

export type CustomerLtvAnalysis = typeof customerLtvAnalysis.$inferSelect;
export type InsertCustomerLtvAnalysis = typeof customerLtvAnalysis.$inferInsert;
export const insertCustomerLtvAnalysisSchema = createInsertSchema(customerLtvAnalysis).omit({
  id: true,
  calculatedAt: true,
  updatedAt: true,
});

export type BusinessHeatmap = typeof businessHeatmaps.$inferSelect;
export type InsertBusinessHeatmap = typeof businessHeatmaps.$inferInsert;
export const insertBusinessHeatmapSchema = createInsertSchema(businessHeatmaps).omit({
  id: true,
  createdAt: true,
});

export type DemandForecast = typeof demandForecasts.$inferSelect;
export type InsertDemandForecast = typeof demandForecasts.$inferInsert;
export const insertDemandForecastSchema = createInsertSchema(demandForecasts).omit({
  id: true,
  createdAt: true,
});

// ========================================
// PHASE 3: ENHANCED INTEGRATIONS
// ========================================

// Module 71: Accounting Integration (QuickBooks/Xero)
export const accountingSync = pgTable("accounting_sync", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // quickbooks, xero
  syncType: varchar("sync_type", { length: 100 }).notNull(), // invoices, payments, expenses, customers
  entityType: varchar("entity_type", { length: 100 }).notNull(), // Invoice, Payment, etc.
  localId: varchar("local_id").notNull(), // ID in our system
  externalId: varchar("external_id"), // ID in accounting system
  status: varchar("status", { length: 50 }).default("pending"), // pending, synced, failed
  syncDirection: varchar("sync_direction", { length: 50 }), // to_accounting, from_accounting, bidirectional
  lastSyncedAt: timestamp("last_synced_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accountingConnections = pgTable("accounting_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  companyId: varchar("company_id").notNull(),
  companyName: varchar("company_name"),
  accessToken: text("access_token"), // encrypted
  refreshToken: text("refresh_token"), // encrypted
  tokenExpiry: timestamp("token_expiry"),
  isActive: boolean("is_active").default(true),
  syncSettings: jsonb("sync_settings"), // auto-sync preferences
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 72: Email Marketing Integration
export const emailCampaigns = pgTable("email_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  template: text("template").notNull(),
  provider: varchar("provider", { length: 50 }).default("sendgrid"), // mailchimp, sendgrid
  targetAudience: varchar("target_audience", { length: 100 }), // all, new_customers, inactive, vip
  customerSegment: jsonb("customer_segment"), // filtering criteria
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  status: varchar("status", { length: 50 }).default("draft"), // draft, scheduled, sending, sent, failed
  totalRecipients: integer("total_recipients").default(0),
  emailsSent: integer("emails_sent").default(0),
  emailsOpened: integer("emails_opened").default(0),
  clickThroughs: integer("click_throughs").default(0),
  bounces: integer("bounces").default(0),
  unsubscribes: integer("unsubscribes").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name").notNull(),
  category: varchar("category", { length: 100 }), // promotional, reminder, follow_up, newsletter
  subject: varchar("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  variables: jsonb("variables"), // merge fields
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 73: Social Media Integration
export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, google, yelp, instagram
  postType: varchar("post_type", { length: 100 }), // review_response, promotion, update
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls"), // images/videos
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { length: 50 }).default("draft"), // draft, scheduled, published, failed
  externalId: varchar("external_id"), // post ID on platform
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  reach: integer("reach").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviewPlatformIntegrations = pgTable("review_platform_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  profileUrl: varchar("profile_url"),
  apiKey: text("api_key"), // encrypted
  isActive: boolean("is_active").default(true),
  autoResponse: boolean("auto_response").default(false),
  responseTemplate: text("response_template"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 74: Video Consultation System
export const videoConsultations = pgTable("video_consultations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  platform: varchar("platform", { length: 50 }).default("zoom"), // zoom, teams, google_meet
  meetingUrl: varchar("meeting_url"),
  meetingId: varchar("meeting_id"),
  passcode: varchar("passcode"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // minutes
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, in_progress, completed, cancelled, no_show
  recordingUrl: varchar("recording_url"),
  notes: text("notes"),
  customerAttended: boolean("customer_attended"),
  technicianAttended: boolean("technician_attended"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 75: Parts Marketplace Integration
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  marketplace: varchar("marketplace", { length: 100 }).notNull(), // ebay_motors, amazon_auto, rock_auto
  externalOrderId: varchar("external_order_id").notNull(),
  partNumber: varchar("part_number").notNull(),
  partName: varchar("part_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  sellerId: varchar("seller_id"),
  sellerName: varchar("seller_name"),
  sellerRating: decimal("seller_rating", { precision: 3, scale: 2 }),
  orderStatus: varchar("order_status", { length: 50 }).default("pending"), // pending, confirmed, shipped, delivered, cancelled
  trackingNumber: varchar("tracking_number"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  linkedJobCardId: uuid("linked_job_card_id").references(() => jobCards.id),
  linkedSparePart: uuid("linked_spare_part").references(() => spareParts.id),
  orderDate: timestamp("order_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketplaceConnections = pgTable("marketplace_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  marketplace: varchar("marketplace", { length: 100 }).notNull(),
  apiKey: text("api_key"), // encrypted
  apiSecret: text("api_secret"), // encrypted
  accountId: varchar("account_id"),
  isActive: boolean("is_active").default(true),
  preferredSellers: jsonb("preferred_sellers"), // array of seller IDs
  autoOrderThreshold: decimal("auto_order_threshold", { precision: 10, scale: 2 }), // price limit for auto-ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for Phase 3
export type AccountingSync = typeof accountingSync.$inferSelect;
export type InsertAccountingSync = typeof accountingSync.$inferInsert;
export const insertAccountingSyncSchema = createInsertSchema(accountingSync).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AccountingConnection = typeof accountingConnections.$inferSelect;
export type InsertAccountingConnection = typeof accountingConnections.$inferInsert;
export const insertAccountingConnectionSchema = createInsertSchema(accountingConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;
export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type ReviewPlatformIntegration = typeof reviewPlatformIntegrations.$inferSelect;
export type InsertReviewPlatformIntegration = typeof reviewPlatformIntegrations.$inferInsert;
export const insertReviewPlatformIntegrationSchema = createInsertSchema(reviewPlatformIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VideoConsultation = typeof videoConsultations.$inferSelect;
export type InsertVideoConsultation = typeof videoConsultations.$inferInsert;
export const insertVideoConsultationSchema = createInsertSchema(videoConsultations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;
export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orderDate: true,
});

export type MarketplaceConnection = typeof marketplaceConnections.$inferSelect;
export type InsertMarketplaceConnection = typeof marketplaceConnections.$inferInsert;
export const insertMarketplaceConnectionSchema = createInsertSchema(marketplaceConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ========================================
// PHASE 4: CUSTOMER EXPERIENCE
// ========================================

// Module 76: Live Service Tracking
export const serviceTrackingUpdates = pgTable("service_tracking_updates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id").references(() => jobCards.id).notNull(),
  status: varchar("status", { length: 100 }).notNull(), // checked_in, diagnosing, parts_ordered, in_progress, quality_check, ready, completed
  title: varchar("title").notNull(),
  description: text("description"),
  estimatedCompletion: timestamp("estimated_completion"),
  completedAt: timestamp("completed_at"),
  technicianId: varchar("technician_id").references(() => users.id),
  photoUrls: jsonb("photo_urls"), // progress photos
  customerNotified: boolean("customer_notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 77: Video Estimates
export const videoEstimates = pgTable("video_estimates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"), // seconds
  transcription: text("transcription"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  recommendedServices: jsonb("recommended_services"), // array of service objects
  status: varchar("status", { length: 50 }).default("pending"), // pending, sent, viewed, approved, declined
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 78: Digital Vehicle Walkarounds
export const digitalWalkarounds = pgTable("digital_walkarounds", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id").references(() => jobCards.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  walkaroundType: varchar("walkaround_type", { length: 50 }).notNull(), // pre_service, post_service
  photos: jsonb("photos").notNull(), // array of {url, angle, annotations, timestamp}
  mileageReading: integer("mileage_reading"),
  fuelLevel: varchar("fuel_level", { length: 20 }), // 1/4, 1/2, 3/4, full
  damagePreviouslyNoted: jsonb("damage_previously_noted"), // array of damage descriptions
  newDamageIdentified: jsonb("new_damage_identified"),
  interiorCondition: varchar("interior_condition", { length: 50 }),
  customerSignatureUrl: varchar("customer_signature_url"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 79: Customer Reviews & Ratings
export const customerReviews = pgTable("customer_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  rating: integer("rating").notNull(), // 1-5
  serviceQualityRating: integer("service_quality_rating"),
  pricingRating: integer("pricing_rating"),
  speedRating: integer("speed_rating"),
  communicationRating: integer("communication_rating"),
  title: varchar("title"),
  comment: text("comment"),
  wouldRecommend: boolean("would_recommend"),
  platform: varchar("platform", { length: 50 }), // internal, google, yelp, facebook
  externalReviewId: varchar("external_review_id"),
  isPublic: boolean("is_public").default(true),
  responseText: text("response_text"),
  respondedAt: timestamp("responded_at"),
  respondedBy: varchar("responded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 80: Referral Program
export const referralPrograms = pgTable("referral_programs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name").notNull(),
  referrerRewardType: varchar("referrer_reward_type", { length: 50 }).notNull(), // discount, cash, credit
  referrerRewardAmount: decimal("referrer_reward_amount", { precision: 10, scale: 2 }).notNull(),
  refereeRewardType: varchar("referee_reward_type", { length: 50 }),
  refereeRewardAmount: decimal("referee_reward_amount", { precision: 10, scale: 2 }),
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }),
  expiryDays: integer("expiry_days"),
  isActive: boolean("is_active").default(true),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerReferrals = pgTable("customer_referrals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: uuid("program_id").references(() => referralPrograms.id).notNull(),
  referrerId: varchar("referrer_id").references(() => users.id).notNull(),
  refereeEmail: varchar("referee_email").notNull(),
  refereePhone: varchar("referee_phone"),
  refereeName: varchar("referee_name"),
  refereeId: varchar("referee_id").references(() => users.id),
  referralCode: varchar("referral_code").notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, rewarded, expired
  firstVisitDate: timestamp("first_visit_date"),
  firstPurchaseAmount: decimal("first_purchase_amount", { precision: 10, scale: 2 }),
  referrerRewardClaimed: boolean("referrer_reward_claimed").default(false),
  referrerRewardClaimedAt: timestamp("referrer_reward_claimed_at"),
  refereeRewardClaimed: boolean("referee_reward_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Type exports for Phase 4
export type ServiceTrackingUpdate = typeof serviceTrackingUpdates.$inferSelect;
export type InsertServiceTrackingUpdate = typeof serviceTrackingUpdates.$inferInsert;
export const insertServiceTrackingUpdateSchema = createInsertSchema(serviceTrackingUpdates).omit({
  id: true,
  createdAt: true,
});

export type VideoEstimate = typeof videoEstimates.$inferSelect;
export type InsertVideoEstimate = typeof videoEstimates.$inferInsert;
export const insertVideoEstimateSchema = createInsertSchema(videoEstimates).omit({
  id: true,
  createdAt: true,
});

export type DigitalWalkaround = typeof digitalWalkarounds.$inferSelect;
export type InsertDigitalWalkaround = typeof digitalWalkarounds.$inferInsert;
export const insertDigitalWalkaroundSchema = createInsertSchema(digitalWalkarounds).omit({
  id: true,
  createdAt: true,
});

export type CustomerReview = typeof customerReviews.$inferSelect;
export type InsertCustomerReview = typeof customerReviews.$inferInsert;
export const insertCustomerReviewSchema = createInsertSchema(customerReviews).omit({
  id: true,
  createdAt: true,
});

export type ReferralProgram = typeof referralPrograms.$inferSelect;
export type InsertReferralProgram = typeof referralPrograms.$inferInsert;
export const insertReferralProgramSchema = createInsertSchema(referralPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CustomerReferral = typeof customerReferrals.$inferSelect;
export type InsertCustomerReferral = typeof customerReferrals.$inferInsert;
export const insertCustomerReferralSchema = createInsertSchema(customerReferrals).omit({
  id: true,
  createdAt: true,
});

// ========================================
// PHASE 5: OPERATIONS & EFFICIENCY
// ========================================

// Module 81: AI-Powered Scheduling
export const aiSchedulingRules = pgTable("ai_scheduling_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name").notNull(),
  priority: integer("priority").default(1),
  considerTechnicianSkills: boolean("consider_technician_skills").default(true),
  considerTechnicianWorkload: boolean("consider_technician_workload").default(true),
  considerPartAvailability: boolean("consider_part_availability").default(true),
  considerCustomerPreference: boolean("consider_customer_preference").default(true),
  bufferTimeBetweenJobs: integer("buffer_time_between_jobs").default(15), // minutes
  maxJobsPerTechnician: integer("max_jobs_per_technician").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schedulingOptimizations = pgTable("scheduling_optimizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  optimizationDate: timestamp("optimization_date").notNull(),
  appointmentsOptimized: integer("appointments_optimized").default(0),
  efficiencyGain: decimal("efficiency_gain", { precision: 5, scale: 2 }), // percentage
  technicianUtilization: jsonb("technician_utilization"), // {technicianId: utilizationPercent}
  suggestions: jsonb("suggestions"), // AI suggestions applied
  status: varchar("status", { length: 50 }).default("pending"), // pending, applied, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 82: Parts Auto-Reordering
export const autoReorderRules = pgTable("auto_reorder_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  partId: uuid("part_id").references(() => spareParts.id).notNull(),
  reorderPoint: integer("reorder_point").notNull(), // stock level to trigger reorder
  reorderQuantity: integer("reorder_quantity").notNull(),
  preferredSupplier: varchar("preferred_supplier"),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const autoReorderHistory = pgTable("auto_reorder_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: uuid("rule_id").references(() => autoReorderRules.id).notNull(),
  partId: uuid("part_id").references(() => spareParts.id).notNull(),
  stockLevelAtTrigger: integer("stock_level_at_trigger").notNull(),
  quantityOrdered: integer("quantity_ordered").notNull(),
  supplier: varchar("supplier"),
  orderStatus: varchar("order_status", { length: 50 }).default("pending"), // pending, ordered, received, cancelled
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id),
  triggeredAt: timestamp("triggered_at").defaultNow(),
});

// Module 83: Multi-Location Routing
export const routingOptimizations = pgTable("routing_optimizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  routeDate: timestamp("route_date").notNull(),
  routeType: varchar("route_type", { length: 50 }).notNull(), // parts_transfer, towing, mobile_service
  startLocation: varchar("start_location"),
  stops: jsonb("stops").notNull(), // array of {location, type, priority, timeWindow}
  optimizedRoute: jsonb("optimized_route"), // ordered stops with distances/times
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // minutes
  assignedDriver: varchar("assigned_driver").references(() => users.id),
  status: varchar("status", { length: 50 }).default("planned"), // planned, in_progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 84: Time Clock & Payroll
export const timeClockEntries = pgTable("time_clock_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  employeeId: varchar("employee_id").references(() => users.id).notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  breakDuration: integer("break_duration").default(0), // minutes
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  location: varchar("location"), // GPS or garage location
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollPeriods = pgTable("payroll_periods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  payDate: timestamp("pay_date").notNull(),
  status: varchar("status", { length: 50 }).default("draft"), // draft, processing, approved, paid
  totalGrossPay: decimal("total_gross_pay", { precision: 12, scale: 2 }),
  totalDeductions: decimal("total_deductions", { precision: 12, scale: 2 }),
  totalNetPay: decimal("total_net_pay", { precision: 12, scale: 2 }),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollEntries = pgTable("payroll_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  periodId: uuid("period_id").references(() => payrollPeriods.id).notNull(),
  employeeId: varchar("employee_id").references(() => users.id).notNull(),
  regularHours: decimal("regular_hours", { precision: 5, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0"),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  taxDeductions: decimal("tax_deductions", { precision: 10, scale: 2 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).default("0"),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("direct_deposit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 85: Equipment Calibration
export const equipmentCalibration = pgTable("equipment_calibration", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  toolId: uuid("tool_id").references(() => tools.id).notNull(),
  calibrationType: varchar("calibration_type", { length: 100 }).notNull(), // torque, alignment, diagnostic, etc
  calibrationStandard: varchar("calibration_standard"), // ISO, NIST, etc
  lastCalibrationDate: timestamp("last_calibration_date").notNull(),
  nextCalibrationDue: timestamp("next_calibration_due").notNull(),
  calibrationInterval: integer("calibration_interval").notNull(), // days
  calibratedBy: varchar("calibrated_by"),
  certificationNumber: varchar("certification_number"),
  calibrationResults: jsonb("calibration_results"), // measurements, pass/fail
  status: varchar("status", { length: 50 }).default("valid"), // valid, due, overdue, failed
  attachments: jsonb("attachments"), // certification documents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calibrationReminders = pgTable("calibration_reminders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  calibrationId: uuid("calibration_id").references(() => equipmentCalibration.id).notNull(),
  reminderDate: timestamp("reminder_date").notNull(),
  notifiedUsers: jsonb("notified_users"), // array of user IDs
  status: varchar("status", { length: 50 }).default("pending"), // pending, sent, completed
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Phase 5
export type AiSchedulingRule = typeof aiSchedulingRules.$inferSelect;
export type InsertAiSchedulingRule = typeof aiSchedulingRules.$inferInsert;
export const insertAiSchedulingRuleSchema = createInsertSchema(aiSchedulingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SchedulingOptimization = typeof schedulingOptimizations.$inferSelect;
export type InsertSchedulingOptimization = typeof schedulingOptimizations.$inferInsert;
export const insertSchedulingOptimizationSchema = createInsertSchema(schedulingOptimizations).omit({
  id: true,
  createdAt: true,
});

export type AutoReorderRule = typeof autoReorderRules.$inferSelect;
export type InsertAutoReorderRule = typeof autoReorderRules.$inferInsert;
export const insertAutoReorderRuleSchema = createInsertSchema(autoReorderRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AutoReorderHistory = typeof autoReorderHistory.$inferSelect;
export type InsertAutoReorderHistory = typeof autoReorderHistory.$inferInsert;
export const insertAutoReorderHistorySchema = createInsertSchema(autoReorderHistory).omit({
  id: true,
  triggeredAt: true,
});

export type RoutingOptimization = typeof routingOptimizations.$inferSelect;
export type InsertRoutingOptimization = typeof routingOptimizations.$inferInsert;
export const insertRoutingOptimizationSchema = createInsertSchema(routingOptimizations).omit({
  id: true,
  createdAt: true,
});

export type TimeClockEntry = typeof timeClockEntries.$inferSelect;
export type InsertTimeClockEntry = typeof timeClockEntries.$inferInsert;
export const insertTimeClockEntrySchema = createInsertSchema(timeClockEntries).omit({
  id: true,
  createdAt: true,
});

export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type InsertPayrollPeriod = typeof payrollPeriods.$inferInsert;
export const insertPayrollPeriodSchema = createInsertSchema(payrollPeriods).omit({
  id: true,
  createdAt: true,
});

export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type InsertPayrollEntry = typeof payrollEntries.$inferInsert;
export const insertPayrollEntrySchema = createInsertSchema(payrollEntries).omit({
  id: true,
  createdAt: true,
});

export type EquipmentCalibration = typeof equipmentCalibration.$inferSelect;
export type InsertEquipmentCalibration = typeof equipmentCalibration.$inferInsert;
export const insertEquipmentCalibrationSchema = createInsertSchema(equipmentCalibration).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CalibrationReminder = typeof calibrationReminders.$inferSelect;
export type InsertCalibrationReminder = typeof calibrationReminders.$inferInsert;
export const insertCalibrationReminderSchema = createInsertSchema(calibrationReminders).omit({
  id: true,
  createdAt: true,
});

// ========================================
// PHASE 6: COMPLIANCE & QUALITY
// ========================================

// Module 86: Environmental Compliance
export const environmentalCompliance = pgTable("environmental_compliance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  complianceType: varchar("compliance_type", { length: 100 }).notNull(), // waste_disposal, emissions, recycling
  recordDate: timestamp("record_date").notNull(),
  wasteType: varchar("waste_type"), // oil, coolant, batteries, tires, etc
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  disposalMethod: varchar("disposal_method"),
  disposalCompany: varchar("disposal_company"),
  certificationNumber: varchar("certification_number"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  regulatoryStandard: varchar("regulatory_standard"), // EPA, state regulations
  attachments: jsonb("attachments"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 87: ISO 9001 Quality Management
export const qualityChecklists = pgTable("quality_checklists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name").notNull(),
  category: varchar("category", { length: 100 }), // service_delivery, parts_inspection, customer_satisfaction
  checklistItems: jsonb("checklistItems").notNull(), // array of items with pass/fail criteria
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nonConformances = pgTable("non_conformances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  ncNumber: varchar("nc_number").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }), // product, process, customer_complaint
  severity: varchar("severity", { length: 50 }), // minor, major, critical
  detectedBy: varchar("detected_by").references(() => users.id).notNull(),
  detectedDate: timestamp("detected_date").notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  rootCause: text("root_cause"),
  status: varchar("status", { length: 50 }).default("open"), // open, investigating, resolved, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const correctiveActions = pgTable("corrective_actions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nonConformanceId: uuid("non_conformance_id").references(() => nonConformances.id).notNull(),
  actionDescription: text("action_description").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id).notNull(),
  dueDate: timestamp("due_date").notNull(),
  completedDate: timestamp("completed_date"),
  effectiveness: varchar("effectiveness", { length: 50 }), // effective, partially_effective, ineffective
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedDate: timestamp("verified_date"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 88: Safety Incident Reporting
export const safetyIncidents = pgTable("safety_incidents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  incidentNumber: varchar("incident_number").notNull().unique(),
  incidentDate: timestamp("incident_date").notNull(),
  incidentType: varchar("incident_type", { length: 100 }).notNull(), // injury, near_miss, property_damage, spill
  severity: varchar("severity", { length: 50 }).notNull(), // minor, moderate, serious, fatal
  location: varchar("location"),
  involvedPersons: jsonb("involved_persons"), // array of person objects
  witnesses: jsonb("witnesses"),
  description: text("description").notNull(),
  immediateActions: text("immediate_actions"),
  reportedBy: varchar("reported_by").references(() => users.id).notNull(),
  oshaRecordable: boolean("osha_recordable").default(false),
  medicalTreatment: boolean("medical_treatment").default(false),
  lostWorkDays: integer("lost_work_days").default(0),
  status: varchar("status", { length: 50 }).default("reported"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const incidentInvestigations = pgTable("incident_investigations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: uuid("incident_id").references(() => safetyIncidents.id).notNull(),
  investigator: varchar("investigator").references(() => users.id).notNull(),
  rootCauseAnalysis: text("root_cause_analysis"),
  contributingFactors: jsonb("contributing_factors"),
  preventiveMeasures: jsonb("preventive_measures"),
  completedDate: timestamp("completed_date"),
  status: varchar("status", { length: 50 }).default("in_progress"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 89: Insurance Claims
export const insuranceClaims = pgTable("insurance_claims", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  claimNumber: varchar("claim_number").notNull().unique(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  insuranceCompany: varchar("insurance_company").notNull(),
  policyNumber: varchar("policy_number"),
  claimType: varchar("claim_type", { length: 100 }), // collision, comprehensive, liability
  incidentDate: timestamp("incident_date").notNull(),
  claimAmount: decimal("claim_amount", { precision: 12, scale: 2 }).notNull(),
  approvedAmount: decimal("approved_amount", { precision: 12, scale: 2 }),
  deductible: decimal("deductible", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("submitted"),
  adjusterName: varchar("adjuster_name"),
  adjusterContact: varchar("adjuster_contact"),
  estimateUrl: varchar("estimate_url"),
  documents: jsonb("documents"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================================
// PHASE 7: ADVANCED HARDWARE
// ========================================

// Module 90: Barcode/QR Scanner
export const barcodeScans = pgTable("barcode_scans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  scanType: varchar("scan_type", { length: 50 }).notNull(), // part_inventory, vehicle_checkin, tool_tracking
  barcodeData: varchar("barcode_data").notNull(),
  partId: uuid("part_id").references(() => spareParts.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  toolId: uuid("tool_id").references(() => tools.id),
  scannedBy: varchar("scanned_by").references(() => users.id).notNull(),
  location: varchar("location"),
  associatedAction: varchar("associated_action"), // check_in, check_out, inventory_update
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 91: Digital Signage
export const signageDisplays = pgTable("signage_displays", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  displayName: varchar("display_name").notNull(),
  location: varchar("location"), // waiting_room, service_area, entrance
  displayType: varchar("display_type", { length: 50 }), // service_status, promotions, mixed
  isActive: boolean("is_active").default(true),
  orientation: varchar("orientation", { length: 20 }).default("landscape"),
  refreshInterval: integer("refresh_interval").default(30), // seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const signageContent = pgTable("signage_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: uuid("display_id").references(() => signageDisplays.id).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // job_status, promotion, announcement, video
  priority: integer("priority").default(1),
  content: jsonb("content").notNull(), // flexible content structure
  duration: integer("duration").default(10), // seconds
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 92: Kiosk Check-In
export const kioskSessions = pgTable("kiosk_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  kioskId: varchar("kiosk_id").notNull(),
  sessionStart: timestamp("session_start").defaultNow(),
  sessionEnd: timestamp("session_end"),
  customerId: varchar("customer_id").references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  checkInCompleted: boolean("check_in_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kioskCheckIns = pgTable("kiosk_check_ins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").references(() => kioskSessions.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  serviceRequested: jsonb("service_requested"),
  mileage: integer("mileage"),
  signatureUrl: varchar("signature_url"),
  checkInTime: timestamp("check_in_time").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 93: Security Cameras
export const securityCameras = pgTable("security_cameras", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  cameraName: varchar("camera_name").notNull(),
  location: varchar("location").notNull(),
  cameraType: varchar("camera_type", { length: 50 }), // indoor, outdoor, PTZ
  streamUrl: varchar("stream_url"),
  recordingEnabled: boolean("recording_enabled").default(true),
  motionDetection: boolean("motion_detection").default(true),
  retentionDays: integer("retention_days").default(30),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cameraRecordings = pgTable("camera_recordings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cameraId: uuid("camera_id").references(() => securityCameras.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  recordingStart: timestamp("recording_start").notNull(),
  recordingEnd: timestamp("recording_end").notNull(),
  recordingUrl: varchar("recording_url"),
  fileSize: integer("file_size"), // MB
  eventType: varchar("event_type", { length: 50 }), // motion, manual, incident
  isBookmarked: boolean("is_bookmarked").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 94: License Plate Recognition
export const licensePlateScans = pgTable("license_plate_scans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  plateNumber: varchar("plate_number").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // recognition confidence %
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  customerId: varchar("customer_id").references(() => users.id),
  cameraId: uuid("camera_id").references(() => securityCameras.id),
  imageUrl: varchar("image_url"),
  scanType: varchar("scan_type", { length: 50 }), // entry, exit, parking
  location: varchar("location"),
  matchedAutomatically: boolean("matched_automatically").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicleEntryLogs = pgTable("vehicle_entry_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id),
  plateNumber: varchar("plate_number"),
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  duration: integer("duration"), // minutes
  purpose: varchar("purpose"), // service, dropoff, pickup
  entryScanId: uuid("entry_scan_id").references(() => licensePlateScans.id),
  exitScanId: uuid("exit_scan_id").references(() => licensePlateScans.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Phase 6
export type EnvironmentalCompliance = typeof environmentalCompliance.$inferSelect;
export type InsertEnvironmentalCompliance = typeof environmentalCompliance.$inferInsert;
export const insertEnvironmentalComplianceSchema = createInsertSchema(environmentalCompliance).omit({
  id: true,
  createdAt: true,
});

export type QualityChecklist = typeof qualityChecklists.$inferSelect;
export type InsertQualityChecklist = typeof qualityChecklists.$inferInsert;
export const insertQualityChecklistSchema = createInsertSchema(qualityChecklists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NonConformance = typeof nonConformances.$inferSelect;
export type InsertNonConformance = typeof nonConformances.$inferInsert;
export const insertNonConformanceSchema = createInsertSchema(nonConformances).omit({
  id: true,
  createdAt: true,
});

export type CorrectiveAction = typeof correctiveActions.$inferSelect;
export type InsertCorrectiveAction = typeof correctiveActions.$inferInsert;
export const insertCorrectiveActionSchema = createInsertSchema(correctiveActions).omit({
  id: true,
  createdAt: true,
});

export type SafetyIncident = typeof safetyIncidents.$inferSelect;
export type InsertSafetyIncident = typeof safetyIncidents.$inferInsert;
export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({
  id: true,
  createdAt: true,
});

export type IncidentInvestigation = typeof incidentInvestigations.$inferSelect;
export type InsertIncidentInvestigation = typeof incidentInvestigations.$inferInsert;
export const insertIncidentInvestigationSchema = createInsertSchema(incidentInvestigations).omit({
  id: true,
  createdAt: true,
});

export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = typeof insuranceClaims.$inferInsert;
export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for Phase 7
export type BarcodeScan = typeof barcodeScans.$inferSelect;
export type InsertBarcodeScan = typeof barcodeScans.$inferInsert;
export const insertBarcodeScanSchema = createInsertSchema(barcodeScans).omit({
  id: true,
  createdAt: true,
});

export type SignageDisplay = typeof signageDisplays.$inferSelect;
export type InsertSignageDisplay = typeof signageDisplays.$inferInsert;
export const insertSignageDisplaySchema = createInsertSchema(signageDisplays).omit({
  id: true,
  createdAt: true,
});

export type SignageContent = typeof signageContent.$inferSelect;
export type InsertSignageContent = typeof signageContent.$inferInsert;
export const insertSignageContentSchema = createInsertSchema(signageContent).omit({
  id: true,
  createdAt: true,
});

export type KioskSession = typeof kioskSessions.$inferSelect;
export type InsertKioskSession = typeof kioskSessions.$inferInsert;
export const insertKioskSessionSchema = createInsertSchema(kioskSessions).omit({
  id: true,
  createdAt: true,
});

export type KioskCheckIn = typeof kioskCheckIns.$inferSelect;
export type InsertKioskCheckIn = typeof kioskCheckIns.$inferInsert;
export const insertKioskCheckInSchema = createInsertSchema(kioskCheckIns).omit({
  id: true,
  createdAt: true,
});

export type SecurityCamera = typeof securityCameras.$inferSelect;
export type InsertSecurityCamera = typeof securityCameras.$inferInsert;
export const insertSecurityCameraSchema = createInsertSchema(securityCameras).omit({
  id: true,
  createdAt: true,
});

export type CameraRecording = typeof cameraRecordings.$inferSelect;
export type InsertCameraRecording = typeof cameraRecordings.$inferInsert;
export const insertCameraRecordingSchema = createInsertSchema(cameraRecordings).omit({
  id: true,
  createdAt: true,
});

export type LicensePlateScan = typeof licensePlateScans.$inferSelect;
export type InsertLicensePlateScan = typeof licensePlateScans.$inferInsert;
export const insertLicensePlateScanSchema = createInsertSchema(licensePlateScans).omit({
  id: true,
  createdAt: true,
});

export type VehicleEntryLog = typeof vehicleEntryLogs.$inferSelect;
export type InsertVehicleEntryLog = typeof vehicleEntryLogs.$inferInsert;
export const insertVehicleEntryLogSchema = createInsertSchema(vehicleEntryLogs).omit({
  id: true,
  createdAt: true,
});

// ========================================
// SAUDI ARABIA TAX & COMPLIANCE
// ========================================

// Saudi VAT & ZATCA E-Invoicing Compliance
export const saudiTaxCompliance = pgTable("saudi_tax_compliance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull().unique(),
  
  // VAT Registration
  vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }), // TRN (Tax Registration Number) - 15 digits
  vatRegistrationDate: timestamp("vat_registration_date"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15.00"), // Saudi VAT is 15%
  isVatRegistered: boolean("is_vat_registered").default(false),
  
  // ZATCA E-Invoicing Compliance (Fatoora)
  zatcaCertificateId: varchar("zatca_certificate_id", { length: 100 }),
  zatcaComplianceStatus: varchar("zatca_compliance_status", { length: 50 }).default("pending"), // pending, compliant, non_compliant
  zatcaLastSync: timestamp("zatca_last_sync"),
  
  // Zakat (Islamic Tax) - Optional for businesses
  zakatEnabled: boolean("zakat_enabled").default(false),
  zakatRate: decimal("zakat_rate", { precision: 5, scale: 2 }).default("2.50"), // Typically 2.5% on wealth
  
  // Hijri Calendar Support
  useHijriCalendar: boolean("use_hijri_calendar").default(false),
  
  // Company Details for Tax Invoices
  companyNameArabic: varchar("company_name_arabic", { length: 255 }),
  commercialRegistrationNumber: varchar("commercial_registration_number", { length: 50 }),
  addressLine1Arabic: varchar("address_line1_arabic", { length: 255 }),
  addressLine2Arabic: varchar("address_line2_arabic", { length: 255 }),
  cityArabic: varchar("city_arabic", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types and schemas for Saudi compliance
export type SaudiTaxCompliance = typeof saudiTaxCompliance.$inferSelect;
export type InsertSaudiTaxCompliance = typeof saudiTaxCompliance.$inferInsert;
export const insertSaudiTaxComplianceSchema = createInsertSchema(saudiTaxCompliance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ========================================
// EMERGING TECHNOLOGIES (12 FEATURES)
// ========================================

// 1. BLOCKCHAIN VEHICLE HISTORY
export const blockchainRecords = pgTable("blockchain_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  recordType: varchar("record_type", { length: 50 }).notNull(), // service, repair, inspection, ownership_transfer
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull().unique(), // Blockchain transaction hash
  blockNumber: integer("block_number"),
  blockchainNetwork: varchar("blockchain_network", { length: 50 }).default("ethereum"), // ethereum, polygon, etc.
  recordData: jsonb("record_data").notNull(), // Service details, parts used, etc.
  previousHash: varchar("previous_hash", { length: 66 }), // Link to previous record
  timestamp: timestamp("timestamp").notNull(),
  verificationStatus: varchar("verification_status", { length: 20 }).default("verified"), // verified, pending, failed
  smartContractAddress: varchar("smart_contract_address", { length: 42 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. AUGMENTED REALITY REPAIR GUIDES
export const arRepairGuides = pgTable("ar_repair_guides", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  repairCategory: varchar("repair_category", { length: 100 }), // engine, transmission, brakes, etc.
  difficultyLevel: varchar("difficulty_level", { length: 20 }).default("intermediate"), // beginner, intermediate, expert
  estimatedDuration: integer("estimated_duration"), // in minutes
  arModelUrl: varchar("ar_model_url", { length: 500 }), // 3D model for AR overlay
  steps: jsonb("steps"), // Step-by-step instructions with AR positions
  requiredTools: jsonb("required_tools"),
  safetyWarnings: text("safety_warnings"),
  viewCount: integer("view_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  isPublished: boolean("is_published").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const arGuideSessions = pgTable("ar_guide_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: uuid("guide_id").references(() => arRepairGuides.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
  stepsCompleted: integer("steps_completed").default(0),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // percentage
  rating: integer("rating"), // 1-5
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. IOT SENSOR INTEGRATION
export const iotSensors = pgTable("iot_sensors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  sensorType: varchar("sensor_type", { length: 50 }).notNull(), // obd2, tpms, temperature, battery, fuel
  sensorIdentifier: varchar("sensor_identifier", { length: 100 }).notNull().unique(), // Device ID
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  installationDate: timestamp("installation_date"),
  lastCommunication: timestamp("last_communication"),
  batteryLevel: integer("battery_level"), // percentage
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, offline, fault
  alertsEnabled: boolean("alerts_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const iotSensorReadings = pgTable("iot_sensor_readings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sensorId: uuid("sensor_id").references(() => iotSensors.id).notNull(),
  readingType: varchar("reading_type", { length: 50 }).notNull(), // dtc, rpm, speed, temp, pressure
  value: decimal("value", { precision: 12, scale: 4 }).notNull(), // Increased precision for accurate sensor data
  unit: varchar("unit", { length: 20 }), // rpm, celsius, psi, volts
  threshold: decimal("threshold", { precision: 12, scale: 4 }), // Alert threshold with increased precision
  isAbnormal: boolean("is_abnormal").default(false),
  rawData: jsonb("raw_data"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Performance indexes for time-series queries
  index("idx_iot_readings_sensor_timestamp").on(table.sensorId, table.timestamp),
  index("idx_iot_readings_timestamp").on(table.timestamp),
]);

export const iotAlerts = pgTable("iot_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sensorId: uuid("sensor_id").references(() => iotSensors.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // critical, warning, info
  severity: varchar("severity", { length: 20 }).default("medium"), // low, medium, high, critical
  message: text("message").notNull(),
  triggerValue: decimal("trigger_value", { precision: 12, scale: 4 }), // Increased precision
  recommendedAction: text("recommended_action"),
  status: varchar("status", { length: 20 }).default("active"), // active, acknowledged, resolved
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  jobCardId: uuid("job_card_id").references(() => jobCards.id), // Link to auto-created job cards
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Performance indexes for alert queries
  index("idx_iot_alerts_sensor_status").on(table.sensorId, table.status),
  index("idx_iot_alerts_vehicle").on(table.vehicleId),
  index("idx_iot_alerts_status").on(table.status),
]);

// 4. 3D PARTS VISUALIZATION
export const parts3DModels = pgTable("parts_3d_models", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  partName: varchar("part_name", { length: 255 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  category: varchar("category", { length: 100 }), // engine, transmission, suspension, etc.
  manufacturer: varchar("manufacturer", { length: 100 }),
  modelFileUrl: varchar("model_file_url", { length: 500 }).notNull(), // .glb, .gltf, .obj
  textureFileUrl: varchar("texture_file_url", { length: 500 }),
  fileSize: integer("file_size"), // in KB
  polygonCount: integer("polygon_count"),
  compatibility: jsonb("compatibility"), // Compatible vehicles
  explosionViewUrl: varchar("explosion_view_url", { length: 500 }), // Assembly view
  annotations: jsonb("annotations"), // Labels and callouts
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  isPublic: boolean("is_public").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parts3DViewSessions = pgTable("parts_3d_view_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: uuid("model_id").references(() => parts3DModels.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  sessionType: varchar("session_type", { length: 50 }).default("view"), // view, customer_approval, training
  duration: integer("duration"), // in seconds
  interactions: jsonb("interactions"), // Rotations, zooms, annotations added
  approved: boolean("approved"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. DRONE INSPECTION SERVICES
export const droneInspections = pgTable("drone_inspections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  inspectionType: varchar("inspection_type", { length: 50 }).notNull(), // exterior, roof, undercarriage, accident
  droneModel: varchar("drone_model", { length: 100 }),
  pilotId: varchar("pilot_id").references(() => users.id),
  flightDuration: integer("flight_duration"), // in seconds
  altitudeRange: varchar("altitude_range", { length: 50 }), // "2-10 meters"
  weatherConditions: varchar("weather_conditions", { length: 100 }),
  imageCount: integer("image_count").default(0),
  videoCount: integer("video_count").default(0),
  damageDetected: boolean("damage_detected").default(false),
  aiAnalysisCompleted: boolean("ai_analysis_completed").default(false),
  inspectionStatus: varchar("inspection_status", { length: 20 }).default("scheduled"), // scheduled, in_progress, completed, cancelled
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  reportUrl: varchar("report_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const droneMedia = pgTable("drone_media", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: uuid("inspection_id").references(() => droneInspections.id).notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // image, video
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  fileSize: integer("file_size"), // in KB
  resolution: varchar("resolution", { length: 20 }), // "4K", "1080p"
  captureAngle: varchar("capture_angle", { length: 50 }), // top, front, rear, side
  gpsCoordinates: varchar("gps_coordinates", { length: 100 }),
  altitude: decimal("altitude", { precision: 6, scale: 2 }), // in meters
  damageAnnotations: jsonb("damage_annotations"), // AI-detected damage areas
  aiConfidenceScore: decimal("ai_confidence_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. AI VIDEO ANALYSIS
export const aiVideoAnalysis = pgTable("ai_video_analysis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  videoSize: integer("video_size"), // in MB
  videoDuration: integer("video_duration"), // in seconds
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  analysisStatus: varchar("analysis_status", { length: 20 }).default("pending"), // pending, processing, completed, failed
  aiModel: varchar("ai_model", { length: 50 }).default("gpt-4-vision"), // OpenAI model used
  detectedIssues: jsonb("detected_issues"), // Array of detected problems
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // Overall confidence
  suggestedServices: jsonb("suggested_services"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  priorityLevel: varchar("priority_level", { length: 20 }).default("medium"), // low, medium, high, urgent
  triageCategory: varchar("triage_category", { length: 50 }), // safety_critical, maintenance, cosmetic
  appointmentScheduled: boolean("appointment_scheduled").default(false),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  analysisNotes: text("analysis_notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. DIGITAL TWIN TECHNOLOGY
export const digitalTwins = pgTable("digital_twins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull().unique(),
  twinStatus: varchar("twin_status", { length: 20 }).default("active"), // active, updating, archived
  lastSyncedAt: timestamp("last_synced_at"),
  dataPoints: integer("data_points").default(0), // Number of data points collected
  simulationRuns: integer("simulation_runs").default(0),
  virtualModel: jsonb("virtual_model"), // 3D model data
  sensorData: jsonb("sensor_data"), // Latest sensor readings
  maintenanceHistory: jsonb("maintenance_history"),
  wearPatterns: jsonb("wear_patterns"), // Predicted wear on components
  performanceMetrics: jsonb("performance_metrics"),
  fuelEfficiency: decimal("fuel_efficiency", { precision: 5, scale: 2 }),
  predictedFailures: jsonb("predicted_failures"), // AI predictions
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  estimatedRemainingLife: integer("estimated_remaining_life"), // in months
  totalMileage: integer("total_mileage"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const twinSimulations = pgTable("twin_simulations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  twinId: uuid("twin_id").references(() => digitalTwins.id).notNull(),
  simulationType: varchar("simulation_type", { length: 50 }).notNull(), // repair_test, wear_prediction, performance
  parameters: jsonb("parameters"), // Simulation inputs
  results: jsonb("results"), // Simulation outputs
  duration: integer("duration"), // in seconds
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  recommendations: jsonb("recommendations"),
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. MACHINE LEARNING FRAUD DETECTION
export const fraudDetectionCases = pgTable("fraud_detection_cases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  caseType: varchar("case_type", { length: 50 }).notNull(), // warranty_fraud, parts_theft, false_claim, price_manipulation
  entityType: varchar("entity_type", { length: 50 }), // invoice, warranty_claim, customer, employee
  entityId: varchar("entity_id", { length: 100 }),
  detectionMethod: varchar("detection_method", { length: 50 }).default("ml_algorithm"), // ml_algorithm, pattern_analysis, manual_report
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(), // 0-100
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // ML confidence
  anomalyIndicators: jsonb("anomaly_indicators"), // What triggered the alert
  suspiciousPatterns: jsonb("suspicious_patterns"),
  historicalData: jsonb("historical_data"), // Related past incidents
  estimatedLoss: decimal("estimated_loss", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("detected"), // detected, investigating, confirmed, false_positive, resolved
  investigator: varchar("investigator").references(() => users.id),
  investigationNotes: text("investigation_notes"),
  resolution: text("resolution"),
  actionTaken: text("action_taken"),
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fraudDetectionRules = pgTable("fraud_detection_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // threshold, pattern, anomaly, ml_model
  category: varchar("category", { length: 50 }), // warranty, inventory, pricing, employee
  conditions: jsonb("conditions").notNull(), // Rule logic
  threshold: decimal("threshold", { precision: 10, scale: 2 }),
  severity: varchar("severity", { length: 20 }).default("medium"), // low, medium, high, critical
  isActive: boolean("is_active").default(true),
  triggerCount: integer("trigger_count").default(0),
  falsePositiveRate: decimal("false_positive_rate", { precision: 5, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 9. BIOMETRIC AUTHENTICATION
export const biometricProfiles = pgTable("biometric_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  fingerprintHash: varchar("fingerprint_hash", { length: 255 }), // Encrypted fingerprint template
  faceEmbedding: text("face_embedding"), // Encrypted face recognition data
  voiceprintHash: varchar("voiceprint_hash", { length: 255 }),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  lastVerified: timestamp("last_verified"),
  verificationCount: integer("verification_count").default(0),
  failedAttempts: integer("failed_attempts").default(0),
  isActive: boolean("is_active").default(true),
  deviceBindings: jsonb("device_bindings"), // Authorized devices
  securityLevel: varchar("security_level", { length: 20 }).default("standard"), // standard, high, maximum
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const biometricLogs = pgTable("biometric_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").references(() => biometricProfiles.id).notNull(),
  authenticationType: varchar("authentication_type", { length: 50 }).notNull(), // fingerprint, face, voice
  success: boolean("success").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // Match confidence
  deviceId: varchar("device_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  location: varchar("location", { length: 255 }),
  action: varchar("action", { length: 100 }), // clock_in, tool_access, approval, etc.
  failureReason: varchar("failure_reason", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 10. 5G REAL-TIME COLLABORATION
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  sessionType: varchar("session_type", { length: 50 }).default("video_consultation"), // video_consultation, screen_share, ar_assisted
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  hostUserId: varchar("host_user_id").references(() => users.id).notNull(),
  expertUserId: varchar("expert_user_id").references(() => users.id),
  participants: jsonb("participants"), // Array of participant IDs
  sessionStatus: varchar("session_status", { length: 20 }).default("scheduled"), // scheduled, active, completed, cancelled
  connectionQuality: varchar("connection_quality", { length: 20 }), // excellent, good, fair, poor
  bandwidth: integer("bandwidth"), // in Mbps
  latency: integer("latency"), // in ms
  recordingUrl: varchar("recording_url", { length: 500 }),
  transcript: text("transcript"),
  sharedNotes: text("shared_notes"),
  resolution: varchar("resolution", { length: 255 }),
  rating: integer("rating"), // 1-5
  feedback: text("feedback"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const collaborationExperts = pgTable("collaboration_experts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  specialization: jsonb("specialization"), // Array of specialties
  certifications: jsonb("certifications"),
  availability: jsonb("availability"), // Schedule
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalSessions: integer("total_sessions").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  languages: jsonb("languages"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 11. EDGE COMPUTING DIAGNOSTICS
export const edgeDevices = pgTable("edge_devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  deviceType: varchar("device_type", { length: 50 }).notNull(), // diagnostic_scanner, edge_server, mobile_device
  deviceId: varchar("device_id", { length: 100 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 50 }),
  macAddress: varchar("mac_address", { length: 20 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  cpuUsage: decimal("cpu_usage", { precision: 5, scale: 2 }), // percentage
  memoryUsage: decimal("memory_usage", { precision: 5, scale: 2 }), // percentage
  storageUsage: decimal("storage_usage", { precision: 5, scale: 2 }), // percentage
  capabilities: jsonb("capabilities"), // Processing capabilities
  offlineMode: boolean("offline_mode").default(false),
  lastSync: timestamp("last_sync"),
  status: varchar("status", { length: 20 }).default("online"), // online, offline, syncing, error
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const edgeDiagnostics = pgTable("edge_diagnostics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: uuid("device_id").references(() => edgeDevices.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  diagnosticType: varchar("diagnostic_type", { length: 50 }).notNull(), // obd2, dtc_scan, emissions, performance
  processedLocally: boolean("processed_locally").default(true),
  dataSize: integer("data_size"), // in KB
  processingTime: integer("processing_time"), // in milliseconds
  rawData: jsonb("raw_data"),
  results: jsonb("results"),
  dtcCodes: jsonb("dtc_codes"),
  recommendations: jsonb("recommendations"),
  cloudSynced: boolean("cloud_synced").default(false),
  syncedAt: timestamp("synced_at"),
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 12. QUANTUM COMPUTING PRICE OPTIMIZATION
export const pricingOptimization = pgTable("pricing_optimization", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  optimizationType: varchar("optimization_type", { length: 50 }).notNull(), // service_pricing, parts_pricing, labor_rate
  serviceId: uuid("service_id"),
  partId: uuid("part_id"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  optimizedPrice: decimal("optimized_price", { precision: 10, scale: 2 }).notNull(),
  priceChange: decimal("price_change", { precision: 5, scale: 2 }), // percentage
  algorithm: varchar("algorithm", { length: 50 }).default("quantum_annealing"), // quantum_annealing, ml_regression, hybrid
  factors: jsonb("factors"), // Market demand, competition, costs, etc.
  competitorPrices: jsonb("competitor_prices"),
  demandForecast: jsonb("demand_forecast"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  estimatedRevenueImpact: decimal("estimated_revenue_impact", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("suggested"), // suggested, approved, rejected, implemented
  implementedAt: timestamp("implemented_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // dynamic, seasonal, competitor_based, demand_based
  conditions: jsonb("conditions").notNull(),
  priceAdjustment: jsonb("price_adjustment"), // How to adjust prices
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  priority: integer("priority").default(50), // 1-100, higher = more important
  isActive: boolean("is_active").default(true),
  triggerCount: integer("trigger_count").default(0),
  revenueImpact: decimal("revenue_impact", { precision: 12, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================================
// TYPE EXPORTS FOR EMERGING TECHNOLOGIES
// ========================================

// 1. Blockchain
export type BlockchainRecord = typeof blockchainRecords.$inferSelect;
export type InsertBlockchainRecord = typeof blockchainRecords.$inferInsert;
export const insertBlockchainRecordSchema = createInsertSchema(blockchainRecords).omit({
  id: true,
  createdAt: true,
});

// 2. AR Repair Guides
export type ARRepairGuide = typeof arRepairGuides.$inferSelect;
export type InsertARRepairGuide = typeof arRepairGuides.$inferInsert;
export const insertARRepairGuideSchema = createInsertSchema(arRepairGuides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ARGuideSession = typeof arGuideSessions.$inferSelect;
export type InsertARGuideSession = typeof arGuideSessions.$inferInsert;
export const insertARGuideSessionSchema = createInsertSchema(arGuideSessions).omit({
  id: true,
  createdAt: true,
});

// 3. IoT Sensors
export type IoTSensor = typeof iotSensors.$inferSelect;
export type InsertIoTSensor = typeof iotSensors.$inferInsert;
export const insertIoTSensorSchema = createInsertSchema(iotSensors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type IoTSensorReading = typeof iotSensorReadings.$inferSelect;
export type InsertIoTSensorReading = typeof iotSensorReadings.$inferInsert;
export const insertIoTSensorReadingSchema = createInsertSchema(iotSensorReadings).omit({
  id: true,
  createdAt: true,
});

export type IoTAlert = typeof iotAlerts.$inferSelect;
export type InsertIoTAlert = typeof iotAlerts.$inferInsert;
export const insertIoTAlertSchema = createInsertSchema(iotAlerts).omit({
  id: true,
  createdAt: true,
});

// 4. 3D Parts
export type Parts3DModel = typeof parts3DModels.$inferSelect;
export type InsertParts3DModel = typeof parts3DModels.$inferInsert;
export const insertParts3DModelSchema = createInsertSchema(parts3DModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Parts3DViewSession = typeof parts3DViewSessions.$inferSelect;
export type InsertParts3DViewSession = typeof parts3DViewSessions.$inferInsert;
export const insertParts3DViewSessionSchema = createInsertSchema(parts3DViewSessions).omit({
  id: true,
  createdAt: true,
});

// 5. Drone Inspections
export type DroneInspection = typeof droneInspections.$inferSelect;
export type InsertDroneInspection = typeof droneInspections.$inferInsert;
export const insertDroneInspectionSchema = createInsertSchema(droneInspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DroneMedia = typeof droneMedia.$inferSelect;
export type InsertDroneMedia = typeof droneMedia.$inferInsert;
export const insertDroneMediaSchema = createInsertSchema(droneMedia).omit({
  id: true,
  createdAt: true,
});

// 6. AI Video Analysis
export type AIVideoAnalysis = typeof aiVideoAnalysis.$inferSelect;
export type InsertAIVideoAnalysis = typeof aiVideoAnalysis.$inferInsert;
export const insertAIVideoAnalysisSchema = createInsertSchema(aiVideoAnalysis).omit({
  id: true,
  createdAt: true,
});

// 7. Digital Twins
export type DigitalTwin = typeof digitalTwins.$inferSelect;
export type InsertDigitalTwin = typeof digitalTwins.$inferInsert;
export const insertDigitalTwinSchema = createInsertSchema(digitalTwins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TwinSimulation = typeof twinSimulations.$inferSelect;
export type InsertTwinSimulation = typeof twinSimulations.$inferInsert;
export const insertTwinSimulationSchema = createInsertSchema(twinSimulations).omit({
  id: true,
  createdAt: true,
});

// 8. Fraud Detection
export type FraudDetectionCase = typeof fraudDetectionCases.$inferSelect;
export type InsertFraudDetectionCase = typeof fraudDetectionCases.$inferInsert;
export const insertFraudDetectionCaseSchema = createInsertSchema(fraudDetectionCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FraudDetectionRule = typeof fraudDetectionRules.$inferSelect;
export type InsertFraudDetectionRule = typeof fraudDetectionRules.$inferInsert;
export const insertFraudDetectionRuleSchema = createInsertSchema(fraudDetectionRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 9. Biometric Authentication
export type BiometricProfile = typeof biometricProfiles.$inferSelect;
export type InsertBiometricProfile = typeof biometricProfiles.$inferInsert;
export const insertBiometricProfileSchema = createInsertSchema(biometricProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BiometricLog = typeof biometricLogs.$inferSelect;
export type InsertBiometricLog = typeof biometricLogs.$inferInsert;
export const insertBiometricLogSchema = createInsertSchema(biometricLogs).omit({
  id: true,
  createdAt: true,
});

// 10. 5G Collaboration
export type CollaborationSession = typeof collaborationSessions.$inferSelect;
export type InsertCollaborationSession = typeof collaborationSessions.$inferInsert;
export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).omit({
  id: true,
  createdAt: true,
});

export type CollaborationExpert = typeof collaborationExperts.$inferSelect;
export type InsertCollaborationExpert = typeof collaborationExperts.$inferInsert;
export const insertCollaborationExpertSchema = createInsertSchema(collaborationExperts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 11. Edge Computing
export type EdgeDevice = typeof edgeDevices.$inferSelect;
export type InsertEdgeDevice = typeof edgeDevices.$inferInsert;
export const insertEdgeDeviceSchema = createInsertSchema(edgeDevices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EdgeDiagnostic = typeof edgeDiagnostics.$inferSelect;
export type InsertEdgeDiagnostic = typeof edgeDiagnostics.$inferInsert;
export const insertEdgeDiagnosticSchema = createInsertSchema(edgeDiagnostics).omit({
  id: true,
  createdAt: true,
});

// 12. Quantum Pricing
export type PricingOptimization = typeof pricingOptimization.$inferSelect;
export type InsertPricingOptimization = typeof pricingOptimization.$inferInsert;
export const insertPricingOptimizationSchema = createInsertSchema(pricingOptimization).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = typeof pricingRules.$inferInsert;
export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ========================================
// PHASE 10: NEXT-GENERATION TECHNOLOGIES
// ========================================

// 1. Neural Network Vehicle Diagnostics
export const neuralDiagnostics = pgTable("neural_diagnostics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  modelVersion: varchar("model_version", { length: 50 }).notNull(),
  inputData: jsonb("input_data").notNull(),
  predictedFailures: jsonb("predicted_failures").notNull(),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }).notNull(),
  timeToFailure: integer("time_to_failure"),
  recommendedActions: text("recommended_actions").array(),
  actualOutcome: varchar("actual_outcome", { length: 100 }),
  accuracyRating: decimal("accuracy_rating", { precision: 5, scale: 2 }),
  trainingDataUsed: integer("training_data_used"),
  processingTimeMs: integer("processing_time_ms"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const neuralTrainingSessions = pgTable("neural_training_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  modelVersion: varchar("model_version", { length: 50 }).notNull(),
  datasetSize: integer("dataset_size").notNull(),
  epochs: integer("epochs").notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  loss: decimal("loss", { precision: 10, scale: 6 }),
  trainingDurationMinutes: integer("training_duration_minutes"),
  hyperparameters: jsonb("hyperparameters"),
  status: varchar("status", { length: 50 }).default("in_progress"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// 2. Computer Vision Quality Control
export const visionQualityChecks = pgTable("vision_quality_checks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  checkType: varchar("check_type", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  defectsDetected: jsonb("defects_detected").notNull(),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).notNull(),
  passedInspection: boolean("passed_inspection").default(false),
  inspectorId: varchar("inspector_id").references(() => users.id),
  manualOverride: boolean("manual_override").default(false),
  overrideReason: text("override_reason"),
  aiModel: varchar("ai_model", { length: 100 }).notNull(),
  processingTimeMs: integer("processing_time_ms"),
  annotatedImageUrl: varchar("annotated_image_url", { length: 500 }),
  status: varchar("status", { length: 50 }).default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visionDefects = pgTable("vision_defects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  qualityCheckId: uuid("quality_check_id").references(() => visionQualityChecks.id).notNull(),
  defectType: varchar("defect_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull(),
  location: jsonb("location").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  dimensions: jsonb("dimensions"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. NLP Service Writer
export const nlpServiceRequests = pgTable("nlp_service_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  customerId: varchar("customer_id").references(() => customerProfiles.userId).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  originalComplaint: text("original_complaint").notNull(),
  processedComplaint: text("processed_complaint").notNull(),
  extractedSymptoms: text("extracted_symptoms").array(),
  suggestedServices: jsonb("suggested_services").notNull(),
  urgencyLevel: varchar("urgency_level", { length: 50 }).notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  sentiment: varchar("sentiment", { length: 50 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  approved: boolean("approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nlpTrainingData = pgTable("nlp_training_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  originalText: text("original_text").notNull(),
  processedText: text("processed_text").notNull(),
  labels: text("labels").array(),
  category: varchar("category", { length: 100 }),
  isValidated: boolean("is_validated").default(false),
  validatedBy: varchar("validated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Reinforcement Learning Parts Optimizer
export const rlPartsOptimizations = pgTable("rl_parts_optimizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  partId: uuid("part_id").references(() => spareParts.id).notNull(),
  currentStockLevel: integer("current_stock_level").notNull(),
  recommendedStockLevel: integer("recommended_stock_level").notNull(),
  reorderPoint: integer("reorder_point").notNull(),
  reorderQuantity: integer("reorder_quantity").notNull(),
  expectedDemand: decimal("expected_demand", { precision: 10, scale: 2 }).notNull(),
  demandVariance: decimal("demand_variance", { precision: 10, scale: 2 }),
  leadTime: integer("lead_time").notNull(),
  holdingCost: decimal("holding_cost", { precision: 10, scale: 2 }),
  stockoutCost: decimal("stockout_cost", { precision: 10, scale: 2 }),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }).notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }),
  actionTaken: varchar("action_taken", { length: 100 }),
  modelVersion: varchar("model_version", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rlLearningEpisodes = pgTable("rl_learning_episodes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  episodeNumber: integer("episode_number").notNull(),
  totalReward: decimal("total_reward", { precision: 10, scale: 2 }).notNull(),
  averageReward: decimal("average_reward", { precision: 10, scale: 2 }),
  explorationRate: decimal("exploration_rate", { precision: 5, scale: 4 }),
  learningRate: decimal("learning_rate", { precision: 5, scale: 4 }),
  stepsCompleted: integer("steps_completed").notNull(),
  convergenceMetric: decimal("convergence_metric", { precision: 10, scale: 6 }),
  status: varchar("status", { length: 50 }).default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Metaverse Virtual Showroom
export const metaverseShowrooms = pgTable("metaverse_showrooms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  virtualWorldUrl: varchar("virtual_world_url", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  maxConcurrentUsers: integer("max_concurrent_users").default(50),
  currentUsers: integer("current_users").default(0),
  totalVisits: integer("total_visits").default(0),
  averageSessionDuration: integer("average_session_duration"),
  vehiclesDisplayed: integer("vehicles_displayed").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const metaverseVisits = pgTable("metaverse_visits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  showroomId: uuid("showroom_id").references(() => metaverseShowrooms.id).notNull(),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  duration: integer("duration"),
  vehiclesViewed: text("vehicles_viewed").array(),
  interactionCount: integer("interaction_count").default(0),
  leadGenerated: boolean("lead_generated").default(false),
  deviceType: varchar("device_type", { length: 100 }),
  vrHeadset: varchar("vr_headset", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// 6. Holographic Repair Instructions
export const holographicGuides = pgTable("holographic_guides", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  serviceId: uuid("service_id").references(() => serviceTemplates.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  hologramModelUrl: varchar("hologram_model_url", { length: 500 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  estimatedDuration: integer("estimated_duration").notNull(),
  steps: jsonb("steps").notNull(),
  safetyWarnings: text("safety_warnings").array(),
  requiredTools: text("required_tools").array(),
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  version: varchar("version", { length: 50 }).default("1.0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const holographicSessions = pgTable("holographic_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: uuid("guide_id").references(() => holographicGuides.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  deviceType: varchar("device_type", { length: 100 }).notNull(),
  sessionDuration: integer("session_duration"),
  stepsCompleted: integer("steps_completed").default(0),
  totalSteps: integer("total_steps").notNull(),
  errorsMade: integer("errors_made").default(0),
  completed: boolean("completed").default(false),
  rating: integer("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// 7. Spatial Computing Workshop
export const spatialWorkstations = pgTable("spatial_workstations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  deviceType: varchar("device_type", { length: 100 }).notNull(),
  deviceSerial: varchar("device_serial", { length: 255 }).unique(),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  calibrationStatus: varchar("calibration_status", { length: 50 }).default("calibrated"),
  lastCalibration: timestamp("last_calibration"),
  assignedTechnician: varchar("assigned_technician").references(() => users.id),
  isActive: boolean("is_active").default(true),
  batteryLevel: integer("battery_level"),
  usageHours: decimal("usage_hours", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const spatialDiagnosticSessions = pgTable("spatial_diagnostic_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workstationId: uuid("workstation_id").references(() => spatialWorkstations.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  sessionType: varchar("session_type", { length: 100 }).notNull(),
  duration: integer("duration"),
  diagnosticsPerformed: jsonb("diagnostics_performed").notNull(),
  issuesFound: integer("issues_found").default(0),
  virtualAssetsLoaded: integer("virtual_assets_loaded").default(0),
  handGesturesUsed: integer("hand_gestures_used").default(0),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// 8. Autonomous Robot Integration
export const autonomousRobots = pgTable("autonomous_robots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  robotName: varchar("robot_name", { length: 255 }).notNull(),
  robotType: varchar("robot_type", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }).unique().notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  capabilities: text("capabilities").array(),
  currentLocation: varchar("current_location", { length: 255 }),
  batteryLevel: integer("battery_level").default(100),
  status: varchar("status", { length: 50 }).default("idle"),
  lastMaintenance: timestamp("last_maintenance"),
  totalOperatingHours: decimal("total_operating_hours", { precision: 10, scale: 2 }).default("0"),
  tasksCompleted: integer("tasks_completed").default(0),
  errorCount: integer("error_count").default(0),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const robotTasks = pgTable("robot_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  robotId: uuid("robot_id").references(() => autonomousRobots.id).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  taskType: varchar("task_type", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).default("medium"),
  description: text("description"),
  parameters: jsonb("parameters"),
  status: varchar("status", { length: 50 }).default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  errorMessage: text("error_message"),
  assignedBy: varchar("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. Drone Fleet Management
export const droneFleets = pgTable("drone_fleets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  droneName: varchar("drone_name", { length: 255 }).notNull(),
  droneModel: varchar("drone_model", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }).unique().notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  maxFlightTime: integer("max_flight_time").notNull(),
  maxRange: decimal("max_range", { precision: 10, scale: 2 }).notNull(),
  cameraResolution: varchar("camera_resolution", { length: 50 }),
  sensors: text("sensors").array(),
  batteryLevel: integer("battery_level").default(100),
  totalFlightHours: decimal("total_flight_hours", { precision: 10, scale: 2 }).default("0"),
  missionsCompleted: integer("missions_completed").default(0),
  lastMaintenance: timestamp("last_maintenance"),
  status: varchar("status", { length: 50 }).default("available"),
  currentLocation: jsonb("current_location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const droneMissions = pgTable("drone_missions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  droneId: uuid("drone_id").references(() => droneFleets.id).notNull(),
  missionType: varchar("mission_type", { length: 100 }).notNull(),
  targetLocation: jsonb("target_location").notNull(),
  flightPlan: jsonb("flight_plan"),
  pilotId: varchar("pilot_id").references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  status: varchar("status", { length: 50 }).default("planned"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  flightDuration: integer("flight_duration"),
  distanceCovered: decimal("distance_covered", { precision: 10, scale: 2 }),
  mediaCollected: integer("media_collected").default(0),
  weatherConditions: varchar("weather_conditions", { length: 255 }),
  issuesDetected: integer("issues_detected").default(0),
  reportUrl: varchar("report_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 10. Smart Contract Automation
export const smartContracts = pgTable("smart_contracts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  contractType: varchar("contract_type", { length: 100 }).notNull(),
  contractAddress: varchar("contract_address", { length: 255 }).unique(),
  blockchain: varchar("blockchain", { length: 100 }).default("Ethereum"),
  partyA: varchar("party_a", { length: 255 }).notNull(),
  partyB: varchar("party_b", { length: 255 }).notNull(),
  terms: jsonb("terms").notNull(),
  contractValue: decimal("contract_value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: varchar("status", { length: 50 }).default("draft"),
  deployedAt: timestamp("deployed_at"),
  executedAt: timestamp("executed_at"),
  gasFee: decimal("gas_fee", { precision: 15, scale: 8 }),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractEvents = pgTable("contract_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => smartContracts.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventData: jsonb("event_data").notNull(),
  blockNumber: integer("block_number"),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  triggeredBy: varchar("triggered_by", { length: 255 }),
  gasUsed: decimal("gas_used", { precision: 15, scale: 8 }),
  status: varchar("status", { length: 50 }).default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 11. Carbon Credit Trading Platform
export const carbonCredits = pgTable("carbon_credits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  creditType: varchar("credit_type", { length: 100 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  verificationStandard: varchar("verification_standard", { length: 100 }),
  projectName: varchar("project_name", { length: 255 }),
  vintageYear: integer("vintage_year"),
  expiryDate: timestamp("expiry_date"),
  status: varchar("status", { length: 50 }).default("available"),
  tradedTo: uuid("traded_to").references(() => garages.id),
  tradedAt: timestamp("traded_at"),
  certificateUrl: varchar("certificate_url", { length: 500 }),
  blockchainRecord: varchar("blockchain_record", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carbonEmissions = pgTable("carbon_emissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  emissionSource: varchar("emission_source", { length: 100 }).notNull(),
  emissionDate: timestamp("emission_date").notNull(),
  co2Equivalent: decimal("co2_equivalent", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).default("kg"),
  activity: varchar("activity", { length: 255 }),
  offsetBy: uuid("offset_by").references(() => carbonCredits.id),
  isOffset: boolean("is_offset").default(false),
  reportingPeriod: varchar("reporting_period", { length: 50 }),
  verifiedBy: varchar("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 12. Green Energy Management
export const greenEnergyAssets = pgTable("green_energy_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  assetType: varchar("asset_type", { length: 100 }).notNull(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).default("kWh"),
  installationDate: timestamp("installation_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  totalEnergyGenerated: decimal("total_energy_generated", { precision: 15, scale: 2 }).default("0"),
  totalEnergySaved: decimal("total_energy_saved", { precision: 15, scale: 2 }).default("0"),
  currentOutput: decimal("current_output", { precision: 10, scale: 2 }),
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("operational"),
  lastMaintenance: timestamp("last_maintenance"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const evChargingStations = pgTable("ev_charging_stations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  stationName: varchar("station_name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  chargerType: varchar("charger_type", { length: 100 }).notNull(),
  powerRating: decimal("power_rating", { precision: 10, scale: 2 }).notNull(),
  connectorTypes: text("connector_types").array(),
  simultaneousCharging: integer("simultaneous_charging").default(1),
  totalChargingSessions: integer("total_charging_sessions").default(0),
  totalEnergyDelivered: decimal("total_energy_delivered", { precision: 15, scale: 2 }).default("0"),
  currentStatus: varchar("current_status", { length: 50 }).default("available"),
  pricing: jsonb("pricing"),
  isPublic: boolean("is_public").default(false),
  networkProvider: varchar("network_provider", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 13. Circular Economy Tracking
export const recycledParts = pgTable("recycled_parts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  originalPartId: uuid("original_part_id").references(() => spareParts.id),
  partName: varchar("part_name", { length: 255 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  recyclingMethod: varchar("recycling_method", { length: 100 }).notNull(),
  sourceVehicleId: uuid("source_vehicle_id").references(() => vehicles.id),
  dismantledDate: timestamp("dismantled_date"),
  certificationNumber: varchar("certification_number", { length: 255 }),
  qualityGrade: varchar("quality_grade", { length: 50 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  environmentalSavings: jsonb("environmental_savings"),
  soldTo: varchar("sold_to").references(() => customerProfiles.userId),
  soldDate: timestamp("sold_date"),
  status: varchar("status", { length: 50 }).default("available"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sustainabilityMetrics = pgTable("sustainability_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  metricType: varchar("metric_type", { length: 100 }).notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  reportingPeriod: varchar("reporting_period", { length: 50 }).notNull(),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  achievementRate: decimal("achievement_rate", { precision: 5, scale: 2 }),
  category: varchar("category", { length: 100 }),
  esgScore: decimal("esg_score", { precision: 5, scale: 2 }),
  certifications: text("certifications").array(),
  verified: boolean("verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 14. Satellite Connectivity Hub
export const satelliteConnections = pgTable("satellite_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  terminalId: varchar("terminal_id", { length: 255 }).unique().notNull(),
  location: jsonb("location").notNull(),
  bandwidth: decimal("bandwidth", { precision: 10, scale: 2 }),
  latency: integer("latency"),
  dataUsage: decimal("data_usage", { precision: 15, scale: 2 }).default("0"),
  dataLimit: decimal("data_limit", { precision: 15, scale: 2 }),
  signalStrength: integer("signal_strength"),
  uptime: decimal("uptime", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("active"),
  lastConnected: timestamp("last_connected"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  contractExpiry: timestamp("contract_expiry"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const satelliteUsageLogs = pgTable("satellite_usage_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: uuid("connection_id").references(() => satelliteConnections.id).notNull(),
  sessionStart: timestamp("session_start").notNull(),
  sessionEnd: timestamp("session_end"),
  dataTransferred: decimal("data_transferred", { precision: 10, scale: 2 }),
  averageSpeed: decimal("average_speed", { precision: 10, scale: 2 }),
  applicationUsed: varchar("application_used", { length: 255 }),
  userId: varchar("user_id").references(() => users.id),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 15. Quantum-Encrypted Communications
export const quantumEncryptionKeys = pgTable("quantum_encryption_keys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyType: varchar("key_type", { length: 100 }).notNull(),
  algorithm: varchar("algorithm", { length: 100 }).default("QKD-BB84"),
  keySize: integer("key_size").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  usageCount: integer("usage_count").default(0),
  maxUsage: integer("max_usage"),
  status: varchar("status", { length: 50 }).default("active"),
  associatedUsers: text("associated_users").array(),
  securityLevel: varchar("security_level", { length: 50 }).default("top_secret"),
  isRevoked: boolean("is_revoked").default(false),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quantumSecureMessages = pgTable("quantum_secure_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  encryptionKeyId: uuid("encryption_key_id").references(() => quantumEncryptionKeys.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  messageType: varchar("message_type", { length: 100 }).notNull(),
  encryptedContent: text("encrypted_content").notNull(),
  integrityHash: varchar("integrity_hash", { length: 255 }).notNull(),
  transmissionMethod: varchar("transmission_method", { length: 100 }),
  deliveryStatus: varchar("delivery_status", { length: 50 }).default("pending"),
  sentAt: timestamp("sent_at").defaultNow(),
  receivedAt: timestamp("received_at"),
  readAt: timestamp("read_at"),
  isCompromised: boolean("is_compromised").default(false),
  securityAudit: jsonb("security_audit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type Exports for Next-Gen Technologies

// 1. Neural Diagnostics
export type NeuralDiagnostic = typeof neuralDiagnostics.$inferSelect;
export type InsertNeuralDiagnostic = typeof neuralDiagnostics.$inferInsert;
export const insertNeuralDiagnosticSchema = createInsertSchema(neuralDiagnostics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NeuralTrainingSession = typeof neuralTrainingSessions.$inferSelect;
export type InsertNeuralTrainingSession = typeof neuralTrainingSessions.$inferInsert;
export const insertNeuralTrainingSessionSchema = createInsertSchema(neuralTrainingSessions).omit({
  id: true,
  createdAt: true,
});

// 2. Computer Vision
export type VisionQualityCheck = typeof visionQualityChecks.$inferSelect;
export type InsertVisionQualityCheck = typeof visionQualityChecks.$inferInsert;
export const insertVisionQualityCheckSchema = createInsertSchema(visionQualityChecks).omit({
  id: true,
  createdAt: true,
});

export type VisionDefect = typeof visionDefects.$inferSelect;
export type InsertVisionDefect = typeof visionDefects.$inferInsert;
export const insertVisionDefectSchema = createInsertSchema(visionDefects).omit({
  id: true,
  createdAt: true,
});

// 3. NLP Service Writer
export type NLPServiceRequest = typeof nlpServiceRequests.$inferSelect;
export type InsertNLPServiceRequest = typeof nlpServiceRequests.$inferInsert;
export const insertNLPServiceRequestSchema = createInsertSchema(nlpServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NLPTrainingData = typeof nlpTrainingData.$inferSelect;
export type InsertNLPTrainingData = typeof nlpTrainingData.$inferInsert;
export const insertNLPTrainingDataSchema = createInsertSchema(nlpTrainingData).omit({
  id: true,
  createdAt: true,
});

// 4. Reinforcement Learning
export type RLPartsOptimization = typeof rlPartsOptimizations.$inferSelect;
export type InsertRLPartsOptimization = typeof rlPartsOptimizations.$inferInsert;
export const insertRLPartsOptimizationSchema = createInsertSchema(rlPartsOptimizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RLLearningEpisode = typeof rlLearningEpisodes.$inferSelect;
export type InsertRLLearningEpisode = typeof rlLearningEpisodes.$inferInsert;
export const insertRLLearningEpisodeSchema = createInsertSchema(rlLearningEpisodes).omit({
  id: true,
  createdAt: true,
});

// 5. Metaverse
export type MetaverseShowroom = typeof metaverseShowrooms.$inferSelect;
export type InsertMetaverseShowroom = typeof metaverseShowrooms.$inferInsert;
export const insertMetaverseShowroomSchema = createInsertSchema(metaverseShowrooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MetaverseVisit = typeof metaverseVisits.$inferSelect;
export type InsertMetaverseVisit = typeof metaverseVisits.$inferInsert;
export const insertMetaverseVisitSchema = createInsertSchema(metaverseVisits).omit({
  id: true,
  createdAt: true,
});

// 6. Holographic
export type HolographicGuide = typeof holographicGuides.$inferSelect;
export type InsertHolographicGuide = typeof holographicGuides.$inferInsert;
export const insertHolographicGuideSchema = createInsertSchema(holographicGuides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HolographicSession = typeof holographicSessions.$inferSelect;
export type InsertHolographicSession = typeof holographicSessions.$inferInsert;
export const insertHolographicSessionSchema = createInsertSchema(holographicSessions).omit({
  id: true,
  createdAt: true,
});

// 7. Spatial Computing
export type SpatialWorkstation = typeof spatialWorkstations.$inferSelect;
export type InsertSpatialWorkstation = typeof spatialWorkstations.$inferInsert;
export const insertSpatialWorkstationSchema = createInsertSchema(spatialWorkstations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SpatialDiagnosticSession = typeof spatialDiagnosticSessions.$inferSelect;
export type InsertSpatialDiagnosticSession = typeof spatialDiagnosticSessions.$inferInsert;
export const insertSpatialDiagnosticSessionSchema = createInsertSchema(spatialDiagnosticSessions).omit({
  id: true,
  createdAt: true,
});

// 8. Autonomous Robots
export type AutonomousRobot = typeof autonomousRobots.$inferSelect;
export type InsertAutonomousRobot = typeof autonomousRobots.$inferInsert;
export const insertAutonomousRobotSchema = createInsertSchema(autonomousRobots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RobotTask = typeof robotTasks.$inferSelect;
export type InsertRobotTask = typeof robotTasks.$inferInsert;
export const insertRobotTaskSchema = createInsertSchema(robotTasks).omit({
  id: true,
  createdAt: true,
});

// 9. Drone Fleet
export type DroneFleet = typeof droneFleets.$inferSelect;
export type InsertDroneFleet = typeof droneFleets.$inferInsert;
export const insertDroneFleetSchema = createInsertSchema(droneFleets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DroneMission = typeof droneMissions.$inferSelect;
export type InsertDroneMission = typeof droneMissions.$inferInsert;
export const insertDroneMissionSchema = createInsertSchema(droneMissions).omit({
  id: true,
  createdAt: true,
});

// 10. Smart Contracts
export type SmartContract = typeof smartContracts.$inferSelect;
export type InsertSmartContract = typeof smartContracts.$inferInsert;
export const insertSmartContractSchema = createInsertSchema(smartContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ContractEvent = typeof contractEvents.$inferSelect;
export type InsertContractEvent = typeof contractEvents.$inferInsert;
export const insertContractEventSchema = createInsertSchema(contractEvents).omit({
  id: true,
  createdAt: true,
});

// 11. Carbon Credits
export type CarbonCredit = typeof carbonCredits.$inferSelect;
export type InsertCarbonCredit = typeof carbonCredits.$inferInsert;
export const insertCarbonCreditSchema = createInsertSchema(carbonCredits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CarbonEmission = typeof carbonEmissions.$inferSelect;
export type InsertCarbonEmission = typeof carbonEmissions.$inferInsert;
export const insertCarbonEmissionSchema = createInsertSchema(carbonEmissions).omit({
  id: true,
  createdAt: true,
});

// 12. Green Energy
export type GreenEnergyAsset = typeof greenEnergyAssets.$inferSelect;
export type InsertGreenEnergyAsset = typeof greenEnergyAssets.$inferInsert;
export const insertGreenEnergyAssetSchema = createInsertSchema(greenEnergyAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EVChargingStation = typeof evChargingStations.$inferSelect;
export type InsertEVChargingStation = typeof evChargingStations.$inferInsert;
export const insertEVChargingStationSchema = createInsertSchema(evChargingStations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 13. Circular Economy
export type RecycledPart = typeof recycledParts.$inferSelect;
export type InsertRecycledPart = typeof recycledParts.$inferInsert;
export const insertRecycledPartSchema = createInsertSchema(recycledParts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SustainabilityMetric = typeof sustainabilityMetrics.$inferSelect;
export type InsertSustainabilityMetric = typeof sustainabilityMetrics.$inferInsert;
export const insertSustainabilityMetricSchema = createInsertSchema(sustainabilityMetrics).omit({
  id: true,
  createdAt: true,
});

// 14. Satellite
export type SatelliteConnection = typeof satelliteConnections.$inferSelect;
export type InsertSatelliteConnection = typeof satelliteConnections.$inferInsert;
export const insertSatelliteConnectionSchema = createInsertSchema(satelliteConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SatelliteUsageLog = typeof satelliteUsageLogs.$inferSelect;
export type InsertSatelliteUsageLog = typeof satelliteUsageLogs.$inferInsert;
export const insertSatelliteUsageLogSchema = createInsertSchema(satelliteUsageLogs).omit({
  id: true,
  createdAt: true,
});

// 15. Quantum Encryption
export type QuantumEncryptionKey = typeof quantumEncryptionKeys.$inferSelect;
export type InsertQuantumEncryptionKey = typeof quantumEncryptionKeys.$inferInsert;
export const insertQuantumEncryptionKeySchema = createInsertSchema(quantumEncryptionKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type QuantumSecureMessage = typeof quantumSecureMessages.$inferSelect;
export type InsertQuantumSecureMessage = typeof quantumSecureMessages.$inferInsert;
export const insertQuantumSecureMessageSchema = createInsertSchema(quantumSecureMessages).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// Phase 12: Advanced Vehicle Services - Tire Management
// ============================================================================

// Tire Inventory - Tire products in stock
export const tireInventory = pgTable("tire_inventory", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  size: varchar("size", { length: 50 }).notNull(), // e.g., "225/45R17"
  season: varchar("season", { length: 20 }).notNull(), // "summer", "winter", "all_season"
  speedRating: varchar("speed_rating", { length: 10 }), // "H", "V", "W", "Y"
  loadIndex: varchar("load_index", { length: 10 }),
  dotCode: varchar("dot_code", { length: 50 }), // DOT manufacturing date code
  quantityInStock: integer("quantity_in_stock").default(0),
  reorderPoint: integer("reorder_point").default(4),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  warrantyMonths: integer("warranty_months"),
  supplierName: varchar("supplier_name", { length: 255 }),
  supplierSku: varchar("supplier_sku", { length: 100 }),
  features: jsonb("features"), // run_flat, noise_reduction, eco, performance
  suitableVehicleTypes: jsonb("suitable_vehicle_types"), // ["sedan", "suv", "truck"]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tire Service Records - All tire services performed
export const tireServiceRecords = pgTable("tire_service_records", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // "installation", "rotation", "balance", "repair", "replacement"
  serviceDate: timestamp("service_date").notNull(),
  mileageAtService: integer("mileage_at_service"),
  technicianId: varchar("technician_id").references(() => users.id),
  
  // Tire details
  tireInventoryId: uuid("tire_inventory_id").references(() => tireInventory.id),
  tirePosition: varchar("tire_position", { length: 50 }), // "front_left", "front_right", "rear_left", "rear_right", "spare"
  tireBrand: varchar("tire_brand", { length: 100 }),
  tireModel: varchar("tireModel", { length: 100 }),
  tireSize: varchar("tire_size", { length: 50 }),
  
  // Measurements
  treadDepthFL: decimal("tread_depth_fl", { precision: 4, scale: 2 }), // mm
  treadDepthFR: decimal("tread_depth_fr", { precision: 4, scale: 2 }),
  treadDepthRL: decimal("tread_depth_rl", { precision: 4, scale: 2 }),
  treadDepthRR: decimal("tread_depth_rr", { precision: 4, scale: 2 }),
  
  tirePressureFL: decimal("tire_pressure_fl", { precision: 4, scale: 1 }), // PSI
  tirePressureFR: decimal("tire_pressure_fr", { precision: 4, scale: 1 }),
  tirePressureRL: decimal("tire_pressure_rl", { precision: 4, scale: 1 }),
  tirePressureRR: decimal("tire_pressure_rr", { precision: 4, scale: 1 }),
  
  // Service details
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  warrantyExpiresAt: timestamp("warranty_expires_at"),
  nextRotationDue: timestamp("next_rotation_due"),
  nextRotationMileage: integer("next_rotation_mileage"),
  
  notes: text("notes"),
  photos: jsonb("photos"), // Array of photo URLs
  createdAt: timestamp("created_at").defaultNow(),
});

// Seasonal Tire Storage - For customers storing winter/summer tires
export const seasonalTireStorage = pgTable("seasonal_tire_storage", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  storageNumber: varchar("storage_number", { length: 50 }).unique(),
  
  // Tire set details
  numberOfTires: integer("number_of_tires").default(4),
  tireBrand: varchar("tire_brand", { length: 100 }),
  tireModel: varchar("tire_model", { length: 100 }),
  tireSize: varchar("tire_size", { length: 50 }),
  season: varchar("season", { length: 20 }), // "winter", "summer"
  rimIncluded: boolean("rim_included").default(false),
  
  // Storage period
  storedDate: timestamp("stored_date").notNull(),
  expectedRetrievalDate: timestamp("expected_retrieval_date"),
  actualRetrievalDate: timestamp("actual_retrieval_date"),
  status: varchar("status", { length: 20 }).default("stored"), // "stored", "retrieved", "disposed"
  
  // Storage location
  storageLocation: varchar("storage_location", { length: 100 }), // Shelf/rack location
  binNumber: varchar("bin_number", { length: 50 }),
  
  // Condition tracking
  conditionAtStorage: varchar("condition_at_storage", { length: 20 }), // "excellent", "good", "fair", "poor"
  treadDepthAtStorage: jsonb("tread_depth_at_storage"), // {fl, fr, rl, rr}
  conditionAtRetrieval: varchar("condition_at_retrieval", { length: 20 }),
  treadDepthAtRetrieval: jsonb("tread_depth_at_retrieval"),
  damageNotes: text("damage_notes"),
  
  // Billing
  monthlyStorageFee: decimal("monthly_storage_fee", { precision: 10, scale: 2 }),
  totalStorageFees: decimal("total_storage_fees", { precision: 10, scale: 2 }),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }),
  depositRefunded: decimal("deposit_refunded", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("unpaid"), // "unpaid", "partial", "paid"
  
  photos: jsonb("photos"), // Storage photos
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tire Rotation Schedules - Automatic rotation reminders
export const tireRotationSchedules = pgTable("tire_rotation_schedules", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  
  // Rotation pattern
  rotationPattern: varchar("rotation_pattern", { length: 50 }), // "forward_cross", "rearward_cross", "x_pattern", "side_to_side"
  recommendedInterval: integer("recommended_interval").default(8000), // Miles
  
  // Last rotation
  lastRotationDate: timestamp("last_rotation_date"),
  lastRotationMileage: integer("last_rotation_mileage"),
  lastServiceRecordId: uuid("last_service_record_id").references(() => tireServiceRecords.id),
  
  // Next rotation
  nextRotationDue: timestamp("next_rotation_due"),
  nextRotationMileage: integer("next_rotation_mileage"),
  
  // Reminder settings
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderSentAt: timestamp("reminder_sent_at"),
  reminderMethod: varchar("reminder_method", { length: 20 }).default("sms"), // "sms", "email", "both"
  
  status: varchar("status", { length: 20 }).default("active"), // "active", "completed", "overdue"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tire Recommendations - AI-powered tire suggestions
export const tireRecommendations = pgTable("tire_recommendations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  
  // Recommendation details
  recommendedTireIds: jsonb("recommended_tire_ids"), // Array of tire inventory IDs
  recommendationReason: text("recommendation_reason"), // Why these tires were recommended
  drivingConditions: jsonb("driving_conditions"), // {climate, terrain, usage}
  budget: varchar("budget", { length: 20 }), // "economy", "mid_range", "premium"
  
  // Customer preferences
  preferredBrands: jsonb("preferred_brands"),
  priorityFactors: jsonb("priority_factors"), // ["longevity", "performance", "fuel_efficiency", "noise"]
  
  // Recommendation metadata
  generatedBy: varchar("generated_by", { length: 20 }).default("ai"), // "ai", "technician"
  technicianId: varchar("technician_id").references(() => users.id),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // 0.00-1.00
  
  // Customer response
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "accepted", "rejected", "modified"
  customerFeedback: text("customer_feedback"),
  acceptedAt: timestamp("accepted_at"),
  convertedToJobCardId: uuid("converted_to_job_card_id").references(() => jobCards.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for Tire Management
export type TireInventory = typeof tireInventory.$inferSelect;
export type InsertTireInventory = typeof tireInventory.$inferInsert;
export const insertTireInventorySchema = createInsertSchema(tireInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TireServiceRecord = typeof tireServiceRecords.$inferSelect;
export type InsertTireServiceRecord = typeof tireServiceRecords.$inferInsert;
export const insertTireServiceRecordSchema = createInsertSchema(tireServiceRecords).omit({
  id: true,
  createdAt: true,
});

export type SeasonalTireStorage = typeof seasonalTireStorage.$inferSelect;
export type InsertSeasonalTireStorage = typeof seasonalTireStorage.$inferInsert;
export const insertSeasonalTireStorageSchema = createInsertSchema(seasonalTireStorage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TireRotationSchedule = typeof tireRotationSchedules.$inferSelect;
export type InsertTireRotationSchedule = typeof tireRotationSchedules.$inferInsert;
export const insertTireRotationScheduleSchema = createInsertSchema(tireRotationSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TireRecommendation = typeof tireRecommendations.$inferSelect;
export type InsertTireRecommendation = typeof tireRecommendations.$inferInsert;
export const insertTireRecommendationSchema = createInsertSchema(tireRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Phase 12: Advanced Business Features - Appointment Reminders
// ============================================================================

// Appointment Reminder Settings - Garage-wide reminder configurations
export const appointmentReminderSettings = pgTable("appointment_reminder_settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull()
    .unique(),
  
  // SMS Settings
  smsEnabled: boolean("sms_enabled").default(true),
  smsReminderHours: jsonb("sms_reminder_hours").default([24, 2]), // Hours before appointment
  smsTemplate: text("sms_template").default("Hi {customerName}, reminder: Your appointment at {garageName} is scheduled for {appointmentTime}. Reply CONFIRM or CANCEL."),
  
  // Email Settings
  emailEnabled: boolean("email_enabled").default(true),
  emailReminderHours: jsonb("email_reminder_hours").default([72, 24]),
  emailSubject: varchar("email_subject", { length: 255 }).default("Appointment Reminder - {garageName}"),
  emailTemplate: text("email_template"),
  
  // WhatsApp Settings
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  whatsappReminderHours: jsonb("whatsapp_reminder_hours").default([24]),
  whatsappTemplate: text("whatsapp_template"),
  
  // Follow-up Settings
  postAppointmentFollowup: boolean("post_appointment_followup").default(true),
  followupHours: integer("followup_hours").default(24),
  requestReview: boolean("request_review").default(true),
  
  // No-show Settings
  noShowAutoMarkMinutes: integer("no_show_auto_mark_minutes").default(30),
  noShowRescheduleEnabled: boolean("no_show_reschedule_enabled").default(true),
  noShowFeeAmount: decimal("no_show_fee_amount", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointment Reminder Logs - Track all sent reminders
export const appointmentReminderLogs = pgTable("appointment_reminder_logs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "cascade" })
    .notNull(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  
  // Reminder details
  reminderType: varchar("reminder_type", { length: 20 }).notNull(), // "sms", "email", "whatsapp"
  reminderTiming: varchar("reminder_timing", { length: 20 }).notNull(), // "72h", "24h", "2h", "followup"
  
  // Message content
  recipientPhone: varchar("recipient_phone", { length: 50 }),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  messageContent: text("message_content").notNull(),
  messageSubject: varchar("message_subject", { length: 255 }),
  
  // Delivery tracking
  sentAt: timestamp("sent_at").defaultNow(),
  deliveryStatus: varchar("delivery_status", { length: 20 }).default("sent"), // "sent", "delivered", "failed", "bounced"
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  
  // Customer interaction
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  respondedAt: timestamp("responded_at"),
  responseText: text("response_text"),
  responseAction: varchar("response_action", { length: 20 }), // "confirm", "cancel", "reschedule"
  
  // Provider details (Twilio, SendGrid, etc.)
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  providerStatus: varchar("provider_status", { length: 50 }),
  providerCost: decimal("provider_cost", { precision: 10, scale: 4 }),
  
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// No-Show Tracking - Track appointment no-shows and patterns
export const noShowTracking = pgTable("no_show_tracking", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id)
    .notNull()
    .unique(),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull(),
  garageId: uuid("garage_id")
    .references(() => garages.id)
    .notNull(),
  
  // No-show details
  scheduledTime: timestamp("scheduled_time").notNull(),
  markedNoShowAt: timestamp("marked_no_show_at").notNull().defaultNow(),
  markedBy: varchar("marked_by").references(() => users.id),
  autoMarked: boolean("auto_marked").default(false),
  
  // Customer contact attempts
  contactAttempts: integer("contact_attempts").default(0),
  lastContactAt: timestamp("last_contact_at"),
  customerReached: boolean("customer_reached").default(false),
  customerReason: text("customer_reason"),
  
  // Follow-up actions
  rescheduled: boolean("rescheduled").default(false),
  rescheduledAppointmentId: uuid("rescheduled_appointment_id").references(() => appointments.id),
  rescheduledAt: timestamp("rescheduled_at"),
  
  // Financial impact
  noShowFeeCharged: boolean("no_show_fee_charged").default(false),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }),
  feePaid: boolean("fee_paid").default(false),
  feeWaived: boolean("fee_waived").default(false),
  waivedReason: text("waived_reason"),
  estimatedRevenueLoss: decimal("estimated_revenue_loss", { precision: 10, scale: 2 }),
  
  // Administrative notes
  internalNotes: text("internal_notes"),
  customerBlacklisted: boolean("customer_blacklisted").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Communication Preferences
export const customerCommunicationPreferences = pgTable("customer_communication_preferences", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  
  // Channel preferences
  preferredChannel: varchar("preferred_channel", { length: 20 }).default("sms"), // "sms", "email", "whatsapp", "phone"
  smsOptIn: boolean("sms_opt_in").default(true),
  emailOptIn: boolean("email_opt_in").default(true),
  whatsappOptIn: boolean("whatsapp_opt_in").default(false),
  phoneOptIn: boolean("phone_opt_in").default(true),
  
  // Reminder preferences
  appointmentReminders: boolean("appointment_reminders").default(true),
  marketingMessages: boolean("marketing_messages").default(false),
  serviceReminders: boolean("service_reminders").default(true),
  promotionalOffers: boolean("promotional_offers").default(false),
  
  // Timing preferences
  preferredContactTime: varchar("preferred_contact_time", { length: 20 }).default("business_hours"), // "morning", "afternoon", "evening", "business_hours", "any"
  doNotDisturbStart: varchar("do_not_disturb_start", { length: 5 }), // "22:00"
  doNotDisturbEnd: varchar("do_not_disturb_end", { length: 5 }), // "08:00"
  
  // Language preference
  languagePreference: varchar("language_preference", { length: 10 }).default("en"), // "en", "ar", "es"
  
  // Contact information
  primaryPhone: varchar("primary_phone", { length: 50 }),
  secondaryPhone: varchar("secondary_phone", { length: 50 }),
  primaryEmail: varchar("primary_email", { length: 255 }),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for Appointment Reminders
export type AppointmentReminderSettings = typeof appointmentReminderSettings.$inferSelect;
export type InsertAppointmentReminderSettings = typeof appointmentReminderSettings.$inferInsert;
export const insertAppointmentReminderSettingsSchema = createInsertSchema(appointmentReminderSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AppointmentReminderLog = typeof appointmentReminderLogs.$inferSelect;
export type InsertAppointmentReminderLog = typeof appointmentReminderLogs.$inferInsert;
export const insertAppointmentReminderLogSchema = createInsertSchema(appointmentReminderLogs).omit({
  id: true,
  createdAt: true,
});

export type NoShowTracking = typeof noShowTracking.$inferSelect;
export type InsertNoShowTracking = typeof noShowTracking.$inferInsert;
export const insertNoShowTrackingSchema = createInsertSchema(noShowTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CustomerCommunicationPreferences = typeof customerCommunicationPreferences.$inferSelect;
export type InsertCustomerCommunicationPreferences = typeof customerCommunicationPreferences.$inferInsert;
export const insertCustomerCommunicationPreferencesSchema = createInsertSchema(customerCommunicationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Phase 11: Mobile Web Apps (Customer & Technician)
// ============================================================================

// Push Notification Tokens
export const pushNotificationTokens = pgTable("push_notification_tokens", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  garageId: uuid("garage_id").references(() => garages.id),
  token: text("token").notNull().unique(),
  platform: varchar("platform", { length: 20 }).notNull(), // "ios", "android", "web"
  deviceInfo: jsonb("device_info"), // Device model, OS version, app version
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mobile App Sessions (for offline sync tracking)
export const mobileAppSessions = pgTable("mobile_app_sessions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  garageId: uuid("garage_id").references(() => garages.id),
  appType: varchar("app_type", { length: 20 }).notNull(), // "customer", "technician"
  sessionToken: varchar("session_token", { length: 500 }).notNull().unique(),
  deviceId: varchar("device_id", { length: 255 }),
  platform: varchar("platform", { length: 20 }), // "ios", "android", "web"
  appVersion: varchar("app_version", { length: 20 }),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: varchar("sync_status", { length: 20 }).default("synced"), // "synced", "pending", "error"
  offlineChanges: jsonb("offline_changes").default([]), // Queue of changes made offline
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quick Actions (customizable shortcuts for mobile apps)
export const mobileQuickActions = pgTable("mobile_quick_actions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  appType: varchar("app_type", { length: 20 }).notNull(), // "customer", "technician"
  actionType: varchar("action_type", { length: 50 }).notNull(), // "book_appointment", "clock_in", "scan_part", "view_schedule"
  label: varchar("label", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  route: varchar("route", { length: 255 }),
  metadata: jsonb("metadata"), // Additional config for the action
  sortOrder: integer("sort_order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for Phase 11
export type PushNotificationToken = typeof pushNotificationTokens.$inferSelect;
export type InsertPushNotificationToken = typeof pushNotificationTokens.$inferInsert;
export const insertPushNotificationTokenSchema = createInsertSchema(pushNotificationTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MobileAppSession = typeof mobileAppSessions.$inferSelect;
export type InsertMobileAppSession = typeof mobileAppSessions.$inferInsert;
export const insertMobileAppSessionSchema = createInsertSchema(mobileAppSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MobileQuickAction = typeof mobileQuickActions.$inferSelect;
export type InsertMobileQuickAction = typeof mobileQuickActions.$inferInsert;
export const insertMobileQuickActionSchema = createInsertSchema(mobileQuickActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ==================== PAYROLL MANAGEMENT MODULE ====================
export const payrollEmployees = pgTable("payroll_employees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  garageId: uuid("garage_id").references(() => garages.id),
  employeeNumber: varchar("employee_number", { length: 50 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  payType: varchar("pay_type", { length: 20 }).notNull(), // "hourly", "salary", "commission"
  taxId: varchar("tax_id", { length: 50 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payPeriods = pgTable("pay_periods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  payDate: timestamp("pay_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"), // "draft", "processing", "approved", "paid"
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollRuns = pgTable("payroll_runs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  payPeriodId: uuid("pay_period_id").notNull().references(() => payPeriods.id),
  employeeId: uuid("employee_id").notNull().references(() => payrollEmployees.id),
  regularHours: decimal("regular_hours", { precision: 8, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 8, scale: 2 }).default("0"),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  taxWithheld: decimal("tax_withheld", { precision: 10, scale: 2 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).default("0"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== EXPENSE TRACKING MODULE ====================
export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  budgetLimit: decimal("budget_limit", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  categoryId: uuid("category_id").references(() => expenseCategories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  vendor: varchar("vendor", { length: 255 }),
  description: text("description"),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "approved", "rejected"
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== TOWING & RECOVERY SERVICES MODULE ====================
export const towingJobs = pgTable("towing_jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  customerId: varchar("customer_id").references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  towTruckId: uuid("tow_truck_id"),
  assignedDriverId: varchar("assigned_driver_id").references(() => users.id),
  status: varchar("status", { length: 20 }).default("requested"), // "requested", "dispatched", "in_progress", "completed", "cancelled"
  requestedAt: timestamp("requested_at").defaultNow(),
  dispatchedAt: timestamp("dispatched_at"),
  completedAt: timestamp("completed_at"),
  distance: decimal("distance", { precision: 8, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== VEHICLE STORAGE SERVICES MODULE ====================
export const storageFacilities = pgTable("storage_facilities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location"),
  totalSlots: integer("total_slots").notNull(),
  availableSlots: integer("available_slots").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicleStorageAssignments = pgTable("vehicle_storage_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id").notNull().references(() => storageFacilities.id),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  slotNumber: varchar("slot_number", { length: 20 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"), // "active", "expired", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== TELEMATICS INTEGRATION MODULE ====================
export const telematicsFeeds = pgTable("telematics_feeds", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: uuid("device_id").references(() => obdDevices.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  fuelLevel: decimal("fuel_level", { precision: 5, scale: 2 }),
  engineStatus: varchar("engine_status", { length: 20 }),
  odometer: decimal("odometer", { precision: 10, scale: 2 }),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const telematicsAlerts = pgTable("telematics_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // "speeding", "harsh_braking", "geofence_breach", "maintenance_due"
  severity: varchar("severity", { length: 20 }).notNull(), // "info", "warning", "critical"
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== KNOWLEDGE BASE MODULE ====================
export const articleCategories = pgTable("article_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeArticles = pgTable("knowledge_articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: uuid("category_id").references(() => articleCategories.id),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  author: varchar("author").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  views: integer("views").default(0),
  helpfulCount: integer("helpful_count").default(0),
  unhelpfulCount: integer("unhelpful_count").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== TRAINING & CERTIFICATION LMS MODULE ====================
export const trainingModules = pgTable("training_modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration"), // in minutes
  content: text("content"),
  videoUrl: varchar("video_url", { length: 500 }),
  quizQuestions: jsonb("quiz_questions"),
  passingScore: integer("passing_score").default(70),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  validityPeriod: integer("validity_period"), // in months
  requiredModules: text("required_modules").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificationAttempts = pgTable("certification_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  certificationId: uuid("certification_id").notNull().references(() => certifications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: uuid("module_id").references(() => trainingModules.id),
  score: integer("score"),
  passed: boolean("passed").default(false),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  certificateUrl: varchar("certificate_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== GOOGLE MY BUSINESS INTEGRATION MODULE ====================
export const googleBusinessProfiles = pgTable("google_business_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  locationId: varchar("location_id", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  isActive: boolean("is_active").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gmbPosts = pgTable("gmb_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull().references(() => googleBusinessProfiles.id),
  postType: varchar("post_type", { length: 50 }).notNull(), // "update", "event", "offer"
  message: text("message").notNull(),
  imageUrls: text("image_urls").array(),
  callToAction: varchar("call_to_action", { length: 50 }),
  actionUrl: varchar("action_url", { length: 500 }),
  eventStartDate: timestamp("event_start_date"),
  eventEndDate: timestamp("event_end_date"),
  status: varchar("status", { length: 20 }).default("draft"), // "draft", "published", "deleted"
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gmbReviews = pgTable("gmb_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull().references(() => googleBusinessProfiles.id),
  reviewId: varchar("review_id", { length: 255 }).notNull().unique(),
  reviewerName: varchar("reviewer_name", { length: 255 }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  reviewDate: timestamp("review_date").notNull(),
  responseText: text("response_text"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== ENHANCED COMPLIANCE MANAGEMENT MODULE ====================
export const compliancePolicies = pgTable("compliance_policies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "safety", "environmental", "regulatory", "quality"
  regulatoryBody: varchar("regulatory_body", { length: 255 }),
  effectiveDate: timestamp("effective_date").notNull(),
  reviewDate: timestamp("review_date"),
  status: varchar("status", { length: 20 }).default("active"),
  documentIds: text("document_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceAudits = pgTable("compliance_audits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  policyId: uuid("policy_id").references(() => compliancePolicies.id),
  auditor: varchar("auditor").references(() => users.id),
  auditDate: timestamp("audit_date").notNull(),
  auditType: varchar("audit_type", { length: 50 }), // "internal", "external", "self-assessment"
  findings: text("findings"),
  score: integer("score"),
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "in_progress", "completed"
  correctiveActions: jsonb("corrective_actions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceTasks = pgTable("compliance_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  policyId: uuid("policy_id").references(() => compliancePolicies.id),
  auditId: uuid("audit_id").references(() => complianceAudits.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("pending"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for all new modules
export type PayrollEmployee = typeof payrollEmployees.$inferSelect;
export type InsertPayrollEmployee = typeof payrollEmployees.$inferInsert;
export const insertPayrollEmployeeSchema = createInsertSchema(payrollEmployees).omit({ id: true, createdAt: true, updatedAt: true });

export type PayPeriod = typeof payPeriods.$inferSelect;
export type InsertPayPeriod = typeof payPeriods.$inferInsert;
export const insertPayPeriodSchema = createInsertSchema(payPeriods).omit({ id: true, createdAt: true });

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = typeof payrollRuns.$inferInsert;
export const insertPayrollRunSchema = createInsertSchema(payrollRuns).omit({ id: true, createdAt: true });

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true, createdAt: true });

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, updatedAt: true });

export type TowingJob = typeof towingJobs.$inferSelect;
export type InsertTowingJob = typeof towingJobs.$inferInsert;
export const insertTowingJobSchema = createInsertSchema(towingJobs).omit({ id: true, createdAt: true, updatedAt: true });

export type StorageFacility = typeof storageFacilities.$inferSelect;
export type InsertStorageFacility = typeof storageFacilities.$inferInsert;
export const insertStorageFacilitySchema = createInsertSchema(storageFacilities).omit({ id: true, createdAt: true });

export type VehicleStorageAssignment = typeof vehicleStorageAssignments.$inferSelect;
export type InsertVehicleStorageAssignment = typeof vehicleStorageAssignments.$inferInsert;
export const insertVehicleStorageAssignmentSchema = createInsertSchema(vehicleStorageAssignments).omit({ id: true, createdAt: true, updatedAt: true });

export type TelematicsFeed = typeof telematicsFeeds.$inferSelect;
export type InsertTelematicsFeed = typeof telematicsFeeds.$inferInsert;
export const insertTelematicsFeedSchema = createInsertSchema(telematicsFeeds).omit({ id: true, createdAt: true });

export type TelematicsAlert = typeof telematicsAlerts.$inferSelect;
export type InsertTelematicsAlert = typeof telematicsAlerts.$inferInsert;
export const insertTelematicsAlertSchema = createInsertSchema(telematicsAlerts).omit({ id: true, createdAt: true });

export type ArticleCategory = typeof articleCategories.$inferSelect;
export type InsertArticleCategory = typeof articleCategories.$inferInsert;
export const insertArticleCategorySchema = createInsertSchema(articleCategories).omit({ id: true, createdAt: true });

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = typeof knowledgeArticles.$inferInsert;
export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({ id: true, createdAt: true, updatedAt: true });

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = typeof trainingModules.$inferInsert;
export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({ id: true, createdAt: true, updatedAt: true });

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;
export const insertCertificationSchema = createInsertSchema(certifications).omit({ id: true, createdAt: true });

export type CertificationAttempt = typeof certificationAttempts.$inferSelect;
export type InsertCertificationAttempt = typeof certificationAttempts.$inferInsert;
export const insertCertificationAttemptSchema = createInsertSchema(certificationAttempts).omit({ id: true, createdAt: true });

export type GoogleBusinessProfile = typeof googleBusinessProfiles.$inferSelect;
export type InsertGoogleBusinessProfile = typeof googleBusinessProfiles.$inferInsert;
export const insertGoogleBusinessProfileSchema = createInsertSchema(googleBusinessProfiles).omit({ id: true, createdAt: true, updatedAt: true });

export type GmbPost = typeof gmbPosts.$inferSelect;
export type InsertGmbPost = typeof gmbPosts.$inferInsert;
export const insertGmbPostSchema = createInsertSchema(gmbPosts).omit({ id: true, createdAt: true, updatedAt: true });

export type GmbReview = typeof gmbReviews.$inferSelect;
export type InsertGmbReview = typeof gmbReviews.$inferInsert;
export const insertGmbReviewSchema = createInsertSchema(gmbReviews).omit({ id: true, createdAt: true, updatedAt: true });

export type CompliancePolicy = typeof compliancePolicies.$inferSelect;
export type InsertCompliancePolicy = typeof compliancePolicies.$inferInsert;
export const insertCompliancePolicySchema = createInsertSchema(compliancePolicies).omit({ id: true, createdAt: true, updatedAt: true });

export type ComplianceAudit = typeof complianceAudits.$inferSelect;
export type InsertComplianceAudit = typeof complianceAudits.$inferInsert;
export const insertComplianceAuditSchema = createInsertSchema(complianceAudits).omit({ id: true, createdAt: true, updatedAt: true });

export type ComplianceTask = typeof complianceTasks.$inferSelect;
export type InsertComplianceTask = typeof complianceTasks.$inferInsert;
export const insertComplianceTaskSchema = createInsertSchema(complianceTasks).omit({ id: true, createdAt: true, updatedAt: true });

// Wave 2 Feature #6: Smart Job Assignment System
export const assignmentRules = pgTable("assignment_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // "skill_match", "workload_balance", "proximity", "priority_based", "custom"
  priority: integer("priority").default(0), // Higher number = higher priority
  isActive: boolean("is_active").default(true),
  conditions: jsonb("conditions").notNull(), // Flexible JSON for rule conditions
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignmentHistory = pgTable("assignment_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id").notNull().references(() => jobCards.id),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  previousTechnicianId: varchar("previous_technician_id").references(() => users.id), // Null for initial assignment
  newTechnicianId: varchar("new_technician_id").notNull().references(() => users.id),
  assignmentMethod: varchar("assignment_method", { length: 50 }).notNull(), // "manual", "ai_auto", "ai_recommended", "rule_based"
  assignedBy: varchar("assigned_by").notNull().references(() => users.id), // User who made the assignment
  reason: text("reason"), // Reason for assignment or reassignment
  aiRecommendationId: uuid("ai_recommendation_id").references(() => aiAssignmentRecommendations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAssignmentRecommendations = pgTable("ai_assignment_recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id").notNull().references(() => jobCards.id),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  recommendedTechnicianId: varchar("recommended_technician_id").notNull().references(() => users.id),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }).notNull(), // 0-100
  reasoning: jsonb("reasoning").notNull(), // AI explanation of recommendation
  jobContext: jsonb("job_context").notNull(), // Job details used for recommendation
  technicianContext: jsonb("technician_context").notNull(), // Technician profile used
  modelUsed: varchar("model_used", { length: 100 }).notNull(), // "gpt-5", etc.
  wasAccepted: boolean("was_accepted").default(false),
  processingTimeMs: integer("processing_time_ms"), // For performance monitoring
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobCardIdx: index("ai_recommendations_job_card_idx").on(table.jobCardId),
  garageIdx: index("ai_recommendations_garage_idx").on(table.garageId),
}));

export type AssignmentRule = typeof assignmentRules.$inferSelect;
export type InsertAssignmentRule = typeof assignmentRules.$inferInsert;
export const insertAssignmentRuleSchema = createInsertSchema(assignmentRules).omit({ id: true, createdAt: true, updatedAt: true });

export type AssignmentHistory = typeof assignmentHistory.$inferSelect;
export type InsertAssignmentHistory = typeof assignmentHistory.$inferInsert;
export const insertAssignmentHistorySchema = createInsertSchema(assignmentHistory).omit({ id: true, createdAt: true });

export type AiAssignmentRecommendation = typeof aiAssignmentRecommendations.$inferSelect;
export type InsertAiAssignmentRecommendation = typeof aiAssignmentRecommendations.$inferInsert;
export const insertAiAssignmentRecommendationSchema = createInsertSchema(aiAssignmentRecommendations).omit({ id: true, createdAt: true });

// ========================================
// CALL CENTER MODULE
// ========================================

// Call Queues - Define call routing and priority rules
export const callQueues = pgTable("call_queues", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priority: integer("priority").default(5), // 1-10 scale
  routingStrategy: varchar("routing_strategy", { length: 50 }).default("round_robin"), // round_robin, least_active, skill_based
  maxQueueSize: integer("max_queue_size").default(50),
  maxWaitTimeSeconds: integer("max_wait_time_seconds").default(600), // 10 minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  garageIdx: index("call_queues_garage_idx").on(table.garageId),
}));

// Call Queue Members - Agents assigned to queues
export const callQueueMembers = pgTable("call_queue_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  queueId: uuid("queue_id").notNull().references(() => callQueues.id, { onDelete: "cascade" }),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  agentUserId: varchar("agent_user_id").notNull().references(() => users.id),
  skillTags: jsonb("skill_tags"), // Array of skill strings
  isPrimary: boolean("is_primary").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  queueIdx: index("queue_members_queue_idx").on(table.queueId),
  garageIdx: index("queue_members_garage_idx").on(table.garageId),
  agentIdx: index("queue_members_agent_idx").on(table.agentUserId),
  uniqueAgentQueue: uniqueIndex("queue_members_unique_agent_queue").on(table.queueId, table.agentUserId),
}));

// Call Sessions - Individual call records
export const callSessions = pgTable("call_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  queueId: uuid("queue_id").references(() => callQueues.id),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  direction: varchar("direction", { length: 20 }).notNull(), // inbound, outbound
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).default("queued"), // queued, ringing, active, completed, missed, failed
  priority: integer("priority").default(5),
  assignedAgentId: varchar("assigned_agent_id").references(() => users.id),
  twilioCallSid: varchar("twilio_call_sid", { length: 100 }), // Twilio call identifier
  startedAt: timestamp("started_at"),
  answeredAt: timestamp("answered_at"),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  waitTimeSeconds: integer("wait_time_seconds"),
  talkTimeSeconds: integer("talk_time_seconds"),
  holdTimeSeconds: integer("hold_time_seconds"),
  outcomeCodeId: uuid("outcome_code_id").references(() => callDispositionCodes.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  garageIdx: index("call_sessions_garage_idx").on(table.garageId),
  queueIdx: index("call_sessions_queue_idx").on(table.queueId),
  customerIdx: index("call_sessions_customer_idx").on(table.customerId),
  agentIdx: index("call_sessions_agent_idx").on(table.assignedAgentId),
  statusIdx: index("call_sessions_status_idx").on(table.status),
  twilioIdx: index("call_sessions_twilio_idx").on(table.twilioCallSid),
}));

// Call Events - Timeline of events during a call
export const callEvents = pgTable("call_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // queued, ringing, answered, hold, transfer, ended
  payload: jsonb("payload"), // Event-specific data
  occurredAt: timestamp("occurred_at").defaultNow(),
}, (table) => ({
  sessionIdx: index("call_events_session_idx").on(table.sessionId),
}));

// Call Notes - Agent notes during/after calls
export const callNotes = pgTable("call_notes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  authorUserId: varchar("author_user_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  visibility: varchar("visibility", { length: 20 }).default("internal"), // internal, customer_visible
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sessionIdx: index("call_notes_session_idx").on(table.sessionId),
}));

// Call Recordings - Metadata for call recordings
export const callRecordings = pgTable("call_recordings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  twilioRecordingSid: varchar("twilio_recording_sid", { length: 100 }),
  storageUrl: text("storage_url"), // S3/cloud storage URL
  transcriptionUrl: text("transcription_url"),
  durationSeconds: integer("duration_seconds"),
  fileSize: integer("file_size"), // bytes
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdx: index("call_recordings_session_idx").on(table.sessionId),
}));

// Call Disposition Codes - Predefined call outcomes
export const callDispositionCodes = pgTable("call_disposition_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  code: varchar("code", { length: 50 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }), // resolved, follow_up, escalated, missed, no_answer
  followUpRequired: boolean("follow_up_required").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  garageIdx: index("disposition_codes_garage_idx").on(table.garageId),
}));

// Agent Performance Snapshots - Aggregated metrics per agent
export const agentPerformanceSnapshots = pgTable("agent_performance_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  agentUserId: varchar("agent_user_id").notNull().references(() => users.id),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  intervalStart: timestamp("interval_start").notNull(),
  intervalEnd: timestamp("interval_end").notNull(),
  callsHandled: integer("calls_handled").default(0),
  callsMissed: integer("calls_missed").default(0),
  avgHandleTimeSeconds: integer("avg_handle_time_seconds"),
  avgWaitTimeSeconds: integer("avg_wait_time_seconds"),
  firstCallResolutionRate: decimal("first_call_resolution_rate", { precision: 5, scale: 2 }), // percentage
  csatScore: decimal("csat_score", { precision: 3, scale: 2 }), // Customer satisfaction 1-5
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  agentIdx: index("agent_performance_agent_idx").on(table.agentUserId),
  garageIdx: index("agent_performance_garage_idx").on(table.garageId),
}));

// Type exports for Call Center
export type CallQueue = typeof callQueues.$inferSelect;
export type InsertCallQueue = typeof callQueues.$inferInsert;
export const insertCallQueueSchema = createInsertSchema(callQueues).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCallQueueSchema = createSelectSchema(callQueues);

export type CallQueueMember = typeof callQueueMembers.$inferSelect;
export type InsertCallQueueMember = typeof callQueueMembers.$inferInsert;
export const insertCallQueueMemberSchema = createInsertSchema(callQueueMembers).omit({ id: true, createdAt: true });

export type CallSession = typeof callSessions.$inferSelect;
export type InsertCallSession = typeof callSessions.$inferInsert;
export const insertCallSessionSchema = createInsertSchema(callSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCallSessionSchema = createSelectSchema(callSessions);

export type CallEvent = typeof callEvents.$inferSelect;
export type InsertCallEvent = typeof callEvents.$inferInsert;
export const insertCallEventSchema = createInsertSchema(callEvents).omit({ id: true, occurredAt: true });

export type CallNote = typeof callNotes.$inferSelect;
export type InsertCallNote = typeof callNotes.$inferInsert;
export const insertCallNoteSchema = createInsertSchema(callNotes).omit({ id: true, createdAt: true, updatedAt: true });

export type CallRecording = typeof callRecordings.$inferSelect;
export type InsertCallRecording = typeof callRecordings.$inferInsert;
export const insertCallRecordingSchema = createInsertSchema(callRecordings).omit({ id: true, createdAt: true });

export type CallDispositionCode = typeof callDispositionCodes.$inferSelect;
export type InsertCallDispositionCode = typeof callDispositionCodes.$inferInsert;
export const insertCallDispositionCodeSchema = createInsertSchema(callDispositionCodes).omit({ id: true, createdAt: true, updatedAt: true });

export type AgentPerformanceSnapshot = typeof agentPerformanceSnapshots.$inferSelect;
export type InsertAgentPerformanceSnapshot = typeof agentPerformanceSnapshots.$inferInsert;
export const insertAgentPerformanceSnapshotSchema = createInsertSchema(agentPerformanceSnapshots).omit({ id: true, createdAt: true });

// ========================================
// TECHNICIAN PERFORMANCE MODULE
// ========================================

// Technician Metric Definitions - Define available performance metrics
export const technicianMetricDefinitions = pgTable("technician_metric_definitions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  metricKey: varchar("metric_key", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  category: varchar("category", { length: 50 }), // efficiency, quality, customer_satisfaction, productivity
  aggregationType: varchar("aggregation_type", { length: 50 }), // sum, avg, count, min, max
  defaultConfig: jsonb("default_config"), // Default thresholds and visualization settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Technician Metric Preferences - User customization for dashboard metrics
export const technicianMetricPreferences = pgTable("technician_metric_preferences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  isPinned: boolean("is_pinned").default(false),
  thresholdConfig: jsonb("threshold_config"), // Custom thresholds for alerts
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userMetricUnique: uniqueIndex("tech_metric_pref_user_metric_unique").on(table.userId, table.metricKey),
}));

// Technician Performance Stream - Real-time metric values
export const technicianPerformanceStream = pgTable("technician_performance_stream", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  metricValue: decimal("metric_value", { precision: 12, scale: 2 }).notNull(),
  metadata: jsonb("metadata"), // Additional context
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
}, (table) => ({
  technicianIdx: index("perf_stream_technician_idx").on(table.technicianId),
  recordedAtIdx: index("perf_stream_recorded_at_idx").on(table.recordedAt),
  metricKeyIdx: index("perf_stream_metric_key_idx").on(table.metricKey),
}));

// Technician Performance Rollups - Aggregated metrics for efficient querying
export const technicianPerformanceRollups = pgTable("technician_performance_rollups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  intervalType: varchar("interval_type", { length: 20 }).notNull(), // daily, weekly, monthly
  intervalStart: timestamp("interval_start").notNull(),
  intervalEnd: timestamp("interval_end").notNull(),
  metrics: jsonb("metrics").notNull(), // {metricKey: {value, count, avg, min, max}}
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  technicianIntervalIdx: index("perf_rollup_tech_interval_idx").on(table.technicianId, table.intervalStart),
}));

// ========================================
// CUSTOMER FEEDBACK & RATING MODULE
// ========================================

// Service Feedback - Customer ratings and reviews
export const serviceFeedback = pgTable("service_feedback", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  technicianId: varchar("technician_id").references(() => users.id),
  overallRating: integer("overall_rating").notNull(), // 1-5
  waitTimeRating: integer("wait_time_rating"), // 1-5
  qualityRating: integer("quality_rating"), // 1-5
  communicationRating: integer("communication_rating"), // 1-5
  comments: text("comments"),
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
  sentimentScore: decimal("sentiment_score", { precision: 4, scale: 3 }), // -1.000 to 1.000
  sentimentKeywords: jsonb("sentiment_keywords"), // Array of detected keywords
  media: jsonb("media"), // Array of image URLs
  isVerified: boolean("is_verified").default(false),
  isPublic: boolean("is_public").default(true),
  isFlagged: boolean("is_flagged").default(false), // Flag for moderation
  flagReason: varchar("flag_reason", { length: 255 }),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
  response: text("response"),
}, (table) => ({
  jobCardIdx: index("feedback_job_card_idx").on(table.jobCardId),
  technicianIdx: index("feedback_technician_idx").on(table.technicianId),
  submittedAtIdx: index("feedback_submitted_at_idx").on(table.submittedAt),
  sentimentIdx: index("feedback_sentiment_idx").on(table.sentiment),
}));

// Technician Feedback Summary - Cached aggregate ratings
export const technicianFeedbackSummary = pgTable("technician_feedback_summary", {
  technicianId: varchar("technician_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  totalReviews: integer("total_reviews").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  rating5Count: integer("rating_5_count").default(0),
  rating4Count: integer("rating_4_count").default(0),
  rating3Count: integer("rating_3_count").default(0),
  rating2Count: integer("rating_2_count").default(0),
  rating1Count: integer("rating_1_count").default(0),
  rollingAvgLast30Days: decimal("rolling_avg_last_30_days", { precision: 3, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// ========================================
// MAINTENANCE REMINDER MODULE
// ========================================

// Maintenance Trigger Rules - Define when maintenance should be recommended
export const maintenanceTriggerRules = pgTable("maintenance_trigger_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 100 }), // null = all types
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  mileageThreshold: integer("mileage_threshold"),
  durationThresholdDays: integer("duration_threshold_days"),
  conditionExpression: jsonb("condition_expression"), // JSONLogic rules
  priority: integer("priority").default(5), // 1-10
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  garageIdx: index("maint_rules_garage_idx").on(table.garageId),
}));

// Maintenance Recommendations - Predicted maintenance needs
export const maintenanceRecommendations = pgTable("maintenance_recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  ruleId: uuid("rule_id").references(() => maintenanceTriggerRules.id),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  predictedDueAt: timestamp("predicted_due_at").notNull(),
  predictedMileage: integer("predicted_mileage"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  status: varchar("status", { length: 50 }).default("pending"), // pending, sent, acknowledged, completed, dismissed
  source: varchar("source", { length: 50 }).notNull(), // usage, history, manual, telematics
  notificationSentAt: timestamp("notification_sent_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  vehicleStatusIdx: index("maint_rec_vehicle_status_idx").on(table.vehicleId, table.status),
  predictedDueIdx: index("maint_rec_predicted_due_idx").on(table.predictedDueAt),
}));

// ========================================
// TELEMATICS MODULE
// ========================================

// Telematics Providers - External telematics service providers
export const telematicsProviders = pgTable("telematics_providers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  apiType: varchar("api_type", { length: 50 }).notNull(), // rest, mqtt, webhook
  baseUrl: varchar("base_url", { length: 500 }),
  authSchema: jsonb("auth_schema"), // OAuth config, API key format
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Telematics Devices - Vehicle-linked telematics hardware
export const telematicsDevices = pgTable("telematics_devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => telematicsProviders.id),
  externalDeviceId: varchar("external_device_id", { length: 255 }).notNull().unique(),
  deviceType: varchar("device_type", { length: 100 }), // obd2, gps_tracker, fleet_sensor
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  lastHeartbeat: timestamp("last_heartbeat"),
  status: varchar("status", { length: 50 }).default("active"), // active, inactive, disconnected
  installedAt: timestamp("installed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  vehicleIdx: index("telem_devices_vehicle_idx").on(table.vehicleId),
  providerIdx: index("telem_devices_provider_idx").on(table.providerId),
}));

// Telematics Streams - Define data streams from devices
export const telematicsStreams = pgTable("telematics_streams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: uuid("device_id").notNull().references(() => telematicsDevices.id, { onDelete: "cascade" }),
  streamType: varchar("stream_type", { length: 100 }).notNull(), // location, mileage, engine_hours, dtc_codes, fuel_level
  unit: varchar("unit", { length: 50 }), // miles, km, liters, hours
  thresholdConfig: jsonb("threshold_config"), // Alert thresholds
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  deviceIdx: index("telem_streams_device_idx").on(table.deviceId),
}));

// Telematics Readings - Time-series data from devices
export const telematicsReadings = pgTable("telematics_readings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  streamId: uuid("stream_id").notNull().references(() => telematicsStreams.id, { onDelete: "cascade" }),
  recordedAt: timestamp("recorded_at").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  payload: jsonb("payload"), // Full data payload for extensibility
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  streamRecordedIdx: index("telem_readings_stream_recorded_idx").on(table.streamId, table.recordedAt),
  streamRecordedUnique: uniqueIndex("telem_readings_stream_recorded_unique").on(table.streamId, table.recordedAt),
}));

// ========================================
// GAMIFICATION MODULE
// ========================================

// Gamification Event Definitions - Define point-earning events
export const gamificationEventDefinitions = pgTable("gamification_event_definitions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventKey: varchar("event_key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  badgeId: uuid("badge_id").references(() => gamificationBadges.id), // Optional badge award
  category: varchar("category", { length: 50 }), // job_completion, quality, punctuality, customer_service
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gamification Badges - Achievement badges
export const gamificationBadges = pgTable("gamification_badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }), // Icon name or URL
  tier: varchar("tier", { length: 50 }).default("bronze"), // bronze, silver, gold, platinum
  criteria: jsonb("criteria"), // JSONLogic for badge unlock conditions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gamification Events - Point-earning event log
export const gamificationEvents = pgTable("gamification_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventKey: varchar("event_key", { length: 100 }).notNull(),
  sourceId: uuid("source_id"), // Job card ID, feedback ID, etc.
  metadata: jsonb("metadata"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
}, (table) => ({
  technicianIdx: index("gamif_events_technician_idx").on(table.technicianId),
  occurredAtIdx: index("gamif_events_occurred_at_idx").on(table.occurredAt),
}));

// Gamification Badge Awards - Badges earned by technicians
export const gamificationBadgeAwards = pgTable("gamification_badge_awards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: uuid("badge_id").notNull().references(() => gamificationBadges.id, { onDelete: "cascade" }),
  awardedAt: timestamp("awarded_at").notNull().defaultNow(),
}, (table) => ({
  technicianBadgeUnique: uniqueIndex("gamif_badge_awards_tech_badge_unique").on(table.technicianId, table.badgeId),
}));

// Leaderboard Snapshots - Historical leaderboard rankings
export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  period: varchar("period", { length: 50 }).notNull(), // daily, weekly, monthly, all_time
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  technicianId: varchar("technician_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pointsTotal: integer("points_total").default(0),
  rank: integer("rank"),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
}, (table) => ({
  periodTechIdx: index("leaderboard_period_tech_idx").on(table.period, table.technicianId),
  periodRankIdx: index("leaderboard_period_rank_idx").on(table.period, table.rank),
}));

// Type exports for Technician Performance
export type TechnicianMetricDefinition = typeof technicianMetricDefinitions.$inferSelect;
export type InsertTechnicianMetricDefinition = typeof technicianMetricDefinitions.$inferInsert;
export const insertTechnicianMetricDefinitionSchema = createInsertSchema(technicianMetricDefinitions).omit({ id: true, createdAt: true });

export type TechnicianMetricPreference = typeof technicianMetricPreferences.$inferSelect;
export type InsertTechnicianMetricPreference = typeof technicianMetricPreferences.$inferInsert;
export const insertTechnicianMetricPreferenceSchema = createInsertSchema(technicianMetricPreferences).omit({ id: true, createdAt: true });

export type TechnicianPerformanceStream = typeof technicianPerformanceStream.$inferSelect;
export type InsertTechnicianPerformanceStream = typeof technicianPerformanceStream.$inferInsert;
export const insertTechnicianPerformanceStreamSchema = createInsertSchema(technicianPerformanceStream).omit({ id: true, recordedAt: true });

export type TechnicianPerformanceRollup = typeof technicianPerformanceRollups.$inferSelect;
export type InsertTechnicianPerformanceRollup = typeof technicianPerformanceRollups.$inferInsert;
export const insertTechnicianPerformanceRollupSchema = createInsertSchema(technicianPerformanceRollups).omit({ id: true, createdAt: true });

// Type exports for Customer Feedback
export type ServiceFeedback = typeof serviceFeedback.$inferSelect;
export type InsertServiceFeedback = typeof serviceFeedback.$inferInsert;
export const insertServiceFeedbackSchema = createInsertSchema(serviceFeedback).omit({ id: true, submittedAt: true });

export type TechnicianFeedbackSummary = typeof technicianFeedbackSummary.$inferSelect;
export type InsertTechnicianFeedbackSummary = typeof technicianFeedbackSummary.$inferInsert;
export const insertTechnicianFeedbackSummarySchema = createInsertSchema(technicianFeedbackSummary).omit({ lastUpdated: true });

// Type exports for Maintenance Reminders
export type MaintenanceTriggerRule = typeof maintenanceTriggerRules.$inferSelect;
export type InsertMaintenanceTriggerRule = typeof maintenanceTriggerRules.$inferInsert;
export const insertMaintenanceTriggerRuleSchema = createInsertSchema(maintenanceTriggerRules).omit({ id: true, createdAt: true, updatedAt: true });

export type MaintenanceRecommendation = typeof maintenanceRecommendations.$inferSelect;
export type InsertMaintenanceRecommendation = typeof maintenanceRecommendations.$inferInsert;
export const insertMaintenanceRecommendationSchema = createInsertSchema(maintenanceRecommendations).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports for Telematics
export type TelematicsProvider = typeof telematicsProviders.$inferSelect;
export type InsertTelematicsProvider = typeof telematicsProviders.$inferInsert;
export const insertTelematicsProviderSchema = createInsertSchema(telematicsProviders).omit({ id: true, createdAt: true });

export type TelematicsDevice = typeof telematicsDevices.$inferSelect;
export type InsertTelematicsDevice = typeof telematicsDevices.$inferInsert;
export const insertTelematicsDeviceSchema = createInsertSchema(telematicsDevices).omit({ id: true, createdAt: true });

export type TelematicsStream = typeof telematicsStreams.$inferSelect;
export type InsertTelematicsStream = typeof telematicsStreams.$inferInsert;
export const insertTelematicsStreamSchema = createInsertSchema(telematicsStreams).omit({ id: true, createdAt: true });

export type TelematicsReading = typeof telematicsReadings.$inferSelect;
export type InsertTelematicsReading = typeof telematicsReadings.$inferInsert;
export const insertTelematicsReadingSchema = createInsertSchema(telematicsReadings).omit({ id: true, createdAt: true });

// Type exports for Gamification
export type GamificationEventDefinition = typeof gamificationEventDefinitions.$inferSelect;
export type InsertGamificationEventDefinition = typeof gamificationEventDefinitions.$inferInsert;
export const insertGamificationEventDefinitionSchema = createInsertSchema(gamificationEventDefinitions).omit({ id: true, createdAt: true });

export type GamificationBadge = typeof gamificationBadges.$inferSelect;
export type InsertGamificationBadge = typeof gamificationBadges.$inferInsert;
export const insertGamificationBadgeSchema = createInsertSchema(gamificationBadges).omit({ id: true, createdAt: true });

export type GamificationEvent = typeof gamificationEvents.$inferSelect;
export type InsertGamificationEvent = typeof gamificationEvents.$inferInsert;
export const insertGamificationEventSchema = createInsertSchema(gamificationEvents).omit({ id: true, occurredAt: true });

export type GamificationBadgeAward = typeof gamificationBadgeAwards.$inferSelect;
export type InsertGamificationBadgeAward = typeof gamificationBadgeAwards.$inferInsert;
export const insertGamificationBadgeAwardSchema = createInsertSchema(gamificationBadgeAwards).omit({ id: true, awardedAt: true });

export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type InsertLeaderboardSnapshot = typeof leaderboardSnapshots.$inferInsert;
export const insertLeaderboardSnapshotSchema = createInsertSchema(leaderboardSnapshots).omit({ id: true, generatedAt: true });

// ============================================================================
// B2B PARTS NETWORK MODULE - Supplier/Dealer/Garage Marketplace
// ============================================================================

// Network Members - Suppliers, Dealers, Stores, Authorized Sellers
export const partsNetworkMembers = pgTable("parts_network_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  garageId: uuid("garage_id").references(() => garages.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  
  // Member type and info
  memberType: varchar("member_type", { length: 50 }).notNull(), // "supplier", "dealer", "store", "authorized_seller", "garage_keeper"
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyNameAr: varchar("company_name_ar", { length: 255 }), // Arabic name
  tradeLicense: varchar("trade_license", { length: 100 }),
  vatNumber: varchar("vat_number", { length: 50 }),
  
  // Contact info
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  
  // Location
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }), // Region/Province
  country: varchar("country", { length: 100 }).default("Saudi Arabia"),
  coordinates: jsonb("coordinates"), // { lat, lng }
  
  // Specialization
  specializedBrands: jsonb("specialized_brands"), // Array of brand names they specialize in
  partCategories: jsonb("part_categories"), // Array of categories they handle
  vehicleTypes: jsonb("vehicle_types"), // Types of vehicles they serve
  
  // Verification
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verificationDocuments: jsonb("verification_documents"), // Array of document URLs
  
  // Rating and performance
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalQuotations: integer("total_quotations").default(0),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("0.00"),
  avgResponseTimeHours: decimal("avg_response_time_hours", { precision: 5, scale: 2 }),
  
  // Settings
  autoAcceptQuotations: boolean("auto_accept_quotations").default(false),
  notificationPreferences: jsonb("notification_preferences"),
  deliveryRadius: integer("delivery_radius"), // km
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }),
  
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotation Requests - From Garage Keepers to Suppliers
export const partsQuotationRequests = pgTable("parts_quotation_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  
  // Requester info
  requesterId: uuid("requester_id").notNull().references(() => partsNetworkMembers.id),
  garageId: uuid("garage_id").references(() => garages.id),
  
  // Part details
  partNumber: varchar("part_number", { length: 100 }),
  partName: varchar("part_name", { length: 255 }).notNull(),
  partNameAr: varchar("part_name_ar", { length: 255 }),
  brand: varchar("brand", { length: 100 }),
  alternativeBrands: jsonb("alternative_brands"), // Array of acceptable alternative brands
  quantity: integer("quantity").notNull().default(1),
  
  // Vehicle info for compatibility
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleYear: integer("vehicle_year"),
  vehicleVin: varchar("vehicle_vin", { length: 50 }),
  
  // Request settings
  urgency: varchar("urgency", { length: 20 }).default("normal"), // "urgent", "normal", "low"
  expiresAt: timestamp("expires_at"), // When the request expires
  deliveryPreference: varchar("delivery_preference", { length: 50 }).default("pickup"), // "pickup", "delivery", "both"
  preferredDeliveryLocation: text("preferred_delivery_location"),
  
  // Targeting
  targetBrands: jsonb("target_brands"), // Specific supplier brands to target
  targetMemberTypes: jsonb("target_member_types"), // ["supplier", "dealer"]
  targetRegions: jsonb("target_regions"), // Specific regions to send to
  
  // Media
  images: jsonb("images"), // Array of image URLs of the part
  documents: jsonb("documents"), // Spec sheets, etc.
  notes: text("notes"),
  
  // Status tracking
  status: varchar("status", { length: 30 }).default("open"), // "open", "pending_responses", "reviewing", "ordered", "cancelled", "expired"
  selectedResponseId: uuid("selected_response_id"),
  
  // Stats
  viewCount: integer("view_count").default(0),
  responseCount: integer("response_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotation Responses - From Suppliers to Garage Keepers
export const partsQuotationResponses = pgTable("parts_quotation_responses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: uuid("request_id").notNull().references(() => partsQuotationRequests.id),
  responderId: uuid("responder_id").notNull().references(() => partsNetworkMembers.id),
  
  // Part offer details
  offeredPartNumber: varchar("offered_part_number", { length: 100 }),
  offeredPartName: varchar("offered_part_name", { length: 255 }).notNull(),
  offeredBrand: varchar("offered_brand", { length: 100 }),
  partCondition: varchar("part_condition", { length: 30 }).default("new"), // "new", "refurbished", "used"
  warranty: varchar("warranty", { length: 100 }),
  
  // Pricing
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  vatIncluded: boolean("vat_included").default(true),
  
  // Quantity and availability
  availableQuantity: integer("available_quantity").notNull(),
  minOrderQuantity: integer("min_order_quantity").default(1),
  
  // Delivery
  deliveryOption: varchar("delivery_option", { length: 30 }).default("pickup"), // "pickup", "delivery", "both"
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }).default("0"),
  estimatedDeliveryDays: integer("estimated_delivery_days"),
  pickupLocation: text("pickup_location"),
  
  // Validity
  validUntil: timestamp("valid_until"),
  
  // Media and notes
  images: jsonb("images"),
  notes: text("notes"),
  
  // Status
  status: varchar("status", { length: 30 }).default("submitted"), // "submitted", "viewed", "selected", "rejected", "expired"
  viewedAt: timestamp("viewed_at"),
  selectedAt: timestamp("selected_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotation Messages - Communication between parties
export const partsQuotationMessages = pgTable("parts_quotation_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: uuid("request_id").notNull().references(() => partsQuotationRequests.id),
  responseId: uuid("response_id").references(() => partsQuotationResponses.id),
  
  senderId: uuid("sender_id").notNull().references(() => partsNetworkMembers.id),
  receiverId: uuid("receiver_id").notNull().references(() => partsNetworkMembers.id),
  
  messageType: varchar("message_type", { length: 30 }).default("text"), // "text", "image", "document", "price_update", "counter_offer"
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // Array of attachment URLs
  
  // For counter offers
  counterOfferPrice: decimal("counter_offer_price", { precision: 10, scale: 2 }),
  counterOfferQuantity: integer("counter_offer_quantity"),
  
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Parts Network Notifications
export const partsNetworkNotifications = pgTable("parts_network_notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid("member_id").notNull().references(() => partsNetworkMembers.id),
  
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // "new_request", "new_response", "new_message", "request_selected", "request_expired"
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  content: text("content"),
  contentAr: text("content_ar"),
  
  referenceType: varchar("reference_type", { length: 30 }), // "request", "response", "message"
  referenceId: uuid("reference_id"),
  
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Parts Network Orders - When a quotation is accepted
export const partsNetworkOrders = pgTable("parts_network_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  
  requestId: uuid("request_id").notNull().references(() => partsQuotationRequests.id),
  responseId: uuid("response_id").notNull().references(() => partsQuotationResponses.id),
  buyerId: uuid("buyer_id").notNull().references(() => partsNetworkMembers.id),
  sellerId: uuid("seller_id").notNull().references(() => partsNetworkMembers.id),
  
  // Order details
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0"),
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  
  // Delivery
  deliveryMethod: varchar("delivery_method", { length: 30 }), // "pickup", "delivery"
  deliveryAddress: text("delivery_address"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  
  // Status
  status: varchar("status", { length: 30 }).default("pending"), // "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"
  paymentStatus: varchar("payment_status", { length: 30 }).default("pending"), // "pending", "paid", "partial", "refunded"
  
  // Tracking
  trackingNumber: varchar("tracking_number", { length: 100 }),
  trackingUrl: varchar("tracking_url", { length: 500 }),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for B2B Parts Network
export type PartsNetworkMember = typeof partsNetworkMembers.$inferSelect;
export type InsertPartsNetworkMember = typeof partsNetworkMembers.$inferInsert;
export const insertPartsNetworkMemberSchema = createInsertSchema(partsNetworkMembers).omit({
  id: true,
  rating: true,
  totalQuotations: true,
  responseRate: true,
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type PartsQuotationRequest = typeof partsQuotationRequests.$inferSelect;
export type InsertPartsQuotationRequest = typeof partsQuotationRequests.$inferInsert;
export const insertPartsQuotationRequestSchema = createInsertSchema(partsQuotationRequests).omit({
  id: true,
  viewCount: true,
  responseCount: true,
  createdAt: true,
  updatedAt: true,
});

export type PartsQuotationResponse = typeof partsQuotationResponses.$inferSelect;
export type InsertPartsQuotationResponse = typeof partsQuotationResponses.$inferInsert;
export const insertPartsQuotationResponseSchema = createInsertSchema(partsQuotationResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PartsQuotationMessage = typeof partsQuotationMessages.$inferSelect;
export type InsertPartsQuotationMessage = typeof partsQuotationMessages.$inferInsert;
export const insertPartsQuotationMessageSchema = createInsertSchema(partsQuotationMessages).omit({
  id: true,
  createdAt: true,
});

export type PartsNetworkNotification = typeof partsNetworkNotifications.$inferSelect;
export type InsertPartsNetworkNotification = typeof partsNetworkNotifications.$inferInsert;
export const insertPartsNetworkNotificationSchema = createInsertSchema(partsNetworkNotifications).omit({
  id: true,
  createdAt: true,
});

export type PartsNetworkOrder = typeof partsNetworkOrders.$inferSelect;
export type InsertPartsNetworkOrder = typeof partsNetworkOrders.$inferInsert;
export const insertPartsNetworkOrderSchema = createInsertSchema(partsNetworkOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// =====================================
// Marketing Platform Hub
// =====================================

// Marketing Providers (Google Ads, Facebook, Instagram, Twitter/X, LinkedIn, TikTok, etc.)
export const marketingProviders = pgTable("marketing_providers", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(), // "Google Ads", "Facebook Ads", etc.
  code: varchar("code", { length: 50 }).notNull().unique(), // "google_ads", "facebook", etc.
  type: varchar("type", { length: 50 }).notNull(), // "search", "social", "display", "video"
  iconUrl: varchar("icon_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  capabilities: jsonb("capabilities").default([]), // ["search_ads", "display_ads", "video_ads", "retargeting"]
  authType: varchar("auth_type", { length: 50 }).default("api_key"), // "api_key", "oauth", "both"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing Accounts - connections to external platforms
export const marketingAccounts = pgTable("marketing_accounts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  providerId: uuid("provider_id")
    .references(() => marketingProviders.id)
    .notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountId: varchar("account_id", { length: 255 }), // External account ID
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "connected", "disconnected", "error", "suspended"
  credentials: jsonb("credentials").default({}), // Encrypted API keys/tokens (placeholder)
  settings: jsonb("settings").default({}), // Account-specific settings
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: varchar("sync_status", { length: 50 }).default("never"), // "never", "syncing", "success", "failed"
  totalSpend: decimal("total_spend", { precision: 12, scale: 2 }).default("0.00"),
  monthlyBudget: decimal("monthly_budget", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ad Campaigns - campaigns across all platforms
export const marketingAdCampaigns = pgTable("marketing_ad_campaigns", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id")
    .references(() => marketingAccounts.id)
    .notNull(),
  campaignName: varchar("campaign_name", { length: 255 }).notNull(),
  externalCampaignId: varchar("external_campaign_id", { length: 255 }),
  objective: varchar("objective", { length: 100 }), // "awareness", "traffic", "engagement", "leads", "conversions", "sales"
  status: varchar("status", { length: 50 }).default("draft"), // "draft", "pending_review", "active", "paused", "completed", "rejected"
  budget: decimal("budget", { precision: 12, scale: 2 }),
  budgetType: varchar("budget_type", { length: 50 }).default("daily"), // "daily", "lifetime", "monthly"
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).default("0.00"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: jsonb("target_audience").default({}), // Demographics, interests, locations
  adContent: jsonb("ad_content").default({}), // Headlines, descriptions, images, videos
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  ctr: decimal("ctr", { precision: 8, scale: 4 }).default("0.00"), // Click-through rate
  cpc: decimal("cpc", { precision: 8, scale: 4 }).default("0.00"), // Cost per click
  cpm: decimal("cpm", { precision: 8, scale: 4 }).default("0.00"), // Cost per mille
  conversionRate: decimal("conversion_rate", { precision: 8, scale: 4 }).default("0.00"),
  lastSyncAt: timestamp("last_sync_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing Spend Snapshots - daily performance metrics
export const marketingSpendSnapshots = pgTable("marketing_spend_snapshots", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id")
    .references(() => marketingAccounts.id)
    .notNull(),
  campaignId: uuid("campaign_id").references(() => marketingAdCampaigns.id),
  snapshotDate: date("snapshot_date").notNull(),
  spend: decimal("spend", { precision: 12, scale: 2 }).default("0.00"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  ctr: decimal("ctr", { precision: 8, scale: 4 }).default("0.00"),
  cpc: decimal("cpc", { precision: 8, scale: 4 }).default("0.00"),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0.00"),
  roas: decimal("roas", { precision: 8, scale: 4 }).default("0.00"), // Return on ad spend
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing Tasks/Workflows - for tracking account setup, compliance, etc.
export const marketingTasks = pgTable("marketing_tasks", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id").references(() => marketingAccounts.id),
  campaignId: uuid("campaign_id").references(() => marketingAdCampaigns.id),
  taskType: varchar("task_type", { length: 100 }).notNull(), // "account_setup", "creative_review", "budget_review", "compliance_check"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "in_progress", "completed", "cancelled"
  priority: varchar("priority", { length: 20 }).default("medium"), // "low", "medium", "high", "urgent"
  dueDate: timestamp("due_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing Notes - audit trail and comments
export const marketingNotes = pgTable("marketing_notes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id").references(() => marketingAccounts.id),
  campaignId: uuid("campaign_id").references(() => marketingAdCampaigns.id),
  noteType: varchar("note_type", { length: 50 }).default("general"), // "general", "performance", "issue", "action"
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing Creative Assets
export const marketingCreatives = pgTable("marketing_creatives", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id").references(() => marketingAccounts.id),
  campaignId: uuid("campaign_id").references(() => marketingAdCampaigns.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "image", "video", "carousel", "text"
  format: varchar("format", { length: 50 }), // "1080x1080", "1200x628", "1920x1080", etc.
  fileUrl: varchar("file_url", { length: 1000 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 1000 }),
  headline: varchar("headline", { length: 500 }),
  description: text("description"),
  callToAction: varchar("call_to_action", { length: 100 }),
  status: varchar("status", { length: 50 }).default("draft"), // "draft", "pending_review", "approved", "rejected", "active"
  performance: jsonb("performance").default({}), // clicks, impressions, ctr for this creative
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for Marketing Platform
export type MarketingProvider = typeof marketingProviders.$inferSelect;
export type InsertMarketingProvider = typeof marketingProviders.$inferInsert;
export const insertMarketingProviderSchema = createInsertSchema(marketingProviders).omit({
  id: true,
  createdAt: true,
});

export type MarketingAccount = typeof marketingAccounts.$inferSelect;
export type InsertMarketingAccount = typeof marketingAccounts.$inferInsert;
export const insertMarketingAccountSchema = createInsertSchema(marketingAccounts).omit({
  id: true,
  totalSpend: true,
  lastSyncAt: true,
  syncStatus: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingAdCampaign = typeof marketingAdCampaigns.$inferSelect;
export type InsertMarketingAdCampaign = typeof marketingAdCampaigns.$inferInsert;
export const insertMarketingAdCampaignSchema = createInsertSchema(marketingAdCampaigns).omit({
  id: true,
  spentAmount: true,
  impressions: true,
  clicks: true,
  conversions: true,
  ctr: true,
  cpc: true,
  cpm: true,
  conversionRate: true,
  lastSyncAt: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingSpendSnapshot = typeof marketingSpendSnapshots.$inferSelect;
export type InsertMarketingSpendSnapshot = typeof marketingSpendSnapshots.$inferInsert;
export const insertMarketingSpendSnapshotSchema = createInsertSchema(marketingSpendSnapshots).omit({
  id: true,
  createdAt: true,
});

export type MarketingTask = typeof marketingTasks.$inferSelect;
export type InsertMarketingTask = typeof marketingTasks.$inferInsert;
export const insertMarketingTaskSchema = createInsertSchema(marketingTasks).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingNote = typeof marketingNotes.$inferSelect;
export type InsertMarketingNote = typeof marketingNotes.$inferInsert;
export const insertMarketingNoteSchema = createInsertSchema(marketingNotes).omit({
  id: true,
  createdAt: true,
});

export type MarketingCreative = typeof marketingCreatives.$inferSelect;
export type InsertMarketingCreative = typeof marketingCreatives.$inferInsert;
export const insertMarketingCreativeSchema = createInsertSchema(marketingCreatives).omit({
  id: true,
  performance: true,
  createdAt: true,
  updatedAt: true,
});

// Marketing Conversations - unified inbox for all platforms
export const marketingConversations = pgTable("marketing_conversations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id")
    .references(() => marketingAccounts.id)
    .notNull(),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  providerThreadId: varchar("provider_thread_id", { length: 255 }), // External thread ID
  channel: varchar("channel", { length: 50 }).notNull(), // "dm", "messenger", "instagram_dm", "twitter_dm", "linkedin_message"
  participantName: varchar("participant_name", { length: 255 }),
  participantAvatar: varchar("participant_avatar", { length: 1000 }),
  participantHandle: varchar("participant_handle", { length: 255 }),
  status: varchar("status", { length: 50 }).default("open"), // "open", "pending", "resolved", "archived"
  priority: varchar("priority", { length: 20 }).default("normal"), // "low", "normal", "high", "urgent"
  assignedTo: varchar("assigned_to").references(() => users.id),
  unreadCount: integer("unread_count").default(0),
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing Messages - individual messages in conversations
export const marketingMessages = pgTable("marketing_messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id")
    .references(() => marketingConversations.id)
    .notNull(),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  direction: varchar("direction", { length: 20 }).notNull(), // "inbound", "outbound"
  senderName: varchar("sender_name", { length: 255 }),
  senderAvatar: varchar("sender_avatar", { length: 1000 }),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).default("text"), // "text", "image", "video", "file", "template"
  attachments: jsonb("attachments").default([]),
  deliveryStatus: varchar("delivery_status", { length: 50 }).default("sent"), // "pending", "sent", "delivered", "read", "failed"
  isRead: boolean("is_read").default(false),
  sentBy: varchar("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing Comment Threads - comments on posts/ads
export const marketingCommentThreads = pgTable("marketing_comment_threads", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: uuid("account_id")
    .references(() => marketingAccounts.id)
    .notNull(),
  campaignId: uuid("campaign_id").references(() => marketingAdCampaigns.id),
  providerPostId: varchar("provider_post_id", { length: 255 }),
  postContent: text("post_content"),
  postUrl: varchar("post_url", { length: 1000 }),
  postType: varchar("post_type", { length: 50 }), // "ad", "organic", "story", "reel"
  totalComments: integer("total_comments").default(0),
  unrepliedCount: integer("unreplied_count").default(0),
  sentiment: varchar("sentiment", { length: 20 }), // "positive", "neutral", "negative", "mixed"
  lastCommentAt: timestamp("last_comment_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing Comments - individual comments and replies
export const marketingComments = pgTable("marketing_comments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  threadId: uuid("thread_id")
    .references(() => marketingCommentThreads.id)
    .notNull(),
  parentCommentId: uuid("parent_comment_id"), // For replies to comments
  providerCommentId: varchar("provider_comment_id", { length: 255 }),
  authorName: varchar("author_name", { length: 255 }),
  authorAvatar: varchar("author_avatar", { length: 1000 }),
  authorHandle: varchar("author_handle", { length: 255 }),
  content: text("content").notNull(),
  sentiment: varchar("sentiment", { length: 20 }), // "positive", "neutral", "negative"
  isFromUs: boolean("is_from_us").default(false),
  isHidden: boolean("is_hidden").default(false),
  hasReplied: boolean("has_replied").default(false),
  likes: integer("likes").default(0),
  repliedBy: varchar("replied_by").references(() => users.id),
  repliedAt: timestamp("replied_at"),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Marketing Conversations
export type MarketingConversation = typeof marketingConversations.$inferSelect;
export type InsertMarketingConversation = typeof marketingConversations.$inferInsert;
export const insertMarketingConversationSchema = createInsertSchema(marketingConversations).omit({
  id: true,
  unreadCount: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingMessage = typeof marketingMessages.$inferSelect;
export type InsertMarketingMessage = typeof marketingMessages.$inferInsert;
export const insertMarketingMessageSchema = createInsertSchema(marketingMessages).omit({
  id: true,
  isRead: true,
  sentAt: true,
  createdAt: true,
});

export type MarketingCommentThread = typeof marketingCommentThreads.$inferSelect;
export type InsertMarketingCommentThread = typeof marketingCommentThreads.$inferInsert;
export const insertMarketingCommentThreadSchema = createInsertSchema(marketingCommentThreads).omit({
  id: true,
  totalComments: true,
  unrepliedCount: true,
  lastCommentAt: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingComment = typeof marketingComments.$inferSelect;
export type InsertMarketingComment = typeof marketingComments.$inferInsert;
export const insertMarketingCommentSchema = createInsertSchema(marketingComments).omit({
  id: true,
  hasReplied: true,
  repliedAt: true,
  createdAt: true,
});

// ============================================
// COMPREHENSIVE HR MODULE
// ============================================

// HR Departments - organizational structure
export const hrDepartments = pgTable("hr_departments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  parentDepartmentId: uuid("parent_department_id"),
  managerId: varchar("manager_id").references(() => users.id),
  costCenter: varchar("cost_center", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HR Positions/Job Titles
export const hrPositions = pgTable("hr_positions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  departmentId: uuid("department_id").references(() => hrDepartments.id),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  code: varchar("code", { length: 50 }),
  level: varchar("level", { length: 50 }), // "entry", "mid", "senior", "lead", "manager", "director", "executive"
  minSalary: decimal("min_salary", { precision: 12, scale: 2 }),
  maxSalary: decimal("max_salary", { precision: 12, scale: 2 }),
  description: text("description"),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// HR Employee Profiles - extended employee information
export const hrEmployeeProfiles = pgTable("hr_employee_profiles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  employeeNumber: varchar("employee_number", { length: 50 }),
  departmentId: uuid("department_id").references(() => hrDepartments.id),
  positionId: uuid("position_id").references(() => hrPositions.id),
  managerId: varchar("manager_id").references(() => users.id),
  employmentType: varchar("employment_type", { length: 50 }).default("full_time"), // "full_time", "part_time", "contract", "intern"
  employmentStatus: varchar("employment_status", { length: 50 }).default("active"), // "active", "on_leave", "suspended", "terminated", "resigned"
  hireDate: date("hire_date"),
  probationEndDate: date("probation_end_date"),
  terminationDate: date("termination_date"),
  workLocation: varchar("work_location", { length: 255 }),
  workEmail: varchar("work_email", { length: 255 }),
  workPhone: varchar("work_phone", { length: 50 }),
  extension: varchar("extension", { length: 20 }),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 100 }),
  nationalId: varchar("national_id", { length: 50 }),
  passportNumber: varchar("passport_number", { length: 50 }),
  passportExpiry: date("passport_expiry"),
  visaType: varchar("visa_type", { length: 100 }),
  visaExpiry: date("visa_expiry"),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  iban: varchar("iban", { length: 50 }),
  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  salaryPaymentMethod: varchar("salary_payment_method", { length: 50 }).default("bank_transfer"),
  gosiNumber: varchar("gosi_number", { length: 50 }), // Saudi Social Insurance
  medicalInsuranceNumber: varchar("medical_insurance_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HR Employment Contracts
export const hrContracts = pgTable("hr_contracts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  contractType: varchar("contract_type", { length: 50 }).notNull(), // "permanent", "fixed_term", "probation", "internship"
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  salary: decimal("salary", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  salaryFrequency: varchar("salary_frequency", { length: 20 }).default("monthly"),
  workingHoursPerWeek: decimal("working_hours_per_week", { precision: 4, scale: 1 }).default("40"),
  probationPeriodDays: integer("probation_period_days"),
  noticePeriodDays: integer("notice_period_days"),
  benefits: jsonb("benefits").default([]),
  terms: text("terms"),
  signedAt: timestamp("signed_at"),
  signedByEmployee: boolean("signed_by_employee").default(false),
  signedByHr: boolean("signed_by_hr").default(false),
  status: varchar("status", { length: 50 }).default("draft"), // "draft", "pending_signature", "active", "expired", "terminated"
  documentUrl: varchar("document_url", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// HR Documents
export const hrDocuments = pgTable("hr_documents", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(), // "id_card", "passport", "visa", "certificate", "contract", "offer_letter", "warning", "other"
  documentName: varchar("document_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  expiryDate: date("expiry_date"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leave Types
export const hrLeaveTypes = pgTable("hr_leave_types", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  code: varchar("code", { length: 20 }),
  description: text("description"),
  isPaid: boolean("is_paid").default(true),
  defaultDaysPerYear: integer("default_days_per_year").default(0),
  maxConsecutiveDays: integer("max_consecutive_days"),
  requiresApproval: boolean("requires_approval").default(true),
  requiresDocument: boolean("requires_document").default(false),
  carryOverAllowed: boolean("carry_over_allowed").default(false),
  maxCarryOverDays: integer("max_carry_over_days"),
  color: varchar("color", { length: 20 }).default("#3b82f6"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leave Balances
export const hrLeaveBalances = pgTable("hr_leave_balances", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  leaveTypeId: uuid("leave_type_id").references(() => hrLeaveTypes.id).notNull(),
  year: integer("year").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 1 }).default("0"),
  usedDays: decimal("used_days", { precision: 5, scale: 1 }).default("0"),
  pendingDays: decimal("pending_days", { precision: 5, scale: 1 }).default("0"),
  carriedOverDays: decimal("carried_over_days", { precision: 5, scale: 1 }).default("0"),
  adjustedDays: decimal("adjusted_days", { precision: 5, scale: 1 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave Requests
export const hrLeaveRequests = pgTable("hr_leave_requests", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  leaveTypeId: uuid("leave_type_id").references(() => hrLeaveTypes.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 1 }).notNull(),
  reason: text("reason"),
  documentUrl: varchar("document_url", { length: 1000 }),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "approved", "rejected", "cancelled"
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  handoverTo: varchar("handover_to").references(() => users.id),
  handoverNotes: text("handover_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Postings / Openings
export const hrJobPostings = pgTable("hr_job_postings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  positionId: uuid("position_id").references(() => hrPositions.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  departmentId: uuid("department_id").references(() => hrDepartments.id),
  employmentType: varchar("employment_type", { length: 50 }),
  experienceLevel: varchar("experience_level", { length: 50 }),
  salaryRangeMin: decimal("salary_range_min", { precision: 12, scale: 2 }),
  salaryRangeMax: decimal("salary_range_max", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  location: varchar("location", { length: 255 }),
  isRemote: boolean("is_remote").default(false),
  openPositions: integer("open_positions").default(1),
  filledPositions: integer("filled_positions").default(0),
  status: varchar("status", { length: 50 }).default("draft"), // "draft", "open", "on_hold", "closed", "filled"
  publishedAt: timestamp("published_at"),
  closingDate: date("closing_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidates / Applicants
export const hrCandidates = pgTable("hr_candidates", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobPostingId: uuid("job_posting_id").references(() => hrJobPostings.id).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  resumeUrl: varchar("resume_url", { length: 1000 }),
  coverLetterUrl: varchar("cover_letter_url", { length: 1000 }),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  source: varchar("source", { length: 100 }), // "linkedin", "indeed", "referral", "website", "walk_in"
  referredBy: varchar("referred_by").references(() => users.id),
  currentCompany: varchar("current_company", { length: 255 }),
  currentPosition: varchar("current_position", { length: 255 }),
  expectedSalary: decimal("expected_salary", { precision: 12, scale: 2 }),
  noticePeriod: varchar("notice_period", { length: 100 }),
  yearsOfExperience: decimal("years_of_experience", { precision: 4, scale: 1 }),
  stage: varchar("stage", { length: 50 }).default("applied"), // "applied", "screening", "phone_interview", "interview", "technical_test", "offer", "hired", "rejected"
  rating: integer("rating"),
  notes: text("notes"),
  skills: jsonb("skills").default([]),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidate Interview Schedule
export const hrInterviews = pgTable("hr_interviews", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  candidateId: uuid("candidate_id").references(() => hrCandidates.id).notNull(),
  interviewType: varchar("interview_type", { length: 100 }).notNull(), // "phone_screening", "video", "in_person", "technical", "panel", "final"
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  location: varchar("location", { length: 255 }),
  meetingLink: varchar("meeting_link", { length: 500 }),
  interviewers: jsonb("interviewers").default([]),
  status: varchar("status", { length: 50 }).default("scheduled"), // "scheduled", "completed", "cancelled", "no_show"
  feedback: text("feedback"),
  rating: integer("rating"),
  recommendation: varchar("recommendation", { length: 50 }), // "strong_hire", "hire", "no_hire", "strong_no_hire"
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Benefit Plans
export const hrBenefitPlans = pgTable("hr_benefit_plans", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  type: varchar("type", { length: 100 }).notNull(), // "health_insurance", "life_insurance", "dental", "vision", "retirement", "housing", "transportation", "education", "other"
  description: text("description"),
  provider: varchar("provider", { length: 255 }),
  policyNumber: varchar("policy_number", { length: 100 }),
  coverage: text("coverage"),
  employerContribution: decimal("employer_contribution", { precision: 12, scale: 2 }),
  employeeContribution: decimal("employee_contribution", { precision: 12, scale: 2 }),
  eligibilityRules: jsonb("eligibility_rules").default({}),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee Benefit Enrollments
export const hrBenefitEnrollments = pgTable("hr_benefit_enrollments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  benefitPlanId: uuid("benefit_plan_id").references(() => hrBenefitPlans.id).notNull(),
  enrollmentDate: date("enrollment_date").notNull(),
  effectiveDate: date("effective_date"),
  terminationDate: date("termination_date"),
  coverage: varchar("coverage", { length: 100 }), // "employee_only", "employee_spouse", "employee_children", "family"
  dependents: jsonb("dependents").default([]),
  employeeContribution: decimal("employee_contribution", { precision: 12, scale: 2 }),
  employerContribution: decimal("employer_contribution", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("active"), // "pending", "active", "terminated", "waived"
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance Reviews / Evaluations
export const hrPerformanceReviews = pgTable("hr_performance_reviews", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  reviewPeriodStart: date("review_period_start").notNull(),
  reviewPeriodEnd: date("review_period_end").notNull(),
  reviewType: varchar("review_type", { length: 50 }).default("annual"), // "probation", "quarterly", "annual", "mid_year", "project"
  overallRating: integer("overall_rating"),
  ratings: jsonb("ratings").default({}), // {"communication": 4, "teamwork": 5, ...}
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  achievements: text("achievements"),
  goals: text("goals"),
  selfAssessment: text("self_assessment"),
  managerComments: text("manager_comments"),
  employeeComments: text("employee_comments"),
  developmentPlan: text("development_plan"),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "self_review", "manager_review", "calibration", "completed"
  acknowledgedByEmployee: boolean("acknowledged_by_employee").default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance Goals
export const hrPerformanceGoals = pgTable("hr_performance_goals", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  reviewId: uuid("review_id").references(() => hrPerformanceReviews.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "performance", "development", "project", "team"
  targetDate: date("target_date"),
  weight: integer("weight").default(100),
  progress: integer("progress").default(0),
  status: varchar("status", { length: 50 }).default("in_progress"), // "not_started", "in_progress", "completed", "cancelled"
  measurementCriteria: text("measurement_criteria"),
  result: text("result"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HR Announcements
export const hrAnnouncements = pgTable("hr_announcements", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("general"), // "general", "policy", "event", "holiday", "urgent"
  priority: varchar("priority", { length: 20 }).default("normal"), // "low", "normal", "high", "urgent"
  targetAudience: varchar("target_audience", { length: 100 }).default("all"), // "all", "department", "position"
  targetDepartmentId: uuid("target_department_id").references(() => hrDepartments.id),
  attachmentUrl: varchar("attachment_url", { length: 1000 }),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee Self-Service Requests
export const hrSelfServiceRequests = pgTable("hr_self_service_requests", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => hrEmployeeProfiles.id).notNull(),
  requestType: varchar("request_type", { length: 100 }).notNull(), // "salary_certificate", "experience_letter", "bank_letter", "noc", "info_update", "expense_claim", "loan", "advance"
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  attachments: jsonb("attachments").default([]),
  priority: varchar("priority", { length: 20 }).default("normal"),
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "in_progress", "approved", "rejected", "completed"
  assignedTo: varchar("assigned_to").references(() => users.id),
  response: text("response"),
  documentUrl: varchar("document_url", { length: 1000 }),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for HR Module
export type HrDepartment = typeof hrDepartments.$inferSelect;
export type InsertHrDepartment = typeof hrDepartments.$inferInsert;
export const insertHrDepartmentSchema = createInsertSchema(hrDepartments).omit({ id: true, createdAt: true, updatedAt: true });

export type HrPosition = typeof hrPositions.$inferSelect;
export type InsertHrPosition = typeof hrPositions.$inferInsert;
export const insertHrPositionSchema = createInsertSchema(hrPositions).omit({ id: true, createdAt: true });

export type HrEmployeeProfile = typeof hrEmployeeProfiles.$inferSelect;
export type InsertHrEmployeeProfile = typeof hrEmployeeProfiles.$inferInsert;
export const insertHrEmployeeProfileSchema = createInsertSchema(hrEmployeeProfiles).omit({ id: true, createdAt: true, updatedAt: true });

export type HrContract = typeof hrContracts.$inferSelect;
export type InsertHrContract = typeof hrContracts.$inferInsert;
export const insertHrContractSchema = createInsertSchema(hrContracts).omit({ id: true, createdAt: true });

export type HrDocument = typeof hrDocuments.$inferSelect;
export type InsertHrDocument = typeof hrDocuments.$inferInsert;
export const insertHrDocumentSchema = createInsertSchema(hrDocuments).omit({ id: true, createdAt: true });

export type HrLeaveType = typeof hrLeaveTypes.$inferSelect;
export type InsertHrLeaveType = typeof hrLeaveTypes.$inferInsert;
export const insertHrLeaveTypeSchema = createInsertSchema(hrLeaveTypes).omit({ id: true, createdAt: true });

export type HrLeaveBalance = typeof hrLeaveBalances.$inferSelect;
export type InsertHrLeaveBalance = typeof hrLeaveBalances.$inferInsert;
export const insertHrLeaveBalanceSchema = createInsertSchema(hrLeaveBalances).omit({ id: true, createdAt: true, updatedAt: true });

export type HrLeaveRequest = typeof hrLeaveRequests.$inferSelect;
export type InsertHrLeaveRequest = typeof hrLeaveRequests.$inferInsert;
export const insertHrLeaveRequestSchema = createInsertSchema(hrLeaveRequests).omit({ id: true, createdAt: true, updatedAt: true });

export type HrJobPosting = typeof hrJobPostings.$inferSelect;
export type InsertHrJobPosting = typeof hrJobPostings.$inferInsert;
export const insertHrJobPostingSchema = createInsertSchema(hrJobPostings).omit({ id: true, createdAt: true, updatedAt: true });

export type HrCandidate = typeof hrCandidates.$inferSelect;
export type InsertHrCandidate = typeof hrCandidates.$inferInsert;
export const insertHrCandidateSchema = createInsertSchema(hrCandidates).omit({ id: true, createdAt: true, updatedAt: true });

export type HrInterview = typeof hrInterviews.$inferSelect;
export type InsertHrInterview = typeof hrInterviews.$inferInsert;
export const insertHrInterviewSchema = createInsertSchema(hrInterviews).omit({ id: true, createdAt: true });

export type HrBenefitPlan = typeof hrBenefitPlans.$inferSelect;
export type InsertHrBenefitPlan = typeof hrBenefitPlans.$inferInsert;
export const insertHrBenefitPlanSchema = createInsertSchema(hrBenefitPlans).omit({ id: true, createdAt: true });

export type HrBenefitEnrollment = typeof hrBenefitEnrollments.$inferSelect;
export type InsertHrBenefitEnrollment = typeof hrBenefitEnrollments.$inferInsert;
export const insertHrBenefitEnrollmentSchema = createInsertSchema(hrBenefitEnrollments).omit({ id: true, createdAt: true });

export type HrPerformanceReview = typeof hrPerformanceReviews.$inferSelect;
export type InsertHrPerformanceReview = typeof hrPerformanceReviews.$inferInsert;
export const insertHrPerformanceReviewSchema = createInsertSchema(hrPerformanceReviews).omit({ id: true, createdAt: true, updatedAt: true });

export type HrPerformanceGoal = typeof hrPerformanceGoals.$inferSelect;
export type InsertHrPerformanceGoal = typeof hrPerformanceGoals.$inferInsert;
export const insertHrPerformanceGoalSchema = createInsertSchema(hrPerformanceGoals).omit({ id: true, createdAt: true, updatedAt: true });

export type HrAnnouncement = typeof hrAnnouncements.$inferSelect;
export type InsertHrAnnouncement = typeof hrAnnouncements.$inferInsert;
export const insertHrAnnouncementSchema = createInsertSchema(hrAnnouncements).omit({ id: true, createdAt: true });

export type HrSelfServiceRequest = typeof hrSelfServiceRequests.$inferSelect;
export type InsertHrSelfServiceRequest = typeof hrSelfServiceRequests.$inferInsert;
export const insertHrSelfServiceRequestSchema = createInsertSchema(hrSelfServiceRequests).omit({ id: true, createdAt: true, updatedAt: true });

// ==========================================
// MODULE: Real-Time Service Bay Dashboard
// ==========================================

export const serviceBays = pgTable("service_bays", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  bayNumber: varchar("bay_number", { length: 50 }).notNull(),
  bayName: varchar("bay_name", { length: 255 }),
  bayType: varchar("bay_type", { length: 100 }).default("general"), // "general", "alignment", "paint", "body", "quick_service", "heavy_duty"
  capacity: integer("capacity").default(1), // Number of vehicles
  equipment: jsonb("equipment").default([]), // List of equipment in bay
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("available"), // "available", "occupied", "maintenance", "reserved", "offline"
  currentVehicleId: uuid("current_vehicle_id").references(() => vehicles.id),
  currentJobCardId: uuid("current_job_card_id").references(() => jobCards.id),
  currentTechnicianId: varchar("current_technician_id").references(() => users.id),
  occupiedSince: timestamp("occupied_since"),
  estimatedCompletionTime: timestamp("estimated_completion_time"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bayOccupancySessions = pgTable("bay_occupancy_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bayId: uuid("bay_id").references(() => serviceBays.id).notNull(),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  technicianId: varchar("technician_id").references(() => users.id),
  serviceType: varchar("service_type", { length: 255 }),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  estimatedDuration: integer("estimated_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  status: varchar("status", { length: 50 }).default("in_progress"), // "in_progress", "completed", "paused", "cancelled"
  pauseReason: text("pause_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bayTelemetryEvents = pgTable("bay_telemetry_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bayId: uuid("bay_id").references(() => serviceBays.id).notNull(),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // "vehicle_entered", "vehicle_exited", "tool_activated", "lift_raised", "status_change"
  eventData: jsonb("event_data").default({}),
  sensorId: varchar("sensor_id", { length: 100 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// ==========================================
// MODULE: Automated Inventory Reordering with Predictive Demand
// ==========================================

export const inventoryForecasts = pgTable("inventory_forecasts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  partId: uuid("part_id").references(() => spareParts.id).notNull(),
  forecastDate: date("forecast_date").notNull(),
  predictedDemand: integer("predicted_demand").notNull(),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }), // 0-100%
  forecastMethod: varchar("forecast_method", { length: 100 }), // "moving_average", "exponential_smoothing", "ai_model", "seasonal"
  historicalDataPoints: integer("historical_data_points"),
  seasonalFactor: decimal("seasonal_factor", { precision: 5, scale: 3 }),
  trendFactor: decimal("trend_factor", { precision: 5, scale: 3 }),
  actualDemand: integer("actual_demand"), // Filled in after the fact
  variancePercentage: decimal("variance_percentage", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const replenishmentOrders = pgTable("replenishment_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  orderNumber: varchar("order_number", { length: 100 }).unique().notNull(),
  ruleId: uuid("rule_id").references(() => autoReorderRules.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  triggerType: varchar("trigger_type", { length: 100 }), // "auto", "manual", "forecast", "emergency"
  status: varchar("status", { length: 50 }).default("pending_approval"), // "pending_approval", "approved", "ordered", "shipped", "received", "cancelled"
  totalItems: integer("total_items").default(0),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0"),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  orderedAt: timestamp("ordered_at"),
  receivedAt: timestamp("received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const replenishmentOrderItems = pgTable("replenishment_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => replenishmentOrders.id).notNull(),
  partId: uuid("part_id").references(() => spareParts.id).notNull(),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  currentStock: integer("current_stock"), // Stock level at time of order
  reorderPoint: integer("reorder_point"), // Rule setting at time of order
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// MODULE: Customer Loyalty Program
// ==========================================

export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  tierName: varchar("tier_name", { length: 100 }).notNull(), // "Bronze", "Silver", "Gold", "Platinum"
  tierNameAr: varchar("tier_name_ar", { length: 100 }),
  minPoints: integer("min_points").notNull().default(0),
  maxPoints: integer("max_points"),
  pointsMultiplier: decimal("points_multiplier", { precision: 3, scale: 2 }).default("1.00"), // 1.0x, 1.5x, 2.0x
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
  freeServices: jsonb("free_services").default([]), // List of free service IDs
  priorityBooking: boolean("priority_booking").default(false),
  exclusiveOffers: boolean("exclusive_offers").default(false),
  freeInspection: boolean("free_inspection").default(false),
  dedicatedAdvisor: boolean("dedicated_advisor").default(false),
  color: varchar("color", { length: 50 }), // Tier badge color
  icon: varchar("icon", { length: 100 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyAccounts = pgTable("loyalty_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  tierId: uuid("tier_id").references(() => loyaltyTiers.id),
  membershipNumber: varchar("membership_number", { length: 50 }).unique(),
  totalPointsEarned: integer("total_points_earned").default(0),
  totalPointsRedeemed: integer("total_points_redeemed").default(0),
  currentPoints: integer("current_points").default(0),
  lifetimeSpend: decimal("lifetime_spend", { precision: 12, scale: 2 }).default("0"),
  totalVisits: integer("total_visits").default(0),
  lastVisitDate: timestamp("last_visit_date"),
  referralCode: varchar("referral_code", { length: 50 }).unique(),
  referredBy: uuid("referred_by").references((): any => loyaltyAccounts.id),
  referralCount: integer("referral_count").default(0),
  birthdayMonth: integer("birthday_month"),
  preferredContactMethod: varchar("preferred_contact_method", { length: 50 }), // "email", "sms", "whatsapp"
  optInMarketing: boolean("opt_in_marketing").default(true),
  status: varchar("status", { length: 50 }).default("active"), // "active", "suspended", "expired"
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  tierUpgradeDate: timestamp("tier_upgrade_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loyaltyOffers = pgTable("loyalty_offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  offerName: varchar("offer_name", { length: 255 }).notNull(),
  offerNameAr: varchar("offer_name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  offerType: varchar("offer_type", { length: 100 }).notNull(), // "points_discount", "percentage_off", "free_service", "bonus_points", "bundle"
  pointsCost: integer("points_cost"), // Points required to redeem
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  minimumSpend: decimal("minimum_spend", { precision: 10, scale: 2 }),
  applicableServices: jsonb("applicable_services").default([]),
  tierRestriction: uuid("tier_restriction").references(() => loyaltyTiers.id), // Minimum tier required
  usageLimit: integer("usage_limit"), // Max total uses
  usagePerCustomer: integer("usage_per_customer").default(1),
  currentUsageCount: integer("current_usage_count").default(0),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  imageUrl: varchar("image_url", { length: 500 }),
  termsAndConditions: text("terms_and_conditions"),
  isPersonalized: boolean("is_personalized").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// MODULE: Interactive Workshop Calendar
// ==========================================

export const workshopResources = pgTable("workshop_resources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(), // "technician", "bay", "equipment", "lift"
  resourceId: varchar("resource_id").notNull(), // Reference to user, bay, or equipment ID
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }), // Calendar display color
  capacity: integer("capacity").default(1), // Concurrent appointments
  skills: jsonb("skills").default([]), // For technicians: list of skill IDs
  availability: jsonb("availability").default({}), // Weekly availability schedule
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calendarAppointments = pgTable("calendar_appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  customerId: varchar("customer_id").references(() => users.id),
  customerName: varchar("customer_name", { length: 255 }),
  vehicleInfo: jsonb("vehicle_info"),
  serviceType: varchar("service_type", { length: 255 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  allDay: boolean("all_day").default(false),
  resourceId: uuid("resource_id").references(() => workshopResources.id),
  bayId: uuid("bay_id").references(() => serviceBays.id),
  technicianId: varchar("technician_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("scheduled"), // "scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"
  priority: varchar("priority", { length: 20 }).default("normal"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"), // {frequency, interval, endDate, daysOfWeek}
  parentAppointmentId: uuid("parent_appointment_id"),
  conflictResolved: boolean("conflict_resolved").default(false),
  lockedBy: varchar("locked_by").references(() => users.id),
  lockedAt: timestamp("locked_at"),
  lockExpiresAt: timestamp("lock_expires_at"),
  googleCalendarEventId: varchar("google_calendar_event_id", { length: 255 }),
  syncedWithGoogle: boolean("synced_with_google").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calendarActivityLog = pgTable("calendar_activity_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id").references(() => calendarAppointments.id).notNull(),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // "created", "updated", "moved", "resized", "cancelled", "rescheduled"
  previousData: jsonb("previous_data"),
  newData: jsonb("new_data"),
  changeReason: text("change_reason"),
  performedBy: varchar("performed_by").references(() => users.id),
  performedAt: timestamp("performed_at").defaultNow(),
});

export const calendarConflicts = pgTable("calendar_conflicts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  appointment1Id: uuid("appointment_1_id").references(() => calendarAppointments.id).notNull(),
  appointment2Id: uuid("appointment_2_id").references(() => calendarAppointments.id).notNull(),
  conflictType: varchar("conflict_type", { length: 100 }), // "time_overlap", "resource_double_booked", "capacity_exceeded"
  resourceId: uuid("resource_id").references(() => workshopResources.id),
  severity: varchar("severity", { length: 20 }).default("warning"), // "warning", "error"
  resolved: boolean("resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNote: text("resolution_note"),
  detectedAt: timestamp("detected_at").defaultNow(),
});

// ==========================================
// MODULE: Augmented Reality for Mechanics
// ==========================================

export const arAssets = pgTable("ar_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  assetType: varchar("asset_type", { length: 100 }).notNull(), // "3d_model", "overlay", "annotation", "video", "animation"
  fileUrl: varchar("file_url", { length: 1000 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 1000 }),
  fileFormat: varchar("file_format", { length: 50 }), // "glb", "gltf", "fbx", "obj", "mp4"
  fileSize: integer("file_size"), // bytes
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleYearStart: integer("vehicle_year_start"),
  vehicleYearEnd: integer("vehicle_year_end"),
  componentCategory: varchar("component_category", { length: 100 }), // "engine", "transmission", "brakes", "suspension", "electrical"
  componentName: varchar("component_name", { length: 255 }),
  partNumber: varchar("part_number", { length: 100 }),
  metadata: jsonb("metadata").default({}),
  isGlobal: boolean("is_global").default(false), // Available to all garages
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const arWorkInstructions = pgTable("ar_work_instructions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  instructionName: varchar("instruction_name", { length: 255 }).notNull(),
  instructionNameAr: varchar("instruction_name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  serviceType: varchar("service_type", { length: 255 }),
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleYearStart: integer("vehicle_year_start"),
  vehicleYearEnd: integer("vehicle_year_end"),
  difficultyLevel: varchar("difficulty_level", { length: 50 }), // "beginner", "intermediate", "advanced", "expert"
  estimatedDuration: integer("estimated_duration"), // minutes
  requiredTools: jsonb("required_tools").default([]),
  requiredParts: jsonb("required_parts").default([]),
  safetyWarnings: jsonb("safety_warnings").default([]),
  steps: jsonb("steps").default([]), // [{stepNumber, title, description, assetId, duration, hints}]
  totalSteps: integer("total_steps").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // Average completion rate
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  usageCount: integer("usage_count").default(0),
  isGlobal: boolean("is_global").default(false),
  isActive: boolean("is_active").default(true),
  version: integer("version").default(1),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const arSessionLogs = pgTable("ar_session_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  instructionId: uuid("instruction_id").references(() => arWorkInstructions.id),
  deviceType: varchar("device_type", { length: 100 }), // "headset", "tablet", "phone", "smart_glasses"
  deviceModel: varchar("device_model", { length: 255 }),
  sessionStartTime: timestamp("session_start_time").notNull().defaultNow(),
  sessionEndTime: timestamp("session_end_time"),
  totalDuration: integer("total_duration"), // seconds
  stepsCompleted: integer("steps_completed").default(0),
  totalSteps: integer("total_steps"),
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }),
  pauseCount: integer("pause_count").default(0),
  helpRequestCount: integer("help_request_count").default(0),
  errorCount: integer("error_count").default(0),
  stepTimings: jsonb("step_timings").default([]), // [{stepNumber, startTime, endTime, duration}]
  feedbackRating: integer("feedback_rating"), // 1-5
  feedbackComment: text("feedback_comment"),
  status: varchar("status", { length: 50 }).default("in_progress"), // "in_progress", "completed", "paused", "abandoned"
  createdAt: timestamp("created_at").defaultNow(),
});

export const arDevicePairings = pgTable("ar_device_pairings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  deviceId: varchar("device_id", { length: 255 }).notNull().unique(),
  deviceType: varchar("device_type", { length: 100 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  deviceModel: varchar("device_model", { length: 255 }),
  osVersion: varchar("os_version", { length: 100 }),
  appVersion: varchar("app_version", { length: 50 }),
  pushToken: varchar("push_token", { length: 500 }),
  isActive: boolean("is_active").default(true),
  lastConnectedAt: timestamp("last_connected_at"),
  pairedAt: timestamp("paired_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for new modules
export type ServiceBay = typeof serviceBays.$inferSelect;
export type InsertServiceBay = typeof serviceBays.$inferInsert;
export const insertServiceBaySchema = createInsertSchema(serviceBays).omit({ id: true, createdAt: true, updatedAt: true });

export type BayOccupancySession = typeof bayOccupancySessions.$inferSelect;
export type InsertBayOccupancySession = typeof bayOccupancySessions.$inferInsert;
export const insertBayOccupancySessionSchema = createInsertSchema(bayOccupancySessions).omit({ id: true, createdAt: true });

export type BayTelemetryEvent = typeof bayTelemetryEvents.$inferSelect;
export type InsertBayTelemetryEvent = typeof bayTelemetryEvents.$inferInsert;
export const insertBayTelemetryEventSchema = createInsertSchema(bayTelemetryEvents).omit({ id: true });

export type InventoryForecast = typeof inventoryForecasts.$inferSelect;
export type InsertInventoryForecast = typeof inventoryForecasts.$inferInsert;
export const insertInventoryForecastSchema = createInsertSchema(inventoryForecasts).omit({ id: true, createdAt: true });

export type ReplenishmentOrder = typeof replenishmentOrders.$inferSelect;
export type InsertReplenishmentOrder = typeof replenishmentOrders.$inferInsert;
export const insertReplenishmentOrderSchema = createInsertSchema(replenishmentOrders).omit({ id: true, createdAt: true, updatedAt: true });

export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type InsertLoyaltyTier = typeof loyaltyTiers.$inferInsert;
export const insertLoyaltyTierSchema = createInsertSchema(loyaltyTiers).omit({ id: true, createdAt: true });

export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;
export type InsertLoyaltyAccount = typeof loyaltyAccounts.$inferInsert;
export const insertLoyaltyAccountSchema = createInsertSchema(loyaltyAccounts).omit({ id: true, createdAt: true, updatedAt: true });

export type LoyaltyOffer = typeof loyaltyOffers.$inferSelect;
export type InsertLoyaltyOffer = typeof loyaltyOffers.$inferInsert;
export const insertLoyaltyOfferSchema = createInsertSchema(loyaltyOffers).omit({ id: true, createdAt: true, updatedAt: true });

export type WorkshopResource = typeof workshopResources.$inferSelect;
export type InsertWorkshopResource = typeof workshopResources.$inferInsert;
export const insertWorkshopResourceSchema = createInsertSchema(workshopResources).omit({ id: true, createdAt: true });

export type CalendarAppointment = typeof calendarAppointments.$inferSelect;
export type InsertCalendarAppointment = typeof calendarAppointments.$inferInsert;
export const insertCalendarAppointmentSchema = createInsertSchema(calendarAppointments).omit({ id: true, createdAt: true, updatedAt: true });

export type ArAsset = typeof arAssets.$inferSelect;
export type InsertArAsset = typeof arAssets.$inferInsert;
export const insertArAssetSchema = createInsertSchema(arAssets).omit({ id: true, createdAt: true, updatedAt: true });

export type ArWorkInstruction = typeof arWorkInstructions.$inferSelect;
export type InsertArWorkInstruction = typeof arWorkInstructions.$inferInsert;
export const insertArWorkInstructionSchema = createInsertSchema(arWorkInstructions).omit({ id: true, createdAt: true, updatedAt: true });

export type ArSessionLog = typeof arSessionLogs.$inferSelect;
export type InsertArSessionLog = typeof arSessionLogs.$inferInsert;
export const insertArSessionLogSchema = createInsertSchema(arSessionLogs).omit({ id: true, createdAt: true });

export type ArDevicePairing = typeof arDevicePairings.$inferSelect;
export type InsertArDevicePairing = typeof arDevicePairings.$inferInsert;
export const insertArDevicePairingSchema = createInsertSchema(arDevicePairings).omit({ id: true, createdAt: true });

// ==========================================
// MODULE: Dynamic Pricing Suggestions
// ==========================================

// Market pricing data for services by region/vehicle type
export const marketPricingData = pgTable("market_pricing_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  region: varchar("region", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  serviceCategory: varchar("service_category", { length: 100 }).notNull(),
  serviceType: varchar("service_type", { length: 255 }).notNull(),
  vehicleClass: varchar("vehicle_class", { length: 50 }),
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  minPrice: decimal("min_price", { precision: 12, scale: 2 }).notNull(),
  maxPrice: decimal("max_price", { precision: 12, scale: 2 }).notNull(),
  avgPrice: decimal("avg_price", { precision: 12, scale: 2 }).notNull(),
  medianPrice: decimal("median_price", { precision: 12, scale: 2 }),
  sampleSize: integer("sample_size").default(0),
  dataSource: varchar("data_source", { length: 100 }),
  effectiveDate: date("effective_date").notNull(),
  expiryDate: date("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicle-specific pricing factors
export const vehiclePricingFactors = pgTable("vehicle_pricing_factors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id),
  vehicleMake: varchar("vehicle_make", { length: 100 }).notNull(),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  yearStart: integer("year_start"),
  yearEnd: integer("year_end"),
  complexityFactor: decimal("complexity_factor", { precision: 5, scale: 2 }).default("1.00"),
  partsAvailabilityFactor: decimal("parts_availability_factor", { precision: 5, scale: 2 }).default("1.00"),
  laborIntensityFactor: decimal("labor_intensity_factor", { precision: 5, scale: 2 }).default("1.00"),
  luxuryPremiumFactor: decimal("luxury_premium_factor", { precision: 5, scale: 2 }).default("1.00"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing suggestions generated for job cards
export const dynamicPricingSuggestions = pgTable("dynamic_pricing_suggestions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").references(() => garages.id).notNull(),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  serviceType: varchar("service_type", { length: 255 }).notNull(),
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
  suggestedPrice: decimal("suggested_price", { precision: 12, scale: 2 }).notNull(),
  minRecommendedPrice: decimal("min_recommended_price", { precision: 12, scale: 2 }),
  maxRecommendedPrice: decimal("max_recommended_price", { precision: 12, scale: 2 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  appliedRules: jsonb("applied_rules").default([]),
  vehicleFactors: jsonb("vehicle_factors").default({}),
  marketDataUsed: jsonb("market_data_used").default({}),
  competitorPrices: jsonb("competitor_prices").default([]),
  profitMarginEstimate: decimal("profit_margin_estimate", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  acceptedPrice: decimal("accepted_price", { precision: 12, scale: 2 }),
  acceptedBy: varchar("accepted_by").references(() => users.id),
  acceptedAt: timestamp("accepted_at"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Dynamic Pricing module
export type MarketPricingData = typeof marketPricingData.$inferSelect;
export type InsertMarketPricingData = typeof marketPricingData.$inferInsert;
export const insertMarketPricingDataSchema = createInsertSchema(marketPricingData).omit({ id: true, createdAt: true, updatedAt: true });

export type VehiclePricingFactor = typeof vehiclePricingFactors.$inferSelect;
export type InsertVehiclePricingFactor = typeof vehiclePricingFactors.$inferInsert;
export const insertVehiclePricingFactorSchema = createInsertSchema(vehiclePricingFactors).omit({ id: true, createdAt: true, updatedAt: true });

export type DynamicPricingSuggestion = typeof dynamicPricingSuggestions.$inferSelect;
export type InsertDynamicPricingSuggestion = typeof dynamicPricingSuggestions.$inferInsert;
export const insertDynamicPricingSuggestionSchema = createInsertSchema(dynamicPricingSuggestions).omit({ id: true, createdAt: true });

// ==================== Real-Time Vehicle Tracking ====================

export const vehicleTracking = pgTable("vehicle_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  garageId: uuid("garage_id"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }),
  engineStatus: varchar("engine_status", { length: 50 }).default("off"),
  fuelLevel: decimal("fuel_level", { precision: 5, scale: 2 }),
  batteryVoltage: decimal("battery_voltage", { precision: 5, scale: 2 }),
  odometer: decimal("odometer", { precision: 12, scale: 2 }),
  diagnosticCodes: jsonb("diagnostic_codes").default([]),
  isMoving: boolean("is_moving").default(false),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  deviceId: varchar("device_id", { length: 100 }),
  deviceType: varchar("device_type", { length: 50 }),
  signalStrength: integer("signal_strength"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicleTrackingHistory = pgTable("vehicle_tracking_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  engineStatus: varchar("engine_status", { length: 50 }),
  odometer: decimal("odometer", { precision: 12, scale: 2 }),
  eventType: varchar("event_type", { length: 50 }),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// ==================== Service Reminder Templates ====================

export const serviceReminderTemplates = pgTable("service_reminder_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  garageId: uuid("garage_id"),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: varchar("service_type", { length: 255 }).notNull(),
  description: text("description"),
  intervalDays: integer("interval_days"),
  intervalMileage: integer("interval_mileage"),
  advanceNoticeDays: integer("advance_notice_days").default(7),
  advanceNoticeMileage: integer("advance_notice_mileage"),
  isActive: boolean("is_active").default(true),
  vehicleMakes: text("vehicle_makes").array(),
  vehicleModels: text("vehicle_models").array(),
  notificationChannels: text("notification_channels").array().default(["push", "email", "sms"]),
  messageTemplate: text("message_template"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== Push Notifications ====================

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh"),
  auth: text("auth"),
  deviceType: varchar("device_type", { length: 50 }),
  deviceName: varchar("device_name", { length: 255 }),
  browserInfo: jsonb("browser_info").default({}),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushNotifications = pgTable("push_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  garageId: uuid("garage_id"),
  userId: varchar("user_id").references(() => users.id),
  customerId: varchar("customer_id").references(() => customerProfiles.userId),
  subscriptionId: uuid("subscription_id").references(() => pushSubscriptions.id),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  icon: varchar("icon", { length: 500 }),
  image: varchar("image", { length: 500 }),
  badge: varchar("badge", { length: 500 }),
  tag: varchar("tag", { length: 100 }),
  data: jsonb("data").default({}),
  actions: jsonb("actions").default([]),
  notificationType: varchar("notification_type", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).default("normal"),
  relatedEntityType: varchar("related_entity_type", { length: 100 }),
  relatedEntityId: uuid("related_entity_id"),
  status: varchar("status", { length: 50 }).default("pending"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  clickedAt: timestamp("clicked_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  scheduledFor: timestamp("scheduled_for"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Vehicle Tracking module
export type VehicleTracking = typeof vehicleTracking.$inferSelect;
export type InsertVehicleTracking = typeof vehicleTracking.$inferInsert;
export const insertVehicleTrackingSchema = createInsertSchema(vehicleTracking).omit({ id: true, createdAt: true });

export type VehicleTrackingHistory = typeof vehicleTrackingHistory.$inferSelect;
export type InsertVehicleTrackingHistory = typeof vehicleTrackingHistory.$inferInsert;
export const insertVehicleTrackingHistorySchema = createInsertSchema(vehicleTrackingHistory).omit({ id: true, recordedAt: true });

// Type exports for Service Reminder Templates module
export type ServiceReminderTemplate = typeof serviceReminderTemplates.$inferSelect;
export type InsertServiceReminderTemplate = typeof serviceReminderTemplates.$inferInsert;
export const insertServiceReminderTemplateSchema = createInsertSchema(serviceReminderTemplates).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports for Push Notifications module
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true });

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;
export const insertPushNotificationSchema = createInsertSchema(pushNotifications).omit({ id: true, createdAt: true });

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;
export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences);

// ----- In-memory → DB migration: flat tables matching route surfaces -----

// HR leave request entries — flat replacement for the demo in-memory store in
// server/routes/hr-payroll.ts. Distinct from hr_leave_requests, which is the
// FK-strict canonical leave-tracking table referenced by the legacy router.
export const hrLeaveRequestEntries = pgTable("hr_leave_request_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id", { length: 100 }).notNull(),
  employeeName: varchar("employee_name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  approvedBy: varchar("approved_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type HrLeaveRequestEntry = typeof hrLeaveRequestEntries.$inferSelect;
export type InsertHrLeaveRequestEntry = typeof hrLeaveRequestEntries.$inferInsert;
export const insertHrLeaveRequestEntrySchema = createInsertSchema(hrLeaveRequestEntries).omit({ id: true, createdAt: true, updatedAt: true });

// Quality Control — flat tables matching the QC route surface.
export const qcInspections = pgTable("qc_inspections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardRef: varchar("job_card_ref", { length: 100 }).notNull(),
  vehicleInfo: varchar("vehicle_info", { length: 500 }).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  inspector: varchar("inspector", { length: 255 }),
  inspectorId: varchar("inspector_id", { length: 100 }),
  result: varchar("result", { length: 20 }).default("pending").notNull(),
  notes: text("notes"),
  checklistId: varchar("checklist_id", { length: 50 }),
  completedItems: integer("completed_items").default(0).notNull(),
  totalItems: integer("total_items").default(0).notNull(),
  inspectionTimeMinutes: integer("inspection_time_minutes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type QcInspection = typeof qcInspections.$inferSelect;
export type InsertQcInspection = typeof qcInspections.$inferInsert;
export const insertQcInspectionSchema = createInsertSchema(qcInspections).omit({ id: true, createdAt: true, updatedAt: true });

export const qcDefects = pgTable("qc_defects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: uuid("inspection_id").references(() => qcInspections.id),
  jobCardRef: varchar("job_card_ref", { length: 100 }),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 30 }).default("open").notNull(),
  resolutionNotes: text("resolution_notes"),
  reportedBy: varchar("reported_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});
export type QcDefect = typeof qcDefects.$inferSelect;
export type InsertQcDefect = typeof qcDefects.$inferInsert;
export const insertQcDefectSchema = createInsertSchema(qcDefects).omit({ id: true, createdAt: true });

// Backup history — flat record of completed backup snapshots taken via
// /api/backup/create. Distinct from backup_jobs (a more complex job-queue
// record used elsewhere); this table replaces the in-memory backupStore[].
export const backupHistory = pgTable("backup_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  backupRef: varchar("backup_ref", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  size: integer("size").notNull(),
  totalRecords: integer("total_records").default(0).notNull(),
  tableCounts: jsonb("table_counts").default({}).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type BackupHistory = typeof backupHistory.$inferSelect;
export type InsertBackupHistory = typeof backupHistory.$inferInsert;
export const insertBackupHistorySchema = createInsertSchema(backupHistory).omit({ id: true, createdAt: true });

// Document library items — flat, demo-friendly counterpart to the
// FK-heavy `documents` table. Backs /api/documents (server/routes/documents.ts).
export const documentLibraryItems = pgTable("document_library_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 500 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  size: integer("size").default(0).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  tags: jsonb("tags").default([]).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type DocumentLibraryItem = typeof documentLibraryItems.$inferSelect;
export type InsertDocumentLibraryItem = typeof documentLibraryItems.$inferInsert;
export const insertDocumentLibraryItemSchema = createInsertSchema(documentLibraryItems).omit({ id: true, createdAt: true });

// Kiosk tickets — the self-service queue. Separate from kiosk_sessions /
// kiosk_check_ins (which model the multi-step kiosk session); this table
// is the simple FIFO queue exposed by server/routes/kiosk.ts.
export const kioskTickets = pgTable("kiosk_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number", { length: 20 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 50 }).notNull(),
  vehicleInfo: varchar("vehicle_info", { length: 255 }),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("waiting").notNull(),
  type: varchar("type", { length: 20 }).default("walk-in").notNull(),
  appointmentId: varchar("appointment_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type KioskTicket = typeof kioskTickets.$inferSelect;
export type InsertKioskTicket = typeof kioskTickets.$inferInsert;
export const insertKioskTicketSchema = createInsertSchema(kioskTickets).omit({ id: true, createdAt: true, updatedAt: true });

// Currency transactions — FX-converted invoice/payment/refund/expense
// records. Distinct from currency_rates (the rate table itself).
export const currencyTransactions = pgTable("currency_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  txDate: timestamp("tx_date").defaultNow().notNull(),
  description: text("description").notNull(),
  originalAmount: decimal("original_amount", { precision: 18, scale: 4 }).notNull(),
  originalCurrency: varchar("original_currency", { length: 10 }).notNull(),
  rateUsed: decimal("rate_used", { precision: 18, scale: 6 }).notNull(),
  sarEquivalent: decimal("sar_equivalent", { precision: 18, scale: 4 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  reference: varchar("reference", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type CurrencyTransaction = typeof currencyTransactions.$inferSelect;
export type InsertCurrencyTransaction = typeof currencyTransactions.$inferInsert;
export const insertCurrencyTransactionSchema = createInsertSchema(currencyTransactions).omit({ id: true, createdAt: true });

// Fleet accounts / vehicles / maintenance — flat tables matching the
// fleet route surface. Distinct from fleet_groups/fleet_vehicles/fleet_
// maintenance_schedules (FK-strict canonical fleet schema).
export const fleetAccounts = pgTable("fleet_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  externalRef: varchar("external_ref", { length: 50 }).unique(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contractStatus: varchar("contract_status", { length: 30 }).default("pending").notNull(),
  contractStart: date("contract_start"),
  contractEnd: date("contract_end"),
  monthlySpend: decimal("monthly_spend", { precision: 14, scale: 2 }).default("0").notNull(),
  totalSpend: decimal("total_spend", { precision: 14, scale: 2 }).default("0").notNull(),
  discountPercentage: integer("discount_percentage").default(0).notNull(),
  paymentTerms: varchar("payment_terms", { length: 50 }).default("Net 30"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type FleetAccount = typeof fleetAccounts.$inferSelect;
export type InsertFleetAccount = typeof fleetAccounts.$inferInsert;
export const insertFleetAccountSchema = createInsertSchema(fleetAccounts).omit({ id: true, createdAt: true });

export const fleetAccountVehicles = pgTable("fleet_account_vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  externalRef: varchar("external_ref", { length: 50 }).unique(),
  fleetAccountId: uuid("fleet_account_id").references(() => fleetAccounts.id).notNull(),
  plateNumber: varchar("plate_number", { length: 50 }).notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  vin: varchar("vin", { length: 50 }),
  status: varchar("status", { length: 30 }).default("active").notNull(),
  mileage: integer("mileage").default(0).notNull(),
  lastServiceDate: date("last_service_date"),
  lastServiceType: varchar("last_service_type", { length: 100 }),
  nextServiceDue: date("next_service_due"),
  nextServiceType: varchar("next_service_type", { length: 100 }),
  avgMonthlyCost: decimal("avg_monthly_cost", { precision: 12, scale: 2 }).default("0"),
  totalSpend: decimal("total_spend", { precision: 14, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type FleetAccountVehicle = typeof fleetAccountVehicles.$inferSelect;
export type InsertFleetAccountVehicle = typeof fleetAccountVehicles.$inferInsert;
export const insertFleetAccountVehicleSchema = createInsertSchema(fleetAccountVehicles).omit({ id: true, createdAt: true });

export const fleetMaintenanceEntries = pgTable("fleet_maintenance_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  externalRef: varchar("external_ref", { length: 50 }).unique(),
  vehicleId: uuid("vehicle_id").references(() => fleetAccountVehicles.id).notNull(),
  fleetAccountId: uuid("fleet_account_id").references(() => fleetAccounts.id).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  status: varchar("status", { length: 30 }).default("scheduled").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type FleetMaintenanceEntry = typeof fleetMaintenanceEntries.$inferSelect;
export type InsertFleetMaintenanceEntry = typeof fleetMaintenanceEntries.$inferInsert;
export const insertFleetMaintenanceEntrySchema = createInsertSchema(fleetMaintenanceEntries).omit({ id: true, createdAt: true });

// Scheduling optimization runs — replaces the in-memory optimizationHistory[]
// in scheduling.routes.ts so AI optimization output persists across restarts.
export const schedulingOptimizationRuns = pgTable("scheduling_optimization_runs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  runAt: timestamp("run_at").defaultNow().notNull(),
  appointmentsOptimized: integer("appointments_optimized").default(0).notNull(),
  efficiencyGain: varchar("efficiency_gain", { length: 20 }),
  technicianUtilization: jsonb("technician_utilization").default({}).notNull(),
  suggestions: jsonb("suggestions").default([]).notNull(),
  assignments: jsonb("assignments").default([]).notNull(),
  report: jsonb("report").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type SchedulingOptimizationRun = typeof schedulingOptimizationRuns.$inferSelect;
export type InsertSchedulingOptimizationRun = typeof schedulingOptimizationRuns.$inferInsert;
export const insertSchedulingOptimizationRunSchema = createInsertSchema(schedulingOptimizationRuns).omit({ id: true, createdAt: true });
