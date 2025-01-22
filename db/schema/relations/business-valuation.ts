import { relations } from "drizzle-orm";
import { valuationRecords } from "../types/valuation";
import { marketAnalysis, riskAssessment } from "../types/market";
import { users } from "../types/user";

export const valuationRelations = relations(valuationRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [valuationRecords.userId],
    references: [users.id],
  }),
  marketAnalysis: many(marketAnalysis),
  riskAssessment: many(riskAssessment),
}));
