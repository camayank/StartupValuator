import type { ValidationResult } from "./types";
import type { ValuationFormData } from "./validations";
import { sectors, businessStages } from "./validations";

class BusinessRulesEngine {
  private static readonly rules = {
    employeeCount: {
      id: 'employee_validation',
      condition: (data: ValuationFormData): boolean => {
        if (data.stage === 'revenue_growing' && (data.employeeCount ?? 0) < 3) {
          return false;
        }
        return true;
      },
      message: 'Growth stage typically requires a larger team'
    },
    customerBase: {
      id: 'customerBase_validation',
      condition: (data: ValuationFormData): boolean => {
        if (data.stage === 'revenue_growing' && (data.customerBase ?? 0) < 100) return false;
        if ((data.employeeCount ?? 0) > 10 && (data.customerBase ?? 0) < 50) return false;
        return true;
      },
      message: 'Customer base seems insufficient for your stage or team size'
    },
    revenue: {
      id: 'revenue_validation',
      condition: (data: ValuationFormData): boolean => {
        if (data.stage === 'revenue_growing' && !data.revenue) {
          return false;
        }
        if ((data.customerBase ?? 0) > 1000 && (data.revenue ?? 0) < 1000) return false;
        return true;
      },
      message: 'Revenue seems low for your stated growth stage or customer base'
    },
    intellectualProperty: {
      id: 'intellectualProperty_validation',
      condition: (data: ValuationFormData): boolean => {
        if (data.sector === 'technology' && data.intellectualProperty === 'none' && data.stage !== 'ideation_unvalidated') {
          return false;
        }
        return true;
      },
      message: 'Consider IP protection for your technology'
    },
    regulatoryCompliance: {
      id: 'regulatoryCompliance_validation',
      condition: (data: ValuationFormData): boolean => {
        if ((data.sector === 'fintech' || data.sector === 'healthtech') && data.regulatoryCompliance === 'notRequired') return false;
        if (data.stage === 'revenue_growing' && data.regulatoryCompliance !== 'compliant') return false;
        return true;
      },
      message: 'Regulatory compliance is crucial for your sector or growth stage'
    }
  } as const;

  static validateField(field: keyof typeof BusinessRulesEngine.rules, _value: any, formData: ValuationFormData): ValidationResult {
    const rule = this.rules[field];
    if (!rule) {
      return { isValid: true, severity: 'info' };
    }

    const isValid = rule.condition(formData);
    return {
      isValid,
      severity: isValid ? 'info' : 'warning',
      message: isValid ? undefined : rule.message,
      suggestions: isValid ? [] : this.getSuggestions(field, formData)
    };
  }

  static validateForm(formData: ValuationFormData): Map<string, ValidationResult> {
    const validations = new Map<string, ValidationResult>();

    (Object.keys(this.rules) as Array<keyof typeof BusinessRulesEngine.rules>).forEach((field) => {
      const validation = this.validateField(
        field,
        formData[field as keyof ValuationFormData],
        formData
      );

      if (validation.severity !== 'info') {
        validations.set(field, validation);
      }
    });

    return validations;
  }

  private static getSuggestions(field: string, data: ValuationFormData): string[] {
    switch (field) {
      case 'employeeCount':
        return [
          'Consider your hiring plans for the next 6-12 months',
          'Review industry benchmarks for similar stage companies',
          'Factor in planned contractor or part-time resources'
        ];
      case 'customerBase':
        return [
          'Consider your marketing and sales strategies',
          'Review your customer acquisition cost',
          'Analyze your customer churn rate'
        ];
      case 'revenue':
        return [
          'Review your revenue recognition policies',
          'Include all revenue streams in calculation'
        ];
      case 'intellectualProperty':
        return [
          'Review potential patentable innovations',
          'Consider trademark protection for brand assets',
          'Evaluate trade secret protection strategies'
        ];
      case 'regulatoryCompliance':
        return [
          'Research relevant regulations',
          'Consult with legal counsel',
          'Develop a compliance plan'
        ];
      default:
        return [];
    }
  }
}

export default BusinessRulesEngine;
export type { ValidationResult };