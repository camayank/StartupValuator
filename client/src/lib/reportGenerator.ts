import { z } from "zod";
import type { ValuationFormData } from "./validations";
import {
  type SaaSMetrics,
  type EcommerceMetrics,
  type ManufacturingMetrics,
  type HealthcareMetrics,
  type FintechMetrics,
  type MarketComparable,
  type GrowthAnalysis,
  type CashFlowProjection,
  type CapTable,
  calculateSaaSMetrics,
  calculateEcommerceMetrics,
  calculateManufacturingMetrics,
  calculateHealthcareMetrics,
  calculateFintechMetrics,
  getMarketComparables,
  analyzeGrowthPotential,
  projectCashFlows,
  modelCapTable
} from "./financialModels";

import { aiValidationService } from "@/services/aiValidation";

export interface ValuationReport {
  summary: {
    businessName: string;
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
    manufacturing?: ManufacturingMetrics;
    healthcare?: HealthcareMetrics;
    fintech?: FintechMetrics;
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
      field: string;
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

// Validation functions
function validateValuationData(data: ValuationFormData): Array<{
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string | number;
}> {
  const warnings: Array<{
    field: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  // Validate revenue and growth rate
  if (data.revenue <= 0) {
    warnings.push({
      field: 'revenue',
      message: 'Revenue must be positive for accurate valuation',
      severity: 'high',
    });
  }

  if (data.growthRate < -100 || data.growthRate > 1000) {
    warnings.push({
      field: 'growthRate',
      message: 'Growth rate seems unrealistic',
      severity: 'medium',
      suggestion: Math.max(-100, Math.min(1000, data.growthRate))
    });
  }

  // Validate margins
  if (data.margins < -100 || data.margins > 100) {
    warnings.push({
      field: 'margins',
      message: 'Operating margins must be between -100% and 100%',
      severity: 'high',
      suggestion: Math.max(-100, Math.min(100, data.margins))
    });
  }

  return warnings;
}

export async function generateValuationReport(data: ValuationFormData): Promise<ValuationReport> {
  // Calculate industry-specific metrics based on sector
  const industryMetrics = {
    saas: calculateSaaSMetrics(data),
    ecommerce: calculateEcommerceMetrics(data),
    manufacturing: calculateManufacturingMetrics(data),
    healthcare: calculateHealthcareMetrics(data),
    fintech: calculateFintechMetrics(data),
  };

  // Get market comparables and analysis
  const comparables = await getMarketComparables(data);
  const growthAnalysis = await analyzeGrowthPotential(data);
  const financialProjections = await projectCashFlows(data);
  const capTable = await modelCapTable(data);

  // Collect validation results
  const validationWarnings = validateValuationData(data);

  // Get AI-powered insights
  const aiValidation = await aiValidationService.validateInput(data);
  const aiPredictions = await aiValidationService.predictPotentialIssues(data);
  const aiSuggestions = await aiValidationService.getSuggestions(data);

  // Calculate valuation range based on multiple methodologies
  const valuationRange = calculateValuationRange(data, comparables, financialProjections);

  return {
    summary: {
      businessName: data.businessName,
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
  const assetValue = calculateAssetBasedValue(data);

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

function calculateAssetBasedValue(data: ValuationFormData): number {
  // Calculate based on the total value of assets
  return (data.financials?.assets?.tangible || 0) + (data.financials?.assets?.intangible || 0);
}

function generateBenchmarks(data: ValuationFormData, comparables: MarketComparable[]) {
  const metrics = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'growthRate', label: 'Growth Rate' },
    { key: 'margins', label: 'Operating Margins' }
  ];

  return metrics.map(({ key, label }) => {
    const peerValues = comparables.map(c => c.metrics[key as keyof typeof c.metrics]);
    const peerAverage = peerValues.reduce((a, b) => a + b, 0) / peerValues.length;
    const value = data[key as keyof typeof data] as number || 0;
    const percentile = calculatePercentile(value, peerValues);

    return {
      metric: label,
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

// Placeholder functions -  Replace with actual implementations
function calculateManufacturingMetrics(data: ValuationFormData): ManufacturingMetrics | undefined {
    return undefined; // Replace with actual calculation
}

function calculateHealthcareMetrics(data: ValuationFormData): HealthcareMetrics | undefined {
    return undefined; // Replace with actual calculation
}

function calculateFintechMetrics(data: ValuationFormData): FintechMetrics | undefined {
    return undefined; // Replace with actual calculation
}