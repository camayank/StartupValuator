import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
  varchar,
  boolean,
  decimal,
  date,
  uuid,
  pgEnum,
  unique,
  index,
  bigint
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users } from "./core";
import { z } from "zod";

// ============= ENUMS =============

export const legalEntityTypeEnum = pgEnum("legal_entity_type", [
  "pvt_ltd",
  "llp",
  "partnership",
  "proprietorship",
  "opc"
]);

export const currentStageEnum = pgEnum("current_stage", [
  "ideation",
  "mvp",
  "pre_revenue",
  "revenue",
  "growth",
  "expansion"
]);

export const fundingStageEnum = pgEnum("funding_stage", [
  "bootstrap",
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "later"
]);

export const valuationMethodEnum = pgEnum("valuation_method", [
  "dcf",
  "berkus",
  "scorecard",
  "risk_summation",
  "comparable",
  "hybrid"
]);

export const shareholderTypeEnum = pgEnum("shareholder_type", [
  "founder",
  "angel",
  "vc",
  "employee",
  "other"
]);

export const schemeTypeEnum = pgEnum("scheme_type", [
  "grant",
  "loan",
  "subsidy",
  "equity",
  "tax_benefit",
  "other"
]);

export const eligibilityStatusEnum = pgEnum("eligibility_status", [
  "eligible",
  "partially_eligible",
  "not_eligible"
]);

export const investorReadinessEnum = pgEnum("investor_readiness", [
  "not_ready",
  "needs_improvement",
  "moderate",
  "ready",
  "highly_ready"
]);

// ============= COMPANIES TABLE =============

export const companies = pgTable("companies", {
  companyId: uuid("company_id").defaultRandom().primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  legalEntityType: legalEntityTypeEnum("legal_entity_type").notNull(),
  cin: varchar("cin", { length: 21 }).unique(),
  incorporationDate: date("incorporation_date").notNull(),
  dpiitRecognitionNumber: varchar("dpiit_recognition_number", { length: 50 }),
  dpiitRecognitionDate: date("dpiit_recognition_date"),
  registeredAddress: text("registered_address").notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  website: varchar("website", { length: 255 }),
  industrySector: varchar("industry_sector", { length: 100 }).notNull(),
  subSector: varchar("sub_sector", { length: 100 }),
  businessDescription: text("business_description"),
  currentStage: currentStageEnum("current_stage").notNull(),
  fundingStage: fundingStageEnum("funding_stage").default("bootstrap").notNull(),
  employeeCount: integer("employee_count"),
  gstNumber: varchar("gst_number", { length: 15 }),
  panNumber: varchar("pan_number", { length: 10 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("companies_user_id_idx").on(table.userId),
  cinIdx: index("companies_cin_idx").on(table.cin),
  sectorIdx: index("companies_sector_idx").on(table.industrySector),
}));

// ============= FOUNDERS TABLE =============

export const founders = pgTable("founders", {
  founderId: uuid("founder_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  founderName: varchar("founder_name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 100 }).notNull(),
  equityPercentage: decimal("equity_percentage", { precision: 5, scale: 2 }).notNull(),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  educationBackground: text("education_background"),
  previousExperience: text("previous_experience"),
  domainExpertise: text("domain_expertise"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("founders_company_id_idx").on(table.companyId),
}));

// ============= FINANCIAL DATA TABLE =============

export const financialData = pgTable("financial_data", {
  financialId: uuid("financial_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  financialYear: varchar("financial_year", { length: 7 }).notNull(), // e.g., '2023-24'
  isActual: boolean("is_actual").default(true).notNull(),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).default('0'),
  cogs: decimal("cogs", { precision: 15, scale: 2 }).default('0'),
  grossProfit: decimal("gross_profit", { precision: 15, scale: 2 }).default('0'),
  operatingExpenses: decimal("operating_expenses", { precision: 15, scale: 2 }).default('0'),
  ebitda: decimal("ebitda", { precision: 15, scale: 2 }).default('0'),
  interest: decimal("interest", { precision: 15, scale: 2 }).default('0'),
  tax: decimal("tax", { precision: 15, scale: 2 }).default('0'),
  netProfit: decimal("net_profit", { precision: 15, scale: 2 }).default('0'),
  totalAssets: decimal("total_assets", { precision: 15, scale: 2 }).default('0'),
  totalLiabilities: decimal("total_liabilities", { precision: 15, scale: 2 }).default('0'),
  shareholdersEquity: decimal("shareholders_equity", { precision: 15, scale: 2 }).default('0'),
  cashFlowOperations: decimal("cash_flow_operations", { precision: 15, scale: 2 }).default('0'),
  cashFlowInvesting: decimal("cash_flow_investing", { precision: 15, scale: 2 }).default('0'),
  cashFlowFinancing: decimal("cash_flow_financing", { precision: 15, scale: 2 }).default('0'),
  monthlyBurnRate: decimal("monthly_burn_rate", { precision: 15, scale: 2 }).default('0'),
  cashInBank: decimal("cash_in_bank", { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("financial_data_company_id_idx").on(table.companyId),
  yearIdx: index("financial_data_year_idx").on(table.financialYear),
  companyYearUnique: unique("financial_data_company_year_unique").on(table.companyId, table.financialYear, table.isActual),
}));

// ============= OPERATIONAL METRICS TABLE =============

export const operationalMetrics = pgTable("operational_metrics", {
  metricId: uuid("metric_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  metricDate: date("metric_date").notNull(),
  totalCustomers: integer("total_customers").default(0),
  activeCustomers: integer("active_customers").default(0),
  newCustomers: integer("new_customers").default(0),
  churnedCustomers: integer("churned_customers").default(0),
  monthlyActiveUsers: integer("monthly_active_users").default(0),
  customerAcquisitionCost: decimal("customer_acquisition_cost", { precision: 12, scale: 2 }),
  lifetimeValue: decimal("lifetime_value", { precision: 12, scale: 2 }),
  averageRevenuePerUser: decimal("average_revenue_per_user", { precision: 12, scale: 2 }),
  grossMarginPercentage: decimal("gross_margin_percentage", { precision: 5, scale: 2 }),
  netPromoterScore: integer("net_promoter_score"),
  customerRetentionRate: decimal("customer_retention_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("operational_metrics_company_id_idx").on(table.companyId),
  dateIdx: index("operational_metrics_date_idx").on(table.metricDate),
  companyDateUnique: unique("operational_metrics_company_date_unique").on(table.companyId, table.metricDate),
}));

// ============= FUNDING ROUNDS TABLE =============

export const fundingRounds = pgTable("funding_rounds", {
  fundingId: uuid("funding_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  roundName: varchar("round_name", { length: 100 }).notNull(),
  roundType: fundingStageEnum("round_type").notNull(),
  amountRaised: decimal("amount_raised", { precision: 15, scale: 2 }).notNull(),
  preMoneyValuation: decimal("pre_money_valuation", { precision: 15, scale: 2 }),
  postMoneyValuation: decimal("post_money_valuation", { precision: 15, scale: 2 }),
  fundingDate: date("funding_date").notNull(),
  leadInvestor: varchar("lead_investor", { length: 255 }),
  investorNames: text("investor_names"),
  equityDilution: decimal("equity_dilution", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("funding_rounds_company_id_idx").on(table.companyId),
  dateIdx: index("funding_rounds_date_idx").on(table.fundingDate),
}));

// ============= CAP TABLE =============

export const capTable = pgTable("cap_table", {
  entryId: uuid("entry_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  shareholderName: varchar("shareholder_name", { length: 255 }).notNull(),
  shareholderType: shareholderTypeEnum("shareholder_type").notNull(),
  sharesHeld: bigint("shares_held", { mode: "bigint" }).notNull(),
  shareClass: varchar("share_class", { length: 50 }).default("common"),
  equityPercentage: decimal("equity_percentage", { precision: 5, scale: 2 }).notNull(),
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }),
  investmentDate: date("investment_date"),
  vestingSchedule: text("vesting_schedule"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("cap_table_company_id_idx").on(table.companyId),
}));

// ============= VALUATIONS TABLE =============

export const valuations = pgTable("valuations", {
  valuationId: uuid("valuation_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  valuationDate: date("valuation_date").notNull(),
  valuationMethod: valuationMethodEnum("valuation_method").notNull(),
  conservativeValue: decimal("conservative_value", { precision: 15, scale: 2 }).notNull(),
  baseValue: decimal("base_value", { precision: 15, scale: 2 }).notNull(),
  optimisticValue: decimal("optimistic_value", { precision: 15, scale: 2 }).notNull(),
  recommendedValue: decimal("recommended_value", { precision: 15, scale: 2 }).notNull(),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }),
  calculationInputs: jsonb("calculation_inputs").$type<Record<string, any>>(),
  calculationOutputs: jsonb("calculation_outputs").$type<Record<string, any>>(),
  comparableCompanies: jsonb("comparable_companies").$type<Array<{
    companyName: string;
    valuation: number;
    revenueMultiple: number;
    stage: string;
    sector: string;
  }>>(),
  methodologyNotes: text("methodology_notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("valuations_company_id_idx").on(table.companyId),
  dateIdx: index("valuations_date_idx").on(table.valuationDate),
}));

// ============= INVESTMENT READINESS SCORES TABLE =============

export const investmentReadinessScores = pgTable("investment_readiness_scores", {
  scoreId: uuid("score_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  assessmentDate: date("assessment_date").notNull(),
  overallScore: integer("overall_score").notNull(), // 0-100
  financialHealthScore: integer("financial_health_score").notNull(), // 0-25
  marketOpportunityScore: integer("market_opportunity_score").notNull(), // 0-20
  teamStrengthScore: integer("team_strength_score").notNull(), // 0-20
  tractionExecutionScore: integer("traction_execution_score").notNull(), // 0-20
  governanceComplianceScore: integer("governance_compliance_score").notNull(), // 0-15
  detailedScoring: jsonb("detailed_scoring").$type<{
    financial: Record<string, any>;
    market: Record<string, any>;
    team: Record<string, any>;
    traction: Record<string, any>;
    governance: Record<string, any>;
  }>(),
  redFlags: jsonb("red_flags").$type<Array<{
    severity: 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    impact: string;
  }>>(),
  recommendations: jsonb("recommendations").$type<Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    expectedImpact: string;
  }>>(),
  investorReadiness: investorReadinessEnum("investor_readiness"),
  estimatedTimeToReady: varchar("estimated_time_to_ready", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("investment_readiness_company_id_idx").on(table.companyId),
  scoreIdx: index("investment_readiness_score_idx").on(table.overallScore),
}));

// ============= GOVERNMENT SCHEMES TABLE =============

export const governmentSchemes = pgTable("government_schemes", {
  schemeId: uuid("scheme_id").defaultRandom().primaryKey(),
  schemeName: varchar("scheme_name", { length: 255 }).notNull(),
  schemeCode: varchar("scheme_code", { length: 50 }).unique().notNull(),
  administeringBody: varchar("administering_body", { length: 255 }).notNull(),
  schemeType: schemeTypeEnum("scheme_type").notNull(),
  schemeCategory: varchar("scheme_category", { length: 100 }),
  description: text("description").notNull(),
  eligibilityCriteria: jsonb("eligibility_criteria").$type<Record<string, any>>().notNull(),
  fundingRangeMin: decimal("funding_range_min", { precision: 15, scale: 2 }),
  fundingRangeMax: decimal("funding_range_max", { precision: 15, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  applicationProcess: text("application_process"),
  requiredDocuments: jsonb("required_documents").$type<string[]>(),
  applicationDeadline: date("application_deadline"),
  schemeUrl: varchar("scheme_url", { length: 255 }),
  stateSpecific: varchar("state_specific", { length: 100 }),
  sectorSpecific: varchar("sector_specific", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("government_schemes_type_idx").on(table.schemeType),
  activeIdx: index("government_schemes_active_idx").on(table.isActive),
  stateIdx: index("government_schemes_state_idx").on(table.stateSpecific),
}));

// ============= SCHEME MATCHES TABLE =============

export const schemeMatches = pgTable("scheme_matches", {
  matchId: uuid("match_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  schemeId: uuid("scheme_id").references(() => governmentSchemes.schemeId, { onDelete: "cascade" }).notNull(),
  matchScore: integer("match_score").notNull(), // 0-100
  eligibilityStatus: eligibilityStatusEnum("eligibility_status").notNull(),
  metCriteria: jsonb("met_criteria").$type<string[]>(),
  unmetCriteria: jsonb("unmet_criteria").$type<string[]>(),
  recommendations: text("recommendations"),
  matchDate: date("match_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("scheme_matches_company_id_idx").on(table.companyId),
  schemeIdIdx: index("scheme_matches_scheme_id_idx").on(table.schemeId),
  statusIdx: index("scheme_matches_status_idx").on(table.eligibilityStatus),
  companySchemeUnique: unique("scheme_matches_company_scheme_unique").on(table.companyId, table.schemeId, table.matchDate),
}));

// ============= DOCUMENTS TABLE =============

export const documents = pgTable("documents", {
  documentId: uuid("document_id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.companyId, { onDelete: "cascade" }).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  expiryDate: date("expiry_date"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date"),
  extractedData: jsonb("extracted_data").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  companyIdIdx: index("documents_company_id_idx").on(table.companyId),
  typeIdx: index("documents_type_idx").on(table.documentType),
}));

// ============= AUDIT LOGS TABLE =============

export const auditLogs = pgTable("audit_logs", {
  logId: uuid("log_id").defaultRandom().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyId: uuid("company_id").references(() => companies.companyId),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"),
  oldValues: jsonb("old_values").$type<Record<string, any>>(),
  newValues: jsonb("new_values").$type<Record<string, any>>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  companyIdIdx: index("audit_logs_company_id_idx").on(table.companyId),
  dateIdx: index("audit_logs_date_idx").on(table.createdAt),
}));

// ============= RELATIONS =============

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  founders: many(founders),
  financialData: many(financialData),
  operationalMetrics: many(operationalMetrics),
  fundingRounds: many(fundingRounds),
  capTable: many(capTable),
  valuations: many(valuations),
  investmentReadinessScores: many(investmentReadinessScores),
  schemeMatches: many(schemeMatches),
  documents: many(documents),
}));

export const foundersRelations = relations(founders, ({ one }) => ({
  company: one(companies, {
    fields: [founders.companyId],
    references: [companies.companyId],
  }),
}));

export const financialDataRelations = relations(financialData, ({ one }) => ({
  company: one(companies, {
    fields: [financialData.companyId],
    references: [companies.companyId],
  }),
}));

export const operationalMetricsRelations = relations(operationalMetrics, ({ one }) => ({
  company: one(companies, {
    fields: [operationalMetrics.companyId],
    references: [companies.companyId],
  }),
}));

export const fundingRoundsRelations = relations(fundingRounds, ({ one }) => ({
  company: one(companies, {
    fields: [fundingRounds.companyId],
    references: [companies.companyId],
  }),
}));

export const capTableRelations = relations(capTable, ({ one }) => ({
  company: one(companies, {
    fields: [capTable.companyId],
    references: [companies.companyId],
  }),
}));

export const valuationsRelations = relations(valuations, ({ one }) => ({
  company: one(companies, {
    fields: [valuations.companyId],
    references: [companies.companyId],
  }),
  user: one(users, {
    fields: [valuations.createdBy],
    references: [users.id],
  }),
}));

export const investmentReadinessScoresRelations = relations(investmentReadinessScores, ({ one }) => ({
  company: one(companies, {
    fields: [investmentReadinessScores.companyId],
    references: [companies.companyId],
  }),
}));

export const schemeMatchesRelations = relations(schemeMatches, ({ one }) => ({
  company: one(companies, {
    fields: [schemeMatches.companyId],
    references: [companies.companyId],
  }),
  scheme: one(governmentSchemes, {
    fields: [schemeMatches.schemeId],
    references: [governmentSchemes.schemeId],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.companyId],
  }),
  verifiedByUser: one(users, {
    fields: [documents.verifiedBy],
    references: [users.id],
  }),
}));

// ============= SCHEMAS FOR VALIDATION =============

export const insertCompanySchema = createInsertSchema(companies, {
  companyName: z.string().min(2).max(255),
  cin: z.string().regex(/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/).optional(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/).optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/),
});

export const selectCompanySchema = createSelectSchema(companies);

// Export all schemas
export const insertFounderSchema = createInsertSchema(founders);
export const selectFounderSchema = createSelectSchema(founders);
export const insertFinancialDataSchema = createInsertSchema(financialData);
export const selectFinancialDataSchema = createSelectSchema(financialData);
export const insertOperationalMetricsSchema = createInsertSchema(operationalMetrics);
export const selectOperationalMetricsSchema = createSelectSchema(operationalMetrics);
export const insertFundingRoundSchema = createInsertSchema(fundingRounds);
export const selectFundingRoundSchema = createSelectSchema(fundingRounds);
export const insertCapTableSchema = createInsertSchema(capTable);
export const selectCapTableSchema = createSelectSchema(capTable);
export const insertValuationSchema = createInsertSchema(valuations);
export const selectValuationSchema = createSelectSchema(valuations);
export const insertInvestmentReadinessScoreSchema = createInsertSchema(investmentReadinessScores);
export const selectInvestmentReadinessScoreSchema = createSelectSchema(investmentReadinessScores);
export const insertGovernmentSchemeSchema = createInsertSchema(governmentSchemes);
export const selectGovernmentSchemeSchema = createSelectSchema(governmentSchemes);
export const insertSchemeMatchSchema = createInsertSchema(schemeMatches);
export const selectSchemeMatchSchema = createSelectSchema(schemeMatches);
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);

// Export types
export type SelectCompany = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type SelectFounder = typeof founders.$inferSelect;
export type InsertFounder = typeof founders.$inferInsert;
export type SelectFinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = typeof financialData.$inferInsert;
export type SelectOperationalMetrics = typeof operationalMetrics.$inferSelect;
export type InsertOperationalMetrics = typeof operationalMetrics.$inferInsert;
export type SelectFundingRound = typeof fundingRounds.$inferSelect;
export type InsertFundingRound = typeof fundingRounds.$inferInsert;
export type SelectCapTable = typeof capTable.$inferSelect;
export type InsertCapTable = typeof capTable.$inferInsert;
export type SelectValuation = typeof valuations.$inferSelect;
export type InsertValuation = typeof valuations.$inferInsert;
export type SelectInvestmentReadinessScore = typeof investmentReadinessScores.$inferSelect;
export type InsertInvestmentReadinessScore = typeof investmentReadinessScores.$inferInsert;
export type SelectGovernmentScheme = typeof governmentSchemes.$inferSelect;
export type InsertGovernmentScheme = typeof governmentSchemes.$inferInsert;
export type SelectSchemeMatch = typeof schemeMatches.$inferSelect;
export type InsertSchemeMatch = typeof schemeMatches.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type SelectAuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
