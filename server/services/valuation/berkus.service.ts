import { BerkusInputs, ValuationResult } from './types';

/**
 * Berkus Method - Valuation for pre-revenue startups
 * Adapted for Indian context
 *
 * This method assigns value to five key success factors:
 * 1. Sound Idea (business model)
 * 2. Prototype
 * 3. Quality Management Team
 * 4. Strategic Relationships
 * 5. Product Rollout or Sales
 */

const INDIAN_BASE_VALUE = 20000000; // ₹2 crore base (Indian context)
const MAX_VALUE_PER_FACTOR = 5000000; // ₹50 lakhs per factor

/**
 * Calculate Berkus valuation for pre-revenue startups
 */
export async function calculateBerkusValuation(
  inputs: BerkusInputs
): Promise<ValuationResult> {
  // Validation
  validateInputs(inputs);

  let totalValue = INDIAN_BASE_VALUE;
  const breakdown: Record<string, number> = {
    baseValue: INDIAN_BASE_VALUE,
  };

  // 1. Sound idea / business model (0-10 rating)
  const ideaValue = (inputs.soundIdea / 10) * MAX_VALUE_PER_FACTOR;
  totalValue += ideaValue;
  breakdown.ideaValue = ideaValue;
  breakdown.ideaRating = inputs.soundIdea;

  // 2. Prototype (boolean)
  const prototypeValue = inputs.prototypeExists ? MAX_VALUE_PER_FACTOR : 0;
  totalValue += prototypeValue;
  breakdown.prototypeValue = prototypeValue;
  breakdown.hasPrototype = inputs.prototypeExists;

  // 3. Quality management team (0-10 rating)
  const teamValue = (inputs.qualityManagementTeam / 10) * MAX_VALUE_PER_FACTOR;
  totalValue += teamValue;
  breakdown.teamValue = teamValue;
  breakdown.teamRating = inputs.qualityManagementTeam;

  // 4. Strategic relationships (0-10 rating)
  const relationshipsValue = (inputs.strategicRelationships / 10) * MAX_VALUE_PER_FACTOR;
  totalValue += relationshipsValue;
  breakdown.relationshipsValue = relationshipsValue;
  breakdown.relationshipsRating = inputs.strategicRelationships;

  // 5. Product rollout or sales (0-10 rating)
  const rolloutValue = (inputs.productRolloutOrSales / 10) * MAX_VALUE_PER_FACTOR;
  totalValue += rolloutValue;
  breakdown.rolloutValue = rolloutValue;
  breakdown.rolloutRating = inputs.productRolloutOrSales;

  // Calculate confidence score
  const confidence = calculateConfidence(inputs);

  // Generate recommendations
  const recommendations = generateRecommendations(inputs, breakdown);

  return {
    method: 'berkus',
    equityValue: totalValue,
    breakdown: {
      ...breakdown,
      totalValue,
      maxPossibleValue: INDIAN_BASE_VALUE + (MAX_VALUE_PER_FACTOR * 5),
      utilizationPercentage: ((totalValue - INDIAN_BASE_VALUE) / (MAX_VALUE_PER_FACTOR * 5)) * 100,
      recommendations,
    },
    confidence,
  };
}

/**
 * Validate Berkus method inputs
 */
function validateInputs(inputs: BerkusInputs): void {
  if (inputs.soundIdea < 0 || inputs.soundIdea > 10) {
    throw new Error('Sound idea rating must be between 0 and 10');
  }

  if (inputs.qualityManagementTeam < 0 || inputs.qualityManagementTeam > 10) {
    throw new Error('Quality management team rating must be between 0 and 10');
  }

  if (inputs.strategicRelationships < 0 || inputs.strategicRelationships > 10) {
    throw new Error('Strategic relationships rating must be between 0 and 10');
  }

  if (inputs.productRolloutOrSales < 0 || inputs.productRolloutOrSales > 10) {
    throw new Error('Product rollout rating must be between 0 and 10');
  }
}

/**
 * Calculate confidence score for Berkus valuation
 */
function calculateConfidence(inputs: BerkusInputs): number {
  let confidence = 70; // Base confidence for pre-revenue method

  // Increase confidence if prototype exists
  if (inputs.prototypeExists) {
    confidence += 10;
  }

  // Increase confidence if team is strong
  if (inputs.qualityManagementTeam >= 8) {
    confidence += 10;
  } else if (inputs.qualityManagementTeam >= 6) {
    confidence += 5;
  }

  // Increase confidence if there's evidence of traction
  if (inputs.productRolloutOrSales >= 7) {
    confidence += 10;
  } else if (inputs.productRolloutOrSales >= 5) {
    confidence += 5;
  }

  // Decrease confidence if idea is weak
  if (inputs.soundIdea < 5) {
    confidence -= 10;
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Generate recommendations based on valuation breakdown
 */
function generateRecommendations(
  inputs: BerkusInputs,
  breakdown: Record<string, any>
): string[] {
  const recommendations: string[] = [];

  // Check each factor and provide recommendations
  if (inputs.soundIdea < 7) {
    recommendations.push(
      `Business Model Improvement: Score is ${inputs.soundIdea}/10. Consider refining your value proposition and revenue model to increase attractiveness to investors.`
    );
  }

  if (!inputs.prototypeExists) {
    recommendations.push(
      'Prototype Development: Building a working prototype or MVP would add ₹50 lakhs to your valuation. This demonstrates technical feasibility and reduces investor risk.'
    );
  }

  if (inputs.qualityManagementTeam < 7) {
    recommendations.push(
      `Team Strengthening: Current team score is ${inputs.qualityManagementTeam}/10. Consider adding experienced co-founders or advisors with domain expertise, especially in technology and business development.`
    );
  }

  if (inputs.strategicRelationships < 6) {
    recommendations.push(
      `Strategic Partnerships: Score is ${inputs.strategicRelationships}/10. Develop partnerships with industry players, accelerators, or potential customers. Each strong relationship can significantly boost your valuation.`
    );
  }

  if (inputs.productRolloutOrSales < 6) {
    recommendations.push(
      `Market Validation: Current score is ${inputs.productRolloutOrSales}/10. Focus on getting early customer commitments, beta users, or letters of intent. Any proof of market demand will substantially increase your valuation.`
    );
  }

  // Positive reinforcement for strong areas
  if (inputs.qualityManagementTeam >= 8) {
    recommendations.push(
      'Strong Team: Your management team is a key strength. Highlight their expertise and track record in your investor presentations.'
    );
  }

  if (inputs.prototypeExists && inputs.productRolloutOrSales >= 7) {
    recommendations.push(
      'Ready for Seed Funding: With a working prototype and strong market traction, you are well-positioned for seed funding. Consider approaching angel investors and early-stage VCs.'
    );
  }

  return recommendations;
}

/**
 * Calculate scenario analysis for Berkus method
 */
export async function calculateBerkusScenarios(
  inputs: BerkusInputs
): Promise<{
  conservative: number;
  base: number;
  optimistic: number;
}> {
  // Base case
  const baseResult = await calculateBerkusValuation(inputs);

  // Conservative: Reduce all ratings by 20%
  const conservativeInputs: BerkusInputs = {
    soundIdea: Math.max(0, inputs.soundIdea * 0.8),
    prototypeExists: inputs.prototypeExists,
    qualityManagementTeam: Math.max(0, inputs.qualityManagementTeam * 0.8),
    strategicRelationships: Math.max(0, inputs.strategicRelationships * 0.8),
    productRolloutOrSales: Math.max(0, inputs.productRolloutOrSales * 0.8),
  };
  const conservativeResult = await calculateBerkusValuation(conservativeInputs);

  // Optimistic: Increase all ratings by 15% (capped at 10)
  const optimisticInputs: BerkusInputs = {
    soundIdea: Math.min(10, inputs.soundIdea * 1.15),
    prototypeExists: inputs.prototypeExists,
    qualityManagementTeam: Math.min(10, inputs.qualityManagementTeam * 1.15),
    strategicRelationships: Math.min(10, inputs.strategicRelationships * 1.15),
    productRolloutOrSales: Math.min(10, inputs.productRolloutOrSales * 1.15),
  };
  const optimisticResult = await calculateBerkusValuation(optimisticInputs);

  return {
    conservative: conservativeResult.equityValue,
    base: baseResult.equityValue,
    optimistic: optimisticResult.equityValue,
  };
}

/**
 * Helper function to suggest which factors to improve for target valuation
 */
export function suggestImprovementsForTargetValuation(
  currentInputs: BerkusInputs,
  targetValuation: number
): {
  currentValuation: number;
  targetValuation: number;
  gap: number;
  suggestions: Array<{
    factor: string;
    currentRating: number | boolean;
    suggestedRating: number | boolean;
    valuationIncrease: number;
  }>;
} {
  const currentResult = calculateBerkusValuation(currentInputs) as any;
  const gap = targetValuation - currentResult.equityValue;

  if (gap <= 0) {
    return {
      currentValuation: currentResult.equityValue,
      targetValuation,
      gap: 0,
      suggestions: [{
        factor: 'Target Achieved',
        currentRating: 0,
        suggestedRating: 0,
        valuationIncrease: 0,
      }],
    };
  }

  const suggestions: Array<{
    factor: string;
    currentRating: number | boolean;
    suggestedRating: number | boolean;
    valuationIncrease: number;
  }> = [];

  // Calculate potential improvements
  if (!currentInputs.prototypeExists) {
    suggestions.push({
      factor: 'Build Prototype/MVP',
      currentRating: false,
      suggestedRating: true,
      valuationIncrease: MAX_VALUE_PER_FACTOR,
    });
  }

  if (currentInputs.soundIdea < 10) {
    const improvement = (10 - currentInputs.soundIdea) * (MAX_VALUE_PER_FACTOR / 10);
    suggestions.push({
      factor: 'Strengthen Business Model',
      currentRating: currentInputs.soundIdea,
      suggestedRating: 10,
      valuationIncrease: improvement,
    });
  }

  if (currentInputs.qualityManagementTeam < 10) {
    const improvement = (10 - currentInputs.qualityManagementTeam) * (MAX_VALUE_PER_FACTOR / 10);
    suggestions.push({
      factor: 'Strengthen Management Team',
      currentRating: currentInputs.qualityManagementTeam,
      suggestedRating: 10,
      valuationIncrease: improvement,
    });
  }

  if (currentInputs.strategicRelationships < 10) {
    const improvement = (10 - currentInputs.strategicRelationships) * (MAX_VALUE_PER_FACTOR / 10);
    suggestions.push({
      factor: 'Develop Strategic Partnerships',
      currentRating: currentInputs.strategicRelationships,
      suggestedRating: 10,
      valuationIncrease: improvement,
    });
  }

  if (currentInputs.productRolloutOrSales < 10) {
    const improvement = (10 - currentInputs.productRolloutOrSales) * (MAX_VALUE_PER_FACTOR / 10);
    suggestions.push({
      factor: 'Achieve Product-Market Fit',
      currentRating: currentInputs.productRolloutOrSales,
      suggestedRating: 10,
      valuationIncrease: improvement,
    });
  }

  // Sort by potential impact
  suggestions.sort((a, b) => b.valuationIncrease - a.valuationIncrease);

  return {
    currentValuation: currentResult.equityValue,
    targetValuation,
    gap,
    suggestions,
  };
}
