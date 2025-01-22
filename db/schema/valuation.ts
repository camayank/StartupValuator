import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users } from "./core";
import {
  productStageEnum,
  businessModelEnum,
  sectorEnum,
  marketSizeTypes,
  riskLevels
} from "./enums";

// Valuation records table
export const valuationRecords = pgTable("valuation_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  }>().notNull(),
  productDetails: jsonb("product_details").$type<{
    maturity: string;
    roadmap: string;
    technologyStack: string;
    differentiators: string;
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
  valuationInputs: jsonb("valuation_inputs").$type<{
    targetValuation: number;
    fundingRequired: number;
    expectedROI: number;
  }>().notNull(),
  calculatedValuation: jsonb("calculated_valuation").$type<{
    low: number;
    high: number;
    methodologies: Record<string, number>;
    confidence: number;
    factors: string[];
  }>(),
});

// Supporting analysis tables
export const marketAnalysis = pgTable("market_analysis", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  marketType: marketSizeTypes("market_type").notNull(),
  size: integer("size").notNull(),
  growthRate: integer("growth_rate"),
  captureRate: integer("capture_rate"),
  competitorCount: integer("competitor_count"),
  barriers: jsonb("barriers").$type<string[]>(),
  opportunities: jsonb("opportunities").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productAnalysis = pgTable("product_analysis", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  stage: productStageEnum("stage").notNull(),
  maturityScore: integer("maturity_score").notNull(),
  features: jsonb("features").$type<string[]>(),
  technology: jsonb("technology").$type<{
    stack: string[];
    scalability: number;
    uniqueness: number;
  }>(),
  metrics: jsonb("metrics").$type<{
    userGrowth: number;
    engagement: number;
    retention: number;
  }>(),
  roadmap: jsonb("roadmap").$type<Array<{
    milestone: string;
    timeline: string;
    impact: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const riskAssessment = pgTable("risk_assessment", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  category: text("category").notNull(),
  level: riskLevels("level").notNull(),
  impact: text("impact").notNull(),
  probability: integer("probability").notNull(),
  mitigation: text("mitigation").notNull(),
  contingency: text("contingency"),
  monitoringMetrics: jsonb("monitoring_metrics").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create schemas for validation
export const insertValuationRecordSchema = createInsertSchema(valuationRecords);
export const selectValuationRecordSchema = createSelectSchema(valuationRecords);
export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis);
export const selectMarketAnalysisSchema = createSelectSchema(marketAnalysis);
export const insertProductAnalysisSchema = createInsertSchema(productAnalysis);
export const selectProductAnalysisSchema = createSelectSchema(productAnalysis);
export const insertRiskAssessmentSchema = createInsertSchema(riskAssessment);
export const selectRiskAssessmentSchema = createSelectSchema(riskAssessment);

// Export types
export type SelectValuationRecord = typeof valuationRecords.$inferSelect;
export type InsertValuationRecord = typeof valuationRecords.$inferInsert;
export type SelectMarketAnalysis = typeof marketAnalysis.$inferSelect;
export type InsertMarketAnalysis = typeof marketAnalysis.$inferInsert;
export type SelectProductAnalysis = typeof productAnalysis.$inferSelect;
export type InsertProductAnalysis = typeof productAnalysis.$inferInsert;
export type SelectRiskAssessment = typeof riskAssessment.$inferSelect;
export type InsertRiskAssessment = typeof riskAssessment.$inferInsert;

// Define relations
export const valuationRelations = relations(valuationRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [valuationRecords.userId],
    references: [users.id],
  }),
  marketAnalysis: many(marketAnalysis),
  productAnalysis: many(productAnalysis),
  riskAssessment: many(riskAssessment),
}));

export const marketAnalysisRelations = relations(marketAnalysis, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [marketAnalysis.valuationId],
    references: [valuationRecords.id],
  }),
}));

export const productAnalysisRelations = relations(productAnalysis, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [productAnalysis.valuationId],
    references: [valuationRecords.id],
  }),
}));

export const riskAssessmentRelations = relations(riskAssessment, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [riskAssessment.valuationId],
    references: [valuationRecords.id],
  }),
}));
