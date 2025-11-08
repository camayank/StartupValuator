/**
 * Type definitions for valuation services
 */

export interface ValuationInput {
  // Basic company information
  companyName?: string;
  sector?: string;
  industry?: string;
  stage?: string;
  location?: string;

  // Financial metrics
  revenue: number;
  growthRate: number;
  burnRate?: number;
  runway?: number;
  margins?: number;
  arr?: number; // Annual Recurring Revenue (for SaaS)
  mrr?: number; // Monthly Recurring Revenue

  // Team metrics
  foundersCount?: number;
  employeeCount?: number;
  hasKeyHires?: boolean;

  // Market metrics
  marketSize?: number;
  competitionLevel?: string;
  marketShare?: number;

  // Product metrics
  productStage?: string;
  hasProductMarketFit?: boolean;
  customerCount?: number;
  churnRate?: number;

  // Traction metrics
  hasTraction?: boolean;
  hasRevenue?: boolean;
  hasProfitability?: boolean;

  // Additional context
  isDPIITRegistered?: boolean;
  hasPatents?: boolean;
  businessModel?: string;
}

export interface ValuationResult {
  valuation: number;
  methodology: string;
  confidenceScore: number;
  ranges?: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  insights?: string[];
  recommendations?: string[];
  risks?: string[];
}

export interface DCFAnalysis extends ValuationResult {
  enterpriseValue: number;
  equityValue: number;
  assumptions: {
    wacc: number;
    terminalGrowthRate: number;
    projectionYears: number;
    grossMargin: number;
    taxRate: number;
  };
  projections: {
    fcf: number[];
    revenue: number[];
    discountFactors: number[];
    discountedFCF: number[];
  };
  terminalValue: number;
  pvTerminalValue: number;
  presentValueFCF: number;
}

export interface BerkusAnalysis extends ValuationResult {
  breakdown: {
    soundIdea: number;
    prototype: number;
    qualityManagement: number;
    strategicRelationships: number;
    productRollout: number;
  };
  maxScore: number;
  achievedScore: number;
}

export interface ScorecardAnalysis extends ValuationResult {
  baselineValuation: number;
  factors: {
    management: { score: number; weight: number; adjustment: number };
    opportunity: { score: number; weight: number; adjustment: number };
    product: { score: number; weight: number; adjustment: number };
    competitive: { score: number; weight: number; adjustment: number };
    marketing: { score: number; weight: number; adjustment: number };
    funding: { score: number; weight: number; adjustment: number };
    misc: { score: number; weight: number; adjustment: number };
  };
  totalAdjustment: number;
}

export interface VCAnalysis extends ValuationResult {
  expectedExit: number;
  expectedExitMultiple: number;
  yearsToExit: number;
  targetROI: number;
  requiredOwnership: number;
  postMoneyValuation: number;
  preMoneyValuation: number;
}

export interface ComparableCompaniesAnalysis extends ValuationResult {
  comparables: Array<{
    name: string;
    sector: string;
    revenue: number;
    valuation: number;
    multiple: number;
  }>;
  medianMultiple: number;
  adjustedMultiple: number;
  impliedValuation: number;
}

export interface ScenarioAnalysis {
  bestCase: ValuationResult;
  baseCase: ValuationResult;
  worstCase: ValuationResult;
  probabilityWeighted: number;
  assumptions: {
    bestCase: any;
    baseCase: any;
    worstCase: any;
  };
}

export interface HybridValuation {
  finalValuation: number;
  confidenceScore: number;
  methodologies: {
    dcf?: DCFAnalysis;
    berkus?: BerkusAnalysis;
    scorecard?: ScorecardAnalysis;
    vcMethod?: VCAnalysis;
    comparables?: ComparableCompaniesAnalysis;
  };
  weights: {
    dcf?: number;
    berkus?: number;
    scorecard?: number;
    vcMethod?: number;
    comparables?: number;
  };
  weightedValuation: number;
  scenarios?: ScenarioAnalysis;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

export interface BenchmarkData {
  sector: string;
  stage: string;
  region: string;
  metrics: {
    medianValuation: number;
    medianRevenue: number;
    medianRevenueMultiple: number;
    medianGrowthRate: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
  };
  sampleSize: number;
  lastUpdated: Date;
}
