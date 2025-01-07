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

// Enhanced business stages with integrated market validation
export const businessStages = {
  // Pre-revenue stages
  ideation_unvalidated: "Ideation Stage (Concept Only)",
  ideation_validated: "Ideation Stage (Market Validated)",
  mvp_development: "MVP Development",
  mvp_early_traction: "MVP with Early Traction",
  beta_testing: "Beta Testing",

  // Early revenue stages
  revenue_early: "Early Revenue Stage",
  revenue_growing: "Growing Revenue Stage",
  revenue_scaling: "Scaling Revenue Stage",

  // Growth stages
  growth_regional: "Regional Growth",
  growth_national: "National Expansion",
  growth_international: "International Expansion",

  // Mature stages
  mature_stable: "Mature & Stable",
  mature_expanding: "Mature & Expanding",

  // Special situations
  pre_ipo: "Pre-IPO Stage",
  acquisition_target: "Acquisition Target",
  restructuring: "Restructuring",
  turnaround: "Turnaround Stage"
} as const;

// Reorganized industry classifications with sector-subsector structure
export const sectors = {
  technology: {
    name: "Technology",
    subsectors: {
      software_enterprise: "Enterprise Software & Solutions",
      software_consumer: "Consumer Software & Apps",
      cloud_computing: "Cloud Computing & Services",
      ai_ml: "AI & Machine Learning",
      cybersecurity: "Cybersecurity",
      iot_embedded: "IoT & Embedded Systems",
      semiconductors: "Semiconductors & Hardware",
      blockchain: "Blockchain & Crypto",
    }
  },
  healthtech: {
    name: "Healthcare & Life Sciences",
    subsectors: {
      biotech: "Biotechnology",
      medtech: "Medical Devices & Equipment",
      healthtech: "Digital Health & Telemedicine",
      pharma: "Pharmaceuticals",
      diagnostics: "Diagnostics & Testing",
      healthcare_services: "Healthcare Services",
      mental_health: "Mental Health Solutions",
      wellness: "Wellness & Prevention",
    }
  },
  fintech: {
    name: "Financial Technology",
    subsectors: {
      payments: "Payment Solutions",
      lending: "Digital Lending",
      insurtech: "Insurance Technology",
      wealth_management: "Wealth Management Tech",
      regtech: "Regulatory Technology",
      blockchain_finance: "Blockchain Finance",
      banking_tech: "Banking Technology",
      personal_finance: "Personal Finance Solutions",
    }
  },
  ecommerce: {
    name: "E-commerce & Retail",
    subsectors: {
      marketplace: "Online Marketplaces",
      d2c: "Direct-to-Consumer",
      retail_tech: "Retail Technology",
      logistics_fulfillment: "Logistics & Fulfillment",
      subscription_commerce: "Subscription Commerce",
      social_commerce: "Social Commerce",
      omnichannel: "Omnichannel Retail",
      luxury_premium: "Luxury & Premium E-commerce",
    }
  },
  enterprise: {
    name: "Enterprise Solutions",
    subsectors: {
      crm_sales: "CRM & Sales Tools",
      hr_workforce: "HR & Workforce Management",
      erp_systems: "ERP Systems",
      collaboration_tools: "Collaboration & Productivity",
      business_intelligence: "Business Intelligence & Analytics",
      marketing_automation: "Marketing Automation",
      supply_chain: "Supply Chain Solutions",
      customer_service: "Customer Service Solutions",
    }
  },
  deeptech: {
    name: "Deep Technology",
    subsectors: {
      quantum_computing: "Quantum Computing",
      robotics_automation: "Robotics & Automation",
      advanced_materials: "Advanced Materials",
      space_tech: "Space Technology",
      energy_tech: "Energy Technology",
      biocomputing: "Biocomputing",
      nanotech: "Nanotechnology",
      photonics: "Photonics & Optics",
    }
  },
  cleantech: {
    name: "Clean Technology",
    subsectors: {
      renewable_energy: "Renewable Energy",
      energy_storage: "Energy Storage",
      smart_grid: "Smart Grid & Utilities",
      carbon_capture: "Carbon Capture & Offset",
      waste_management: "Waste Management",
      water_tech: "Water Technology",
      sustainable_transport: "Sustainable Transportation",
      green_building: "Green Building Tech",
    }
  },
  consumer_digital: {
    name: "Consumer Digital",
    subsectors: {
      social_media: "Social Media & Networks",
      gaming: "Gaming & Esports",
      streaming_media: "Streaming & Digital Media",
      edtech: "Educational Technology",
      digital_content: "Digital Content & Publishing",
      mobile_apps: "Mobile Applications",
      ar_vr: "AR/VR & Metaverse",
      digital_entertainment: "Digital Entertainment",
    }
  },
  industrial_tech: {
    name: "Industrial Technology",
    subsectors: {
      industry_4_0: "Industry 4.0",
      smart_manufacturing: "Smart Manufacturing",
      industrial_iot: "Industrial IoT",
      predictive_maintenance: "Predictive Maintenance",
      industrial_automation: "Industrial Automation",
      quality_control: "Quality Control & Testing",
      digital_twin: "Digital Twin Technology",
      industrial_safety: "Industrial Safety & Security",
    }
  },
  agritech: {
    name: "Agriculture Technology",
    subsectors: {
      precision_farming: "Precision Farming",
      agri_biotech: "Agricultural Biotechnology",
      smart_farming: "Smart Farming Solutions",
      vertical_farming: "Vertical & Urban Farming",
      food_tech: "Food Technology",
      supply_chain_agri: "Agricultural Supply Chain",
      farm_management: "Farm Management Systems",
      sustainable_agri: "Sustainable Agriculture",
    }
  },
  proptech: {
    name: "Property Technology",
    subsectors: {
      real_estate_platforms: "Real Estate Platforms",
      construction_tech: "Construction Technology",
      property_management: "Property Management Solutions",
      smart_buildings: "Smart Buildings",
      mortgage_tech: "Mortgage Technology",
      co_living_working: "Co-living & Co-working",
      facility_management: "Facility Management",
      real_estate_analytics: "Real Estate Analytics",
    }
  },
  mobility: {
    name: "Mobility & Transportation",
    subsectors: {
      ev_tech: "Electric Vehicle Technology",
      autonomous_vehicles: "Autonomous Vehicles",
      mobility_services: "Mobility Services",
      logistics_tech: "Logistics Technology",
      fleet_management: "Fleet Management",
      urban_mobility: "Urban Mobility Solutions",
      delivery_tech: "Delivery Technology",
      transport_analytics: "Transportation Analytics",
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

// Add industry metrics schema
export const industryMetricsSchema = z.object({
  tam: z.number().min(0, "TAM must be positive"),
  metrics: z.record(z.string(), z.number()),
  benchmarks: z.record(z.string(), z.object({
    low: z.number(),
    median: z.number(),
    high: z.number()
  }))
});

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
  complianceStandard: z.string().optional(),
  intellectualProperty: z.enum(["none", "pending", "registered"]).optional(),
  teamExperience: z.number().min(0).max(20).optional(),
  customerBase: z.number().min(0).optional(),
  competitiveDifferentiation: z.enum(["low", "medium", "high"]).optional(),
  regulatoryCompliance: z.enum(["notRequired", "inProgress", "compliant"]).optional(),
  scalability: z.enum(["limited", "moderate", "high"]).optional(),
  industryMetrics: industryMetricsSchema.optional(),
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