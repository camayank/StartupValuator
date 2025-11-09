/**
 * Berkus Method Valuation
 *
 * The Berkus Method is specifically designed for pre-revenue startups.
 * It assigns value based on five key success factors, each worth up to
 * a maximum amount.
 *
 * The five factors are:
 * 1. Sound Idea (Basic Value) - Does the idea reduce risk?
 * 2. Prototype (Technology Risk) - Does a working prototype exist?
 * 3. Quality Management Team (Execution Risk) - Is the team capable?
 * 4. Strategic Relationships (Market Risk) - Are partnerships in place?
 * 5. Product Rollout/Sales (Production Risk) - Has product launched or generated sales?
 *
 * For Indian startups, we've adapted the maximum values to reflect the Indian market.
 */

import type { ValuationInput, BerkusAnalysis } from '../types/valuation-types';

/**
 * Maximum values per factor for Indian startups (in INR)
 * Traditional Berkus uses $500K per factor ($2.5M max)
 * We've adapted this for Indian market conditions
 */
const BERKUS_MAX_VALUES_INDIA = {
  'pre-seed': {
    soundIdea: 2000000,          // ₹20L for sound idea
    prototype: 3000000,           // ₹30L for working prototype
    qualityManagement: 4000000,   // ₹40L for quality team
    strategicRelationships: 3000000, // ₹30L for partnerships
    productRollout: 3000000,      // ₹30L for early traction
    maxTotal: 15000000,           // ₹1.5Cr maximum
  },
  'seed': {
    soundIdea: 5000000,           // ₹50L
    prototype: 7500000,           // ₹75L
    qualityManagement: 10000000,  // ₹1Cr
    strategicRelationships: 7500000, // ₹75L
    productRollout: 10000000,     // ₹1Cr
    maxTotal: 40000000,           // ₹4Cr maximum
  },
  'default': {
    soundIdea: 3000000,           // ₹30L
    prototype: 5000000,           // ₹50L
    qualityManagement: 7000000,   // ₹70L
    strategicRelationships: 5000000, // ₹50L
    productRollout: 5000000,      // ₹50L
    maxTotal: 25000000,           // ₹2.5Cr maximum
  },
};

/**
 * Sector adjustments for Indian market
 */
const SECTOR_MULTIPLIERS = {
  'saas': 1.2,        // SaaS has higher multiples in India
  'fintech': 1.3,     // Fintech highly valued
  'enterprise': 1.1,
  'healthtech': 1.15,
  'edtech': 1.1,
  'ecommerce': 0.9,   // E-commerce has lower multiples
  'd2c': 0.85,
  'default': 1.0,
};

/**
 * Location-based adjustments for India
 */
const LOCATION_MULTIPLIERS = {
  'bangalore': 1.15,
  'bengaluru': 1.15,
  'mumbai': 1.1,
  'delhi': 1.1,
  'ncr': 1.1,
  'gurgaon': 1.1,
  'noida': 1.05,
  'hyderabad': 1.05,
  'pune': 1.05,
  'chennai': 1.0,
  'default': 1.0,
};

/**
 * Score the "Sound Idea" factor
 */
function scoreSoundIdea(input: ValuationInput, maxValue: number): number {
  let score = 0.3; // Base score

  // Does it solve a clear problem?
  if (input.marketSize && input.marketSize > 1000000000) { // ₹100Cr+ market
    score += 0.2;
  }

  // Is there market validation?
  if (input.hasProductMarketFit) {
    score += 0.3;
  } else if (input.customerCount && input.customerCount > 10) {
    score += 0.15;
  }

  // DPIIT registration shows seriousness
  if (input.isDPIITRegistered) {
    score += 0.1;
  }

  // Competition level indicates market viability
  if (input.competitionLevel === 'low' || input.competitionLevel === 'medium') {
    score += 0.1;
  }

  return Math.min(score, 1.0) * maxValue;
}

/**
 * Score the "Prototype" factor
 */
function scorePrototype(input: ValuationInput, maxValue: number): number {
  let score = 0;

  const stage = input.productStage?.toLowerCase() || '';

  if (stage.includes('launched') || stage.includes('production')) {
    score = 1.0; // Full points for launched product
  } else if (stage.includes('beta') || stage.includes('mvp')) {
    score = 0.8; // High score for working MVP
  } else if (stage.includes('alpha') || stage.includes('prototype')) {
    score = 0.5; // Medium score for prototype
  } else if (stage.includes('design') || stage.includes('development')) {
    score = 0.3; // Lower score for in-development
  } else if (stage.includes('idea') || stage.includes('concept')) {
    score = 0.1; // Minimal points for just idea
  } else {
    score = 0.4; // Default moderate score
  }

  // Bonus for having customers (proves prototype works)
  if (input.customerCount && input.customerCount > 0) {
    score = Math.min(score + 0.2, 1.0);
  }

  // Bonus for patents (shows technical innovation)
  if (input.hasPatents) {
    score = Math.min(score + 0.1, 1.0);
  }

  return score * maxValue;
}

/**
 * Score the "Quality Management Team" factor
 */
function scoreQualityManagement(input: ValuationInput, maxValue: number): number {
  let score = 0.3; // Base score

  // Multiple founders is positive
  if (input.foundersCount && input.foundersCount >= 2) {
    score += 0.2;
  } else if (input.foundersCount && input.foundersCount >= 3) {
    score += 0.3; // 3+ founders even better
  }

  // Team size indicates execution capability
  if (input.employeeCount) {
    if (input.employeeCount >= 20) {
      score += 0.3;
    } else if (input.employeeCount >= 10) {
      score += 0.2;
    } else if (input.employeeCount >= 5) {
      score += 0.15;
    } else if (input.employeeCount >= 2) {
      score += 0.1;
    }
  }

  // Key hires show ability to attract talent
  if (input.hasKeyHires) {
    score += 0.2;
  }

  return Math.min(score, 1.0) * maxValue;
}

/**
 * Score the "Strategic Relationships" factor
 */
function scoreStrategicRelationships(input: ValuationInput, maxValue: number): number {
  let score = 0.2; // Base score

  // Customer count shows market relationships
  if (input.customerCount) {
    if (input.customerCount >= 100) {
      score += 0.4;
    } else if (input.customerCount >= 50) {
      score += 0.3;
    } else if (input.customerCount >= 10) {
      score += 0.2;
    } else if (input.customerCount >= 5) {
      score += 0.1;
    }
  }

  // Market share indicates strong positioning
  if (input.marketShare && input.marketShare > 0.05) { // >5% market share
    score += 0.2;
  }

  // Business model clarity shows strategic thinking
  if (input.businessModel && input.businessModel.length > 0) {
    score += 0.1;
  }

  // Having traction shows relationship building
  if (input.hasTraction) {
    score += 0.1;
  }

  return Math.min(score, 1.0) * maxValue;
}

/**
 * Score the "Product Rollout/Sales" factor
 */
function scoreProductRollout(input: ValuationInput, maxValue: number): number {
  let score = 0;

  // Revenue is the strongest signal
  if (input.revenue && input.revenue > 0) {
    if (input.revenue >= 10000000) { // ₹1Cr+
      score = 1.0;
    } else if (input.revenue >= 5000000) { // ₹50L+
      score = 0.8;
    } else if (input.revenue >= 1000000) { // ₹10L+
      score = 0.6;
    } else if (input.revenue >= 100000) { // ₹1L+
      score = 0.4;
    } else {
      score = 0.2;
    }
  } else {
    // No revenue - check other traction signals
    if (input.hasTraction) {
      score = 0.3;
    }

    if (input.customerCount && input.customerCount > 0) {
      score = Math.max(score, 0.25);
    }

    // Product launched but no revenue yet
    const stage = input.productStage?.toLowerCase() || '';
    if (stage.includes('launched') || stage.includes('production')) {
      score = Math.max(score, 0.2);
    }
  }

  // Low churn rate is very positive
  if (input.churnRate && input.churnRate < 0.05) { // <5% churn
    score = Math.min(score + 0.15, 1.0);
  }

  return score * maxValue;
}

/**
 * Calculate Berkus Method valuation
 */
export async function calculateBerkusValuation(input: ValuationInput): Promise<BerkusAnalysis> {
  const stage = input.stage?.toLowerCase() || 'default';
  const sector = input.sector?.toLowerCase() || 'default';
  const location = input.location?.toLowerCase() || 'default';

  // Get max values for this stage
  const stageKey = stage as keyof typeof BERKUS_MAX_VALUES_INDIA;
  let maxValues = BERKUS_MAX_VALUES_INDIA[stageKey] || BERKUS_MAX_VALUES_INDIA.default;

  // Calculate score for each factor
  const soundIdeaValue = scoreSoundIdea(input, maxValues.soundIdea);
  const prototypeValue = scorePrototype(input, maxValues.prototype);
  const qualityManagementValue = scoreQualityManagement(input, maxValues.qualityManagement);
  const strategicRelationshipsValue = scoreStrategicRelationships(input, maxValues.strategicRelationships);
  const productRolloutValue = scoreProductRollout(input, maxValues.productRollout);

  // Sum up all factors
  let totalValue = soundIdeaValue + prototypeValue + qualityManagementValue +
    strategicRelationshipsValue + productRolloutValue;

  // Apply sector multiplier
  const sectorKey = sector as keyof typeof SECTOR_MULTIPLIERS;
  const sectorMultiplier = SECTOR_MULTIPLIERS[sectorKey] || SECTOR_MULTIPLIERS.default;
  totalValue = totalValue * sectorMultiplier;

  // Apply location multiplier
  const locationKey = location as keyof typeof LOCATION_MULTIPLIERS;
  const locationMultiplier = LOCATION_MULTIPLIERS[locationKey] || LOCATION_MULTIPLIERS.default;
  totalValue = totalValue * locationMultiplier;

  // Ensure we don't exceed max total
  const maxTotal = maxValues.maxTotal * sectorMultiplier * locationMultiplier;
  totalValue = Math.min(totalValue, maxTotal);

  // Calculate confidence score
  const confidenceScore = calculateBerkusConfidence(input, totalValue, maxTotal);

  // Generate insights
  const insights = generateBerkusInsights(input, {
    soundIdea: soundIdeaValue,
    prototype: prototypeValue,
    qualityManagement: qualityManagementValue,
    strategicRelationships: strategicRelationshipsValue,
    productRollout: productRolloutValue,
  });

  // Calculate ranges
  const conservativeValuation = totalValue * 0.7;
  const aggressiveValuation = totalValue * 1.3;

  return {
    valuation: Math.round(totalValue),
    methodology: 'Berkus',
    confidenceScore,
    breakdown: {
      soundIdea: Math.round(soundIdeaValue),
      prototype: Math.round(prototypeValue),
      qualityManagement: Math.round(qualityManagementValue),
      strategicRelationships: Math.round(strategicRelationshipsValue),
      productRollout: Math.round(productRolloutValue),
    },
    maxScore: Math.round(maxTotal),
    achievedScore: Math.round(totalValue),
    ranges: {
      conservative: Math.round(conservativeValuation),
      base: Math.round(totalValue),
      aggressive: Math.round(aggressiveValuation),
    },
    insights,
  };
}

/**
 * Calculate confidence score for Berkus valuation
 */
function calculateBerkusConfidence(
  input: ValuationInput,
  achievedValue: number,
  maxValue: number
): number {
  let score = 60; // Base score for Berkus method

  // Higher score if we have more complete information
  const completeness = achievedValue / maxValue;
  score += completeness * 20; // Up to +20 for high completeness

  // Bonus for having prototype
  const stage = input.productStage?.toLowerCase() || '';
  if (stage.includes('launched') || stage.includes('production')) {
    score += 10;
  } else if (stage.includes('beta') || stage.includes('mvp')) {
    score += 5;
  }

  // Bonus for team size
  if (input.foundersCount && input.foundersCount >= 2) {
    score += 5;
  }

  // Bonus for customers
  if (input.customerCount && input.customerCount > 10) {
    score += 5;
  }

  // Penalty for just being an idea
  if (stage.includes('idea') || stage.includes('concept')) {
    score -= 15;
  }

  return Math.min(Math.max(score, 40), 85); // Clamp between 40-85
}

/**
 * Generate actionable insights
 */
function generateBerkusInsights(
  input: ValuationInput,
  breakdown: {
    soundIdea: number;
    prototype: number;
    qualityManagement: number;
    strategicRelationships: number;
    productRollout: number;
  }
): string[] {
  const insights: string[] = [];

  // Find the weakest factor
  const factors = [
    { name: 'Sound Idea', value: breakdown.soundIdea },
    { name: 'Prototype', value: breakdown.prototype },
    { name: 'Quality Management', value: breakdown.qualityManagement },
    { name: 'Strategic Relationships', value: breakdown.strategicRelationships },
    { name: 'Product Rollout', value: breakdown.productRollout },
  ];

  const sorted = factors.sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  // Insight about strongest factor
  insights.push(`✅ Strongest factor: ${strongest.name} - Continue leveraging this advantage`);

  // Insight about weakest factor
  if (weakest.value < strongest.value * 0.5) {
    insights.push(`⚠️ Focus area: ${weakest.name} - Improving this could significantly boost valuation`);
  }

  // Specific recommendations based on stage
  const stage = input.productStage?.toLowerCase() || '';
  if (stage.includes('idea') || stage.includes('concept')) {
    insights.push('🚀 Priority: Build an MVP or prototype to increase valuation 3-5x');
  } else if (stage.includes('prototype') || stage.includes('alpha')) {
    insights.push('🚀 Priority: Get to beta/launch to unlock next valuation tier');
  } else if (!input.customerCount || input.customerCount < 10) {
    insights.push('📈 Priority: Acquire first 10-50 customers to validate product-market fit');
  }

  // Team insights
  if (!input.foundersCount || input.foundersCount < 2) {
    insights.push('👥 Consider: Adding co-founders with complementary skills can boost valuation');
  }

  // Revenue insights
  if (!input.revenue || input.revenue === 0) {
    insights.push('💰 Next milestone: First revenue will significantly increase valuation');
  }

  return insights;
}

/**
 * Validate Berkus input
 */
export function validateBerkusInput(input: ValuationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Berkus is specifically for pre-revenue or early revenue companies
  if (input.revenue && input.revenue > 50000000) { // ₹5Cr+
    errors.push('Berkus method is designed for pre-revenue or early-stage startups. Consider using DCF or Scorecard method for revenue-stage companies.');
  }

  // Should have at least some basic information
  if (!input.productStage && !input.foundersCount && !input.customerCount) {
    errors.push('Please provide at least product stage, team size, or customer information for Berkus valuation');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
