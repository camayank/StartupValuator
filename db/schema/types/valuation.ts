import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { productStageEnum, businessModelEnum, sectorEnum, riskLevels, marketSizeTypes } from "./common";
import { users } from "./user";

// Main valuation records table
export const valuationRecords = pgTable("valuation_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: text("name").notNull(),
  isDraft: boolean("is_draft").default(true).notNull(),
  version: integer("version").default(1).notNull(),
  businessInfo: jsonb("business_info").$type<{
    name: string;
    sector: (typeof sectorEnum.enumValues)[number];
    industry: string;
    location: string;
    productStage: (typeof productStageEnum.enumValues)[number];
    businessModel: (typeof businessModelEnum.enumValues)[number];
  }>().notNull(),
  marketData: jsonb("market_data").$type<{
    tam: number;
    sam: number;
    som: number;
    growthRate: number;
    competitors: string[];
  }>().notNull(),
  financialData: jsonb("financial_data").$type<{
    revenue: number;
    cac: number;
    ltv: number;
    burnRate: number;
    runway: number;
    projections: {
      revenue: Record<string, number>;
      expenses: Record<string, number>;
      margins: Record<string, number>;
    };
  }>().notNull(),
  assumptions: jsonb("assumptions").$type<{
    discountRate: number;
    terminalGrowthRate: number;
    beta: number;
    marketRiskPremium: number;
    revenueAssumptions: {
      growthRate: number;
      category: string;
      description: string;
    }[];
    expenseAssumptions: {
      category: string;
      percentage: number;
      description: string;
    }[];
  }>().notNull(),
  risksAndOpportunities: jsonb("risks_and_opportunities").$type<{
    risks: string[];
    opportunities: string[];
    aiInsights?: {
      marketAnalysis: {
        marketSizeAnalysis: Record<string, string>;
        competitorAnalysis: Record<string, any>;
        growthPotential: string;
        recommendations: string[];
      };
      riskAssessment: {
        riskLevel: string;
        keyRisks: string[];
        mitigationStrategies: string[];
      };
      growthProjections: {
        projections: Record<string, number>;
        assumptions: Record<string, any>;
      };
    };
  }>(),
  selectedMethods: jsonb("selected_methods").$type<{
    methods: string[];
    weights: Record<string, number>;
    justification: string;
  }>().notNull(),
  calculatedValuation: jsonb("calculated_valuation").$type<{
    low: number;
    high: number;
    methodologies: Record<string, number>;
    confidence: number;
    factors: string[];
  }>(),
  exportHistory: jsonb("export_history").$type<{
    exports: {
      type: "pdf" | "excel" | "csv";
      timestamp: string;
      version: number;
    }[];
  }>().default({ exports: [] }).notNull(),
});

// Table for tracking valuation changes
export const valuationVersions = pgTable("valuation_versions", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  version: integer("version").notNull(),
  changes: jsonb("changes").$type<{
    changedFields: string[];
    previousValues: Record<string, any>;
    newValues: Record<string, any>;
    timestamp: string;
    userId: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table for autosave drafts
export const valuationDrafts = pgTable("valuation_drafts", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  draftData: jsonb("draft_data").notNull(),
  lastAutosaved: timestamp("last_autosaved").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Schemas
export const insertValuationRecordSchema = createInsertSchema(valuationRecords);
export const selectValuationRecordSchema = createSelectSchema(valuationRecords);
export const insertValuationVersionSchema = createInsertSchema(valuationVersions);
export const selectValuationVersionSchema = createSelectSchema(valuationVersions);
export const insertValuationDraftSchema = createInsertSchema(valuationDrafts);
export const selectValuationDraftSchema = createSelectSchema(valuationDrafts);

// Types
export type SelectValuationRecord = typeof valuationRecords.$inferSelect;
export type InsertValuationRecord = typeof valuationRecords.$inferInsert;
export type SelectValuationVersion = typeof valuationVersions.$inferSelect;
export type InsertValuationVersion = typeof valuationVersions.$inferInsert;
export type SelectValuationDraft = typeof valuationDrafts.$inferSelect;
export type InsertValuationDraft = typeof valuationDrafts.$inferInsert;