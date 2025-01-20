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
  industryMultiple: number; // Added for valuation calculations
  industryDataQuality: number; // Added for confidence scoring (0-1)
}

export function calculateFinancialAssumptions(data: ValuationFormData): FinancialAssumptions {
  // Get base rates from region
  const baseDiscountRate = 15; // Default 15%
  const baseGrowthRate = data.growthRate || 30; // Use provided growth rate or default to 30%
  const baseTerminalGrowthRate = 3; // Default 3%

  // Company-specific adjustments
  const stageRiskPremium = calculateStageRiskPremium(data.stage);
  const industryRiskPremium = calculateIndustryRiskPremium(data.sector);

  // Calculate industry multiple based on sector and stage
  const industryMultiple = calculateIndustryMultiple(data.sector, data.stage);

  // Calculate industry data quality score
  const industryDataQuality = calculateIndustryDataQuality(data.sector);

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
    industryMultiple,
    industryDataQuality,
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
    enterprise: 2,
    fintech: 3,
    industrial_tech: 2,
    healthtech: 1,
    ecommerce: 2,
    deeptech: 4,
    cleantech: 3,
    consumer_digital: 2,
    agritech: 2,
    proptech: 2,
    mobility: 3,
  };

  return industryRiskMap[sector] || 2;
}

function calculateIndustryMultiple(sector: keyof typeof sectors, stage: string): number {
  // Base multiples for each sector
  const baseMultiples: Record<keyof typeof sectors, number> = {
    technology: 5.0,
    enterprise: 4.0,
    fintech: 6.0,
    industrial_tech: 3.5,
    healthtech: 4.5,
    ecommerce: 3.0,
    deeptech: 7.0,
    cleantech: 4.0,
    consumer_digital: 3.5,
    agritech: 3.0,
    proptech: 3.0,
    mobility: 4.0,
  };

  // Get base multiple for the sector
  const baseMultiple = baseMultiples[sector] || 3.5;

  // Adjust based on stage
  const stageMultiplier = stage.includes('revenue_scaling') ? 1.3 :
    stage.includes('established') ? 1.2 :
    stage.includes('revenue') ? 1.1 :
    0.9;

  return baseMultiple * stageMultiplier;
}

function calculateIndustryDataQuality(sector: keyof typeof sectors): number {
  // Data quality scores (0-1) based on available market data and research
  const dataQualityMap: Record<keyof typeof sectors, number> = {
    technology: 0.9,
    enterprise: 0.85,
    fintech: 0.8,
    industrial_tech: 0.75,
    healthtech: 0.8,
    ecommerce: 0.85,
    deeptech: 0.7,
    cleantech: 0.75,
    consumer_digital: 0.8,
    agritech: 0.7,
    proptech: 0.75,
    mobility: 0.8,
  };

  return dataQualityMap[sector] || 0.7;
}