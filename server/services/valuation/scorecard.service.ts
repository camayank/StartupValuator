import { ScorecardInputs, ValuationResult } from './types';

/**
 * Scorecard Valuation Method
 * Compares the target startup against the average pre-money valuation of similar companies
 * in the region, adjusting for various qualitative factors
 */

const DEFAULT_WEIGHTS = {
  strengthOfTeam: 0.30,
  sizeOfOpportunity: 0.25,
  productTechnology: 0.15,
  competitiveEnvironment: 0.10,
  marketingChannels: 0.10,
  needForAdditionalFunding: 0.05,
  other: 0.05,
};

/**
 * Calculate scorecard-based valuation
 */
export async function calculateScorecardValuation(
  inputs: ScorecardInputs
): Promise<ValuationResult> {
  // Validation
  validateInputs(inputs);

  const weights = inputs.weights || DEFAULT_WEIGHTS;

  // Ensure weights sum to 1.0
  const weightSum = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (Math.abs(weightSum - 1.0) > 0.01) {
    throw new Error('Weights must sum to 1.0 (100%)');
  }

  // Calculate weighted adjustment factor
  let adjustmentFactor = 0;
  const factorBreakdown: Record<string, any> = {};

  for (const [factor, rating] of Object.entries(inputs.factors)) {
    const weight = weights[factor as keyof typeof weights];

    // Convert 0-10 rating to adjustment factor
    // 5 is average (0% adjustment), 10 is 2x (100% adjustment), 0 is 0x (-100% adjustment)
    const factorAdjustment = (rating / 5) - 1; // Range: -1 to +1
    const weightedContribution = factorAdjustment * weight;

    adjustmentFactor += weightedContribution;

    factorBreakdown[factor] = {
      rating,
      weight,
      factorAdjustment,
      weightedContribution,
      percentageContribution: weightedContribution * 100,
    };
  }

  // Calculate adjusted valuation
  const adjustedValuation = inputs.baselineValuation * (1 + adjustmentFactor);

  // Calculate confidence score
  const confidence = calculateConfidence(inputs, adjustmentFactor);

  // Generate insights
  const insights = generateInsights(inputs, factorBreakdown, adjustmentFactor);

  return {
    method: 'scorecard',
    equityValue: Math.max(0, adjustedValuation),
    breakdown: {
      baselineValuation: inputs.baselineValuation,
      adjustmentFactor,
      adjustmentPercentage: adjustmentFactor * 100,
      adjustedValuation,
      factorBreakdown,
      insights,
    },
    confidence,
  };
}

/**
 * Validate scorecard inputs
 */
function validateInputs(inputs: ScorecardInputs): void {
  if (inputs.baselineValuation <= 0) {
    throw new Error('Baseline valuation must be greater than 0');
  }

  // Validate all factor ratings are between 0 and 10
  for (const [factor, rating] of Object.entries(inputs.factors)) {
    if (rating < 0 || rating > 10) {
      throw new Error(`${factor} rating must be between 0 and 10`);
    }
  }

  // If custom weights provided, validate them
  if (inputs.weights) {
    for (const [factor, weight] of Object.entries(inputs.weights)) {
      if (weight < 0 || weight > 1) {
        throw new Error(`${factor} weight must be between 0 and 1`);
      }
    }
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  inputs: ScorecardInputs,
  adjustmentFactor: number
): number {
  let confidence = 75; // Base confidence for scorecard method

  // Reduce confidence if extreme adjustment (indicates outlier)
  if (Math.abs(adjustmentFactor) > 0.8) {
    confidence -= 20;
  } else if (Math.abs(adjustmentFactor) > 0.5) {
    confidence -= 10;
  }

  // Reduce confidence if baseline is unreliable (too low or too high)
  if (inputs.baselineValuation < 10000000) { // < ₹1 crore
    confidence -= 10;
  } else if (inputs.baselineValuation > 1000000000) { // > ₹100 crore
    confidence -= 10;
  }

  // Increase confidence if ratings are moderate (not extreme)
  const ratings = Object.values(inputs.factors);
  const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - averageRating, 2), 0) / ratings.length;

  if (variance < 2) {
    confidence += 10; // Low variance indicates consistent evaluation
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Generate insights based on factor analysis
 */
function generateInsights(
  inputs: ScorecardInputs,
  factorBreakdown: Record<string, any>,
  adjustmentFactor: number
): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallAssessment: string;
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze each factor
  for (const [factor, data] of Object.entries(factorBreakdown)) {
    if (data.rating >= 8) {
      strengths.push(`Strong ${formatFactorName(factor)}: Rated ${data.rating}/10`);
    } else if (data.rating <= 4) {
      weaknesses.push(`Weak ${formatFactorName(factor)}: Rated ${data.rating}/10`);
      recommendations.push(`Improve ${formatFactorName(factor)} to increase valuation`);
    }
  }

  // Team analysis
  if (inputs.factors.strengthOfTeam < 7) {
    recommendations.push(
      'Team Strengthening: Consider adding experienced co-founders or advisors. Team quality has the highest weight (30%) in this valuation.'
    );
  }

  // Market opportunity analysis
  if (inputs.factors.sizeOfOpportunity < 7) {
    recommendations.push(
      'Market Opportunity: Demonstrate larger addressable market through market research and TAM/SAM/SOM analysis. This factor carries 25% weight.'
    );
  }

  // Product/Technology analysis
  if (inputs.factors.productTechnology < 6) {
    recommendations.push(
      'Product Development: Strengthen your technology and product differentiation. Consider building unique IP or proprietary technology.'
    );
  }

  // Competitive environment
  if (inputs.factors.competitiveEnvironment < 5) {
    recommendations.push(
      'Competitive Positioning: Develop a stronger competitive moat. Highlight unique advantages over competitors.'
    );
  }

  // Marketing channels
  if (inputs.factors.marketingChannels < 6) {
    recommendations.push(
      'Go-to-Market Strategy: Establish clear, scalable customer acquisition channels. Demonstrate early traction.'
    );
  }

  // Overall assessment
  let overallAssessment = '';
  if (adjustmentFactor > 0.3) {
    overallAssessment = 'Your startup is valued significantly above the market average for your sector and stage. This indicates strong fundamentals across key success factors.';
  } else if (adjustmentFactor > 0) {
    overallAssessment = 'Your startup is valued above the market average, indicating solid execution on key success factors with room for improvement.';
  } else if (adjustmentFactor > -0.3) {
    overallAssessment = 'Your startup is valued slightly below market average. Focus on strengthening weak areas identified above to improve valuation.';
  } else {
    overallAssessment = 'Your startup is valued significantly below market average. Consider addressing critical weaknesses before approaching investors.';
  }

  return {
    strengths,
    weaknesses,
    recommendations,
    overallAssessment,
  };
}

/**
 * Format factor names for display
 */
function formatFactorName(factor: string): string {
  const nameMap: Record<string, string> = {
    strengthOfTeam: 'Team Strength',
    sizeOfOpportunity: 'Market Opportunity',
    productTechnology: 'Product/Technology',
    competitiveEnvironment: 'Competitive Position',
    marketingChannels: 'Marketing & Distribution',
    needForAdditionalFunding: 'Capital Efficiency',
    other: 'Other Factors',
  };
  return nameMap[factor] || factor;
}

/**
 * Calculate scenario analysis
 */
export async function calculateScorecardScenarios(
  inputs: ScorecardInputs
): Promise<{
  conservative: number;
  base: number;
  optimistic: number;
}> {
  // Base case
  const baseResult = await calculateScorecardValuation(inputs);

  // Conservative: Reduce all ratings by 15%
  const conservativeInputs: ScorecardInputs = {
    ...inputs,
    factors: {
      strengthOfTeam: Math.max(0, inputs.factors.strengthOfTeam * 0.85),
      sizeOfOpportunity: Math.max(0, inputs.factors.sizeOfOpportunity * 0.85),
      productTechnology: Math.max(0, inputs.factors.productTechnology * 0.85),
      competitiveEnvironment: Math.max(0, inputs.factors.competitiveEnvironment * 0.85),
      marketingChannels: Math.max(0, inputs.factors.marketingChannels * 0.85),
      needForAdditionalFunding: Math.max(0, inputs.factors.needForAdditionalFunding * 0.85),
      other: Math.max(0, inputs.factors.other * 0.85),
    },
  };
  const conservativeResult = await calculateScorecardValuation(conservativeInputs);

  // Optimistic: Increase all ratings by 15% (capped at 10)
  const optimisticInputs: ScorecardInputs = {
    ...inputs,
    factors: {
      strengthOfTeam: Math.min(10, inputs.factors.strengthOfTeam * 1.15),
      sizeOfOpportunity: Math.min(10, inputs.factors.sizeOfOpportunity * 1.15),
      productTechnology: Math.min(10, inputs.factors.productTechnology * 1.15),
      competitiveEnvironment: Math.min(10, inputs.factors.competitiveEnvironment * 1.15),
      marketingChannels: Math.min(10, inputs.factors.marketingChannels * 1.15),
      needForAdditionalFunding: Math.min(10, inputs.factors.needForAdditionalFunding * 1.15),
      other: Math.min(10, inputs.factors.other * 1.15),
    },
  };
  const optimisticResult = await calculateScorecardValuation(optimisticInputs);

  return {
    conservative: conservativeResult.equityValue,
    base: baseResult.equityValue,
    optimistic: optimisticResult.equityValue,
  };
}

/**
 * Get baseline valuation for Indian startup ecosystem
 * Based on sector and stage
 */
export function getIndianBaselineValuation(
  sector: string,
  stage: 'pre_seed' | 'seed' | 'series_a'
): number {
  const baselines: Record<string, Record<string, number>> = {
    fintech: {
      pre_seed: 25000000, // ₹2.5 crore
      seed: 60000000, // ₹6 crore
      series_a: 200000000, // ₹20 crore
    },
    healthtech: {
      pre_seed: 20000000,
      seed: 50000000,
      series_a: 150000000,
    },
    edtech: {
      pre_seed: 18000000,
      seed: 45000000,
      series_a: 130000000,
    },
    ecommerce: {
      pre_seed: 15000000,
      seed: 40000000,
      series_a: 120000000,
    },
    saas: {
      pre_seed: 22000000,
      seed: 55000000,
      series_a: 180000000,
    },
    default: {
      pre_seed: 20000000,
      seed: 50000000,
      series_a: 150000000,
    },
  };

  const sectorBaselines = baselines[sector.toLowerCase()] || baselines.default;
  return sectorBaselines[stage];
}
