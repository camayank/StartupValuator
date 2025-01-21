import type { ValuationFormData } from "./validations";
import { sectors, businessStages } from "./validations";

interface BusinessRule {
  validate: (value: any, formData: ValuationFormData) => string[];
  errorMessages: Record<string, string>;
}

const BusinessRulesEngine = {
  rules: {
    employeeCount: {
      validate: (value: number, formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const stage = formData.stage;
        const revenue = formData.revenue || 0;

        if (stage === 'growth' && value < 3) {
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

        if (stage === 'growth' && value < 100) {
          errors.push('Growth stage typically has a larger customer base');
        }
        if (employeeCount > 10 && value < 50) {
          errors.push('Customer base seems low for your team size');
        }
        return errors;
      },
      errorMessages: {
        lowCustomerBase: 'Customer base seems low for your business stage',
        customerTeamMismatch: 'Customer base seems low relative to team size'
      }
    },

    scalability: {
      validate: (value: 'limited' | 'moderate' | 'high', formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const sector = formData.sector;
        const stage = formData.stage;

        if (sector === 'technology' && value === 'limited') {
          errors.push('Tech companies typically have higher scalability potential');
        }
        if (stage === 'growth' && value === 'limited') {
          errors.push('Growth stage companies should demonstrate higher scalability');
        }
        return errors;
      },
      errorMessages: {
        techScalability: 'Consider your scalability potential as a tech company',
        growthScalability: 'Growth stage typically indicates higher scalability'
      }
    },

    intellectualProperty: {
      validate: (value: 'none' | 'pending' | 'registered', formData: ValuationFormData): string[] => {
        const errors: string[] = [];
        const sector = formData.sector;
        const stage = formData.stage;

        if (sector === 'technology' && value === 'none' && stage !== 'ideation') {
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

        if ((sector === 'healthcare' || sector === 'fintech') && value === 'notRequired') {
          errors.push('Regulatory compliance is typically required in your sector');
        }
        if (stage === 'growth' && value !== 'compliant') {
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

  validateField: (fieldName: string, value: any, formData: ValuationFormData): string[] => {
    const rule = BusinessRulesEngine.rules[fieldName as keyof typeof BusinessRulesEngine.rules];
    if (rule) {
      return rule.validate(value, formData);
    }
    return [];
  },

  validateForm: (formData: ValuationFormData): Map<string, string[]> => {
    const errors = new Map<string, string[]>();

    Object.keys(BusinessRulesEngine.rules).forEach((fieldName) => {
      const fieldErrors = BusinessRulesEngine.validateField(
        fieldName,
        formData[fieldName as keyof ValuationFormData],
        formData
      );
      
      if (fieldErrors.length > 0) {
        errors.set(fieldName, fieldErrors);
      }
    });

    return errors;
  }
};

export default BusinessRulesEngine;
