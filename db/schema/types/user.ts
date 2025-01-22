import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userRoles, subscriptionTiers, planStatus } from "./common";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  role: userRoles("role").notNull(),
  subscriptionTier: subscriptionTiers("subscription_tier").default("free").notNull(),
  subscriptionStatus: planStatus("subscription_status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  companyName: varchar("company_name", { length: 255 }),
  isEmailVerified: boolean("is_email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  region: varchar("region", { length: 100 }),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  twitterHandle: varchar("twitter_handle", { length: 50 }),
  profilePicture: varchar("profile_picture", { length: 255 }),
  settings: jsonb("settings").$type<{
    emailNotifications: boolean;
    twoFactorEnabled: boolean;
    theme: "light" | "dark" | "system";
    language: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["startup", "investor", "valuer", "consultant"]),
}).omit({
  id: true,
  subscriptionTier: true,
  subscriptionStatus: true,
  trialEndsAt: true,
  phoneNumber: true,
  companyName: true,
  isEmailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
});

export const selectUserSchema = createSelectSchema(users);
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);

// Types
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectUserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
