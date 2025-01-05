import { z } from "zod";

export const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" },
} as const;

export const businessStages = {
  ideation: "Ideation Stage",
  validation: "Validation Stage",
  growth: "Growth Stage",
  scaling: "Scaling Stage",
  exit: "Exit/Going Concern",
  liquidation: "Liquidation",
} as const;

export const valuationFormSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.enum(Object.keys(currencies) as (keyof typeof currencies)[]),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
  margins: z.number().min(-100).max(100, "Margins must be between -100 and 100"),
  industry: z.enum(["tech", "ecommerce", "saas", "marketplace"]),
  stage: z.enum(Object.keys(businessStages) as (keyof typeof businessStages)[]),
  // Qualitative inputs
  intellectualProperty: z.enum(["none", "pending", "registered"]).optional(),
  teamExperience: z.number().min(0).max(10).optional(),
  marketValidation: z.enum(["none", "early", "proven"]).optional(),
  customerBase: z.number().min(0).optional(),
  competitiveDifferentiation: z.enum(["low", "medium", "high"]).optional(),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"]).optional(),
  scalability: z.enum(["limited", "moderate", "high"]).optional(),
  assetValue: z.number().min(0).optional(), // For liquidation/going concern
});

export type ValuationFormData = z.infer<typeof valuationFormSchema>;

export interface ValuationData extends ValuationFormData {
  valuation: number;
  multiplier: number;
  methodology: string;
  details: {
    baseValuation: number;
    adjustments: Record<string, number>;
    qualitativeFactors: {
      factor: string;
      impact: number;
      description: string;
    }[];
  };
  stageAnalysis: {
    appropriateness: number;
    recommendations: string[];
    nextStageRequirements: string[];
  };
  currencyConversion: {
    rates: Record<keyof typeof currencies, number>;
    baseRate: number;
    baseCurrency: keyof typeof currencies;
  };
  riskAssessment?: {
    overallRisk: string;
    riskScore: number;
    categories: {
      market: string;
      financial: string;
      operational: string;
      competitive: string;
    };
    recommendations: string[];
  };
  potentialPrediction?: {
    score: number;
    growth_potential: string;
    success_probability: number;
    strengths: string[];
    areas_of_improvement: string[];
    market_opportunities: string[];
    five_year_projection: {
      revenue_multiplier: number;
      market_share_potential: string;
      team_size_projection: string;
    };
  };
  ecosystemNetwork?: {
    nodes: Array<{
      name: string;
      x: number;
      y: number;
      size: number;
      category: string;
      connections: string[];
    }>;
    industry: string;
    stage: string;
  };
}

export const stageMultipliers = {
  ideation: { min: 0.5, max: 2 },
  validation: { min: 1, max: 3 },
  growth: { min: 2, max: 5 },
  scaling: { min: 4, max: 8 },
  exit: { min: 3, max: 10 },
  liquidation: { min: 0.1, max: 0.5 },
} as const;

export function formatCurrency(value: number, currency: keyof typeof currencies = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard'
  }).format(value);
}