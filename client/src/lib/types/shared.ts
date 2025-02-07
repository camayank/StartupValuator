import { z } from "zod";

// Core validation interfaces
export interface ValidationRule {
  field: string;
  type: string;
  message: string;
  validate: (value: any) => boolean;
}

export interface BusinessRule {
  id: string;
  condition: (data: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  severity: 'info' | 'warning' | 'error';
  message?: string;
  suggestions?: string[];
  impact?: 'low' | 'medium' | 'high';
}

// Core business information schema
export const businessInfoSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  sector: z.string(),
  industry: z.string(),
  stage: z.enum([
    'ideation_unvalidated',
    'ideation_validated',
    'mvp_development',
    'mvp_early_traction',
    'revenue_early',
    'revenue_growing',
    'revenue_scaling'
  ]),
  foundingDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  teamSize: z.number().min(1),
  intellectualProperty: z.enum(['none', 'pending', 'registered']).optional(),
  regulatoryCompliance: z.enum(['notRequired', 'inProgress', 'compliant']).optional()
});

// Financial data schema with enhanced validation
export const financialDataSchema = z.object({
  revenue: z.number().min(0),
  expenses: z.number().min(0),
  profits: z.number().min(0),
  cashFlow: z.number(),
  burnRate: z.number().optional(),
  runway: z.number().optional(),
  margins: z.number().min(-100).max(100),
  growthRate: z.number().min(-100).max(1000),
  fundingHistory: z.array(z.object({
    round: z.string(),
    amount: z.number(),
    date: z.string(),
    investors: z.array(z.string())
  })).optional(),
});

// Market analysis schema with proper validation
export const marketAnalysisSchema = z.object({
  targetMarket: z.string(),
  marketSize: z.object({
    tam: z.number().min(0),
    sam: z.number().min(0),
    som: z.number().min(0)
  }).refine((data) => data.tam >= data.sam && data.sam >= data.som, {
    message: "Market sizes must follow TAM ≥ SAM ≥ SOM"
  }),
  customerBase: z.number().min(0),
  competitorAnalysis: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    marketShare: z.number().optional()
  })),
  growthStrategy: z.string(),
});

// Business model schema with enhanced validation
export const businessModelSchema = z.object({
  revenueStreams: z.array(z.object({
    type: z.string(),
    description: z.string(),
    percentage: z.number().min(0).max(100)
  })).refine((data) => {
    const total = data.reduce((sum, stream) => sum + stream.percentage, 0);
    return total === 100;
  }, {
    message: "Revenue stream percentages must sum to 100%"
  }),
  costStructure: z.object({
    fixedCosts: z.array(z.object({
      category: z.string(),
      amount: z.number().min(0)
    })),
    variableCosts: z.array(z.object({
      category: z.string(),
      amount: z.number().min(0)
    }))
  }),
  keyMetrics: z.record(z.string(), z.number()),
  uniqueValue: z.string()
});

// Combined form data schema with proper nesting
export const valuationFormSchema = z.object({
  businessInfo: businessInfoSchema,
  financialData: financialDataSchema,
  marketAnalysis: marketAnalysisSchema,
  businessModel: businessModelSchema,
  valuation: z.object({
    method: z.string(),
    amount: z.number(),
    multipliers: z.record(z.string(), z.number()),
    assumptions: z.array(z.string())
  }).optional(),
  aiAnalysis: z.object({
    insights: z.array(z.string()),
    recommendations: z.array(z.string()),
    riskFactors: z.array(z.string()),
    growthOpportunities: z.array(z.string())
  }).optional()
});

export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type FinancialData = z.infer<typeof financialDataSchema>;
export type MarketAnalysis = z.infer<typeof marketAnalysisSchema>;
export type BusinessModel = z.infer<typeof businessModelSchema>;
export type ValuationFormData = z.infer<typeof valuationFormSchema>;