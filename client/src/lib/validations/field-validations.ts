import { z } from "zod";
import { sectors, industries, businessStages, regions, currencies, valuationPurposes } from "@/lib/validations";

type ValidationRule = {
  required: boolean;
  rules: z.ZodType<any>;
  dependencies: string[];
  businessLogic: string;
  sectorSpecificRules?: Record<string, {
    required?: boolean;
    recommendedValue?: string;
    warning?: string;
  }>;
  stageSpecificRules?: Record<string, {
    required?: boolean;
    minLength?: number;
    minimumValue?: number;
    warning?: string;
    focusAreas?: string[];
  }>;
  defaultValue?: any;
};

export const fieldValidations: Record<string, ValidationRule> = {
  businessName: {
    required: true,
    rules: z.string().min(1, "Business name is required"),
    dependencies: [],
    businessLogic: "Required for all stages and sectors"
  },

  sector: {
    required: true,
    rules: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>]),
    dependencies: ["industry"],
    businessLogic: "Required to proceed with industry selection"
  },

  industry: {
    required: false, 
    rules: z.enum(Object.keys(industries) as [keyof typeof industries, ...Array<keyof typeof industries>]),
    dependencies: ["sector"],
    businessLogic: "Must be within selected sector's subsectors"
  },

  stage: {
    required: true,
    rules: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
    dependencies: ["revenue", "customerBase", "teamExperience"],
    businessLogic: "Determines validation requirements and field dependencies",
    defaultValue: "ideation_validated"
  },

  competitorAnalysis: {
    required: false, 
    rules: z.string().optional(), 
    dependencies: ["sector", "stage"],
    businessLogic: "Can be filled in later stages",
    stageSpecificRules: {
      "revenue_growing": {
        minLength: 100,
        focusAreas: ["direct competitors", "market positioning", "competitive advantage"]
      }
    }
  },

  intellectualProperty: {
    required: false,
    rules: z.enum(["none", "pending", "registered"]),
    dependencies: ["sector"],
    businessLogic: "IP protection requirements vary by sector",
    defaultValue: "none"
  },

  revenue: {
    required: false,
    rules: z.number().min(0).optional(),
    dependencies: ["stage"],
    businessLogic: "Revenue requirements increase with business stage",
    defaultValue: 0
  },

  customerBase: {
    required: false,
    rules: z.number().min(0),
    dependencies: ["stage"],
    businessLogic: "Customer base requirements vary by stage",
    defaultValue: 0,
    stageSpecificRules: {
      "revenue_growing": {
        minimumValue: 10,
        warning: "Growing companies should have an established customer base"
      },
      "revenue_scaling": {
        minimumValue: 100,
        warning: "Scaling companies need significant customer traction"
      }
    }
  },
  regulatoryCompliance: {
    required: false,
    rules: z.enum(["notRequired", "inProgress", "compliant"]),
    dependencies: ["sector"],
    businessLogic: "Regulatory requirements vary by sector",
    defaultValue: "notRequired",
    sectorSpecificRules: {
      "healthtech": {
        required: true,
        recommendedValue: "inProgress",
        warning: "Healthcare startups typically require regulatory compliance"
      },
      "fintech": {
        required: true,
        recommendedValue: "inProgress",
        warning: "Financial services typically require regulatory compliance"
      }
    }
  }
};

// Export types
export type FieldValidation = typeof fieldValidations[keyof typeof fieldValidations];
export type ValidationContext = {
  sector?: string;
  stage?: string;
  industry?: string;
  region?: string;
};

// Validation helper function
export const validateField = (fieldName: keyof typeof fieldValidations, value: any, context: ValidationContext) => {
  const validation = fieldValidations[fieldName];
  if (!validation) {
    return { isValid: true, warnings: [] };
  }

  // For optional fields that are empty
  if (!validation.required && (value === undefined || value === "")) {
    return { isValid: true, warnings: [] };
  }

  // Basic validation
  const basicValidation = validation.rules.safeParse(value);
  if (!basicValidation.success) {
    return {
      isValid: false,
      errors: basicValidation.error.errors,
      warnings: []
    };
  }

  // Business logic validation
  const warnings: string[] = [];

  // Add sector-specific warnings if applicable
  if (context.sector && 
      validation.sectorSpecificRules && 
      validation.sectorSpecificRules[context.sector]?.warning) {
    warnings.push(validation.sectorSpecificRules[context.sector].warning!);
  }

  // Add stage-specific warnings if applicable
  if (context.stage && 
      validation.stageSpecificRules && 
      validation.stageSpecificRules[context.stage]?.warning) {
    warnings.push(validation.stageSpecificRules[context.stage].warning!);
  }

  return {
    isValid: true,
    warnings
  };
};