import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
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
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export type JobCard = typeof jobCards.$inferSelect;
export type InsertJobCard = typeof jobCards.$inferInsert;
export const insertJobCardSchema = createInsertSchema(jobCards);
export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;
export type TaskProgressLog = typeof taskProgressLogs.$inferSelect;
export type InsertTaskProgressLog = typeof taskProgressLogs.$inferInsert;
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
