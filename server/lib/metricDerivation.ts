import { sectors, regions, type ValuationFormData } from "../../client/src/lib/validations";
import type { SaaSMetrics, EcommerceMetrics, ManufacturingMetrics, HealthcareMetrics, FintechMetrics } from "../../client/src/lib/validation/industryMetrics";

interface ScenarioMultipliers {
  best: number;
  base: number;
  worst: number;
}

// Industry-specific revenue multipliers by region
const revenueMultipliers: Record<string, Record<keyof typeof regions, ScenarioMultipliers>> = {
  software_enterprise: {
    us: { best: 12, base: 10, worst: 8 },
    eu: { best: 10, base: 8, worst: 6 },
    uk: { best: 11, base: 9, worst: 7 },
    india: { best: 8, base: 6, worst: 4 },
    global: { best: 10, base: 8, worst: 6 },
  },
  cloud_computing: {
    us: { best: 15, base: 12, worst: 9 },
    eu: { best: 13, base: 10, worst: 7 },
    uk: { best: 14, base: 11, worst: 8 },
    india: { best: 10, base: 8, worst: 6 },
    global: { best: 12, base: 9, worst: 7 },
  },
  // Add more industry multipliers...
};

// Terminal growth rates by industry
const terminalGrowthRates: Record<string, number> = {
  software_enterprise: 0.04,
  cloud_computing: 0.035,
  marketplace: 0.03,
  smart_manufacturing: 0.02,
  biotech: 0.035,
  payments: 0.03,
  // Add more industries...
};

interface RiskAdjustment {
  operationalRisk: number;
  marketRisk: number;
  regulatoryRisk: number;
}

// Calculate risk-adjusted discount rate
function calculateRiskAdjustedRate(
  baseRate: number,
  riskFactors: RiskAdjustment,
  stage: string,
  teamExperience: number
): number {
  let riskPremium = 0;

  // Operational risk adjustment
  riskPremium += riskFactors.operationalRisk * 0.02; // 2% per risk level

  // Market risk adjustment
  riskPremium += riskFactors.marketRisk * 0.015; // 1.5% per risk level

  // Regulatory risk adjustment
  riskPremium += riskFactors.regulatoryRisk * 0.01; // 1% per risk level

  // Stage-based adjustment
  if (stage.includes('ideation')) {
    riskPremium += 0.05; // Additional 5% for early stage
  }

  // Team experience adjustment
  riskPremium -= Math.min(teamExperience * 0.005, 0.03); // Up to 3% reduction for experienced teams

  return baseRate + riskPremium;
}

// Calculate terminal value
function calculateTerminalValue(
  finalYearCashFlow: number,
  industry: string,
  discountRate: number
): number {
  const growthRate = terminalGrowthRates[industry] || 0.02; // Default to 2% if industry not found
  return finalYearCashFlow * (1 + growthRate) / (discountRate - growthRate);
}

// Generate financial projections
interface ProjectionScenario {
  revenue: number[];
  ebitda: number[];
  cashFlow: number[];
  terminalValue: number;
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
    best: { revenue: [], ebitda: [], cashFlow: [], terminalValue: 0 },
    base: { revenue: [], ebitda: [], cashFlow: [], terminalValue: 0 },
    worst: { revenue: [], ebitda: [], cashFlow: [], terminalValue: 0 }
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
      data.teamExperience || 0
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
      
      // Update revenue for next year
      currentRevenue *= (1 + growth / 100);
    }

    // Calculate terminal value
    projection.terminalValue = calculateTerminalValue(
      projection.cashFlow[projectionYears - 1],
      data.industry,
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
  switch (industry) {
    case 'software_enterprise':
    case 'cloud_computing':
      return calculateSaaSEBITDAMargin(metrics, scenario);
    case 'marketplace':
    case 'd2c':
      return calculateEcommerceEBITDAMargin(metrics, scenario);
    case 'smart_manufacturing':
      return calculateManufacturingEBITDAMargin(metrics, scenario);
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
