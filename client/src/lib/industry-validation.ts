import { type ValuationFormData } from "./validations";

interface ValidationResult {
  isValid: boolean;
  warning?: string;
  suggestions?: string[];
}

interface IndustryMetrics {
  required: string[];
  recommended: string[];
}

export const IndustrySpecificValidation = {
  SaaS: {
    revenueValidation: (data: ValuationFormData): ValidationResult => {
      const { revenue: mrr, customerBase: userBase } = data;
      // Assuming average price point for basic calculation
      const estimatedPricePoint = mrr && userBase ? mrr / userBase : 0;
      const expectedRevenue = userBase * estimatedPricePoint;
      
      return {
        isValid: !mrr || !userBase || Math.abs(mrr - expectedRevenue) < expectedRevenue * 0.2,
        warning: 'MRR seems inconsistent with user base and pricing',
        suggestions: [
          'Review your pricing strategy',
          'Verify active user count',
          'Check for any revenue recognition issues'
        ]
      };
    },

    metrics: {
      required: ['mrr', 'arr', 'churnRate', 'cac', 'ltv'],
      recommended: ['expansionRevenue', 'nps', 'activeUsers']
    } as IndustryMetrics
  },

  Ecommerce: {
    revenueValidation: (data: ValuationFormData): ValidationResult => {
      const { revenue: gmv, customerBase: orderCount } = data;
      const aov = gmv && orderCount ? gmv / orderCount : 0;
      const expectedGMV = aov * orderCount;
      
      return {
        isValid: !gmv || !orderCount || Math.abs(gmv - expectedGMV) < expectedGMV * 0.1,
        warning: 'GMV inconsistent with orders and AOV',
        suggestions: [
          'Verify your order count',
          'Check average order value calculations',
          'Review revenue recognition timing'
        ]
      };
    },

    metrics: {
      required: ['gmv', 'aov', 'orderCount', 'returnRate'],
      recommended: ['repeatPurchaseRate', 'inventoryTurnover']
    } as IndustryMetrics
  },

  validateIndustryMetrics: (data: ValuationFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const industry = data.sector;

    if (industry === 'saas') {
      results.push(IndustrySpecificValidation.SaaS.revenueValidation(data));
    } else if (industry === 'ecommerce') {
      results.push(IndustrySpecificValidation.Ecommerce.revenueValidation(data));
    }

    return results;
  },

  getRequiredMetrics: (industry: string): string[] => {
    switch (industry) {
      case 'saas':
        return IndustrySpecificValidation.SaaS.metrics.required;
      case 'ecommerce':
        return IndustrySpecificValidation.Ecommerce.metrics.required;
      default:
        return [];
    }
  },

  getRecommendedMetrics: (industry: string): string[] => {
    switch (industry) {
      case 'saas':
        return IndustrySpecificValidation.SaaS.metrics.recommended;
      case 'ecommerce':
        return IndustrySpecificValidation.Ecommerce.metrics.recommended;
      default:
        return [];
    }
  }
};
