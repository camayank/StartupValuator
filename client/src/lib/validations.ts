import { z } from "zod";

// Define all constants first
export const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" },
} as const;

// Enhanced regions with compliance requirements
export const regions = {
  us: {
    name: "United States",
    standards: ["409A", "ASC 820"],
    riskFreeRate: 0.0368,
    marketRiskPremium: 0.0575,
    defaultCurrency: "USD" as keyof typeof currencies,
    requiredCompliance: ["409a"] as const,
  },
  eu: {
    name: "European Union",
    standards: ["IPEV", "IVS"],
    riskFreeRate: 0.0245,
    marketRiskPremium: 0.0550,
    defaultCurrency: "EUR" as keyof typeof currencies,
    requiredCompliance: ["ivs"] as const,
  },
  uk: {
    name: "United Kingdom",
    standards: ["BVCA", "IVS"],
    riskFreeRate: 0.0415,
    marketRiskPremium: 0.0525,
    defaultCurrency: "GBP" as keyof typeof currencies,
    requiredCompliance: ["ivs"] as const,
  },
  india: {
    name: "India",
    standards: ["IBBI", "IVS"],
    riskFreeRate: 0.0725,
    marketRiskPremium: 0.0650,
    defaultCurrency: "INR" as keyof typeof currencies,
    requiredCompliance: ["icai"] as const,
  },
  global: {
    name: "Global",
    standards: ["IVS"],
    riskFreeRate: 0.0350,
    marketRiskPremium: 0.0600,
    defaultCurrency: "USD" as keyof typeof currencies,
    requiredCompliance: ["ivs"] as const,
  },
} as const;

// Enhanced business stages with risk premiums and valuation methods
export const businessStages = {
  ideation: {
    name: "Ideation Stage",
    riskPremium: 0.25,
    valuation: {
      methods: ["scorecard", "checklistMethod"],
      weights: { scorecard: 0.6, checklistMethod: 0.4 }
    }
  },
  mvp: {
    name: "MVP Stage",
    riskPremium: 0.20,
    valuation: {
      methods: ["vcMethod", "firstChicago"],
      weights: { vcMethod: 0.7, firstChicago: 0.3 }
    }
  },
  early_revenue: {
    name: "Early Revenue",
    riskPremium: 0.15,
    valuation: {
      methods: ["vcMethod", "marketMultiples", "dcf"],
      weights: { vcMethod: 0.4, marketMultiples: 0.4, dcf: 0.2 }
    }
  },
  growth: {
    name: "Growth Stage",
    riskPremium: 0.10,
    valuation: {
      methods: ["dcf", "marketMultiples", "firstChicago"],
      weights: { dcf: 0.4, marketMultiples: 0.4, firstChicago: 0.2 }
    }
  },
  scaling: {
    name: "Scaling Stage",
    riskPremium: 0.08,
    valuation: {
      methods: ["dcf", "marketMultiples", "precedentTransactions"],
      weights: { dcf: 0.4, marketMultiples: 0.4, precedentTransactions: 0.2 }
    }
  },
  mature: {
    name: "Mature Business",
    riskPremium: 0.05,
    valuation: {
      methods: ["dcf", "marketMultiples", "assetBased"],
      weights: { dcf: 0.5, marketMultiples: 0.3, assetBased: 0.2 }
    }
  },
} as const;

// Sectors and industry definitions
export const sectors = {
  technology: {
    name: "Technology",
    subsectors: {
      software_system: {
        name: "Software (System & Application)",
        metrics: ["arr", "cac", "ltv", "churnRate"],
        benchmarks: {
          revenueMultiple: { early: 6, growth: 8, mature: 5 },
          grossMargin: 0.75,
          growthRate: 0.40,
          r_and_d: 0.25,
        }
      },
      software_internet: {
        name: "Software (Internet)",
        metrics: ["mrr", "userGrowth", "engagementRate"],
        benchmarks: {
          revenueMultiple: { early: 7, growth: 10, mature: 6 },
          grossMargin: 0.80,
          growthRate: 0.50,
          marketing: 0.30,
        }
      },
      semiconductors: {
        name: "Semiconductors",
        metrics: ["capex", "r_and_d", "patentPortfolio"],
        benchmarks: {
          revenueMultiple: { early: 4, growth: 6, mature: 3 },
          grossMargin: 0.60,
          growthRate: 0.25,
          r_and_d: 0.35,
        }
      }
    }
  },
  digital: {
    name: "Digital & E-commerce",
    subsectors: {
      ecommerce_retail: {
        name: "E-Commerce & Digital Retail",
        metrics: ["gmv", "aov", "customerRetention"],
        benchmarks: {
          revenueMultiple: { early: 3, growth: 4, mature: 2 },
          grossMargin: 0.45,
          growthRate: 0.35,
          marketing: 0.25,
        }
      },
      digital_content: {
        name: "Digital Content & Streaming",
        metrics: ["subscribers", "contentCosts", "engagement"],
        benchmarks: {
          revenueMultiple: { early: 5, growth: 7, mature: 4 },
          grossMargin: 0.65,
          growthRate: 0.45,
          content: 0.40,
        }
      }
    }
  },
  enterprise: {
    name: "Enterprise Solutions",
    subsectors: {
      enterprise_software: {
        name: "Enterprise Software",
        metrics: ["arr", "customerLifetime", "dealSize"],
        benchmarks: {
          revenueMultiple: { early: 8, growth: 12, mature: 6 },
          grossMargin: 0.85,
          growthRate: 0.35,
          sales: 0.30,
        }
      },
      cloud_services: {
        name: "Cloud Services & Infrastructure",
        metrics: ["usage", "serverCosts", "uptime"],
        benchmarks: {
          revenueMultiple: { early: 7, growth: 10, mature: 5 },
          grossMargin: 0.70,
          growthRate: 0.40,
          infrastructure: 0.35,
        }
      }
    }
  }
} as const;

// Create a flat map of all industries for backward compatibility
export const industries = Object.entries(sectors).reduce((acc, [_, sector]) => {
  return { ...acc, ...sector.subsectors };
}, {} as Record<string, string>);

// Industry-specific metrics interface
export interface IndustryMetrics {
  saas?: {
    arr: number;
    mrr: number;
    cac: number;
    ltv: number;
    churnRate: number;
    expansionRevenue: number;
  };
  ecommerce?: {
    gmv: number;
    aov: number;
    inventoryTurnover: number;
    repeatPurchaseRate: number;
    customerLifetimeValue: number;
  };
  enterprise?: {
    tcv: number;
    bookings: number;
    backlog: number;
    dealCycle: number;
    contractLength: number;
  };
}

// Export interface for industry benchmarks
export interface IndustryBenchmarks {
  revenueMultiple: {
    early: number;
    growth: number;
    mature: number;
  };
  grossMargin: number;
  growthRate: number;
  [key: string]: any;
}

// ESG Impact levels
export const esgImpactLevels = {
  high: "High Impact",
  medium: "Medium Impact",
  low: "Low Impact",
  none: "No Significant Impact",
} as const;

// Market differentiation levels
export const differentiationLevels = {
  high: "Highly Differentiated",
  medium: "Moderately Differentiated",
  low: "Limited Differentiation",
} as const;

// Enhanced compliance standards
export const complianceStandards = {
  "409a": "409A Valuation",
  "ivs": "International Valuation Standards",
  "icai": "ICAI Valuation Standards",
  "ifrs": "IFRS Standards",
  "asc820": "ASC 820 Fair Value",
} as const;

// IP Protection status
export const ipProtectionStatus = {
  none: "No IP Protection",
  pending: "IP Protection Pending",
  registered: "IP Protected",
  multiple: "Multiple IP Registrations",
} as const;

// Tax compliance status
export const taxComplianceStatus = {
  compliant: "Tax Compliant",
  partial: "Partially Compliant",
  pending: "Compliance Pending",
  notRequired: "Compliance Not Required",
} as const;


// Combined validation schema with industry-specific metrics
export const valuationFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  sector: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>]),
  subsector: z.string(),
  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
  region: z.enum(Object.keys(regions) as [keyof typeof regions, ...Array<keyof typeof regions>]),
  currency: z.enum(Object.keys(currencies) as [keyof typeof currencies, ...Array<keyof typeof currencies>]),

  // Financial metrics
  revenue: z.number().min(0, "Revenue must be positive"),
  growthRate: z.number().min(-100).max(1000).optional(),
  margins: z.number().min(-100).max(100).optional(),
  ebitda: z.number().optional(),

  // Industry-specific metrics
  industryMetrics: z.object({
    saas: z.object({
      arr: z.number(),
      mrr: z.number(),
      cac: z.number(),
      ltv: z.number(),
      churnRate: z.number(),
      expansionRevenue: z.number(),
    }).optional(),
    ecommerce: z.object({
      gmv: z.number(),
      aov: z.number(),
      inventoryTurnover: z.number(),
      repeatPurchaseRate: z.number(),
      customerLifetimeValue: z.number(),
    }).optional(),
    enterprise: z.object({
      tcv: z.number(),
      bookings: z.number(),
      backlog: z.number(),
      dealCycle: z.number(),
      contractLength: z.number(),
    }).optional(),
  }).optional(),

  // Market metrics
  totalAddressableMarket: z.number().min(0),
  marketShare: z.number().min(0).max(100),
  competitors: z.array(z.string()),

  // Valuation assumptions
  assumptions: z.object({
    riskFreeRate: z.number(),
    beta: z.number(),
    marketRiskPremium: z.number(),
    costOfDebt: z.number().optional(),
    taxRate: z.number().optional(),
    debtRatio: z.number().optional(),
    terminalGrowthRate: z.number().optional(),
    revenueMultiple: z.number().optional(),
  }).optional(),

  // Optional computed fields
  valuation: z.number().optional(),
  details: z.object({
    baseValuation: z.number(),
    adjustments: z.record(z.string(), z.number()),
    methodResults: z.array(z.object({
      method: z.string(),
      value: z.number(),
      weight: z.number(),
      description: z.string()
    }))
  }).optional(),

  // Additional metrics for calculations
  capexRate: z.number().optional(),
  workingCapitalRate: z.number().optional(),
  tam: z.number().optional(),
  productLines: z.number().optional(),
  plannedProducts: z.number().optional(),
  currentMarkets: z.number().optional(),
  potentialMarkets: z.number().optional(),
  currentCustomerSegments: z.number().optional(),
  potentialSegments: z.number().optional(),
});

export type ValuationFormData = z.infer<typeof valuationFormSchema>;

export const valuationPurposes = {
  fundraising: "Fundraising",
  acquisition: "Mergers & Acquisitions",
  compliance: "Regulatory Compliance",
  internal: "Internal Planning",
  stakeholder: "Stakeholder Reporting",
  exit_planning: "Exit Planning",
} as const;

// Categories for organizing inputs
export const businessOverviewSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  sector: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>]),
  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
  region: z.enum(Object.keys(regions) as [keyof typeof regions, ...Array<keyof typeof regions>]),
  valuationPurpose: z.enum(Object.keys(valuationPurposes) as [keyof typeof valuationPurposes, ...Array<keyof typeof valuationPurposes>]),
});

export const financialMetricsSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.enum(Object.keys(currencies) as [keyof typeof currencies, ...Array<keyof typeof currencies>]),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000").optional(),
  margins: z.number().min(-100).max(100, "Margins must be between -100 and 100").optional(),
  annualProfit: z.number().optional(),
}).refine((data) => {
  const isRevenueStage = ['early_revenue', 'growth', 'scaling', 'mature'].includes(data.stage as string);
  if (isRevenueStage) {
    return data.revenue > 0 && data.growthRate !== undefined && data.margins !== undefined;
  }
  return true;
}, {
  message: "Financial metrics are required for revenue-generating stages",
});

export const marketInsightsSchema = z.object({
  totalAddressableMarket: z.number().min(0, "TAM must be positive"),
  activeCustomers: z.number().min(0, "Number of customers must be positive"),
  competitiveDifferentiation: z.enum(Object.keys(differentiationLevels) as [keyof typeof differentiationLevels, ...Array<keyof typeof differentiationLevels>]),
  marketPosition: z.string().optional(),
});

export const riskScalabilitySchema = z.object({
  primaryRiskFactor: z.enum(["market", "regulatory", "operational", "technology", "competition"]),
  cashFlowStability: z.enum(["stable", "moderate", "volatile"]),
  scalabilityPotential: z.number().min(1).max(10),
});

export const jurisdictionalComplianceSchema = z.object({
  complianceStandards: z.array(z.enum(Object.keys(complianceStandards) as [keyof typeof complianceStandards, ...Array<keyof typeof complianceStandards>])),
  ipProtection: z.enum(Object.keys(ipProtectionStatus) as [keyof typeof ipProtectionStatus, ...Array<keyof typeof ipProtectionStatus>]),
  taxCompliance: z.enum(Object.keys(taxComplianceStatus) as [keyof typeof taxComplianceStatus, ...Array<keyof typeof taxComplianceStatus>]),
  lastComplianceReview: z.string().datetime().optional(),
});

export const qualitativeFactorsSchema = z.object({
  teamExperience: z.number().min(0).max(50, "Team experience must be between 0 and 50 years"),
  founderCredentials: z.string().optional(),
  esgImpact: z.enum(Object.keys(esgImpactLevels) as [keyof typeof esgImpactLevels, ...Array<keyof typeof esgImpactLevels>]),
});


// Export types
export type BusinessOverview = z.infer<typeof businessOverviewSchema>;
export type FinancialMetrics = z.infer<typeof financialMetricsSchema>;
export type MarketInsights = z.infer<typeof marketInsightsSchema>;
export type RiskScalability = z.infer<typeof riskScalabilitySchema>;
export type JurisdictionalCompliance = z.infer<typeof jurisdictionalComplianceSchema>;
export type QualitativeFactors = z.infer<typeof qualitativeFactorsSchema>;

// Utility functions
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