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

// Industry-specific validation rules
const saasRules = {
  churnRate: { min: 0, max: 0.3, optimal: 0.1 },
  ltv: { min: 0, optimal: 3 }, // Minimum LTV/CAC ratio
  arr: { minGrowth: 0.4 }, // Minimum ARR growth rate
  margins: { min: 0.6 } // Minimum gross margins
};

const ecommerceRules = {
  gmv: { minGrowth: 0.25 },
  aov: { min: 10 },
  inventoryTurnover: { min: 4 },
  repeatPurchaseRate: { min: 0.2 }
};

const enterpriseRules = {
  dealCycle: { max: 180 }, // Maximum deal cycle in days
  contractLength: { min: 12 }, // Minimum contract length in months
  bookings: { minGrowth: 0.3 }
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

  if (!metrics) return warnings;

  if (metrics.churnRate > saasRules.churnRate.max) {
    warnings.push({
      field: 'churnRate',
      message: `Churn rate of ${metrics.churnRate * 100}% is above acceptable range`,
      severity: 'high',
      suggestion: saasRules.churnRate.optimal
    });
  }

  const ltvCacRatio = metrics.ltv / metrics.cac;
  if (ltvCacRatio < saasRules.ltv.min) {
    warnings.push({
      field: 'customerAcquisitionCost',
      message: `LTV/CAC ratio of ${ltvCacRatio.toFixed(2)} is below sustainable levels`,
      severity: 'high',
      suggestion: metrics.ltv / saasRules.ltv.optimal
    });
  }

  return warnings;
}

function validateEcommerceMetrics(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const metrics = calculateEcommerceMetrics(data);

  if (!metrics) return warnings;

  if (metrics.aov < ecommerceRules.aov.min) {
    warnings.push({
      field: 'averageOrderValue',
      message: `Average order value is below sustainable levels`,
      severity: 'medium',
      suggestion: ecommerceRules.aov.min
    });
  }

  if (metrics.inventoryTurnover < ecommerceRules.inventoryTurnover.min) {
    warnings.push({
      field: 'inventoryTurnover',
      message: `Inventory turnover is below industry standards`,
      severity: 'medium',
      suggestion: ecommerceRules.inventoryTurnover.min
    });
  }

  return warnings;
}

function validateEnterpriseMetrics(data: ValuationFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const metrics = calculateEnterpriseMetrics(data);

  if (!metrics) return warnings;

  if (metrics.dealCycle > enterpriseRules.dealCycle.max) {
    warnings.push({
      field: 'averageDealCycle',
      message: `Deal cycle length is above optimal range`,
      severity: 'medium',
      suggestion: enterpriseRules.dealCycle.max
    });
  }

  if (metrics.contractLength < enterpriseRules.contractLength.min) {
    warnings.push({
      field: 'averageContractLength',
      message: `Contract length is below industry standard`,
      severity: 'medium',
      suggestion: enterpriseRules.contractLength.min
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

// Helper functions
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
