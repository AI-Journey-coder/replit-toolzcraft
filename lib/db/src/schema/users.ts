import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  role: text("role").notNull().default("user"),
  plan: text("plan").notNull().default("free"),
  disabled: boolean("disabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const usageEventsTable = pgTable("usage_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  toolSlug: text("tool_slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUsageEventSchema = createInsertSchema(usageEventsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type UsageEvent = typeof usageEventsTable.$inferSelect;

export const toolSettingsTable = pgTable("tool_settings", {
  id: serial("id").primaryKey(),
  toolSlug: text("tool_slug").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  premium: boolean("premium").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertToolSettingSchema = createInsertSchema(toolSettingsTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertToolSetting = z.infer<typeof insertToolSettingSchema>;
export type ToolSetting = typeof toolSettingsTable.$inferSelect;

export const premiumPackagesTable = pgTable("premium_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  periodDays: integer("period_days").notNull().default(30),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPremiumPackageSchema = createInsertSchema(premiumPackagesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPremiumPackage = z.infer<typeof insertPremiumPackageSchema>;
export type PremiumPackage = typeof premiumPackagesTable.$inferSelect;

export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPrefix: text("key_prefix").notNull(),
  userId: integer("user_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export const insertApiKeySchema = createInsertSchema(apiKeysTable).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeysTable.$inferSelect;
