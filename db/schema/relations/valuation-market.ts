import { relations } from "drizzle-orm";
import { valuationRecords } from "../types/valuation";
import { marketAnalysis, riskAssessment } from "../types/market";

export const marketAnalysisRelations = relations(marketAnalysis, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [marketAnalysis.valuationId],
    references: [valuationRecords.id],
  }),
}));

export const riskAssessmentRelations = relations(riskAssessment, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [riskAssessment.valuationId],
    references: [valuationRecords.id],
  }),
}));
