import { type ValuationFormData } from "../../client/src/lib/validations";
import { calculateFinancialAssumptions } from "../lib/financialAssumptions";
import { calculateValuation } from "./valuationModels";
import { recommendValuationModels, calculateHybridValuation } from "./modelSelection";

export async function processCategoryValuation(data: ValuationFormData) {
  // Get model recommendations
  const recommendation = recommendValuationModels(data);

  // Calculate valuations using recommended models
  const valuationResults: Record<string, any> = {};

  for (const [method, weight] of Object.entries(recommendation.weights)) {
    if (weight > 0) {
      valuationResults[method] = await calculateValuation(data, method);
    }
  }

  // Calculate hybrid valuation
  const hybridValuation = calculateHybridValuation(valuationResults, recommendation.weights);

  return {
    ...hybridValuation,
    modelSelection: {
      primaryModel: recommendation.primaryModel,
      secondaryModel: recommendation.secondaryModel,
      rationale: recommendation.rationale,
      complianceNotes: recommendation.complianceNotes,
    },
  };
}

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
    peerComparison: {
      metrics: Record<string, { value: number; comparison: 'above' | 'below' | 'average' }>;
      analysis: string[];
    };
    validationFeedback: {
      warnings: string[];
      recommendations: string[];
    };
  };
  modelSelection: {
    primaryModel: string;
    secondaryModel: string;
    rationale: string;
    complianceNotes: string[];
  };
}

type CompetitiveDifferentiation = 'high' | 'medium' | 'low';
type CashFlowStability = 'volatile' | 'moderate' | 'stable';
type PrimaryRiskFactor = 'market' | 'regulatory' | 'operational' | 'technology' | 'competition';

function isRevenueGenerating(stage: string): boolean {
  return ['early_revenue', 'growth', 'scaling', 'mature'].includes(stage);
}

function calculateDCFValue(data: ValuationFormData, assumptions: any): number {
  const { revenue, growthRate, margins } = data;
  const projectionYears = 5;
  let value = 0;

  // Project cash flows
  for (let year = 1; year <= projectionYears; year++) {
    const projectedRevenue = revenue * Math.pow(1 + (growthRate! / 100), year);
    const projectedCashFlow = projectedRevenue * (margins! / 100);
    const discountFactor = Math.pow(1 + (assumptions.discountRate / 100), year);
    value += projectedCashFlow / discountFactor;
  }

  // Add terminal value
  const terminalValue = (revenue * Math.pow(1 + (growthRate! / 100), projectionYears + 1) * (margins! / 100)) /
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
  const differentiationMultipliers: Record<CompetitiveDifferentiation, number> = {
    high: 1.3,
    medium: 1.0,
    low: 0.7,
  };

  return baseMultiple * (differentiationMultipliers[data.competitiveDifferentiation as CompetitiveDifferentiation] || 1.0);
}

function calculatePotentialMultiple(data: ValuationFormData, marketSentiment: any): number {
  const baseMultiple = marketSentiment.peerComparison?.averages.revenueMultiple || 1;
  return baseMultiple * data.scalabilityPotential / 10;
}

function calculateRiskPremium(data: ValuationFormData): number {
  let premium = 0;

  // Add risk based on business stage
  const stageRisk: Record<string, number> = {
    ideation: 25,
    mvp: 20,
    early_revenue: 15,
    growth: 10,
    scaling: 5,
    mature: 0,
  };

  // Add risk based on cash flow stability
  const cashFlowRisk: Record<CashFlowStability, number> = {
    volatile: 10,
    moderate: 5,
    stable: 0,
  };

  // Add risk based on primary risk factor
  const factorRisk: Record<PrimaryRiskFactor, number> = {
    market: 8,
    regulatory: 10,
    operational: 6,
    technology: 7,
    competition: 8,
  };

  premium = (stageRisk[data.stage] || 15) +
           (cashFlowRisk[data.cashFlowStability as CashFlowStability] || 5) +
           (factorRisk[data.primaryRiskFactor as PrimaryRiskFactor] || 8);

  return Math.min(premium, 40); // Cap total risk premium at 40%
}

function calculateQualitativeAdjustments(data: ValuationFormData): number {
  let adjustment = 0;

  // Adjust for team experience
  adjustment += Math.min(data.teamExperience * 0.5, 10); // Up to 10% positive adjustment

  // Adjust for ESG impact
  const esgAdjustment: Record<string, number> = {
    high: 5,
    medium: 2.5,
    low: 0,
    none: -2.5,
  };

  adjustment += esgAdjustment[data.esgImpact] || 0;

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

function generatePeerComparison(data: ValuationFormData, marketSentiment: any) {
  const metrics: Record<string, { value: number; comparison: 'above' | 'below' | 'average' }> = {};
  const analysis: string[] = [];

  if (data.growthRate && marketSentiment.peerComparison?.averages.growthRate) {
    const peerGrowthRate = marketSentiment.peerComparison.averages.growthRate;
    metrics.growthRate = {
      value: data.growthRate,
      comparison: data.growthRate > peerGrowthRate * 1.1 ? 'above' :
                 data.growthRate < peerGrowthRate * 0.9 ? 'below' : 'average'
    };
    analysis.push(
      metrics.growthRate.comparison === 'above' ?
        `Your growth rate of ${data.growthRate}% is above the industry average of ${peerGrowthRate}%` :
      metrics.growthRate.comparison === 'below' ?
        `Your growth rate of ${data.growthRate}% is below the industry average of ${peerGrowthRate}%` :
        `Your growth rate of ${data.growthRate}% is in line with industry averages`
    );
  }

  if (data.margins && marketSentiment.peerComparison?.averages.margins) {
    const peerMargins = marketSentiment.peerComparison.averages.margins;
    metrics.margins = {
      value: data.margins,
      comparison: data.margins > peerMargins * 1.1 ? 'above' :
                 data.margins < peerMargins * 0.9 ? 'below' : 'average'
    };
    analysis.push(
      metrics.margins.comparison === 'above' ?
        `Your operating margins of ${data.margins}% are higher than the industry average of ${peerMargins}%` :
      metrics.margins.comparison === 'below' ?
        `Your operating margins of ${data.margins}% are lower than the industry average of ${peerMargins}%` :
        `Your operating margins of ${data.margins}% are comparable to industry standards`
    );
  }

  return { metrics, analysis };
}

function validateInputs(data: ValuationFormData, marketSentiment: any) {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Validate growth rate against industry benchmarks
  if (data.growthRate) {
    const avgGrowth = marketSentiment.peerComparison?.averages.growthRate;
    if (avgGrowth && data.growthRate > avgGrowth * 2) {
      warnings.push(`Your projected growth rate of ${data.growthRate}% is significantly higher than industry averages`);
      recommendations.push("Consider providing additional justification for the high growth projections");
    }
  }

  // Validate margins against stage and industry
  if (data.margins) {
    const avgMargins = marketSentiment.peerComparison?.averages.margins;
    if (avgMargins && data.margins > avgMargins * 1.5) {
      warnings.push(`Your operating margins appear unusually high for your industry and stage`);
      recommendations.push("Review cost assumptions and market conditions supporting these margins");
    }
  }

  // Add stage-specific validations
  if (data.stage === 'early_revenue' && data.revenue && data.revenue > 10000000) {
    warnings.push("Revenue seems high for early revenue stage");
    recommendations.push("Consider if 'growth' or 'scaling' stage might be more appropriate");
  }

  return { warnings, recommendations };
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

  if (data.competitiveDifferentiation === 'low') {
    risks.push("Limited competitive differentiation");
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

  if (data.teamExperience < 5) {
    suggestions.push("Consider strengthening the team with experienced industry professionals");
  }

  return suggestions;
}

//Import needed types and functions.  These are assumed to exist based on the original code.
import { type BusinessOverview, type FinancialMetrics, type MarketInsights } from "../../client/src/lib/validations";
import { frameworks, type FrameworkId } from "../lib/compliance/frameworks";
import { getCachedMarketSentiment } from "../lib/marketSentiment";