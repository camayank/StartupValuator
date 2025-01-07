import { regions, sectors, type ValuationFormData } from "../../client/src/lib/validations";

export interface FinancialAssumptions {
  discountRate: number; // Percentage (e.g., 15 for 15%)
  growthRate: number; // Percentage
  terminalGrowthRate: number; // Percentage
  terminalValue: number;
  beta: number;
  riskFreeRate: number; // Percentage
  marketRiskPremium: number; // Percentage
  companySpecificRiskPremium: number; // Percentage
}

export function calculateFinancialAssumptions(data: ValuationFormData): FinancialAssumptions {
  // Get base rates from region
  const baseDiscountRate = 15; // Default 15%
  const baseGrowthRate = data.growthRate || 30; // Use provided growth rate or default to 30%
  const baseTerminalGrowthRate = 3; // Default 3%

  // Company-specific adjustments
  const stageRiskPremium = calculateStageRiskPremium(data.stage);
  const industryRiskPremium = calculateIndustryRiskPremium(data.sector);

  // Calculate final rates
  const discountRate = baseDiscountRate + stageRiskPremium + industryRiskPremium;
  const terminalGrowthRate = baseTerminalGrowthRate;

  // Calculate terminal value (simplified)
  const terminalValue = (data.revenue * (1 + baseGrowthRate/100)) / (discountRate/100 - terminalGrowthRate/100);

  return {
    discountRate,
    growthRate: baseGrowthRate,
    terminalGrowthRate,
    terminalValue,
    beta: 1.2, // Default beta
    riskFreeRate: 3, // Default risk-free rate
    marketRiskPremium: 6, // Default market risk premium
    companySpecificRiskPremium: stageRiskPremium + industryRiskPremium,
  };
}

function calculateStageRiskPremium(stage: string): number {
  if (stage.includes('ideation')) return 10;
  if (stage.includes('mvp')) return 8;
  if (stage.includes('revenue_early')) return 6;
  if (stage.includes('revenue_growing')) return 4;
  if (stage.includes('revenue_scaling')) return 2;
  if (stage.includes('established')) return 0;
  return 5; // Default risk premium
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

declare const businessStages: {
    [key: string]: string
}