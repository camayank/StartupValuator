import type { ValuationFormData } from "../../client/src/lib/validations";
import { industries, businessStages } from "../../client/src/lib/validations";
import type { FinancialAssumptions } from "./financialAssumptions";

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

export function calculateValuation(params: ValuationFormData & { assumptions: FinancialAssumptions }) {
  const { currency, stage, industry, revenue, assumptions } = params;

  // Convert revenue to USD for calculations
  const revenueUSD = params.revenue / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  const paramsUSD = { ...params, revenue: revenueUSD };

  // Calculate DCF valuation using the provided assumptions
  const dcfAnalysis = calculateDCF(paramsUSD);
  const comparablesAnalysis = calculateComparables(paramsUSD);

  // Determine method weights based on stage and data quality
  let dcfWeight = 0.4;
  let comparablesWeight = 0.6;

  if (stage.includes('revenue_scaling') || stage.includes('established')) {
    dcfWeight = 0.6;
    comparablesWeight = 0.4;
  } else if (stage.includes('ideation') || stage.includes('mvp')) {
    dcfWeight = 0.2;
    comparablesWeight = 0.8;
  }

  // Calculate weighted average valuation
  const finalValuationUSD = (dcfAnalysis.value * dcfWeight) + (comparablesAnalysis.value * comparablesWeight);

  // Calculate confidence score based on data quality
  const confidenceScore = Math.min(100, Math.max(50,
    60 + // Base confidence
    (revenue ? 10 : 0) + // Revenue data available
    (params.margins ? 10 : 0) + // Margin data available
    (params.growthRate ? 10 : 0) + // Growth data available
    (stage.includes('revenue_scaling') || stage.includes('established') ? 10 : 0) // Later stage companies
  ));

  // Enhanced scenario analysis using the assumptions
  const scenarios = {
    worst: {
      value: finalValuationUSD * 0.7,
      assumptions: {
        growthRate: assumptions.growthRate * 0.7,
        margins: (params.margins || 0) * 0.8,
        discountRate: assumptions.discountRate * 1.2,
      },
    },
    base: {
      value: finalValuationUSD,
      assumptions: {
        growthRate: assumptions.growthRate,
        margins: params.margins || 0,
        discountRate: assumptions.discountRate,
      },
    },
    best: {
      value: finalValuationUSD * 1.3,
      assumptions: {
        growthRate: assumptions.growthRate * 1.3,
        margins: (params.margins || 0) * 1.2,
        discountRate: assumptions.discountRate * 0.9,
      },
    },
  };

  // Convert back to requested currency
  const finalValuation = finalValuationUSD * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];

  return {
    valuation: Math.round(finalValuation * 100) / 100, // Round to 2 decimal places
    multiplier: revenue > 0 ? Math.round((finalValuationUSD / revenueUSD) * 100) / 100 : null,
    methodology: `Weighted Average (${dcfWeight * 100}% DCF, ${comparablesWeight * 100}% Market Comparables)`,
    confidenceScore,
    details: {
      baseValuation: finalValuationUSD,
      methods: {
        dcf: dcfAnalysis,
        comparables: comparablesAnalysis,
      },
      scenarios,
    },
    assumptions, // Include the provided assumptions in the response
  };
}

function calculateDCF(params: ValuationFormData & { assumptions: FinancialAssumptions }): {
  value: number;
  stages: Array<{
    year: number;
    fcf: number;
    presentValue: number;
  }>;
} {
  const { revenue, assumptions } = params;
  const { discountRate, growthRate, terminalGrowthRate } = assumptions;

  let currentRevenue = revenue;
  let presentValue = 0;
  const stages = [];
  const projectionYears = 5;

  // Project cash flows for explicit period
  for (let year = 1; year <= projectionYears; year++) {
    currentRevenue *= (1 + growthRate);
    const fcf = currentRevenue * 0.15; // Simplified FCF calculation
    const presentValueFactor = Math.pow(1 + discountRate, year);
    const discountedValue = fcf / presentValueFactor;

    presentValue += discountedValue;
    stages.push({
      year,
      fcf,
      presentValue: discountedValue,
    });
  }

  // Calculate terminal value
  const terminalFCF = currentRevenue * 0.15 * (1 + terminalGrowthRate);
  const terminalValue = terminalFCF / (discountRate - terminalGrowthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, projectionYears);

  return {
    value: presentValue + discountedTerminalValue,
    stages,
  };
}

function calculateComparables(params: ValuationFormData & { assumptions: FinancialAssumptions }): {
  value: number;
  multiples: {
    revenue: number;
    ebitda?: number;
  };
} {
  const { revenue, stage, industry } = params;

  // Base multiples by industry (simplified)
  const baseMultiples = {
    technology: { revenue: 5, ebitda: 15 },
    digital: { revenue: 4, ebitda: 12 },
    enterprise: { revenue: 3, ebitda: 10 },
    consumer: { revenue: 2, ebitda: 8 },
    healthcare: { revenue: 3, ebitda: 12 },
    financial: { revenue: 2.5, ebitda: 10 },
    industrial: { revenue: 1.5, ebitda: 8 },
    energy: { revenue: 2, ebitda: 9 },
    others: { revenue: 2, ebitda: 8 },
  };

  // Stage adjustments
  const stageMultiplier = stage.includes('revenue_scaling') ? 1.3 :
    stage.includes('established') ? 1.2 :
    stage.includes('revenue') ? 1.1 :
    0.9;

  const industryMultiples = baseMultiples[industry as keyof typeof baseMultiples];
  const adjustedRevenueMultiple = industryMultiples.revenue * stageMultiplier;
  const adjustedEbitdaMultiple = industryMultiples.ebitda * stageMultiplier;

  return {
    value: revenue * adjustedRevenueMultiple,
    multiples: {
      revenue: adjustedRevenueMultiple,
      ebitda: adjustedEbitdaMultiple,
    },
  };
}

export type { CurrencyRates, FinancialAssumptions };

//The rest of the original file is removed because it's replaced by the edited code.  
//Functions like inferRegionAndStandards, getStageMultiplier, calculateWACC, inferGrowthRate are no longer needed in this revised structure.