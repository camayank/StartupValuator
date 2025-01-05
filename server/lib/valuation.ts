import type { ValuationFormData } from "../../client/src/lib/validations";
import { industries, businessStages } from "../../client/src/lib/validations";

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

// Comprehensive industry database based on Damodaran's research
const INDUSTRY_METRICS = {
  // Technology Sector
  software_system: {
    base: 15,
    growth: 1.8,
    beta: 1.3,
    reinvestmentRate: 0.30,
    operatingMargin: 0.25,
    sustainableGrowth: 0.18,
    rdExpenseRatio: 0.18,
    customerAcquisitionCost: 0.35,
    churnRate: 0.15,
  },
  software_internet: {
    base: 16,
    growth: 2.0,
    beta: 1.4,
    reinvestmentRate: 0.32,
    operatingMargin: 0.23,
    sustainableGrowth: 0.20,
    rdExpenseRatio: 0.20,
    customerAcquisitionCost: 0.40,
    churnRate: 0.18,
  },
  semiconductors: {
    base: 12,
    growth: 1.4,
    beta: 1.5,
    reinvestmentRate: 0.35,
    operatingMargin: 0.20,
    sustainableGrowth: 0.15,
    rdExpenseRatio: 0.22,
    inventoryTurnover: 4.5,
  },
  ecommerce_retail: {
    base: 8,
    growth: 1.2,
    beta: 1.1,
    reinvestmentRate: 0.20,
    operatingMargin: 0.18,
    sustainableGrowth: 0.12,
    workingCapitalTurnover: 8.5,
    marketingEfficiency: 0.25,
    customerLifetimeValue: 2.8,
    inventoryTurnover: 6.5,
  },
  tech: {
    base: 12,
    growth: 1.5,
    beta: 1.2,
    reinvestmentRate: 0.25,
    operatingMargin: 0.22,
    sustainableGrowth: 0.15,
    workingCapitalTurnover: 6.2,
    rdExpenseRatio: 0.12,
    customerAcquisitionCost: 0.35,
    churnRate: 0.15,
  },
  ecommerce: {
    base: 8,
    growth: 1.2,
    beta: 1.1,
    reinvestmentRate: 0.20,
    operatingMargin: 0.18,
    sustainableGrowth: 0.12,
    workingCapitalTurnover: 8.5,
    marketingEfficiency: 0.25,
    customerLifetimeValue: 2.8,
    inventoryTurnover: 6.5,
  },
  saas: {
    base: 15,
    growth: 1.8,
    beta: 1.3,
    reinvestmentRate: 0.30,
    operatingMargin: 0.25,
    sustainableGrowth: 0.18,
    workingCapitalTurnover: 5.8,
    rdExpenseRatio: 0.18,
    arpu: 150,
    grossMargin: 0.75,
  },
  marketplace: {
    base: 10,
    growth: 1.4,
    beta: 1.15,
    reinvestmentRate: 0.22,
    operatingMargin: 0.20,
    sustainableGrowth: 0.14,
    workingCapitalTurnover: 7.2,
    takeRate: 0.15,
    networkEffectMultiplier: 1.8,
    userAcquisitionCost: 0.28,
  },
};

// Global market data and regional compliance standards
const REGIONAL_METRICS = {
  GLOBAL: {
    riskFreeRate: 0.042,
    marketRiskPremium: 0.065,
    countryRiskPremium: 0,
    smallCompanyPremium: 0.035,
    standardsBody: "IVSC",
    valuationStandard: "IVS",
    requiredDisclosures: ["methodology", "assumptions", "limitations"],
  },
  INDIA: {
    riskFreeRate: 0.074,
    marketRiskPremium: 0.085,
    countryRiskPremium: 0.025,
    smallCompanyPremium: 0.045,
    standardsBody: "IBBI",
    valuationStandard: "IBBI Rules",
    requiredDisclosures: ["registered_valuer", "ibbi_certification", "methodology"],
  },
  USA: {
    riskFreeRate: 0.042,
    marketRiskPremium: 0.065,
    countryRiskPremium: 0,
    smallCompanyPremium: 0.035,
    standardsBody: "ASA",
    valuationStandard: "409A",
    requiredDisclosures: ["fair_market_value", "premise_of_value", "control_premium"],
  },
  EU: {
    riskFreeRate: 0.025,
    marketRiskPremium: 0.060,
    countryRiskPremium: 0.01,
    smallCompanyPremium: 0.035,
    standardsBody: "TEGOVA",
    valuationStandard: "EVS",
    requiredDisclosures: ["methodology", "independence_statement", "compliance_statement"],
  },
};

function inferRegionAndStandards(currency: string, revenue: number) {
  switch (currency) {
    case 'INR':
      return {
        region: 'INDIA',
        metrics: REGIONAL_METRICS.INDIA,
        applicableStandards: revenue > 100000000 ? ['IBBI', 'SEBI'] : ['IBBI'],
      };
    case 'USD':
      return {
        region: 'USA',
        metrics: REGIONAL_METRICS.USA,
        applicableStandards: revenue > 1000000 ? ['409A', 'ASC820'] : ['409A'],
      };
    case 'EUR':
      return {
        region: 'EU',
        metrics: REGIONAL_METRICS.EU,
        applicableStandards: ['EVS', 'IFRS13'],
      };
    default:
      return {
        region: 'GLOBAL',
        metrics: REGIONAL_METRICS.GLOBAL,
        applicableStandards: ['IVS'],
      };
  }
}

// Update the stage-based logic to handle the new detailed stages
function getStageMultiplier(stage: keyof typeof businessStages): number {
  const stageMultipliers = {
    // Pre-revenue stages
    ideation_unvalidated: 0.4,
    ideation_validated: 0.6,
    mvp_development: 0.7,
    mvp_early_traction: 0.9,

    // Early revenue stages
    revenue_early: 1.1,
    revenue_growing: 1.3,
    revenue_scaling: 1.5,

    // Established stages
    established_local: 1.4,
    established_regional: 1.6,
    established_international: 1.8,

    // Special situations
    pre_ipo: 2.0,
    acquisition_target: 1.7,
    restructuring: 0.8,
    liquidation: 0.3,
  };

  return stageMultipliers[stage] || 1.0;
}

function calculateWACC(params: ValuationFormData): number {
  const { industry, currency, revenue, stage } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];
  const { metrics } = inferRegionAndStandards(currency, revenue);

  // Enhanced WACC calculation with industry-specific adjustments
  const costOfEquity = metrics.riskFreeRate +
    (industryData.beta * metrics.marketRiskPremium) +
    metrics.countryRiskPremium +
    metrics.smallCompanyPremium;

  // Adjust for company stage and size
  const stageAdjustment = stage.includes('revenue_scaling') ? -0.01 :
    stage.includes('ideation') ? 0.02 : 0;
  const sizeAdjustment = revenue < 1000000 ? 0.02 : revenue > 10000000 ? -0.01 : 0;

  return costOfEquity + stageAdjustment + sizeAdjustment;
}

// The rest of the valuation logic remains similar, but we'll update the growth rate inference
function inferGrowthRate(params: ValuationFormData): number {
  const { industry, stage, growthRate, revenue } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  if (growthRate) {
    const stageMultiplier = getStageMultiplier(stage as keyof typeof businessStages);
    const maxGrowth = industryData.sustainableGrowth * (
      stage.includes('ideation') || stage.includes('mvp') ? 3 :
      stage.includes('revenue_early') || stage.includes('revenue_growing') ? 2 :
      1.5
    );
    return Math.min(growthRate / 100, maxGrowth);
  }

  const baseGrowth = industryData.sustainableGrowth;
  const stageMultiplier = getStageMultiplier(stage as keyof typeof businessStages);
  const sizeAdjustment = revenue < 1000000 ? 0.2 :
    revenue < 10000000 ? 0.1 :
    revenue < 100000000 ? 0 : -0.1;

  return (baseGrowth * stageMultiplier) + sizeAdjustment;
}

function calculateDCF(params: ValuationFormData): {
  value: number;
  stages: Array<{
    year: number;
    revenue: number;
    fcf: number;
    presentValue: number;
  }>;
} {
  const { revenue, margins, industry } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  // Enhanced DCF parameters
  const wacc = calculateWACC(params);
  const growthRate = inferGrowthRate(params);
  const operatingMargin = margins ? margins / 100 : industryData.operatingMargin;
  const explicitPeriod = 5;
  const terminalGrowthRate = Math.min(growthRate / 2, 0.03);

  let presentValue = 0;
  let currentRevenue = revenue;
  let lastFreeCashFlow = 0;
  const stages = [];

  // Calculate explicit period cash flows with detailed tracking
  for (let year = 1; year <= explicitPeriod; year++) {
    const projectedRevenue = currentRevenue * (1 + growthRate);
    const operatingProfit = projectedRevenue * operatingMargin;
    const freeCashFlow = operatingProfit * (1 - industryData.reinvestmentRate);
    const discountedValue = freeCashFlow / Math.pow(1 + wacc, year);

    presentValue += discountedValue;
    currentRevenue = projectedRevenue;
    lastFreeCashFlow = freeCashFlow;

    stages.push({
      year,
      revenue: projectedRevenue,
      fcf: freeCashFlow,
      presentValue: discountedValue,
    });
  }

  // Terminal value calculation using Gordon Growth Model
  const terminalValue = (lastFreeCashFlow * (1 + terminalGrowthRate)) /
    (wacc - terminalGrowthRate);
  const presentTerminalValue = terminalValue / Math.pow(1 + wacc, explicitPeriod);

  return {
    value: presentValue + presentTerminalValue,
    stages,
  };
}

function calculateComparables(params: ValuationFormData): {
  value: number;
  comparables: Array<{
    metric: string;
    multiple: number;
    value: number;
  }>;
} {
  const { revenue, growthRate, margins, industry, stage } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  // Calculate multiple adjustments
  const baseMultiple = industryData.base;
  const growthAdjustment = growthRate > industryData.sustainableGrowth * 100 ? 0.3 :
    growthRate > industryData.sustainableGrowth * 50 ? 0.15 : 0;
  const marginAdjustment = margins > industryData.operatingMargin * 100 ? 0.25 :
    margins > industryData.operatingMargin * 50 ? 0.1 : 0;

  // Stage-based adjustments
  const stageMultiplier = getStageMultiplier(stage as keyof typeof businessStages);

  // Calculate different valuation multiples
  const revenueMultiple = baseMultiple * (1 + growthAdjustment + marginAdjustment) * stageMultiplier;
  const ebitdaMultiple = (baseMultiple * 0.8) * (1 + marginAdjustment) * stageMultiplier;
  const bookMultiple = (baseMultiple * 0.6) * stageMultiplier;

  const comparables = [
    {
      metric: "Revenue Multiple",
      multiple: revenueMultiple,
      value: revenue * revenueMultiple,
    },
    {
      metric: "EBITDA Multiple",
      multiple: ebitdaMultiple,
      value: revenue * (margins / 100) * ebitdaMultiple,
    },
    {
      metric: "Book Value Multiple",
      multiple: bookMultiple,
      value: revenue * 0.3 * bookMultiple, // Assuming book value is 30% of revenue
    },
  ];

  // Weighted average of different multiples
  const weights = { revenue: 0.5, ebitda: 0.3, book: 0.2 };
  const weightedValue = comparables.reduce((sum, comp, index) => {
    const weight = Object.values(weights)[index];
    return sum + (comp.value * weight);
  }, 0);

  return {
    value: weightedValue,
    comparables,
  };
}

export function calculateValuation(params: ValuationFormData) {
  const { currency, stage, industry, revenue } = params;

  // Convert revenue to USD for calculations
  const revenueUSD = params.revenue / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  const paramsUSD = { ...params, revenue: revenueUSD };

  // Get regional standards and metrics
  const { region, metrics, applicableStandards } = inferRegionAndStandards(currency, revenue);

  // Calculate valuations using different methods
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

  // Calculate confidence score based on comprehensive criteria
  const confidenceScore = Math.min(100, Math.max(50,
    60 + // Base confidence
    (params.revenue ? 10 : 0) + // Revenue data available
    (params.margins ? 10 : 0) + // Margin data available
    (params.growthRate ? 10 : 0) + // Growth data available
    (stage.includes('revenue_scaling') || stage.includes('established') ? 10 : 0) + // Later stage companies
    (applicableStandards.length > 1 ? 5 : 0) + // Multiple compliance standards
    (region !== 'GLOBAL' ? 5 : 0) // Region-specific insights
  ));

  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  // Enhanced scenario analysis
  const scenarios = {
    worst: {
      value: finalValuationUSD * 0.7,
      assumptions: {
        growthRate: inferGrowthRate(paramsUSD) * 0.7,
        margins: (params.margins || industryData.operatingMargin * 100) * 0.8,
      },
    },
    base: {
      value: finalValuationUSD,
      assumptions: {
        growthRate: inferGrowthRate(paramsUSD),
        margins: params.margins || industryData.operatingMargin * 100,
      },
    },
    best: {
      value: finalValuationUSD * 1.3,
      assumptions: {
        growthRate: inferGrowthRate(paramsUSD) * 1.3,
        margins: (params.margins || industryData.operatingMargin * 100) * 1.2,
      },
    },
  };

  // Convert back to requested currency
  const finalValuation = finalValuationUSD * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];

  return {
    valuation: Math.max(finalValuation, 0),
    multiplier: revenueUSD > 0 ? finalValuationUSD / revenueUSD : industryData.base,
    methodology: `Weighted Average (${dcfWeight * 100}% DCF, ${comparablesWeight * 100}% Market Comparables)`,
    confidenceScore,
    details: {
      baseValuation: finalValuationUSD,
      methods: {
        dcf: {
          value: dcfAnalysis.value,
          stages: dcfAnalysis.stages,
        },
        comparables: {
          value: comparablesAnalysis.value,
          analysis: comparablesAnalysis.comparables,
        },
      },
      scenarios,
      assumptions: {
        wacc: calculateWACC(paramsUSD),
        growthRate: inferGrowthRate(paramsUSD),
        beta: industryData.beta,
        riskFreeRate: metrics.riskFreeRate,
        marketRiskPremium: metrics.marketRiskPremium,
        operatingMargin: industryData.operatingMargin,
      },
    },
    compliance: {
      region,
      standards: applicableStandards,
      requirements: metrics.requiredDisclosures,
    },
    industryBenchmarks: {
      ...industryData,
      peerComparison: {
        revenue_multiple: industryData.base,
        operating_margin: industryData.operatingMargin,
        growth_rate: industryData.sustainableGrowth,
      },
    },
    currencyConversion: {
      rates: EXCHANGE_RATES,
      baseRate: EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES],
      baseCurrency: currency,
    },
  };
}

// Export necessary functions and types
export {
  calculateWACC,
  inferRegionAndStandards,
  INDUSTRY_METRICS,
  REGIONAL_METRICS,
  type CurrencyRates,
};