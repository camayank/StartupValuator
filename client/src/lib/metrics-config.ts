import { z } from "zod";

// Define the metric type
export interface Metric {
  id: string;
  label: string;
  type: "number" | "percentage" | "currency" | "text";
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: number | string;
  unit?: string;
  description?: string;
}

// Industry-specific metrics configuration
export const industryMetrics: Record<string, Metric[]> = {
  saas: [
    {
      id: "mrr",
      label: "Monthly Recurring Revenue",
      type: "currency",
      required: true,
      min: 0,
      unit: "USD",
      description: "Monthly recurring revenue from all subscriptions"
    },
    {
      id: "cac",
      label: "Customer Acquisition Cost",
      type: "currency",
      required: true,
      min: 0,
      unit: "USD",
      description: "Average cost to acquire a new customer"
    },
    {
      id: "churnRate",
      label: "Churn Rate",
      type: "percentage",
      required: true,
      min: 0,
      max: 100,
      description: "Monthly customer churn rate"
    },
    {
      id: "ltv",
      label: "Lifetime Value",
      type: "currency",
      required: true,
      min: 0,
      unit: "USD",
      description: "Average customer lifetime value"
    }
  ],
  ecommerce: [
    {
      id: "aov",
      label: "Average Order Value",
      type: "currency",
      required: true,
      min: 0,
      unit: "USD",
      description: "Average value per order"
    },
    {
      id: "traffic",
      label: "Monthly Traffic",
      type: "number",
      required: true,
      min: 0,
      description: "Monthly website visitors"
    },
    {
      id: "conversionRate",
      label: "Conversion Rate",
      type: "percentage",
      required: true,
      min: 0,
      max: 100,
      description: "Percentage of visitors who make a purchase"
    },
    {
      id: "inventoryTurnover",
      label: "Inventory Turnover",
      type: "number",
      required: true,
      min: 0,
      description: "Number of times inventory is sold per year"
    }
  ],
  manufacturing: [
    {
      id: "cogs",
      label: "Cost of Goods Sold",
      type: "currency",
      required: true,
      min: 0,
      unit: "USD",
      description: "Total cost of producing goods"
    },
    {
      id: "productionCapacity",
      label: "Production Capacity",
      type: "number",
      required: true,
      min: 0,
      description: "Maximum production capacity per month"
    },
    {
      id: "assetUtilization",
      label: "Asset Utilization",
      type: "percentage",
      required: true,
      min: 0,
      max: 100,
      description: "Percentage of asset capacity being utilized"
    }
  ],
  fintech: [
    {
      id: "transactionVolume",
      label: "Transaction Volume",
      type: "number",
      required: true,
      min: 0,
      description: "Monthly transaction volume"
    },
    {
      id: "revenuePerUser",
      label: "Revenue Per User",
      type: "currency",
      required: true,
      min: 0,
      unit: "USD",
      description: "Average revenue generated per user"
    },
    {
      id: "partnerships",
      label: "Active Partnerships",
      type: "number",
      required: true,
      min: 0,
      description: "Number of active business partnerships"
    }
  ]
};

// Stage-based metrics configuration
export const stageMetrics: Record<string, Metric[]> = {
  ideation: [
    {
      id: "problemValidation",
      label: "Problem Validation Score",
      type: "number",
      required: true,
      min: 1,
      max: 10,
      description: "Score based on problem validation research"
    },
    {
      id: "marketResearch",
      label: "Market Research Score",
      type: "number",
      required: true,
      min: 1,
      max: 10,
      description: "Score based on market research depth"
    }
  ],
  growth: [
    {
      id: "revenueGrowth",
      label: "Revenue Growth Rate",
      type: "percentage",
      required: true,
      min: -100,
      max: 1000,
      description: "Month-over-month revenue growth rate"
    },
    {
      id: "retentionRate",
      label: "Customer Retention Rate",
      type: "percentage",
      required: true,
      min: 0,
      max: 100,
      description: "Percentage of customers retained monthly"
    }
  ],
  scaling: [
    {
      id: "marketShare",
      label: "Market Share",
      type: "percentage",
      required: true,
      min: 0,
      max: 100,
      description: "Estimated market share in primary market"
    },
    {
      id: "profitMargins",
      label: "Profit Margins",
      type: "percentage",
      required: true,
      min: -100,
      max: 100,
      description: "Net profit margins"
    }
  ]
};

// Validation schemas
export const createMetricSchema = (metric: Metric) => {
  let schema = z.number();
  
  if (metric.min !== undefined) {
    schema = schema.min(metric.min, `${metric.label} must be at least ${metric.min}`);
  }
  if (metric.max !== undefined) {
    schema = schema.max(metric.max, `${metric.label} must be at most ${metric.max}`);
  }
  
  return schema;
};

// Helper function to get combined metrics for industry and stage
export const getCombinedMetrics = (industry: string, stage: string): Metric[] => {
  const industry_metrics = industryMetrics[industry] || [];
  const stage_metrics = stageMetrics[stage] || [];
  
  return [...industry_metrics, ...stage_metrics];
};
