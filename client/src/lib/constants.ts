export const productStages = {
  concept: "Concept/Idea Stage",
  prototype: "Prototype/MVP",
  beta: "Beta Testing",
  market_ready: "Market Ready",
  scaling: "Scaling",
  established: "Established",
  next_gen: "Next Generation"
} as const;

export const businessModels = {
  subscription: "Subscription (SaaS)",
  marketplace: "Marketplace/Platform",
  ecommerce: "E-commerce",
  advertising: "Advertising",
  licensing: "Licensing/IP",
  service: "Service-based",
  hardware: "Hardware/IoT",
  consulting: "Consulting"
} as const;

export const sectors = {
  enterprise: "Enterprise Software",
  technology: "Technology & Innovation",
  healthtech: "Healthcare Technology",
  fintech: "Financial Technology",
  ecommerce: "E-commerce",
  deeptech: "Deep Technology",
  cleantech: "Clean Technology",
  consumer_digital: "Consumer Digital",
  industrial_tech: "Industrial Technology",
  agritech: "Agricultural Technology",
  proptech: "Property Technology",
  mobility: "Mobility & Transportation"
} as const;

// Currency definitions
export const currencies = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  INR: { symbol: "₹", name: "Indian Rupee" }
} as const;

// Financial constants for calculations
export const FINANCIAL_CONSTANTS = {
  MIN_DISCOUNT_RATE: 0,
  MAX_DISCOUNT_RATE: 100,
  DEFAULT_RISK_FREE_RATE: 3.5,
  DEFAULT_MARKET_RISK_PREMIUM: 5.5,
  DEFAULT_BETA: 1.0,
  MIN_GROWTH_RATE: -20,
  MAX_GROWTH_RATE: 100,
  MAX_PROJECTION_YEARS: 10
} as const;

// Added common business risks
export const businessRisks = {
  market: [
    "Market Competition",
    "Market Size Uncertainty",
    "Regulatory Changes",
    "Economic Downturn"
  ],
  operational: [
    "Technical Implementation",
    "Scalability Issues",
    "Resource Constraints",
    "Supply Chain"
  ],
  financial: [
    "Cash Flow",
    "Cost Overruns",
    "Revenue Model",
    "Funding Gaps"
  ],
  team: [
    "Key Person Dependency",
    "Hiring Challenges",
    "Team Expertise",
    "Management Experience"
  ]
} as const;

// Added fund utilization categories
export const fundUtilizationOptions = {
  product: [
    "Product Development",
    "Technology Infrastructure",
    "Research & Development",
    "User Experience Enhancement"
  ],
  marketing: [
    "Marketing & Advertising",
    "Brand Development",
    "Market Expansion",
    "Customer Acquisition"
  ],
  operations: [
    "Team Expansion",
    "Office Space",
    "Equipment & Tools",
    "Training & Development"
  ],
  growth: [
    "Geographic Expansion",
    "New Market Entry",
    "Partnership Development",
    "Acquisition Strategy"
  ]
} as const;

// Market size multipliers for rough estimates
export const marketSizeMultipliers = {
  enterprise: { tam: 1000000000, samPercent: 0.2, somPercent: 0.05 },
  technology: { tam: 800000000, samPercent: 0.15, somPercent: 0.03 },
  healthtech: { tam: 1200000000, samPercent: 0.1, somPercent: 0.02 },
  fintech: { tam: 900000000, samPercent: 0.12, somPercent: 0.025 }
} as const;

// Growth rate estimates by stage
export const growthRateEstimates = {
  concept: { min: 80, max: 150 },
  prototype: { min: 60, max: 120 },
  beta: { min: 40, max: 100 },
  market_ready: { min: 30, max: 80 },
  scaling: { min: 20, max: 60 },
  established: { min: 10, max: 40 },
  next_gen: { min: 15, max: 50 }
} as const;