import { z } from 'zod';
import { type ValuationFormData } from "../validations";

// Business Name Validation Schema
export const businessNameSchema = z.string()
  .min(2, "Business name must be at least 2 characters")
  .max(100, "Business name cannot exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s&\-.']+$/, {
    message: "Business name can only contain letters, numbers, spaces, &, -, ', and ."
  })
  .transform(val => val.trim());

// Region and Jurisdiction Rules
export interface RegionRules {
  riskFreeRate: number;
  valuationStandard: 'IVS' | 'USPAP' | 'other';
  currency: string;
  inflationRate: number;
  complianceRules: string[];
}

export const regionRules: Record<string, RegionRules> = {
  'US': {
    riskFreeRate: 0.05,
    valuationStandard: 'USPAP',
    currency: 'USD',
    inflationRate: 0.04,
    complianceRules: ['SEC', 'GAAP', '409A']
  },
  'IN': {
    riskFreeRate: 0.07,
    valuationStandard: 'IVS',
    currency: 'INR',
    inflationRate: 0.06,
    complianceRules: ['IBBI', 'MCA', 'IndAS']
  },
  // Add more regions as needed
};

// Industry Benchmarks
export interface IndustryBenchmark {
  averageGrowthRate: number;
  averageMargins: number;
  riskFactors: string[];
  valuationMultiples: {
    revenue: { min: number; max: number };
    ebitda: { min: number; max: number };
  };
}

export const industryBenchmarks: Record<string, IndustryBenchmark> = {
  'SaaS': {
    averageGrowthRate: 40,
    averageMargins: 70,
    riskFactors: ['churn_rate', 'cac_payback', 'arr_growth'],
    valuationMultiples: {
      revenue: { min: 5, max: 15 },
      ebitda: { min: 15, max: 25 }
    }
  },
  'E-commerce': {
    averageGrowthRate: 25,
    averageMargins: 30,
    riskFactors: ['inventory_turnover', 'customer_acquisition_cost', 'gmv_growth'],
    valuationMultiples: {
      revenue: { min: 1, max: 4 },
      ebitda: { min: 8, max: 15 }
    }
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
