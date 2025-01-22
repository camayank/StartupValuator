import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { marketSizeTypes, riskLevels } from "./common";
import { valuationRecords } from "./valuation";

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

// Schemas
export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis);
export const selectMarketAnalysisSchema = createSelectSchema(marketAnalysis);
export const insertRiskAssessmentSchema = createInsertSchema(riskAssessment);
export const selectRiskAssessmentSchema = createSelectSchema(riskAssessment);

// Types
export type SelectMarketAnalysis = typeof marketAnalysis.$inferSelect;
export type InsertMarketAnalysis = typeof marketAnalysis.$inferInsert;
export type SelectRiskAssessment = typeof riskAssessment.$inferSelect;
export type InsertRiskAssessment = typeof riskAssessment.$inferInsert;
