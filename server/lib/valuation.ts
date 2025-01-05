import type { ValuationFormData } from "../../client/src/lib/validations";
import { stageMultipliers, currencies } from "../../client/src/lib/validations";

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

// Industry-specific metrics based on Damodaran's database
const INDUSTRY_METRICS = {
  tech: {
    base: 12,
    growth: 1.5,
    beta: 1.2,
    reinvestmentRate: 0.25,
    operatingMargin: 0.22,
    sustainableGrowth: 0.15,
  },
  ecommerce: {
    base: 8,
    growth: 1.2,
    beta: 1.1,
    reinvestmentRate: 0.20,
    operatingMargin: 0.18,
    sustainableGrowth: 0.12,
  },
  saas: {
    base: 15,
    growth: 1.8,
    beta: 1.3,
    reinvestmentRate: 0.30,
    operatingMargin: 0.25,
    sustainableGrowth: 0.18,
  },
  marketplace: {
    base: 10,
    growth: 1.4,
    beta: 1.15,
    reinvestmentRate: 0.22,
    operatingMargin: 0.20,
    sustainableGrowth: 0.14,
  },
};

// Regional market data and risk premiums
const REGIONAL_METRICS = {
  GLOBAL: {
    riskFreeRate: 0.042, // US 10-year treasury yield as global benchmark
    marketRiskPremium: 0.065,
    countryRiskPremium: 0,
    smallCompanyPremium: 0.035,
  },
  INDIA: {
    riskFreeRate: 0.074,
    marketRiskPremium: 0.085,
    countryRiskPremium: 0.025,
    smallCompanyPremium: 0.045,
  },
  EU: {
    riskFreeRate: 0.025,
    marketRiskPremium: 0.060,
    countryRiskPremium: 0.01,
    smallCompanyPremium: 0.035,
  },
};

function inferRegionalMetrics(currency: string) {
  switch (currency) {
    case 'INR':
      return REGIONAL_METRICS.INDIA;
    case 'EUR':
      return REGIONAL_METRICS.EU;
    default:
      return REGIONAL_METRICS.GLOBAL;
  }
}

function calculateWACC(params: ValuationFormData): number {
  const { industry, currency } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];
  const regionalData = inferRegionalMetrics(currency);

  // Cost of Equity calculation using CAPM
  const costOfEquity = regionalData.riskFreeRate +
    (industryData.beta * regionalData.marketRiskPremium) +
    regionalData.countryRiskPremium +
    regionalData.smallCompanyPremium;

  // For early-stage companies, we assume 100% equity financing
  return costOfEquity;
}

function inferGrowthRate(params: ValuationFormData): number {
  const { industry, stage, growthRate } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  // If user provided growth rate, validate and adjust if needed
  if (growthRate) {
    // Cap the growth rate based on stage and industry
    const maxGrowth = industryData.sustainableGrowth * 2;
    return Math.min(growthRate / 100, maxGrowth);
  }

  // Infer growth rate based on stage and industry
  const stageMultiplier = {
    ideation: 0.5,
    validation: 0.8,
    growth: 1.2,
    scaling: 1.5,
    exit: 1.0,
    liquidation: 0.3,
  }[stage] || 1.0;

  return industryData.sustainableGrowth * stageMultiplier;
}

function calculateDCF(params: ValuationFormData): number {
  const { revenue, margins, industry } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  // Calculate key metrics
  const wacc = calculateWACC(params);
  const growthRate = inferGrowthRate(params);
  const operatingMargin = margins ? margins / 100 : industryData.operatingMargin;

  // DCF parameters
  const explicitPeriod = 5;
  const terminalGrowthRate = Math.min(growthRate / 2, 0.03); // Terminal growth capped at 3%

  let presentValue = 0;
  let currentRevenue = revenue;
  let lastFreeCashFlow = 0;

  // Calculate explicit period cash flows
  for (let year = 1; year <= explicitPeriod; year++) {
    const projectedRevenue = currentRevenue * (1 + growthRate);
    const operatingProfit = projectedRevenue * operatingMargin;
    const freeCashFlow = operatingProfit * (1 - industryData.reinvestmentRate);

    presentValue += freeCashFlow / Math.pow(1 + wacc, year);
    currentRevenue = projectedRevenue;
    lastFreeCashFlow = freeCashFlow;
  }

  // Terminal value calculation using Gordon Growth Model
  const terminalValue = (lastFreeCashFlow * (1 + terminalGrowthRate)) / 
    (wacc - terminalGrowthRate);
  const presentTerminalValue = terminalValue / Math.pow(1 + wacc, explicitPeriod);

  return presentValue + presentTerminalValue;
}

function calculateComparables(params: ValuationFormData): number {
  const { revenue, growthRate, margins, industry, stage } = params;
  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];

  // Base multiple from industry data
  let revenueMultiple = industryData.base;

  // Growth adjustment
  const normalizedGrowth = growthRate / 100;
  if (normalizedGrowth > industryData.sustainableGrowth * 1.5) {
    revenueMultiple *= 1.3;
  } else if (normalizedGrowth > industryData.sustainableGrowth) {
    revenueMultiple *= 1.15;
  }

  // Margin adjustment
  const normalizedMargin = margins / 100;
  if (normalizedMargin > industryData.operatingMargin * 1.2) {
    revenueMultiple *= 1.25;
  } else if (normalizedMargin > industryData.operatingMargin) {
    revenueMultiple *= 1.1;
  }

  // Stage adjustment
  const stageMultiplier = {
    ideation: 0.7,
    validation: 0.9,
    growth: 1.1,
    scaling: 1.3,
    exit: 1.2,
    liquidation: 0.5,
  }[stage] || 1.0;

  return revenue * revenueMultiple * stageMultiplier;
}

function calculateValuation(params: ValuationFormData) {
  const { currency, stage, industry } = params;

  // Convert revenue to USD for calculations
  const revenueUSD = params.revenue / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  const paramsUSD = { ...params, revenue: revenueUSD };

  // Calculate valuations using different methods
  const dcfValuation = calculateDCF(paramsUSD);
  const comparablesValuation = calculateComparables(paramsUSD);

  // Determine method weights based on stage
  let dcfWeight = 0.4;
  let comparablesWeight = 0.6;

  if (stage === 'scaling' || stage === 'exit') {
    dcfWeight = 0.6;
    comparablesWeight = 0.4;
  } else if (stage === 'ideation' || stage === 'validation') {
    dcfWeight = 0.2;
    comparablesWeight = 0.8;
  }

  // Calculate weighted average valuation
  const finalValuationUSD = (dcfValuation * dcfWeight) + (comparablesValuation * comparablesWeight);

  // Calculate confidence score based on data quality
  const confidenceScore = Math.min(100, Math.max(50,
    60 + // Base confidence
    (params.revenue ? 10 : 0) + // Revenue data available
    (params.margins ? 10 : 0) + // Margin data available
    (params.growthRate ? 10 : 0) + // Growth data available
    (stage === 'scaling' || stage === 'exit' ? 10 : 0) // Later stage companies
  ));

  // Convert back to requested currency
  const finalValuation = finalValuationUSD * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];

  // Calculate scenario analysis
  const scenarios = {
    worst: finalValuationUSD * 0.7,
    base: finalValuationUSD,
    best: finalValuationUSD * 1.3,
  };

  const industryData = INDUSTRY_METRICS[industry as keyof typeof INDUSTRY_METRICS];
  const regionalData = inferRegionalMetrics(currency);

  return {
    valuation: Math.max(finalValuation, 0),
    multiplier: revenueUSD > 0 ? finalValuationUSD / revenueUSD : industryData.base,
    methodology: `Weighted Average (${dcfWeight * 100}% DCF, ${comparablesWeight * 100}% Market Comparables)`,
    confidenceScore,
    details: {
      baseValuation: finalValuationUSD,
      methods: {
        dcf: dcfValuation,
        comparables: comparablesValuation,
      },
      scenarios,
      assumptions: {
        wacc: calculateWACC(paramsUSD),
        growthRate: inferGrowthRate(paramsUSD),
        beta: industryData.beta,
        riskFreeRate: regionalData.riskFreeRate,
        marketRiskPremium: regionalData.marketRiskPremium,
        operatingMargin: industryData.operatingMargin,
      }
    },
    currencyConversion: {
      rates: EXCHANGE_RATES,
      baseRate: EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES],
      baseCurrency: currency,
    },
  };
}

export { calculateValuation, inferRegionalMetrics, calculateWACC };

function calculateQualitativeScore(params: ValuationFormData): number {
  let score = 1;

  // Intellectual Property impact
  const ipMultipliers = {
    none: 1,
    pending: 1.2,
    registered: 1.5,
  };
  if (params.intellectualProperty) {
    score *= ipMultipliers[params.intellectualProperty];
  }

  // Team Experience impact (0-10 scale)
  if (params.teamExperience) {
    score *= (1 + (params.teamExperience * 0.05));
  }

  // Market Validation impact
  const marketValidationMultipliers = {
    none: 1,
    early: 1.3,
    proven: 1.6,
  };
  if (params.marketValidation) {
    score *= marketValidationMultipliers[params.marketValidation];
  }

  // Competitive Differentiation impact
  const competitiveMultipliers = {
    low: 1,
    medium: 1.25,
    high: 1.5,
  };
  if (params.competitiveDifferentiation) {
    score *= competitiveMultipliers[params.competitiveDifferentiation];
  }

  // Scalability impact
  const scalabilityMultipliers = {
    limited: 1,
    moderate: 1.3,
    high: 1.6,
  };
  if (params.scalability) {
    score *= scalabilityMultipliers[params.scalability];
  }

  return score;
}

function getStageRequirements(stage: keyof typeof stageMultipliers): string[] {
  const requirements: Record<string, string[]> = {
    ideation: [
      "Detailed business plan",
      "Market research validation",
      "MVP development plan",
      "Initial team formation",
    ],
    validation: [
      "Working MVP",
      "Initial customer feedback",
      "Product-market fit validation",
      "Revenue generation plan",
    ],
    growth: [
      "Consistent revenue growth",
      "Scalable operations",
      "Market expansion strategy",
      "Strong team structure",
    ],
    scaling: [
      "Proven business model",
      "Significant market share",
      "International expansion capability",
      "Strong financial metrics",
    ],
    exit: [
      "Stable financial performance",
      "Strong market position",
      "Attractive acquisition prospects",
      "Well-documented processes",
    ],
    liquidation: [
      "Asset valuation",
      "Debt assessment",
      "Legal compliance",
      "Orderly wind-down plan",
    ],
  };

  return requirements[stage] || [];
}