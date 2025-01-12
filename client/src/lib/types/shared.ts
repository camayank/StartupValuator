```typescript
import { z } from "zod";

// Shared business information schema
export const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string(),
  sector: z.string(),
  stage: z.string(),
  foundingDate: z.string().optional(),
  description: z.string(),
  mission: z.string(),
  vision: z.string(),
  location: z.string(),
  teamSize: z.number().min(1),
});

// Financial data schema
export const financialDataSchema = z.object({
  revenue: z.number(),
  expenses: z.number(),
  profits: z.number(),
  cashFlow: z.number(),
  burnRate: z.number().optional(),
  runway: z.number().optional(),
  fundingHistory: z.array(z.object({
    round: z.string(),
    amount: z.number(),
    date: z.string(),
    investors: z.array(z.string())
  })).optional(),
});

// Market analysis schema
export const marketAnalysisSchema = z.object({
  targetMarket: z.string(),
  marketSize: z.object({
    tam: z.number(),
    sam: z.number(),
    som: z.number()
  }),
  competitorAnalysis: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    marketShare: z.number().optional()
  })),
  growthStrategy: z.string(),
});

// Business model schema
export const businessModelSchema = z.object({
  revenueStreams: z.array(z.object({
    type: z.string(),
    description: z.string(),
    percentage: z.number()
  })),
  costStructure: z.object({
    fixedCosts: z.array(z.object({
      category: z.string(),
      amount: z.number()
    })),
    variableCosts: z.array(z.object({
      category: z.string(),
      amount: z.number()
    }))
  }),
  keyMetrics: z.record(z.string(), z.number()),
  uniqueValue: z.string()
});

// Combined project data schema
export const projectDataSchema = z.object({
  businessInfo: businessInfoSchema,
  financials: financialDataSchema,
  marketAnalysis: marketAnalysisSchema,
  businessModel: businessModelSchema,
  valuation: z.object({
    method: z.string(),
    amount: z.number(),
    multipliers: z.record(z.string(), z.number()),
    assumptions: z.array(z.string())
  }).optional(),
  pitchDeck: z.object({
    slides: z.array(z.object({
      type: z.string(),
      content: z.record(z.string(), z.unknown())
    }))
  }).optional()
});

export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type FinancialData = z.infer<typeof financialDataSchema>;
export type MarketAnalysis = z.infer<typeof marketAnalysisSchema>;
export type BusinessModel = z.infer<typeof businessModelSchema>;
export type ProjectData = z.infer<typeof projectDataSchema>;
```
