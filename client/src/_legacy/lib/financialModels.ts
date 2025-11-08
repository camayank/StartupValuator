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
