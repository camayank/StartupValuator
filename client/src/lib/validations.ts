import { z } from "zod";

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
    riskFreeRate: 0.0368, // Current 10-year Treasury yield
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

export const valuationFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  valuationPurpose: z.enum(Object.keys(valuationPurposes) as [keyof typeof valuationPurposes, ...Array<keyof typeof valuationPurposes>]),
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.enum(Object.keys(currencies) as [keyof typeof currencies, ...Array<keyof typeof currencies>]),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
  margins: z.number().min(-100).max(100, "Margins must be between -100 and 100"),
  sector: z.enum(Object.keys(sectors) as [keyof typeof sectors, ...Array<keyof typeof sectors>]),
  industry: z.enum(Object.keys(industries) as [keyof typeof industries, ...Array<keyof typeof industries>]),
  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),
  region: z.enum(Object.keys(regions) as [keyof typeof regions, ...Array<keyof typeof regions>]),
  intellectualProperty: z.enum(["none", "pending", "registered"]).optional(),
  teamExperience: z.number().min(0).max(20).optional(),
  customerBase: z.number().min(0).optional(),
  competitiveDifferentiation: z.enum(["low", "medium", "high"]).optional(),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"]).optional(),
  scalability: z.enum(["limited", "moderate", "high"]).optional(),
  valuation: z.number().optional(),
  multiplier: z.number().optional(),
  details: z.object({
    baseValuation: z.number(),
    adjustments: z.record(z.string(), z.number())
  }).optional(),
  riskAssessment: z.any().optional(),
  potentialPrediction: z.any().optional(),
  ecosystemNetwork: z.any().optional()
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