import { type ValuationFormData } from "./validations";
import ValidationEngine from "./validation-engine";

// Stub for IndustryValidationEngine (original moved to _legacy)
const IndustryValidationEngine = {
  getRequiredMetrics: (industry: string): string[] => {
    // Return default required metrics for all industries
    return ['revenue'];
  }
};

interface FlowStep {
  title: string;
  fields: string[];
  isOptional?: boolean;
  dependsOn?: string[];
  validation: Record<string, any>;
}

interface ValidationLevel {
  required: string[];
  autoValidate: boolean;
  validationRules?: Record<string, any>;
}

export const EnhancedUserFlow = {
  steps: {
    quickProfile: {
      title: "Quick Profile",
      fields: ["businessName", "industry", "stage", "location"],
      validation: {
        required: ["businessName", "industry", "stage"],
        autoValidate: true
      }
    },
    
    basicInfo: {
      title: "Basic Information",
      fields: ["foundingDate", "employeeCount", "businessModel", "targetMarket"],
      validation: {
        required: ["foundingDate", "businessModel"],
        autoValidate: true
      }
    },

    financialMetrics: {
      title: "Key Metrics",
      fields: ["revenue", "customerBase", "growthRate"],
      dependsOn: ["basicInfo"],
      validation: {
        required: [],  // Requirements based on industry
        autoValidate: false
      }
    },

    advancedDetails: {
      title: "Advanced Details",
      isOptional: true,
      fields: ["intellectualProperty", "competitiveDifferentiation", "regulatoryCompliance"],
      validation: {
        required: [],
        autoValidate: false
      }
    }
  },

  // Progressive validation system
  validation: {
    basic: {
      required: ["businessName", "industry", "stage"],
      autoValidate: true,
      validationRules: {
        businessName: { minLength: 2, required: true },
        industry: { required: true },
        stage: { required: true }
      }
    },
    
    comprehensive: {
      required: [],  // Dynamically populated based on industry
      autoValidate: false
    }
  },

  // Get validation rules for a specific step
  getStepValidation: (step: string, industry: string): ValidationLevel => {
    const baseValidation = EnhancedUserFlow.steps[step as keyof typeof EnhancedUserFlow.steps].validation;
    
    if (step === 'financialMetrics') {
      // Add industry-specific required metrics
      const requiredMetrics = IndustryValidationEngine.getRequiredMetrics(industry as any);
      return {
        ...baseValidation,
        required: [...baseValidation.required, ...requiredMetrics]
      };
    }

    return baseValidation;
  },

  // Validate a specific step
  validateStep: (step: string, data: Partial<ValuationFormData>): {
    isValid: boolean;
    errors: Map<string, string[]>;
  } => {
    const stepConfig = EnhancedUserFlow.steps[step as keyof typeof EnhancedUserFlow.steps];
    if (!stepConfig) {
      return { isValid: false, errors: new Map([['step', ['Invalid step']]] )};
    }

    // Get validation rules for the step
    const validation = EnhancedUserFlow.getStepValidation(step, data.businessInfo?.industry || '');
    const relevantData: Record<string, any> = {};

    // Only validate fields relevant to this step
    stepConfig.fields.forEach(field => {
      if (field in data) {
        relevantData[field] = (data as any)[field];
      }
    });

    return ValidationEngine.validateSection(step, relevantData, validation.validationRules || {});
  },

  // Check if a step is accessible based on dependencies
  canAccessStep: (step: string, completedSteps: string[]): boolean => {
    const stepConfig = EnhancedUserFlow.steps[step as keyof typeof EnhancedUserFlow.steps];
    if (!stepConfig) return false;

    if (!('dependsOn' in stepConfig) || !stepConfig.dependsOn) return true;

    return stepConfig.dependsOn.every((dependentStep: string) => completedSteps.includes(dependentStep));
  }
};

export default EnhancedUserFlow;
