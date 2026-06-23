import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users, garages } from "../schema";
import { providers } from "./catalog";
import { orders } from "./orders";
import { accounts } from "./ledger";

// Fleet management domain (Wave 2). All fleet tables reference the shared
// rails — they never duplicate identity, wallet, notifications, or orders.

export const fleetAccounts = pgTable(
  "fleet_accounts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    nameAr: text("name_ar"),
    ownerId: varchar("owner_id")
      .notNull()
      .references(() => users.id),
    providerId: uuid("provider_id").references(() => providers.id),
    walletAccountId: uuid("wallet_account_id").references(() => accounts.id),
    status: text("status").notNull().default("active"),
    // active | suspended | closed
    waslCompanyId: text("wasl_company_id"), // Wasl integration ID
    tgaLicenseNumber: text("tga_license_number"),
    crNumber: text("cr_number"), // commercial registration
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byOwner: index("fleet_owner_idx").on(t.ownerId),
  }),
);

export const fleetVehicles = pgTable(
  "fleet_vehicles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fleetAccountId: uuid("fleet_account_id")
      .notNull()
      .references(() => fleetAccounts.id),
    plateNumber: text("plate_number").notNull(),
    plateType: text("plate_type"), // private | transport | taxi | diplomatic
    vin: text("vin"),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    color: text("color"),
    engineType: text("engine_type"), // gasoline | diesel | electric | hybrid
    status: text("status").notNull().default("active"),
    // active | maintenance | decommissioned | transferred
    waslSequenceNumber: text("wasl_sequence_number"),
    fahesExpiryDate: date("fahes_expiry_date"), // periodic inspection expiry
    insuranceExpiryDate: date("insurance_expiry_date"),
    registrationExpiryDate: date("registration_expiry_date"),
    preferredGarageId: uuid("preferred_garage_id").references(() => garages.id),
    // latitude/longitude stored as text until PostGIS migration
    lastLatitude: text("last_latitude"),
    lastLongitude: text("last_longitude"),
    lastLocationAt: timestamp("last_location_at"),
    currentOdometer: integer("current_odometer"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byFleet: index("fv_fleet_idx").on(t.fleetAccountId),
    byPlate: index("fv_plate_idx").on(t.plateNumber),
  }),
);

export const fleetDrivers = pgTable(
  "fleet_drivers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fleetAccountId: uuid("fleet_account_id")
      .notNull()
      .references(() => fleetAccounts.id),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    assignedVehicleId: uuid("assigned_vehicle_id").references(
      () => fleetVehicles.id,
    ),
    licenseNumber: text("license_number"),
    licenseExpiryDate: date("license_expiry_date"),
    licenseType: text("license_type"), // light | heavy | motorcycle | special
    status: text("status").notNull().default("active"),
    // active | suspended | off_duty | terminated
    waslDriverId: text("wasl_driver_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byFleet: index("fd_fleet_idx").on(t.fleetAccountId),
    byUser: index("fd_user_idx").on(t.userId),
  }),
);

// Telematics data: high-frequency GPS + engine events from vehicles.
// Partitioned by time in production (monthly partitions via raw SQL).
export const telematicsEvents = pgTable(
  "telematics_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => fleetVehicles.id),
    eventType: text("event_type").notNull(),
    // gps | ignition_on | ignition_off | speeding | harsh_brake | geofence_enter | geofence_exit | fuel_level | dtc
    latitude: text("latitude"),
    longitude: text("longitude"),
    speed: integer("speed"),
    heading: integer("heading"),
    odometer: integer("odometer"),
    fuelLevel: integer("fuel_level"), // percentage 0-100
    payload: text("payload"), // JSON: raw OBD/telematics data
    recordedAt: timestamp("recorded_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byVehicle: index("te_vehicle_idx").on(t.vehicleId),
    byTime: index("te_time_idx").on(t.recordedAt),
  }),
);

export const fleetTrips = pgTable(
  "fleet_trips",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => fleetVehicles.id),
    driverId: uuid("driver_id").references(() => fleetDrivers.id),
    status: text("status").notNull().default("in_progress"),
    // in_progress | completed | cancelled
    startLatitude: text("start_latitude"),
    startLongitude: text("start_longitude"),
    endLatitude: text("end_latitude"),
    endLongitude: text("end_longitude"),
    startOdometer: integer("start_odometer"),
    endOdometer: integer("end_odometer"),
    distanceKm: integer("distance_km"),
    startedAt: timestamp("started_at").notNull(),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byVehicle: index("ft_vehicle_idx").on(t.vehicleId),
    byDriver: index("ft_driver_idx").on(t.driverId),
  }),
);

export const fleetGeofences = pgTable(
  "fleet_geofences",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fleetAccountId: uuid("fleet_account_id")
      .notNull()
      .references(() => fleetAccounts.id),
    name: text("name").notNull(),
    nameAr: text("name_ar"),
    type: text("type").notNull().default("circle"),
    // circle | polygon (polygon boundaries stored in PostGIS after migration)
    centerLatitude: text("center_latitude"),
    centerLongitude: text("center_longitude"),
    radiusMeters: integer("radius_meters"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byFleet: index("fg_fleet_idx").on(t.fleetAccountId),
  }),
);

// Fleet maintenance records link to the shared orders rail and optionally
// to a SALIS garage for the actual service.
export const fleetMaintenanceRecords = pgTable(
  "fleet_maintenance_records",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => fleetVehicles.id),
    type: text("type").notNull(),
    // scheduled | unscheduled | recall | inspection
    description: text("description"),
    status: text("status").notNull().default("pending"),
    // pending | scheduled | in_progress | completed | cancelled
    orderId: uuid("order_id").references(() => orders.id),
    garageId: uuid("garage_id").references(() => garages.id),
    cost: bigint("cost", { mode: "bigint" }), // minor units
    currency: text("currency").notNull().default("SAR"),
    scheduledDate: date("scheduled_date"),
    completedDate: date("completed_date"),
    odometerAtService: integer("odometer_at_service"),
    nextServiceOdometer: integer("next_service_odometer"),
    nextServiceDate: date("next_service_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byVehicle: index("fmr_vehicle_idx").on(t.vehicleId),
    byOrder: index("fmr_order_idx").on(t.orderId),
  }),
);

export const fuelTransactions = pgTable(
  "fuel_transactions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => fleetVehicles.id),
    driverId: uuid("driver_id").references(() => fleetDrivers.id),
    fuelType: text("fuel_type").notNull(), // gasoline_91 | gasoline_95 | diesel
    liters: integer("liters").notNull(),
    costPerLiter: bigint("cost_per_liter", { mode: "bigint" }), // minor units
    totalCost: bigint("total_cost", { mode: "bigint" }).notNull(), // minor units
    currency: text("currency").notNull().default("SAR"),
    odometer: integer("odometer"),
    stationName: text("station_name"),
    receiptRef: text("receipt_ref"),
    fueledAt: timestamp("fueled_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byVehicle: index("ftx_vehicle_idx").on(t.vehicleId),
  }),
);

// Document expiry tracking for compliance alerts (Fahes, insurance, license).
export const fleetDocuments = pgTable(
  "fleet_documents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fleetAccountId: uuid("fleet_account_id")
      .notNull()
      .references(() => fleetAccounts.id),
    entityType: text("entity_type").notNull(), // vehicle | driver
    entityId: uuid("entity_id").notNull(),
    documentType: text("document_type").notNull(),
    // registration | insurance | fahes | license | permit | tga_license
    documentNumber: text("document_number"),
    issueDate: date("issue_date"),
    expiryDate: date("expiry_date"),
    status: text("status").notNull().default("valid"),
    // valid | expiring_soon | expired | revoked
    fileUrl: text("file_url"),
    reminderSent: boolean("reminder_sent").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byFleet: index("fdoc_fleet_idx").on(t.fleetAccountId),
    byEntity: index("fdoc_entity_idx").on(t.entityType, t.entityId),
    byExpiry: index("fdoc_expiry_idx").on(t.expiryDate),
  }),
);

// Types and Zod schemas
export type FleetAccount = typeof fleetAccounts.$inferSelect;
export type InsertFleetAccount = typeof fleetAccounts.$inferInsert;
export const insertFleetAccountSchema = createInsertSchema(fleetAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FleetVehicle = typeof fleetVehicles.$inferSelect;
export type InsertFleetVehicle = typeof fleetVehicles.$inferInsert;
export const insertFleetVehicleSchema = createInsertSchema(fleetVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FleetDriver = typeof fleetDrivers.$inferSelect;
export type InsertFleetDriver = typeof fleetDrivers.$inferInsert;
export const insertFleetDriverSchema = createInsertSchema(fleetDrivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TelematicsEvent = typeof telematicsEvents.$inferSelect;
export type InsertTelematicsEvent = typeof telematicsEvents.$inferInsert;
export const insertTelematicsEventSchema = createInsertSchema(
  telematicsEvents,
).omit({ id: true, createdAt: true });

export type FleetTrip = typeof fleetTrips.$inferSelect;
export type InsertFleetTrip = typeof fleetTrips.$inferInsert;
export const insertFleetTripSchema = createInsertSchema(fleetTrips).omit({
  id: true,
  createdAt: true,
});

export type FleetGeofence = typeof fleetGeofences.$inferSelect;
export type InsertFleetGeofence = typeof fleetGeofences.$inferInsert;
export const insertFleetGeofenceSchema = createInsertSchema(fleetGeofences).omit(
  { id: true, createdAt: true },
);

export type FleetMaintenanceRecord = typeof fleetMaintenanceRecords.$inferSelect;
export type InsertFleetMaintenanceRecord = typeof fleetMaintenanceRecords.$inferInsert;
export const insertFleetMaintenanceRecordSchema = createInsertSchema(
  fleetMaintenanceRecords,
).omit({ id: true, createdAt: true, updatedAt: true });

export type FuelTransaction = typeof fuelTransactions.$inferSelect;
export type InsertFuelTransaction = typeof fuelTransactions.$inferInsert;
export const insertFuelTransactionSchema = createInsertSchema(
  fuelTransactions,
).omit({ id: true, createdAt: true });

export type FleetDocument = typeof fleetDocuments.$inferSelect;
export type InsertFleetDocument = typeof fleetDocuments.$inferInsert;
export const insertFleetDocumentSchema = createInsertSchema(fleetDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
