import { sql } from 'drizzle-orm';
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

// Job Cards Schema - Module 8: Job Cards & Task Assignment
export const jobCards = pgTable("job_cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobNumber: varchar("job_number").notNull().unique(),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
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
  createdBy: varchar("created_by").notNull().references(() => users.id),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCardId: uuid("job_card_id").notNull().references(() => jobCards.id),
  taskName: varchar("task_name").notNull(),
  taskType: varchar("task_type").notNull(), // "diagnostic", "repair", "assembly", "disassembly", "cleaning", "inspection"
  description: text("description").notNull(),
  assignedTo: varchar("assigned_to").notNull().references(() => users.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").notNull().references(() => taskAssignments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  progressPercentage: integer("progress_percentage").notNull(),
  stepDescription: text("step_description"),
  timeSpent: integer("time_spent"), // minutes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Templates - for common service types
export const serviceTemplates = pgTable("service_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tool Availability - tracks tool inventory per garage/branch
export const toolAvailability = pgTable("tool_availability", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: uuid("tool_id").notNull().references(() => tools.id),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: uuid("tool_id").notNull().references(() => tools.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  taskId: uuid("task_id").references(() => taskAssignments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 12: Spare Parts & Inventory Management
export const spareParts = pgTable("spare_parts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spare Part Inventory - tracks inventory per garage
export const sparePartInventories = pgTable("spare_part_inventories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sparePartId: uuid("spare_part_id").notNull().references(() => spareParts.id),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  branchId: uuid("branch_id").references(() => branches.id),
  stockQuantity: integer("stock_quantity").default(0),
  minThreshold: integer("min_threshold").default(5),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  purchaseTaxRate: decimal("purchase_tax_rate", { precision: 5, scale: 2 }).default("0"),
  saleTaxRate: decimal("sale_tax_rate", { precision: 5, scale: 2 }).default("0"),
  location: varchar("location"), // Storage location (shelf, bin, etc.)
  lastRestockedAt: timestamp("last_restocked_at"),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module 10: Customer Management - Vehicles
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  licensePlate: varchar("license_plate", { length: 50 }).notNull(),
  vin: varchar("vin", { length: 100 }),
  color: varchar("color", { length: 50 }),
  mileage: integer("mileage"),
  engineType: varchar("engine_type", { length: 100 }), // "gasoline", "diesel", "electric", "hybrid"
  transmissionType: varchar("transmission_type", { length: 50 }), // "automatic", "manual"
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Notes - for tracking customer interactions
export const customerNotes = pgTable("customer_notes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  noteType: varchar("note_type", { length: 50 }).notNull(), // "general", "complaint", "feedback", "reminder"
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isImportant: boolean("is_important").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 9: Appointments & Scheduling
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentNumber: varchar("appointment_number").notNull().unique(),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
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
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointment Status History - track all status changes
export const appointmentStatusHistory = pgTable("appointment_status_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id").notNull().references(() => appointments.id),
  previousStatus: varchar("previous_status"),
  newStatus: varchar("new_status").notNull(),
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointment Reminders - automated reminder tracking
export const appointmentReminders = pgTable("appointment_reminders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: uuid("appointment_id").notNull().references(() => appointments.id),
  reminderType: varchar("reminder_type").notNull(), // "sms", "email", "push"
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: varchar("status").notNull().default("pending"), // "pending", "sent", "failed"
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module 11: Purchase Orders & Supplier Integration
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  status: varchar("status").notNull().default("draft"), // "draft", "sent", "confirmed", "partial", "received", "cancelled"
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: uuid("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  garageId: uuid("garage_id").notNull().references(() => garages.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  jobCardId: uuid("job_card_id").references(() => jobCards.id),
  invoiceDate: timestamp("invoice_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status").notNull().default("draft"), // "draft", "sent", "paid", "overdue", "cancelled"
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  balanceAmount: decimal("balance_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  itemType: varchar("item_type", { length: 50 }).notNull(), // "service", "part", "labor"
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // "cash", "card", "transfer", "check"
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
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
export const insertServiceTemplateSchema = createInsertSchema(serviceTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;
export const insertToolSchema = createInsertSchema(tools).omit({ id: true, createdBy: true, createdAt: true, updatedAt: true });
export type ToolAvailability = typeof toolAvailability.$inferSelect;
export type InsertToolAvailability = typeof toolAvailability.$inferInsert;
export type SparePart = typeof spareParts.$inferSelect;
export type InsertSparePart = typeof spareParts.$inferInsert;
export const insertSparePartSchema = createInsertSchema(spareParts).omit({ id: true, createdBy: true, createdAt: true, updatedAt: true });
export type SparePartInventory = typeof sparePartInventories.$inferSelect;
export type InsertSparePartInventory = typeof sparePartInventories.$inferInsert;
export const insertSparePartInventorySchema = createInsertSchema(sparePartInventories).omit({ id: true, createdAt: true, updatedAt: true });
export type ToolUsageLog = typeof toolUsageLogs.$inferSelect;
export type InsertToolUsageLog = typeof toolUsageLogs.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, 
  appointmentNumber: true,
  createdBy: true,
  createdAt: true, 
  updatedAt: true 
});
export type AppointmentStatusHistory = typeof appointmentStatusHistory.$inferSelect;
export type InsertAppointmentStatusHistory = typeof appointmentStatusHistory.$inferInsert;
export type AppointmentReminder = typeof appointmentReminders.$inferSelect;
export type InsertAppointmentReminder = typeof appointmentReminders.$inferInsert;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export type CustomerNote = typeof customerNotes.$inferSelect;
export type InsertCustomerNote = typeof customerNotes.$inferInsert;
export const insertCustomerNoteSchema = createInsertSchema(customerNotes).omit({ id: true, createdBy: true, createdAt: true });

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true, updatedAt: true });
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, poNumber: true, createdBy: true, createdAt: true, updatedAt: true });
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true });

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, invoiceNumber: true, createdBy: true, createdAt: true, updatedAt: true });
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, createdAt: true });
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdBy: true, createdAt: true });

export type Garage = typeof garages.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type UserRoleBranch = typeof userRoleBranch.$inferSelect;
export type TechnicianProfile = typeof technicianProfiles.$inferSelect;
export type InsertTechnicianProfile = typeof technicianProfiles.$inferInsert;
export const insertTechnicianProfileSchema = createInsertSchema(technicianProfiles).omit({ createdAt: true, updatedAt: true });
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type AssistantProfile = typeof assistantProfiles.$inferSelect;
