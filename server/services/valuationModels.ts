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
    default:
      // Default to DCF for most cases
      valuation = await calculateDCFValuation(data, assumptions);
  }
  
  // Add sensitivity analysis
  valuation.sensitivityAnalysis = generateSensitivityAnalysis(data, assumptions, method);
  
  return valuation;
}

function determineValuationMethod(data: ValuationFormData): string {
  const { stage, sector } = data;
  
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
