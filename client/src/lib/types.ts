import { z } from "zod";

export const ValuationFormSchema = z.object({
  revenue: z.number().min(0, "Revenue must be a positive number"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  growthRate: z.number(),
  margins: z.number(),
  sector: z.string(),
  stage: z.string(),
  valuationMethods: z.array(z.string()).min(1, "Select at least one valuation method"),
  assumptions: z.object({
    discountRate: z.number().min(5, "Discount rate must be at least 5%").max(30, "Discount rate cannot exceed 30%"),
    terminalGrowthRate: z.number().min(1, "Terminal growth rate must be at least 1%").max(5, "Terminal growth rate cannot exceed 5%"),
    beta: z.number().min(0.5, "Beta must be at least 0.5").max(2.0, "Beta cannot exceed 2.0"),
    marketRiskPremium: z.number().min(4, "Market risk premium must be at least 4%").max(8, "Market risk premium cannot exceed 8%")
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

export interface FinancialProjectionData {
  baseRevenue: number;
  growthRate: number;
  marginProjection: number;
  baseExpenses: number;
  companyName: string;
  projectionPeriod: number;
  currency: "USD" | "EUR" | "GBP" | "JPY" | "INR";
  valuationMethods: string[];
  assumptions: {
    revenueAssumptions: {
      growthRate: number;
      category: string;
      description: string;
    }[];
    expenseAssumptions: {
      category: string;
      percentage: number;
      description: string;
    }[];
    discountRate: number;
    terminalGrowthRate: number;
    beta: number;
    marketRiskPremium: number;
  };
  totalFunding?: number;
  burnRate?: number;
  allocation?: {
    category: string;
    percentage: number;
    amount: number;
    description: string;
  }[];
}