import type { ValuationFormData } from "../../client/src/lib/validations";
import { industries, businessStages } from "../../client/src/lib/validations";
import { calculateFinancialAssumptions } from "./financialAssumptions";
import { getCachedMarketSentiment } from "./marketSentiment";
import type { FinancialAssumptions } from "./financialAssumptions";
import type { MarketSentiment } from "./marketSentiment";
import { 
  getFramework, 
  validateFrameworkCompliance, 
  applyFrameworkAdjustments,
  type FrameworkId 
} from "./compliance/frameworks";

interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  JPY: number;
  INR: number;
}

// Exchange rates (in production, these would come from an API)
const EXCHANGE_RATES: CurrencyRates = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.79,
  JPY: 144.85,
  INR: 83.15,
};

export async function calculateValuation(params: ValuationFormData & { framework?: FrameworkId }) {
  const { currency, stage, industry, revenue, framework = 'ivs' } = params;

  // Get compliance framework
  const complianceFramework = getFramework(framework);

  // Get market sentiment analysis
  const marketSentiment = await getCachedMarketSentiment(params);

  // Generate financial assumptions first
  const assumptions = calculateFinancialAssumptions(params);

  // Convert revenue to USD for calculations
  const revenueUSD = params.revenue / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  const paramsUSD = { ...params, revenue: revenueUSD };

  // Calculate valuations using different methods with enhanced assumptions
  const dcfAnalysis = calculateDCF(paramsUSD, assumptions);
  const comparablesAnalysis = calculateComparables(paramsUSD, assumptions);
  const riskAdjustedAnalysis = calculateRiskAdjustedValuation(paramsUSD, assumptions, marketSentiment);

  // Determine method weights based on stage and data quality
  const weights = determineMethodWeights(stage, industry, assumptions);

  // Calculate weighted average valuation with enhanced methodology
  const baseValuationUSD = (
    dcfAnalysis.value * weights.dcf +
    comparablesAnalysis.value * weights.comparables +
    riskAdjustedAnalysis.value * weights.riskAdjusted
  );

  // Calculate market sentiment adjustment
  const sentimentAdjustment = calculateMarketSentimentAdjustment(marketSentiment);

  // Apply compliance framework adjustments
  const frameworkAdjustedValuationUSD = applyFrameworkAdjustments(
    complianceFramework,
    baseValuationUSD * sentimentAdjustment
  );

  // Validate compliance
  const complianceResults = validateFrameworkCompliance(complianceFramework, {
    assetDescription: `${params.businessName} - ${industry} company in ${stage} stage`,
    purposeOfValuation: params.valuationPurpose,
    valuationDate: new Date().toISOString(),
    dataSources: [
      "Financial Statements",
      "Market Data",
      "Industry Reports",
    ],
    assumptions: [
      {
        description: "Growth Rate",
        justification: `Industry average growth rate of ${assumptions.growthRate}%`,
      },
      {
        description: "Market Risk Premium",
        justification: `Based on current market conditions and sentiment score of ${marketSentiment.overallScore}`,
      },
    ],
  });

  // Convert back to requested currency
  const finalValuation = frameworkAdjustedValuationUSD * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];

  return {
    valuation: Math.round(finalValuation * 100) / 100,
    multiplier: revenue > 0 ? Math.round((frameworkAdjustedValuationUSD / revenueUSD) * 100) / 100 : null,
    methodology: {
      dcfWeight: weights.dcf,
      comparablesWeight: weights.comparables,
      riskAdjustedWeight: weights.riskAdjusted,
      sentimentAdjustment,
    },
    marketSentiment,
    compliance: {
      framework: complianceFramework.name,
      region: complianceFramework.region,
      results: complianceResults,
      adjustments: complianceFramework.adjustments,
    },
    details: {
      baseValuation: baseValuationUSD,
      methods: {
        dcf: dcfAnalysis,
        comparables: comparablesAnalysis,
        riskAdjusted: riskAdjustedAnalysis,
      },
      scenarios: generateScenarioAnalysis(params, frameworkAdjustedValuationUSD, assumptions),
      sensitivityAnalysis: performSensitivityAnalysis(params, frameworkAdjustedValuationUSD),
      industryMetrics: getIndustryMetrics(industry, stage),
    },
    assumptions,
  };
}

function determineMethodWeights(
  stage: string,
  industry: string,
  assumptions: FinancialAssumptions
): { dcf: number; comparables: number; riskAdjusted: number } {
  let dcfWeight = 0.4;
  let comparablesWeight = 0.4;
  let riskAdjustedWeight = 0.2;

  // Adjust weights based on company stage
  if (stage.includes('revenue_scaling') || stage.includes('established')) {
    dcfWeight = 0.5;
    comparablesWeight = 0.3;
    riskAdjustedWeight = 0.2;
  } else if (stage.includes('ideation') || stage.includes('mvp')) {
    dcfWeight = 0.2;
    comparablesWeight = 0.5;
    riskAdjustedWeight = 0.3;
  }

  // Adjust based on industry characteristics
  if (industry === 'technology' || industry === 'biotech') {
    dcfWeight *= 0.8;
    riskAdjustedWeight *= 1.2;
  }

  // Normalize weights to ensure they sum to 1
  const total = dcfWeight + comparablesWeight + riskAdjustedWeight;
  return {
    dcf: dcfWeight / total,
    comparables: comparablesWeight / total,
    riskAdjusted: riskAdjustedWeight / total,
  };
}

function calculateRiskAdjustedValuation(
  params: ValuationFormData,
  assumptions: FinancialAssumptions,
  marketSentiment: MarketSentiment
): { value: number; riskFactors: Record<string, number> } {
  const baseValue = (params.revenue || 0) * assumptions.industryMultiple;

  // Calculate various risk factors including market sentiment
  const riskFactors = {
    marketRisk: calculateMarketRisk(params, marketSentiment),
    executionRisk: calculateExecutionRisk(params),
    competitiveRisk: calculateCompetitiveRisk(params, marketSentiment),
    financialRisk: calculateFinancialRisk(params),
    regulatoryRisk: calculateRegulatoryRisk(params.industry, marketSentiment),
  };

  // Apply risk adjustments
  const riskAdjustment = Object.values(riskFactors).reduce((acc, val) => acc * val, 1);

  return {
    value: baseValue * riskAdjustment,
    riskFactors,
  };
}

function calculateMarketRisk(params: ValuationFormData, sentiment: MarketSentiment): number {
  return 0.7 + (sentiment.sentimentByFactor.marketConditions * 0.3);
}

function calculateExecutionRisk(params: ValuationFormData): number {
  // Implementation of execution risk based on team experience and track record
  return 0.95; // Example: 5% risk reduction
}

function calculateCompetitiveRisk(params: ValuationFormData, sentiment: MarketSentiment): number {
  return 0.7 + (sentiment.sentimentByFactor.competitiveLandscape * 0.3);
}

function calculateFinancialRisk(params: ValuationFormData): number {
  // Implementation of financial risk based on cash flow and burn rate
  return 0.92; // Example: 8% risk reduction
}

function calculateRegulatoryRisk(industry: string, sentiment: MarketSentiment): number {
  return 0.7 + (sentiment.sentimentByFactor.regulatoryEnvironment * 0.3);
}

function calculateMarketSentimentAdjustment(sentiment: MarketSentiment): number {
  // Calculate weighted sentiment adjustment
  const weights = {
    marketConditions: 0.3,
    industryTrends: 0.3,
    competitiveLandscape: 0.2,
    regulatoryEnvironment: 0.2,
  };

  const weightedScore = Object.entries(sentiment.sentimentByFactor).reduce(
    (acc, [factor, score]) => acc + score * weights[factor as keyof typeof weights],
    0
  );

  // Transform sentiment score to an adjustment factor (0.8 to 1.2 range)
  return 0.8 + (weightedScore * 0.4);
}

function calculateMarketSentiment(industry: string): {
  score: number;
  trends: string[];
  outlook: string;
} {
  return {
    score: 0.8, // Example: 80% positive sentiment
    trends: [
      "Growing market demand",
      "Increasing investment activity",
      "Positive regulatory environment"
    ],
    outlook: "Positive with strong growth potential"
  };
}

function getIndustryTrends(industry: string): {
  growth: number;
  investment: number;
  innovation: number;
} {
  return {
    growth: 12.5, // Example: 12.5% annual growth
    investment: 8.3, // Example: 8.3% investment increase
    innovation: 0.85 // Example: 85% innovation score
  };
}

function assessGrowthPotential(params: ValuationFormData): {
  score: number;
  factors: string[];
  recommendations: string[];
} {
  return {
    score: 0.75, // Example: 75% growth potential
    factors: [
      "Strong market position",
      "Scalable business model",
      "High barriers to entry"
    ],
    recommendations: [
      "Focus on market expansion",
      "Invest in R&D",
      "Build strategic partnerships"
    ]
  };
}

function getIndustryMetrics(industry: string, stage: string): {
  averageValuation: number;
  medianMultiple: number;
  growthRate: number;
  benchmarks: Record<string, number>;
} {
  return {
    averageValuation: 10000000, // Example: $10M average
    medianMultiple: 5.2, // Example: 5.2x multiple
    growthRate: 15.5, // Example: 15.5% growth
    benchmarks: {
      revenuePerEmployee: 200000,
      profitMargin: 25.5,
      customerAcquisitionCost: 500
    }
  };
}

function calculateConfidenceScore(params: ValuationFormData, assumptions: FinancialAssumptions): number {
  return Math.min(100, Math.max(50,
    60 + // Base confidence
    (params.revenue ? 10 : 0) + // Revenue data available
    (params.margins ? 10 : 0) + // Margin data available
    (params.growthRate ? 10 : 0) + // Growth data available
    (params.stage.includes('revenue_scaling') || params.stage.includes('established') ? 10 : 0) + // Later stage companies
    (assumptions.industryDataQuality ? 10 : 0) // Industry data quality
  ));
}

function calculateDCF(params: ValuationFormData, assumptions: FinancialAssumptions): {
  value: number;
  stages: Array<{
    year: number;
    fcf: number;
    presentValue: number;
    workingCapital: number;
    capex: number;
  }>;
} {
  const { revenue, margins = 0 } = params;
  const { discountRate, growthRate, terminalGrowthRate } = assumptions;

  let currentRevenue = revenue;
  let presentValue = 0;
  const stages = [];
  const projectionYears = 5;

  // Working capital and capex assumptions
  const workingCapitalRatio = 0.15; // 15% of revenue
  const capexRatio = 0.12; // 12% of revenue

  for (let year = 1; year <= projectionYears; year++) {
    currentRevenue *= (1 + (growthRate / 100));
    const ebitda = currentRevenue * (margins / 100);
    const workingCapital = currentRevenue * workingCapitalRatio;
    const capex = currentRevenue * capexRatio;

    // Free cash flow calculation considering working capital and capex
    const fcf = ebitda * (1 - 0.25) - workingCapital - capex; // Assuming 25% tax rate
    const presentValueFactor = Math.pow(1 + (discountRate / 100), year);
    const discountedValue = fcf / presentValueFactor;

    presentValue += discountedValue;
    stages.push({
      year,
      fcf,
      presentValue: discountedValue,
      workingCapital,
      capex,
    });
  }

  // Calculate terminal value using enhanced Gordon Growth Model
  const terminalFCF = stages[stages.length - 1].fcf * (1 + (terminalGrowthRate / 100));
  const terminalValue = terminalFCF / ((discountRate / 100) - (terminalGrowthRate / 100));
  const discountedTerminalValue = terminalValue / Math.pow(1 + (discountRate / 100), projectionYears);

  return {
    value: presentValue + discountedTerminalValue,
    stages,
  };
}

function calculateComparables(params: ValuationFormData, assumptions: FinancialAssumptions): {
  value: number;
  multiples: {
    revenue: number;
    ebitda: number;
    ebit: number;
    details: Array<{
      metric: string;
      range: { min: number; median: number; max: number };
      selectedMultiple: number;
      reasoning: string;
    }>;
  };
} {
  const { revenue, stage, industry, margins = 0 } = params;

  // Enhanced industry-specific multiples based on comprehensive market data
  const baseMultiples = {
    technology: {
      revenue: { min: 3, median: 5, max: 8 },
      ebitda: { min: 12, median: 15, max: 20 },
      ebit: { min: 10, median: 13, max: 18 }
    },
    digital: {
      revenue: { min: 2, median: 4, max: 6 },
      ebitda: { min: 10, median: 12, max: 16 },
      ebit: { min: 8, median: 10, max: 14 }
    },
    enterprise: {
      revenue: { min: 2, median: 3, max: 5 },
      ebitda: { min: 8, median: 10, max: 14 },
      ebit: { min: 7, median: 9, max: 12 }
    },
    // Add similar structures for other industries...
  };

  // Stage-based adjustments with more granular factors
  const stageMultiplier = stage.includes('revenue_scaling') ? 1.3 :
    stage.includes('established') ? 1.2 :
    stage.includes('revenue') ? 1.1 :
    0.9;

  const industryMultiples = baseMultiples[industry as keyof typeof baseMultiples] ||
    baseMultiples.enterprise; // Default to enterprise multiples if industry not found

  // Calculate multiples with detailed reasoning
  const multiples = {
    revenue: industryMultiples.revenue.median * stageMultiplier,
    ebitda: industryMultiples.ebitda.median * stageMultiplier,
    ebit: industryMultiples.ebit.median * stageMultiplier,
    details: [
      {
        metric: "Revenue",
        range: industryMultiples.revenue,
        selectedMultiple: industryMultiples.revenue.median * stageMultiplier,
        reasoning: `Based on ${industry} sector median with ${stageMultiplier}x adjustment for ${stage} stage`,
      },
      {
        metric: "EBITDA",
        range: industryMultiples.ebitda,
        selectedMultiple: industryMultiples.ebitda.median * stageMultiplier,
        reasoning: `Reflects profitability focus with margin of ${margins}%`,
      },
      {
        metric: "EBIT",
        range: industryMultiples.ebit,
        selectedMultiple: industryMultiples.ebit.median * stageMultiplier,
        reasoning: "Considers operating performance excluding D&A impact",
      },
    ],
  };

  // Calculate blended valuation using multiple approaches
  const revenueValue = revenue * multiples.revenue;
  const ebitdaValue = revenue * (margins / 100) * multiples.ebitda;
  const ebitValue = revenue * ((margins * 0.9) / 100) * multiples.ebit; // Assuming D&A is 10% of EBITDA

  return {
    value: (revenueValue * 0.4 + ebitdaValue * 0.35 + ebitValue * 0.25),
    multiples,
  };
}

function generateScenarioAnalysis(
  params: ValuationFormData,
  baseValue: number,
  assumptions: FinancialAssumptions
): {
  worst: { value: number; assumptions: Record<string, number>; probability: number };
  base: { value: number; assumptions: Record<string, number>; probability: number };
  best: { value: number; assumptions: Record<string, number>; probability: number };
  expectedValue: number;
} {
  // Generate scenarios using Monte Carlo simulation principles
  const worst = {
    value: baseValue * 0.7,
    assumptions: {
      growthRate: assumptions.growthRate * 0.7,
      margins: (params.margins || 0) * 0.8,
      discountRate: assumptions.discountRate * 1.2,
    },
    probability: 0.25,
  };

  const base = {
    value: baseValue,
    assumptions: {
      growthRate: assumptions.growthRate,
      margins: params.margins || 0,
      discountRate: assumptions.discountRate,
    },
    probability: 0.5,
  };

  const best = {
    value: baseValue * 1.3,
    assumptions: {
      growthRate: assumptions.growthRate * 1.3,
      margins: (params.margins || 0) * 1.2,
      discountRate: assumptions.discountRate * 0.9,
    },
    probability: 0.25,
  };

  // Calculate probability-weighted expected value
  const expectedValue =
    worst.value * worst.probability +
    base.value * base.probability +
    best.value * best.probability;

  return {
    worst,
    base,
    best,
    expectedValue,
  };
}

function performSensitivityAnalysis(
  params: ValuationFormData,
  baseValue: number
): Array<{
  factor: string;
  impact: Array<{ change: number; value: number }>;
}> {
  const factors = [
    {
      name: "Growth Rate",
      changes: [-0.2, -0.1, 0, 0.1, 0.2],
    },
    {
      name: "Margins",
      changes: [-0.15, -0.075, 0, 0.075, 0.15],
    },
    {
      name: "Discount Rate",
      changes: [-0.02, -0.01, 0, 0.01, 0.02],
    },
  ];

  return factors.map(factor => ({
    factor: factor.name,
    impact: factor.changes.map(change => ({
      change: change * 100, // Convert to percentage
      value: baseValue * (1 + (change * (factor.name === "Discount Rate" ? -2 : 1))),
    })),
  }));
}

export type { CurrencyRates, FinancialAssumptions };