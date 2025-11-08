import { HybridValuationResult, ValuationResult } from './types';
import { calculateDCFValuation, calculateDCFScenarios } from './dcf.service';
import { calculateBerkusValuation, calculateBerkusScenarios } from './berkus.service';
import { calculateScorecardValuation, calculateScorecardScenarios } from './scorecard.service';
import { calculateRiskSummationValuation, calculateRiskSummationScenarios } from './risk-summation.service';
import { calculateComparableValuation, calculateComparableScenarios } from './comparable.service';

interface HybridInputs {
  companyId: string;
  currentStage: 'ideation' | 'mvp' | 'pre_revenue' | 'revenue' | 'growth' | 'expansion';
  dcfInputs?: any;
  berkusInputs?: any;
  scorecardInputs?: any;
  riskSummationInputs?: any;
  comparableInputs?: any;
}

/**
 * Hybrid Valuation - Combines multiple valuation methods for comprehensive analysis
 * Automatically selects and weighs appropriate methods based on startup stage
 */
export async function calculateHybridValuation(
  inputs: HybridInputs
): Promise<HybridValuationResult> {
  const results: Partial<Record<string, ValuationResult>> = {};
  const valuations: number[] = [];
  const weights: Record<string, number> = {};

  // Determine which methods to use based on stage
  const methodsToUse = selectValuationMethods(inputs.currentStage);

  // Calculate valuations using each applicable method
  for (const method of methodsToUse) {
    try {
      let result: ValuationResult | null = null;

      switch (method) {
        case 'dcf':
          if (inputs.dcfInputs) {
            result = await calculateDCFValuation(inputs.dcfInputs);
            results.dcf = result;
          }
          break;

        case 'berkus':
          if (inputs.berkusInputs) {
            result = await calculateBerkusValuation(inputs.berkusInputs);
            results.berkus = result;
          }
          break;

        case 'scorecard':
          if (inputs.scorecardInputs) {
            result = await calculateScorecardValuation(inputs.scorecardInputs);
            results.scorecard = result;
          }
          break;

        case 'riskSummation':
          if (inputs.riskSummationInputs) {
            result = await calculateRiskSummationValuation(inputs.riskSummationInputs);
            results.riskSummation = result;
          }
          break;

        case 'comparable':
          if (inputs.comparableInputs) {
            result = await calculateComparableValuation(inputs.comparableInputs);
            results.comparable = result;
          }
          break;
      }

      if (result) {
        valuations.push(result.equityValue);
        // Weight based on confidence and stage appropriateness
        weights[method] = calculateMethodWeight(method, inputs.currentStage, result.confidence || 75);
      }
    } catch (error) {
      console.error(`Error calculating ${method} valuation:`, error);
      // Continue with other methods even if one fails
    }
  }

  if (valuations.length === 0) {
    throw new Error('No valuation methods could be calculated. Please provide required inputs.');
  }

  // Calculate weighted average
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights = Object.fromEntries(
    Object.entries(weights).map(([method, weight]) => [method, weight / totalWeight])
  );

  const weightedAverage = Object.entries(normalizedWeights).reduce((sum, [method, weight]) => {
    const methodKey = method as keyof typeof results;
    const methodResult = results[methodKey];
    return sum + (methodResult?.equityValue || 0) * weight;
  }, 0);

  // Calculate scenarios (conservative, base, optimistic)
  const scenarios = await calculateScenarios(inputs, results, normalizedWeights);

  // Calculate overall confidence score
  const overallConfidence = calculateOverallConfidence(results, normalizedWeights);

  // Build breakdown
  const breakdown: HybridValuationResult['breakdown'] = {
    weightedAverage,
  };

  if (results.dcf) breakdown.dcfValuation = results.dcf.equityValue;
  if (results.berkus) breakdown.berkusValuation = results.berkus.equityValue;
  if (results.scorecard) breakdown.scorecardValuation = results.scorecard.equityValue;
  if (results.comparable) breakdown.comparableValuation = results.comparable.equityValue;
  if (results.riskSummation) breakdown.riskSummationValuation = results.riskSummation.equityValue;

  return {
    companyId: inputs.companyId,
    valuationDate: new Date().toISOString().split('T')[0],
    valuationMethod: 'hybrid',
    results: {
      conservative: scenarios.conservative,
      base: weightedAverage,
      optimistic: scenarios.optimistic,
      recommended: weightedAverage,
    },
    breakdown,
    individualResults: results as any,
    assumptions: {
      methodsUsed: Object.keys(results),
      weights: normalizedWeights,
      stage: inputs.currentStage,
    },
    confidenceScore: overallConfidence,
  };
}

/**
 * Select valuation methods based on startup stage
 */
function selectValuationMethods(
  stage: HybridInputs['currentStage']
): Array<'dcf' | 'berkus' | 'scorecard' | 'riskSummation' | 'comparable'> {
  const methodsByStage: Record<HybridInputs['currentStage'], string[]> = {
    ideation: ['berkus', 'scorecard', 'riskSummation'],
    mvp: ['berkus', 'scorecard', 'riskSummation', 'comparable'],
    pre_revenue: ['berkus', 'scorecard', 'riskSummation', 'comparable'],
    revenue: ['dcf', 'scorecard', 'riskSummation', 'comparable'],
    growth: ['dcf', 'comparable', 'riskSummation'],
    expansion: ['dcf', 'comparable'],
  };

  return methodsByStage[stage] as any[];
}

/**
 * Calculate method weight based on stage appropriateness and confidence
 */
function calculateMethodWeight(
  method: string,
  stage: HybridInputs['currentStage'],
  confidence: number
): number {
  // Base weight by stage
  const stageWeights: Record<string, Record<string, number>> = {
    ideation: {
      berkus: 0.40,
      scorecard: 0.35,
      riskSummation: 0.25,
    },
    mvp: {
      berkus: 0.35,
      scorecard: 0.30,
      riskSummation: 0.20,
      comparable: 0.15,
    },
    pre_revenue: {
      berkus: 0.30,
      scorecard: 0.30,
      riskSummation: 0.20,
      comparable: 0.20,
    },
    revenue: {
      dcf: 0.40,
      scorecard: 0.20,
      comparable: 0.25,
      riskSummation: 0.15,
    },
    growth: {
      dcf: 0.50,
      comparable: 0.35,
      riskSummation: 0.15,
    },
    expansion: {
      dcf: 0.60,
      comparable: 0.40,
    },
  };

  const baseWeight = stageWeights[stage]?.[method] || 0.25;

  // Adjust based on confidence (normalize confidence to 0.8-1.2 multiplier)
  const confidenceMultiplier = 0.8 + (confidence / 100) * 0.4;

  return baseWeight * confidenceMultiplier;
}

/**
 * Calculate scenarios across all methods
 */
async function calculateScenarios(
  inputs: HybridInputs,
  results: Partial<Record<string, ValuationResult>>,
  weights: Record<string, number>
): Promise<{ conservative: number; optimistic: number }> {
  const scenarios: Record<string, { conservative: number; optimistic: number }> = {};

  // Calculate scenarios for each method
  try {
    if (results.dcf && inputs.dcfInputs) {
      scenarios.dcf = await calculateDCFScenarios(inputs.dcfInputs);
    }
  } catch (e) {
    console.error('Error calculating DCF scenarios:', e);
  }

  try {
    if (results.berkus && inputs.berkusInputs) {
      scenarios.berkus = await calculateBerkusScenarios(inputs.berkusInputs);
    }
  } catch (e) {
    console.error('Error calculating Berkus scenarios:', e);
  }

  try {
    if (results.scorecard && inputs.scorecardInputs) {
      scenarios.scorecard = await calculateScorecardScenarios(inputs.scorecardInputs);
    }
  } catch (e) {
    console.error('Error calculating Scorecard scenarios:', e);
  }

  try {
    if (results.riskSummation && inputs.riskSummationInputs) {
      scenarios.riskSummation = await calculateRiskSummationScenarios(inputs.riskSummationInputs);
    }
  } catch (e) {
    console.error('Error calculating Risk Summation scenarios:', e);
  }

  try {
    if (results.comparable && inputs.comparableInputs) {
      scenarios.comparable = await calculateComparableScenarios(inputs.comparableInputs);
    }
  } catch (e) {
    console.error('Error calculating Comparable scenarios:', e);
  }

  // Calculate weighted averages
  let conservative = 0;
  let optimistic = 0;

  for (const [method, weight] of Object.entries(weights)) {
    if (scenarios[method]) {
      conservative += scenarios[method].conservative * weight;
      optimistic += scenarios[method].optimistic * weight;
    }
  }

  // If no scenarios calculated, use base valuations with ±30% range
  if (conservative === 0 && optimistic === 0) {
    const baseValuations = Object.values(results)
      .map(r => r?.equityValue || 0)
      .filter(v => v > 0);

    if (baseValuations.length > 0) {
      const avgValuation =
        baseValuations.reduce((sum, v) => sum + v, 0) / baseValuations.length;
      conservative = avgValuation * 0.7;
      optimistic = avgValuation * 1.3;
    }
  }

  return { conservative, optimistic };
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(
  results: Partial<Record<string, ValuationResult>>,
  weights: Record<string, number>
): number {
  let weightedConfidence = 0;
  let totalWeight = 0;

  for (const [method, weight] of Object.entries(weights)) {
    const result = results[method as keyof typeof results];
    if (result) {
      weightedConfidence += (result.confidence || 75) * weight;
      totalWeight += weight;
    }
  }

  const baseConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 70;

  // Bonus for using multiple methods (triangulation increases confidence)
  const methodCount = Object.keys(results).length;
  let methodBonus = 0;

  if (methodCount >= 4) {
    methodBonus = 10;
  } else if (methodCount >= 3) {
    methodBonus = 7;
  } else if (methodCount >= 2) {
    methodBonus = 5;
  }

  // Check consistency across methods
  const valuations = Object.values(results)
    .map(r => r?.equityValue || 0)
    .filter(v => v > 0);

  if (valuations.length > 1) {
    const avgValuation = valuations.reduce((sum, v) => sum + v, 0) / valuations.length;
    const variance =
      valuations.reduce((sum, v) => sum + Math.pow(v - avgValuation, 2), 0) / valuations.length;
    const coefficientOfVariation = Math.sqrt(variance) / avgValuation;

    // High variance reduces confidence
    if (coefficientOfVariation > 0.5) {
      methodBonus -= 5;
    } else if (coefficientOfVariation < 0.2) {
      methodBonus += 5; // Low variance increases confidence
    }
  }

  return Math.max(0, Math.min(100, baseConfidence + methodBonus));
}

/**
 * Generate valuation insights and recommendations
 */
export function generateValuationInsights(
  result: HybridValuationResult
): {
  keyFindings: string[];
  recommendations: string[];
  comparisonAnalysis: string;
} {
  const keyFindings: string[] = [];
  const recommendations: string[] = [];

  // Analyze valuation range
  const valuationRange =
    ((result.results.optimistic - result.results.conservative) / result.results.base) * 100;

  if (valuationRange > 50) {
    keyFindings.push(
      `Wide valuation range (${valuationRange.toFixed(1)}%) indicates significant uncertainty. Consider gathering more data points.`
    );
  } else if (valuationRange < 20) {
    keyFindings.push(
      `Narrow valuation range (${valuationRange.toFixed(1)}%) indicates high confidence in valuation estimates.`
    );
  }

  // Analyze method agreement
  const methodValues = Object.values(result.individualResults)
    .map(r => r?.equityValue || 0)
    .filter(v => v > 0);

  if (methodValues.length > 1) {
    const maxVal = Math.max(...methodValues);
    const minVal = Math.min(...methodValues);
    const spread = ((maxVal - minVal) / result.results.base) * 100;

    if (spread > 100) {
      keyFindings.push(
        'Significant disagreement between valuation methods. This may indicate the startup is in a transitional phase.'
      );
      recommendations.push(
        'Focus on the methods most appropriate for your current stage and provide more detailed inputs.'
      );
    }
  }

  // Stage-specific recommendations
  if (result.assumptions.stage === 'pre_revenue' || result.assumptions.stage === 'ideation') {
    recommendations.push(
      'Focus on building traction and validating product-market fit to improve valuation.'
    );
    recommendations.push(
      'Consider accelerator programs and government schemes for early-stage funding.'
    );
  } else if (result.assumptions.stage === 'revenue' || result.assumptions.stage === 'growth') {
    recommendations.push(
      'Demonstrate sustainable unit economics and clear path to profitability to maximize valuation.'
    );
    recommendations.push(
      'Consider Series A or growth-stage venture capital based on your current valuation.'
    );
  }

  // Comparison analysis
  let comparisonAnalysis = `Based on ${Object.keys(result.individualResults).length} valuation methods, `;
  comparisonAnalysis += `the recommended valuation is ₹${(result.results.recommended / 10000000).toFixed(2)} crore. `;

  if (result.confidenceScore >= 80) {
    comparisonAnalysis += 'High confidence in this valuation due to method consistency and data quality.';
  } else if (result.confidenceScore >= 60) {
    comparisonAnalysis += 'Moderate confidence. Consider providing more detailed inputs for higher accuracy.';
  } else {
    comparisonAnalysis += 'Lower confidence. Recommend gathering additional data and using more valuation methods.';
  }

  return {
    keyFindings,
    recommendations,
    comparisonAnalysis,
  };
}
