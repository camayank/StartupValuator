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

// Enhanced business stages with integrated market validation
export const businessStages = {
  // Pre-revenue stages
  ideation_unvalidated: "Ideation Stage (Concept Only)",
  ideation_validated: "Ideation Stage (Validated Concept)",
  mvp_development: "MVP Development",
  mvp_early_traction: "MVP with Early Traction",

  // Early revenue stages
  revenue_early: "Early Revenue Stage",
  revenue_growing: "Growing Revenue Stage",
  revenue_scaling: "Scaling Revenue Stage",

  // Established stages
  established_local: "Established (Local Market)",
  established_regional: "Established (Regional)",
  established_international: "Established (International)",

  // Special situations
  pre_ipo: "Pre-IPO Stage",
  acquisition_target: "Acquisition Target",
  restructuring: "Restructuring",
  liquidation: "Liquidation",
} as const;

// Reorganized industry classifications with sector-subsector structure
export const sectors = {
  technology: {
    name: "Technology",
    subsectors: {
      software_system: "Software (System & Application)",
      software_internet: "Software (Internet)",
      semiconductors: "Semiconductors",
      computer_hardware: "Computer Hardware",
      computer_services: "Computer Services",
      telecom_equipment: "Telecommunications Equipment",
      telecom_services: "Telecommunications Services",
    }
  },
  digital: {
    name: "Digital & E-commerce",
    subsectors: {
      ecommerce_retail: "E-Commerce & Digital Retail",
      digital_content: "Digital Content & Streaming",
      digital_payments: "Digital Payment Services",
      digital_platform: "Digital Platforms & Marketplaces",
    }
  },
  enterprise: {
    name: "Enterprise Solutions",
    subsectors: {
      enterprise_software: "Enterprise Software",
      cloud_services: "Cloud Services & Infrastructure",
      cybersecurity: "Cybersecurity",
      data_analytics: "Data Analytics & AI",
    }
  },
  consumer: {
    name: "Consumer",
    subsectors: {
      consumer_discretionary: "Consumer Discretionary",
      consumer_staples: "Consumer Staples",
      retail_general: "Retail (General)",
      retail_special: "Retail (Specialty)",
    }
  },
  healthcare: {
    name: "Healthcare & Life Sciences",
    subsectors: {
      healthcare_services: "Healthcare Services",
      medical_equipment: "Medical Equipment",
      biotechnology: "Biotechnology",
      pharmaceuticals: "Pharmaceuticals",
    }
  },
  financial: {
    name: "Financial Services",
    subsectors: {
      banking: "Banking",
      insurance: "Insurance",
      asset_management: "Asset Management",
      fintech: "Financial Technology",
    }
  },
  industrial: {
    name: "Industrial & Manufacturing",
    subsectors: {
      industrial_general: "Industrial (General)",
      aerospace_defense: "Aerospace & Defense",
      automotive: "Automotive",
      chemicals: "Chemicals",
    }
  },
  energy: {
    name: "Energy & Resources",
    subsectors: {
      renewable_energy: "Renewable Energy",
      oil_gas: "Oil & Gas",
      mining: "Mining & Minerals",
      utilities: "Utilities",
    }
  },
  others: {
    name: "Other Sectors",
    subsectors: {
      real_estate: "Real Estate",
      transportation: "Transportation & Logistics",
      media_entertainment: "Media & Entertainment",
      education: "Education Services",
      professional_services: "Professional Services",
      agriculture: "Agriculture & Food",
    }
  }
} as const;

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

// Enhanced compliance schema
export const complianceSchema = z.object({
  standards: z.array(z.enum(Object.keys(complianceStandards) as [keyof typeof complianceStandards, ...Array<keyof typeof complianceStandards>])),
  ipProtection: z.enum(Object.keys(ipProtectionStatus) as [keyof typeof ipProtectionStatus, ...Array<keyof typeof ipProtectionStatus>]),
  taxCompliance: z.enum(Object.keys(taxComplianceStatus) as [keyof typeof taxComplianceStatus, ...Array<keyof typeof taxComplianceStatus>]),
  lastComplianceReview: z.string().datetime().optional(),
  complianceNotes: z.string().optional(),
});

// Business overview schema with enhanced validation
export const businessOverviewSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  sector: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>]),
  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
  region: z.enum(Object.keys(regions) as [keyof typeof regions, ...Array<keyof typeof regions>]),
});

// Financial metrics schema with conditional validation
export const financialMetricsSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.enum(Object.keys(currencies) as [keyof typeof currencies, ...Array<keyof typeof currencies>]),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000").optional(),
  margins: z.number().min(-100).max(100, "Margins must be between -100 and 100").optional(),
}).refine((data) => {
  // Only require financial metrics for revenue-generating stages
  const isRevenueStage = data.stage?.includes('revenue') || data.stage?.includes('established');
  if (isRevenueStage) {
    return data.revenue > 0 && data.growthRate !== undefined && data.margins !== undefined;
  }
  return true;
}, {
  message: "Financial metrics are required for revenue-generating stages",
});

export const marketInsightsSchema = z.object({
  totalAddressableMarket: z.number().optional(),
  competitiveDifferentiation: z.enum(["high", "moderate", "limited"]).optional(),
  customerBase: z.number().min(0).optional(),
});

export const riskScalabilitySchema = z.object({
  scalabilityPotential: z.number().min(1).max(10).optional(),
  cashFlowStability: z.enum(["stable", "moderate", "volatile"]).optional(),
  primaryRiskFactor: z.enum(["market", "regulatory", "operational", "technology", "competition"]).optional(),
});

// Enhanced valuation form schema incorporating all categories
export const valuationFormSchema = z.object({
  ...businessOverviewSchema.shape,
  ...financialMetricsSchema.shape,
  ...marketInsightsSchema.shape,
  ...riskScalabilitySchema.shape,
  ...complianceSchema.shape,
  valuationPurpose: z.enum(Object.keys(valuationPurposes) as [keyof typeof valuationPurposes, ...Array<keyof typeof valuationPurposes>]),
  industry: z.enum(Object.keys(industries) as [keyof typeof industries, ...Array<keyof typeof industries>]),
  teamExperience: z.number().min(0).max(20).optional(),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"]).optional(),
  valuation: z.number().optional(),
  multiplier: z.number().optional(),
  details: z.object({
    baseValuation: z.number(),
    adjustments: z.record(z.string(), z.number())
  }).optional(),
  assumptions: z.object({
    discountRate: z.number(),
    growthRate: z.number(),
    terminalGrowthRate: z.number(),
    beta: z.number(),
    marketRiskPremium: z.number(),
  }).optional(),
  insights: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    risks: z.array(z.string()),
  }).optional(),
});

// Export types
export type ValuationFormData = z.infer<typeof valuationFormSchema>;
export type BusinessOverview = z.infer<typeof businessOverviewSchema>;
export type FinancialMetrics = z.infer<typeof financialMetricsSchema>;
export type MarketInsights = z.infer<typeof marketInsightsSchema>;
export type RiskScalability = z.infer<typeof riskScalabilitySchema>;
export type ComplianceData = z.infer<typeof complianceSchema>;

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