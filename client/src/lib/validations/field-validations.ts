import { z } from "zod";

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
  defaultValue?: any;
};

export const fieldValidations: Record<string, ValidationRule> = {
  industrySegment: {
    required: true,
    rules: z.string().min(1, "Industry segment is required"),
    dependencies: [],
    businessLogic: "Primary industry classification"
  },

  sector: {
    required: true,
    rules: z.enum([
      "saas",
      "marketplace",
      "platform",
      "hardware",
      "service",
      "consulting",
      "research",
      "manufacturing",
      "distribution"
    ]),
    dependencies: ["industrySegment"],
    businessLogic: "Business sector must align with selected industry"
  },

  businessName: {
    required: true,
    rules: z.string().min(1, "Business name is required"),
    dependencies: [],
    businessLogic: "Required for all industries and sectors"
  },

  businessModel: {
    required: true,
    rules: z.enum([
      "b2b",
      "b2c",
      "b2b2c",
      "c2c",
      "subscription",
      "transactional",
      "advertising",
      "licensing"
    ]),
    dependencies: ["sector"],
    businessLogic: "Must align with chosen sector"
  },

  location: {
    required: true,
    rules: z.string().min(1, "Location is required"),
    dependencies: [],
    businessLogic: "Required for regional market analysis"
  },

  teamSize: {
    required: true,
    rules: z.number().min(1, "Team size must be at least 1"),
    dependencies: ["sector", "stage"],
    businessLogic: "Minimum team size varies by sector and stage",
    sectorSpecificRules: {
      "technology": {
        required: true,
        warning: "Tech startups typically require larger initial teams"
      },
      "service": {
        required: true,
        warning: "Service businesses scale with team size"
      }
    }
  },

  description: {
    required: true,
    rules: z.string().min(50, "Description must be at least 50 characters"),
    dependencies: [],
    businessLogic: "Comprehensive business description required"
  },

  stage: {
    required: true,
    rules: z.enum([
      "ideation",
      "validation",
      "mvp",
      "early_revenue",
      "growth",
      "scaling"
    ]),
    dependencies: ["revenue", "teamSize"],
    businessLogic: "Stage affects validation requirements"
  }
};

// Export types
export type FieldValidation = typeof fieldValidations[keyof typeof fieldValidations];
export type ValidationContext = {
  industrySegment?: string;
  sector?: string;
  stage?: string;
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

  return {
    isValid: true,
    warnings
  };
};