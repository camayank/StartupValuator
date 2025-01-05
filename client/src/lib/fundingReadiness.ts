import type { ValuationData } from "./validations";

export interface ReadinessScore {
  overallScore: number;
  categories: {
    financial: {
      score: number;
      metrics: {
        revenueGrowth: number;
        margins: number;
        cashRunway: number;
      };
    };
    market: {
      score: number;
      metrics: {
        marketSize: number;
        competitiveLandscape: number;
        growthPotential: number;
      };
    };
    team: {
      score: number;
      metrics: {
        founderExperience: number;
        teamCompleteness: number;
        advisors: number;
      };
    };
    product: {
      score: number;
      metrics: {
        productMaturity: number;
        marketFit: number;
        technicalInnovation: number;
      };
    };
  };
  recommendations: string[];
  targetInvestors: {
    type: string;
    matchScore: number;
    reason: string;
  }[];
}

function calculateCategoryScore(metrics: Record<string, number>): number {
  const values = Object.values(metrics);
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

export function calculateFundingReadiness(data: ValuationData): ReadinessScore {
  // Calculate financial metrics
  const revenueGrowth = Math.min(data.growthRate / 100, 1);
  const margins = Math.max(Math.min(data.margins / 100, 1), 0);
  const cashRunway = 0.7; // Placeholder - could be calculated from burn rate and cash balance

  // Market metrics based on industry and valuation
  const marketSize = data.valuation > 10000000 ? 0.8 : 0.6;
  const competitiveLandscape = 0.7;
  const growthPotential = data.potentialPrediction?.success_probability ?? 0.5;

  // Team metrics from founder profile (if available)
  const founderExperience = 0.8;
  const teamCompleteness = 0.6;
  const advisors = 0.7;

  // Product metrics based on stage
  const productMaturity = {
    seed: 0.3,
    seriesA: 0.6,
    seriesB: 0.8,
    growth: 0.9,
  }[data.stage] ?? 0.5;

  const marketFit = data.riskAssessment?.riskScore ? (100 - data.riskAssessment.riskScore) / 100 : 0.6;
  const technicalInnovation = 0.7;

  // Calculate category scores
  const financial = {
    score: 0,
    metrics: { revenueGrowth, margins, cashRunway },
  };
  financial.score = calculateCategoryScore(financial.metrics);

  const market = {
    score: 0,
    metrics: { marketSize, competitiveLandscape, growthPotential },
  };
  market.score = calculateCategoryScore(market.metrics);

  const team = {
    score: 0,
    metrics: { founderExperience, teamCompleteness, advisors },
  };
  team.score = calculateCategoryScore(team.metrics);

  const product = {
    score: 0,
    metrics: { productMaturity, marketFit, technicalInnovation },
  };
  product.score = calculateCategoryScore(product.metrics);

  // Calculate overall score (weighted average)
  const weights = { financial: 0.3, market: 0.3, team: 0.2, product: 0.2 };
  const overallScore = Math.round(
    (financial.score * weights.financial +
      market.score * weights.market +
      team.score * weights.team +
      product.score * weights.product) *
      100
  );

  // Generate recommendations based on scores
  const recommendations: string[] = [];
  if (financial.score < 0.6) {
    recommendations.push("Focus on improving financial metrics before seeking funding");
  }
  if (market.score < 0.6) {
    recommendations.push("Consider expanding market reach or pivoting to higher-growth segments");
  }
  if (team.score < 0.6) {
    recommendations.push("Strengthen the team by recruiting key roles or adding industry advisors");
  }
  if (product.score < 0.6) {
    recommendations.push("Accelerate product development and gather more customer validation");
  }

  // Determine suitable investors based on stage and scores
  const targetInvestors = [];
  if (overallScore >= 80) {
    targetInvestors.push({
      type: "Tier 1 VC Firms",
      matchScore: 0.9,
      reason: "Strong metrics across all categories indicate readiness for institutional funding",
    });
  } else if (overallScore >= 60) {
    targetInvestors.push({
      type: "Early Stage VC Firms",
      matchScore: 0.8,
      reason: "Good foundation with room for growth, attractive for early-stage investors",
    });
  } else {
    targetInvestors.push({
      type: "Angel Investors",
      matchScore: 0.7,
      reason: "Focus on building core metrics while seeking strategic angel investors",
    });
  }

  return {
    overallScore,
    categories: {
      financial,
      market,
      team,
      product,
    },
    recommendations,
    targetInvestors,
  };
}
