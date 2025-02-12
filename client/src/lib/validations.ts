import { z } from "zod";
import type { ValidationResult } from "./types";
import { BUSINESS_SECTORS } from "./constants/business-sectors";

// Core enums
export const businessStages = {
  ideation_unvalidated: "Ideation Stage (Concept Only)",
  ideation_validated: "Ideation Stage (Market Validated)", 
  mvp_development: "MVP Development",
  mvp_early_traction: "MVP with Early Traction",
  beta_testing: "Beta Testing",
  revenue_early: "Early Revenue Stage",
  revenue_growing: "Growing Revenue Stage",
  revenue_scaling: "Scaling Revenue Stage"
} as const;

export const productStages = {
  concept: "Concept / Ideation",
  prototype: "Prototype / POC",
  mvp: "Minimum Viable Product",
  beta: "Beta Version",
  market_ready: "Market Ready",
  scaling: "Scaling / Growth",
  mature: "Mature Product"
} as const;

export const revenueModels = {
  subscription: "Subscription Model",
  transactional: "Transactional / One-time Sales",
  marketplace: "Marketplace / Commission",
  advertising: "Advertising Revenue",
  licensing: "Licensing / Royalties",
  saas: "Software as a Service",
  freemium: "Freemium Model"
} as const;

// Define sector types
export type SectorId = keyof typeof BUSINESS_SECTORS;
export type IndustryId = string;

// Create type-safe sector and industry maps
export const sectors = BUSINESS_SECTORS;

// Flatten industries for easier access
export const industries = Object.entries(sectors).reduce((acc, [sectorId, sectorData]) => {
  const sectorIndustries = sectorData.subsectors || {};
  return { ...acc, ...sectorIndustries };
}, {} as Record<string, { name: string; description: string; subSegments: string[] }>);

// Business Info Step Schema
export const businessInfoSchema = z.object({
  businessName: z.string()
    .min(1, "Business name is required")
    .max(100, "Business name must be less than 100 characters"),

  sector: z.string({
    required_error: "Sector is required",
    invalid_type_error: "Please select a valid sector"
  }),

  industry: z.string({
    required_error: "Industry is required",
    invalid_type_error: "Please select a valid industry"
  }),

  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>], {
    required_error: "Business stage is required"
  }),

  employeeCount: z.number({
    required_error: "Number of employees is required",
    invalid_type_error: "Please enter a valid number"
  }).min(1, "Must have at least 1 employee"),

  teamExperience: z.number().min(0).max(50).optional(),
  customerBase: z.number().min(0).optional(),

  revenueModel: z.enum(Object.keys(revenueModels) as [keyof typeof revenueModels, ...Array<keyof typeof revenueModels>], {
    required_error: "Revenue model is required"
  }),

  productStage: z.enum(Object.keys(productStages) as [keyof typeof productStages, ...Array<keyof typeof productStages>], {
    required_error: "Product stage is required"
  }),

  scalability: z.enum(["limited", "moderate", "high"] as const),
  intellectualProperty: z.enum(["none", "pending", "registered"] as const),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"] as const)
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

// Helper function for currency formatting
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard'
  }).format(value);
}


export const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" },
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


// Get all sectors as an array of strings
const sectorKeys = Object.keys(BUSINESS_SECTORS);

// Update the sectors type definition to match database schema
export const sectors2 = BUSINESS_SECTORS as Record<string, {
  name: string;
  subsectors: Record<string, {
    name: string;
    description: string;
    subSegments: string[];
  }>;
}>;

// Create a flat map of all industries for easier validation
export const industries2 = Object.entries(sectors2).reduce<Record<string, {
  name: string;
  description: string;
  subSegments: string[];
}>>((acc, [_, sector]) => {
  return { ...acc, ...sector.subsectors };
}, {});

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

// Add new validation schemas for AI analysis and tracking
export const aiAnalysisSchema = z.object({
  marketAnalysis: z.object({
    trends: z.array(z.string()),
    impact: z.record(z.number()),
    confidence: z.number(),
    recommendations: z.array(z.string()),
  }),
  riskAssessment: z.object({
    score: z.number(),
    factors: z.array(z.object({
      category: z.string(),
      severity: z.number(),
      mitigation: z.array(z.string()),
    })),
  }),
});

// Core Types from edited snippet
export const businessSectorSchema = z.enum([
  "SaaS",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Enterprise",
  "Consumer"
]);

export const businessStageSchema = z.enum([
  "concept",
  "prototype",
  "mvp",
  "beta",
  "market_ready",
  "scaling",
  "mature"
]);

export const businessModelSchema = z.enum([
  "subscription",
  "transactional",
  "marketplace",
  "advertising",
  "licensing",
  "saas",
  "freemium"
]);

// Validation Schemas from edited snippet
export const businessInfoSchema2 = z.object({
  name: z.string().min(1, "Business name is required"),
  sector: businessSectorSchema,
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
  productStage: businessStageSchema,
  businessModel: businessModelSchema
});

export const financialDataSchema = z.object({
  revenue: z.number().min(0, "Revenue must be a positive number"),
  cac: z.number().min(0, "CAC must be a positive number"),
  ltv: z.number().min(0, "LTV must be a positive number"),
  burnRate: z.number().min(0, "Burn rate must be a positive number"),
  runway: z.number().min(0, "Runway must be a positive number")
});

export const marketDataSchema = z.object({
  tam: z.number().min(0, "TAM must be a positive number"),
  sam: z.number().min(0, "SAM must be a positive number"),
  som: z.number().min(0, "SOM must be a positive number"),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100% and 1000%"),
  competitors: z.array(z.string())
}).refine((data) => data.tam >= data.sam && data.sam >= data.som, {
  message: "Market sizes must follow TAM ≥ SAM ≥ SOM",
  path: ["marketData"]
});

// Main Valuation Form Schema from edited snippet
export const valuationFormSchema = z.object({
  businessInfo: businessInfoSchema2,
  financialData: financialDataSchema,
  marketData: marketDataSchema
});

export type ValuationFormData = z.infer<typeof valuationFormSchema>;


// Update valuationFormSchema to include AI and performance tracking
export const valuationFormSchema2 = z.object({
  businessInfo: businessInfoSchema,
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
  financialData: financialProjectionSchema,
  productDetails: z.object({
    maturity: z.string().min(1, "Product maturity level is required"),
    roadmap: z.string().min(1, "Product roadmap is required"),
    technologyStack: z.string().min(1, "Technology stack is required"),
    differentiators: z.string().min(1, "Product differentiators are required")
  }),
  risksAndOpportunities: z.object({
    risks: z.array(z.string()).min(1, "At least one risk must be identified"),
    opportunities: z.array(z.string()).min(1, "At least one opportunity must be identified")
  }),
  valuationInputs: z.object({
    targetValuation: z.number().min(0, "Target valuation must be a positive number"),
    fundingRequired: z.number().min(0, "Funding required must be a positive number"),
    expectedROI: z.number().min(0, "Expected ROI must be a positive number")
  })
});

export type ValuationFormData2 = z.infer<typeof valuationFormSchema2>;

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

// Financial Metrics Schema
export const financialMetricsSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  ebitda: z.number(),
  netIncome: z.number(),
  cashFlow: z.number(),
  assets: z.number().min(0, "Assets must be positive"),
  liabilities: z.number().min(0, "Liabilities must be positive"),
  equityValue: z.number(),
  debtLevel: z.number().min(0, "Debt level must be positive"),
  growthRate: z.number().min(-100).max(1000),
  profitMargin: z.number().min(-100).max(100),
});

// Market Analysis Schema
export const marketAnalysisSchema = z.object({
  marketSize: z.number().min(0, "Market size must be positive"),
  growthRate: z.number().min(-100).max(1000),
  competitorCount: z.number().int().min(0),
  marketShare: z.number().min(0).max(100),
  barriers: z.array(z.string()),
  trends: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

// Performance tracking schemas
export const performanceMetricsSchema = z.object({
  accuracy: z.number(),
  precision: z.number(),
  recall: z.number(),
  f1Score: z.number(),
  mape: z.number(),
  confidenceCalibration: z.number(),
});

// Real-time market signal integration
export const marketSignalSchema = z.object({
  source: z.string(),
  signal: z.string(),
  impact: z.number(),
  confidence: z.number(),
  timestamp: z.date(),
});

export type AIAnalysisData = z.infer<typeof aiAnalysisSchema>;
export type PerformanceMetricsData = z.infer<typeof performanceMetricsSchema>;
export type MarketSignalData = z.infer<typeof marketSignalSchema>;