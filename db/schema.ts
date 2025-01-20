import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, type Relations } from "drizzle-orm";
import { z } from "zod";

// Define user roles enum
export const userRoles = pgEnum("user_role", ["startup", "investor", "valuer", "consultant"]);
export const subscriptionTiers = pgEnum("subscription_tier", ["free", "basic", "premium", "enterprise"]);
export const planStatus = pgEnum("plan_status", ["active", "cancelled", "past_due", "trial"]);

// Add new enums for tracking activities
export const activityTypes = pgEnum("activity_type", [
  "page_view",
  "valuation_started",
  "valuation_completed",
  "projection_created",
  "pitch_deck_generated",
  "compliance_check",
  "dashboard_view",
  "profile_update",
  "settings_change",
  "feature_interaction"
]);

// New enums for valuation-specific functionality
export const valuationStatus = pgEnum("valuation_status", ["draft", "completed", "archived"]);
export const reportFormat = pgEnum("report_format", ["pdf", "excel", "both"]);

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

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  tier: subscriptionTiers("tier").notNull(),
  price: integer("price").notNull(), // Price in cents
  billingPeriod: varchar("billing_period", { length: 20 }).notNull(), // monthly, yearly
  features: jsonb("features").$type<{
    valuationReports: number;
    aiAnalysis: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    teamMembers: number;
    advancedAnalytics: boolean;
  }>().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: planStatus("status").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  canceledAt: timestamp("canceled_at"),
  usageStats: jsonb("usage_stats").$type<{
    reportsGenerated: number;
    apiCalls: number;
    lastReportDate: string;
  }>(),
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

export const usageStats = pgTable("usage_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reportId: varchar("report_id", { length: 50 }),
  action: varchar("action", { length: 50 }).notNull(), // e.g., 'valuation_started', 'report_generated'
  metadata: jsonb("metadata"), // Additional context about the action
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for tracking detailed user activities
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: activityTypes("activity_type").notNull(),
  path: varchar("path", { length: 255 }),
  metadata: jsonb("metadata").$type<{
    featureId?: string;
    duration?: number;
    success?: boolean;
    errorType?: string;
    interactionDetails?: Record<string, any>;
  }>(),
  sessionId: varchar("session_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table for workflow suggestions
export const workflowSuggestions = pgTable("workflow_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  suggestedAction: varchar("suggested_action", { length: 255 }).notNull(),
  priority: integer("priority").notNull(),
  based_on: jsonb("based_on").$type<{
    activityPattern?: string[];
    userMetrics?: Record<string, number>;
    previousActions?: string[];
  }>(),
  shown: boolean("shown").default(false),
  clicked: boolean("clicked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});


// Valuation records table
export const valuationRecords = pgTable("valuation_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  status: valuationStatus("status").default("draft").notNull(),
  metrics: jsonb("metrics").$type<{
    financial: Record<string, number>;
    industry: Record<string, number>;
    custom: Array<{ name: string; value: number; type: string }>;
  }>(),
  calculations: jsonb("calculations").$type<{
    methodologies: Record<string, number>;
    weightedAverage: number;
    adjustments: Record<string, number>;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Industry benchmarks table
export const industryBenchmarks = pgTable("industry_benchmarks", {
  id: serial("id").primaryKey(),
  industry: varchar("industry", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  metrics: jsonb("metrics").$type<{
    financial: Record<string, { min: number; median: number; max: number }>;
    valuation: Record<string, { min: number; median: number; max: number }>;
  }>().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Generated reports table
export const generatedReports = pgTable("generated_reports", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  format: reportFormat("format").notNull(),
  content: jsonb("content"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  downloadUrl: varchar("download_url", { length: 255 }),
  expiresAt: timestamp("expires_at"),
});

// Define relations
export const userToProfileRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  subscriptions: many(userSubscriptions),
  usageStats: many(usageStats),
  activities: many(userActivities),
  suggestions: many(workflowSuggestions),
}));

export const profileToUserRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const subscriptionToUserRelation = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const activityRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

export const suggestionRelations = relations(workflowSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [workflowSuggestions.userId],
    references: [users.id],
  }),
}));

export const valuationRelations = relations(valuationRecords, ({ one }) => ({
  user: one(users, {
    fields: [valuationRecords.userId],
    references: [users.id],
  }),
}));

export const reportRelations = relations(generatedReports, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [generatedReports.valuationId],
    references: [valuationRecords.id],
  }),
  user: one(users, {
    fields: [generatedReports.userId],
    references: [users.id],
  }),
}));

// Create schemas for validation with custom validation rules
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
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const selectSubscriptionPlanSchema = createSelectSchema(subscriptionPlans);
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions);
export const selectUserSubscriptionSchema = createSelectSchema(userSubscriptions);
export const insertUsageStatsSchema = createInsertSchema(usageStats);
export const selectUsageStatsSchema = createSelectSchema(usageStats);
export const insertUserActivitySchema = createInsertSchema(userActivities);
export const selectUserActivitySchema = createSelectSchema(userActivities);
export const insertWorkflowSuggestionSchema = createInsertSchema(workflowSuggestions);
export const selectWorkflowSuggestionSchema = createSelectSchema(workflowSuggestions);

export const insertValuationRecordSchema = createInsertSchema(valuationRecords);
export const selectValuationRecordSchema = createSelectSchema(valuationRecords);
export const insertIndustryBenchmarkSchema = createInsertSchema(industryBenchmarks);
export const selectIndustryBenchmarkSchema = createSelectSchema(industryBenchmarks);
export const insertGeneratedReportSchema = createInsertSchema(generatedReports);
export const selectGeneratedReportSchema = createSelectSchema(generatedReports);

// Export types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type SelectUserProfile = typeof userProfiles.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type SelectUserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUsageStats = typeof usageStats.$inferInsert;
export type SelectUsageStats = typeof usageStats.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;
export type SelectUserActivity = typeof userActivities.$inferSelect;
export type InsertWorkflowSuggestion = typeof workflowSuggestions.$inferInsert;
export type SelectWorkflowSuggestion = typeof workflowSuggestions.$inferSelect;
export type InsertValuationRecord = typeof valuationRecords.$inferInsert;
export type SelectValuationRecord = typeof valuationRecords.$inferSelect;
export type InsertIndustryBenchmark = typeof industryBenchmarks.$inferInsert;
export type SelectIndustryBenchmark = typeof industryBenchmarks.$inferSelect;
export type InsertGeneratedReport = typeof generatedReports.$inferInsert;
export type SelectGeneratedReport = typeof generatedReports.$inferSelect;

export const loginAudit = pgTable("login_audit", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  status: varchar("status", { length: 20 }).notNull(), // success, failed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoginAuditSchema = createInsertSchema(loginAudit);
export const selectLoginAuditSchema = createSelectSchema(loginAudit);
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const selectPasswordResetTokenSchema = createSelectSchema(passwordResetTokens);

export type InsertLoginAudit = typeof loginAudit.$inferInsert;
export type SelectLoginAudit = typeof loginAudit.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type SelectPasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  subscriptions: many(userSubscriptions),
  usageStats: many(usageStats),
  activities: many(userActivities),
  suggestions: many(workflowSuggestions),
  valuations: many(valuationRecords),
  reports: many(generatedReports),
}));