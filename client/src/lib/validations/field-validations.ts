import { z } from "zod";

// Define stage specific rules
const stageSpecificRules = {
  ideation: {
    minTeamSize: 1,
    requiredFields: ['description', 'sector', 'industrySegment']
  },
  validation: {
    minTeamSize: 2,
    requiredFields: ['description', 'sector', 'industrySegment', 'targetMarket']
  },
  mvp: {
    minTeamSize: 3,
    requiredFields: ['description', 'sector', 'industrySegment', 'targetMarket', 'productDetails']
  },
  early_revenue: {
    minTeamSize: 4,
    requiredFields: ['description', 'sector', 'industrySegment', 'targetMarket', 'productDetails', 'revenue']
  },
  growth: {
    minTeamSize: 5,
    requiredFields: ['description', 'sector', 'industrySegment', 'targetMarket', 'productDetails', 'revenue', 'margins']
  },
  scaling: {
    minTeamSize: 8,
    requiredFields: ['description', 'sector', 'industrySegment', 'targetMarket', 'productDetails', 'revenue', 'margins', 'marketShare']
  }
} as const;

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
  stageSpecificRules?: typeof stageSpecificRules;
  defaultValue?: any;
};

export const fieldValidations: Record<string, ValidationRule> = {
  industrySegment: {
    required: true,
    rules: z.string().min(1, "Industry segment is required"),
    dependencies: [],
    businessLogic: "Primary industry classification",
    stageSpecificRules
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
    businessLogic: "Business sector must align with selected industry",
    stageSpecificRules
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
    },
    stageSpecificRules
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
    businessLogic: "Stage affects validation requirements",
    stageSpecificRules
  },

  revenue: {
    required: false,
    rules: z.number().min(0, "Revenue cannot be negative"),
    dependencies: ["stage"],
    businessLogic: "Required for revenue-generating stages",
    stageSpecificRules: {
      early_revenue: { required: true },
      growth: { required: true },
      scaling: { required: true }
    }
  },

  margins: {
    required: false,
    rules: z.number().min(-100).max(100),
    dependencies: ["revenue", "stage"],
    businessLogic: "Required for growth and scaling stages",
    stageSpecificRules: {
      growth: { required: true },
      scaling: { required: true }
    }
  },

  marketShare: {
    required: false,
    rules: z.number().min(0).max(100),
    dependencies: ["revenue", "stage"],
    businessLogic: "Required for scaling stage",
    stageSpecificRules: {
      scaling: { required: true }
    }
  },
  targetMarket: {
    required: false,
    rules: z.string().min(1, "Target market is required"),
    dependencies: [],
    businessLogic: "Required for market analysis",
    stageSpecificRules: {
      validation: { required: true },
      mvp: { required: true },
      early_revenue: { required: true },
      growth: { required: true },
      scaling: { required: true }
    }
  },
  productDetails: {
    required: false,
    rules: z.string().min(50, "Product details must be at least 50 characters"),
    dependencies: [],
    businessLogic: "Detailed product description required",
    stageSpecificRules: {
      mvp: { required: true },
      early_revenue: { required: true },
      growth: { required: true },
      scaling: { required: true }
    }
  }
};

// Export types
export type FieldValidation = typeof fieldValidations[keyof typeof fieldValidations];
export type ValidationContext = {
  industrySegment?: string;
  sector?: string;
  stage?: string;
  revenue?: number;
};

// Enhanced validation helper function
export const validateField = (
  fieldName: keyof typeof fieldValidations, 
  value: any, 
  context: ValidationContext
) => {
  const validation = fieldValidations[fieldName];
  if (!validation) {
    return { isValid: true, warnings: [] };
  }

  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    requiredFields: [] as string[]
  };

  // Check stage-specific requirements
  if (context.stage && validation.stageSpecificRules) {
    const stageRules = validation.stageSpecificRules[context.stage as keyof typeof stageSpecificRules];
    if (stageRules) {
      // Add required fields for this stage
      result.requiredFields = stageRules.requiredFields;

      // Check team size requirements
      if (fieldName === 'teamSize' && value < stageRules.minTeamSize) {
        result.warnings.push(`${context.stage} stage typically requires at least ${stageRules.minTeamSize} team members`);
      }
    }
  }

  // For optional fields that are empty
  if (!validation.required && (value === undefined || value === "")) {
    return result;
  }

  // Basic validation
  const basicValidation = validation.rules.safeParse(value);
  if (!basicValidation.success) {
    result.isValid = false;
    result.errors = basicValidation.error.errors.map(e => e.message);
    return result;
  }

  // Add sector-specific warnings if applicable
  if (context.sector && 
      validation.sectorSpecificRules && 
      validation.sectorSpecificRules[context.sector]?.warning) {
    result.warnings.push(validation.sectorSpecificRules[context.sector].warning!);
  }

  return result;
};

// Export validation schemas for form integration
export const validationSchemas = Object.entries(fieldValidations).reduce((acc, [key, validation]) => {
  acc[key] = validation.rules;
  return acc;
}, {} as Record<string, z.ZodType<any>>);