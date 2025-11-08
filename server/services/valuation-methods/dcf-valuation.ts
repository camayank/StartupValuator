/**
 * DCF (Discounted Cash Flow) Valuation Method
 *
 * This service implements the DCF valuation methodology specifically tailored
 * for Indian startups across different sectors and stages.
 *
 * Key Components:
 * 1. Free Cash Flow (FCF) Projection (5 years)
 * 2. Terminal Value Calculation
 * 3. WACC (Weighted Average Cost of Capital)
 * 4. Present Value Discounting
 * 5. Equity Value Calculation
 */

import type { ValuationInput, ValuationResult, DCFAnalysis } from '../types/valuation-types';

/**
 * Indian Market Parameters by Sector
 */
const INDIAN_SECTOR_PARAMS = {
  saas: {
    discountRate: 0.18, // 18% for SaaS startups in India
    terminalGrowthRate: 0.04, // 4% perpetual growth
    typicalMargin: 0.70, // 70% gross margin
    riskPremium: 0.08, // 8% startup risk premium
  },
  enterprise: {
    discountRate: 0.16,
    terminalGrowthRate: 0.035,
    typicalMargin: 0.60,
    riskPremium: 0.07,
  },
  ecommerce: {
    discountRate: 0.20, // Higher risk for e-commerce
    terminalGrowthRate: 0.045,
    typicalMargin: 0.35,
    riskPremium: 0.10,
  },
  fintech: {
    discountRate: 0.17,
    terminalGrowthRate: 0.05,
    typicalMargin: 0.65,
    riskPremium: 0.08,
  },
  edtech: {
    discountRate: 0.19,
    terminalGrowthRate: 0.04,
    typicalMargin: 0.55,
    riskPremium: 0.09,
  },
  healthtech: {
    discountRate: 0.17,
    terminalGrowthRate: 0.045,
    typicalMargin: 0.50,
    riskPremium: 0.08,
  },
  d2c: {
    discountRate: 0.19,
    terminalGrowthRate: 0.04,
    typicalMargin: 0.40,
    riskPremium: 0.09,
  },
  default: {
    discountRate: 0.18,
    terminalGrowthRate: 0.04,
    typicalMargin: 0.50,
    riskPremium: 0.08,
  },
};

/**
 * Stage-based adjustments for Indian startups
 */
const STAGE_ADJUSTMENTS = {
  'pre-seed': { riskMultiplier: 1.5, confidenceDiscount: 0.30 },
  'seed': { riskMultiplier: 1.3, confidenceDiscount: 0.20 },
  'series-a': { riskMultiplier: 1.15, confidenceDiscount: 0.10 },
  'series-b': { riskMultiplier: 1.05, confidenceDiscount: 0.05 },
  'series-c': { riskMultiplier: 1.0, confidenceDiscount: 0.0 },
  'growth': { riskMultiplier: 0.95, confidenceDiscount: 0.0 },
  'default': { riskMultiplier: 1.2, confidenceDiscount: 0.15 },
};

/**
 * Calculate Free Cash Flow for a given year
 */
function calculateFCF(
  revenue: number,
  growthRate: number,
  margin: number,
  year: number
): number {
  const projectedRevenue = revenue * Math.pow(1 + growthRate, year);
  const ebitda = projectedRevenue * margin;

  // Assumptions for FCF calculation
  const taxRate = 0.25; // Indian corporate tax rate
  const capexPercent = 0.10; // CapEx as % of revenue
  const nwcPercent = 0.05; // Net Working Capital as % of revenue change

  const nopat = ebitda * (1 - taxRate); // Net Operating Profit After Tax
  const capex = projectedRevenue * capexPercent;
  const nwcChange = (projectedRevenue - (year > 0 ? revenue * Math.pow(1 + growthRate, year - 1) : revenue)) * nwcPercent;

  const fcf = nopat - capex - nwcChange;

  return Math.max(fcf, 0); // Ensure non-negative FCF
}

/**
 * Calculate WACC (Weighted Average Cost of Capital)
 */
function calculateWACC(
  sector: string,
  stage: string,
  hasDebt: boolean = false
): number {
  const sectorParams = INDIAN_SECTOR_PARAMS[sector.toLowerCase()] || INDIAN_SECTOR_PARAMS.default;
  const stageAdjustment = STAGE_ADJUSTMENTS[stage.toLowerCase()] || STAGE_ADJUSTMENTS.default;

  // Base discount rate
  let wacc = sectorParams.discountRate;

  // Adjust for stage risk
  wacc = wacc * stageAdjustment.riskMultiplier;

  // For startups, we typically assume 100% equity financing initially
  // If debt is present, WACC would be adjusted (but most Indian startups use equity)

  return wacc;
}

/**
 * Calculate Terminal Value using Gordon Growth Model
 */
function calculateTerminalValue(
  finalYearFCF: number,
  terminalGrowthRate: number,
  discountRate: number
): number {
  if (discountRate <= terminalGrowthRate) {
    // Fallback if discount rate is too low
    return finalYearFCF * 10; // Simple multiple approach
  }

  return (finalYearFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
}

/**
 * Main DCF Valuation Function
 */
export async function calculateDCFValuation(input: ValuationInput): Promise<DCFAnalysis> {
  const {
    revenue,
    growthRate,
    sector = 'default',
    stage = 'seed',
    burnRate = 0,
    runway = 0,
  } = input;

  // Get sector-specific parameters
  const sectorParams = INDIAN_SECTOR_PARAMS[sector.toLowerCase()] || INDIAN_SECTOR_PARAMS.default;
  const stageAdjustment = STAGE_ADJUSTMENTS[stage.toLowerCase()] || STAGE_ADJUSTMENTS.default;

  // Calculate WACC
  const wacc = calculateWACC(sector, stage);

  // Project Free Cash Flows for 5 years
  const projectionYears = 5;
  const fcfProjections: number[] = [];
  const revenueProjections: number[] = [];

  for (let year = 1; year <= projectionYears; year++) {
    const fcf = calculateFCF(revenue, growthRate, sectorParams.typicalMargin, year);
    fcfProjections.push(fcf);
    revenueProjections.push(revenue * Math.pow(1 + growthRate, year));
  }

  // Calculate Terminal Value
  const finalYearFCF = fcfProjections[projectionYears - 1];
  const terminalValue = calculateTerminalValue(
    finalYearFCF,
    sectorParams.terminalGrowthRate,
    wacc
  );

  // Discount all cash flows to present value
  const pvFactors: number[] = [];
  const discountedFCFs: number[] = [];
  let presentValueFCF = 0;

  for (let year = 1; year <= projectionYears; year++) {
    const pvFactor = 1 / Math.pow(1 + wacc, year);
    pvFactors.push(pvFactor);

    const discountedFCF = fcfProjections[year - 1] * pvFactor;
    discountedFCFs.push(discountedFCF);
    presentValueFCF += discountedFCF;
  }

  // Discount Terminal Value
  const pvTerminalValue = terminalValue / Math.pow(1 + wacc, projectionYears);

  // Calculate Enterprise Value
  const enterpriseValue = presentValueFCF + pvTerminalValue;

  // Calculate Equity Value (assuming minimal debt for startups)
  const debt = 0; // Most Indian startups have minimal debt
  const cash = Math.max(runway * burnRate, 0); // Estimated cash on hand

  const equityValue = enterpriseValue - debt + cash;

  // Apply stage-based confidence discount
  const adjustedValuation = equityValue * (1 - stageAdjustment.confidenceDiscount);

  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(input, fcfProjections, wacc);

  // Determine valuation range
  const conservativeValuation = adjustedValuation * 0.70;
  const aggressiveValuation = adjustedValuation * 1.30;

  return {
    valuation: Math.round(adjustedValuation),
    enterpriseValue: Math.round(enterpriseValue),
    equityValue: Math.round(equityValue),
    methodology: 'DCF',
    confidenceScore,
    assumptions: {
      wacc,
      terminalGrowthRate: sectorParams.terminalGrowthRate,
      projectionYears,
      grossMargin: sectorParams.typicalMargin,
      taxRate: 0.25,
    },
    projections: {
      fcf: fcfProjections.map(f => Math.round(f)),
      revenue: revenueProjections.map(r => Math.round(r)),
      discountFactors: pvFactors,
      discountedFCF: discountedFCFs.map(f => Math.round(f)),
    },
    terminalValue: Math.round(terminalValue),
    pvTerminalValue: Math.round(pvTerminalValue),
    presentValueFCF: Math.round(presentValueFCF),
    ranges: {
      conservative: Math.round(conservativeValuation),
      base: Math.round(adjustedValuation),
      aggressive: Math.round(aggressiveValuation),
    },
    insights: generateDCFInsights(input, adjustedValuation, wacc, fcfProjections),
  };
}

/**
 * Calculate confidence score for DCF valuation (0-100)
 */
function calculateConfidenceScore(
  input: ValuationInput,
  fcfProjections: number[],
  wacc: number
): number {
  let score = 70; // Base score for DCF methodology

  // Adjust for revenue stability
  if (input.revenue > 10000000) score += 10; // ₹1Cr+ revenue
  else if (input.revenue > 1000000) score += 5; // ₹10L+ revenue

  // Adjust for positive cash flows
  const positiveFCFYears = fcfProjections.filter(fcf => fcf > 0).length;
  score += (positiveFCFYears / fcfProjections.length) * 10;

  // Adjust for stage maturity
  const stage = input.stage?.toLowerCase() || 'seed';
  if (stage.includes('series-b') || stage.includes('series-c') || stage.includes('growth')) {
    score += 10;
  } else if (stage.includes('series-a')) {
    score += 5;
  }

  // Penalize for high burn rate without revenue
  if (input.burnRate && input.revenue < input.burnRate * 12) {
    score -= 15;
  }

  // Penalize for excessive WACC
  if (wacc > 0.25) score -= 10;

  return Math.min(Math.max(score, 30), 95); // Clamp between 30-95
}

/**
 * Generate actionable insights from DCF analysis
 */
function generateDCFInsights(
  input: ValuationInput,
  valuation: number,
  wacc: number,
  fcfProjections: number[]
): string[] {
  const insights: string[] = [];

  // Cash flow insights
  const positiveFCFYears = fcfProjections.filter(fcf => fcf > 0).length;
  if (positiveFCFYears < 3) {
    insights.push('⚠️ Limited positive cash flows projected - focus on achieving profitability milestones');
  } else {
    insights.push('✅ Strong cash flow generation projected in upcoming years');
  }

  // Growth insights
  if (input.growthRate > 1.0) { // 100%+ growth
    insights.push('🚀 Exceptional growth rate - ensure scalable infrastructure to support expansion');
  } else if (input.growthRate > 0.5) {
    insights.push('📈 Solid growth trajectory - maintain focus on sustainable scaling');
  } else {
    insights.push('⚠️ Growth rate below industry benchmarks - consider growth acceleration strategies');
  }

  // Risk insights
  if (wacc > 0.20) {
    insights.push('⚠️ High risk premium applied - reducing execution risk can significantly boost valuation');
  }

  // Stage-specific insights
  const stage = input.stage?.toLowerCase() || 'seed';
  if (stage.includes('pre-seed') || stage.includes('seed')) {
    insights.push('💡 Early stage - focus on achieving key product-market fit milestones');
  }

  // Runway insights
  if (input.runway && input.runway < 12) {
    insights.push('⚠️ Limited runway - consider fundraising timeline to avoid down-round');
  }

  return insights;
}

/**
 * Validate DCF input requirements
 */
export function validateDCFInput(input: ValuationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.revenue || input.revenue <= 0) {
    errors.push('Revenue must be greater than 0 for DCF valuation');
  }

  if (!input.growthRate || input.growthRate <= 0) {
    errors.push('Growth rate must be greater than 0');
  }

  if (input.growthRate > 5) {
    errors.push('Growth rate seems unrealistic (>500%) - please verify');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
