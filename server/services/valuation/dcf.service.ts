import {
  DCFInputs,
  DCFAssumptions,
  FinancialProjection,
  ValuationResult
} from './types';

/**
 * Generate default DCF assumptions based on historical financials
 */
function deriveDefaultAssumptions(
  historicalFinancials: DCFInputs['historicalFinancials']
): DCFAssumptions {
  const latestYear = historicalFinancials[historicalFinancials.length - 1];
  const previousYear = historicalFinancials[historicalFinancials.length - 2];

  // Calculate historical growth rate
  let avgGrowthRate = 40; // Default for Indian startups
  if (previousYear && previousYear.revenue > 0) {
    const historicalGrowth = ((latestYear.revenue - previousYear.revenue) / previousYear.revenue) * 100;
    avgGrowthRate = Math.max(20, Math.min(100, historicalGrowth)); // Clamp between 20% and 100%
  }

  // Calculate historical EBITDA margin
  let ebitdaMargin = 15; // Default margin %
  if (latestYear.revenue > 0) {
    ebitdaMargin = (latestYear.ebitda / latestYear.revenue) * 100;
  }

  // Project declining growth rates (typical for maturing startups)
  const revenueGrowthRates = [
    avgGrowthRate,
    avgGrowthRate * 0.85,
    avgGrowthRate * 0.70,
    avgGrowthRate * 0.60,
    avgGrowthRate * 0.50,
  ];

  // Project improving EBITDA margins as company scales
  const ebitdaMarginRates = [
    ebitdaMargin,
    ebitdaMargin + 2,
    ebitdaMargin + 4,
    ebitdaMargin + 6,
    ebitdaMargin + 8,
  ];

  return {
    revenueGrowthRates,
    ebitdaMarginRates,
    taxRate: 25, // Indian corporate tax rate
    capexPercentageOfRevenue: 5,
    nwcChangePercentageOfRevenue: 2,
    depreciationPercentageOfRevenue: 3,
  };
}

/**
 * Generate financial projections based on assumptions
 */
function generateProjections(
  historicalFinancials: DCFInputs['historicalFinancials'],
  projectionYears: number,
  assumptionsOverride?: Partial<DCFAssumptions>
): FinancialProjection[] {
  const assumptions = {
    ...deriveDefaultAssumptions(historicalFinancials),
    ...assumptionsOverride,
  };

  const latestYear = historicalFinancials[historicalFinancials.length - 1];
  const projections: FinancialProjection[] = [];

  let previousRevenue = latestYear.revenue;

  for (let i = 0; i < projectionYears; i++) {
    const growthRate = assumptions.revenueGrowthRates[i] || assumptions.revenueGrowthRates[assumptions.revenueGrowthRates.length - 1];
    const ebitdaMargin = assumptions.ebitdaMarginRates[i] || assumptions.ebitdaMarginRates[assumptions.ebitdaMarginRates.length - 1];

    const revenue = previousRevenue * (1 + growthRate / 100);
    const ebitda = revenue * (ebitdaMargin / 100);
    const ebit = ebitda; // Simplified: EBITDA ≈ EBIT for projection purposes
    const nopat = ebit * (1 - assumptions.taxRate / 100);
    const depreciation = revenue * (assumptions.depreciationPercentageOfRevenue / 100);
    const capex = revenue * (assumptions.capexPercentageOfRevenue / 100);
    const nwcChange = revenue * (assumptions.nwcChangePercentageOfRevenue / 100);

    const freeCashFlow = nopat + depreciation - capex - nwcChange;

    projections.push({
      year: i + 1,
      revenue,
      ebitda,
      ebitdaMargin,
      taxRate: assumptions.taxRate,
      capex,
      nwcChange,
      depreciation,
      freeCashFlow,
    });

    previousRevenue = revenue;
  }

  return projections;
}

/**
 * Calculate DCF-based valuation for revenue-generating startups
 */
export async function calculateDCFValuation(
  inputs: DCFInputs
): Promise<ValuationResult> {
  // Validation
  if (inputs.discountRate < 10 || inputs.discountRate > 50) {
    throw new Error('Invalid discount rate. Must be between 10% and 50%');
  }

  if (inputs.terminalGrowthRate < 0 || inputs.terminalGrowthRate > 10) {
    throw new Error('Invalid terminal growth rate. Must be between 0% and 10%');
  }

  if (inputs.projectionYears < 3 || inputs.projectionYears > 10) {
    throw new Error('Projection years must be between 3 and 10');
  }

  if (!inputs.historicalFinancials || inputs.historicalFinancials.length === 0) {
    throw new Error('Historical financials are required for DCF valuation');
  }

  // 1. Generate financial projections
  const projections = generateProjections(
    inputs.historicalFinancials,
    inputs.projectionYears,
    inputs.assumptionsOverride
  );

  // 2. Calculate Free Cash Flows
  const fcfs = projections.map(p => p.freeCashFlow);

  // 3. Discount cash flows to present value
  const presentValues = fcfs.map((fcf, index) => {
    const year = index + 1;
    return fcf / Math.pow(1 + inputs.discountRate / 100, year);
  });

  // 4. Calculate terminal value
  const lastYearFCF = fcfs[fcfs.length - 1];
  const terminalValue =
    (lastYearFCF * (1 + inputs.terminalGrowthRate / 100)) /
    (inputs.discountRate / 100 - inputs.terminalGrowthRate / 100);

  const discountedTerminalValue =
    terminalValue / Math.pow(1 + inputs.discountRate / 100, inputs.projectionYears);

  // 5. Calculate enterprise value
  const presentValueOfCashFlows = presentValues.reduce((sum, pv) => sum + pv, 0);
  const enterpriseValue = presentValueOfCashFlows + discountedTerminalValue;

  // 6. Adjust for cash and debt (from latest balance sheet)
  const latestFinancials = inputs.historicalFinancials[inputs.historicalFinancials.length - 1];
  const netDebt = latestFinancials.totalLiabilities - latestFinancials.shareholdersEquity - latestFinancials.cashInBank;
  const equityValue = Math.max(0, enterpriseValue - netDebt);

  // 7. Calculate confidence score based on data quality
  const confidence = calculateConfidence(inputs.historicalFinancials, projections);

  return {
    method: 'dcf',
    enterpriseValue,
    equityValue,
    breakdown: {
      presentValueOfCashFlows,
      terminalValue: discountedTerminalValue,
      cashAdjustment: latestFinancials.cashInBank,
      debtAdjustment: netDebt,
      yearByYearPV: presentValues,
    },
    projections,
    assumptions: inputs.assumptionsOverride || deriveDefaultAssumptions(inputs.historicalFinancials),
    confidence,
  };
}

/**
 * Calculate confidence score based on data quality and consistency
 */
function calculateConfidence(
  historicalFinancials: DCFInputs['historicalFinancials'],
  projections: FinancialProjection[]
): number {
  let confidence = 100;

  // Reduce confidence if limited historical data
  if (historicalFinancials.length < 2) {
    confidence -= 20;
  } else if (historicalFinancials.length < 3) {
    confidence -= 10;
  }

  // Check for negative EBITDA
  const hasNegativeEbitda = historicalFinancials.some(f => f.ebitda < 0);
  if (hasNegativeEbitda) {
    confidence -= 15;
  }

  // Check for volatile growth
  if (historicalFinancials.length >= 2) {
    const growthRates: number[] = [];
    for (let i = 1; i < historicalFinancials.length; i++) {
      const prev = historicalFinancials[i - 1];
      const curr = historicalFinancials[i];
      if (prev.revenue > 0) {
        const growth = ((curr.revenue - prev.revenue) / prev.revenue) * 100;
        growthRates.push(growth);
      }
    }

    // Calculate standard deviation of growth rates
    if (growthRates.length > 0) {
      const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
      const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / growthRates.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 50) {
        confidence -= 15;
      } else if (stdDev > 30) {
        confidence -= 10;
      }
    }
  }

  // Check for unrealistic projections
  const maxProjectedGrowth = Math.max(...projections.map(p => {
    const idx = p.year - 1;
    if (idx === 0 && historicalFinancials.length > 0) {
      const lastRevenue = historicalFinancials[historicalFinancials.length - 1].revenue;
      return ((p.revenue - lastRevenue) / lastRevenue) * 100;
    }
    if (idx > 0) {
      const prevRevenue = projections[idx - 1].revenue;
      return ((p.revenue - prevRevenue) / prevRevenue) * 100;
    }
    return 0;
  }));

  if (maxProjectedGrowth > 200) {
    confidence -= 20;
  } else if (maxProjectedGrowth > 150) {
    confidence -= 10;
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Create scenario analysis (conservative, base, optimistic)
 */
export async function calculateDCFScenarios(
  inputs: DCFInputs
): Promise<{
  conservative: number;
  base: number;
  optimistic: number;
}> {
  // Base case
  const baseResult = await calculateDCFValuation(inputs);

  // Conservative: Lower growth, higher discount rate
  const conservativeResult = await calculateDCFValuation({
    ...inputs,
    discountRate: inputs.discountRate + 5,
    terminalGrowthRate: Math.max(0, inputs.terminalGrowthRate - 1),
    assumptionsOverride: {
      ...inputs.assumptionsOverride,
      revenueGrowthRates: deriveDefaultAssumptions(inputs.historicalFinancials)
        .revenueGrowthRates.map(rate => rate * 0.7),
    },
  });

  // Optimistic: Higher growth, lower discount rate
  const optimisticResult = await calculateDCFValuation({
    ...inputs,
    discountRate: Math.max(10, inputs.discountRate - 5),
    terminalGrowthRate: Math.min(10, inputs.terminalGrowthRate + 1),
    assumptionsOverride: {
      ...inputs.assumptionsOverride,
      revenueGrowthRates: deriveDefaultAssumptions(inputs.historicalFinancials)
        .revenueGrowthRates.map(rate => rate * 1.3),
    },
  });

  return {
    conservative: conservativeResult.equityValue,
    base: baseResult.equityValue,
    optimistic: optimisticResult.equityValue,
  };
}
