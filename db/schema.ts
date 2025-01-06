import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles enum
export const userRoles = pgEnum("user_role", ["startup", "investor", "valuer", "consultant"]);
export const subscriptionTiers = pgEnum("subscription_tier", ["free", "startup", "growth", "enterprise"]);
export const planStatus = pgEnum("plan_status", ["active", "cancelled", "past_due", "trial"]);
export const addonTypes = pgEnum("addon_type", [
  "cap_table_management",
  "financial_projections",
  "compliance_reports"
]);

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

// Add valuation specific enums
export const valuationMethods = pgEnum("valuation_method", [
  "dcf",
  "market_comparables", 
  "first_chicago",
  "venture_capital",
  "berkus",
  "scorecard",
  "risk_factor_summation"
]);

export const valuationStages = pgEnum("valuation_stage", [
  "ideation",
  "mvp",
  "early_revenue",
  "growth",
  "scaling",
  "mature"
]);

export const industryVerticals = pgEnum("industry_vertical", [
  "saas",
  "fintech",
  "healthtech",
  "ecommerce",
  "deeptech",
  "enterprise",
  "consumer",
  "marketplace"
]);

export const complianceFrameworks = pgEnum("compliance_framework", [
  "409a",
  "ifrs",
  "icai",
  "ivs",
  "aicpa"
]);

export const reportStatus = pgEnum("report_status", [
  "draft",
  "in_review", 
  "approved",
  "archived"
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
  companyName: varchar("company_name", { length: 255 }),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  settings: jsonb("settings").$type<{
    emailNotifications: boolean;
    theme: "light" | "dark" | "system";
    language: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const profileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

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

export const payPerUseTransactions = pgTable("pay_per_use_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(), // 'valuation_report', 'compliance_report'
  amount: integer("amount").notNull(), // Price in cents
  status: varchar("status", { length: 20 }).notNull(), // 'completed', 'pending', 'failed'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: workspaceRoles("role").notNull(),
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  joinedAt: timestamp("joined_at"),
});

export const valuations = pgTable("valuations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  industry: industryVerticals("industry").notNull(),
  stage: valuationStages("stage").notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  complianceFramework: complianceFrameworks("compliance_framework").notNull(),

  // Financial metrics
  revenue: decimal("revenue", { precision: 15, scale: 2 }),
  revenueGrowth: decimal("revenue_growth", { precision: 5, scale: 2 }),
  grossMargin: decimal("gross_margin", { precision: 5, scale: 2 }),
  ebitdaMargin: decimal("ebitda_margin", { precision: 5, scale: 2 }),
  burnRate: decimal("burn_rate", { precision: 15, scale: 2 }),
  runway: integer("runway"), // in months

  // Market data
  totalAddressableMarket: decimal("tam", { precision: 15, scale: 2 }),
  serviceableAddressableMarket: decimal("sam", { precision: 15, scale: 2 }),
  serviceableObtainableMarket: decimal("som", { precision: 15, scale: 2 }),

  // Industry-specific metrics stored as JSON
  metrics: jsonb("metrics").$type<{
    arr?: number;
    mrr?: number;
    cac?: number;
    ltv?: number;
    churnRate?: number;
    nps?: number;
    activeUsers?: number;
    gmv?: number;
    processingVolume?: number;
    [key: string]: number | undefined;
  }>(),

  // Valuation inputs and results
  methodology: jsonb("methodology").$type<{
    primary: {
      method: string;
      weight: number;
      assumptions: Record<string, any>;
    };
    secondary: Array<{
      method: string;
      weight: number;
      assumptions: Record<string, any>;
    }>;
  }>(),

  // AI analysis and insights
  aiAnalysis: jsonb("ai_analysis").$type<{
    riskFactors: string[];
    growthDrivers: string[];
    competitiveAdvantages: string[];
    recommendations: string[];
    marketSentiment: {
      score: number;
      factors: string[];
    };
  }>(),

  // Results
  valuationRange: jsonb("valuation_range").$type<{
    low: number;
    base: number;
    high: number;
    currency: string;
    confidence: number;
  }>(),

  // Metadata
  status: reportStatus("status").notNull(),
  version: integer("version").notNull().default(1),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const auditTrail = pgTable("audit_trail", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: auditActions("action").notNull(),
  details: jsonb("details").notNull(),
  valuationId: integer("valuation_id").references(() => valuations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Add market data table for benchmarking
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  industry: industryVerticals("industry").notNull(),
  stage: valuationStages("stage").notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  metric: varchar("metric", { length: 100 }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  period: varchar("period", { length: 50 }).notNull(),
  source: varchar("source", { length: 255 }),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Add comparable companies table
export const comparables = pgTable("comparables", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: industryVerticals("industry").notNull(),
  stage: valuationStages("stage").notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  metrics: jsonb("metrics").$type<{
    revenue?: number;
    valuation?: number;
    multiple?: number;
    growthRate?: number;
    margins?: number;
    [key: string]: number | undefined;
  }>(),
  source: varchar("source", { length: 255 }),
  asOf: timestamp("as_of").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Add risk assessment table
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuations.id).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  factor: varchar("factor", { length: 255 }).notNull(),
  impact: decimal("impact", { precision: 3, scale: 2 }).notNull(),
  likelihood: decimal("likelihood", { precision: 3, scale: 2 }).notNull(),
  mitigationStrategy: text("mitigation_strategy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add AI insights table
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuations.id).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  insight: text("insight").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  source: jsonb("source").$type<{
    type: string;
    reference: string;
    timestamp: string;
  }>(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
export const insertLoginAuditSchema = createInsertSchema(loginAudit);
export const selectLoginAuditSchema = createInsertSchema(loginAudit);
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const selectPasswordResetTokenSchema = createSelectSchema(passwordResetTokens);

export const insertMarketDataSchema = createInsertSchema(marketData);
export const selectMarketDataSchema = createSelectSchema(marketData);
export const insertComparablesSchema = createInsertSchema(comparables);
export const selectComparablesSchema = createSelectSchema(comparables);
export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments);
export const selectRiskAssessmentSchema = createSelectSchema(riskAssessments);
export const insertAiInsightSchema = createInsertSchema(aiInsights);
export const selectAiInsightSchema = createSelectSchema(aiInsights);


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
export type InsertLoginAudit = typeof loginAudit.$inferInsert;
export type SelectLoginAudit = typeof loginAudit.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type SelectPasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;
export type SelectMarketData = typeof marketData.$inferSelect;
export type InsertComparable = typeof comparables.$inferInsert;
export type SelectComparable = typeof comparables.$inferSelect;
export type InsertRiskAssessment = typeof riskAssessments.$inferInsert;
export type SelectRiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;
export type SelectAiInsight = typeof aiInsights.$inferSelect;