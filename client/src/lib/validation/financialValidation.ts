import { type ValuationFormData } from "../validations";
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
} from "../financialModels";

interface ValidationWarning {
  field: keyof ValuationFormData;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string | number;
}

// Industry-specific validation rules with stage awareness
const saasRules = {
  churnRate: { 
    min: 0, 
    max: 0.3, 
    optimal: 0.1,
    stageRules: {
      early_revenue: { max: 0.4 },
      growth: { max: 0.25 },
      scaling: { max: 0.15 }
    }
  },
  ltv: { 
    min: 0, 
    optimal: 3,
    stageRules: {
      early_revenue: { min: 2 },
      growth: { min: 3 },
      scaling: { min: 4 }
    }
  },
  arr: { 
    minGrowth: 0.4,
    stageRules: {
      early_revenue: { minGrowth: 0.2 },
      growth: { minGrowth: 0.4 },
      scaling: { minGrowth: 0.6 }
    }
  },
  margins: { 
    min: 0.6,
    stageRules: {
      early_revenue: { min: 0.5 },
      growth: { min: 0.6 },
      scaling: { min: 0.7 }
    }
  }
};

const ecommerceRules = {
  gmv: { 
    minGrowth: 0.25,
    stageRules: {
      early_revenue: { minGrowth: 0.15 },
      growth: { minGrowth: 0.25 },
      scaling: { minGrowth: 0.35 }
    }
  },
  aov: { 
    min: 10,
    stageRules: {
      early_revenue: { min: 5 },
      growth: { min: 10 },
      scaling: { min: 15 }
    }
  },
  inventoryTurnover: { 
    min: 4,
    stageRules: {
      early_revenue: { min: 3 },
      growth: { min: 4 },
      scaling: { min: 5 }
    }
  },
  repeatPurchaseRate: { 
    min: 0.2,
    stageRules: {
      early_revenue: { min: 0.15 },
      growth: { min: 0.2 },
      scaling: { min: 0.25 }
    }
  }
};

const enterpriseRules = {
  dealCycle: { 
    max: 180,
    stageRules: {
      early_revenue: { max: 270 },
      growth: { max: 180 },
      scaling: { max: 120 }
    }
  },
  contractLength: { 
    min: 12,
    stageRules: {
      early_revenue: { min: 6 },
      growth: { min: 12 },
      scaling: { min: 24 }
    }
  },
  bookings: { 
    minGrowth: 0.3,
    stageRules: {
      early_revenue: { minGrowth: 0.2 },
      growth: { minGrowth: 0.3 },
      scaling: { minGrowth: 0.4 }
    }
  }
};

// Validation Functions
export function validateIndustryMetrics(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  switch (data.sector) {
    case 'SaaS':
      warnings.push(...validateSaaSMetrics(data));
      break;
    case 'E-commerce':
      warnings.push(...validateEcommerceMetrics(data));
      break;
    case 'Enterprise':
      warnings.push(...validateEnterpriseMetrics(data));
      break;
  }

  return warnings;
}

function validateSaaSMetrics(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const metrics = calculateSaaSMetrics(data);
  const stageRules = saasRules.churnRate.stageRules[data.businessInfo.productStage] || saasRules.churnRate;

  if (!metrics) return warnings;

  if (metrics.churnRate > stageRules.max) {
    warnings.push({
      field: 'churnRate',
      message: `Churn rate of ${metrics.churnRate * 100}% is above acceptable range for ${data.businessInfo.productStage} stage`,
      severity: 'high',
      suggestion: stageRules.optimal || saasRules.churnRate.optimal
    });
  }

  const ltvCacRatio = metrics.ltv / metrics.cac;
  const ltvRules = saasRules.ltv.stageRules[data.businessInfo.productStage] || saasRules.ltv;

  if (ltvCacRatio < ltvRules.min) {
    warnings.push({
      field: 'customerAcquisitionCost',
      message: `LTV/CAC ratio of ${ltvCacRatio.toFixed(2)} is below sustainable levels for ${data.businessInfo.productStage} stage`,
      severity: 'high',
      suggestion: metrics.ltv / ltvRules.optimal
    });
  }

  return warnings;
}

function validateEcommerceMetrics(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const metrics = calculateEcommerceMetrics(data);
  const stageRules = ecommerceRules.aov.stageRules[data.businessInfo.productStage] || ecommerceRules.aov;

  if (!metrics) return warnings;

  if (metrics.aov < stageRules.min) {
    warnings.push({
      field: 'averageOrderValue',
      message: `Average order value is below sustainable levels for ${data.businessInfo.productStage} stage`,
      severity: 'medium',
      suggestion: stageRules.min
    });
  }

  const turnoverRules = ecommerceRules.inventoryTurnover.stageRules[data.businessInfo.productStage] || ecommerceRules.inventoryTurnover;
  if (metrics.inventoryTurnover < turnoverRules.min) {
    warnings.push({
      field: 'inventoryTurnover',
      message: `Inventory turnover is below industry standards for ${data.businessInfo.productStage} stage`,
      severity: 'medium',
      suggestion: turnoverRules.min
    });
  }

  return warnings;
}

function validateEnterpriseMetrics(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const metrics = calculateEnterpriseMetrics(data);
  const stageRules = enterpriseRules.dealCycle.stageRules[data.businessInfo.productStage] || enterpriseRules.dealCycle;

  if (!metrics) return warnings;

  if (metrics.dealCycle > stageRules.max) {
    warnings.push({
      field: 'averageDealCycle',
      message: `Deal cycle length is above optimal range for ${data.businessInfo.productStage} stage`,
      severity: 'medium',
      suggestion: stageRules.max
    });
  }

  const contractRules = enterpriseRules.contractLength.stageRules[data.businessInfo.productStage] || enterpriseRules.contractLength;
  if (metrics.contractLength < contractRules.min) {
    warnings.push({
      field: 'averageContractLength',
      message: `Contract length is below industry standard for ${data.businessInfo.productStage} stage`,
      severity: 'medium',
      suggestion: contractRules.min
    });
  }

  return warnings;
}

export function validateMarketComparables(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const comparables = getMarketComparables(data);

  if (comparables.length === 0) {
    warnings.push({
      field: 'sector',
      message: 'Unable to find relevant market comparables',
      severity: 'medium'
    });
    return warnings;
  }

  const avgMultiple = calculateAverageMultiple(comparables);
  const impliedMultiple = calculateImpliedMultiple(data);

  if (impliedMultiple > avgMultiple * 2) {
    warnings.push({
      field: 'valuation',
      message: 'Implied multiple significantly above market average',
      severity: 'high',
      suggestion: avgMultiple
    });
  }

  return warnings;
}

// Helper functions remain unchanged
function calculateAverageMultiple(comparables: MarketComparable[]): number {
  return comparables.reduce((sum, comp) => sum + comp.metrics.evRevenue, 0) / comparables.length;
}

function calculateImpliedMultiple(data: ValuationFormData): number {
  return data.valuation && data.revenue ? data.valuation / data.revenue : 0;
}

function calculateFounderOwnership(capTable: CapTable): number {
  const founderShares = capTable.entries
    .filter(entry => entry.shareClass === 'Founder')
    .reduce((sum, entry) => sum + entry.sharesOutstanding, 0);

  return founderShares / capTable.fullyDilutedShares;
}

export function validateGrowthAssumptions(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const growth = analyzeGrowthPotential(data);

  if (growth.tamPenetration < 0.01) {
    warnings.push({
      field: 'revenue',
      message: 'Market penetration seems unusually low',
      severity: 'low'
    });
  }

  if (growth.marketShareGrowth > growth.tamPenetration * 2) {
    warnings.push({
      field: 'growthRate',
      message: 'Growth assumptions may be too aggressive given current market share',
      severity: 'medium'
    });
  }

  return warnings;
}

export function validateCashFlowProjections(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const cashFlows = projectCashFlows(data);

  // Check for negative cash flows
  const negativeYears = cashFlows.netCashFlow.filter(cf => cf < 0).length;
  if (negativeYears > 2) {
    warnings.push({
      field: 'cashFlow',
      message: `Projected negative cash flow for ${negativeYears} years`,
      severity: 'high'
    });
  }

  // Check working capital efficiency
  const wcChange = cashFlows.workingCapitalChanges.reduce((a, b) => a + b, 0);
  if (wcChange > data.revenue * 0.2) {
    warnings.push({
      field: 'workingCapital',
      message: 'High working capital requirements may impact growth',
      severity: 'medium'
    });
  }

  return warnings;
}

export function validateCapTable(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const capTable = modelCapTable(data);

  // Check founder dilution
  const founderOwnership = calculateFounderOwnership(capTable);
  if (founderOwnership < 0.15) {
    warnings.push({
      field: 'capTable',
      message: 'Founder ownership below recommended minimum',
      severity: 'medium',
      suggestion: 0.15
    });
  }

  // Check option pool size
  const optionPoolPercentage = capTable.optionPool / capTable.fullyDilutedShares;
  if (optionPoolPercentage < 0.1) {
    warnings.push({
      field: 'optionPool',
      message: 'Option pool may be insufficient for future hires',
      severity: 'low',
      suggestion: 0.1
    });
  }

  return warnings;
}