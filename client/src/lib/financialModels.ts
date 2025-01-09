import { type ValuationFormData, sectors } from "./validations";

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

export interface ManufacturingMetrics {
  capacityUtilization: number;
  cycleTime: number;
  defectRate: number;
  inventoryTurnover: number;
  operationalEfficiency: number;
}

export interface HealthcareMetrics {
  patientVolume: number;
  averageReimbursementRate: number;
  operatingMargin: number;
  patientRetentionRate: number;
  qualityMetrics: number;
}

export interface FintechMetrics {
  transactionVolume: number;
  processingFeeRate: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  fraudRate: number;
}

// Industry-specific valuation functions
export function calculateSaaSMetrics(data: ValuationFormData): SaaSMetrics | undefined {
  if (!data.sector || !sectors[data.sector]?.name?.includes('Technology')) return undefined;

  // Calculate based on available data
  const monthlyRevenue = (data.revenue || 0) / 12;

  return {
    arr: (data.revenue || 0),
    mrr: monthlyRevenue,
    cac: monthlyRevenue * 0.3, // Estimated CAC based on industry averages
    ltv: monthlyRevenue * 36, // Estimated 3-year LTV
    churnRate: 0.08, // Default to 8% annual churn
    expansionRevenue: monthlyRevenue * 0.15 // Estimated expansion revenue
  };
}

export function calculateEcommerceMetrics(data: ValuationFormData): EcommerceMetrics | undefined {
  if (!data.sector || !sectors[data.sector]?.name?.includes('E-commerce')) return undefined;

  const annualRevenue = data.revenue || 0;
  const estimatedOrders = annualRevenue / 100; // Average order value assumption

  return {
    gmv: annualRevenue * 1.2, // Estimated GMV with marketplace fees
    aov: 100, // Default average order value
    inventoryTurnover: 4, // Quarterly turnover
    repeatPurchaseRate: 0.3, // 30% repeat purchase rate
    customerLifetimeValue: 300 // Estimated LTV
  };
}

export function calculateManufacturingMetrics(data: ValuationFormData): ManufacturingMetrics | undefined {
  if (!data.sector || !sectors[data.sector]?.name?.includes('Industrial')) return undefined;

  return {
    capacityUtilization: 0.75, // 75% capacity utilization
    cycleTime: 24, // 24-hour cycle time
    defectRate: 0.02, // 2% defect rate
    inventoryTurnover: 6, // Bi-monthly turnover
    operationalEfficiency: 0.85 // 85% operational efficiency
  };
}

export function calculateHealthcareMetrics(data: ValuationFormData): HealthcareMetrics | undefined {
  if (!data.sector || !sectors[data.sector]?.name?.includes('Healthcare')) return undefined;

  return {
    patientVolume: (data.revenue || 0) / 1000, // Estimated patient volume
    averageReimbursementRate: 0.7, // 70% reimbursement rate
    operatingMargin: data.margins || 0,
    patientRetentionRate: 0.8, // 80% retention
    qualityMetrics: 0.9 // 90% quality score
  };
}

export function calculateFintechMetrics(data: ValuationFormData): FintechMetrics | undefined {
  if (!data.sector || !sectors[data.sector]?.name?.includes('Financial')) return undefined;

  return {
    transactionVolume: (data.revenue || 0) * 20, // Estimated transaction volume
    processingFeeRate: 0.029, // 2.9% processing fee
    customerAcquisitionCost: 200, // $200 CAC
    lifetimeValue: 1000, // $1000 LTV
    fraudRate: 0.001 // 0.1% fraud rate
  };
}

// Market comparables analysis
export async function getMarketComparables(data: ValuationFormData): Promise<MarketComparable[]> {
  // This would typically fetch real-time data from an API
  return [{
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
  }];
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

// Growth potential analysis
export async function analyzeGrowthPotential(data: ValuationFormData): Promise<GrowthAnalysis> {
  const baseGrowthRate = data.growthRate || 0;
  const baseMargins = data.margins || 0;

  return {
    tamPenetration: 0.05, // 5% market penetration
    marketShareGrowth: baseGrowthRate / 100,
    expansionMetrics: {
      geographic: 0.3, // 30% geographic expansion potential
      product: 0.4, // 40% product expansion potential
      customer: 0.3 // 30% customer segment expansion
    },
    growthDrivers: {
      organic: 0.7,
      acquisition: 0.2,
      partnership: 0.1
    }
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

// Cash flow projections
export async function projectCashFlows(data: ValuationFormData): Promise<CashFlowProjection> {
  const baseRevenue = data.revenue || 0;
  const growthRate = (data.growthRate || 0) / 100;
  const margins = (data.margins || 0) / 100;
  const periods = Array.from({ length: 5 }, (_, i) => `Year ${i + 1}`);

  const calculateCashFlow = (year: number) => {
    const revenue = baseRevenue * Math.pow(1 + growthRate, year);
    return revenue * margins;
  };

  const operatingCashFlow = periods.map((_, i) => calculateCashFlow(i));
  const investingCashFlow = periods.map(() => -baseRevenue * 0.1);
  const financingCashFlow = periods.map(() => 0);
  const workingCapitalChanges = periods.map(() => -baseRevenue * 0.05);
  const netCashFlow = periods.map((_, i) =>
    operatingCashFlow[i] + investingCashFlow[i] + financingCashFlow[i] + workingCapitalChanges[i]
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

// Cap table modeling
export async function modelCapTable(data: ValuationFormData): Promise<CapTable> {
  const totalShares = 10000000; // 10M shares
  const optionPool = totalShares * 0.1; // 10% option pool

  const entries: CapTableEntry[] = [
    {
      investorName: "Founders",
      shareClass: "Common",
      sharesOutstanding: totalShares * 0.7,
      ownershipPercentage: 0.7,
      valuationAtEntry: data.revenue ? data.revenue * 3 : 0
    },
    {
      investorName: "Option Pool",
      shareClass: "Common",
      sharesOutstanding: optionPool,
      ownershipPercentage: 0.1,
      valuationAtEntry: 0
    },
    {
      investorName: "Investors",
      shareClass: "Preferred",
      sharesOutstanding: totalShares * 0.2,
      ownershipPercentage: 0.2,
      valuationAtEntry: data.revenue ? data.revenue * 4 : 0,
      liquidationPreference: 1,
      antiDilutionProtection: true
    }
  ];

  return {
    totalShares,
    entries,
    fullyDilutedShares: totalShares + optionPool,
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