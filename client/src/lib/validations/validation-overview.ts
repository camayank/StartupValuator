import { z } from "zod";
import { sectors, industries, businessStages, regions, currencies } from "@/lib/validations";

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
};

export const fieldValidationRules: Record<string, ValidationRule> = {
  // Core Identity Fields
  businessName: {
    required: true,
    validation: z.string().min(1, "Business name is required"),
    business_logic: "Required for all stages and sectors",
  },

  sector: {
    required: true,
    validation: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>]),
    affects_fields: ["industry", "regulatoryCompliance", "intellectualProperty", "scalability"],
    business_logic: "Determines available industries and validation rules",
  },

  // STAGE AND MATURITY
  stage: {
    required: true,
    validation: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
    default: "ideation_validated",
    affects_fields: ["revenue", "customerBase", "competitorAnalysis"],
    stage_specific_rules: {
      "ideation_unvalidated": {
        required_fields: ["businessName", "sector"],
        min_competitor_analysis: 30
      },
      "revenue_early": {
        required_fields: ["revenue", "customerBase"],
        min_revenue: 1000,
        min_customers: 1
      },
      "revenue_growing": {
        required_fields: ["revenue", "customerBase", "teamExperience"],
        min_revenue: 10000,
        min_customers: 10,
        min_team_experience: 2
      },
      "revenue_scaling": {
        required_fields: ["revenue", "customerBase", "teamExperience", "growthRate"],
        min_revenue: 100000,
        min_customers: 100,
        min_team_experience: 5,
        min_growth_rate: 20
      }
    }
  },

  // BUSINESS CHARACTERISTICS
  intellectualProperty: {
    required: false,
    default: "none",
    validation: z.enum(["none", "pending", "registered"]),
    sector_specific_rules: {
      "deeptech": {
        recommended: "pending",
        warning: "IP protection is highly recommended for deep tech startups"
      },
      "technology": {
        recommended: "pending"
      }
    }
  },

  competitorAnalysis: {
    required: true,
    validation: z.string(),
    stage_specific_rules: {
      "ideation_unvalidated": {
        min_length: 30,
        focus_areas: ["potential competitors", "market gaps"]
      },
      "revenue_growing": {
        min_length: 100,
        focus_areas: ["direct competitors", "market positioning", "competitive advantage"]
      }
    }
  },

  // REGULATORY AND COMPLIANCE
  regulatoryCompliance: {
    required: false,
    default: "notRequired",
    validation: z.enum(["notRequired", "inProgress", "compliant"]),
    sector_specific_rules: {
      "healthtech": {
        required: true,
        recommended: "inProgress",
        warning: "Healthcare startups typically require regulatory compliance"
      },
      "fintech": {
        required: true,
        recommended: "inProgress",
        warning: "Financial services typically require regulatory compliance"
      }
    }
  },

  // FINANCIAL METRICS
  revenue: {
    required: false,
    default: 0,
    validation: z.number().min(0),
    stage_specific_rules: {
      "revenue_early": {
        required: true,
        min: 1000
      },
      "revenue_growing": {
        required: true,
        min: 10000
      },
      "revenue_scaling": {
        required: true,
        min: 100000
      }
    }
  },

  growthRate: {
    required: false,
    default: 0,
    validation: z.number().min(-100).max(1000),
    stage_specific_rules: {
      "revenue_early": {
        target: 20
      },
      "revenue_growing": {
        min: 20,
        target: 50
      },
      "revenue_scaling": {
        min: 50,
        target: 100
      }
    }
  },

  // MARKET AND GROWTH
  scalability: {
    required: false,
    default: "moderate",
    validation: z.enum(["limited", "moderate", "high"]),
    sector_specific_rules: {
      "technology": { recommended: "high" },
      "fintech": { recommended: "high" },
      "retail": { recommended: "moderate" },
      "manufacturing": { recommended: "limited" }
    }
  },

  // METRICS AND PERFORMANCE
  customerBase: {
    required: false,
    default: 0,
    validation: z.number().min(0),
    stage_specific_rules: {
      "revenue_growing": {
        min: 10,
        warning: "Growing companies should have an established customer base"
      },
      "revenue_scaling": {
        min: 100,
        warning: "Scaling companies need significant customer traction"
      }
    }
  },

  // Cross-field Dependencies
  dependencies: {
    // Fields that affect other fields
    sector: ["industry", "regulatoryCompliance", "intellectualProperty"],
    stage: ["revenue", "customerBase", "competitorAnalysis"],
    revenue: ["growthRate", "scalability"],

    // Validation chains
    validation_chains: [
      {
        if_field: "sector",
        equals: "healthtech",
        then_require: ["regulatoryCompliance"],
        with_value: "inProgress"
      },
      {
        if_field: "stage",
        equals: "revenue_growing",
        then_require: ["revenue", "customerBase"],
        with_minimum: {
          revenue: 10000,
          customerBase: 10
        }
      }
    ]
  },

  // Smart Defaults Based on Context
  smart_defaults: {
    by_sector: {
      technology: {
        intellectualProperty: "pending",
        scalability: "high"
      },
      healthtech: {
        regulatoryCompliance: "inProgress",
        scalability: "moderate"
      }
    },
    by_stage: {
      ideation_unvalidated: {
        revenue: 0,
        customerBase: 0
      },
      revenue_growing: {
        growthRate: 20
      }
    }
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

  // Add sector-specific rules
  if (context.sector && fieldRules.sector_specific_rules?.[context.sector]) {
    const sectorRules = fieldRules.sector_specific_rules[context.sector];
    if (sectorRules.warning) {
      requirements.warnings.push(sectorRules.warning);
    }
  }

  return requirements;
}