import { createContext, useContext, ReactNode } from "react";
import { type ValuationFormInput, type ValidationResult } from "@/lib/validation/aiValidation";

interface ValidationContextType {
  validateField: (field: string, value: any, rules: any) => string | null;
  validateCrossField: (field: string, value: any, formData: any) => Record<string, string> | null;
  getAISuggestions: (data: ValuationFormInput) => Promise<ValidationResult>;
  industryRules: Record<string, any>;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

interface ValidationProviderProps {
  children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
  const validateField = (field: string, value: any, rules: any) => {
    if (!rules) return null;
    
    const rule = rules[field];
    if (!rule) return null;

    if (rule.required && !value) {
      return `${field} is required`;
    }

    if (rule.min !== undefined && value < rule.min) {
      return `${field} must be at least ${rule.min}`;
    }

    if (rule.max !== undefined && value > rule.max) {
      return `${field} must be at most ${rule.max}`;
    }

    return null;
  };

  const validateCrossField = (field: string, value: any, formData: any) => {
    const errors: Record<string, string> = {};
    
    // Cross-field validation rules
    if (field === 'revenue' && formData.stage === 'ideation_unvalidated' && value > 0) {
      errors.revenue = 'Revenue should be 0 for unvalidated ideas';
    }

    if (field === 'employeeCount' && value > 100 && formData.stage === 'mvp_early_traction') {
      errors.employeeCount = 'Employee count seems high for early stage';
    }

    return Object.keys(errors).length ? errors : null;
  };

  const getAISuggestions = async (data: ValuationFormInput): Promise<ValidationResult> => {
    try {
      // This would typically call your AI validation service
      return {
        isValid: true,
        warnings: [],
        suggestions: [],
        industryInsights: []
      };
    } catch (error) {
      console.error('AI validation error:', error);
      return {
        isValid: true,
        warnings: [],
        suggestions: [],
        industryInsights: []
      };
    }
  };

  const industryRules = {
    SaaS: {
      revenue: { min: 0, max: 1000000000 },
      employeeCount: { min: 1, max: 10000 },
      churnRate: { min: 0, max: 100 },
      margins: { min: -100, max: 100 }
    },
    // Add more industry-specific rules
  };

  return (
    <ValidationContext.Provider 
      value={{ 
        validateField, 
        validateCrossField, 
        getAISuggestions,
        industryRules 
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}
