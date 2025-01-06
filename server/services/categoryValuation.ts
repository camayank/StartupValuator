import { type ValuationFormData, type BusinessOverview, type FinancialMetrics, type MarketInsights } from "../../client/src/lib/validations";
import { calculateFinancialAssumptions } from "../lib/financialAssumptions";
import { frameworks, type FrameworkId } from "../lib/compliance/frameworks";
import { getCachedMarketSentiment } from "../lib/marketSentiment";

interface CategoryValuationResult {
  baseValue: number;
  adjustments: Record<string, number>;
  assumptions: {
    discountRate: number;
    growthRate: number;
    marketMultiple: number;
    riskPremium: number;
  };
  insights: {
    strengths: string[];
    risks: string[];
    suggestions: string[];
  };
}

export async function processCategoryValuation(data: ValuationFormData): Promise<CategoryValuationResult> {
  // Get financial assumptions based on business overview
  const assumptions = await calculateFinancialAssumptions(data);
  
  // Get market sentiment and peer data
  const marketSentiment = await getCachedMarketSentiment(data);

  // Calculate base value using DCF for revenue-generating companies
  let baseValue = 0;
  const adjustments: Record<string, number> = {};

  if (isRevenueGenerating(data.stage)) {
    baseValue = calculateDCFValue(data, assumptions);
    adjustments.marketMultiple = calculateMarketMultipleAdjustment(data, marketSentiment);
  } else {
    baseValue = calculateEarlyStageValue(data, assumptions);
    adjustments.potentialMultiple = calculatePotentialMultiple(data, marketSentiment);
  }

  // Apply risk adjustments
  adjustments.riskPremium = calculateRiskPremium(data);
  adjustments.qualitativeFactors = calculateQualitativeAdjustments(data);
  
  // Apply compliance adjustments based on region
  const complianceAdjustment = applyComplianceAdjustments(data);
  if (complianceAdjustment) {
    adjustments.compliance = complianceAdjustment;
  }

  return {
    baseValue,
    adjustments,
    assumptions: {
      discountRate: assumptions.discountRate,
      growthRate: assumptions.growthRate,
      marketMultiple: assumptions.industryMultiple,
      riskPremium: adjustments.riskPremium,
    },
    insights: generateValuationInsights(data, marketSentiment),
  };
}

function isRevenueGenerating(stage: string): boolean {
  return ['revenue_early', 'revenue_growing', 'revenue_scaling', 'established_local', 'established_regional', 'established_international'].includes(stage);
}

function calculateDCFValue(data: ValuationFormData, assumptions: any): number {
  const { revenue, growthRate, margins } = data;
  const projectionYears = 5;
  let value = 0;

  // Project cash flows
  for (let year = 1; year <= projectionYears; year++) {
    const projectedRevenue = revenue * Math.pow(1 + (growthRate / 100), year);
    const projectedCashFlow = projectedRevenue * (margins / 100);
    const discountFactor = Math.pow(1 + (assumptions.discountRate / 100), year);
    value += projectedCashFlow / discountFactor;
  }

  // Add terminal value
  const terminalValue = (revenue * Math.pow(1 + (growthRate / 100), projectionYears + 1) * (margins / 100)) /
    (assumptions.discountRate / 100 - assumptions.terminalGrowthRate / 100);
  value += terminalValue / Math.pow(1 + (assumptions.discountRate / 100), projectionYears);

  return value;
}

function calculateEarlyStageValue(data: ValuationFormData, assumptions: any): number {
  // For early stage companies, use market-based approach
  const baseValue = assumptions.peerGroupMetrics?.averageRevenue || 1000000;
  const stageMultiplier = getStageMultiplier(data.stage);
  return baseValue * stageMultiplier;
}

function getStageMultiplier(stage: string): number {
  const multipliers: Record<string, number> = {
    ideation: 0.1,
    mvp: 0.3,
    early_revenue: 0.5,
    growth: 1.0,
    scaling: 1.5,
    mature: 2.0,
  };
  return multipliers[stage] || 1.0;
}

function calculateMarketMultipleAdjustment(data: ValuationFormData, marketSentiment: any): number {
  const baseMultiple = marketSentiment.peerComparison?.averages.revenueMultiple || 1;
  const differentiationMultiplier = {
    high: 1.3,
    medium: 1.0,
    low: 0.7,
  }[data.competitiveDifferentiation] || 1.0;
  
  return baseMultiple * differentiationMultiplier;
}

function calculatePotentialMultiple(data: ValuationFormData, marketSentiment: any): number {
  const baseMultiple = marketSentiment.peerComparison?.averages.revenueMultiple || 1;
  return baseMultiple * data.scalabilityPotential / 10;
}

function calculateRiskPremium(data: ValuationFormData): number {
  let premium = 0;

  // Add risk based on business stage
  const stageRisk = {
    ideation: 25,
    mvp: 20,
    early_revenue: 15,
    growth: 10,
    scaling: 5,
    mature: 0,
  }[data.stage] || 15;

  // Add risk based on cash flow stability
  const cashFlowRisk = {
    volatile: 10,
    moderate: 5,
    stable: 0,
  }[data.cashFlowStability] || 5;

  // Add risk based on primary risk factor
  const factorRisk = {
    market: 8,
    regulatory: 10,
    operational: 6,
    technology: 7,
    competition: 8,
  }[data.primaryRiskFactor] || 8;

  premium = stageRisk + cashFlowRisk + factorRisk;
  return Math.min(premium, 40); // Cap total risk premium at 40%
}

function calculateQualitativeAdjustments(data: ValuationFormData): number {
  let adjustment = 0;

  // Adjust for team experience
  adjustment += Math.min(data.teamExperience * 0.5, 10); // Up to 10% positive adjustment

  // Adjust for ESG impact
  const esgAdjustment = {
    high: 5,
    medium: 2.5,
    low: 0,
    none: -2.5,
  }[data.esgImpact] || 0;
  
  adjustment += esgAdjustment;

  return adjustment;
}

function applyComplianceAdjustments(data: ValuationFormData): number | null {
  const framework = frameworks[data.region.toLowerCase() as FrameworkId];
  if (!framework) return null;

  let adjustment = 0;

  // Adjust based on compliance standards
  const hasRequiredStandards = data.complianceStandards.includes(framework.id);
  adjustment += hasRequiredStandards ? 0 : -5;

  // Adjust based on IP protection
  adjustment += data.ipProtection === 'registered' ? 2 : 0;

  // Adjust based on tax compliance
  adjustment += data.taxCompliance === 'compliant' ? 1 : -1;

  return adjustment;
}

function generateValuationInsights(data: ValuationFormData, marketSentiment: any) {
  return {
    strengths: [
      ...getBusinessStrengths(data),
      ...getMarketStrengths(data, marketSentiment),
    ],
    risks: [
      ...getBusinessRisks(data),
      ...getComplianceRisks(data),
    ],
    suggestions: generateActionableSuggestions(data),
  };
}

function getBusinessStrengths(data: ValuationFormData): string[] {
  const strengths: string[] = [];

  if (data.teamExperience > 10) {
    strengths.push("Strong team experience in the industry");
  }

  if (data.competitiveDifferentiation === 'high') {
    strengths.push("Strong market differentiation");
  }

  if (data.cashFlowStability === 'stable') {
    strengths.push("Stable cash flow performance");
  }

  return strengths;
}

function getMarketStrengths(data: ValuationFormData, marketSentiment: any): string[] {
  const strengths: string[] = [];

  if (marketSentiment.overallScore > 7) {
    strengths.push("Favorable market conditions");
  }

  if (data.scalabilityPotential > 7) {
    strengths.push("High scalability potential");
  }

  return strengths;
}

function getBusinessRisks(data: ValuationFormData): string[] {
  const risks: string[] = [];

  if (data.stage.includes('ideation')) {
    risks.push("Early stage business risk");
  }

  if (data.cashFlowStability === 'volatile') {
    risks.push("Cash flow volatility risk");
  }

  return risks;
}

function getComplianceRisks(data: ValuationFormData): string[] {
  const risks: string[] = [];

  if (data.ipProtection === 'none') {
    risks.push("Lack of IP protection");
  }

  if (data.taxCompliance !== 'compliant') {
    risks.push("Tax compliance issues");
  }

  return risks;
}

function generateActionableSuggestions(data: ValuationFormData): string[] {
  const suggestions: string[] = [];

  if (data.ipProtection === 'none') {
    suggestions.push("Consider securing intellectual property protection");
  }

  if (data.competitiveDifferentiation === 'low') {
    suggestions.push("Focus on developing unique market differentiators");
  }

  if (data.cashFlowStability === 'volatile') {
    suggestions.push("Implement measures to stabilize cash flows");
  }

  return suggestions;
}
