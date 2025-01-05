interface ValuationParams {
  revenue: number;
  growthRate: number;
  margins: number;
  industry: string;
  stage: string;
}

const INDUSTRY_MULTIPLIERS = {
  tech: 12,
  ecommerce: 8,
  saas: 15,
  marketplace: 10,
};

const STAGE_MULTIPLIERS = {
  seed: 0.8,
  seriesA: 1,
  seriesB: 1.2,
  growth: 1.5,
};

export function calculateValuation(params: ValuationParams) {
  const { revenue, growthRate, margins, industry, stage } = params;

  // Base multiplier from industry
  const baseMultiplier = INDUSTRY_MULTIPLIERS[industry as keyof typeof INDUSTRY_MULTIPLIERS];
  
  // Adjust for stage
  const stageMultiplier = STAGE_MULTIPLIERS[stage as keyof typeof STAGE_MULTIPLIERS];
  
  // Calculate base valuation
  const baseValuation = revenue * baseMultiplier * stageMultiplier;

  // Calculate adjustments
  const growthAdjustment = (growthRate / 100) * baseValuation * 0.5;
  const marginsAdjustment = (margins / 100) * baseValuation * 0.3;

  // Final valuation
  const finalValuation = baseValuation + growthAdjustment + marginsAdjustment;
  
  // Calculate effective multiplier
  const effectiveMultiplier = finalValuation / revenue;

  return {
    valuation: Math.max(finalValuation, 0),
    multiplier: revenue > 0 ? effectiveMultiplier : baseMultiplier,
    methodology: "Revenue Multiple with Growth and Margin Adjustments",
    details: {
      baseValuation,
      adjustments: {
        growthAdjustment,
        marginsAdjustment,
      },
    },
  };
}
