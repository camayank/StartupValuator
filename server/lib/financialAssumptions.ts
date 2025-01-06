import { regions, sectors, type ValuationFormData } from "../../client/src/lib/validations";

interface ValidationRule {
  test: (value: number) => boolean;
  message: string;
}

interface IndustryBenchmarks {
  growthRate: { min: number; max: number; typical: number };
  margins: { min: number; max: number; typical: number };
  revenueMultiple: number;
  riskAdjustment: number;
}

const industryBenchmarks: Record<keyof typeof sectors, IndustryBenchmarks> = {
  technology: {
    growthRate: { min: 15, max: 200, typical: 40 },
    margins: { min: 10, max: 80, typical: 30 },
    revenueMultiple: 8,
    riskAdjustment: 3,
  },
  digital: {
    growthRate: { min: 10, max: 150, typical: 35 },
    margins: { min: 8, max: 70, typical: 25 },
    revenueMultiple: 6,
    riskAdjustment: 3,
  },
  enterprise: {
    growthRate: { min: 10, max: 100, typical: 25 },
    margins: { min: 15, max: 60, typical: 30 },
    revenueMultiple: 5,
    riskAdjustment: 2,
  },
  consumer: {
    growthRate: { min: 5, max: 100, typical: 20 },
    margins: { min: 5, max: 50, typical: 15 },
    revenueMultiple: 4,
    riskAdjustment: 2,
  },
  healthcare: {
    growthRate: { min: 8, max: 80, typical: 18 },
    margins: { min: 12, max: 55, typical: 25 },
    revenueMultiple: 5,
    riskAdjustment: 1,
  },
  financial: {
    growthRate: { min: 5, max: 60, typical: 12 },
    margins: { min: 10, max: 45, typical: 20 },
    revenueMultiple: 4,
    riskAdjustment: 2,
  },
  industrial: {
    growthRate: { min: 3, max: 40, typical: 10 },
    margins: { min: 8, max: 35, typical: 15 },
    revenueMultiple: 3,
    riskAdjustment: 1,
  },
  energy: {
    growthRate: { min: 2, max: 30, typical: 8 },
    margins: { min: 5, max: 40, typical: 12 },
    revenueMultiple: 4,
    riskAdjustment: 2,
  },
  others: {
    growthRate: { min: 5, max: 50, typical: 12 },
    margins: { min: 8, max: 40, typical: 15 },
    revenueMultiple: 4,
    riskAdjustment: 2,
  },
};

export function validateAndAdjustAssumptions(data: ValuationFormData): {
  assumptions: FinancialAssumptions;
  warnings: string[];
} {
  const warnings: string[] = [];
  const benchmarks = industryBenchmarks[data.sector];

  // Validate growth rate
  if (data.growthRate) {
    if (data.growthRate < benchmarks.growthRate.min) {
      warnings.push(`Growth rate of ${data.growthRate}% is below industry minimum of ${benchmarks.growthRate.min}%`);
    } else if (data.growthRate > benchmarks.growthRate.max) {
      warnings.push(`Growth rate of ${data.growthRate}% exceeds industry maximum of ${benchmarks.growthRate.max}%`);
    }
  }

  // Validate margins
  if (data.margins) {
    if (data.margins < benchmarks.margins.min) {
      warnings.push(`Operating margin of ${data.margins}% is below industry minimum of ${benchmarks.margins.min}%`);
    } else if (data.margins > benchmarks.margins.max) {
      warnings.push(`Operating margin of ${data.margins}% exceeds industry maximum of ${benchmarks.margins.max}%`);
    }
  }

  // Calculate assumptions with enhanced validation
  const assumptions = calculateFinancialAssumptions(data);

  // Adjust assumptions based on validation results
  if (data.stage === 'early_revenue' && data.revenue && data.revenue < 100000) {
    assumptions.discountRate += 5; // Higher risk for very early revenue companies
    warnings.push("Applied higher discount rate due to early revenue stage and low revenue");
  }

  // Region-specific adjustments
  const regionAdjustments = getRegionSpecificAdjustments(data.region);
  assumptions.riskFreeRate = regionAdjustments.riskFreeRate;
  assumptions.marketRiskPremium = regionAdjustments.marketRiskPremium;

  if (regionAdjustments.warning) {
    warnings.push(regionAdjustments.warning);
  }

  return { assumptions, warnings };
}

function getRegionSpecificAdjustments(region: string): {
  riskFreeRate: number;
  marketRiskPremium: number;
  warning?: string;
} {
  const adjustments = {
    us: {
      riskFreeRate: 3.5,
      marketRiskPremium: 6.0,
    },
    eu: {
      riskFreeRate: 2.5,
      marketRiskPremium: 6.5,
    },
    uk: {
      riskFreeRate: 3.0,
      marketRiskPremium: 6.5,
    },
    india: {
      riskFreeRate: 7.0,
      marketRiskPremium: 7.5,
      warning: "Applied higher risk premium due to emerging market factors",
    },
    asia: {
      riskFreeRate: 4.0,
      marketRiskPremium: 7.0,
    },
    other: {
      riskFreeRate: 5.0,
      marketRiskPremium: 8.0,
      warning: "Using conservative estimates due to limited regional data",
    },
  };

  return adjustments[region.toLowerCase() as keyof typeof adjustments] || adjustments.other;
}

export function suggestAssumptions(data: ValuationFormData): Partial<ValuationFormData> {
  const benchmarks = industryBenchmarks[data.sector];
  const suggestions: Partial<ValuationFormData> = {};

  if (!data.growthRate) {
    suggestions.growthRate = benchmarks.growthRate.typical;
  }

  if (!data.margins) {
    suggestions.margins = benchmarks.margins.typical;
  }

  if (!data.scalabilityPotential) {
    suggestions.scalabilityPotential = data.stage === 'scaling' ? 8 :
      data.stage === 'growth' ? 6 : 4;
  }

  return suggestions;
}

export interface FinancialAssumptions {
  discountRate: number; // Percentage (e.g., 15 for 15%)
  growthRate: number; // Percentage
  terminalGrowthRate: number; // Percentage
  terminalValue: number;
  beta: number;
  riskFreeRate: number; // Percentage
  marketRiskPremium: number; // Percentage
  companySpecificRiskPremium: number; // Percentage
  industryMultiple: number; // Industry-specific revenue multiple
  industryDataQuality: boolean; // Indicates if industry data is reliable
  peerGroupMetrics?: {
    averageRevenue: number;
    averageGrowth: number;
    averageMargins: number;
    averageMultiple: number;
  };
}

export function calculateFinancialAssumptions(data: ValuationFormData): FinancialAssumptions {
  // Get base rates based on region and sector
  const baseDiscountRate = getBaseDiscountRate(data.region);
  const baseGrowthRate = data.growthRate || getIndustryGrowthRate(data.sector);
  const baseTerminalGrowthRate = getTerminalGrowthRate(data.region);

  // Company-specific adjustments
  const stageRiskPremium = calculateStageRiskPremium(data.stage);
  const industryRiskPremium = calculateIndustryRiskPremium(data.sector);
  const industryMultiple = calculateIndustryMultiple(data.sector, data.stage);

  // Calculate final rates with AI-enhanced logic
  const discountRate = adjustDiscountRate(
    baseDiscountRate,
    stageRiskPremium,
    industryRiskPremium,
    data
  );

  // Get peer group metrics if available
  const peerGroupMetrics = getPeerGroupMetrics(data.sector, data.stage, data.revenue);

  // Calculate terminal value with enhanced methodology
  const terminalValue = calculateTerminalValue(
    data.revenue,
    baseGrowthRate,
    discountRate,
    baseTerminalGrowthRate
  );

  return {
    discountRate,
    growthRate: baseGrowthRate,
    terminalGrowthRate: baseTerminalGrowthRate,
    terminalValue,
    beta: calculateIndustryBeta(data.sector),
    riskFreeRate: getRiskFreeRate(data.region),
    marketRiskPremium: getMarketRiskPremium(data.region),
    companySpecificRiskPremium: stageRiskPremium + industryRiskPremium,
    industryMultiple,
    industryDataQuality: true,
    peerGroupMetrics,
  };
}

function getBaseDiscountRate(region: string): number {
  const regionRates: Record<string, number> = {
    us: 15,
    eu: 14,
    uk: 14,
    asia: 16,
    other: 17,
  };
  return regionRates[region.toLowerCase()] || 15;
}

function getIndustryGrowthRate(sector: keyof typeof sectors): number {
  const growthRates: Record<keyof typeof sectors, number> = {
    technology: 30,
    digital: 25,
    enterprise: 20,
    consumer: 15,
    healthcare: 18,
    financial: 12,
    industrial: 10,
    energy: 8,
    others: 12,
  };
  return growthRates[sector] || 15;
}

function getTerminalGrowthRate(region: string): number {
  const terminalRates: Record<string, number> = {
    us: 3,
    eu: 2.5,
    uk: 2.5,
    asia: 4,
    other: 3,
  };
  return terminalRates[region.toLowerCase()] || 3;
}

function calculateStageRiskPremium(stage: string): number {
  const stageRiskMap = {
    ideation: 10,
    mvp: 8,
    revenue_early: 6,
    revenue_growing: 4,
    revenue_scaling: 2,
    established: 0
  };

  return stageRiskMap[stage as keyof typeof stageRiskMap] || 5;
}

function calculateIndustryRiskPremium(sector: keyof typeof sectors): number {
  const industryRiskMap: Record<keyof typeof sectors, number> = {
    technology: 3,
    digital: 3,
    enterprise: 2,
    consumer: 2,
    healthcare: 1,
    financial: 2,
    industrial: 1,
    energy: 2,
    others: 2,
  };

  return industryRiskMap[sector] || 2;
}

function calculateIndustryMultiple(sector: keyof typeof sectors, stage: string): number {
  const baseMultiples: Record<keyof typeof sectors, number> = {
    technology: 8,
    digital: 6,
    enterprise: 5,
    consumer: 4,
    healthcare: 5,
    financial: 4,
    industrial: 3,
    energy: 4,
    others: 4,
  };

  const stageMultiplier = stage.includes('revenue_scaling') ? 1.3 :
    stage.includes('established') ? 1.2 :
    stage.includes('revenue') ? 1.1 :
    0.9;

  return baseMultiples[sector] * stageMultiplier;
}

function adjustDiscountRate(
  baseRate: number,
  stageRisk: number,
  industryRisk: number,
  data: ValuationFormData
): number {
  let adjustedRate = baseRate + stageRisk + industryRisk;

  // Adjust for revenue predictability
  if (data.revenue && data.revenue > 1000000) {
    adjustedRate -= 1; // Lower risk for companies with significant revenue
  }

  // Adjust for margins if available
  if (data.margins && data.margins > 20) {
    adjustedRate -= 0.5; // Lower risk for companies with healthy margins
  }

  return Math.min(Math.max(adjustedRate, 10), 30); // Cap between 10% and 30%
}

function getRiskFreeRate(region: string): number {
  const riskFreeRates: Record<string, number> = {
    us: 3,
    eu: 2.5,
    uk: 2.5,
    asia: 3.5,
    other: 3.5,
  };
  return riskFreeRates[region.toLowerCase()] || 3;
}

function getMarketRiskPremium(region: string): number {
  const riskPremiums: Record<string, number> = {
    us: 6,
    eu: 6.5,
    uk: 6.5,
    asia: 7,
    other: 7.5,
  };
  return riskPremiums[region.toLowerCase()] || 6;
}

function calculateIndustryBeta(sector: keyof typeof sectors): number {
  const industryBetas: Record<keyof typeof sectors, number> = {
    technology: 1.4,
    digital: 1.3,
    enterprise: 1.2,
    consumer: 1.1,
    healthcare: 1.0,
    financial: 1.3,
    industrial: 1.1,
    energy: 1.2,
    others: 1.2,
  };
  return industryBetas[sector] || 1.2;
}

function calculateTerminalValue(
  revenue: number,
  growthRate: number,
  discountRate: number,
  terminalGrowthRate: number
): number {
  // Enhanced Gordon Growth Model with revenue scaling
  const projectedRevenue = revenue * Math.pow(1 + (growthRate / 100), 5);
  return (projectedRevenue * (1 + (terminalGrowthRate / 100))) /
    ((discountRate / 100) - (terminalGrowthRate / 100));
}

function getPeerGroupMetrics(
  sector: keyof typeof sectors,
  stage: string,
  revenue?: number
): FinancialAssumptions['peerGroupMetrics'] {
  // In a real implementation, this would fetch data from a market database
  // For now, we'll return representative metrics based on sector and stage
  const baseMetrics = {
    technology: { revenue: 5000000, growth: 40, margins: 65, multiple: 8 },
    digital: { revenue: 3000000, growth: 35, margins: 60, multiple: 6 },
    enterprise: { revenue: 4000000, growth: 25, margins: 55, multiple: 5 },
    consumer: { revenue: 2000000, growth: 20, margins: 45, multiple: 4 },
    healthcare: { revenue: 3500000, growth: 25, margins: 50, multiple: 5 },
    financial: { revenue: 4000000, growth: 20, margins: 40, multiple: 4 },
    industrial: { revenue: 5000000, growth: 15, margins: 35, multiple: 3 },
    energy: { revenue: 6000000, growth: 15, margins: 30, multiple: 4 },
    others: { revenue: 3000000, growth: 20, margins: 40, multiple: 4 },
  };

  const metrics = baseMetrics[sector];

  return {
    averageRevenue: metrics.revenue,
    averageGrowth: metrics.growth,
    averageMargins: metrics.margins,
    averageMultiple: metrics.multiple
  };
}

declare const businessStages: {
  [key: string]: string
}