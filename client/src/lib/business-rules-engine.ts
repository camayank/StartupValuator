import type { ValidationResult } from "./types";
import type { ValuationFormData } from "./types/shared";
import { sectors, businessStages } from "./validations";

class BusinessRulesEngine {
  private static readonly rules = {
    teamSize: {
      id: 'team_size_validation',
      condition: (data: ValuationFormData): boolean => {
        const { stage, teamSize } = data.businessInfo;
        const stageRequirements: Record<string, number> = {
          'revenue_early': 2,
          'revenue_growing': 5,
          'revenue_scaling': 10
        };
        return !stageRequirements[stage] || teamSize >= stageRequirements[stage];
      },
      message: 'Team size is insufficient for your current stage'
    },

    customerBase: {
      id: 'customer_base_validation',
      condition: (data: ValuationFormData): boolean => {
        const { stage } = data.businessInfo;
        const { customerBase } = data.marketAnalysis;
        const { revenue } = data.financialData;

        if (stage === 'revenue_growing' && customerBase < 100) return false;
        if (revenue > 100000 && customerBase < 50) return false;
        return true;
      },
      message: 'Customer base seems insufficient for your stage or revenue'
    },

    revenue: {
      id: 'revenue_validation',
      condition: (data: ValuationFormData): boolean => {
        const { stage } = data.businessInfo;
        const { revenue, growthRate } = data.financialData;

        if (stage === 'revenue_growing' && (!revenue || revenue < 10000)) return false;
        if (stage === 'revenue_scaling' && (!revenue || revenue < 100000)) return false;
        if (stage === 'revenue_growing' && (!growthRate || growthRate < 20)) return false;
        return true;
      },
      message: 'Revenue metrics do not align with your stated growth stage'
    },

    intellectualProperty: {
      id: 'intellectual_property_validation',
      condition: (data: ValuationFormData): boolean => {
        const { sector, stage, intellectualProperty } = data.businessInfo;

        if (sector === 'technology' && 
            stage !== 'ideation_unvalidated' && 
            intellectualProperty === 'none') {
          return false;
        }
        return true;
      },
      message: 'Consider IP protection for your technology'
    },

    regulatoryCompliance: {
      id: 'regulatory_compliance_validation',
      condition: (data: ValuationFormData): boolean => {
        const { sector, stage, regulatoryCompliance } = data.businessInfo;

        if ((sector === 'fintech' || sector === 'healthtech') && 
            regulatoryCompliance === 'notRequired') return false;
        if (stage === 'revenue_growing' && 
            regulatoryCompliance !== 'compliant') return false;
        return true;
      },
      message: 'Regulatory compliance is crucial for your sector and stage'
    },

    marketSize: {
      id: 'market_size_validation',
      condition: (data: ValuationFormData): boolean => {
        const { tam, sam, som } = data.marketAnalysis.marketSize;
        return tam >= sam && sam >= som;
      },
      message: 'Market size values must follow TAM ≥ SAM ≥ SOM'
    },

    businessModel: {
      id: 'business_model_validation',
      condition: (data: ValuationFormData): boolean => {
        const { revenueStreams } = data.businessModel;
        const totalPercentage = revenueStreams.reduce(
          (sum, stream) => sum + stream.percentage, 
          0
        );
        return totalPercentage === 100;
      },
      message: 'Revenue stream percentages must sum to 100%'
    },

    financialProjections: {
      id: 'financial_projections_validation',
      condition: (data: ValuationFormData): boolean => {
        const { revenue, expenses, profits } = data.financialData;
        return revenue >= expenses && profits === revenue - expenses;
      },
      message: 'Financial projections show inconsistencies'
    }
  } as const;

  static validateField(
    field: keyof typeof BusinessRulesEngine.rules, 
    _value: any, 
    formData: ValuationFormData
  ): ValidationResult {
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

    (Object.keys(this.rules) as Array<keyof typeof BusinessRulesEngine.rules>)
      .forEach((field) => {
        const validation = this.validateField(field, (formData as any)[field], formData);
        if (validation.severity !== 'info') {
          validations.set(field, validation);
        }
      });

    return validations;
  }

  private static getSuggestions(field: string, data: ValuationFormData): string[] {
    const { stage, sector } = data.businessInfo;

    switch (field) {
      case 'teamSize':
        return [
          'Consider your hiring plans for the next 6-12 months',
          'Review industry benchmarks for similar stage companies',
          'Factor in planned contractor or part-time resources'
        ];
      case 'customerBase':
        return [
          'Review your customer acquisition strategy',
          'Analyze your customer churn rate',
          'Consider market penetration tactics'
        ];
      case 'revenue':
        return [
          'Review your revenue recognition policies',
          'Include all revenue streams in calculation',
          'Consider recurring vs one-time revenue'
        ];
      case 'intellectualProperty':
        return [
          'Review potential patentable innovations',
          'Consider trademark protection',
          'Evaluate trade secret protection strategies'
        ];
      case 'regulatoryCompliance':
        return [
          'Research relevant regulations',
          'Consult with legal counsel',
          'Develop a compliance roadmap'
        ];
      case 'marketSize':
        return [
          'Validate market size assumptions',
          'Consider market growth trends',
          'Review competitive landscape'
        ];
      default:
        return [];
    }
  }
}

export default BusinessRulesEngine;
export type { ValidationResult };