import type { ValuationFormData } from "../../client/src/lib/validations";
import { stageMultipliers, currencies } from "../../client/src/lib/validations";

interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  JPY: number;
  INR: number;
}

// Placeholder exchange rates (in production, these would come from an API)
const EXCHANGE_RATES: CurrencyRates = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.79,
  JPY: 144.85,
  INR: 83.15,
};

const INDUSTRY_MULTIPLIERS = {
  tech: { base: 12, growth: 1.5 },
  ecommerce: { base: 8, growth: 1.2 },
  saas: { base: 15, growth: 1.8 },
  marketplace: { base: 10, growth: 1.4 },
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

export function calculateValuation(params: ValuationFormData) {
  const {
    revenue,
    growthRate,
    margins,
    industry,
    stage,
    currency,
    assetValue,
  } = params;

  // Convert revenue to USD for calculations
  const revenueUSD = revenue / EXCHANGE_RATES[currency];

  // Get industry multipliers
  const industryData = INDUSTRY_MULTIPLIERS[industry as keyof typeof INDUSTRY_MULTIPLIERS];
  const baseMultiplier = industryData.base;
  const industryGrowthFactor = industryData.growth;

  // Get stage-based multiplier range
  const stageRange = stageMultipliers[stage as keyof typeof stageMultipliers];
  const stageMultiplier = stageRange.min + 
    ((stageRange.max - stageRange.min) * (Math.max(0, Math.min(growthRate, 100)) / 100));

  // Calculate base valuation
  let baseValuation = revenueUSD * baseMultiplier * stageMultiplier;

  // For liquidation stage, consider asset value
  if (stage === 'liquidation' && assetValue) {
    baseValuation = Math.max(assetValue, baseValuation * 0.5);
  }

  // Calculate adjustments
  const growthAdjustment = (growthRate / 100) * baseValuation * industryGrowthFactor;
  const marginsAdjustment = (margins / 100) * baseValuation * 0.5;

  // Apply qualitative factors
  const qualitativeMultiplier = calculateQualitativeScore(params);
  const qualitativeAdjustment = (baseValuation * (qualitativeMultiplier - 1));

  // Calculate final valuation in USD
  const finalValuationUSD = baseValuation + growthAdjustment + marginsAdjustment + qualitativeAdjustment;

  // Convert final valuation to requested currency
  const finalValuation = finalValuationUSD * EXCHANGE_RATES[currency];

  // Generate qualitative factor analysis
  const qualitativeFactors = [];
  if (params.intellectualProperty) {
    qualitativeFactors.push({
      factor: "Intellectual Property",
      impact: (params.intellectualProperty === "registered" ? 0.5 : 0.2),
      description: `${params.intellectualProperty.charAt(0).toUpperCase() + params.intellectualProperty.slice(1)} IP increases company value`,
    });
  }

  if (params.teamExperience) {
    qualitativeFactors.push({
      factor: "Team Experience",
      impact: params.teamExperience * 0.05,
      description: `Team experience score of ${params.teamExperience}/10 impacts valuation`,
    });
  }

  // Calculate stage appropriateness
  const stageRequirements = getStageRequirements(stage as keyof typeof stageMultipliers);
  const stageAppropriateness = Math.min(
    100,
    Math.max(
      0,
      50 + // Base score
      (params.teamExperience ? 10 : 0) +
      (params.marketValidation === "proven" ? 20 : params.marketValidation === "early" ? 10 : 0) +
      (params.intellectualProperty === "registered" ? 20 : params.intellectualProperty === "pending" ? 10 : 0)
    )
  );

  return {
    valuation: Math.max(finalValuation, 0),
    multiplier: revenue > 0 ? finalValuationUSD / revenueUSD : baseMultiplier,
    methodology: stage === 'liquidation' 
      ? "Asset-Based Valuation with Revenue Multiple Comparison"
      : "Revenue Multiple with Stage-Based and Qualitative Adjustments",
    details: {
      baseValuation,
      adjustments: {
        growthAdjustment,
        marginsAdjustment,
        qualitativeAdjustment,
      },
      qualitativeFactors,
    },
    stageAnalysis: {
      appropriateness: stageAppropriateness,
      recommendations: stageRequirements,
      nextStageRequirements: getStageRequirements(
        Object.keys(stageMultipliers)[
          Math.min(
            Object.keys(stageMultipliers).length - 1,
            Object.keys(stageMultipliers).indexOf(stage) + 1
          )
        ] as keyof typeof stageMultipliers
      ),
    },
    currencyConversion: {
      rates: EXCHANGE_RATES,
      baseRate: EXCHANGE_RATES[currency],
      baseCurrency: currency,
    },
  };
}