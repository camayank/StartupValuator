import { type ValuationFormData, sectors, businessStages } from "./validations";

// Industry-Specific Metrics Configuration
export interface SaaSMetrics {
  arr: number;
  mrr: number;
  cac: number;
  ltv: number;
  churnRate: number;
  expansionRevenue: number;
}

export interface EcommerceMetrics {
  gmv: number;
  aov: number;
  inventoryTurnover: number;
  repeatPurchaseRate: number;
  customerLifetimeValue: number;
}

export interface EnterpriseMetrics {
  tcv: number;
  bookings: number;
  backlog: number;
  dealCycle: number;
  contractLength: number;
}

// Market Comparables Configuration
export interface MarketComparable {
  companyName: string;
  ticker: string;
  metrics: {
    revenue: number;
    ebitda: number;
    growthRate: number;
    margins: number;
    evRevenue: number;
    evEbitda: number;
  };
}

// Growth Analysis Configuration
export interface GrowthAnalysis {
  tamPenetration: number;
  marketShareGrowth: number;
  expansionMetrics: {
    geographic: number;
    product: number;
    customer: number;
  };
  growthDrivers: {
    organic: number;
    acquisition: number;
    partnership: number;
  };
}

// Detailed Cash Flow Configuration
export interface CashFlowProjection {
  operatingCashFlow: number[];
  investingCashFlow: number[];
  financingCashFlow: number[];
  netCashFlow: number[];
  workingCapitalChanges: number[];
  periods: string[];
}

// Cap Table Configuration
export interface CapTableEntry {
  investorName: string;
  shareClass: string;
  sharesOutstanding: number;
  ownershipPercentage: number;
  valuationAtEntry: number;
  liquidationPreference?: number;
  antiDilutionProtection?: boolean;
}

export interface CapTable {
  totalShares: number;
  entries: CapTableEntry[];
  fullyDilutedShares: number;
  optionPool: number;
}

// Industry-specific valuation functions
export function calculateIndustryAdjustedValuation(data: ValuationFormData): {
  value: number;
  details: {
    baseValue: number;
    industryMultiple: number;
    adjustments: Record<string, number>;
    metrics: Record<string, number>;
  };
} {
  const sector = sectors[data.sector];
  const subsector = sector?.subsectors[data.subsector as keyof typeof sector.subsectors];
  const stage = businessStages[data.stage];

  if (!subsector || !stage) {
    throw new Error("Invalid sector/subsector or stage");
  }

  // Get base multiple from industry benchmarks
  const baseMultiple = subsector.benchmarks.revenueMultiple[stage.name.toLowerCase() as keyof typeof subsector.benchmarks.revenueMultiple];

  // Calculate industry-specific adjustments
  const adjustments = calculateIndustryAdjustments(data, subsector.benchmarks);

  // Apply industry-specific metrics
  const metrics = calculateIndustryMetrics(data);

  // Calculate final multiple
  const adjustedMultiple = baseMultiple * (1 + Object.values(adjustments).reduce((a, b) => a + b, 0));

  // Calculate base value
  const baseValue = data.revenue * adjustedMultiple;

  return {
    value: baseValue * (1 + Object.values(adjustments).reduce((a, b) => a + b, 0)),
    details: {
      baseValue,
      industryMultiple: adjustedMultiple,
      adjustments,
      metrics
    }
  };
}

function calculateIndustryAdjustments(
  data: ValuationFormData,
  benchmarks: Record<string, any>
): Record<string, number> {
  const adjustments: Record<string, number> = {};

  // Growth rate adjustment
  if (data.growthRate) {
    const growthDiff = data.growthRate - benchmarks.growthRate;
    adjustments.growth = growthDiff > 0 ? 0.1 : -0.1;
  }

  // Margins adjustment
  if (data.margins) {
    const marginDiff = data.margins - benchmarks.grossMargin;
    adjustments.margins = marginDiff > 0 ? 0.15 : -0.15;
  }

  // Market share adjustment
  if (data.marketShare) {
    adjustments.marketPosition = data.marketShare > 10 ? 0.2 : 0;
  }

  return adjustments;
}

function calculateIndustryMetrics(data: ValuationFormData): Record<string, number> {
  const metrics: Record<string, number> = {};

  if (data.industryMetrics?.saas) {
    const saas = data.industryMetrics.saas;
    metrics.ltv_cac_ratio = saas.ltv / saas.cac;
    metrics.net_revenue_retention = (saas.arr + saas.expansionRevenue) / saas.arr;
    metrics.growth_efficiency = (saas.arr * saas.growthRate) / (saas.cac * saas.churnRate);
  }

  if (data.industryMetrics?.ecommerce) {
    const ecom = data.industryMetrics.ecommerce;
    metrics.customer_acquisition_efficiency = ecom.customerLifetimeValue / ecom.aov;
    metrics.inventory_efficiency = ecom.inventoryTurnover;
    metrics.repeat_purchase_value = ecom.repeatPurchaseRate * ecom.customerLifetimeValue;
  }

  if (data.industryMetrics?.enterprise) {
    const ent = data.industryMetrics.enterprise;
    metrics.contract_efficiency = ent.tcv / ent.dealCycle;
    metrics.booking_efficiency = ent.bookings / ent.backlog;
    metrics.customer_stickiness = ent.contractLength * ent.tcv;
  }

  return metrics;
}

// Export utility functions
export const industryValuationUtils = {
  calculateIndustryAdjustedValuation,
  calculateIndustryAdjustments,
  calculateIndustryMetrics,
};
// Market comparables analysis
export function getMarketComparables(data: ValuationFormData): MarketComparable[] {
  // This would typically fetch real-time data from an API
  // For now, return sample data based on the sector
  return [
    {
      companyName: "Sample Corp",
      ticker: "SMPL",
      metrics: {
        revenue: 100000000,
        ebitda: 20000000,
        growthRate: 30,
        margins: 20,
        evRevenue: 5,
        evEbitda: 15
      }
    }
  ];
}

// Growth potential analysis
export function analyzeGrowthPotential(data: ValuationFormData): GrowthAnalysis {
  const tamPenetration = calculateTAMPenetration(data);
  const marketShareGrowth = calculateMarketShareGrowth(data);

  return {
    tamPenetration,
    marketShareGrowth,
    expansionMetrics: {
      geographic: calculateGeographicExpansion(data),
      product: calculateProductExpansion(data),
      customer: calculateCustomerExpansion(data)
    },
    growthDrivers: {
      organic: 0.7, // Example weights
      acquisition: 0.2,
      partnership: 0.1
    }
  };
}

// Cash flow projections
export function projectCashFlows(data: ValuationFormData, years: number = 5): CashFlowProjection {
  const periods = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);
  const growthRate = data.growthRate || 0.1;
  const margins = data.margins || 0.2;

  const operatingCashFlow = calculateOperatingCashFlows(data, years, growthRate, margins);
  const investingCashFlow = calculateInvestingCashFlows(data, years);
  const financingCashFlow = calculateFinancingCashFlows(data, years);
  const workingCapitalChanges = calculateWorkingCapitalChanges(data, years);

  const netCashFlow = periods.map((_, i) =>
    operatingCashFlow[i] + investingCashFlow[i] + financingCashFlow[i]
  );

  return {
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow,
    workingCapitalChanges,
    periods
  };
}

// Cap table modeling
export function modelCapTable(data: ValuationFormData): CapTable {
  const entries: CapTableEntry[] = data.capTableEntries || [];
  const totalShares = entries.reduce((sum, entry) => sum + entry.sharesOutstanding, 0);
  const optionPool = totalShares * 0.1; // Example: 10% option pool
  const fullyDilutedShares = totalShares + optionPool;

  return {
    totalShares,
    entries,
    fullyDilutedShares,
    optionPool
  };
}


// Helper functions for valuation calculations
function calculateWACC(data: ValuationFormData): number {
  const riskFreeRate = data.assumptions?.riskFreeRate || 0.035;
  const beta = data.assumptions?.beta || 1;
  const marketRiskPremium = data.assumptions?.marketRiskPremium || 0.055;
  const costOfDebt = data.assumptions?.costOfDebt || 0.05;
  const taxRate = data.assumptions?.taxRate || 0.25;
  const debtRatio = data.assumptions?.debtRatio || 0;

  const costOfEquity = riskFreeRate + beta * marketRiskPremium;
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

  return costOfEquity * (1 - debtRatio) + afterTaxCostOfDebt * debtRatio;
}

function calculateFreeCashFlows(data: ValuationFormData, years: number): number[] {
  const baseRevenue = data.revenue;
  const growthRate = data.growthRate || 0.1;
  const margins = data.margins || 0.2;
  const taxRate = data.assumptions?.taxRate || 0.25;
  const depreciationRate = 0.1;
  const capexRate = 0.15;
  const workingCapitalRate = 0.1;

  return Array.from({ length: years }, (_, i) => {
    const revenue = baseRevenue * Math.pow(1 + growthRate, i);
    const ebit = revenue * margins;
    const taxes = ebit * taxRate;
    const depreciation = revenue * depreciationRate;
    const capex = revenue * capexRate;
    const workingCapitalChange = (revenue * workingCapitalRate) -
      (i > 0 ? baseRevenue * Math.pow(1 + growthRate, i - 1) * workingCapitalRate : 0);

    return ebit * (1 - taxRate) + depreciation - capex - workingCapitalChange;
  });
}

function calculateOperatingCashFlows(
  data: ValuationFormData,
  years: number,
  growthRate: number,
  margins: number
): number[] {
  const baseRevenue = data.revenue || 0;
  return Array.from({ length: years }, (_, i) =>
    baseRevenue * Math.pow(1 + growthRate, i) * margins
  );
}

function calculateInvestingCashFlows(data: ValuationFormData, years: number): number[] {
  const capexRate = data.capexRate || 0.1;
  return Array.from({ length: years }, (_, i) =>
    -(data.revenue || 0) * capexRate * Math.pow(1.1, i)
  );
}

function calculateFinancingCashFlows(data: ValuationFormData, years: number): number[] {
  // Simplified financing cash flows
  return Array.from({ length: years }, () => 0);
}

function calculateWorkingCapitalChanges(data: ValuationFormData, years: number): number[] {
  const workingCapitalRate = data.workingCapitalRate || 0.1;
  return Array.from({ length: years }, (_, i) =>
    -(data.revenue || 0) * workingCapitalRate * Math.pow(1.1, i)
  );
}

function calculateCustomerLifetimeValue(data: ValuationFormData): number {
  const avgRevenuePerCustomer = data.averageRevenuePerCustomer || 0;
  const churnRate = data.churnRate || 0.1;
  const grossMargin = data.margins || 0.7;

  return (avgRevenuePerCustomer * grossMargin) / churnRate;
}

function calculateAverageOrderValue(data: ValuationFormData): number {
  return data.grossMerchandiseValue && data.totalOrders
    ? data.grossMerchandiseValue / data.totalOrders
    : 0;
}

function calculateInventoryTurnover(data: ValuationFormData): number {
  return data.costOfGoodsSold && data.averageInventory
    ? data.costOfGoodsSold / data.averageInventory
    : 0;
}

function calculateTAMPenetration(data: ValuationFormData): number {
  return data.revenue && data.tam ? (data.revenue / data.tam) * 100 : 0;
}

function calculateMarketShareGrowth(data: ValuationFormData): number {
  return data.marketShare ? data.marketShare * (1 + (data.growthRate || 0)) : 0;
}

function calculateGeographicExpansion(data: ValuationFormData): number {
  // Simplified calculation based on current vs potential markets
  return data.currentMarkets && data.potentialMarkets
    ? (data.currentMarkets / data.potentialMarkets) * 100
    : 0;
}

function calculateProductExpansion(data: ValuationFormData): number {
  // Simplified calculation based on product portfolio
  return data.productLines && data.plannedProducts
    ? (data.productLines / (data.productLines + data.plannedProducts)) * 100
    : 0;
}

function calculateCustomerExpansion(data: ValuationFormData): number {
  // Simplified calculation based on customer segments
  return data.currentCustomerSegments && data.potentialSegments
    ? (data.currentCustomerSegments / data.potentialSegments) * 100
    : 0;
}

// Export utility functions for use in components
export const valuationUtils = {
  calculateWACC,
  calculateFreeCashFlows,
  calculateOperatingCashFlows,
  calculateInvestingCashFlows,
  calculateFinancingCashFlows,
  calculateWorkingCapitalChanges,
  calculateCustomerLifetimeValue,
  calculateAverageOrderValue,
  calculateInventoryTurnover,
  calculateTAMPenetration,
  calculateMarketShareGrowth,
  calculateGeographicExpansion,
  calculateProductExpansion,
  calculateCustomerExpansion

};