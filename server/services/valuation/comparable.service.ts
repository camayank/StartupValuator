import { ComparableInputs, ValuationResult } from './types';

/**
 * Comparable Company Analysis
 * Values the target startup based on multiples of similar companies
 */

/**
 * Calculate valuation using comparable companies
 */
export async function calculateComparableValuation(
  inputs: ComparableInputs
): Promise<ValuationResult> {
  // Validation
  validateInputs(inputs);

  // Filter comparables based on criteria
  let filteredComparables = inputs.comparables;

  if (inputs.filters?.sector) {
    filteredComparables = filteredComparables.filter(
      c => c.sector.toLowerCase() === inputs.filters!.sector!.toLowerCase()
    );
  }

  if (inputs.filters?.stage) {
    filteredComparables = filteredComparables.filter(
      c => c.stage.toLowerCase() === inputs.filters!.stage!.toLowerCase()
    );
  }

  if (filteredComparables.length === 0) {
    throw new Error('No comparable companies found matching the filter criteria');
  }

  // Calculate median multiples
  const revenueMultiples = filteredComparables
    .map(c => c.revenueMultiple)
    .sort((a, b) => a - b);
  const ebitdaMultiples = filteredComparables
    .filter(c => c.ebitdaMultiple > 0)
    .map(c => c.ebitdaMultiple)
    .sort((a, b) => a - b);

  const medianRevenueMultiple = calculateMedian(revenueMultiples);
  const medianEbitdaMultiple =
    ebitdaMultiples.length > 0 ? calculateMedian(ebitdaMultiples) : null;

  // Calculate valuations using different multiples
  const revenueBasedValuation = inputs.targetCompany.revenue * medianRevenueMultiple;

  let ebitdaBasedValuation: number | null = null;
  if (inputs.targetCompany.ebitda > 0 && medianEbitdaMultiple) {
    ebitdaBasedValuation = inputs.targetCompany.ebitda * medianEbitdaMultiple;
  }

  // Weight based on profitability
  let finalValuation: number;
  let weights: { revenue: number; ebitda: number };

  if (ebitdaBasedValuation && inputs.targetCompany.ebitda > 0) {
    // If profitable, weight EBITDA more heavily
    const ebitdaMargin = (inputs.targetCompany.ebitda / inputs.targetCompany.revenue) * 100;

    if (ebitdaMargin > 20) {
      weights = { revenue: 0.3, ebitda: 0.7 }; // High margin - trust EBITDA multiple more
    } else if (ebitdaMargin > 0) {
      weights = { revenue: 0.4, ebitda: 0.6 }; // Moderate margin
    } else {
      weights = { revenue: 1.0, ebitda: 0.0 }; // Negative margin - use revenue only
    }

    finalValuation =
      revenueBasedValuation * weights.revenue +
      (ebitdaBasedValuation || 0) * weights.ebitda;
  } else {
    // If not profitable or no EBITDA data, use revenue multiple only
    finalValuation = revenueBasedValuation;
    weights = { revenue: 1.0, ebitda: 0.0 };
  }

  // Adjust for growth rate differential
  const comparableGrowthRates = filteredComparables
    .map(c => {
      // Estimate growth rate from multiple (higher multiple often indicates higher growth)
      return c.revenueMultiple * 10; // Rough approximation
    })
    .filter(g => g > 0);

  const avgComparableGrowth =
    comparableGrowthRates.length > 0
      ? comparableGrowthRates.reduce((sum, g) => sum + g, 0) / comparableGrowthRates.length
      : 50;

  const growthAdjustment = inputs.targetCompany.growthRate / avgComparableGrowth;
  const growthAdjustedValuation = finalValuation * Math.min(2, Math.max(0.5, growthAdjustment));

  // Calculate confidence score
  const confidence = calculateConfidence(inputs, filteredComparables);

  // Generate insights
  const insights = generateInsights(
    inputs,
    filteredComparables,
    medianRevenueMultiple,
    medianEbitdaMultiple
  );

  return {
    method: 'comparable',
    equityValue: growthAdjustedValuation,
    breakdown: {
      revenueBasedValuation,
      ebitdaBasedValuation,
      medianRevenueMultiple,
      medianEbitdaMultiple,
      weights,
      growthAdjustment,
      growthAdjustedValuation,
      comparablesUsed: filteredComparables.length,
      insights,
    },
    comparables: filteredComparables.map(c => ({
      companyName: c.companyName,
      valuation: c.valuation,
      revenue: c.revenue,
      revenueMultiple: c.revenueMultiple,
      ebitdaMultiple: c.ebitdaMultiple,
      stage: c.stage,
      sector: c.sector,
    })),
    confidence,
  };
}

/**
 * Calculate median of an array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Validate inputs
 */
function validateInputs(inputs: ComparableInputs): void {
  if (inputs.targetCompany.revenue <= 0) {
    throw new Error('Target company revenue must be greater than 0');
  }

  if (inputs.comparables.length === 0) {
    throw new Error('At least one comparable company is required');
  }

  for (const comp of inputs.comparables) {
    if (comp.revenueMultiple <= 0) {
      throw new Error(`Invalid revenue multiple for ${comp.companyName}`);
    }
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  inputs: ComparableInputs,
  filteredComparables: ComparableInputs['comparables']
): number {
  let confidence = 75; // Base confidence for comparable method

  // More comparables = higher confidence
  if (filteredComparables.length >= 10) {
    confidence += 15;
  } else if (filteredComparables.length >= 5) {
    confidence += 10;
  } else if (filteredComparables.length < 3) {
    confidence -= 15;
  }

  // Check variance in multiples (lower variance = higher confidence)
  const revenueMultiples = filteredComparables.map(c => c.revenueMultiple);
  const avgMultiple = revenueMultiples.reduce((sum, m) => sum + m, 0) / revenueMultiples.length;
  const variance =
    revenueMultiples.reduce((sum, m) => sum + Math.pow(m - avgMultiple, 2), 0) /
    revenueMultiples.length;
  const coefficientOfVariation = Math.sqrt(variance) / avgMultiple;

  if (coefficientOfVariation > 0.5) {
    confidence -= 15; // High variance in multiples
  } else if (coefficientOfVariation < 0.2) {
    confidence += 10; // Low variance - consistent multiples
  }

  // Sector and stage filtering increases confidence
  if (inputs.filters?.sector) {
    confidence += 5;
  }
  if (inputs.filters?.stage) {
    confidence += 5;
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Generate insights
 */
function generateInsights(
  inputs: ComparableInputs,
  filteredComparables: ComparableInputs['comparables'],
  medianRevenueMultiple: number,
  medianEbitdaMultiple: number | null
): {
  positioning: string;
  multipleAnalysis: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];

  // Positioning analysis
  let positioning = '';
  const targetMultiple =
    inputs.targetCompany.revenue > 0
      ? (inputs.targetCompany.revenue * medianRevenueMultiple) / inputs.targetCompany.revenue
      : 0;

  const avgComparableValuation =
    filteredComparables.reduce((sum, c) => sum + c.valuation, 0) / filteredComparables.length;

  if (targetMultiple > avgComparableValuation * 1.2) {
    positioning =
      'Your startup is positioned at a premium compared to peers, likely due to superior growth rates or unique competitive advantages.';
  } else if (targetMultiple < avgComparableValuation * 0.8) {
    positioning =
      'Your startup is valued at a discount to peers. This could indicate undervaluation or specific risk factors.';
  } else {
    positioning =
      'Your startup is valued in line with comparable companies in your sector and stage.';
  }

  // Multiple analysis
  let multipleAnalysis = `Median revenue multiple for comparable companies is ${medianRevenueMultiple.toFixed(2)}x. `;

  if (medianRevenueMultiple > 10) {
    multipleAnalysis +=
      'This is a high multiple, indicating strong investor confidence in the sector.';
  } else if (medianRevenueMultiple < 3) {
    multipleAnalysis +=
      'This is a conservative multiple, suggesting mature or capital-intensive businesses.';
  } else {
    multipleAnalysis += 'This is a typical multiple for this sector and stage.';
  }

  if (medianEbitdaMultiple) {
    multipleAnalysis += ` Median EBITDA multiple is ${medianEbitdaMultiple.toFixed(2)}x.`;
  }

  // Recommendations
  if (inputs.targetCompany.growthRate < 30) {
    recommendations.push(
      'Growth Rate: Your growth rate is below typical startup benchmarks. Accelerating growth would significantly improve your valuation.'
    );
  }

  if (inputs.targetCompany.ebitda <= 0) {
    recommendations.push(
      'Profitability: Achieving positive EBITDA would allow for EBITDA-based valuation, which often yields higher valuations for profitable companies.'
    );
  }

  if (filteredComparables.length < 5) {
    recommendations.push(
      'Comparable Analysis: Limited comparable companies available. Consider broadening search criteria or using multiple valuation methods.'
    );
  }

  return {
    positioning,
    multipleAnalysis,
    recommendations,
  };
}

/**
 * Calculate scenario analysis
 */
export async function calculateComparableScenarios(
  inputs: ComparableInputs
): Promise<{
  conservative: number;
  base: number;
  optimistic: number;
}> {
  // Base case
  const baseResult = await calculateComparableValuation(inputs);

  // Conservative: Use 25th percentile multiples
  const revenueMultiples = inputs.comparables.map(c => c.revenueMultiple).sort((a, b) => a - b);
  const conservativeMultiple = revenueMultiples[Math.floor(revenueMultiples.length * 0.25)];

  const conservativeInputs: ComparableInputs = {
    ...inputs,
    comparables: inputs.comparables.map(c => ({
      ...c,
      revenueMultiple: conservativeMultiple,
    })),
  };
  const conservativeResult = await calculateComparableValuation(conservativeInputs);

  // Optimistic: Use 75th percentile multiples
  const optimisticMultiple = revenueMultiples[Math.floor(revenueMultiples.length * 0.75)];

  const optimisticInputs: ComparableInputs = {
    ...inputs,
    comparables: inputs.comparables.map(c => ({
      ...c,
      revenueMultiple: optimisticMultiple,
    })),
  };
  const optimisticResult = await calculateComparableValuation(optimisticInputs);

  return {
    conservative: conservativeResult.equityValue,
    base: baseResult.equityValue,
    optimistic: optimisticResult.equityValue,
  };
}

/**
 * Get Indian startup comparable multiples database
 * This is a sample database - in production, this would come from a real database
 */
export function getIndianStartupComparables(
  sector: string,
  stage: string
): ComparableInputs['comparables'] {
  // Sample data for demonstration
  const comparablesDatabase: Record<string, any[]> = {
    fintech: [
      {
        companyName: 'PayTech Solutions',
        valuation: 150000000,
        revenue: 25000000,
        ebitda: 5000000,
        revenueMultiple: 6.0,
        ebitdaMultiple: 30.0,
        stage: 'series_a',
        sector: 'fintech',
      },
      {
        companyName: 'Digital Wallet Pro',
        valuation: 300000000,
        revenue: 40000000,
        ebitda: -5000000,
        revenueMultiple: 7.5,
        ebitdaMultiple: 0,
        stage: 'series_a',
        sector: 'fintech',
      },
    ],
    saas: [
      {
        companyName: 'CloudSoft India',
        valuation: 120000000,
        revenue: 15000000,
        ebitda: 3000000,
        revenueMultiple: 8.0,
        ebitdaMultiple: 40.0,
        stage: 'series_a',
        sector: 'saas',
      },
    ],
    ecommerce: [
      {
        companyName: 'QuickCart',
        valuation: 200000000,
        revenue: 80000000,
        ebitda: 10000000,
        revenueMultiple: 2.5,
        ebitdaMultiple: 20.0,
        stage: 'series_a',
        sector: 'ecommerce',
      },
    ],
  };

  return comparablesDatabase[sector.toLowerCase()] || [];
}
