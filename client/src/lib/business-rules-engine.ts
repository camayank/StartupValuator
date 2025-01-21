import type { ValuationFormData } from "./validations";
import { sectors } from "./validations";
import IndustryValidationEngine from "./industry-validation";

interface BusinessRule {
  validate: (value: any, formData: ValuationFormData) => ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  severity: 'info' | 'warning' | 'error';
  message?: string;
  suggestions?: string[];
  impact?: 'low' | 'medium' | 'high';
}

const BusinessRulesEngine = {
  rules: {
    employeeCount: {
      validate: (value: number, formData: ValuationFormData): ValidationResult => {
        const result: ValidationResult = { 
          isValid: true,
          severity: 'info',
          suggestions: []
        };

        const stage = formData.stage;
        const revenue = formData.revenue || 0;

        if (stage === 'revenue_growing' && value < 3) {
          result.severity = 'warning';
          result.message = 'Growth stage typically requires a larger team';
          result.suggestions = [
            'Consider your hiring plans for the next 6-12 months',
            'Review industry benchmarks for similar stage companies',
            'Factor in planned contractor or part-time resources'
          ];
        }

        if (revenue > 1000000 && value < 5) {
          result.severity = 'warning';
          result.message = 'Team size seems low for your revenue level';
          result.suggestions = [
            'Analyze your operational efficiency',
            'Consider automation and tooling investments',
            'Review workload distribution across team'
          ];
        }

        return result;
      }
    },

    customerBase: {
      validate: (value: number, formData: ValuationFormData): ValidationResult => {
        const result: ValidationResult = { isValid: true, severity: 'info', suggestions: [] };
        const stage = formData.stage;
        const employeeCount = formData.employeeCount || 0;

        if (stage === 'revenue_growing' && value < 100) {
          result.severity = 'warning';
          result.message = 'Growth stage typically has a larger customer base';
          result.suggestions = ['Consider your marketing and sales strategies', 'Review your customer acquisition cost', 'Analyze your customer churn rate'];
        }
        if (employeeCount > 10 && value < 50) {
          result.severity = 'warning';
          result.message = 'Customer base seems low for your team size';
          result.suggestions = ['Review your sales process', 'Explore new customer acquisition channels', 'Improve customer retention strategies'];
        }

        // Add industry-specific validations
        const industryValidations = IndustryValidationEngine.validateIndustryMetrics(formData);
        industryValidations.forEach(validation => {
          if (!validation.isValid && validation.warning) {
            result.severity = 'warning';
            result.message = (result.message ? result.message + ', ' : '') + validation.warning;
            result.suggestions = [...(result.suggestions || []), ...(validation.suggestions || [])];
          }
        });

        return result;
      },
    },

    revenue: {
      validate: (value: number, formData: ValuationFormData): ValidationResult => {
        const result: ValidationResult = {
          isValid: true,
          severity: 'info',
          suggestions: []
        };

        const stage = formData.stage;
        const customerBase = formData.customerBase || 0;

        if (stage === 'revenue_growing' && value < 10000) {
          result.severity = 'warning';
          result.message = 'Revenue seems low for your stated growth stage';
          result.suggestions = [
            'Consider if you\'re in early growth or pre-revenue stage',
            'Review your revenue recognition policies',
            'Include all revenue streams in calculation'
          ];
        }

        if (customerBase > 1000 && value < 1000) {
          result.severity = 'warning';
          result.message = 'Revenue seems low relative to customer base';
          result.suggestions = [
            'Review your pricing strategy',
            'Consider customer segmentation analysis',
            'Evaluate customer lifetime value metrics'
          ];
        }

        return result;
      }
    },

    intellectualProperty: {
      validate: (value: 'none' | 'pending' | 'registered', formData: ValuationFormData): ValidationResult => {
        const result: ValidationResult = {
          isValid: true,
          severity: 'info',
          suggestions: []
        };

        const sector = formData.sector;
        const stage = formData.stage;

        if (sector === 'technology' && value === 'none' && stage !== 'ideation_unvalidated') {
          result.severity = 'warning';
          result.message = 'Consider IP protection for your technology';
          result.suggestions = [
            'Review potential patentable innovations',
            'Consider trademark protection for brand assets',
            'Evaluate trade secret protection strategies'
          ];
        }

        return result;
      }
    },
    regulatoryCompliance: {
      validate: (value: 'notRequired' | 'inProgress' | 'compliant', formData: ValuationFormData): ValidationResult => {
        const result: ValidationResult = { isValid: true, severity: 'info', suggestions: [] };
        const sector = formData.sector;
        const stage = formData.stage;

        if ((sector === 'fintech' || sector === 'healthtech') && value === 'notRequired') {
          result.severity = 'warning';
          result.message = 'Regulatory compliance is typically required in your sector';
          result.suggestions = ['Research relevant regulations', 'Consult with legal counsel', 'Develop a compliance plan'];
        }
        if (stage === 'revenue_growing' && value !== 'compliant') {
          result.severity = 'warning';
          result.message = 'Growth stage companies should be compliant with regulations';
          result.suggestions = ['Prioritize compliance efforts', 'Allocate resources for compliance', 'Implement robust compliance processes'];
        }
        return result;
      },
    }
  },

  validateField: (fieldName: keyof typeof BusinessRulesEngine.rules, value: any, formData: ValuationFormData): ValidationResult => {
    const rule = BusinessRulesEngine.rules[fieldName];
    if (rule) {
      return rule.validate(value, formData);
    }
    return { isValid: true, severity: 'info' };
  },

  validateForm: (formData: ValuationFormData): Map<string, ValidationResult> => {
    const validations = new Map<string, ValidationResult>();

    // Validate all fields with business rules
    Object.keys(BusinessRulesEngine.rules).forEach((fieldName) => {
      const validation = BusinessRulesEngine.validateField(
        fieldName as keyof typeof BusinessRulesEngine.rules,
        formData[fieldName as keyof ValuationFormData],
        formData
      );

      if (validation.severity !== 'info') {
        validations.set(fieldName, validation);
      }
    });

    // Add industry-specific validations
    const industryValidations = IndustryValidationEngine.validateIndustryMetrics(formData);
    industryValidations.forEach(validation => {
      if (!validation.isValid && validation.warning) {
        validations.set('industry', {
          isValid: false,
          severity: 'warning',
          message: validation.warning,
          suggestions: validation.suggestions || []
        });
      }
    });

    return validations;
  },

  getFieldGuidance: (field: string, value: any, formData: ValuationFormData): ValidationResult => {
    const validation = BusinessRulesEngine.validateField(
      field as keyof typeof BusinessRulesEngine.rules,
      value,
      formData
    );

    // Add industry-specific context
    const industryContext = IndustryValidationEngine.getIndustryContext(formData.sector, field);
    if (industryContext) {
      validation.suggestions = [
        ...(validation.suggestions || []),
        ...industryContext.recommendations
      ];
    }

    return validation;
  },

  assessImpact: (validation: ValidationResult): 'low' | 'medium' | 'high' => {
    if (validation.severity === 'error') return 'high';
    if (validation.severity === 'warning') return 'medium';
    return 'low';
  }
};

export default BusinessRulesEngine;