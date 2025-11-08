// Types for valuation services

export interface FinancialProjection {
  year: number;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  taxRate: number;
  capex: number;
  nwcChange: number;
  depreciation: number;
  freeCashFlow: number;
}

export interface DCFInputs {
  historicalFinancials: Array<{
    financialYear: string;
    revenue: number;
    ebitda: number;
    cashInBank: number;
    totalLiabilities: number;
    shareholdersEquity: number;
  }>;
  projectionYears: number;
  discountRate: number;
  terminalGrowthRate: number;
  assumptionsOverride?: Partial<DCFAssumptions>;
}

export interface DCFAssumptions {
  revenueGrowthRates: number[]; // Year-wise growth %
  ebitdaMarginRates: number[]; // Year-wise EBITDA margins
  taxRate: number;
  capexPercentageOfRevenue: number;
  nwcChangePercentageOfRevenue: number;
  depreciationPercentageOfRevenue: number;
}

export interface BerkusInputs {
  soundIdea: number; // 0-10 rating
  prototypeExists: boolean;
  qualityManagementTeam: number; // 0-10 rating
  strategicRelationships: number; // 0-10 rating
  productRolloutOrSales: number; // 0-10 rating
}

export interface ScorecardInputs {
  baselineValuation: number; // Average valuation of similar startups in region
  factors: {
    strengthOfTeam: number; // 0-10 rating
    sizeOfOpportunity: number;
    productTechnology: number;
    competitiveEnvironment: number;
    marketingChannels: number;
    needForAdditionalFunding: number;
    other: number;
  };
  weights?: {
    strengthOfTeam: number; // Default: 30%
    sizeOfOpportunity: number; // Default: 25%
    productTechnology: number; // Default: 15%
    competitiveEnvironment: number; // Default: 10%
    marketingChannels: number; // Default: 10%
    needForAdditionalFunding: number; // Default: 5%
    other: number; // Default: 5%
  };
}

export interface RiskFactorInputs {
  baseValuation: number;
  riskFactors: {
    managementRisk: number; // 1-5 scale (3 is neutral)
    stageOfBusiness: number;
    legislationRisk: number;
    manufacturingRisk: number;
    salesMarketingRisk: number;
    fundingRisk: number;
    competitionRisk: number;
    technologyRisk: number;
    litigationRisk: number;
    internationalRisk: number;
    reputationRisk: number;
    potentialLucrative: number;
  };
}

export interface ComparableInputs {
  targetCompany: {
    revenue: number;
    ebitda: number;
    customerCount: number;
    growthRate: number;
  };
  comparables: Array<{
    companyName: string;
    valuation: number;
    revenue: number;
    ebitda: number;
    revenueMultiple: number;
    ebitdaMultiple: number;
    stage: string;
    sector: string;
  }>;
  filters?: {
    sector?: string;
    stage?: string;
    geography?: string;
  };
}

export interface ValuationResult {
  method: string;
  enterpriseValue?: number;
  equityValue: number;
  breakdown: Record<string, any>;
  projections?: FinancialProjection[];
  assumptions?: Record<string, any>;
  comparables?: Array<any>;
  confidence?: number;
}

export interface HybridValuationResult {
  valuationId?: string;
  companyId: string;
  valuationDate: string;
  valuationMethod: string;
  results: {
    conservative: number;
    base: number;
    optimistic: number;
    recommended: number;
  };
  breakdown: {
    dcfValuation?: number;
    berkusValuation?: number;
    scorecardValuation?: number;
    comparableValuation?: number;
    riskSummationValuation?: number;
    weightedAverage: number;
  };
  individualResults: {
    dcf?: ValuationResult;
    berkus?: ValuationResult;
    scorecard?: ValuationResult;
    comparable?: ValuationResult;
    riskSummation?: ValuationResult;
  };
  assumptions: Record<string, any>;
  confidenceScore: number;
}
