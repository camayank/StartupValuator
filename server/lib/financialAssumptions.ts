import { regions, sectors, type ValuationFormData } from "../../client/src/lib/validations";

// Industry betas based on sector and region
const industryBetas: Record<keyof typeof sectors, Record<keyof typeof regions, number>> = {
  technology: {
    us: 1.35,
    eu: 1.28,
    uk: 1.30,
    india: 1.42,
    global: 1.33,
  },
  digital: {
    us: 1.28,
    eu: 1.22,
    uk: 1.25,
    india: 1.35,
    global: 1.27,
  },
  enterprise: {
    us: 1.15,
    eu: 1.12,
    uk: 1.18,
    india: 1.25,
    global: 1.17,
  },
  consumer: {
    us: 0.95,
    eu: 0.92,
    uk: 0.90,
    india: 1.05,
    global: 0.95,
  },
  healthcare: {
    us: 0.85,
    eu: 0.82,
    uk: 0.88,
    india: 0.95,
    global: 0.87,
  },
  financial: {
    us: 1.20,
    eu: 1.15,
    uk: 1.18,
    india: 1.28,
    global: 1.20,
  },
  industrial: {
    us: 1.10,
    eu: 1.05,
    uk: 1.08,
    india: 1.15,
    global: 1.09,
  },
  energy: {
    us: 1.25,
    eu: 1.20,
    uk: 1.22,
    india: 1.30,
    global: 1.24,
  },
  others: {
    us: 1.00,
    eu: 0.98,
    uk: 1.00,
    india: 1.10,
    global: 1.02,
  },
};

// Growth rate benchmarks based on sector and stage
const growthRateBenchmarks: Record<keyof typeof sectors, Partial<Record<keyof typeof businessStages, number>>> = {
  technology: {
    ideation_unvalidated: 150,
    ideation_validated: 200,
    mvp_development: 250,
    mvp_early_traction: 300,
    revenue_early: 150,
    revenue_growing: 100,
    revenue_scaling: 75,
    established_local: 40,
    established_regional: 35,
    established_international: 30,
  },
  // Add similar structures for other sectors
  digital: { revenue_early: 120 },
  enterprise: { revenue_early: 100 },
  consumer: { revenue_early: 80 },
  healthcare: { revenue_early: 70 },
  financial: { revenue_early: 90 },
  industrial: { revenue_early: 60 },
  energy: { revenue_early: 75 },
  others: { revenue_early: 50 },
};

export interface FinancialAssumptions {
  discountRate: number;
  growthRate: number;
  terminalGrowthRate: number;
  terminalValue: number;
  beta: number;
  riskFreeRate: number;
  marketRiskPremium: number;
  companySpecificRiskPremium: number;
}

export function calculateFinancialAssumptions(data: ValuationFormData): FinancialAssumptions {
  const region = regions[data.region];
  const beta = industryBetas[data.sector][data.region];

  // Calculate CAPM components
  const riskFreeRate = region.riskFreeRate;
  const marketRiskPremium = region.marketRiskPremium;

  // Company-specific risk premium based on stage and qualitative factors
  const companySpecificRiskPremium = calculateCompanySpecificRiskPremium(data);

  // Calculate discount rate using CAPM
  const discountRate = riskFreeRate + (beta * marketRiskPremium) + companySpecificRiskPremium;

  // Use provided growth rate or get benchmark
  const growthRate = data.growthRate || getGrowthRateBenchmark(data);

  // Get terminal growth rate (simplified for now)
  const terminalGrowthRate = region.riskFreeRate + 0.02; // Using risk-free rate + 2% as a basis

  // Calculate terminal value using Gordon Growth Model
  const terminalValue = calculateTerminalValue(data.revenue, growthRate, terminalGrowthRate, discountRate);

  return {
    discountRate,
    growthRate,
    terminalGrowthRate,
    terminalValue,
    beta,
    riskFreeRate,
    marketRiskPremium,
    companySpecificRiskPremium,
  };
}

function calculateCompanySpecificRiskPremium(data: ValuationFormData): number {
  let premium = 0;

  // Stage-based risk
  if (data.stage.includes('ideation')) {
    premium += 0.15; // 15% additional premium for early stage
  } else if (data.stage.includes('mvp')) {
    premium += 0.12;
  } else if (data.stage.includes('revenue_early')) {
    premium += 0.08;
  }

  // IP Protection risk
  if (data.intellectualProperty === 'none') {
    premium += 0.03;
  } else if (data.intellectualProperty === 'pending') {
    premium += 0.015;
  }

  // Competitive position risk
  if (data.competitiveDifferentiation === 'low') {
    premium += 0.03;
  } else if (data.competitiveDifferentiation === 'medium') {
    premium += 0.015;
  }

  // Team experience risk (with proper null check)
  const teamExperience = data.teamExperience ?? 0;
  if (teamExperience < 2) {
    premium += 0.03;
  } else if (teamExperience < 5) {
    premium += 0.015;
  }

  return premium;
}

function getGrowthRateBenchmark(data: ValuationFormData): number {
  const sectorBenchmarks = growthRateBenchmarks[data.sector];
  if (!sectorBenchmarks) return 30;

  const stageBenchmark = sectorBenchmarks[data.stage];
  return stageBenchmark ?? 30; // Default to 30% if no specific benchmark
}

function calculateTerminalValue(
  revenue: number,
  growthRate: number,
  terminalGrowthRate: number,
  discountRate: number
): number {
  const projectionYears = 5;
  const finalYearRevenue = revenue * Math.pow(1 + (growthRate / 100), projectionYears);

  // Gordon Growth Model
  return (finalYearRevenue * (1 + (terminalGrowthRate / 100))) / (discountRate - (terminalGrowthRate / 100));
}

// Function to validate assumptions based on region-specific compliance standards
export function validateRegionCompliance(
  assumptions: FinancialAssumptions,
  data: ValuationFormData
): { isCompliant: boolean; adjustments?: Partial<FinancialAssumptions>; reasons: string[] } {
  const reasons: string[] = [];
  const adjustments: Partial<FinancialAssumptions> = {};

  switch (data.region) {
    case 'us':
      // 409A compliance checks
      if (assumptions.discountRate < 0.20) {
        adjustments.discountRate = 0.20;
        reasons.push("Minimum discount rate adjusted to 20% per 409A guidelines");
      }
      if (assumptions.terminalGrowthRate > 0.04) {
        adjustments.terminalGrowthRate = 0.04;
        reasons.push("Terminal growth rate capped at 4% per 409A guidelines");
      }
      break;

    case 'india':
      // IBBI compliance checks
      if (assumptions.discountRate < 0.18) {
        adjustments.discountRate = 0.18;
        reasons.push("Minimum discount rate adjusted to 18% per IBBI guidelines");
      }
      break;

    // Add more region-specific compliance checks
  }

  return {
    isCompliant: reasons.length === 0,
    adjustments: Object.keys(adjustments).length > 0 ? adjustments : undefined,
    reasons,
  };
}

declare const businessStages: {
    [key: string]: string
}