/**
 * Venture Capital (VC) Method Valuation
 *
 * The VC Method calculates valuation based on:
 * 1. Expected exit value (acquisition or IPO)
 * 2. Years to exit
 * 3. Target return on investment (ROI)
 * 4. Required ownership percentage
 *
 * Formula:
 * - Post-money valuation = Expected exit value / Expected ROI multiple
 * - Pre-money valuation = Post-money valuation - Investment amount
 * - Required ownership % = Investment / Post-money valuation
 *
 * This method is commonly used by VCs to determine appropriate ownership
 * for their investment amount.
 */

import type { ValuationInput, VCAnalysis } from '../types/valuation-types';

/**
 * Expected exit multiples by sector for Indian startups
 * Based on recent exits and IPOs in India
 */
const INDIAN_EXIT_MULTIPLES = {
  saas: {
    'series-a': 8.0,   // Revenue multiple at exit
    'series-b': 6.0,
    'series-c': 5.0,
    default: 7.0,
  },
  fintech: {
    'series-a': 10.0,
    'series-b': 8.0,
    'series-c': 6.0,
    default: 8.0,
  },
  enterprise: {
    'series-a': 6.0,
    'series-b': 5.0,
    'series-c': 4.0,
    default: 5.0,
  },
  ecommerce: {
    'series-a': 2.5,
    'series-b': 2.0,
    'series-c': 1.8,
    default: 2.0,
  },
  edtech: {
    'series-a': 5.0,
    'series-b': 4.0,
    'series-c': 3.5,
    default: 4.0,
  },
  healthtech: {
    'series-a': 7.0,
    'series-b': 6.0,
    'series-c': 5.0,
    default: 6.0,
  },
  d2c: {
    'series-a': 3.0,
    'series-b': 2.5,
    'series-c': 2.0,
    default: 2.5,
  },
  default: {
    'series-a': 6.0,
    'series-b': 5.0,
    'series-c': 4.0,
    default: 5.0,
  },
};

/**
 * Expected years to exit by stage
 */
const YEARS_TO_EXIT = {
  'pre-seed': 7,
  'seed': 6,
  'series-a': 5,
  'series-b': 4,
  'series-c': 3,
  'growth': 2,
  default: 5,
};

/**
 * Target ROI multiples by stage (what VCs expect)
 */
const TARGET_ROI_MULTIPLES = {
  'pre-seed': 30,    // 30x return expected
  'seed': 20,        // 20x return expected
  'series-a': 10,    // 10x return expected
  'series-b': 5,     // 5x return expected
  'series-c': 3,     // 3x return expected
  'growth': 2,       // 2x return expected
  default: 10,
};

/**
 * Estimate future revenue at exit
 */
function estimateFutureRevenue(
  currentRevenue: number,
  growthRate: number,
  yearsToExit: number
): number {
  // Project revenue forward using compound growth
  // Assume growth rate declines over time (conservative)
  let futureRevenue = currentRevenue;

  for (let year = 1; year <= yearsToExit; year++) {
    // Growth rate declines by 15% each year
    const yearGrowthRate = growthRate * Math.pow(0.85, year - 1);
    futureRevenue *= (1 + Math.min(yearGrowthRate, 2.0)); // Cap at 200% per year
  }

  return futureRevenue;
}

/**
 * Calculate expected exit value
 */
function calculateExitValue(
  input: ValuationInput,
  exitMultiple: number,
  yearsToExit: number
): number {
  // If no revenue yet, use market size as proxy
  if (!input.revenue || input.revenue === 0) {
    // For pre-revenue, assume they'll capture 1-5% of market by exit
    const marketCaptureRate = input.hasProductMarketFit ? 0.05 : 0.02;
    const futureMarketSize = input.marketSize || 1000000000; // Default ₹100Cr market
    const exitRevenue = futureMarketSize * marketCaptureRate;
    return exitRevenue * exitMultiple;
  }

  // Project current revenue to exit
  const futureRevenue = estimateFutureRevenue(
    input.revenue,
    input.growthRate || 0.5,
    yearsToExit
  );

  return futureRevenue * exitMultiple;
}

/**
 * Calculate dilution adjustment
 * Accounts for dilution from future funding rounds
 */
function calculateDilutionFactor(stage: string, yearsToExit: number): number {
  // Estimate future funding rounds needed
  let futureRounds = 0;

  if (stage === 'pre-seed') {
    futureRounds = Math.min(Math.floor(yearsToExit / 1.5), 4); // Up to 4 rounds
  } else if (stage === 'seed') {
    futureRounds = Math.min(Math.floor(yearsToExit / 1.5), 3); // Up to 3 rounds
  } else if (stage === 'series-a') {
    futureRounds = Math.min(Math.floor(yearsToExit / 2), 2); // Up to 2 rounds
  } else if (stage === 'series-b') {
    futureRounds = 1; // 1 more round likely
  } else {
    futureRounds = 0;
  }

  // Each round typically dilutes by 20-25%
  const dilutionPerRound = 0.22;
  const totalDilution = 1 - Math.pow(1 - dilutionPerRound, futureRounds);

  return 1 / (1 - totalDilution); // Adjustment factor
}

/**
 * Calculate VC Method valuation
 */
export async function calculateVCValuation(input: ValuationInput): Promise<VCAnalysis> {
  const sector = input.sector?.toLowerCase() || 'default';
  const stage = input.stage?.toLowerCase() || 'default';

  // Get exit multiple for this sector and stage
  const exitMultiple = INDIAN_EXIT_MULTIPLES[sector]?.[stage] ||
    INDIAN_EXIT_MULTIPLES[sector]?.default ||
    INDIAN_EXIT_MULTIPLES.default.default;

  // Get years to exit
  const yearsToExit = YEARS_TO_EXIT[stage] || YEARS_TO_EXIT.default;

  // Get target ROI multiple
  const targetROI = TARGET_ROI_MULTIPLES[stage] || TARGET_ROI_MULTIPLES.default;

  // Calculate expected exit value
  const expectedExit = calculateExitValue(input, exitMultiple, yearsToExit);

  // Calculate post-money valuation
  // Post-money = Exit value / Target ROI
  let postMoneyValuation = expectedExit / targetROI;

  // Apply dilution adjustment
  const dilutionFactor = calculateDilutionFactor(stage, yearsToExit);
  postMoneyValuation = postMoneyValuation / dilutionFactor;

  // For VC method, we need an investment amount to calculate pre-money
  // If not provided, assume typical round sizes for Indian startups
  const typicalInvestmentSizes = {
    'pre-seed': 15000000,    // ₹1.5Cr
    'seed': 50000000,        // ₹5Cr
    'series-a': 150000000,   // ₹15Cr
    'series-b': 400000000,   // ₹40Cr
    'series-c': 800000000,   // ₹80Cr
    default: 100000000,      // ₹10Cr
  };

  const investmentAmount = typicalInvestmentSizes[stage] || typicalInvestmentSizes.default;

  // Pre-money = Post-money - Investment
  const preMoneyValuation = postMoneyValuation - investmentAmount;

  // Required ownership = Investment / Post-money
  const requiredOwnership = investmentAmount / postMoneyValuation;

  // Calculate confidence score
  const confidenceScore = calculateVCConfidence(input, stage, expectedExit);

  // Generate insights
  const insights = generateVCInsights(input, {
    exitValue: expectedExit,
    yearsToExit,
    targetROI,
    requiredOwnership,
    postMoney: postMoneyValuation,
  });

  // Calculate ranges
  // Conservative: Higher ROI requirement (lower valuation)
  const conservativeValuation = expectedExit / (targetROI * 1.3);
  // Aggressive: Lower ROI requirement (higher valuation)
  const aggressiveValuation = expectedExit / (targetROI * 0.7);

  return {
    valuation: Math.round(preMoneyValuation),
    methodology: 'VC Method',
    confidenceScore,
    expectedExit: Math.round(expectedExit),
    expectedExitMultiple: exitMultiple,
    yearsToExit,
    targetROI,
    requiredOwnership: Math.round(requiredOwnership * 10000) / 100, // Convert to percentage
    postMoneyValuation: Math.round(postMoneyValuation),
    preMoneyValuation: Math.round(preMoneyValuation),
    ranges: {
      conservative: Math.round(conservativeValuation - investmentAmount),
      base: Math.round(preMoneyValuation),
      aggressive: Math.round(aggressiveValuation - investmentAmount),
    },
    insights,
  };
}

/**
 * Calculate confidence score for VC method
 */
function calculateVCConfidence(
  input: ValuationInput,
  stage: string,
  expectedExit: number
): number {
  let score = 65; // Base score

  // Higher confidence for revenue-stage companies
  if (input.revenue) {
    if (input.revenue > 50000000) { // ₹5Cr+
      score += 15;
    } else if (input.revenue > 10000000) { // ₹1Cr+
      score += 10;
    } else if (input.revenue > 1000000) { // ₹10L+
      score += 5;
    }
  } else {
    // Pre-revenue has lower confidence
    score -= 10;
  }

  // Strong growth increases confidence
  if (input.growthRate && input.growthRate > 1.0) {
    score += 10;
  }

  // Later stages have more data points
  if (stage.includes('series-b') || stage.includes('series-c')) {
    score += 10;
  } else if (stage.includes('pre-seed')) {
    score -= 10;
  }

  // Market size validation
  if (input.marketSize && input.marketSize > 10000000000) { // ₹1000Cr+ market
    score += 5;
  }

  // Product-market fit
  if (input.hasProductMarketFit) {
    score += 10;
  }

  // Realistic exit value check
  if (expectedExit < 100000000) { // Less than ₹10Cr exit seems small
    score -= 10;
  }

  return Math.min(Math.max(score, 40), 85); // Clamp 40-85
}

/**
 * Generate actionable insights
 */
function generateVCInsights(
  input: ValuationInput,
  analysis: {
    exitValue: number;
    yearsToExit: number;
    targetROI: number;
    requiredOwnership: number;
    postMoney: number;
  }
): string[] {
  const insights: string[] = [];

  // Exit value insights
  const exitInCr = analysis.exitValue / 10000000;
  insights.push(`🎯 Projected exit value: ₹${exitInCr.toFixed(0)}Cr in ${analysis.yearsToExit} years`);

  // Ownership insights
  if (analysis.requiredOwnership > 0.3) { // >30%
    insights.push(`⚠️ VCs would require ${(analysis.requiredOwnership * 100).toFixed(1)}% ownership - significant dilution expected`);
  } else if (analysis.requiredOwnership > 0.2) { // >20%
    insights.push(`💡 VCs would require ${(analysis.requiredOwnership * 100).toFixed(1)}% ownership - moderate dilution`);
  } else {
    insights.push(`✅ VCs would require ${(analysis.requiredOwnership * 100).toFixed(1)}% ownership - favorable dilution`);
  }

  // Growth insights
  if (input.revenue && input.revenue > 0) {
    const revenueToExit = input.revenue * Math.pow(1 + (input.growthRate || 0.5), analysis.yearsToExit);
    const cagr = Math.pow(revenueToExit / input.revenue, 1 / analysis.yearsToExit) - 1;
    insights.push(`📈 Required ${(cagr * 100).toFixed(0)}% CAGR to reach exit revenue target`);
  } else {
    insights.push(`🚀 Need to achieve revenue milestones to de-risk exit assumptions`);
  }

  // ROI insights
  insights.push(`💰 Investors expect ${analysis.targetROI}x return - ensure growth trajectory supports this`);

  // Timing insights
  if (analysis.yearsToExit <= 3) {
    insights.push(`⏰ Short ${analysis.yearsToExit}-year exit timeline - need rapid execution`);
  } else if (analysis.yearsToExit >= 6) {
    insights.push(`⏰ ${analysis.yearsToExit}-year timeline provides runway but requires patience from investors`);
  }

  // Future funding insights
  const stage = input.stage?.toLowerCase() || 'default';
  if (stage === 'pre-seed' || stage === 'seed') {
    insights.push(`📊 Multiple funding rounds anticipated - plan for dilution management`);
  }

  return insights;
}

/**
 * Validate VC method input
 */
export function validateVCInput(input: ValuationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // VC method works best with revenue or clear market size
  if ((!input.revenue || input.revenue === 0) && !input.marketSize) {
    errors.push('VC method requires either revenue or market size data to project exit value');
  }

  // Need growth rate for projections
  if (input.revenue && input.revenue > 0 && !input.growthRate) {
    errors.push('Growth rate is required for revenue projections');
  }

  // Warn if growth rate seems unrealistic
  if (input.growthRate && input.growthRate > 5) {
    errors.push('Growth rate >500% seems unrealistic - please verify');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
