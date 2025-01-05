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

const INDUSTRY_MULTIPLIERS = {
  tech: { base: 12, growth: 1.5, beta: 1.2 },
  ecommerce: { base: 8, growth: 1.2, beta: 1.1 },
  saas: { base: 15, growth: 1.8, beta: 1.3 },
  marketplace: { base: 10, growth: 1.4, beta: 1.15 },
};

// Regional compliance standards
const REGIONAL_ADJUSTMENTS = {
  IBBI: {
    riskFreeRate: 0.074, // India 10-year government bond yield
    marketRiskPremium: 0.085,
    smallCompanyPremium: 0.035,
  },
  USA_409A: {
    riskFreeRate: 0.042, // US 10-year treasury yield
    marketRiskPremium: 0.065,
    smallCompanyPremium: 0.025,
  },
};

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

function calculateDCF(params: ValuationFormData, region: 'IBBI' | 'USA_409A' = 'IBBI'): number {
  const { revenue, growthRate, margins, industry } = params;
  const industryData = INDUSTRY_MULTIPLIERS[industry as keyof typeof INDUSTRY_MULTIPLIERS];
  const regionalData = REGIONAL_ADJUSTMENTS[region];

  // Calculate WACC
  const beta = industryData.beta;
  const costOfEquity = regionalData.riskFreeRate + 
    (beta * regionalData.marketRiskPremium) + 
    regionalData.smallCompanyPremium;

  // Simplified DCF calculation
  const projectionYears = 5;
  const terminalGrowthRate = Math.min(growthRate / 100, 0.03); // Cap at 3%

  let presentValue = 0;
  let currentRevenue = revenue;

  // Calculate present value of projected cash flows
  for (let year = 1; year <= projectionYears; year++) {
    const projectedRevenue = currentRevenue * (1 + (growthRate / 100));
    const freeCashFlow = projectedRevenue * (margins / 100) * 0.7; // Assuming 70% of operating profit converts to FCF
    presentValue += freeCashFlow / Math.pow(1 + costOfEquity, year);
    currentRevenue = projectedRevenue;
  }

  // Terminal value calculation
  const terminalValue = (freeCashFlow * (1 + terminalGrowthRate)) / 
    (costOfEquity - terminalGrowthRate);
  const presentTerminalValue = terminalValue / Math.pow(1 + costOfEquity, projectionYears);

  return presentValue + presentTerminalValue;
}

function calculateComparables(params: ValuationFormData): number {
  const { revenue, growthRate, margins, industry } = params;
  const industryData = INDUSTRY_MULTIPLIERS[industry as keyof typeof INDUSTRY_MULTIPLIERS];

  // Base multiple adjusted for growth and margins
  let revenueMultiple = industryData.base;

  // Adjust multiple based on growth rate
  if (growthRate > 50) revenueMultiple *= 1.3;
  else if (growthRate > 30) revenueMultiple *= 1.2;
  else if (growthRate > 15) revenueMultiple *= 1.1;

  // Adjust multiple based on margins
  if (margins > 30) revenueMultiple *= 1.25;
  else if (margins > 20) revenueMultiple *= 1.15;
  else if (margins > 10) revenueMultiple *= 1.05;

  return revenue * revenueMultiple;
}

function suggestValuationMethod(params: ValuationFormData): string {
  const { revenue, stage, marketValidation } = params;

  if (stage === 'ideation' || stage === 'validation') {
    return 'comparables'; // Early stage companies are better valued using comparables
  }

  if (revenue > 1000000 && marketValidation === 'proven') {
    return 'dcf'; // More established companies with predictable cash flows
  }

  return 'hybrid'; // Use both methods for a balanced approach
}

export function calculateValuation(params: ValuationFormData) {
  const { currency } = params;

  // Convert revenue to USD for calculations
  const revenueUSD = params.revenue / EXCHANGE_RATES[currency];
  params.revenue = revenueUSD;

  // Determine valuation method
  const suggestedMethod = suggestValuationMethod(params);

  // Calculate valuations using different methods
  const dcfValuation = calculateDCF(params);
  const comparablesValuation = calculateComparables(params);

  // Calculate hybrid valuation with weightage
  let finalValuationUSD = 0;
  let methodology = '';

  switch (suggestedMethod) {
    case 'dcf':
      finalValuationUSD = dcfValuation;
      methodology = "Discounted Cash Flow Analysis with Regional Adjustments";
      break;
    case 'comparables':
      finalValuationUSD = comparablesValuation;
      methodology = "Market Comparables with Industry-Specific Multiples";
      break;
    case 'hybrid':
      finalValuationUSD = (dcfValuation * 0.4) + (comparablesValuation * 0.6);
      methodology = "Hybrid Approach (40% DCF, 60% Market Comparables)";
      break;
  }

  // Apply qualitative adjustments
  const qualitativeMultiplier = calculateQualitativeScore(params);
  const qualitativeAdjustment = (finalValuationUSD * (qualitativeMultiplier - 1));
  finalValuationUSD += qualitativeAdjustment;

  // Calculate scenario analysis
  const scenarios = {
    worst: finalValuationUSD * 0.7,
    base: finalValuationUSD,
    best: finalValuationUSD * 1.3,
  };

  // Convert final valuation to requested currency
  const finalValuation = finalValuationUSD * EXCHANGE_RATES[currency];
  const multiplier = revenueUSD > 0 ? finalValuationUSD / revenueUSD : 
    INDUSTRY_MULTIPLIERS[params.industry as keyof typeof INDUSTRY_MULTIPLIERS].base;

  return {
    valuation: Math.max(finalValuation, 0),
    multiplier,
    methodology,
    details: {
      baseValuation: finalValuationUSD,
      adjustments: {
        qualitativeAdjustment,
      },
      scenarios,
      methods: {
        dcf: dcfValuation,
        comparables: comparablesValuation,
      },
    },
    currencyConversion: {
      rates: EXCHANGE_RATES,
      baseRate: EXCHANGE_RATES[currency],
      baseCurrency: currency,
    },
  };
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