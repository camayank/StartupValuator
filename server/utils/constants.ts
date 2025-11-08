/**
 * Constants for Indian startup valuation platform
 */

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
] as const;

// Major Indian Cities
export const TIER_1_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'
] as const;

// Industry Sectors
export const INDIAN_SECTORS = [
  'fintech', 'healthtech', 'edtech', 'agritech', 'saas',
  'ecommerce', 'logistics', 'food_delivery', 'mobility',
  'real_estate', 'cleantech', 'ai_ml', 'blockchain',
  'iot', 'manufacturing', 'retail', 'media', 'entertainment',
  'travel', 'hospitality', 'consulting', 'other'
] as const;

// Funding Stages
export const FUNDING_STAGES = [
  'bootstrap', 'pre_seed', 'seed', 'series_a', 'series_b',
  'series_c', 'series_d', 'later'
] as const;

// Business Stages
export const BUSINESS_STAGES = [
  'ideation', 'mvp', 'pre_revenue', 'revenue', 'growth', 'expansion'
] as const;

// Valuation Methods
export const VALUATION_METHODS = [
  'dcf', 'berkus', 'scorecard', 'risk_summation', 'comparable', 'hybrid'
] as const;

// Indian Tax Rates
export const TAX_RATES = {
  CORPORATE_TAX: 25, // Standard corporate tax rate
  STARTUP_TAX: 22, // For startups incorporated after Oct 2019
  DIVIDEND_DISTRIBUTION_TAX: 0, // Abolished from April 2020
  GST_STANDARD: 18,
  GST_REDUCED: 5,
} as const;

// Valuation Benchmarks (in INR)
export const VALUATION_BENCHMARKS = {
  PRE_REVENUE_BASE: 20000000, // ₹2 crore
  BERKUS_FACTOR: 5000000, // ₹50 lakhs per factor
  RISK_ADJUSTMENT: 125000, // ₹1.25 lakhs per risk level

  // Sector-specific pre-seed valuations
  SECTOR_BASELINES: {
    fintech: 25000000,
    saas: 22000000,
    healthtech: 20000000,
    edtech: 18000000,
    ecommerce: 15000000,
    default: 20000000,
  },

  // Revenue multiples by sector
  REVENUE_MULTIPLES: {
    saas: { min: 8, max: 15 },
    fintech: { min: 6, max: 10 },
    healthtech: { min: 5, max: 8 },
    ecommerce: { min: 2, max: 4 },
    default: { min: 3, max: 6 },
  },
} as const;

// Discount Rates
export const DISCOUNT_RATES = {
  MIN: 10,
  MAX: 50,
  EARLY_STAGE: 40, // Pre-revenue, seed
  GROWTH_STAGE: 30, // Series A, B
  MATURE_STAGE: 25, // Series C+
} as const;

// Growth Rates
export const TERMINAL_GROWTH_RATES = {
  MIN: 0,
  MAX: 10,
  CONSERVATIVE: 2.5,
  MODERATE: 3.5,
  OPTIMISTIC: 5.0,
} as const;

// Investment Readiness Thresholds
export const READINESS_THRESHOLDS = {
  HIGHLY_READY: 80,
  READY: 65,
  MODERATE: 50,
  NEEDS_IMPROVEMENT: 35,
} as const;

// Red Flag Severities
export const RED_FLAG_SEVERITIES = {
  HIGH: ['cash_runway_critical', 'high_debt', 'compliance_missing', 'fraud_indicators'],
  MEDIUM: ['solo_founder', 'no_professional_presence', 'fragmented_cap_table'],
  LOW: ['no_dpiit', 'limited_documentation', 'incomplete_profile'],
} as const;

// Financial Metrics Benchmarks
export const FINANCIAL_BENCHMARKS = {
  EXCELLENT_GROWTH: 100, // 100%+ YoY
  GOOD_GROWTH: 50,
  MODERATE_GROWTH: 30,

  EXCELLENT_MARGIN: 70, // 70%+ gross margin
  GOOD_MARGIN: 50,
  MODERATE_MARGIN: 30,

  EXCELLENT_LTV_CAC: 5, // 5:1 ratio
  GOOD_LTV_CAC: 3,
  MINIMUM_LTV_CAC: 1.5,

  EXCELLENT_RUNWAY: 24, // months
  GOOD_RUNWAY: 18,
  MINIMUM_RUNWAY: 6,
} as const;

// Scorecard Weights
export const SCORECARD_WEIGHTS = {
  strengthOfTeam: 0.30,
  sizeOfOpportunity: 0.25,
  productTechnology: 0.15,
  competitiveEnvironment: 0.10,
  marketingChannels: 0.10,
  needForAdditionalFunding: 0.05,
  other: 0.05,
} as const;

// Export types
export type IndianState = typeof INDIAN_STATES[number];
export type IndianSector = typeof INDIAN_SECTORS[number];
export type FundingStage = typeof FUNDING_STAGES[number];
export type BusinessStage = typeof BUSINESS_STAGES[number];
export type ValuationMethod = typeof VALUATION_METHODS[number];
