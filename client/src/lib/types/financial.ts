import { z } from "zod";

// Company Financial Metrics Schema
export const financialMetricsSchema = z.object({
  revenue: z.number().min(0),
  ebitda: z.number(),
  netIncome: z.number(),
  cashFlow: z.number(),
  assets: z.number().min(0),
  liabilities: z.number().min(0),
  equityValue: z.number(),
  debtLevel: z.number().min(0),
  growthRate: z.number().min(-100).max(1000),
  profitMargin: z.number().min(-100).max(100),
});

// Market Conditions Schema
export const marketConditionsSchema = z.object({
  industryGrowthRate: z.number(),
  marketSize: z.number().min(0),
  competitorCount: z.number().int().min(0),
  marketShare: z.number().min(0).max(100),
  riskFreeRate: z.number(),
  marketRiskPremium: z.number(),
  beta: z.number(),
});

// Valuation Parameters Schema
export const valuationParametersSchema = z.object({
  discountRate: z.number().min(0).max(100),
  terminalGrowthRate: z.number().min(-20).max(20),
  projectionYears: z.number().int().min(1).max(10),
  revenueMultiple: z.number().min(0),
  ebitdaMultiple: z.number().min(0),
});

// Types derived from schemas
export type FinancialMetrics = z.infer<typeof financialMetricsSchema>;
export type MarketConditions = z.infer<typeof marketConditionsSchema>;
export type ValuationParameters = z.infer<typeof valuationParametersSchema>;

// Constants for financial calculations
export const FINANCIAL_CONSTANTS = {
  MIN_DISCOUNT_RATE: 0,
  MAX_DISCOUNT_RATE: 100,
  DEFAULT_RISK_FREE_RATE: 3.5,
  DEFAULT_MARKET_RISK_PREMIUM: 5.5,
  DEFAULT_BETA: 1.0,
  MIN_GROWTH_RATE: -20,
  MAX_GROWTH_RATE: 100,
  MAX_PROJECTION_YEARS: 10,
} as const;

// Valuation Method Types
export const VALUATION_METHODS = {
  DCF: "Discounted Cash Flow",
  MULTIPLES: "Market Multiples",
  MONTE_CARLO: "Monte Carlo Simulation",
  AI_HYBRID: "AI-Assisted Hybrid",
} as const;

export type ValuationMethod = keyof typeof VALUATION_METHODS;