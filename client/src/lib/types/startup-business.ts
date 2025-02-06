import { z } from "zod";

// Core business information schema
export const businessInformationSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  sector: z.enum([
    "technology",
    "healthtech",
    "fintech",
    "ecommerce",
    "enterprise",
    "deeptech",
    "cleantech",
    "consumer_digital",
    "industrial_tech",
    "agritech",
    "proptech",
    "mobility"
  ], {
    required_error: "Please select a business sector",
    invalid_type_error: "Invalid sector selected"
  }),
  industrySegment: z.string().min(1, "Industry segment is required"),
  businessModel: z.enum([
    "marketplace",
    "saas",
    "subscription",
    "ecommerce",
    "advertising",
    "hardware",
    "licensing",
    "consulting",
    "data_monetization",
    "transaction_fees",
    "other"
  ], {
    required_error: "Please select a business model",
    invalid_type_error: "Invalid business model selected"
  }),
  stage: z.enum([
    "ideation_unvalidated",
    "ideation_validated",
    "mvp_development",
    "mvp_launched",
    "revenue_early",
    "revenue_growing",
    "revenue_scaling",
    "established",
    "expansion",
    "acquisition_ready",
    "ipo_ready"
  ], {
    required_error: "Please select your business stage",
    invalid_type_error: "Invalid business stage selected"
  }),
  foundingDate: z.string().optional(),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(50, "Please provide a detailed description (minimum 50 characters)"),
  productStage: z.enum([
    "concept",
    "prototype",
    "beta",
    "launched",
    "growth",
    "mature",
    "next_gen"
  ]),
  businessMaturity: z.object({
    monthsOperating: z.number().min(0),
    revenueStatus: z.enum(["pre_revenue", "early_revenue", "growing_revenue", "stable_revenue"]),
    customerBase: z.number().min(0),
    marketValidation: z.enum(["none", "early", "validated", "scaling"])
  }),
  regulatoryStatus: z.object({
    compliance: z.enum(["notRequired", "inProgress", "compliant"]),
    licenses: z.array(z.string()),
    certifications: z.array(z.string())
  })
});

// Derived types
export type BusinessInformation = z.infer<typeof businessInformationSchema>;

// Business stage requirements and validations
export const stageRequirements = {
  ideation_unvalidated: {
    requiredFields: ["name", "sector", "description"],
    minTeamSize: 1,
    minDescription: 50
  },
  ideation_validated: {
    requiredFields: ["name", "sector", "description", "businessModel"],
    minTeamSize: 1,
    minDescription: 100,
    requiresMarketValidation: true
  },
  mvp_development: {
    requiredFields: ["name", "sector", "description", "businessModel", "productStage"],
    minTeamSize: 2,
    minDescription: 150,
    requiresTechnologyStack: true
  },
  revenue_growing: {
    requiredFields: ["name", "sector", "description", "businessModel", "productStage", "regulatoryStatus"],
    minTeamSize: 3,
    minDescription: 200,
    requiresFinancials: true,
    requiresCustomerBase: true
  }
} as const;

// Helper functions for business information validation
export const validateBusinessStageRequirements = (
  data: BusinessInformation,
  stage: keyof typeof stageRequirements
) => {
  const requirements = stageRequirements[stage];
  const errors: string[] = [];

  requirements.requiredFields.forEach(field => {
    if (!data[field as keyof BusinessInformation]) {
      errors.push(`${field} is required for ${stage} stage`);
    }
  });

  if (data.teamSize < requirements.minTeamSize) {
    errors.push(`Minimum team size for ${stage} is ${requirements.minTeamSize}`);
  }

  if (data.description.length < requirements.minDescription) {
    errors.push(`Description must be at least ${requirements.minDescription} characters for ${stage} stage`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getNextRequiredFields = (currentStage: keyof typeof stageRequirements): string[] => {
  const currentRequirements = stageRequirements[currentStage];
  const nextStage = Object.keys(stageRequirements)[
    Object.keys(stageRequirements).indexOf(currentStage) + 1
  ] as keyof typeof stageRequirements;

  if (!nextStage) return [];

  const nextRequirements = stageRequirements[nextStage];
  return nextRequirements.requiredFields.filter(
    field => !currentRequirements.requiredFields.includes(field)
  );
};
