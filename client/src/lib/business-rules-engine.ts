import type { ValuationFormData } from "./validations";
import { sectors } from "./validations";
import IndustryValidationEngine from "./industry-validation";

interface BusinessRule {
  validate: (value: any, formData: ValuationFormData) => string[];
  errorMessages: Record<string, string>;
}

interface ValidationState {
  isValid: boolean;
  needsReview: boolean;
  impact: 'low' | 'medium' | 'high';
}

const BusinessRulesEngine = {
  rules: {
    employeeCount: {
      validate: (value: number, formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const stage = formData.stage;
        const revenue = formData.revenue || 0;

        if (stage === 'revenue_growing' && value < 3) {
          errors.push('Growth stage typically requires a larger team');
        }
        if (revenue > 1000000 && value < 5) {
          errors.push('Revenue suggests a need for larger team size');
        }
        return errors;
      },
      errorMessages: {
        lowTeamSize: 'Team size seems low for your business stage',
        teamRevenueMismatch: 'Team size may be insufficient for your revenue level'
      }
    },

    customerBase: {
      validate: (value: number, formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const stage = formData.stage;
        const employeeCount = formData.employeeCount || 0;

        if (stage === 'revenue_growing' && value < 100) {
          errors.push('Growth stage typically has a larger customer base');
        }
        if (employeeCount > 10 && value < 50) {
          errors.push('Customer base seems low for your team size');
        }

        // Add industry-specific validations
        const industryValidations = IndustryValidationEngine.validateIndustryMetrics(formData);
        industryValidations.forEach(validation => {
          if (!validation.isValid && validation.warning) {
            errors.push(validation.warning);
          }
        });

        return errors;
      },
      errorMessages: {
        lowCustomerBase: 'Customer base seems low for your business stage',
        customerTeamMismatch: 'Customer base seems low relative to team size'
      }
    },

    revenue: {
      validate: (value: number, formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const stage = formData.stage;
        const customerBase = formData.customerBase || 0;

        if (stage === 'revenue_growing' && value < 10000) {
          errors.push('Growth stage companies typically have higher revenue');
        }
        if (customerBase > 1000 && value < 1000) {
          errors.push('Revenue seems low for your customer base');
        }

        return errors;
      },
      errorMessages: {
        lowRevenue: 'Revenue seems low for your business stage',
        revenueCustomerMismatch: 'Revenue seems low relative to customer base'
      }
    },

    intellectualProperty: {
      validate: (value: 'none' | 'pending' | 'registered', formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const sector = formData.sector;
        const stage = formData.stage;

        if (sector === 'technology' && value === 'none' && stage !== 'ideation_unvalidated') {
          errors.push('Consider IP protection for your technology');
        }
        return errors;
      },
      errorMessages: {
        techIpProtection: 'Tech companies should consider IP protection',
        stageIpProtection: 'Consider IP protection at your current stage'
      }
    },

    regulatoryCompliance: {
      validate: (value: 'notRequired' | 'inProgress' | 'compliant', formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const sector = formData.sector;
        const stage = formData.stage;

        if ((sector === 'fintech' || sector === 'healthtech') && value === 'notRequired') {
          errors.push('Regulatory compliance is typically required in your sector');
        }
        if (stage === 'revenue_growing' && value !== 'compliant') {
          errors.push('Growth stage companies should be compliant with regulations');
        }
        return errors;
      },
      errorMessages: {
        sectorCompliance: 'Your sector typically requires regulatory compliance',
        stageCompliance: 'Consider regulatory requirements at your stage'
      }
    }
  },

  validateField: (fieldName: keyof typeof BusinessRulesEngine.rules, value: any, formData: ValuationFormData): string[] => {
    const rule = BusinessRulesEngine.rules[fieldName];
    if (rule) {
      return rule.validate(value, formData);
    }
    return [];
  },

  trackChanges: (field: string, value: any, previousValue: any, formData: ValuationFormData): ValidationState => {
    const currentErrors = BusinessRulesEngine.validateField(field as keyof typeof BusinessRulesEngine.rules, value, formData);
    const previousErrors = BusinessRulesEngine.validateField(field as keyof typeof BusinessRulesEngine.rules, previousValue, formData);

    return {
      isValid: currentErrors.length === 0,
      needsReview: currentErrors.length > previousErrors.length,
      impact: BusinessRulesEngine.assessChangeImpact(field, value, previousValue)
    };
  },

  assessChangeImpact: (field: string, value: any, previousValue: any): 'low' | 'medium' | 'high' => {
    const percentChange = previousValue ? Math.abs((value - previousValue) / previousValue) : 1;

    if (percentChange > 0.5) return 'high';
    if (percentChange > 0.2) return 'medium';
    return 'low';
  },

  validateForm: (formData: ValuationFormData): Map<string, string[]> => {
    const errors = new Map<string, string[]>();

    // Validate all fields with business rules
    Object.keys(BusinessRulesEngine.rules).forEach((fieldName) => {
      const fieldErrors = BusinessRulesEngine.validateField(
        fieldName as keyof typeof BusinessRulesEngine.rules,
        formData[fieldName as keyof ValuationFormData],
        formData
      );

      if (fieldErrors.length > 0) {
        errors.set(fieldName, fieldErrors);
      }
    });

    // Add industry-specific validations
    const industryValidations = IndustryValidationEngine.validateIndustryMetrics(formData);
    industryValidations.forEach(validation => {
      if (!validation.isValid && validation.warning) {
        const existingErrors = errors.get('industry') || [];
        errors.set('industry', [...existingErrors, validation.warning]);
      }
    });

    return errors;
  },

  suggestCorrections: (field: string, value: any, error: string): string[] => {
    const suggestions: string[] = [];

    switch (field) {
      case 'employeeCount':
        suggestions.push(
          'Consider your growth plans and required team size',
          'Review industry benchmarks for similar stage companies',
          'Factor in planned hires for the next 6-12 months'
        );
        break;
      case 'revenue':
        suggestions.push(
          'Verify your revenue recognition policies',
          'Include all revenue streams in the calculation',
          'Consider seasonal variations in revenue'
        );
        break;
      case 'customerBase':
        suggestions.push(
          'Include both active and paying customers',
          'Review your customer segmentation',
          'Consider your customer acquisition timeline'
        );
        break;
    }

    return suggestions;
  }
};

export default BusinessRulesEngine;