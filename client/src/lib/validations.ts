import { z } from "zod";

export const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" },
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

// Comprehensive industry classifications based on Damodaran's database
export const industries = {
  // Technology
  software_system: "Software (System & Application)",
  software_internet: "Software (Internet)",
  semiconductors: "Semiconductors",
  computer_hardware: "Computer Hardware",
  computer_services: "Computer Services",
  telecom_equipment: "Telecommunications Equipment",
  telecom_services: "Telecommunications Services",

  // E-commerce & Digital
  ecommerce_retail: "E-Commerce & Digital Retail",
  digital_content: "Digital Content & Streaming",
  digital_payments: "Digital Payment Services",
  digital_platform: "Digital Platforms & Marketplaces",

  // Enterprise Software
  enterprise_software: "Enterprise Software",
  cloud_services: "Cloud Services & Infrastructure",
  cybersecurity: "Cybersecurity",
  data_analytics: "Data Analytics & AI",

  // Consumer
  consumer_discretionary: "Consumer Discretionary",
  consumer_staples: "Consumer Staples",
  retail_general: "Retail (General)",
  retail_special: "Retail (Specialty)",

  // Healthcare & Biotech
  healthcare_services: "Healthcare Services",
  medical_equipment: "Medical Equipment",
  biotechnology: "Biotechnology",
  pharmaceuticals: "Pharmaceuticals",

  // Financial Services
  banking: "Banking",
  insurance: "Insurance",
  asset_management: "Asset Management",
  fintech: "Financial Technology",

  // Industrial & Manufacturing
  industrial_general: "Industrial (General)",
  aerospace_defense: "Aerospace & Defense",
  automotive: "Automotive",
  chemicals: "Chemicals",

  // Energy & Resources
  renewable_energy: "Renewable Energy",
  oil_gas: "Oil & Gas",
  mining: "Mining & Minerals",
  utilities: "Utilities",

  // Others
  real_estate: "Real Estate",
  transportation: "Transportation & Logistics",
  media_entertainment: "Media & Entertainment",
  education: "Education Services",
  professional_services: "Professional Services",
  agriculture: "Agriculture & Food",
} as const;

export const valuationFormSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  currency: z.enum(Object.keys(currencies) as [keyof typeof currencies, ...Array<keyof typeof currencies>]),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
  margins: z.number().min(-100).max(100, "Margins must be between -100 and 100"),
  industry: z.enum(Object.keys(industries) as [keyof typeof industries, ...Array<keyof typeof industries>]),
  stage: z.enum(Object.keys(businessStages) as [keyof typeof businessStages, ...Array<keyof typeof businessStages>]),

  // Optional qualitative inputs
  intellectualProperty: z.enum(["none", "pending", "registered"]).optional(),
  teamExperience: z.number().min(0).max(10).optional(),
  customerBase: z.number().min(0).optional(),
  competitiveDifferentiation: z.enum(["low", "medium", "high"]).optional(),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"]).optional(),
  scalability: z.enum(["limited", "moderate", "high"]).optional(),
  assetValue: z.number().min(0).optional(),
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