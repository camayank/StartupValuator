import { type ValuationFormData } from "./validations";

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
export function calculateSaaSMetrics(data: ValuationFormData): SaaSMetrics | null {
  if (data.sector !== 'SaaS') return null;

  const mrr = data.revenue ? data.revenue / 12 : 0;
  const arr = mrr * 12;
  const cac = data.customerAcquisitionCost || 0;
  const ltv = calculateCustomerLifetimeValue(data);
  const churnRate = data.churnRate || 0;
  const expansionRevenue = data.expansionRevenue || 0;

  return {
    arr,
    mrr,
    cac,
    ltv,
    churnRate,
    expansionRevenue
  };
}

export function calculateEcommerceMetrics(data: ValuationFormData): EcommerceMetrics | null {
  if (data.sector !== 'E-commerce') return null;

  const gmv = data.grossMerchandiseValue || 0;
  const aov = calculateAverageOrderValue(data);
  const inventoryTurnover = calculateInventoryTurnover(data);
  const repeatPurchaseRate = data.repeatPurchaseRate || 0;
  const customerLifetimeValue = calculateCustomerLifetimeValue(data);

  return {
    gmv,
    aov,
    inventoryTurnover,
    repeatPurchaseRate,
    customerLifetimeValue
  };
}

export function calculateEnterpriseMetrics(data: ValuationFormData): EnterpriseMetrics | null {
  if (data.sector !== 'Enterprise') return null;

  return {
    tcv: data.totalContractValue || 0,
    bookings: data.bookings || 0,
    backlog: data.backlog || 0,
    dealCycle: data.averageDealCycle || 0,
    contractLength: data.averageContractLength || 0
  };
}

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


// Enhanced valuation methods for different stages and sectors
export function calculateDCFValuation(data: ValuationFormData): {
  value: number;
  details: {
    fcf: number[];
    discountFactors: number[];
    presentValues: number[];
    terminalValue: number;
  };
} {
  const years = 5;
  const fcf = calculateFreeCashFlows(data, years);
  const wacc = calculateWACC(data);
  const terminalGrowthRate = data.assumptions?.terminalGrowthRate || 0.02;

  // Calculate terminal value using Gordon Growth Method
  const terminalValue = fcf[years - 1] * (1 + terminalGrowthRate) / (wacc - terminalGrowthRate);

  // Calculate present values
  const discountFactors = Array.from({ length: years }, (_, i) => Math.pow(1 + wacc, -(i + 1)));
  const presentValues = fcf.map((cf, i) => cf * discountFactors[i]);

  // Add discounted terminal value
  const totalValue = presentValues.reduce((sum, pv) => sum + pv, 0) +
                    terminalValue * discountFactors[years - 1];

  return {
    value: totalValue,
    details: {
      fcf,
      discountFactors,
      presentValues,
      terminalValue
    }
  };
}

export function calculateMarketMultiplesValuation(data: ValuationFormData): {
  value: number;
  details: {
    selectedMultiple: number;
    adjustedMultiple: number;
    comparables: Array<{ name: string; multiple: number; }>;
  };
} {
  // Get industry multiples
  const comparables = getIndustryMultiples(data.sector);

  // Calculate median multiple
  const multiples = comparables.map(c => c.multiple);
  const medianMultiple = calculateMedian(multiples);

  // Adjust multiple based on company characteristics
  const adjustedMultiple = adjustMultipleForCompany(medianMultiple, data);

  // Calculate value
  const value = data.revenue * adjustedMultiple;

  return {
    value,
    details: {
      selectedMultiple: medianMultiple,
      adjustedMultiple,
      comparables
    }
  };
}

export function calculateVCMethodValuation(data: ValuationFormData): {
  value: number;
  details: {
    exitValue: number;
    requiredReturn: number;
    yearsToExit: number;
  };
} {
  const yearsToExit = getYearsToExit(data.stage);
  const exitMultiple = getExitMultiple(data.sector);
  const projectedRevenue = data.revenue * Math.pow(1 + (data.growthRate || 0), yearsToExit);
  const exitValue = projectedRevenue * exitMultiple;
  const requiredReturn = calculateRequiredReturn(data.stage);

  const value = exitValue / Math.pow(1 + requiredReturn, yearsToExit);

  return {
    value,
    details: {
      exitValue,
      requiredReturn,
      yearsToExit
    }
  };
}

export function calculateFirstChicagoValuation(data: ValuationFormData): {
  value: number;
  details: {
    scenarios: Array<{
      name: string;
      probability: number;
      value: number;
    }>;
  };
} {
  // Calculate values for different scenarios
  const bestCase = calculateScenarioValue(data, 'best');
  const baseCase = calculateScenarioValue(data, 'base');
  const worstCase = calculateScenarioValue(data, 'worst');

  // Assign probabilities based on market conditions and company stage
  const scenarios = [
    { name: 'Best Case', value: bestCase, probability: 0.2 },
    { name: 'Base Case', value: baseCase, probability: 0.6 },
    { name: 'Worst Case', value: worstCase, probability: 0.2 }
  ];

  // Calculate weighted average
  const value = scenarios.reduce((sum, scenario) =>
    sum + scenario.value * scenario.probability, 0);

  return {
    value,
    details: { scenarios }
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

function getIndustryMultiples(sector: string): Array<{ name: string; multiple: number; }> {
  // This would typically fetch from a market data API
  // For now, returning sample data
  return [
    { name: "Company A", multiple: 5.2 },
    { name: "Company B", multiple: 4.8 },
    { name: "Company C", multiple: 6.1 },
    { name: "Company D", multiple: 5.5 }
  ];
}

function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function adjustMultipleForCompany(baseMultiple: number, data: ValuationFormData): number {
  let adjustedMultiple = baseMultiple;

  // Adjust for growth
  if (data.growthRate && data.growthRate > 0.2) {
    adjustedMultiple *= 1.2;
  }

  // Adjust for margins
  if (data.margins && data.margins > 0.3) {
    adjustedMultiple *= 1.1;
  }

  // Adjust for stage
  if (data.stage === 'early_revenue') {
    adjustedMultiple *= 0.8;
  }

  return adjustedMultiple;
}

function getYearsToExit(stage: string): number {
  const exitYears = {
    'ideation': 7,
    'mvp': 6,
    'early_revenue': 5,
    'growth': 4,
    'scaling': 3,
    'mature': 2
  };

  return exitYears[stage as keyof typeof exitYears] || 5;
}

function getExitMultiple(sector: string): number {
  const sectorMultiples = {
    'technology': 8,
    'digital': 7,
    'enterprise': 6,
    'consumer': 5,
    'healthcare': 6,
    'financial': 5
  };

  return sectorMultiples[sector as keyof typeof sectorMultiples] || 6;
}

function calculateRequiredReturn(stage: string): number {
  const returns = {
    'ideation': 0.8,
    'mvp': 0.7,
    'early_revenue': 0.6,
    'growth': 0.5,
    'scaling': 0.4,
    'mature': 0.3
  };

  return returns[stage as keyof typeof returns] || 0.5;
}

function calculateScenarioValue(data: ValuationFormData, scenario: 'best' | 'base' | 'worst'): number {
  const scenarioMultipliers = {
    best: { growth: 1.5, margins: 1.2 },
    base: { growth: 1.0, margins: 1.0 },
    worst: { growth: 0.5, margins: 0.8 }
  };

  const multiplier = scenarioMultipliers[scenario];
  const adjustedGrowth = (data.growthRate || 0.1) * multiplier.growth;
  const adjustedMargins = (data.margins || 0.2) * multiplier.margins;

  const modifiedData = {
    ...data,
    growthRate: adjustedGrowth,
    margins: adjustedMargins
  };

  return calculateDCFValuation(modifiedData).value;
}

// Helper functions
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

// Export utility functions for use in components
export const valuationUtils = {
  calculateWACC,
  calculateFreeCashFlows,
  getIndustryMultiples,
  adjustMultipleForCompany,
  getYearsToExit,
  getExitMultiple,
  calculateRequiredReturn
};