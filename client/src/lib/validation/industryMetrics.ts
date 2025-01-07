import { z } from "zod";

// Industry-specific metrics schemas
export const saasMetricsSchema = z.object({
  mrr: z.number().min(0, "MRR must be positive"),
  ltv: z.number().min(0, "LTV must be positive"),
  cac: z.number().min(0, "CAC must be positive"),
  arr: z.number().min(0, "ARR must be positive"),
  retentionRate: z.number().min(0).max(100, "Retention rate must be between 0 and 100"),
  churnRate: z.number().min(0).max(100, "Churn rate must be between 0 and 100").optional(),
});

export const ecommerceMetricsSchema = z.object({
  aov: z.number().min(0, "Average order value must be positive"),
  inventoryTurnover: z.number().min(0, "Inventory turnover must be positive"),
  conversionRate: z.number().min(0).max(100, "Conversion rate must be between 0 and 100"),
  cartAbandonmentRate: z.number().min(0).max(100, "Cart abandonment rate must be between 0 and 100"),
  customerAcquisitionCost: z.number().min(0, "Customer acquisition cost must be positive").optional(),
});

export const manufacturingMetricsSchema = z.object({
  fixedCosts: z.number().min(0, "Fixed costs must be positive"),
  variableCosts: z.number().min(0, "Variable costs must be positive"),
  productionEfficiency: z.number().min(0).max(100, "Production efficiency must be between 0 and 100"),
  inventoryDays: z.number().min(0, "Inventory days must be positive"),
  capacityUtilization: z.number().min(0).max(100, "Capacity utilization must be between 0 and 100").optional(),
});

export const healthcareMetricsSchema = z.object({
  rdSpending: z.number().min(0, "R&D spending must be positive"),
  regulatoryMilestones: z.array(z.object({
    name: z.string(),
    status: z.enum(["completed", "in_progress", "planned"]),
    date: z.string().optional(),
  })),
  pipelineProgress: z.number().min(0).max(100, "Pipeline progress must be between 0 and 100"),
  clinicalTrialStage: z.enum(["preclinical", "phase1", "phase2", "phase3", "approved"]).optional(),
});

export const fintechMetricsSchema = z.object({
  transactionVolume: z.number().min(0, "Transaction volume must be positive"),
  avgTransactionValue: z.number().min(0, "Average transaction value must be positive"),
  userAcquisitionCost: z.number().min(0, "User acquisition cost must be positive"),
  activeUsers: z.number().min(0, "Active users must be positive"),
  processingFees: z.number().min(0, "Processing fees must be positive").optional(),
});

// Risk assessment schema
export const riskAssessmentSchema = z.object({
  marketRisk: z.number().min(1).max(10, "Risk level must be between 1 and 10"),
  operationalRisk: z.number().min(1).max(10, "Risk level must be between 1 and 10"),
  regulatoryRisk: z.number().min(1).max(10, "Risk level must be between 1 and 10"),
  impact: z.enum(["low", "medium", "high"]),
});

// Type definitions for industry metrics
export type SaaSMetrics = z.infer<typeof saasMetricsSchema>;
export type EcommerceMetrics = z.infer<typeof ecommerceMetricsSchema>;
export type ManufacturingMetrics = z.infer<typeof manufacturingMetricsSchema>;
export type HealthcareMetrics = z.infer<typeof healthcareMetricsSchema>;
export type FintechMetrics = z.infer<typeof fintechMetricsSchema>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;

// Industry-specific risk factors
export const industryRiskFactors = {
  technology: {
    technical: ["Technology obsolescence", "Cybersecurity threats", "Platform scalability"],
    market: ["Market competition", "Customer adoption rate", "Technology trends"],
    operational: ["Technical talent retention", "Infrastructure reliability", "Development delays"],
  },
  healthcare: {
    regulatory: ["FDA approval", "HIPAA compliance", "Clinical trial outcomes"],
    market: ["Insurance coverage", "Provider adoption", "Patient acceptance"],
    operational: ["Clinical workflow integration", "Quality control", "Supply chain"],
  },
  fintech: {
    regulatory: ["Financial regulations", "Data privacy", "Anti-money laundering"],
    market: ["Banking partnerships", "User trust", "Payment network adoption"],
    operational: ["Transaction security", "System uptime", "Fraud prevention"],
  },
  ecommerce: {
    market: ["Customer acquisition", "Brand recognition", "Market saturation"],
    operational: ["Inventory management", "Shipping logistics", "Customer service"],
    financial: ["Working capital", "Payment processing", "Return rates"],
  },
  manufacturing: {
    operational: ["Production efficiency", "Supply chain", "Quality control"],
    market: ["Raw material costs", "Demand forecasting", "Competition"],
    regulatory: ["Environmental compliance", "Safety regulations", "Trade policies"],
  },
} as const;

// Function to get metrics schema based on industry
export function getIndustryMetricsSchema(industry: string) {
  switch (industry) {
    case 'saas':
    case 'software_enterprise':
    case 'software_consumer':
    case 'cloud_computing':
      return saasMetricsSchema;
    case 'marketplace':
    case 'd2c':
    case 'retail_tech':
      return ecommerceMetricsSchema;
    case 'smart_manufacturing':
    case 'industrial_automation':
    case 'quality_control':
      return manufacturingMetricsSchema;
    case 'biotech':
    case 'medtech':
    case 'healthtech':
    case 'pharma':
      return healthcareMetricsSchema;
    case 'payments':
    case 'lending':
    case 'banking_tech':
      return fintechMetricsSchema;
    default:
      return null;
  }
}