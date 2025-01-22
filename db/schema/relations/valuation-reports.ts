import { relations } from "drizzle-orm";
import { valuationRecords } from "../types/valuation";
import { users } from "../types/user";
import { valuationReports, generatedReports } from "../types/reports";

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

export const valuationReportRelations = relations(valuationReports, ({ one }) => ({
  valuation: one(valuationRecords, {
    fields: [valuationReports.valuationId],
    references: [valuationRecords.id],
  }),
}));
