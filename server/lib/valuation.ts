import type { ValuationFormData } from "../../client/src/lib/validations";
import { businessStages, sectors } from "../../client/src/lib/validations";
import { calculateFinancialAssumptions } from "./financialAssumptions";
import { getCachedMarketSentiment } from "./marketSentiment";
import type { FinancialAssumptions } from "./financialAssumptions";
import type { MarketSentiment } from "./marketSentiment";
import {
  getFramework,
  validateFrameworkCompliance,
  applyFrameworkAdjustments,
  type FrameworkId
} from "./compliance/frameworks";

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

export async function calculateValuation(params: ValuationFormData & { framework?: FrameworkId }) {
  const { currency, stage, sector, subsector, revenue, framework = 'ivs' } = params;

  // Get compliance framework
  const complianceFramework = getFramework(framework);

  // Get market sentiment analysis
  const marketSentiment = await getCachedMarketSentiment(params);

  // Generate financial assumptions first
  const assumptions = calculateFinancialAssumptions(params);

  // Convert revenue to USD for calculations
  const revenueUSD = params.revenue / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  const paramsUSD = { ...params, revenue: revenueUSD };

  // Get stage-specific valuation methods
  const stageConfig = businessStages[stage];
  const sectorConfig = sectors[sector].subsectors[subsector];

  // Calculate valuations using stage-appropriate methods
  const valuationResults = await Promise.all(
    stageConfig.valuation.methods.map(async (method) => {
      switch (method) {
        case "scorecard":
          return calculateScorecardValuation(paramsUSD, assumptions);
        case "checklistMethod":
          return calculateChecklistValuation(paramsUSD, assumptions);
        case "vcMethod":
          return calculateVCMethodValuation(paramsUSD, assumptions, sectorConfig);
        case "firstChicago":
          return calculateFirstChicagoValuation(paramsUSD, assumptions);
        case "dcf":
          return calculateDCF(paramsUSD, assumptions);
        case "marketMultiples":
          return calculateComparables(paramsUSD, assumptions);
        case "precedentTransactions":
          return calculatePrecedentTransactions(paramsUSD, assumptions, sectorConfig);
        case "assetBased":
          return calculateAssetBasedValuation(paramsUSD);
        default:
          throw new Error(`Unsupported valuation method: ${method}`);
      }
    })
  );

  // Calculate weighted average valuation based on stage weights
  const baseValuationUSD = valuationResults.reduce((acc, result, index) => {
    const method = stageConfig.valuation.methods[index];
    const weight = stageConfig.valuation.weights[method];
    return acc + result.value * weight;
  }, 0);

  // Calculate market sentiment adjustment
  const sentimentAdjustment = calculateMarketSentimentAdjustment(marketSentiment);

  // Apply compliance framework adjustments
  const frameworkAdjustedValuationUSD = applyFrameworkAdjustments(
    complianceFramework,
    baseValuationUSD * sentimentAdjustment
  );

  // Convert back to requested currency
  const finalValuation = frameworkAdjustedValuationUSD * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];

  return {
    valuation: Math.round(finalValuation * 100) / 100,
    multiplier: revenue > 0 ? Math.round((frameworkAdjustedValuationUSD / revenueUSD) * 100) / 100 : null,
    methodology: {
      stage: stage,
      methods: stageConfig.valuation.methods,
      weights: stageConfig.valuation.weights,
      sentimentAdjustment,
    },
    marketSentiment,
    compliance: {
      framework: complianceFramework.name,
      region: complianceFramework.region,
      adjustments: complianceFramework.adjustments,
    },
    details: {
      baseValuation: baseValuationUSD,
      methodResults: valuationResults,
      scenarios: generateScenarioAnalysis(params, frameworkAdjustedValuationUSD, assumptions),
      sensitivityAnalysis: performSensitivityAnalysis(params, frameworkAdjustedValuationUSD),
      industryMetrics: getIndustryMetrics(sector, subsector, stage),
    },
    assumptions,
  };
}

async function calculateScorecardValuation(
  params: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<{ value: number; details: Record<string, number> }> {
  const { teamExperience, intellectualProperty, totalAddressableMarket } = params;

  // Scorecard criteria and weights
  const criteria = {
    teamStrength: Math.min(teamExperience / 10, 1) * 0.3,
    ipStrength: {
      none: 0,
      pending: 0.3,
      registered: 0.7,
      multiple: 1
    }[intellectualProperty] * 0.2,
    marketSize: Math.min(totalAddressableMarket / 1e9, 1) * 0.2,
    growthPotential: assumptions.growthRate / 100 * 0.3
  };

  const baseValue = 1000000; // $1M base value for early-stage startups
  const totalScore = Object.values(criteria).reduce((a, b) => a + b, 0);

  return {
    value: baseValue * (1 + totalScore),
    details: criteria
  };
}

async function calculateChecklistValuation(
  params: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<{ value: number; details: Record<string, number> }> {
  const checklist = {
    team: {
      weight: 0.30,
      score: Math.min(params.teamExperience / 10, 1)
    },
    technology: {
      weight: 0.25,
      score: {
        none: 0.2,
        pending: 0.5,
        registered: 0.8,
        multiple: 1
      }[params.intellectualProperty]
    },
    marketSize: {
      weight: 0.20,
      score: Math.min(params.totalAddressableMarket / 1e9, 1)
    },
    competitiveDifferentiation: {
      weight: 0.15,
      score: {
        low: 0.3,
        medium: 0.6,
        high: 1
      }[params.competitiveDifferentiation]
    },
    regulatoryCompliance: {
      weight: 0.10,
      score: {
        notRequired: 1,
        inProgress: 0.5,
        compliant: 1
      }[params.regulatoryCompliance]
    }
  };

  const baseValue = 2000000; // $2M base value
  const weightedScore = Object.values(checklist).reduce(
    (acc, { weight, score }) => acc + weight * score,
    0
  );

  return {
    value: baseValue * weightedScore,
    details: Object.fromEntries(
      Object.entries(checklist).map(([key, { weight, score }]) => [
        key,
        weight * score
      ])
    )
  };
}

async function calculateVCMethodValuation(
  params: ValuationFormData,
  assumptions: FinancialAssumptions,
  sectorConfig: any
): Promise<{ value: number; details: Record<string, any> }> {
  const { stage, revenue, margins = 0 } = params;

  // Get stage-specific multiple from sector config
  const stageMultiple = sectorConfig.benchmarks.revenueMultiple[
    stage.includes('early') ? 'early' :
    stage.includes('growth') ? 'growth' : 'mature'
  ];

  // Adjust multiple based on margins
  const marginAdjustment = margins / sectorConfig.benchmarks.grossMargin;
  const adjustedMultiple = stageMultiple * Math.max(0.5, Math.min(1.5, marginAdjustment));

  // Calculate base valuation
  const baseValue = revenue * adjustedMultiple;

  // Apply growth premium
  const growthPremium = assumptions.growthRate > sectorConfig.benchmarks.growthRate
    ? (assumptions.growthRate / sectorConfig.benchmarks.growthRate - 1) * 0.5
    : 0;

  return {
    value: baseValue * (1 + growthPremium),
    details: {
      stageMultiple,
      marginAdjustment,
      growthPremium,
      baseValue,
      adjustedMultiple
    }
  };
}

async function calculateFirstChicagoValuation(
  params: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<{ value: number; details: Record<string, any> }> {
  // Generate three scenarios: Best, Base, Worst
  const scenarios = [
    { name: 'best', probability: 0.25, multiplier: 1.3 },
    { name: 'base', probability: 0.5, multiplier: 1.0 },
    { name: 'worst', probability: 0.25, multiplier: 0.7 }
  ];

  const scenarioResults = scenarios.map(scenario => {
    const adjustedAssumptions = {
      ...assumptions,
      growthRate: assumptions.growthRate * scenario.multiplier,
      margins: (params.margins || 0) * scenario.multiplier
    };

    // Calculate DCF for each scenario
    const dcfValue = calculateDCF({
      ...params,
      ...adjustedAssumptions
    }, adjustedAssumptions);

    return {
      scenario: scenario.name,
      probability: scenario.probability,
      value: dcfValue.value,
      assumptions: adjustedAssumptions
    };
  });

  // Calculate probability-weighted average
  const expectedValue = scenarioResults.reduce(
    (acc, { probability, value }) => acc + value * probability,
    0
  );

  return {
    value: expectedValue,
    details: {
      scenarios: scenarioResults,
      expectedValue
    }
  };
}

async function calculatePrecedentTransactions(
  params: ValuationFormData,
  assumptions: FinancialAssumptions,
  sectorConfig: any
): Promise<{ value: number; details: { transactions: any[] } }> {
  const { revenue } = params;
  const transactions = sectorConfig.precedentTransactions || [];
  const averageMultiple = transactions.reduce((sum, transaction) => sum + transaction.multiple, 0) / transactions.length;
  const value = revenue * averageMultiple;
  return { value, details: { transactions } };
}


async function calculateAssetBasedValuation(
  params: ValuationFormData
): Promise<{ value: number; details: { assets: number; liabilities: number } }> {
  const { assets, liabilities } = params;
  const netAssetValue = assets - liabilities;
  return { value: netAssetValue, details: { assets, liabilities } };
}

function calculateDCF(params: ValuationFormData, assumptions: FinancialAssumptions): {
  value: number;
  stages: Array<{
    year: number;
    fcf: number;
    presentValue: number;
    workingCapital: number;
    capex: number;
  }>;
} {
  const { revenue, margins = 0 } = params;
  const { discountRate, growthRate, terminalGrowthRate } = assumptions;

  let currentRevenue = revenue;
  let presentValue = 0;
  const stages = [];
  const projectionYears = 5;

  // Working capital and capex assumptions
  const workingCapitalRatio = 0.15; // 15% of revenue
  const capexRatio = 0.12; // 12% of revenue

  for (let year = 1; year <= projectionYears; year++) {
    currentRevenue *= (1 + (growthRate / 100));
    const ebitda = currentRevenue * (margins / 100);
    const workingCapital = currentRevenue * workingCapitalRatio;
    const capex = currentRevenue * capexRatio;

    // Free cash flow calculation considering working capital and capex
    const fcf = ebitda * (1 - 0.25) - workingCapital - capex; // Assuming 25% tax rate
    const presentValueFactor = Math.pow(1 + (discountRate / 100), year);
    const discountedValue = fcf / presentValueFactor;

    presentValue += discountedValue;
    stages.push({
      year,
      fcf,
      presentValue: discountedValue,
      workingCapital,
      capex,
    });
  }

  // Calculate terminal value using enhanced Gordon Growth Model
  const terminalFCF = stages[stages.length - 1].fcf * (1 + (terminalGrowthRate / 100));
  const terminalValue = terminalFCF / ((discountRate / 100) - (terminalGrowthRate / 100));
  const discountedTerminalValue = terminalValue / Math.pow(1 + (discountRate / 100), projectionYears);

  return {
    value: presentValue + discountedTerminalValue,
    stages,
  };
}

function calculateComparables(params: ValuationFormData, assumptions: FinancialAssumptions): {
  value: number;
  multiples: {
    revenue: number;
    ebitda: number;
    ebit: number;
    details: Array<{
      metric: string;
      range: { min: number; median: number; max: number };
      selectedMultiple: number;
      reasoning: string;
    }>;
  };
} {
  const { revenue, stage, sector, margins = 0 } = params;

  // Enhanced industry-specific multiples based on comprehensive market data
  const baseMultiples = {
    technology: {
      revenue: { min: 3, median: 5, max: 8 },
      ebitda: { min: 12, median: 15, max: 20 },
      ebit: { min: 10, median: 13, max: 18 }
    },
    digital: {
      revenue: { min: 2, median: 4, max: 6 },
      ebitda: { min: 10, median: 12, max: 16 },
      ebit: { min: 8, median: 10, max: 14 }
    },
    enterprise: {
      revenue: { min: 2, median: 3, max: 5 },
      ebitda: { min: 8, median: 10, max: 14 },
      ebit: { min: 7, median: 9, max: 12 }
    },
    // Add similar structures for other industries...
  };

  // Stage-based adjustments with more granular factors
  const stageMultiplier = stage.includes('revenue_scaling') ? 1.3 :
    stage.includes('established') ? 1.2 :
    stage.includes('revenue') ? 1.1 :
    0.9;

  const industryMultiples = baseMultiples[sector as keyof typeof baseMultiples] ||
    baseMultiples.enterprise; // Default to enterprise multiples if industry not found

  // Calculate multiples with detailed reasoning
  const multiples = {
    revenue: industryMultiples.revenue.median * stageMultiplier,
    ebitda: industryMultiples.ebitda.median * stageMultiplier,
    ebit: industryMultiples.ebit.median * stageMultiplier,
    details: [
      {
        metric: "Revenue",
        range: industryMultiples.revenue,
        selectedMultiple: industryMultiples.revenue.median * stageMultiplier,
        reasoning: `Based on ${sector} sector median with ${stageMultiplier}x adjustment for ${stage} stage`,
      },
      {
        metric: "EBITDA",
        range: industryMultiples.ebitda,
        selectedMultiple: industryMultiples.ebitda.median * stageMultiplier,
        reasoning: `Reflects profitability focus with margin of ${margins}%`,
      },
      {
        metric: "EBIT",
        range: industryMultiples.ebit,
        selectedMultiple: industryMultiples.ebit.median * stageMultiplier,
        reasoning: "Considers operating performance excluding D&A impact",
      },
    ],
  };

  // Calculate blended valuation using multiple approaches
  const revenueValue = revenue * multiples.revenue;
  const ebitdaValue = revenue * (margins / 100) * multiples.ebitda;
  const ebitValue = revenue * ((margins * 0.9) / 100) * multiples.ebit; // Assuming D&A is 10% of EBITDA

  return {
    value: (revenueValue * 0.4 + ebitdaValue * 0.35 + ebitValue * 0.25),
    multiples,
  };
}

function calculateMarketSentimentAdjustment(sentiment: MarketSentiment): number {
  // Calculate weighted sentiment adjustment
  const weights = {
    marketConditions: 0.3,
    industryTrends: 0.3,
    competitiveLandscape: 0.2,
    regulatoryEnvironment: 0.2,
  };

  const weightedScore = Object.entries(sentiment.sentimentByFactor).reduce(
    (acc, [factor, score]) => acc + score * weights[factor as keyof typeof weights],
    0
  );

  // Transform sentiment score to an adjustment factor (0.8 to 1.2 range)
  return 0.8 + (weightedScore * 0.4);
}

function generateScenarioAnalysis(
  params: ValuationFormData,
  baseValue: number,
  assumptions: FinancialAssumptions
): {
  worst: { value: number; assumptions: Record<string, number>; probability: number };
  base: { value: number; assumptions: Record<string, number>; probability: number };
  best: { value: number; assumptions: Record<string, number>; probability: number };
  expectedValue: number;
} {
  // Generate scenarios using Monte Carlo simulation principles
  const worst = {
    value: baseValue * 0.7,
    assumptions: {
      growthRate: assumptions.growthRate * 0.7,
      margins: (params.margins || 0) * 0.8,
      discountRate: assumptions.discountRate * 1.2,
    },
    probability: 0.25,
  };

  const base = {
    value: baseValue,
    assumptions: {
      growthRate: assumptions.growthRate,
      margins: params.margins || 0,
      discountRate: assumptions.discountRate,
    },
    probability: 0.5,
  };

  const best = {
    value: baseValue * 1.3,
    assumptions: {
      growthRate: assumptions.growthRate * 1.3,
      margins: (params.margins || 0) * 1.2,
      discountRate: assumptions.discountRate * 0.9,
    },
    probability: 0.25,
  };

  // Calculate probability-weighted expected value
  const expectedValue =
    worst.value * worst.probability +
    base.value * base.probability +
    best.value * best.probability;

  return {
    worst,
    base,
    best,
    expectedValue,
  };
}

function performSensitivityAnalysis(
  params: ValuationFormData,
  baseValue: number
): Array<{
  factor: string;
  impact: Array<{ change: number; value: number }>;
}> {
  const factors = [
    {
      name: "Growth Rate",
      changes: [-0.2, -0.1, 0, 0.1, 0.2],
    },
    {
      name: "Margins",
      changes: [-0.15, -0.075, 0, 0.075, 0.15],
    },
    {
      name: "Discount Rate",
      changes: [-0.02, -0.01, 0, 0.01, 0.02],
    },
  ];

  return factors.map(factor => ({
    factor: factor.name,
    impact: factor.changes.map(change => ({
      change: change * 100, // Convert to percentage
      value: baseValue * (1 + (change * (factor.name === "Discount Rate" ? -2 : 1))),
    })),
  }));
}

function getIndustryMetrics(sector: string, subsector: string, stage: string): {
  averageValuation: number;
  medianMultiple: number;
  growthRate: number;
  benchmarks: Record<string, number>;
} {
  // Placeholder - replace with actual data retrieval
  const metrics = {
    "technology": {
      "saas": {
        "seed": { averageValuation: 5000000, medianMultiple: 3, growthRate: 30, benchmarks: { churnRate: 0.1 } },
        "seriesA": { averageValuation: 20000000, medianMultiple: 5, growthRate: 25, benchmarks: { churnRate: 0.05 } }
      }
    }
  };
  const config = metrics[sector]?.[subsector]?.[stage];
  return config || { averageValuation: 10000000, medianMultiple: 5.2, growthRate: 15.5, benchmarks: { revenuePerEmployee: 200000, profitMargin: 25.5, customerAcquisitionCost: 500 } };
}

export type { CurrencyRates, FinancialAssumptions };