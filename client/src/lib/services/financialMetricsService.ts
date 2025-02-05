import { ValuationFormData } from "../validations";

export interface FinancialMetrics {
  revenue: {
    arr: number;
    mrr: number;
    growthRate: number;
  };
  ratios: {
    cac: number;
    ltv: number;
    ltvCacRatio: number;
    burnRate: number;
    runway: number;
  };
  market: {
    tam: number;
    sam: number;
    som: number;
    penetrationRate: number;
  };
  efficiency: {
    grossMargin: number;
    operatingMargin: number;
    cashEfficiencyScore: number;
  };
}

export function calculateFinancialMetrics(data: ValuationFormData): FinancialMetrics {
  // Extract financial data from the form
  const financialData = data.financialData || {
    revenue: 0,
    cac: 0,
    ltv: 0,
    burnRate: 0,
    runway: 0,
  };

  const marketData = data.marketData || {
    tam: 0,
    sam: 0,
    som: 0,
    growthRate: 0,
  };

  // Calculate revenue metrics
  const arr = financialData.revenue;
  const mrr = arr / 12;
  const growthRate = marketData.growthRate;

  // Calculate key ratios
  const ltvCacRatio = financialData.ltv / (financialData.cac || 1); // Avoid division by zero
  
  // Calculate market metrics
  const penetrationRate = (marketData.som / (marketData.tam || 1)) * 100;

  // Calculate efficiency metrics
  const grossMargin = 0.65; // Default assumption if not provided
  const operatingMargin = 0.15; // Default assumption if not provided
  const cashEfficiencyScore = calculateCashEfficiencyScore(financialData);

  return {
    revenue: {
      arr,
      mrr,
      growthRate,
    },
    ratios: {
      cac: financialData.cac,
      ltv: financialData.ltv,
      ltvCacRatio,
      burnRate: financialData.burnRate,
      runway: financialData.runway,
    },
    market: {
      tam: marketData.tam,
      sam: marketData.sam,
      som: marketData.som,
      penetrationRate,
    },
    efficiency: {
      grossMargin,
      operatingMargin,
      cashEfficiencyScore,
    },
  };
}

function calculateCashEfficiencyScore(financialData: {
  burnRate: number;
  revenue: number;
  runway: number;
}): number {
  // Calculate a score from 0-100 based on burn rate efficiency
  const revenueRunwayRatio = financialData.revenue / (financialData.burnRate || 1);
  const runwayScore = Math.min(financialData.runway / 18, 1); // Normalize runway, target is 18 months
  
  // Weight the components
  const score = (revenueRunwayRatio * 0.6 + runwayScore * 0.4) * 100;
  
  // Ensure the score is between 0 and 100
  return Math.min(Math.max(score, 0), 100);
}

export function getMetricsInsights(metrics: FinancialMetrics): string[] {
  const insights: string[] = [];

  // Revenue insights
  if (metrics.revenue.growthRate > 100) {
    insights.push("High growth rate indicates strong market traction");
  } else if (metrics.revenue.growthRate < 0) {
    insights.push("Negative growth rate requires immediate attention");
  }

  // LTV/CAC insights
  if (metrics.ratios.ltvCacRatio < 3) {
    insights.push("LTV/CAC ratio below target (3x) - optimize customer acquisition");
  } else if (metrics.ratios.ltvCacRatio > 5) {
    insights.push("Strong LTV/CAC ratio - consider scaling acquisition efforts");
  }

  // Runway insights
  if (metrics.ratios.runway < 6) {
    insights.push("Critical: Runway below 6 months - immediate funding needed");
  } else if (metrics.ratios.runway < 12) {
    insights.push("Consider fundraising - runway below 12 months");
  }

  // Market penetration insights
  if (metrics.market.penetrationRate < 1) {
    insights.push("Low market penetration indicates growth potential");
  } else if (metrics.market.penetrationRate > 10) {
    insights.push("Strong market position - consider expansion strategies");
  }

  // Efficiency insights
  if (metrics.efficiency.cashEfficiencyScore < 40) {
    insights.push("Low cash efficiency - optimize burn rate and revenue growth");
  } else if (metrics.efficiency.cashEfficiencyScore > 80) {
    insights.push("Excellent cash efficiency - maintain current practices");
  }

  return insights;
}
