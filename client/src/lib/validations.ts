import { z } from "zod";

export const valuationFormSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
  margins: z.number().min(-100).max(100, "Margins must be between -100 and 100"),
  industry: z.enum(["tech", "ecommerce", "saas", "marketplace"]),
  stage: z.enum(["seed", "seriesA", "seriesB", "growth"]),
});

export type ValuationFormData = z.infer<typeof valuationFormSchema>;

export interface ValuationData {
  valuation: number;
  multiplier: number;
  methodology: string;
  stage: string;
  details: {
    baseValuation: number;
    adjustments: Record<string, number>;
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
}