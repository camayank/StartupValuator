import { sectors, regions, type ValuationFormData } from "../../client/src/lib/validations";
import type { SaaSMetrics, EcommerceMetrics, ManufacturingMetrics, HealthcareMetrics, FintechMetrics } from "../../client/src/lib/validation/industryMetrics";

interface ScenarioMultipliers {
  best: number;
  base: number;
  worst: number;
}

// Industry-specific revenue multipliers by region
const revenueMultipliers: Record<string, Record<keyof typeof regions, ScenarioMultipliers>> = {
  // Technology Sector
  software_enterprise: {
    us: { best: 12, base: 10, worst: 8 },
    eu: { best: 10, base: 8, worst: 6 },
    uk: { best: 11, base: 9, worst: 7 },
    india: { best: 8, base: 6, worst: 4 },
    global: { best: 10, base: 8, worst: 6 },
  },
  software_consumer: {
    us: { best: 10, base: 8, worst: 6 },
    eu: { best: 9, base: 7, worst: 5 },
    uk: { best: 9.5, base: 7.5, worst: 5.5 },
    india: { best: 7, base: 5, worst: 3 },
    global: { best: 8, base: 6, worst: 4 },
  },
  cloud_computing: {
    us: { best: 15, base: 12, worst: 9 },
    eu: { best: 13, base: 10, worst: 7 },
    uk: { best: 14, base: 11, worst: 8 },
    india: { best: 10, base: 8, worth: 6 },
    global: { best: 12, base: 9, worst: 7 },
  },
  ai_ml: {
    us: { best: 18, base: 15, worst: 12 },
    eu: { best: 16, base: 13, worst: 10 },
    uk: { best: 17, base: 14, worst: 11 },
    india: { best: 14, base: 11, worst: 8 },
    global: { best: 15, base: 12, worst: 9 },
  },
  // Healthcare Sector
  biotech: {
    us: { best: 14, base: 11, worst: 8 },
    eu: { best: 12, base: 9, worst: 6 },
    uk: { best: 13, base: 10, worst: 7 },
    india: { best: 10, base: 7, worst: 4 },
    global: { best: 11, base: 8, worst: 5 },
  },
  medtech: {
    us: { best: 12, base: 9, worst: 6 },
    eu: { best: 10, base: 7, worst: 4 },
    uk: { best: 11, base: 8, worst: 5 },
    india: { best: 8, base: 5, worst: 2 },
    global: { best: 9, base: 6, worst: 3 },
  },
  // Fintech Sector
  payments: {
    us: { best: 16, base: 13, worst: 10 },
    eu: { best: 14, base: 11, worst: 8 },
    uk: { best: 15, base: 12, worst: 9 },
    india: { best: 12, base: 9, worst: 6 },
    global: { best: 13, base: 10, worst: 7 },
  },
  // Add multipliers for other sectors...
};

// Terminal growth rates by industry and stage
const terminalGrowthRates: Record<string, Record<string, number>> = {
  // Technology
  software_enterprise: {
    early: 0.04,
    growth: 0.035,
    mature: 0.03
  },
  cloud_computing: {
    early: 0.045,
    growth: 0.04,
    mature: 0.035
  },
  ai_ml: {
    early: 0.05,
    growth: 0.045,
    mature: 0.04
  },
  // Healthcare
  biotech: {
    early: 0.035,
    growth: 0.03,
    mature: 0.025
  },
  medtech: {
    early: 0.03,
    growth: 0.025,
    mature: 0.02
  },
  // Manufacturing
  smart_manufacturing: {
    early: 0.025,
    growth: 0.02,
    mature: 0.015
  },
  // Add more industries...
};

interface RiskAdjustment {
  operationalRisk: number;
  marketRisk: number;
  regulatoryRisk: number;
}

// Calculate risk-adjusted discount rate based on industry, stage, and risk factors
function calculateRiskAdjustedRate(
  baseRate: number,
  riskFactors: RiskAdjustment,
  stage: string,
  teamExperience: number,
  industry: string
): number {
  let riskPremium = 0;

  // Industry-specific risk adjustments
  const industryRiskPremiums: Record<string, number> = {
    biotech: 0.03,
    medtech: 0.025,
    ai_ml: 0.035,
    blockchain: 0.04,
    software_enterprise: 0.02,
    payments: 0.025,
    // Add more industries...
  };

  // Add industry-specific premium
  riskPremium += industryRiskPremiums[industry] || 0.02;

  // Operational risk adjustment
  riskPremium += riskFactors.operationalRisk * 0.02; // 2% per risk level

  // Market risk adjustment
  riskPremium += riskFactors.marketRisk * 0.015; // 1.5% per risk level

  // Regulatory risk adjustment
  riskPremium += riskFactors.regulatoryRisk * 0.01; // 1% per risk level

  // Stage-based adjustment
  if (stage.includes('ideation')) {
    riskPremium += 0.05; // Additional 5% for early stage
  } else if (stage.includes('growth')) {
    riskPremium += 0.03; // 3% for growth stage
  }

  // Team experience adjustment
  riskPremium -= Math.min(teamExperience * 0.005, 0.03); // Up to 3% reduction for experienced teams

  return baseRate + riskPremium;
}

// Calculate terminal value with industry-specific factors
function calculateTerminalValue(
  finalYearCashFlow: number,
  industry: string,
  stage: string,
  discountRate: number
): number {
  // Get the appropriate growth rate based on industry and stage
  let stageCategory = 'mature';
  if (stage.includes('ideation') || stage.includes('mvp')) {
    stageCategory = 'early';
  } else if (stage.includes('growth') || stage.includes('scaling')) {
    stageCategory = 'growth';
  }

  const growthRate = terminalGrowthRates[industry]?.[stageCategory] || 0.02; // Default to 2% if not found
  return finalYearCashFlow * (1 + growthRate) / (discountRate - growthRate);
}

// Generate financial projections with scenario analysis
interface ProjectionScenario {
  revenue: number[];
  ebitda: number[];
  cashFlow: number[];
  terminalValue: number;
  metrics: {
    revenueGrowth: number[];
    ebitdaMargin: number[];
    cashFlowConversion: number[];
  };
}

interface ProjectionSet {
  best: ProjectionScenario;
  base: ProjectionScenario;
  worst: ProjectionScenario;
}

export function generateProjections(
  data: ValuationFormData,
  industryMetrics: SaaSMetrics | EcommerceMetrics | ManufacturingMetrics | HealthcareMetrics | FintechMetrics
): ProjectionSet {
  const projectionYears = 5;
  const baseDiscountRate = regions[data.region].riskFreeRate + 0.06; // Base rate + market premium

  // Initialize scenarios
  const scenarios: ProjectionSet = {
    best: {
      revenue: [],
      ebitda: [],
      cashFlow: [],
      terminalValue: 0,
      metrics: {
        revenueGrowth: [],
        ebitdaMargin: [],
        cashFlowConversion: [],
      }
    },
    base: {
      revenue: [],
      ebitda: [],
      cashFlow: [],
      terminalValue: 0,
      metrics: {
        revenueGrowth: [],
        ebitdaMargin: [],
        cashFlowConversion: [],
      }
    },
    worst: {
      revenue: [],
      ebitda: [],
      cashFlow: [],
      terminalValue: 0,
      metrics: {
        revenueGrowth: [],
        ebitdaMargin: [],
        cashFlowConversion: [],
      }
    }
  };

  // Industry-specific growth rates
  const growthRates = {
    best: data.growthRate * 1.2,
    base: data.growthRate,
    worst: Math.max(data.growthRate * 0.8, -10) // Floor at -10%
  };

  // Calculate projections for each scenario
  Object.entries(scenarios).forEach(([scenario, projection]) => {
    let currentRevenue = data.revenue;
    const growth = growthRates[scenario as keyof typeof growthRates];

    // Calculate risk-adjusted discount rate for the scenario
    const riskAdjustedRate = calculateRiskAdjustedRate(
      baseDiscountRate,
      {
        operationalRisk: scenario === 'worst' ? 3 : scenario === 'base' ? 2 : 1,
        marketRisk: scenario === 'worst' ? 3 : scenario === 'base' ? 2 : 1,
        regulatoryRisk: scenario === 'worst' ? 3 : scenario === 'base' ? 2 : 1
      },
      data.stage,
      data.teamExperience || 0,
      data.industry
    );

    // Generate yearly projections
    for (let year = 0; year < projectionYears; year++) {
      projection.revenue.push(currentRevenue);

      // Calculate EBITDA based on industry metrics and margins
      const ebitdaMargin = calculateEBITDAMargin(data.industry, industryMetrics, scenario as keyof ProjectionSet);
      projection.ebitda.push(currentRevenue * ebitdaMargin);

      // Calculate cash flow (simplified)
      const cashFlowMargin = ebitdaMargin * 0.8; // Assume 80% of EBITDA converts to cash
      projection.cashFlow.push(currentRevenue * cashFlowMargin);

      // Store metrics
      if (year > 0) {
        projection.metrics.revenueGrowth.push((currentRevenue / projection.revenue[year - 1] - 1) * 100);
      }
      projection.metrics.ebitdaMargin.push(ebitdaMargin * 100);
      projection.metrics.cashFlowConversion.push(cashFlowMargin / ebitdaMargin * 100);

      // Update revenue for next year
      currentRevenue *= (1 + growth / 100);
    }

    // Calculate terminal value
    projection.terminalValue = calculateTerminalValue(
      projection.cashFlow[projectionYears - 1],
      data.industry,
      data.stage,
      riskAdjustedRate
    );
  });

  return scenarios;
}

// Helper function to calculate EBITDA margin based on industry metrics
function calculateEBITDAMargin(
  industry: string,
  metrics: any,
  scenario: keyof ProjectionSet
): number {
  // Industry-specific margin calculations
  switch (true) {
    case industry.includes('software') || industry.includes('cloud'):
      return calculateSaaSEBITDAMargin(metrics, scenario);
    case industry.includes('commerce') || industry.includes('retail'):
      return calculateEcommerceEBITDAMargin(metrics, scenario);
    case industry.includes('manufacturing'):
      return calculateManufacturingEBITDAMargin(metrics, scenario);
    case industry.includes('health'):
      return calculateHealthcareEBITDAMargin(metrics, scenario);
    case industry.includes('fintech') || industry.includes('payment'):
      return calculateFintechEBITDAMargin(metrics, scenario);
    default:
      return scenario === 'best' ? 0.25 : scenario === 'base' ? 0.2 : 0.15;
  }
}

function calculateSaaSEBITDAMargin(metrics: SaaSMetrics, scenario: keyof ProjectionSet): number {
  const baseMargin = metrics.arr > 0 ? 
    (metrics.mrr * 12 - metrics.cac) / metrics.arr : 0.2;

  return scenario === 'best' ? baseMargin * 1.2 :
         scenario === 'base' ? baseMargin :
         baseMargin * 0.8;
}

function calculateEcommerceEBITDAMargin(metrics: EcommerceMetrics, scenario: keyof ProjectionSet): number {
  const baseMargin = (metrics.aov * (metrics.conversionRate / 100)) / 
    (1 + metrics.cartAbandonmentRate / 100);

  return scenario === 'best' ? baseMargin * 1.15 :
         scenario === 'base' ? baseMargin :
         baseMargin * 0.85;
}

function calculateManufacturingEBITDAMargin(metrics: ManufacturingMetrics, scenario: keyof ProjectionSet): number {
  const baseMargin = ((metrics.productionEfficiency / 100) * 
    (1 - metrics.variableCosts / (metrics.fixedCosts + metrics.variableCosts)));

  return scenario === 'best' ? baseMargin * 1.1 :
         scenario === 'base' ? baseMargin :
         baseMargin * 0.9;
}

function calculateHealthcareEBITDAMargin(metrics: HealthcareMetrics, scenario: keyof ProjectionSet): number {
  // Healthcare margins are heavily influenced by R&D spending and pipeline progress
  const baseMargin = metrics.pipelineProgress / 100 * 0.3; // Max 30% margin at full pipeline progress

  return scenario === 'best' ? baseMargin * 1.25 :
         scenario === 'base' ? baseMargin :
         baseMargin * 0.75;
}

function calculateFintechEBITDAMargin(metrics: FintechMetrics, scenario: keyof ProjectionSet): number {
  // Fintech margins based on transaction economics
  const baseMargin = (metrics.avgTransactionValue * metrics.transactionVolume -
    metrics.userAcquisitionCost * metrics.activeUsers) /
    (metrics.avgTransactionValue * metrics.transactionVolume);

  return scenario === 'best' ? baseMargin * 1.2 :
         scenario === 'base' ? baseMargin :
         baseMargin * 0.8;
}