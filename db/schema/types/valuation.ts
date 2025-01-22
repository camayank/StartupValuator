import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { productStageEnum, businessModelEnum, sectorEnum, riskLevels, marketSizeTypes } from "./common";
import { users } from "./user";

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

// Schemas
export const insertValuationRecordSchema = createInsertSchema(valuationRecords);
export const selectValuationRecordSchema = createSelectSchema(valuationRecords);

// Types
export type SelectValuationRecord = typeof valuationRecords.$inferSelect;
export type InsertValuationRecord = typeof valuationRecords.$inferInsert;
