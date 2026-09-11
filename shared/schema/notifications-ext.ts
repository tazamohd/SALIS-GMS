import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "../schema";

// Extended notification infrastructure for the super-app.
// The existing notifications table handles basic in-app/SMS/email.
// These tables add mobile push token management and per-user preferences.

export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    platform: text("platform").notNull(), // ios | android | web
    token: text("token").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    byUser: index("dt_user_idx").on(t.userId),
  }),
);

export const notificationPrefs = pgTable(
  "notification_prefs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    channel: text("channel").notNull(), // push | sms | email | in_app
    category: text("category").notNull(),
    // booking | payment | promotion | fleet | maintenance | system
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    byUser: index("np_user_idx").on(t.userId),
  }),
);

export type DeviceToken = typeof deviceTokens.$inferSelect;
export type InsertDeviceToken = typeof deviceTokens.$inferInsert;
export const insertDeviceTokenSchema = createInsertSchema(deviceTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationPref = typeof notificationPrefs.$inferSelect;
export type InsertNotificationPref = typeof notificationPrefs.$inferInsert;
export const insertNotificationPrefSchema = createInsertSchema(
  notificationPrefs,
).omit({ id: true, createdAt: true });
