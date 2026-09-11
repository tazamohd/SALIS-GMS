import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { garages } from "../schema";

// Provider catalog: every supply entity across all mini-apps. Garages,
// drivers, tow operators, rental companies, insurers, parts suppliers.
// PostGIS location column is added via raw SQL migration (geometry(Point,4326)
// with GIST index) since Drizzle doesn't have native geometry support.

export const providers = pgTable(
  "providers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: text("type").notNull(),
    // garage | driver | tow | rental | insurer | parts_supplier
    name: text("name").notNull(),
    nameAr: text("name_ar"),
    refGarageId: uuid("ref_garage_id").references(() => garages.id),
    // latitude / longitude stored as text until PostGIS migration
    latitude: text("latitude"),
    longitude: text("longitude"),
    status: text("status").notNull().default("active"), // active | inactive | suspended
    metadata: text("metadata"), // JSON: license numbers, operating hours, etc.
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byType: index("provider_type_idx").on(t.type),
    byGarage: index("provider_garage_idx").on(t.refGarageId),
  }),
);

// Service catalog entries — what each mini-app offers.
export const servicesCatalog = pgTable("services_catalog", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  miniApp: text("mini_app").notNull(),
  // booking | parts | roadside | fleet | insurance | rental | ride
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Many-to-many: which providers offer which services, at what price.
export const providerServices = pgTable(
  "provider_services",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => servicesCatalog.id),
    price: bigint("price", { mode: "bigint" }), // minor units; null = quote-based
    currency: text("currency").notNull().default("SAR"),
    taxCode: text("tax_code"), // ZATCA tax category
    available: boolean("available").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byProvider: index("ps_provider_idx").on(t.providerId),
    byService: index("ps_service_idx").on(t.serviceId),
  }),
);

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;
export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ServiceCatalog = typeof servicesCatalog.$inferSelect;
export type InsertServiceCatalog = typeof servicesCatalog.$inferInsert;
export const insertServiceCatalogSchema = createInsertSchema(servicesCatalog).omit({
  id: true,
  createdAt: true,
});

export type ProviderService = typeof providerServices.$inferSelect;
export type InsertProviderService = typeof providerServices.$inferInsert;
export const insertProviderServiceSchema = createInsertSchema(providerServices).omit({
  id: true,
  createdAt: true,
});
