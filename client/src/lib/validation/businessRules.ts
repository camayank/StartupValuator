import { z } from 'zod';
import { type ValuationFormData } from "../validations";

// Financial Projections Configuration
export interface FinancialProjectionRules {
  inflationAdjustment: number;
  historicalTrendWeight: number;
  industryGrowthWeight: number;
  minimumHistoricalPeriods: number;
  maximumProjectionYears: number;
}

// Currency Configuration
export interface CurrencyConfig {
  code: string;
  symbol: string;
  exchangeRate: number;
  inflationRate: number;
  volatilityRisk: number;
}

// Valuation Purpose Configuration
export interface ValuationPurposeConfig {
  growthMultiplier: number;
  riskAdjustment: number;
  requiredMetrics: string[];
  complianceRequirements: string[];
  methodologyPreference: 'DCF' | 'Market' | 'Asset' | 'Hybrid';
}

// Macroeconomic Configuration
export interface MacroeconomicConfig {
  gdpGrowth: number;
  inflationRate: number;
  interestRate: number;
  marketRiskPremium: number;
  countryRiskPremium: number;
}

// Asset-Based Valuation Configuration
export interface AssetValuationConfig {
  tangibleAssetMultiplier: number;
  intangibleAssetMultiplier: number;
  depreciationRates: Record<string, number>;
  obsolescenceRisk: number;
}

// Enhanced Region Configuration
export interface EnhancedRegionRules extends RegionRules {
  macroeconomic: MacroeconomicConfig;
  assetValuation: AssetValuationConfig;
  financialProjections: FinancialProjectionRules;
  currencies: Record<string, CurrencyConfig>;
  valuationPurposes: Record<string, ValuationPurposeConfig>;
}

// TAM Validation Schema
export const tamValidationSchema = z.object({
  tam: z.number().positive("TAM must be positive"),
  region: z.string(),
  industry: z.string(),
  yearProjected: z.number()
});

// DCF Configuration
export interface DCFRules {
  minProjectionYears: number;
  riskFreeRate: number;
  terminalGrowthRate: number;
  wacc: number;
  sensitivityRange: number;
}

// Market Multiples Configuration
export interface MarketMultiples {
  evEbitda: { min: number; max: number };
  evRevenue: { min: number; max: number };
  peRatio: { min: number; max: number };
  illiquidityDiscount: number;
}

export interface RealOptionsConfig {
  volatility: number;
  riskFreeRate: number;
  timeHorizon: number;
  exercisePrice: number;
}

// Regional Configuration
export interface RegionRules {
  riskFreeRate: number;
  valuationStandard: 'IVS' | 'USPAP' | 'other';
  currency: string;
  inflationRate: number;
  complianceRules: string[];
  realOptionsConfig: RealOptionsConfig;
  marketMultiples: MarketMultiples;
  dcfRules: DCFRules;
}


// Update region rules with new configurations
export const enhancedRegionRules: Record<string, EnhancedRegionRules> = {
  'US': {
    riskFreeRate: 0.05,
    valuationStandard: 'USPAP',
    currency: 'USD',
    inflationRate: 0.04,
    complianceRules: ['SEC', 'GAAP', '409A'],
    realOptionsConfig: {
      volatility: 0.30,
      riskFreeRate: 0.05,
      timeHorizon: 5,
      exercisePrice: 1000000
    },
    marketMultiples: {
      evEbitda: { min: 8, max: 20 },
      evRevenue: { min: 2, max: 10 },
      peRatio: { min: 15, max: 30 },
      illiquidityDiscount: 0.20
    },
    dcfRules: {
      minProjectionYears: 5,
      riskFreeRate: 0.05,
      terminalGrowthRate: 0.03,
      wacc: 0.12,
      sensitivityRange: 0.01
    },
    macroeconomic: {
      gdpGrowth: 0.023,
      inflationRate: 0.042,
      interestRate: 0.055,
      marketRiskPremium: 0.057,
      countryRiskPremium: 0
    },
    assetValuation: {
      tangibleAssetMultiplier: 1.0,
      intangibleAssetMultiplier: 1.2,
      depreciationRates: {
        'equipment': 0.2,
        'buildings': 0.04,
        'technology': 0.33
      },
      obsolescenceRisk: 0.15
    },
    financialProjections: {
      inflationAdjustment: 0.042,
      historicalTrendWeight: 0.6,
      industryGrowthWeight: 0.4,
      minimumHistoricalPeriods: 3,
      maximumProjectionYears: 5
    },
    currencies: {
      'USD': {
        code: 'USD',
        symbol: '$',
        exchangeRate: 1,
        inflationRate: 0.042,
        volatilityRisk: 0
      },
      'EUR': {
        code: 'EUR',
        symbol: '€',
        exchangeRate: 0.85,
        inflationRate: 0.035,
        volatilityRisk: 0.02
      }
    },
    valuationPurposes: {
      'fundraising': {
        growthMultiplier: 1.2,
        riskAdjustment: 0.9,
        requiredMetrics: ['revenue_growth', 'market_size', 'competitive_position'],
        complianceRequirements: ['409A', 'ASC_820'],
        methodologyPreference: 'DCF'
      },
      'acquisition': {
        growthMultiplier: 1.0,
        riskAdjustment: 1.1,
        requiredMetrics: ['ebitda', 'working_capital', 'synergies'],
        complianceRequirements: ['GAAP', 'SEC'],
        methodologyPreference: 'Market'
      }
    }
  },
  'IN': {
    riskFreeRate: 0.07,
    valuationStandard: 'IVS',
    currency: 'INR',
    inflationRate: 0.06,
    complianceRules: ['IBBI', 'MCA', 'IndAS'],
    realOptionsConfig: {
      volatility: 0.35,
      riskFreeRate: 0.07,
      timeHorizon: 5,
      exercisePrice: 50000000
    },
    marketMultiples: {
      evEbitda: { min: 6, max: 18 },
      evRevenue: { min: 1.5, max: 8 },
      peRatio: { min: 12, max: 25 },
      illiquidityDiscount: 0.25
    },
    dcfRules: {
      minProjectionYears: 5,
      riskFreeRate: 0.07,
      terminalGrowthRate: 0.04,
      wacc: 0.14,
      sensitivityRange: 0.01
    },
    macroeconomic: { // Added macroeconomic data for India.  Replace with actual data.
      gdpGrowth: 0.07,
      inflationRate: 0.05,
      interestRate: 0.08,
      marketRiskPremium: 0.07,
      countryRiskPremium: 0.01
    },
    assetValuation: { // Added asset valuation data for India. Replace with actual data.
      tangibleAssetMultiplier: 0.9,
      intangibleAssetMultiplier: 1.1,
      depreciationRates: {
        'equipment': 0.25,
        'buildings': 0.05,
        'technology': 0.4
      },
      obsolescenceRisk: 0.2
    },
    financialProjections: { // Added financial projection data for India.  Replace with actual data.
      inflationAdjustment: 0.05,
      historicalTrendWeight: 0.5,
      industryGrowthWeight: 0.5,
      minimumHistoricalPeriods: 2,
      maximumProjectionYears: 5
    },
    currencies: { // Added currency data for India. Replace with actual data.
      'INR': {
        code: 'INR',
        symbol: '₹',
        exchangeRate: 0.012,
        inflationRate: 0.05,
        volatilityRisk: 0.03
      }
    },
    valuationPurposes: { // Added valuation purpose data for India. Replace with actual data.
      'internal': {
        growthMultiplier: 1.0,
        riskAdjustment: 1.0,
        requiredMetrics: ['revenue', 'ebitda', 'net_income'],
        complianceRequirements: ['IndAS'],
        methodologyPreference: 'DCF'
      }
    }
  }
};

// Risk Analysis Configuration
export interface RiskFactor {
  category: string;
  weight: number;
  description: string;
  mitigationSuggestions: string[];
}

export const riskFactors: Record<string, RiskFactor[]> = {
  'SaaS': [
    {
      category: 'Market Risk',
      weight: 0.3,
      description: 'Competitive landscape and market saturation risks',
      mitigationSuggestions: [
        'Develop unique features',
        'Focus on niche markets',
        'Build strong customer relationships'
      ]
    },
    {
      category: 'Technology Risk',
      weight: 0.25,
      description: 'Technical debt and scalability challenges',
      mitigationSuggestions: [
        'Regular code audits',
        'Scalable architecture',
        'Strong security measures'
      ]
    }
  ],
  'E-commerce': [
    {
      category: 'Supply Chain Risk',
      weight: 0.35,
      description: 'Inventory and logistics management risks',
      mitigationSuggestions: [
        'Multiple supplier relationships',
        'Inventory optimization',
        'Logistics partnerships'
      ]
    },
    {
      category: 'Customer Risk',
      weight: 0.25,
      description: 'Customer acquisition and retention risks',
      mitigationSuggestions: [
        'Customer loyalty programs',
        'Personalized marketing',
        'Excellent customer service'
      ]
    }
  ]
};

// Validation Functions
export function validateTAM(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  if (data.tam !== undefined) {
    if (data.tam <= 0) {
      warnings.push({
        field: 'tam',
        message: 'TAM must be positive',
        severity: 'high'
      });
    }

    // Industry-specific TAM validation
    const industry = industryBenchmarks[data.sector];
    if (industry) {
      const expectedTAM = industry.expectedTAM;
      if (data.tam > expectedTAM * 2) {
        warnings.push({
          field: 'tam',
          message: `TAM seems unusually high for ${data.sector} sector`,
          severity: 'high',
          suggestion: expectedTAM
        });
      }
    }
  }

  return warnings;
}

export function validateDCFInputs(data: ValuationFormData) {
  const warnings = [];
  const region = enhancedRegionRules[data.region];

  if (!region) return warnings;

  const dcfRules = region.dcfRules;

  // Validate projection years
  if (data.projectionYears < dcfRules.minProjectionYears) {
    warnings.push({
      field: 'projectionYears',
      message: `Minimum ${dcfRules.minProjectionYears} years of projections required`,
      severity: 'high',
      suggestion: dcfRules.minProjectionYears
    });
  }

  // Validate growth assumptions
  if (data.terminalGrowthRate > dcfRules.terminalGrowthRate * 1.5) {
    warnings.push({
      field: 'terminalGrowthRate',
      message: 'Terminal growth rate seems too optimistic',
      severity: 'medium',
      suggestion: dcfRules.terminalGrowthRate
    });
  }

  return warnings;
}

export function calculateRiskPremium(data: ValuationFormData): {
  totalPremium: number;
  breakdown: Record<string, number>;
} {
  const riskFactorsForIndustry = riskFactors[data.sector] || [];
  let totalPremium = 0;
  const breakdown: Record<string, number> = {};

  riskFactorsForIndustry.forEach(factor => {
    const premium = factor.weight * calculateCategoryRiskScore(data, factor.category);
    breakdown[factor.category] = premium;
    totalPremium += premium;
  });

  return {
    totalPremium,
    breakdown
  };
}

export function calculateCategoryRiskScore(data: ValuationFormData, category: string): number {
  // Implementation of risk score calculation based on category
  // This is a simplified version, actual implementation would be more complex
  switch (category) {
    case 'Market Risk':
      return calculateMarketRiskScore(data);
    case 'Technology Risk':
      return calculateTechnologyRiskScore(data);
    case 'Supply Chain Risk':
      return calculateSupplyChainRiskScore(data);
    case 'Customer Risk':
      return calculateCustomerRiskScore(data);
    default:
      return 0.05; // Base risk score
  }
}

export function calculateMarketRiskScore(data: ValuationFormData): number {
  // Simplified market risk calculation
  const baseScore = 0.05;
  const growthAdjustment = data.growthRate ? Math.min(data.growthRate / 100, 0.1) : 0;
  return baseScore + growthAdjustment;
}

export function calculateTechnologyRiskScore(data: ValuationFormData): number {
  // Simplified technology risk calculation
  return data.sector === 'SaaS' ? 0.08 : 0.05;
}

export function calculateSupplyChainRiskScore(data: ValuationFormData): number {
  // Simplified supply chain risk calculation
  return data.sector === 'E-commerce' ? 0.09 : 0.04;
}

export function calculateCustomerRiskScore(data: ValuationFormData): number {
  // Simplified customer risk calculation based on margins
  return data.margins ? Math.max(0.05, 0.1 - (data.margins / 1000)) : 0.05;
}

export function generatePitchDeckMetrics(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  const industry = industryBenchmarks[data.sector];

  if (!region || !industry) return null;

  return {
    financialMetrics: {
      revenue: data.revenue,
      margins: data.margins,
      growthRate: data.growthRate
    },
    marketMetrics: {
      tam: data.tam,
      marketShare: calculateMarketShare(data),
      competitivePosition: analyzeCompetitivePosition(data)
    },
    riskAnalysis: calculateRiskPremium(data),
    valuationMultiples: region.marketMultiples,
    growthPotential: calculateGrowthPotential(data),
    recommendations: generateRecommendations(data)
  };
}

export function calculateMarketShare(data: ValuationFormData): number {
  return data.revenue && data.tam ? (data.revenue / data.tam) * 100 : 0;
}

export function analyzeCompetitivePosition(data: ValuationFormData): string {
  const industry = industryBenchmarks[data.sector];
  if (!industry) return 'Unknown';

  if (data.margins > industry.averageMargins * 1.2) return 'Strong';
  if (data.margins < industry.averageMargins * 0.8) return 'Weak';
  return 'Average';
}

export function calculateGrowthPotential(data: ValuationFormData): {
  score: number;
  factors: string[];
} {
  const industry = industryBenchmarks[data.sector];
  if (!industry) return { score: 0, factors: [] };

  const factors = [];
  let score = 0;

  if (data.growthRate > industry.averageGrowthRate) {
    score += 0.4;
    factors.push('Above average growth rate');
  }

  if (data.margins > industry.averageMargins) {
    score += 0.3;
    factors.push('Strong margins');
  }

  if (data.tam && data.revenue && (data.revenue / data.tam < 0.1)) {
    score += 0.3;
    factors.push('Large market opportunity');
  }

  return { score, factors };
}

export function generateRecommendations(data: ValuationFormData): string[] {
  const recommendations = [];
  const industry = industryBenchmarks[data.sector];

  if (!industry) return recommendations;

  if (data.margins < industry.averageMargins) {
    recommendations.push('Focus on margin improvement through operational efficiency');
  }

  if (data.growthRate < industry.averageGrowthRate) {
    recommendations.push('Explore new market opportunities and customer segments');
  }

  const riskAnalysis = calculateRiskPremium(data);
  const highestRisk = Object.entries(riskAnalysis.breakdown)
    .sort(([, a], [, b]) => b - a)[0];

  if (highestRisk) {
    const riskFactor = riskFactors[data.sector]?.find(f => f.category === highestRisk[0]);
    if (riskFactor) {
      recommendations.push(...riskFactor.mitigationSuggestions);
    }
  }

  return recommendations;
}


// Business Name Validation Schema
export const businessNameSchema = z.string()
  .min(2, "Business name must be at least 2 characters")
  .max(100, "Business name cannot exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s&\-.']+$/, {
    message: "Business name can only contain letters, numbers, spaces, &, -, ', and ."
  })
  .transform(val => val.trim());

// Region and Jurisdiction Rules

// Industry Benchmarks
export interface IndustryBenchmark {
  averageGrowthRate: number;
  averageMargins: number;
  riskFactors: string[];
  valuationMultiples: {
    revenue: { min: number; max: number };
    ebitda: { min: number; max: number };
  };
  expectedTAM?: number;
}

export const industryBenchmarks: Record<string, IndustryBenchmark> = {
  'SaaS': {
    averageGrowthRate: 40,
    averageMargins: 70,
    riskFactors: ['churn_rate', 'cac_payback', 'arr_growth'],
    valuationMultiples: {
      revenue: { min: 5, max: 15 },
      ebitda: { min: 15, max: 25 }
    },
    expectedTAM: 10000000
  },
  'E-commerce': {
    averageGrowthRate: 25,
    averageMargins: 30,
    riskFactors: ['inventory_turnover', 'customer_acquisition_cost', 'gmv_growth'],
    valuationMultiples: {
      revenue: { min: 1, max: 4 },
      ebitda: { min: 8, max: 15 }
    },
    expectedTAM: 5000000
  }
  // Add more industries as needed
};

// Cash Flow Stability Categories
export type CashFlowStability = 'Stable' | 'Moderate' | 'Volatile';

export interface CashFlowRules {
  discountRateAdjustment: number;
  requiredScenarioAnalysis: boolean;
  recommendedActions: string[];
}

export const cashFlowStabilityRules: Record<CashFlowStability, CashFlowRules> = {
  'Stable': {
    discountRateAdjustment: 0,
    requiredScenarioAnalysis: false,
    recommendedActions: ['Consider long-term growth investments']
  },
  'Moderate': {
    discountRateAdjustment: 0.02,
    requiredScenarioAnalysis: true,
    recommendedActions: ['Implement working capital optimization', 'Review pricing strategy']
  },
  'Volatile': {
    discountRateAdjustment: 0.05,
    requiredScenarioAnalysis: true,
    recommendedActions: ['Develop cash flow forecasting model', 'Implement strict cost controls']
  }
};

// Validation Functions
export function validateBusinessMetrics(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  // Revenue Validation
  if (data.revenue !== undefined) {
    if (data.revenue <= 0) {
      warnings.push({
        field: 'revenue',
        message: 'Revenue must be positive',
        severity: 'high'
      });
    }

    // Inflation Adjustment Check
    const industry = industryBenchmarks[data.sector];
    if (industry) {
      const expectedRevenue = data.revenue * (1 + (enhancedRegionRules[data.region]?.inflationRate || 0));
      if (Math.abs(data.revenue - expectedRevenue) > expectedRevenue * 0.1) {
        warnings.push({
          field: 'revenue',
          message: 'Consider adjusting revenue for inflation',
          severity: 'medium',
          suggestion: expectedRevenue
        });
      }
    }
  }

  // Growth Rate Validation
  if (data.growthRate !== undefined) {
    const industry = industryBenchmarks[data.sector];
    if (industry) {
      if (data.growthRate > industry.averageGrowthRate * 2) {
        warnings.push({
          field: 'growthRate',
          message: `Growth rate is significantly higher than industry average of ${industry.averageGrowthRate}%`,
          severity: 'high',
          suggestion: industry.averageGrowthRate
        });
      }
    }
  }

  // Operating Margins Validation
  if (data.margins !== undefined) {
    const industry = industryBenchmarks[data.sector];
    if (industry) {
      if (data.margins > industry.averageMargins * 1.5) {
        warnings.push({
          field: 'margins',
          message: `Operating margins are significantly higher than industry average of ${industry.averageMargins}%`,
          severity: 'high',
          suggestion: industry.averageMargins
        });
      }
    }
  }

  //Add TAM validation
  warnings.push(...validateTAM(data));

  //Add DCF validation
  warnings.push(...validateDCFInputs(data));

  return warnings;
}

export function validateRegionCompliance(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  if (!region) return [];

  const complianceChecks = [];

  // Check for region-specific requirements
  for (const rule of region.complianceRules) {
    complianceChecks.push({
      rule,
      status: 'pending',
      message: `Ensure compliance with ${rule} requirements`
    });
  }

  return complianceChecks;
}

export function assessCashFlowStability(data: ValuationFormData): CashFlowStability {
  // Basic stability assessment based on available metrics
  if (data.margins === undefined || data.growthRate === undefined) {
    return 'Moderate';
  }

  if (data.margins > 20 && data.growthRate < 50) {
    return 'Stable';
  } else if (data.margins < 0 || data.growthRate > 100) {
    return 'Volatile';
  } else {
    return 'Moderate';
  }
}

// Validation Functions from edited snippet
export function validateFinancialProjections(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  const region = enhancedRegionRules[data.region];
  if (!region) return warnings;

  // Validate historical data completeness
  if (!data.historicalPeriods || data.historicalPeriods < region.financialProjections.minimumHistoricalPeriods) {
    warnings.push({
      field: 'historicalPeriods',
      message: `Minimum ${region.financialProjections.minimumHistoricalPeriods} years of historical data required`,
      severity: 'high',
      suggestion: region.financialProjections.minimumHistoricalPeriods
    });
  }

  // Validate projection period
  if (data.projectionYears > region.financialProjections.maximumProjectionYears) {
    warnings.push({
      field: 'projectionYears',
      message: `Maximum ${region.financialProjections.maximumProjectionYears} years of projections recommended`,
      severity: 'medium',
      suggestion: region.financialProjections.maximumProjectionYears
    });
  }

  // Validate growth assumptions against macroeconomic factors
  if (data.growthRate > (region.macroeconomic.gdpGrowth * 5)) {
    warnings.push({
      field: 'growthRate',
      message: 'Growth rate significantly exceeds GDP growth',
      severity: 'medium',
      suggestion: region.macroeconomic.gdpGrowth * 3
    });
  }

  return warnings;
}

export function validateCurrencyConsistency(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  const region = enhancedRegionRules[data.region];
  if (!region) return warnings;

  const selectedCurrency = region.currencies[data.currency];
  if (!selectedCurrency) {
    warnings.push({
      field: 'currency',
      message: 'Selected currency not supported in this region',
      severity: 'high'
    });
    return warnings;
  }

  // Adjust for currency volatility
  if (selectedCurrency.volatilityRisk > 0.05) {
    warnings.push({
      field: 'currency',
      message: 'High currency volatility risk detected',
      severity: 'medium',
      suggestion: region.currencies['USD'].code
    });
  }

  return warnings;
}

export function validateValuationPurpose(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  const region = enhancedRegionRules[data.region];
  if (!region) return warnings;

  const purposeConfig = region.valuationPurposes[data.valuationPurpose];
  if (!purposeConfig) {
    warnings.push({
      field: 'valuationPurpose',
      message: 'Valuation purpose not supported in this region',
      severity: 'high'
    });
    return warnings;
  }

  // Check required metrics
  purposeConfig.requiredMetrics.forEach(metric => {
    if (!data[metric as keyof ValuationFormData]) {
      warnings.push({
        field: metric as keyof ValuationFormData,
        message: `${metric} is required for ${data.valuationPurpose} valuation`,
        severity: 'high'
      });
    }
  });

  return warnings;
}

// Asset-Based Valuation
export function validateAssetValuation(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  const region = enhancedRegionRules[data.region];
  if (!region) return warnings;

  // Validate tangible assets
  if (data.tangibleAssets) {
    const adjustedValue = data.tangibleAssets * region.assetValuation.tangibleAssetMultiplier;
    if (Math.abs(data.tangibleAssets - adjustedValue) > adjustedValue * 0.2) {
      warnings.push({
        field: 'tangibleAssets',
        message: 'Consider market-based adjustment for tangible assets',
        severity: 'medium',
        suggestion: adjustedValue
      });
    }
  }

  // Validate intangible assets
  if (data.intangibleAssets) {
    const adjustedValue = data.intangibleAssets * region.assetValuation.intangibleAssetMultiplier;
    if (Math.abs(data.intangibleAssets - adjustedValue) > adjustedValue * 0.3) {
      warnings.push({
        field: 'intangibleAssets',
        message: 'Consider risk-adjusted value for intangible assets',
        severity: 'medium',
        suggestion: adjustedValue
      });
    }
  }

  return warnings;
}

export * from './aiValidation';