/**
 * Scorecard Valuation Method
 *
 * The Scorecard Method (also known as Bill Payne Method) compares the target startup
 * to other funded startups in the same region and stage, then applies adjustments
 * based on key success factors.
 *
 * Process:
 * 1. Start with average pre-money valuation for comparable startups
 * 2. Apply weighted adjustments across 7 factors
 * 3. Calculate final valuation
 *
 * Seven factors:
 * 1. Strength of Management Team (0-30%)
 * 2. Size of Opportunity (0-25%)
 * 3. Product/Technology (0-15%)
 * 4. Competitive Environment (0-10%)
 * 5. Marketing/Sales Channels (0-10%)
 * 6. Need for Additional Investment (0-5%)
 * 7. Misc factors (0-5%)
 */

import type { ValuationInput, ScorecardAnalysis } from '../types/valuation-types';

/**
 * Baseline pre-money valuations for Indian startups by stage and sector
 * Based on real market data from Indian startup funding rounds
 */
const INDIAN_BASELINE_VALUATIONS = {
  'pre-seed': {
    saas: 20000000,        // ₹2Cr
    fintech: 25000000,     // ₹2.5Cr
    enterprise: 18000000,  // ₹1.8Cr
    ecommerce: 15000000,   // ₹1.5Cr
    edtech: 18000000,      // ₹1.8Cr
    healthtech: 20000000,  // ₹2Cr
    d2c: 15000000,         // ₹1.5Cr
    default: 18000000,     // ₹1.8Cr
  },
  'seed': {
    saas: 60000000,        // ₹6Cr
    fintech: 75000000,     // ₹7.5Cr
    enterprise: 50000000,  // ₹5Cr
    ecommerce: 45000000,   // ₹4.5Cr
    edtech: 50000000,      // ₹5Cr
    healthtech: 60000000,  // ₹6Cr
    d2c: 40000000,         // ₹4Cr
    default: 50000000,     // ₹5Cr
  },
  'series-a': {
    saas: 250000000,       // ₹25Cr
    fintech: 300000000,    // ₹30Cr
    enterprise: 200000000, // ₹20Cr
    ecommerce: 180000000,  // ₹18Cr
    edtech: 200000000,     // ₹20Cr
    healthtech: 250000000, // ₹25Cr
    d2c: 150000000,        // ₹15Cr
    default: 200000000,    // ₹20Cr
  },
  'default': {
    saas: 50000000,
    fintech: 60000000,
    enterprise: 40000000,
    ecommerce: 35000000,
    edtech: 40000000,
    healthtech: 50000000,
    d2c: 35000000,
    default: 40000000,
  },
};

/**
 * Location-based baseline adjustments for India
 */
const LOCATION_ADJUSTMENTS = {
  'bangalore': 1.15,
  'bengaluru': 1.15,
  'mumbai': 1.12,
  'delhi': 1.10,
  'ncr': 1.10,
  'gurgaon': 1.10,
  'noida': 1.08,
  'hyderabad': 1.08,
  'pune': 1.05,
  'chennai': 1.02,
  'default': 1.0,
};

/**
 * Factor 1: Strength of Management Team (Weight: 30%)
 * Most important factor - great teams can pivot and execute
 */
function scoreManagementTeam(input: ValuationInput): number {
  let score = 50; // Start at neutral (50%)

  // Founder count and composition
  if (input.foundersCount) {
    if (input.foundersCount >= 2 && input.foundersCount <= 3) {
      score += 20; // Ideal founder count
    } else if (input.foundersCount >= 4) {
      score += 10; // Good but potentially complex
    } else {
      score -= 10; // Solo founder is riskier
    }
  }

  // Team size indicates execution capability
  if (input.employeeCount) {
    if (input.employeeCount >= 20) {
      score += 15;
    } else if (input.employeeCount >= 10) {
      score += 10;
    } else if (input.employeeCount >= 5) {
      score += 5;
    }
  }

  // Key hires show ability to attract talent
  if (input.hasKeyHires) {
    score += 15;
  }

  // Technical capabilities (patents as proxy)
  if (input.hasPatents) {
    score += 10;
  }

  return Math.max(20, Math.min(score, 130)); // Range: 20-130%
}

/**
 * Factor 2: Size of Opportunity (Weight: 25%)
 * Large, growing markets command higher valuations
 */
function sizeOfOpportunity(input: ValuationInput): number {
  let score = 50; // Neutral

  // Market size assessment
  if (input.marketSize) {
    if (input.marketSize >= 100000000000) { // ₹10,000Cr+
      score += 40;
    } else if (input.marketSize >= 50000000000) { // ₹5,000Cr+
      score += 30;
    } else if (input.marketSize >= 10000000000) { // ₹1,000Cr+
      score += 20;
    } else if (input.marketSize >= 1000000000) { // ₹100Cr+
      score += 10;
    }
  }

  // Growth rate indicates expanding market
  if (input.growthRate) {
    if (input.growthRate >= 1.0) { // 100%+ growth
      score += 20;
    } else if (input.growthRate >= 0.5) { // 50%+ growth
      score += 10;
    } else if (input.growthRate < 0.2) { // <20% growth
      score -= 10;
    }
  }

  // Market share
  if (input.marketShare) {
    if (input.marketShare >= 0.10) { // 10%+ market share
      score += 15;
    } else if (input.marketShare >= 0.05) { // 5%+ market share
      score += 10;
    }
  }

  return Math.max(30, Math.min(score, 140)); // Range: 30-140%
}

/**
 * Factor 3: Product/Technology (Weight: 15%)
 * Unique, defensible technology/product
 */
function productTechnology(input: ValuationInput): number {
  let score = 50; // Neutral

  // Product stage
  const stage = input.productStage?.toLowerCase() || '';
  if (stage.includes('launched') || stage.includes('production')) {
    score += 30;
  } else if (stage.includes('beta') || stage.includes('mvp')) {
    score += 20;
  } else if (stage.includes('alpha') || stage.includes('prototype')) {
    score += 10;
  } else if (stage.includes('idea')) {
    score -= 20;
  }

  // Product-market fit
  if (input.hasProductMarketFit) {
    score += 25;
  }

  // Patents indicate defensibility
  if (input.hasPatents) {
    score += 15;
  }

  // Customer traction validates product
  if (input.customerCount) {
    if (input.customerCount >= 100) {
      score += 20;
    } else if (input.customerCount >= 50) {
      score += 15;
    } else if (input.customerCount >= 10) {
      score += 10;
    }
  }

  // Low churn indicates product quality
  if (input.churnRate !== undefined) {
    if (input.churnRate < 0.05) { // <5% churn
      score += 10;
    } else if (input.churnRate > 0.15) { // >15% churn
      score -= 15;
    }
  }

  return Math.max(20, Math.min(score, 130)); // Range: 20-130%
}

/**
 * Factor 4: Competitive Environment (Weight: 10%)
 * Less competition or clear differentiation is better
 */
function competitiveEnvironment(input: ValuationInput): number {
  let score = 50; // Neutral

  // Competition level
  const competition = input.competitionLevel?.toLowerCase() || 'medium';
  if (competition === 'low' || competition === 'none') {
    score += 30;
  } else if (competition === 'medium' || competition === 'moderate') {
    score += 10;
  } else if (competition === 'high' || competition === 'intense') {
    score -= 20;
  }

  // Market share indicates competitive position
  if (input.marketShare) {
    if (input.marketShare >= 0.20) { // 20%+ share = market leader
      score += 25;
    } else if (input.marketShare >= 0.10) {
      score += 15;
    } else if (input.marketShare >= 0.05) {
      score += 10;
    }
  }

  // Patents provide competitive moat
  if (input.hasPatents) {
    score += 15;
  }

  // Unique business model
  if (input.businessModel && input.businessModel.length > 0) {
    score += 10;
  }

  return Math.max(30, Math.min(score, 120)); // Range: 30-120%
}

/**
 * Factor 5: Marketing/Sales Channels (Weight: 10%)
 * Clear go-to-market strategy and traction
 */
function marketingSalesChannels(input: ValuationInput): number {
  let score = 50; // Neutral

  // Traction indicates working GTM
  if (input.hasTraction) {
    score += 20;
  }

  // Customer count shows channel effectiveness
  if (input.customerCount) {
    if (input.customerCount >= 100) {
      score += 30;
    } else if (input.customerCount >= 50) {
      score += 20;
    } else if (input.customerCount >= 10) {
      score += 10;
    }
  }

  // Revenue validates sales channels
  if (input.revenue) {
    if (input.revenue >= 10000000) { // ₹1Cr+
      score += 25;
    } else if (input.revenue >= 5000000) { // ₹50L+
      score += 15;
    } else if (input.revenue >= 1000000) { // ₹10L+
      score += 10;
    }
  }

  // Business model clarity
  if (input.businessModel) {
    score += 10;
  }

  return Math.max(30, Math.min(score, 130)); // Range: 30-130%
}

/**
 * Factor 6: Need for Additional Investment (Weight: 5%)
 * Lower capital needs are better
 */
function needForAdditionalInvestment(input: ValuationInput): number {
  let score = 50; // Neutral

  // Runway assessment
  if (input.runway) {
    if (input.runway >= 24) { // 24+ months runway
      score += 30;
    } else if (input.runway >= 12) { // 12+ months
      score += 15;
    } else if (input.runway < 6) { // <6 months
      score -= 20;
    }
  }

  // Burn rate relative to revenue
  if (input.burnRate && input.revenue) {
    const burnToRevenue = input.burnRate * 12 / input.revenue;
    if (burnToRevenue < 0.5) { // Burn less than 50% of revenue
      score += 20;
    } else if (burnToRevenue > 2.0) { // Burn more than 2x revenue
      score -= 20;
    }
  }

  // Profitability is best
  if (input.hasProfitability) {
    score += 40;
  }

  // Revenue growth reduces need for funding
  if (input.revenue && input.growthRate && input.growthRate > 1.0) {
    score += 15;
  }

  return Math.max(30, Math.min(score, 130)); // Range: 30-130%
}

/**
 * Factor 7: Miscellaneous (Weight: 5%)
 * Other factors like DPIIT registration, location, etc.
 */
function miscellaneousFactors(input: ValuationInput): number {
  let score = 50; // Neutral

  // DPIIT registration (India-specific benefit)
  if (input.isDPIITRegistered) {
    score += 20;
  }

  // Tier 1 city location
  const location = input.location?.toLowerCase() || '';
  if (location.includes('bangalore') || location.includes('bengaluru') ||
      location.includes('mumbai') || location.includes('delhi')) {
    score += 15;
  }

  // Hot sectors in India
  const sector = input.sector?.toLowerCase() || '';
  if (sector === 'fintech' || sector === 'saas' || sector === 'healthtech') {
    score += 15;
  }

  return Math.max(40, Math.min(score, 120)); // Range: 40-120%
}

/**
 * Calculate Scorecard Method valuation
 */
export async function calculateScorecardValuation(input: ValuationInput): Promise<ScorecardAnalysis> {
  const stage = input.stage?.toLowerCase() || 'default';
  const sector = input.sector?.toLowerCase() || 'default';
  const location = input.location?.toLowerCase() || 'default';

  // Get baseline valuation
  const stageKey = stage as keyof typeof INDIAN_BASELINE_VALUATIONS;
  const sectorKey = sector as keyof typeof INDIAN_BASELINE_VALUATIONS.default;
  let baselineValuation = INDIAN_BASELINE_VALUATIONS[stageKey]?.[sectorKey] ||
    INDIAN_BASELINE_VALUATIONS.default[sectorKey] ||
    INDIAN_BASELINE_VALUATIONS.default.default;

  // Apply location adjustment to baseline
  const locationKey = location as keyof typeof LOCATION_ADJUSTMENTS;
  const locationAdjustment = LOCATION_ADJUSTMENTS[locationKey] || LOCATION_ADJUSTMENTS.default;
  baselineValuation = baselineValuation * locationAdjustment;

  // Calculate scores for each factor
  const managementScore = scoreManagementTeam(input);
  const opportunityScore = sizeOfOpportunity(input);
  const productScore = productTechnology(input);
  const competitiveScore = competitiveEnvironment(input);
  const marketingScore = marketingSalesChannels(input);
  const fundingScore = needForAdditionalInvestment(input);
  const miscScore = miscellaneousFactors(input);

  // Factor weights (sum to 100%)
  const weights = {
    management: 0.30,
    opportunity: 0.25,
    product: 0.15,
    competitive: 0.10,
    marketing: 0.10,
    funding: 0.05,
    misc: 0.05,
  };

  // Calculate weighted adjustment
  const weightedAdjustment =
    (managementScore / 100 - 1) * weights.management +
    (opportunityScore / 100 - 1) * weights.opportunity +
    (productScore / 100 - 1) * weights.product +
    (competitiveScore / 100 - 1) * weights.competitive +
    (marketingScore / 100 - 1) * weights.marketing +
    (fundingScore / 100 - 1) * weights.funding +
    (miscScore / 100 - 1) * weights.misc;

  // Apply adjustment to baseline
  const finalValuation = baselineValuation * (1 + weightedAdjustment);

  // Calculate confidence score
  const confidenceScore = calculateScorecardConfidence(input, weightedAdjustment);

  // Generate insights
  const insights = generateScorecardInsights(input, {
    management: managementScore,
    opportunity: opportunityScore,
    product: productScore,
    competitive: competitiveScore,
    marketing: marketingScore,
    funding: fundingScore,
    misc: miscScore,
  });

  // Calculate ranges
  const conservativeValuation = finalValuation * 0.75;
  const aggressiveValuation = finalValuation * 1.25;

  return {
    valuation: Math.round(finalValuation),
    methodology: 'Scorecard',
    confidenceScore,
    baselineValuation: Math.round(baselineValuation),
    factors: {
      management: {
        score: managementScore,
        weight: weights.management,
        adjustment: (managementScore / 100 - 1) * weights.management,
      },
      opportunity: {
        score: opportunityScore,
        weight: weights.opportunity,
        adjustment: (opportunityScore / 100 - 1) * weights.opportunity,
      },
      product: {
        score: productScore,
        weight: weights.product,
        adjustment: (productScore / 100 - 1) * weights.product,
      },
      competitive: {
        score: competitiveScore,
        weight: weights.competitive,
        adjustment: (competitiveScore / 100 - 1) * weights.competitive,
      },
      marketing: {
        score: marketingScore,
        weight: weights.marketing,
        adjustment: (marketingScore / 100 - 1) * weights.marketing,
      },
      funding: {
        score: fundingScore,
        weight: weights.funding,
        adjustment: (fundingScore / 100 - 1) * weights.funding,
      },
      misc: {
        score: miscScore,
        weight: weights.misc,
        adjustment: (miscScore / 100 - 1) * weights.misc,
      },
    },
    totalAdjustment: weightedAdjustment,
    ranges: {
      conservative: Math.round(conservativeValuation),
      base: Math.round(finalValuation),
      aggressive: Math.round(aggressiveValuation),
    },
    insights,
  };
}

/**
 * Calculate confidence score
 */
function calculateScorecardConfidence(input: ValuationInput, adjustment: number): number {
  let score = 70; // Base score

  // Higher confidence if we have more data points
  let dataPoints = 0;
  if (input.foundersCount) dataPoints++;
  if (input.employeeCount) dataPoints++;
  if (input.marketSize) dataPoints++;
  if (input.revenue !== undefined) dataPoints++;
  if (input.customerCount) dataPoints++;
  if (input.productStage) dataPoints++;
  if (input.competitionLevel) dataPoints++;

  score += (dataPoints / 7) * 15; // Up to +15 for complete data

  // Adjustment magnitude indicates uncertainty
  const adjustmentMagnitude = Math.abs(adjustment);
  if (adjustmentMagnitude > 0.5) { // >50% adjustment
    score -= 10;
  }

  // Stage-based confidence
  const stage = input.stage?.toLowerCase() || '';
  if (stage.includes('series-a') || stage.includes('series-b')) {
    score += 10;
  } else if (stage.includes('pre-seed')) {
    score -= 5;
  }

  return Math.min(Math.max(score, 50), 90); // Clamp 50-90
}

/**
 * Generate insights
 */
function generateScorecardInsights(
  input: ValuationInput,
  scores: {
    management: number;
    opportunity: number;
    product: number;
    competitive: number;
    marketing: number;
    funding: number;
    misc: number;
  }
): string[] {
  const insights: string[] = [];

  // Find strongest and weakest factors
  const factors = [
    { name: 'Management Team', score: scores.management },
    { name: 'Market Opportunity', score: scores.opportunity },
    { name: 'Product/Technology', score: scores.product },
    { name: 'Competitive Position', score: scores.competitive },
    { name: 'Marketing/Sales', score: scores.marketing },
  ];

  const sorted = factors.sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  if (strongest.score > 100) {
    insights.push(`✅ Strength: ${strongest.name} scores ${Math.round(strongest.score)}% - a key competitive advantage`);
  }

  if (weakest.score < 70) {
    insights.push(`⚠️ Improvement area: ${weakest.name} scores ${Math.round(weakest.score)}% - focus here to boost valuation`);
  }

  // Specific recommendations
  if (scores.management < 70 && (!input.foundersCount || input.foundersCount < 2)) {
    insights.push('👥 Consider: Adding co-founders or senior hires to strengthen team score');
  }

  if (scores.opportunity > 110 && scores.marketing < 80) {
    insights.push('🚀 Opportunity: Large market identified but sales execution needs improvement');
  }

  if (scores.product < 70) {
    insights.push('🔧 Priority: Enhance product development and achieve product-market fit');
  }

  if (scores.funding < 60) {
    insights.push('💰 Runway concern: Consider fundraising timeline or path to profitability');
  }

  return insights;
}

/**
 * Validate Scorecard input
 */
export function validateScorecardInput(input: ValuationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Scorecard works best with some data points
  const hasMinimumData =
    input.foundersCount ||
    input.employeeCount ||
    input.marketSize ||
    input.customerCount ||
    input.productStage ||
    input.revenue !== undefined;

  if (!hasMinimumData) {
    errors.push('Scorecard method requires at least some company data (team size, market, customers, or product stage)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
