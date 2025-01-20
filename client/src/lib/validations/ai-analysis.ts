import { z } from "zod";

export const growthAnalysisSchema = z.object({
  risks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    mitigation: z.string()
  })),
  opportunities: z.array(z.object({
    category: z.string(),
    description: z.string(),
    impact: z.enum(["low", "medium", "high"]),
    actionItems: z.array(z.string())
  })),
  insights: z.array(z.object({
    metric: z.string(),
    value: z.string(),
    analysis: z.string(),
    recommendation: z.string()
  })),
  confidenceScore: z.number().min(0).max(1),
  summary: z.string()
});

export type GrowthAnalysis = z.infer<typeof growthAnalysisSchema>;

export const aiResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([growthAnalysisSchema, z.null()]),
  error: z.string().optional()
});

export type AIResponse = z.infer<typeof aiResponseSchema>;
