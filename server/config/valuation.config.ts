/**
 * Valuation Configuration
 * Centralized configuration for all valuation methods
 */

import {
  VALUATION_BENCHMARKS,
  DISCOUNT_RATES,
  TERMINAL_GROWTH_RATES,
  TAX_RATES,
  FINANCIAL_BENCHMARKS,
  SCORECARD_WEIGHTS,
} from '../utils/constants';

export const valuationConfig = {
  // DCF Configuration
  dcf: {
    minProjectionYears: 3,
    maxProjectionYears: 10,
    defaultProjectionYears: 5,
    discountRates: DISCOUNT_RATES,
    terminalGrowthRates: TERMINAL_GROWTH_RATES,
    taxRate: TAX_RATES.STARTUP_TAX,
    assumptions: {
      capexPercentageOfRevenue: 5,
      nwcChangePercentageOfRevenue: 2,
      depreciationPercentageOfRevenue: 3,
    },
  },

  // Berkus Method Configuration
  berkus: {
    baseValue: VALUATION_BENCHMARKS.PRE_REVENUE_BASE,
    maxValuePerFactor: VALUATION_BENCHMARKS.BERKUS_FACTOR,
    factors: {
      soundIdea: {
        min: 0,
        max: 10,
        weight: 1.0,
      },
      prototype: {
        value: VALUATION_BENCHMARKS.BERKUS_FACTOR,
      },
      qualityManagementTeam: {
        min: 0,
        max: 10,
        weight: 1.0,
      },
      strategicRelationships: {
        min: 0,
        max: 10,
        weight: 1.0,
      },
      productRolloutOrSales: {
        min: 0,
        max: 10,
        weight: 1.0,
      },
    },
  },

  // Scorecard Method Configuration
  scorecard: {
    defaultWeights: SCORECARD_WEIGHTS,
    sectorBaselines: VALUATION_BENCHMARKS.SECTOR_BASELINES,
    stageBaselines: {
      pre_seed: {
        fintech: 25000000,
        saas: 22000000,
        healthtech: 20000000,
        edtech: 18000000,
        ecommerce: 15000000,
        default: 20000000,
      },
      seed: {
        fintech: 60000000,
        saas: 55000000,
        healthtech: 50000000,
        edtech: 45000000,
        ecommerce: 40000000,
        default: 50000000,
      },
      series_a: {
        fintech: 200000000,
        saas: 180000000,
        healthtech: 150000000,
        edtech: 130000000,
        ecommerce: 120000000,
        default: 150000000,
      },
    },
  },

  // Risk Factor Summation Configuration
  riskSummation: {
    adjustmentPerLevel: VALUATION_BENCHMARKS.RISK_ADJUSTMENT,
    neutralLevel: 3, // 1-5 scale, 3 is neutral
    factors: [
      'managementRisk',
      'stageOfBusiness',
      'legislationRisk',
      'manufacturingRisk',
      'salesMarketingRisk',
      'fundingRisk',
      'competitionRisk',
      'technologyRisk',
      'litigationRisk',
      'internationalRisk',
      'reputationRisk',
      'potentialLucrative',
    ],
  },

  // Comparable Company Analysis Configuration
  comparable: {
    revenueMultiples: VALUATION_BENCHMARKS.REVENUE_MULTIPLES,
    minComparables: 3,
    idealComparables: 5,
    maxComparables: 20,
    growthAdjustment: {
      enabled: true,
      maxMultiplier: 2.0,
      minMultiplier: 0.5,
    },
  },

  // Hybrid Valuation Configuration
  hybrid: {
    stageWeights: {
      ideation: {
        berkus: 0.40,
        scorecard: 0.35,
        riskSummation: 0.25,
      },
      mvp: {
        berkus: 0.35,
        scorecard: 0.30,
        riskSummation: 0.20,
        comparable: 0.15,
      },
      pre_revenue: {
        berkus: 0.30,
        scorecard: 0.30,
        riskSummation: 0.20,
        comparable: 0.20,
      },
      revenue: {
        dcf: 0.40,
        scorecard: 0.20,
        comparable: 0.25,
        riskSummation: 0.15,
      },
      growth: {
        dcf: 0.50,
        comparable: 0.35,
        riskSummation: 0.15,
      },
      expansion: {
        dcf: 0.60,
        comparable: 0.40,
      },
    },
    confidenceBonus: {
      twoMethods: 5,
      threeMethods: 7,
      fourPlusMethods: 10,
    },
    consistencyThresholds: {
      high: 0.2, // <20% variance
      medium: 0.5, // <50% variance
      low: 0.5, // >50% variance
    },
  },

  // Investment Readiness Configuration
  readiness: {
    scoringWeights: {
      financialHealth: 25,
      marketOpportunity: 20,
      teamStrength: 20,
      tractionExecution: 20,
      governanceCompliance: 15,
    },
    benchmarks: FINANCIAL_BENCHMARKS,
    redFlagThresholds: {
      cashRunwayCritical: 6, // months
      debtToEquityHigh: 2.0,
      customerConcentrationHigh: 0.5, // 50% from top 5
    },
  },

  // Confidence Scoring Configuration
  confidence: {
    baseScore: 75,
    dataQuality: {
      excellentData: 10,
      goodData: 5,
      limitedData: -10,
      poorData: -20,
    },
    methodAlignment: {
      highAlignment: 10,
      moderateAlignment: 5,
      lowAlignment: -10,
    },
  },

  // Scenario Analysis Configuration
  scenarios: {
    conservative: {
      discountRateAdjustment: 5, // +5%
      growthRateMultiplier: 0.7, // 70% of base
      terminalGrowthAdjustment: -1, // -1%
    },
    optimistic: {
      discountRateAdjustment: -5, // -5%
      growthRateMultiplier: 1.3, // 130% of base
      terminalGrowthAdjustment: 1, // +1%
    },
  },
};

export type ValuationConfig = typeof valuationConfig;

export default valuationConfig;
