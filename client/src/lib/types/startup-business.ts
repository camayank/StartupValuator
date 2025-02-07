import { z } from "zod";

// Core business information schema
export const businessInformationSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name must be less than 100 characters"),
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
    "saas",
    "marketplace",
    "subscription",
    "advertising",
    "hardware",
    "licensing",
    "consulting",
    "data_monetization"
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
    "established"
  ], {
    required_error: "Please select your business stage",
    invalid_type_error: "Invalid business stage selected"
  }),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  description: z.string().min(50, "Please provide a detailed description (minimum 50 characters)"),
  foundingDate: z.string().optional(),
  location: z.string().optional(),
  productStage: z.enum([
    "concept",
    "prototype",
    "beta",
    "launched",
    "growth",
    "mature"
  ]).optional(),
  businessMaturity: z.object({
    monthsOperating: z.number(),
    revenueStatus: z.enum(["pre_revenue", "early_revenue", "growing_revenue", "stable_revenue"]),
    customerBase: z.number(),
    marketValidation: z.enum(["none", "early", "validated", "scaling"])
  }).optional(),
  regulatoryStatus: z.object({
    compliance: z.enum(["notRequired", "inProgress", "compliant"]),
    licenses: z.array(z.string()),
    certifications: z.array(z.string())
  }).optional()
});

export type BusinessInformation = z.infer<typeof businessInformationSchema>;

// Stage requirements and validations
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
  }
} as const;

// Helper functions
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