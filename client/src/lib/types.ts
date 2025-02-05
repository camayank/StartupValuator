import { z } from "zod";

export const ValuationFormSchema = z.object({
  revenue: z.number().min(0, "Revenue must be a positive number"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  growthRate: z.number(),
  margins: z.number(),
  sector: z.string(),
  stage: z.string(),
  assumptions: z.object({
    discountRate: z.number(),
    growthRate: z.number(),
    terminalGrowthRate: z.number(),
    beta: z.number(),
    marketRiskPremium: z.number()
  }).optional()
});

export type ValuationFormData = z.infer<typeof ValuationFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  severity: 'info' | 'warning' | 'error';
  message?: string;
  suggestions?: string[];
  impact?: 'low' | 'medium' | 'high';
}

export interface BasicFormData {
  stage: string;
  sector: string;
  revenue?: number;
  employeeCount?: number;
  customerBase?: number;
}