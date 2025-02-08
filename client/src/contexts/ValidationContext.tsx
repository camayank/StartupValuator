import { createContext, useContext, ReactNode } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface ValidationContextType {
  validateField: (field: string, value: any, rules: any) => Promise<string | null>;
  validateCrossField: (field: string, value: any, formData: any) => Promise<Record<string, string> | null>;
  getSmartDefaults: (industry: string) => Promise<Record<string, any>>;
  industryRules: Record<string, any>;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

interface ValidationProviderProps {
  children: ReactNode;
}

const industryValidationRules = {
  SaaS: {
    revenue: { min: 0, max: 1000000000 },
    employeeCount: { min: 1, max: 10000 },
    churnRate: { min: 0, max: 100 },
    margins: { min: -100, max: 100 }
  },
  Ecommerce: {
    revenue: { min: 0, max: 1000000000 },
    margins: { min: -50, max: 80 },
    inventory: { min: 0 }
  }
} as const;

type IndustryType = keyof typeof industryValidationRules;

export function ValidationProvider({ children }: ValidationProviderProps) {
  const { toast } = useToast();

  const validateField = async (field: string, value: any, rules: any) => {
    if (!rules) return null;

    const rule = rules[field];
    if (!rule) return null;

    try {
      // Create a dynamic schema based on rules
      let schema: z.ZodType<any> = z.any();

      if (rule.required) {
        schema = z.string().min(1, { message: `${field} is required` });
      }

      if (rule.min !== undefined) {
        schema = z.number().min(rule.min, { message: `${field} must be at least ${rule.min}` });
      }

      if (rule.max !== undefined) {
        schema = z.number().max(rule.max, { message: `${field} must be at most ${rule.max}` });
      }

      if (rule.pattern) {
        schema = z.string().regex(new RegExp(rule.pattern), { message: rule.patternMessage });
      }

      await schema.parseAsync(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return "Validation failed";
    }
  };

  const validateCrossField = async (field: string, value: any, formData: any) => {
    const errors: Record<string, string> = {};

    // Industry-specific validations
    if (formData.industry) {
      const industryRules = industryValidationRules[formData.industry as IndustryType];
      if (industryRules?.[field]) {
        const error = await validateField(field, value, industryRules);
        if (error) errors[field] = error;
      }
    }

    // Business stage validations
    if (field === 'revenue' && formData.stage === 'ideation' && value > 0) {
      errors.revenue = 'Revenue should be 0 for ideation stage';
    }

    if (field === 'employeeCount' && value > 100 && formData.stage === 'early_stage') {
      errors.employeeCount = 'Employee count seems high for early stage';
    }

    // Financial metric validations
    if (field === 'margins' && value > 95) {
      errors.margins = 'Margins above 95% are unusual. Please verify.';
    }

    if (field === 'burnRate' && value > formData.revenue) {
      errors.burnRate = 'Burn rate exceeds revenue. This may not be sustainable.';
    }

    return Object.keys(errors).length ? errors : null;
  };

  const getSmartDefaults = async (industry: string): Promise<Record<string, any>> => {
    // Industry-specific default values
    const defaults = {
      SaaS: {
        margins: 70,
        churnRate: 5,
        cac: 1000,
        ltv: 5000
      },
      Ecommerce: {
        margins: 25,
        churnRate: 15,
        cac: 50,
        ltv: 200
      }
    };

    return defaults[industry as keyof typeof defaults] || {};
  };

  return (
    <ValidationContext.Provider 
      value={{ 
        validateField, 
        validateCrossField, 
        getSmartDefaults,
        industryRules: industryValidationRules
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