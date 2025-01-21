import { type ValuationFormData } from "./validations";

interface ValidationResult {
  isValid: boolean;
  warning?: string;
  suggestions?: string[];
}

interface MetricValidation {
  validate: (value: number, data: ValuationFormData) => ValidationResult;
  benchmarks: {
    seed: { min: number; target: number };
    seriesA: { min: number; target: number };
  };
}

interface IndustryMetrics {
  required: string[];
  recommended: string[];
  metrics: Record<string, MetricValidation>;
}

export const IndustryValidationEngine = {
  SaaS: {
    required: ['mrr', 'arr', 'churnRate', 'cac', 'ltv'],
    recommended: ['expansionRevenue', 'nps', 'activeUsers'],
    metrics: {
      mrr: {
        validate: (value: number, data: ValuationFormData): ValidationResult => {
          const { customerBase: userCount } = data;
          const averageRevenue = value / (userCount || 1);
          const expectedMRR = userCount * averageRevenue;
          const variance = Math.abs(value - expectedMRR) / expectedMRR;

          return {
            isValid: variance <= 0.2,
            warning: variance > 0.2 ? 
              `MRR appears ${value > expectedMRR ? 'high' : 'low'} for your user base` : undefined,
            suggestions: [
              'Verify your pricing tiers',
              'Check user segmentation',
              'Review revenue recognition timing'
            ]
          };
        },
        benchmarks: {
          seed: { min: 5000, target: 10000 },
          seriesA: { min: 40000, target: 100000 }
        }
      },

      churnRate: {
        validate: (value: number, data: ValuationFormData): ValidationResult => {
          const maxAcceptable = data.revenueModel === 'enterprise' ? 2 : 5;

          return {
            isValid: value <= maxAcceptable,
            warning: value > maxAcceptable ? 
              `Churn rate of ${value}% is high for your business model` : undefined,
            suggestions: [
              'Analyze customer segments with highest churn',
              'Review onboarding process',
              'Consider implementing retention programs'
            ]
          };
        },
        benchmarks: {
          seed: { min: 0, target: 5 },
          seriesA: { min: 0, target: 3 }
        }
      }
    }
  } as IndustryMetrics,

  Ecommerce: {
    required: ['gmv', 'aov', 'orderCount', 'returnRate'],
    recommended: ['repeatPurchaseRate', 'inventoryTurnover'],
    metrics: {
      aov: {
        validate: (value: number, data: ValuationFormData): ValidationResult => {
          const { revenue, customerBase } = data;
          const calculatedAOV = revenue / (customerBase || 1);
          const variance = Math.abs(value - calculatedAOV) / calculatedAOV;

          return {
            isValid: variance <= 0.1,
            warning: variance > 0.1 ?
              'Average order value seems inconsistent with revenue and customer data' : undefined,
            suggestions: [
              'Review your product mix',
              'Analyze customer segments',
              'Check for seasonal variations'
            ]
          };
        },
        benchmarks: {
          seed: { min: 25, target: 50 },
          seriesA: { min: 50, target: 100 }
        }
      },

      conversionRate: {
        validate: (value: number, data: ValuationFormData): ValidationResult => {
          const industryAverage = 2.5; // Example industry average

          return {
            isValid: value >= industryAverage * 0.5,
            warning: value < industryAverage * 0.5 ?
              'Conversion rate is significantly below industry average' : undefined,
            suggestions: [
              'Review checkout process',
              'Analyze cart abandonment reasons',
              'Consider A/B testing key pages'
            ]
          };
        },
        benchmarks: {
          seed: { min: 1, target: 2.5 },
          seriesA: { min: 2, target: 4 }
        }
      }
    }
  } as IndustryMetrics,

  validateIndustryMetrics: (data: ValuationFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const industry = data.sector;
    const metrics = IndustryValidationEngine[industry]?.metrics || {};

    Object.entries(metrics).forEach(([metricName, validation]) => {
      const value = data[metricName as keyof ValuationFormData];
      if (typeof value === 'number') {
        results.push(validation.validate(value, data));
      }
    });

    return results;
  },

  getRequiredMetrics: (industry: keyof typeof IndustryValidationEngine): string[] => {
    return IndustryValidationEngine[industry]?.required || [];
  },

  getRecommendedMetrics: (industry: keyof typeof IndustryValidationEngine): string[] => {
    return IndustryValidationEngine[industry]?.recommended || [];
  },

  getBenchmarks: (industry: keyof typeof IndustryValidationEngine, metric: string) => {
    return IndustryValidationEngine[industry]?.metrics[metric]?.benchmarks || null;
  }
};

export default IndustryValidationEngine;