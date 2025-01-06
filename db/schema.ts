import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles enum
export const userRoles = pgEnum("user_role", ["startup", "investor", "valuer", "consultant"]);
export const subscriptionTiers = pgEnum("subscription_tier", ["free", "startup", "growth", "enterprise"]);
export const planStatus = pgEnum("plan_status", ["active", "cancelled", "past_due", "trial"]);

// Add activity tracking enums
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

// Add new enums for add-on services
export const addonTypes = pgEnum("addon_type", [
  "cap_table_management",
  "financial_projections",
  "compliance_reports"
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  role: userRoles("role").notNull(),
  subscriptionTier: subscriptionTiers("subscription_tier").default("free").notNull(),
  subscriptionStatus: planStatus("subscription_status").default("active"),
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

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  tier: subscriptionTiers("tier").notNull(),
  price: integer("price").notNull(), // Price in cents
  billingPeriod: varchar("billing_period", { length: 20 }).notNull(), // monthly, yearly
  features: jsonb("features").$type<{
    valuationReports: number; // -1 for unlimited
    complianceReports: boolean;
    aiAnalysis: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    teamMembers: number;
    advancedAnalytics: boolean;
    collaborationTools: boolean;
    realTimeData: boolean;
    peerBenchmarking: boolean;
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
    complianceReportsUsed: number;
    projectionsGenerated: number;
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

// Add new table for pay-per-use purchases
export const payPerUseTransactions = pgTable("pay_per_use_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(), // 'valuation_report', 'compliance_report'
  amount: integer("amount").notNull(), // Price in cents
  status: varchar("status", { length: 20 }).notNull(), // 'completed', 'pending', 'failed'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add new table for add-on subscriptions
export const addonSubscriptions = pgTable("addon_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  addonType: addonTypes("addon_type").notNull(),
  status: planStatus("status").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  price: integer("price").notNull(), // Price in cents
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Add new enums for workspace roles and audit actions
export const workspaceRoles = pgEnum("workspace_role", ["owner", "admin", "member", "viewer"]);
export const auditActions = pgEnum("audit_action", [
  "valuation_created",
  "valuation_updated",
  "comment_added",
  "member_invited",
  "member_removed",
  "access_changed",
  "report_generated",
  "compliance_check"
]);

// Workspace table
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  settings: jsonb("settings").$type<{
    defaultCurrency: string;
    complianceFramework: string;
    region: string;
    customBranding?: {
      logo?: string;
      colors?: Record<string, string>;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workspace members table
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: workspaceRoles("role").notNull(),
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  joinedAt: timestamp("joined_at"),
});

// Valuations table
export const valuations = pgTable("valuations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  framework: varchar("framework", { length: 50 }).notNull(),
  data: jsonb("data").notNull(),
  result: jsonb("result").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // draft, in_review, approved, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Valuation comments
export const valuationComments = pgTable("valuation_comments", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  context: jsonb("context").$type<{
    section: string;
    field?: string;
    value?: any;
  }>(),
  resolved: boolean("resolved").default(false),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit trail for security and compliance
export const auditTrail = pgTable("audit_trail", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: auditActions("action").notNull(),
  details: jsonb("details").notNull(),
  valuationId: integer("valuation_id").references(() => valuations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  isEmailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
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
export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const selectWorkspaceSchema = createSelectSchema(workspaces);
export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers);
export const selectWorkspaceMemberSchema = createSelectSchema(workspaceMembers);
export const insertValuationSchema = createInsertSchema(valuations);
export const selectValuationSchema = createSelectSchema(valuations);
export const insertValuationCommentSchema = createInsertSchema(valuationComments);
export const selectValuationCommentSchema = createSelectSchema(valuationComments);
export const insertAuditTrailSchema = createInsertSchema(auditTrail);
export const selectAuditTrailSchema = createSelectSchema(auditTrail);
export const insertPayPerUseTransactionSchema = createInsertSchema(payPerUseTransactions);
export const selectPayPerUseTransactionSchema = createSelectSchema(payPerUseTransactions);
export const insertAddonSubscriptionSchema = createInsertSchema(addonSubscriptions);
export const selectAddonSubscriptionSchema = createSelectSchema(addonSubscriptions);

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
export type InsertWorkspace = typeof workspaces.$inferInsert;
export type SelectWorkspace = typeof workspaces.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type SelectWorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertValuation = typeof valuations.$inferInsert;
export type SelectValuation = typeof valuations.$inferSelect;
export type InsertValuationComment = typeof valuationComments.$inferInsert;
export type SelectValuationComment = typeof valuationComments.$inferSelect;
export type InsertAuditTrail = typeof auditTrail.$inferInsert;
export type SelectAuditTrail = typeof auditTrail.$inferSelect;
export type InsertPayPerUseTransaction = typeof payPerUseTransactions.$inferInsert;
export type SelectPayPerUseTransaction = typeof payPerUseTransactions.$inferSelect;
export type InsertAddonSubscription = typeof addonSubscriptions.$inferInsert;
export type SelectAddonSubscription = typeof addonSubscriptions.$inferSelect;

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
}));