import { z } from "zod";
import type { ValidationResult } from "./types";
import { BUSINESS_SECTORS } from "./constants/business-sectors";

export const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" },
} as const;

// Update the business stages to match the actual values used
export const businessStages = {
  ideation_unvalidated: "Ideation Stage (Concept Only)",
  ideation_validated: "Ideation Stage (Market Validated)",
  mvp_development: "MVP Development",
  mvp_early_traction: "MVP with Early Traction",
  beta_testing: "Beta Testing",
  revenue_early: "Early Revenue Stage",
  revenue_growing: "Growing Revenue Stage",
  revenue_scaling: "Scaling Revenue Stage",
  growth_regional: "Regional Growth",
  growth_national: "National Expansion",
  growth_international: "International Expansion",
  mature_stable: "Mature & Stable",
  mature_expanding: "Mature & Expanding",
  pre_ipo: "Pre-IPO Stage",
  acquisition_target: "Acquisition Target",
  restructuring: "Restructuring",
  turnaround: "Turnaround Stage"
} as const;

// Add regions with their compliance standards and default currency
export const regions = {
  us: {
    name: "United States",
    standards: ["409A", "ASC 820"],
    riskFreeRate: 0.0368,
    marketRiskPremium: 0.0575,
    defaultCurrency: "USD" as keyof typeof currencies,
  },
  eu: {
    name: "European Union",
    standards: ["IPEV", "IVS"],
    riskFreeRate: 0.0245,
    marketRiskPremium: 0.0550,
    defaultCurrency: "EUR" as keyof typeof currencies,
  },
  uk: {
    name: "United Kingdom",
    standards: ["BVCA", "IVS"],
    riskFreeRate: 0.0415,
    marketRiskPremium: 0.0525,
    defaultCurrency: "GBP" as keyof typeof currencies,
  },
  india: {
    name: "India",
    standards: ["IBBI", "IVS"],
    riskFreeRate: 0.0725,
    marketRiskPremium: 0.0650,
    defaultCurrency: "INR" as keyof typeof currencies,
  },
  global: {
    name: "Global",
    standards: ["IVS"],
    riskFreeRate: 0.0350,
    marketRiskPremium: 0.0600,
    defaultCurrency: "USD" as keyof typeof currencies,
  },
} as const;

// Standard expense categories for startups
export const expenseCategories = {
  personnel: {
    name: "Personnel & Payroll",
    subcategories: ["Salaries", "Benefits", "Payroll Taxes", "Contractors"],
  },
  technology: {
    name: "Technology & Infrastructure",
    subcategories: ["Software Licenses", "Cloud Services", "Hardware", "IT Support"],
  },
  marketing: {
    name: "Marketing & Sales",
    subcategories: ["Advertising", "Events", "Content Creation", "Sales Tools"],
  },
  operations: {
    name: "Operations & Office",
    subcategories: ["Rent", "Utilities", "Supplies", "Insurance"],
  },
  rd: {
    name: "Research & Development",
    subcategories: ["Product Development", "Patents", "Testing", "Prototyping"],
  },
  professional: {
    name: "Professional Services",
    subcategories: ["Legal", "Accounting", "Consulting", "Advisory"],
  },
} as const;

// Fund utilization categories
export const fundingCategories = {
  productDevelopment: "Product Development",
  marketing: "Marketing & Customer Acquisition",
  operations: "Operations & Infrastructure",
  hiring: "Team Expansion",
  workingCapital: "Working Capital",
  researchDevelopment: "Research & Development",
  expansion: "Market Expansion",
  reserves: "Cash Reserves",
} as const;

// Financial Projections Schema
export const financialProjectionSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  projectionPeriod: z.number().int().min(1).max(5),
  baseRevenue: z.number().min(0),
  baseExpenses: z.number().min(0),
  currency: z.enum(Object.keys(currencies) as [keyof typeof currencies, ...Array<keyof typeof currencies>]),
  growthRate: z.number().min(-100).max(1000),
  marginProjection: z.number().min(-100).max(100),
  burnRate: z.number().min(0).optional(),
  totalFunding: z.number().min(0).optional(),
  allocation: z.array(z.object({
    category: z.string(),
    percentage: z.number().min(0).max(100),
    amount: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  assumptions: z.object({
    revenueAssumptions: z.array(z.object({
      category: z.string(),
      growthRate: z.number(),
      description: z.string(),
    })),
    expenseAssumptions: z.array(z.object({
      category: z.string(),
      percentage: z.number(),
      description: z.string(),
    })),
  }),
});

// Revenue Projections Schema
export const revenueProjectionsSchema = z.object({
  baseRevenue: z.number().min(0, "Revenue must be positive"),
  projectionPeriod: z.number().int().min(1).max(5, "Projection period must be between 1 and 5 years"),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100% and 1000%"),
  revenueAssumptions: z.array(z.object({
    category: z.string(),
    growthRate: z.number(),
    description: z.string(),
  })).optional(),
});

export type FinancialProjectionData = z.infer<typeof financialProjectionSchema>;

// Fund Utilization Schema
export const fundUtilizationSchema = z.object({
  totalFunding: z.number().min(0),
  burnRate: z.number().min(0),
  runway: z.number().min(1),
  allocation: z.array(z.object({
    category: z.enum(Object.keys(fundingCategories) as [keyof typeof fundingCategories, ...Array<keyof typeof fundingCategories>]),
    percentage: z.number().min(0).max(100),
    amount: z.number().min(0),
    description: z.string(),
  })),
});

// Revenue models for businesses
export const revenueModels = {
  subscription: "Subscription Model",
  transactional: "Transactional / One-time Sales",
  marketplace: "Marketplace / Commission",
  advertising: "Advertising Revenue",
  licensing: "Licensing / Royalties",
  saas: "Software as a Service",
  freemium: "Freemium Model",
  consulting: "Professional Services / Consulting",
  hardware: "Hardware Sales",
  usage_based: "Usage-Based Pricing",
  hybrid: "Hybrid Model"
} as const;

// Geographic market definitions
export const geographicMarkets = {
  local: "Local / City-specific",
  regional: "Regional / State-level",
  national: "National",
  multinational: "Multi-country Operations",
  global: "Global Operations",
  emerging: "Emerging Markets",
  developed: "Developed Markets",
  online_only: "Online / Digital Only"
} as const;

// Product development stages
export const productStages = {
  concept: "Concept / Ideation",
  prototype: "Prototype / POC",
  mvp: "Minimum Viable Product",
  beta: "Beta Version",
  market_ready: "Market Ready",
  scaling: "Scaling / Growth",
  mature: "Mature Product",
  next_gen: "Next Generation Development"
} as const;

// Get all sectors as an array of strings
const sectorKeys = Object.keys(BUSINESS_SECTORS);

// Update the sectors object to match BUSINESS_SECTORS structure
export const sectors = Object.fromEntries(
  sectorKeys.map(sector => [
    sector.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    {
      name: sector,
      subsectors: Object.fromEntries(
        Object.entries(BUSINESS_SECTORS[sector]).map(([segment, subSegments]) => [
          segment.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          {
            name: segment,
            description: `${segment} within ${sector}`,
            subSegments: subSegments
          }
        ])
      )
    }
  ])
);


// Create a flat map of all industries for backward compatibility
export const industries = Object.entries(sectors).reduce((acc, [_, sector]) => {
  return { ...acc, ...sector.subsectors };
}, {} as Record<string, string>);


export const valuationPurposes = {
  fundraising: "Fundraising",
  acquisition: "Mergers & Acquisitions",
  compliance: "Regulatory Compliance",
  internal: "Internal Planning",
  stakeholder: "Stakeholder Reporting",
  exit_planning: "Exit Planning",
} as const;

// Core metrics that apply to all industries
export const coreMetrics = {
  financial: {
    revenue: { label: "Revenue", type: "currency" },
    growthRate: { label: "Growth Rate", type: "percentage" },
    operatingMargin: { label: "Operating Margin", type: "percentage" },
    cashFlow: { label: "Cash Flow", type: "currency" },
    burnRate: { label: "Burn Rate", type: "currency" }
  },
  market: {
    tam: { label: "Total Addressable Market", type: "currency" },
    marketShare: { label: "Market Share", type: "percentage" },
    competitorCount: { label: "Number of Direct Competitors", type: "number" }
  },
  operational: {
    customerBase: { label: "Active Customer Base", type: "number" },
    retention: { label: "Customer Retention Rate", type: "percentage" },
    acquisitionCost: { label: "Customer Acquisition Cost", type: "currency" }
  }
} as const;

// Enhanced industry metrics with flexible categorization
export const industryMetrics = {
  saas: {
    name: "SaaS",
    description: "Software as a Service businesses",
    relatedSectors: ["enterprise", "technology", "fintech"],
    metrics: {
      mrr: { label: "Monthly Recurring Revenue (MRR)", type: "currency" },
      arr: { label: "Annual Recurring Revenue (ARR)", type: "currency" },
      cac: { label: "Customer Acquisition Cost (CAC)", type: "currency" },
      ltv: { label: "Customer Lifetime Value (LTV)", type: "currency" },
      churnRate: { label: "Churn Rate", type: "percentage" },
      grossRetention: { label: "Gross Retention Rate", type: "percentage" }
    }
  },
  ecommerce: {
    name: "E-commerce",
    description: "E-commerce businesses",
    relatedSectors: ["retail"],
    metrics: {
      gmv: { label: "Gross Merchandise Value (GMV)", type: "currency" },
      aov: { label: "Average Order Value (AOV)", type: "currency" },
      customerRetention: { label: "Customer Retention Rate", type: "percentage" },
      inventoryTurnover: { label: "Inventory Turnover", type: "number" },
      returnRate: { label: "Return Rate", type: "percentage" }
    }
  },
  manufacturing: {
    name: "Manufacturing",
    description: "Manufacturing businesses",
    relatedSectors: ["industrial_tech"],
    metrics: {
      assetUtilization: { label: "Asset Utilization", type: "percentage" },
      operatingMargin: { label: "Operating Margin", type: "percentage" },
      workingCapital: { label: "Working Capital Efficiency", type: "ratio" },
      roic: { label: "Return on Invested Capital (ROIC)", type: "percentage" },
      capacityUtilization: { label: "Capacity Utilization", type: "percentage" }
    }
  },
  healthcare: {
    name: "Healthcare",
    description: "Healthcare businesses",
    relatedSectors: ["healthtech"],
    metrics: {
      patientLtv: { label: "Patient Lifetime Value", type: "currency" },
      revenuePerPatient: { label: "Revenue per Patient", type: "currency" },
      regulatoryCompliance: { label: "Regulatory Compliance Costs", type: "currency" },
      treatmentCost: { label: "Average Treatment Cost", type: "currency" },
      operatingMargins: { label: "Operating Margins", type: "percentage" }
    }
  },
  fintech: {
    name: "Financial Technology",
    description: "Financial Technology businesses",
    relatedSectors: ["technology", "enterprise"],
    metrics: {
      transactionVolume: { label: "Transaction Volume", type: "currency" },
      arpu: { label: "Average Revenue per User (ARPU)", type: "currency" },
      cac: { label: "Customer Acquisition Cost (CAC)", type: "currency" },
      retentionRate: { label: "Retention Rate", type: "percentage" },
      tpv: { label: "Total Payment Value (TPV)", type: "currency" }
    }
  }
} as const;

// Dynamic industry questionnaire schema
export const industryQuestionnaireSchema = z.object({
  revenueModel: z.enum([
    "subscription",
    "transactional",
    "advertising",
    "licensing",
    "hybrid",
    "other"
  ]),
  customerMetrics: z.object({
    acquisitionChannel: z.string(),
    lifetimeValue: z.number().optional(),
    engagementMetric: z.string()
  }),
  operationalMetrics: z.object({
    costStructure: z.string(),
    scalabilityFactors: z.array(z.string()),
    keyResources: z.array(z.string())
  }),
  industryTrends: z.array(z.object({
    name: z.string(),
    impact: z.enum(["low", "medium", "high"]),
    description: z.string()
  }))
});

// Hybrid metrics schema for industries that combine multiple sectors
export const hybridMetricsSchema = z.object({
  primarySector: z.enum(Object.keys(industryMetrics) as [keyof typeof industryMetrics, ...Array<keyof typeof industryMetrics>]),
  secondarySectors: z.array(z.enum(Object.keys(industryMetrics) as [keyof typeof industryMetrics, ...Array<keyof typeof industryMetrics>])),
  customMetrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    type: z.enum(["currency", "percentage", "number", "ratio"]),
    description: z.string()
  })),
  weights: z.record(z.string(), z.number()), // For weighted average calculations
  notes: z.string().optional()
});

// Update existing schema
export const industryMetricsSchema = z.object({
  // Core metrics that apply to all industries
  coreMetrics: z.record(z.string(), z.number()).optional(),

  // Industry-specific metrics
  industrySpecificMetrics: z.record(z.string(), z.number()).optional(),

  // Optional hybrid metrics for cross-sector industries
  hybridMetrics: hybridMetricsSchema.optional(),

  // Stage information
  stage: z.string(),

  // Ideation stage metrics
  ideationMetrics: z.object({
    marketResearch: z.number().min(0).max(100).optional(),
    problemValidation: z.number().min(0).max(100).optional(),
    solutionReadiness: z.number().min(0).max(100).optional(),
    potentialMarketSize: z.number().min(0).optional(),
  }).optional(),

  // Custom metrics
  customMetrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    type: z.enum(["currency", "percentage", "number", "ratio"]),
  })).optional(),

  // Benchmarking data
  benchmarks: z.record(z.string(), z.object({
    low: z.number(),
    median: z.number(),
    high: z.number()
  })).optional()
});

export type IndustryMetricsData = z.infer<typeof industryMetricsSchema>;

// Industry-specific validation rules
const getIndustryValidations = (industry: string) => {
  switch (industry) {
    case 'software_enterprise':
    case 'software_consumer':
      return {
        minRevenue: 0,
        minCustomers: 0,
        requiredMetrics: ['mrr', 'cac', 'churnRate'],
      };
    case 'biotech':
    case 'medtech':
      return {
        minRevenue: 0,
        minCustomers: 0,
        requiredMetrics: ['rd_investment', 'regulatory_stage'],
      };
    default:
      return {
        minRevenue: 0,
        minCustomers: 0,
        requiredMetrics: [],
      };
  }
};

// Move scalabilityOptions before its usage
export const scalabilityOptions = {
  limited: "Limited Growth Potential",
  moderate: "Moderate Growth Potential",
  high: "High Growth Potential"
} as const;

// Add region and compliance schemas
export const regionSchema = z.object({
  region: z.enum(Object.keys(regions) as [keyof typeof regions, ...Array<keyof typeof regions>])
    .default("global"),
  complianceStandard: z.string().optional(),
  valuationPurpose: z.enum(Object.keys(valuationPurposes) as [keyof typeof valuationPurposes, ...Array<keyof typeof valuationPurposes>])
    .default("fundraising")
});

export const valuationFormSchema = z.object({
  // Business Information
  businessInfo: z.object({
    name: z.string().min(1, "Business name is required"),
    sector: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>], {
      required_error: "Sector is required"
    }),
    industry: z.enum(Object.keys(industries) as [keyof typeof industries, ...Array<keyof typeof industries>], {
      required_error: "Industry is required"
    }),
    location: z.string().min(1, "Location is required"),
    productStage: z.enum(Object.keys(productStages) as [keyof typeof productStages, ...Array<keyof typeof productStages>]),
    businessModel: z.enum(Object.keys(revenueModels) as [keyof typeof revenueModels, ...Array<keyof typeof revenueModels>])
  }),

  // Market Data
  marketData: z.object({
    tam: z.number().min(0, "TAM must be a positive number"),
    sam: z.number().min(0, "SAM must be a positive number"),
    som: z.number().min(0, "SOM must be a positive number"),
    growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100% and 1000%"),
    competitors: z.array(z.string())
  }).refine((data) => data.tam >= data.sam && data.sam >= data.som, {
    message: "Market sizes must follow TAM ≥ SAM ≥ SOM",
    path: ["marketData"]
  }),

  // Financial Data
  financialData: z.object({
    revenue: z.number().min(0, "Revenue must be a positive number"),
    cac: z.number().min(0, "CAC must be a positive number"),
    ltv: z.number().min(0, "LTV must be a positive number"),
    burnRate: z.number().min(0, "Burn rate must be a positive number"),
    runway: z.number().min(0, "Runway must be a positive number")
  }).refine((data) => data.ltv > data.cac, {
    message: "LTV should be greater than CAC for a sustainable business model",
    path: ["financialData"]
  }),

  // Product Details
  productDetails: z.object({
    maturity: z.string().min(1, "Product maturity level is required"),
    roadmap: z.string().min(1, "Product roadmap is required"),
    technologyStack: z.string().min(1, "Technology stack is required"),
    differentiators: z.string().min(1, "Product differentiators are required")
  }),

  // Risks and Opportunities
  risksAndOpportunities: z.object({
    risks: z.array(z.string()).min(1, "At least one risk must be identified"),
    opportunities: z.array(z.string()).min(1, "At least one opportunity must be identified")
  }),

  // Valuation Inputs
  valuationInputs: z.object({
    targetValuation: z.number().min(0, "Target valuation must be a positive number"),
    fundingRequired: z.number().min(0, "Funding required must be a positive number"),
    expectedROI: z.number().min(0, "Expected ROI must be a positive number")
  })
});

export type ValuationFormData = z.infer<typeof valuationFormSchema>;

export function formatCurrency(value: number, currency: keyof typeof currencies = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard'
  }).format(value);
}

// PitchDeck Types and Validation
export const pitchDeckFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  problem: z.string().min(1, "Problem statement is required"),
  solution: z.string().min(1, "Solution description is required"),
  marketSize: z.string().min(1, "Market size is required"),
  businessModel: z.string().min(1, "Business model is required"),
  competition: z.string().min(1, "Competition analysis is required"),
  traction: z.string().optional(),
  team: z.string().min(1, "Team information is required"),
  financials: z.string().min(1, "Financial information is required"),
  fundingAsk: z.string().min(1, "Funding ask is required"),
  useOfFunds: z.string().min(1, "Use of funds is required"),
  presentationStyle: z.enum(["professional", "modern", "creative", "minimal"]).default("professional"),
  colorScheme: z.enum(["blue", "green", "purple", "orange", "neutral"]).default("blue"),
  additionalNotes: z.string().optional(),
});

export type PitchDeckFormData = z.infer<typeof pitchDeckFormSchema>;