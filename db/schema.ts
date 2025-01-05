import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const founderProfiles = pgTable("founder_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  experience: text("experience"),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: text("twitter_handle"),
  companyName: text("company_name"),
  companyWebsite: text("company_website"),
  foundingDate: timestamp("founding_date"),
  teamSize: integer("team_size"),
  keyRoles: jsonb("key_roles").$type<string[]>(),
  previousExits: jsonb("previous_exits").$type<{
    companyName: string;
    exitYear: number;
    exitType: string;
    amount?: number;
  }[]>(),
  fundingHistory: jsonb("funding_history").$type<{
    round: string;
    amount: number;
    date: string;
    investors: string[];
  }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userToProfileRelations = relations(users, ({ one }) => ({
  profile: one(founderProfiles, {
    fields: [users.id],
    references: [founderProfiles.userId],
  }),
}));

export const profileToUserRelations = relations(founderProfiles, ({ one }) => ({
  user: one(users, {
    fields: [founderProfiles.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertFounderProfileSchema = createInsertSchema(founderProfiles);
export const selectFounderProfileSchema = createSelectSchema(founderProfiles);

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertFounderProfile = typeof founderProfiles.$inferInsert;
export type SelectFounderProfile = typeof founderProfiles.$inferSelect;