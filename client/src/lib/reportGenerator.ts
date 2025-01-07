import type { ValuationFormData } from "./validations";
import {
  type SaaSMetrics,
  type EcommerceMetrics,
  type EnterpriseMetrics,
  type MarketComparable,
  type GrowthAnalysis,
  type CashFlowProjection,
  type CapTable,
  calculateSaaSMetrics,
  calculateEcommerceMetrics,
  calculateEnterpriseMetrics,
  getMarketComparables,
  analyzeGrowthPotential,
  projectCashFlows,
  modelCapTable
} from "./financialModels";

import {
  validateIndustryMetrics,
  validateMarketComparables,
  validateGrowthAssumptions,
  validateCashFlowProjections,
  validateCapTable
} from "./validation/financialValidation";

import { aiValidationService } from "@/services/aiValidation";

export interface ValuationReport {
  summary: {
    companyName: string;
    industry: string;
    valuationDate: string;
    valuationRange: {
      low: number;
      base: number;
      high: number;
    };
  };
  industryMetrics: {
    saas?: SaaSMetrics;
    ecommerce?: EcommerceMetrics;
    enterprise?: EnterpriseMetrics;
  };
  marketAnalysis: {
    comparables: MarketComparable[];
    benchmarks: {
      metric: string;
      value: number;
      peerAverage: number;
      percentile: number;
    }[];
  };
  growthAnalysis: GrowthAnalysis;
  financialProjections: CashFlowProjection;
  riskAnalysis: {
    category: string;
    score: number;
    impact: string;
    mitigation: string;
  }[];
  capTable: CapTable;
  validationResults: {
    warnings: Array<{
      field: keyof ValuationFormData;
      message: string;
      severity: 'low' | 'medium' | 'high';
      suggestion?: string | number;
    }>;
    suggestions: string[];
  };
  aiInsights: {
    industryTrends: string[];
    riskFactors: string[];
    growthOpportunities: string[];
    recommendations: string[];
  };
}

export async function generateValuationReport(data: ValuationFormData): Promise<ValuationReport> {
  // Calculate industry-specific metrics
  const industryMetrics = {
    saas: data.sector === 'SaaS' ? calculateSaaSMetrics(data) : undefined,
    ecommerce: data.sector === 'E-commerce' ? calculateEcommerceMetrics(data) : undefined,
    enterprise: data.sector === 'Enterprise' ? calculateEnterpriseMetrics(data) : undefined
  };

  // Get market comparables and analysis
  const comparables = getMarketComparables(data);
  const growthAnalysis = analyzeGrowthPotential(data);
  const financialProjections = projectCashFlows(data);
  const capTable = modelCapTable(data);

  // Collect validation results
  const validationWarnings = [
    ...validateIndustryMetrics(data),
    ...validateMarketComparables(data),
    ...validateGrowthAssumptions(data),
    ...validateCashFlowProjections(data),
    ...validateCapTable(data)
  ];

  // Get AI-powered insights
  const aiValidation = await aiValidationService.validateInput(data);
  const aiPredictions = await aiValidationService.predictPotentialIssues(data);
  const aiSuggestions = await aiValidationService.getSuggestions(data);

  // Calculate valuation range based on multiple methodologies
  const valuationRange = calculateValuationRange(data, comparables, financialProjections);

  return {
    summary: {
      companyName: data.companyName || 'Unnamed Company',
      industry: data.sector,
      valuationDate: new Date().toISOString().split('T')[0],
      valuationRange
    },
    industryMetrics,
    marketAnalysis: {
      comparables,
      benchmarks: generateBenchmarks(data, comparables)
    },
    growthAnalysis,
    financialProjections,
    riskAnalysis: generateRiskAnalysis(data, aiValidation),
    capTable,
    validationResults: {
      warnings: validationWarnings,
      suggestions: aiSuggestions
    },
    aiInsights: {
      industryTrends: aiValidation.industryInsights || [],
      riskFactors: aiPredictions.filter(p => p.includes('risk')),
      growthOpportunities: aiPredictions.filter(p => p.includes('growth')),
      recommendations: aiSuggestions
    }
  };
}

function calculateValuationRange(
  data: ValuationFormData,
  comparables: MarketComparable[],
  projections: CashFlowProjection
): { low: number; base: number; high: number } {
  // Calculate base valuation using weighted average of different methods
  const dcfValue = calculateDCFValue(projections);
  const marketValue = calculateMarketValue(data, comparables);
  const assetValue = calculateAssetValue(data);

  const baseValue = (dcfValue * 0.5) + (marketValue * 0.3) + (assetValue * 0.2);
  
  return {
    low: baseValue * 0.8,
    base: baseValue,
    high: baseValue * 1.2
  };
}

function calculateDCFValue(projections: CashFlowProjection): number {
  // Simplified DCF calculation
  const wacc = 0.12; // Could be made dynamic based on risk profile
  return projections.netCashFlow.reduce((value, cf, i) => {
    return value + (cf / Math.pow(1 + wacc, i + 1));
  }, 0);
}

function calculateMarketValue(data: ValuationFormData, comparables: MarketComparable[]): number {
  // Use average multiples from comparables
  const avgMultiple = comparables.reduce((sum, comp) => sum + comp.metrics.evRevenue, 0) / comparables.length;
  return (data.revenue || 0) * avgMultiple;
}

function calculateAssetValue(data: ValuationFormData): number {
  // Simplified asset-based valuation
  return (data.tangibleAssets || 0) + (data.intangibleAssets || 0);
}

function generateBenchmarks(data: ValuationFormData, comparables: MarketComparable[]) {
  return [
    'revenue',
    'ebitda',
    'growthRate',
    'margins'
  ].map(metric => {
    const peerValues = comparables.map(c => c.metrics[metric as keyof typeof c.metrics]);
    const peerAverage = peerValues.reduce((a, b) => a + b, 0) / peerValues.length;
    const value = data[metric as keyof ValuationFormData] as number || 0;
    const percentile = calculatePercentile(value, peerValues);

    return {
      metric,
      value,
      peerAverage,
      percentile
    };
  });
}

function calculatePercentile(value: number, dataset: number[]): number {
  const sorted = [...dataset].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  return (index / sorted.length) * 100;
}

function generateRiskAnalysis(
  data: ValuationFormData,
  aiValidation: Awaited<ReturnType<typeof aiValidationService.validateInput>>
): Array<{ category: string; score: number; impact: string; mitigation: string }> {
  const riskCategories = [
    'Market',
    'Technology',
    'Financial',
    'Operational',
    'Regulatory'
  ];

  return riskCategories.map(category => {
    const score = calculateRiskScore(category, data, aiValidation);
    return {
      category,
      score,
      impact: determineRiskImpact(score),
      mitigation: findMitigationStrategy(category, aiValidation.suggestions || [])
    };
  });
}

function calculateRiskScore(
  category: string,
  data: ValuationFormData,
  aiValidation: Awaited<ReturnType<typeof aiValidationService.validateInput>>
): number {
  // Simplified risk scoring based on validation results and AI insights
  const baseScore = 0.5;
  const validationImpact = aiValidation.warnings
    .filter(w => w.message.toLowerCase().includes(category.toLowerCase()))
    .reduce((score, w) => score + (w.severity === 'high' ? 0.2 : w.severity === 'medium' ? 0.1 : 0.05), 0);

  return Math.min(1, baseScore + validationImpact);
}

function determineRiskImpact(score: number): string {
  if (score >= 0.7) return 'High impact on valuation. Requires immediate attention.';
  if (score >= 0.4) return 'Moderate impact on valuation. Monitor closely.';
  return 'Low impact on valuation. Regular monitoring advised.';
}

function findMitigationStrategy(category: string, suggestions: string[]): string {
  const relevantSuggestion = suggestions.find(s => 
    s.toLowerCase().includes(category.toLowerCase()) && s.toLowerCase().includes('risk')
  );
  return relevantSuggestion || `Develop comprehensive ${category.toLowerCase()} risk management strategy.`;
}
