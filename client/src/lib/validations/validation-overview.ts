import { z } from "zod";
import { sectors, businessStages } from "@/lib/validations";

export type ValidationRule = {
  required: boolean;
  validation: z.ZodType<any>;
  affects_fields?: string[];
  business_logic?: string;
  stage_specific_rules?: Record<string, {
    required_fields: string[];
    min_revenue?: number;
    min_customers?: number;
    min_team_experience?: number;
    min_growth_rate?: number;
    min_competitor_analysis?: number;
  }>;
  sector_specific_rules?: Record<string, {
    required?: boolean;
    recommended?: string;
    warning?: string;
  }>;
  dependencies?: string[];
  default_value?: any;
};

// Update validation rules to match the actual form structure
export const fieldValidationRules: Record<string, ValidationRule> = {
  // Business Info Section
  "businessInfo.name": {
    required: true,
    validation: z.string().min(1, "Business name is required"),
    business_logic: "Required for all stages and sectors",
  },

  "businessInfo.sector": {
    required: true,
    validation: z.enum(Object.keys(sectors) as [string, ...string[]]),
    affects_fields: ["businessInfo.industry", "regulatoryCompliance", "intellectualProperty"],
    business_logic: "Determines available industries and validation rules",
  },

  "businessInfo.stage": {
    required: true,
    validation: z.enum(Object.keys(businessStages) as [string, ...string[]]),
    affects_fields: ["financialData.revenue", "marketData.customerBase"],
    stage_specific_rules: {
      "ideation_unvalidated": {
        required_fields: ["businessInfo.name", "businessInfo.sector"],
        min_competitor_analysis: 30
      },
      "revenue_early": {
        required_fields: ["financialData.revenue", "marketData.customerBase"],
        min_revenue: 1000,
        min_customers: 1
      },
      "revenue_growing": {
        required_fields: ["financialData.revenue", "marketData.customerBase", "teamExperience"],
        min_revenue: 10000,
        min_customers: 10,
        min_team_experience: 2
      }
    },
    default_value: "ideation_unvalidated"
  },

  // Financial Data Section
  "financialData.revenue": {
    required: false,
    validation: z.number().min(0),
    dependencies: ["businessInfo.stage"],
    stage_specific_rules: {
      "revenue_early": {
        required_fields: ["financialData.margins"],
        min_revenue: 1000
      },
      "revenue_growing": {
        required_fields: ["financialData.margins", "financialData.growthRate"],
        min_revenue: 10000
      }
    },
    default_value: 0
  },

  "financialData.margins": {
    required: false,
    validation: z.number().min(-100).max(100),
    dependencies: ["financialData.revenue"],
    default_value: 0
  },

  "financialData.growthRate": {
    required: false,
    validation: z.number().min(-100).max(1000),
    dependencies: ["financialData.revenue"],
    stage_specific_rules: {
      "revenue_growing": {
        required_fields: ["financialData.revenue"],
        min_growth_rate: 20
      }
    },
    default_value: 0
  },

  // Market Data Section
  "marketData.tam": {
    required: true,
    validation: z.number().min(0),
    business_logic: "Total Addressable Market must be defined",
    default_value: 0
  },

  "marketData.sam": {
    required: true,
    validation: z.number().min(0),
    business_logic: "Serviceable Addressable Market must be defined",
    default_value: 0
  },

  "marketData.som": {
    required: true,
    validation: z.number().min(0),
    business_logic: "Serviceable Obtainable Market must be defined",
    default_value: 0
  },

  // Competitive Analysis Section
  "competitiveData.competitors": {
    required: true,
    validation: z.array(z.string()).min(1, "At least one competitor must be identified"),
    business_logic: "Competitive landscape analysis is required",
    default_value: []
  },

  "competitiveData.advantages": {
    required: true,
    validation: z.array(z.string()).min(1, "At least one competitive advantage must be identified"),
    business_logic: "Competitive advantages must be defined",
    default_value: []
  },

  // Growth Strategy Section
  "growthStrategy.plans": {
    required: true,
    validation: z.array(z.string()).min(1, "At least one growth plan must be defined"),
    business_logic: "Growth strategy must be outlined",
    default_value: []
  }
};

export type ValidationContext = {
  sector?: string;
  stage?: string;
  revenue?: number;
};

export function getValidationRequirements(
  field: keyof typeof fieldValidationRules,
  context: ValidationContext
) {
  const fieldRules = fieldValidationRules[field];
  if (!fieldRules) return null;

  const requirements = {
    required: fieldRules.required,
    validation: fieldRules.validation,
    warnings: [] as string[],
    dependencies: fieldRules.affects_fields || [],
  };

  // Add stage-specific rules
  if (context.stage && fieldRules.stage_specific_rules?.[context.stage]) {
    const stageRules = fieldRules.stage_specific_rules[context.stage];
    requirements.required = fieldRules.required || stageRules.required || false; // Handle optional fields becoming required based on stage.
    if (stageRules.min_revenue && context.revenue && context.revenue < stageRules.min_revenue) {
      requirements.warnings.push(`Minimum revenue of ${stageRules.min_revenue} required for ${context.stage} stage`);
    }
    if (stageRules.min_customers && context.revenue && context.revenue < stageRules.min_customers) {
        requirements.warnings.push(`Minimum customer base of ${stageRules.min_customers} required for ${context.stage} stage`);
    }
  }

  // Add sector-specific rules
  if (context.sector && fieldRules.sector_specific_rules?.[context.sector]) {
    const sectorRules = fieldRules.sector_specific_rules[context.sector];
    if (sectorRules.warning) {
      requirements.warnings.push(sectorRules.warning);
    }
  }

  return requirements;
}