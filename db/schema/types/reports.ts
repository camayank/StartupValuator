import { pgTable, text, serial, integer, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { reportTypes, reportFormat } from "./common";
import { valuationRecords } from "./valuation";
import { users } from "./user";

// Report tables
export const valuationReports = pgTable("valuation_reports", {
  id: serial("id").primaryKey(),
  valuationId: integer("valuation_id").references(() => valuationRecords.id).notNull(),
  type: reportTypes("type").notNull(),
  content: jsonb("content").$type<{
    executiveSummary: string;
    marketAnalysis: any;
    financialAnalysis: any;
    riskAssessment: any;
    recommendations: string[];
    appendices: any[];
  }>(),
  format: text("format").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

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

// Schemas
export const insertValuationReportSchema = createInsertSchema(valuationReports);
export const selectValuationReportSchema = createSelectSchema(valuationReports);
export const insertGeneratedReportSchema = createInsertSchema(generatedReports);
export const selectGeneratedReportSchema = createSelectSchema(generatedReports);

// Types
export type SelectValuationReport = typeof valuationReports.$inferSelect;
export type InsertValuationReport = typeof valuationReports.$inferInsert;
export type SelectGeneratedReport = typeof generatedReports.$inferSelect;
export type InsertGeneratedReport = typeof generatedReports.$inferInsert;