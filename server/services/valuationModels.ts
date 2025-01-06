import { type ValuationFormData } from "../../client/src/lib/validations";
import { calculateFinancialAssumptions, type FinancialAssumptions } from "../lib/financialAssumptions";

interface ValuationResult {
  enterpriseValue: number;
  methodology: string;
  assumptions: Record<string, any>;
  sensitivityAnalysis: {
    growthRate: Record<string, number>;
    discountRate: Record<string, number>;
  };
  details: {
    dcf?: DCFDetails;
    marketMultiples?: MarketMultiplesDetails;
    assetBased?: AssetBasedDetails;
    realOptions?: RealOptionsDetails;
    precedentTransactions?: PrecedentTransactionsDetails;
  };
}

interface DCFDetails {
  projectedCashFlows: number[];
  terminalValue: number;
  presentValue: number;
  wacc: number;
  terminalGrowthRate: number;
}

interface MarketMultiplesDetails {
  evToRevenue: number;
  evToEbitda?: number;
  peerGroupMedian: number;
  selectedMultiple: number;
  adjustmentFactors: Record<string, number>;
}

interface AssetBasedDetails {
  tangibleAssets: number;
  intangibleAssets: number;
  adjustments: Record<string, number>;
  marketValuePremium: number;
}

interface RealOptionsDetails {
  optionValue: number;
  underlyingValue: number;
  volatility: number;
  timeToExpiry: number;
  strikePrice: number;
  riskFreeRate: number;
  method: 'black-scholes' | 'binomial';
}

interface PrecedentTransactionsDetails {
  comparableDeals: Array<{
    company: string;
    date: string;
    value: number;
    multiple: number;
    similarity: number;
  }>;
  medianMultiple: number;
  adjustedValue: number;
  timeAdjustments: Record<string, number>;
}

export async function calculateValuation(
  data: ValuationFormData,
  preferredMethod?: string
): Promise<ValuationResult> {
  const assumptions = await calculateFinancialAssumptions(data);

  // Select valuation method based on business characteristics
  const method = preferredMethod || determineValuationMethod(data);

  let valuation: ValuationResult;

  switch (method) {
    case 'dcf':
      valuation = await calculateDCFValuation(data, assumptions);
      break;
    case 'marketMultiples':
      valuation = await calculateMarketMultiplesValuation(data, assumptions);
      break;
    case 'assetBased':
      valuation = await calculateAssetBasedValuation(data, assumptions);
      break;
    case 'realOptions':
      valuation = await calculateRealOptionsValuation(data, assumptions);
      break;
    case 'precedentTransactions':
      valuation = await calculatePrecedentTransactionsValuation(data, assumptions);
      break;
    default:
      valuation = await calculateDCFValuation(data, assumptions);
  }

  // Add sensitivity analysis
  valuation.sensitivityAnalysis = generateSensitivityAnalysis(data, assumptions, method);

  return valuation;
}

function determineValuationMethod(data: ValuationFormData): string {
  const { stage, sector } = data;

  // Use Real Options for R&D-heavy or expansion-focused companies
  if (data.stage === 'early_revenue' && 
      ['technology', 'biotech', 'healthcare'].includes(sector)) {
    return 'realOptions';
  }

  // Use Precedent Transactions for companies planning exit
  if (data.valuationPurpose === 'exit' || data.valuationPurpose === 'acquisition') {
    return 'precedentTransactions';
  }

  // Use DCF for high-growth companies with predictable cash flows
  if (['growth', 'scaling'].includes(stage) && 
      ['technology', 'saas', 'enterprise'].includes(sector)) {
    return 'dcf';
  }

  // Use market multiples for companies with established peers
  if (['early_revenue', 'growth'].includes(stage)) {
    return 'marketMultiples';
  }

  // Use asset-based for asset-heavy industries
  if (['industrial', 'real_estate', 'manufacturing'].includes(sector)) {
    return 'assetBased';
  }

  return 'dcf'; // Default method
}

async function calculateDCFValuation(
  data: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<ValuationResult> {
  const projectionYears = 5;
  const projectedCashFlows: number[] = [];

  // Calculate projected cash flows
  for (let year = 1; year <= projectionYears; year++) {
    const revenue = data.revenue * Math.pow(1 + (assumptions.growthRate / 100), year);
    const operatingMargin = data.margins || assumptions.industryDataQuality ? 
      assumptions.peerGroupMetrics?.averageMargins || 20 : 20;
    const cashFlow = revenue * (operatingMargin / 100);
    projectedCashFlows.push(cashFlow);
  }

  // Calculate terminal value using Gordon Growth Model
  const terminalValue = (projectedCashFlows[projectionYears - 1] * (1 + assumptions.terminalGrowthRate / 100)) /
    (assumptions.discountRate / 100 - assumptions.terminalGrowthRate / 100);

  // Calculate present value of cash flows and terminal value
  let presentValue = 0;
  projectedCashFlows.forEach((cf, index) => {
    presentValue += cf / Math.pow(1 + assumptions.discountRate / 100, index + 1);
  });

  const terminalPresentValue = terminalValue / 
    Math.pow(1 + assumptions.discountRate / 100, projectionYears);

  const enterpriseValue = presentValue + terminalPresentValue;

  return {
    enterpriseValue,
    methodology: 'Discounted Cash Flow Analysis',
    assumptions: {
      growthRate: assumptions.growthRate,
      discountRate: assumptions.discountRate,
      terminalGrowthRate: assumptions.terminalGrowthRate,
      operatingMargin: data.margins,
    },
    sensitivityAnalysis: {
      growthRate: {},
      discountRate: {},
    },
    details: {
      dcf: {
        projectedCashFlows,
        terminalValue,
        presentValue,
        wacc: assumptions.discountRate,
        terminalGrowthRate: assumptions.terminalGrowthRate,
      },
    },
  };
}

async function calculateMarketMultiplesValuation(
  data: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<ValuationResult> {
  const { revenue } = data;
  const peerMetrics = assumptions.peerGroupMetrics;

  if (!peerMetrics) {
    throw new Error("Peer group metrics are required for market multiples valuation");
  }

  // Calculate base multiple based on peer group
  const baseMultiple = peerMetrics.averageMultiple;

  // Adjust multiple based on company characteristics
  const adjustmentFactors = {
    growth: data.growthRate > peerMetrics.averageGrowth ? 1.2 : 0.8,
    margins: data.margins > peerMetrics.averageMargins ? 1.15 : 0.85,
    scale: revenue > peerMetrics.averageRevenue ? 1.1 : 0.9,
  };

  const adjustedMultiple = baseMultiple * 
    Object.values(adjustmentFactors).reduce((acc, factor) => acc * factor, 1);

  const enterpriseValue = revenue * adjustedMultiple;

  return {
    enterpriseValue,
    methodology: 'Market Multiples Analysis',
    assumptions: {
      baseMultiple,
      adjustmentFactors,
      peerMetrics,
    },
    sensitivityAnalysis: {
      growthRate: {},
      discountRate: {},
    },
    details: {
      marketMultiples: {
        evToRevenue: adjustedMultiple,
        peerGroupMedian: baseMultiple,
        selectedMultiple: adjustedMultiple,
        adjustmentFactors,
      },
    },
  };
}

async function calculateAssetBasedValuation(
  data: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<ValuationResult> {
  // Simplified asset-based valuation
  const baseAssetValue = data.revenue * 0.8; // Simplified assumption

  const adjustments = {
    intellectualProperty: data.ipProtection === 'registered' ? baseAssetValue * 0.2 : 0,
    brandValue: data.competitiveDifferentiation === 'high' ? baseAssetValue * 0.15 : 
                data.competitiveDifferentiation === 'medium' ? baseAssetValue * 0.1 : 0,
    marketPosition: data.scalabilityPotential > 7 ? baseAssetValue * 0.1 : 0,
  };

  const totalAdjustments = Object.values(adjustments).reduce((sum, val) => sum + val, 0);
  const enterpriseValue = baseAssetValue + totalAdjustments;

  return {
    enterpriseValue,
    methodology: 'Asset-Based Valuation',
    assumptions: {
      baseAssetValue,
      adjustments,
    },
    sensitivityAnalysis: {
      growthRate: {},
      discountRate: {},
    },
    details: {
      assetBased: {
        tangibleAssets: baseAssetValue,
        intangibleAssets: totalAdjustments,
        adjustments,
        marketValuePremium: totalAdjustments / baseAssetValue,
      },
    },
  };
}

async function calculateRealOptionsValuation(
  data: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<ValuationResult> {
  const underlyingValue = data.revenue * assumptions.industryMultiple;
  const volatility = assumptions.beta * 0.2; // Simplified volatility calculation
  const timeToExpiry = data.stage === 'early_revenue' ? 3 : 2; // Years
  const strikePrice = underlyingValue * 0.8; // Assumed investment needed

  // Black-Scholes calculation
  const d1 = (Math.log(underlyingValue / strikePrice) + 
    (assumptions.riskFreeRate + volatility * volatility / 2) * timeToExpiry) / 
    (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  const callOptionValue = 
    underlyingValue * normalCDF(d1) - 
    strikePrice * Math.exp(-assumptions.riskFreeRate * timeToExpiry) * normalCDF(d2);

  return {
    enterpriseValue: underlyingValue + callOptionValue,
    methodology: 'Real Options Valuation (Black-Scholes)',
    assumptions: {
      underlyingValue,
      volatility,
      timeToExpiry,
      strikePrice,
      riskFreeRate: assumptions.riskFreeRate,
    },
    sensitivityAnalysis: {
      growthRate: {},
      discountRate: {},
    },
    details: {
      realOptions: {
        optionValue: callOptionValue,
        underlyingValue,
        volatility,
        timeToExpiry,
        strikePrice,
        riskFreeRate: assumptions.riskFreeRate,
        method: 'black-scholes',
      },
    },
  };
}

async function calculatePrecedentTransactionsValuation(
  data: ValuationFormData,
  assumptions: FinancialAssumptions
): Promise<ValuationResult> {
  // Simplified comparable transactions data (in production, this would come from an API)
  const comparableDeals = [
    {
      company: "TechCo A",
      date: "2024-01-01",
      value: 1000000,
      multiple: 5.2,
      similarity: 0.8,
    },
    {
      company: "TechCo B",
      date: "2023-12-01",
      value: 2000000,
      multiple: 4.8,
      similarity: 0.7,
    },
  ];

  // Calculate median multiple from comparable deals
  const medianMultiple = comparableDeals.reduce((sum, deal) => 
    sum + deal.multiple * deal.similarity, 0) / 
    comparableDeals.reduce((sum, deal) => sum + deal.similarity, 0);

  // Apply time adjustments (e.g., for market conditions)
  const timeAdjustments = {
    marketConditions: 1.1, // 10% premium for current market
    inflationAdjustment: 1.02, // 2% adjustment for inflation
  };

  const adjustedMultiple = medianMultiple * 
    Object.values(timeAdjustments).reduce((a, b) => a * b, 1);

  const enterpriseValue = data.revenue * adjustedMultiple;

  return {
    enterpriseValue,
    methodology: 'Precedent Transactions Analysis',
    assumptions: {
      baseMultiple: medianMultiple,
      timeAdjustments,
      adjustedMultiple,
    },
    sensitivityAnalysis: {
      growthRate: {},
      discountRate: {},
    },
    details: {
      precedentTransactions: {
        comparableDeals,
        medianMultiple,
        adjustedValue: enterpriseValue,
        timeAdjustments,
      },
    },
  };
}

function generateSensitivityAnalysis(
  data: ValuationFormData,
  assumptions: FinancialAssumptions,
  method: string
): { growthRate: Record<string, number>; discountRate: Record<string, number> } {
  const sensitivityRange = [-2, -1, 0, 1, 2]; // Percentage point changes
  const baseGrowthRate = assumptions.growthRate;
  const baseDiscountRate = assumptions.discountRate;

  const growthRateAnalysis: Record<string, number> = {};
  const discountRateAnalysis: Record<string, number> = {};

  // Only perform sensitivity analysis for DCF method
  if (method === 'dcf') {
    sensitivityRange.forEach(change => {
      // Analyze growth rate sensitivity
      const modifiedData = { ...data };
      modifiedData.growthRate = baseGrowthRate + change;
      growthRateAnalysis[`${baseGrowthRate + change}%`] = 
        calculateSimplifiedDCF(modifiedData, assumptions);

      // Analyze discount rate sensitivity
      const modifiedAssumptions = { ...assumptions };
      modifiedAssumptions.discountRate = baseDiscountRate + change;
      discountRateAnalysis[`${baseDiscountRate + change}%`] = 
        calculateSimplifiedDCF(data, modifiedAssumptions);
    });
  }

  return {
    growthRate: growthRateAnalysis,
    discountRate: discountRateAnalysis,
  };
}

function calculateSimplifiedDCF(
  data: ValuationFormData,
  assumptions: FinancialAssumptions
): number {
  // Simplified DCF calculation for sensitivity analysis
  const projectionYears = 5;
  const growthRate = data.growthRate || assumptions.growthRate;
  const discountRate = assumptions.discountRate;

  let value = 0;
  for (let year = 1; year <= projectionYears; year++) {
    const cashFlow = data.revenue * 
      Math.pow(1 + growthRate / 100, year) * 
      (data.margins || 20) / 100;
    value += cashFlow / Math.pow(1 + discountRate / 100, year);
  }

  return value;
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
}