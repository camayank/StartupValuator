import { z } from 'zod';
import { type ValuationFormData } from "../validations";

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

// Updated region rules with new configurations
export const regionRules: Record<string, RegionRules> = {
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
      const expectedTAM = industry.expectedTAM; //This line might need adjustment depending on the structure of industryBenchmarks
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
  const region = regionRules[data.region];

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

function calculateCategoryRiskScore(data: ValuationFormData, category: string): number {
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

function calculateMarketRiskScore(data: ValuationFormData): number {
  // Simplified market risk calculation
  const baseScore = 0.05;
  const growthAdjustment = data.growthRate ? Math.min(data.growthRate / 100, 0.1) : 0;
  return baseScore + growthAdjustment;
}

function calculateTechnologyRiskScore(data: ValuationFormData): number {
  // Simplified technology risk calculation
  return data.sector === 'SaaS' ? 0.08 : 0.05;
}

function calculateSupplyChainRiskScore(data: ValuationFormData): number {
  // Simplified supply chain risk calculation
  return data.sector === 'E-commerce' ? 0.09 : 0.04;
}

function calculateCustomerRiskScore(data: ValuationFormData): number {
  // Simplified customer risk calculation based on margins
  return data.margins ? Math.max(0.05, 0.1 - (data.margins / 1000)) : 0.05;
}

export function generatePitchDeckMetrics(data: ValuationFormData) {
  const region = regionRules[data.region];
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

function calculateMarketShare(data: ValuationFormData): number {
  return data.revenue && data.tam ? (data.revenue / data.tam) * 100 : 0;
}

function analyzeCompetitivePosition(data: ValuationFormData): string {
  const industry = industryBenchmarks[data.sector];
  if (!industry) return 'Unknown';

  if (data.margins > industry.averageMargins * 1.2) return 'Strong';
  if (data.margins < industry.averageMargins * 0.8) return 'Weak';
  return 'Average';
}

function calculateGrowthPotential(data: ValuationFormData): {
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

function generateRecommendations(data: ValuationFormData): string[] {
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
  expectedTAM?: number; // Added expectedTAM field.  You may need to populate this based on your data source.
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
    expectedTAM: 10000000 //Example value - replace with actual data
  },
  'E-commerce': {
    averageGrowthRate: 25,
    averageMargins: 30,
    riskFactors: ['inventory_turnover', 'customer_acquisition_cost', 'gmv_growth'],
    valuationMultiples: {
      revenue: { min: 1, max: 4 },
      ebitda: { min: 8, max: 15 }
    },
    expectedTAM: 5000000 //Example value - replace with actual data
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
      const expectedRevenue = data.revenue * (1 + (regionRules[data.region]?.inflationRate || 0));
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
  const region = regionRules[data.region];
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

export * from './aiValidation';