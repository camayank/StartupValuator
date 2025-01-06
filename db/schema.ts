import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
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
  journeyMilestones: jsonb("journey_milestones").$type<{
    date: string;
    title: string;
    description: string;
    category: "product" | "team" | "funding" | "market" | "other";
    impact: number;
  }[]>(),
  growthMetrics: jsonb("growth_metrics").$type<{
    date: string;
    metric: string;
    value: number;
    target: number;
    unit: string;
  }[]>(),
  keyAchievements: jsonb("key_achievements").$type<{
    date: string;
    title: string;
    description: string;
    impact: string;
  }[]>(),
  futureGoals: jsonb("future_goals").$type<{
    targetDate: string;
    title: string;
    description: string;
    status: "planned" | "in_progress" | "achieved" | "delayed";
    priority: "low" | "medium" | "high";
  }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialProjections = pgTable("financial_projections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  projectionPeriod: integer("projection_period").notNull(),
  baseRevenue: numeric("base_revenue").notNull(),
  baseExpenses: numeric("base_expenses").notNull(),
  growthRate: numeric("growth_rate").notNull(),
  marginProjection: numeric("margin_projection").notNull(),
  assumptions: jsonb("assumptions").$type<{
    revenueAssumptions: {
      category: string;
      growthRate: number;
      description: string;
    }[];
    expenseAssumptions: {
      category: string;
      percentage: number;
      description: string;
    }[];
  }>(),
  yearlyProjections: jsonb("yearly_projections").$type<{
    year: number;
    revenue: number;
    expenses: number;
    margins: number;
    cashFlow: number;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundUtilizationPlans = pgTable("fund_utilization_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  projectionId: integer("projection_id").references(() => financialProjections.id).notNull(),
  totalFunding: numeric("total_funding").notNull(),
  monthlyBurnRate: numeric("monthly_burn_rate").notNull(),
  runwayMonths: integer("runway_months").notNull(),
  allocation: jsonb("allocation").$type<{
    category: string;
    percentage: number;
    amount: number;
    description: string;
  }[]>(),
  monthlyPlan: jsonb("monthly_plan").$type<{
    month: number;
    expenses: {
      category: string;
      amount: number;
    }[];
    remainingRunway: number;
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

export const userToProjectionsRelations = relations(users, ({ many }) => ({
  projections: many(financialProjections),
}));

export const projectionsToFundingRelations = relations(financialProjections, ({ many }) => ({
  fundingPlans: many(fundUtilizationPlans),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertFounderProfileSchema = createInsertSchema(founderProfiles);
export const selectFounderProfileSchema = createSelectSchema(founderProfiles);
export const insertFinancialProjectionSchema = createInsertSchema(financialProjections);
export const selectFinancialProjectionSchema = createSelectSchema(financialProjections);
export const insertFundUtilizationPlanSchema = createInsertSchema(fundUtilizationPlans);
export const selectFundUtilizationPlanSchema = createSelectSchema(fundUtilizationPlans);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertFounderProfile = typeof founderProfiles.$inferInsert;
export type SelectFounderProfile = typeof founderProfiles.$inferSelect;
export type InsertFinancialProjection = typeof financialProjections.$inferInsert;
export type SelectFinancialProjection = typeof financialProjections.$inferSelect;
export type InsertFundUtilizationPlan = typeof fundUtilizationPlans.$inferInsert;
export type SelectFundUtilizationPlan = typeof fundUtilizationPlans.$inferSelect;