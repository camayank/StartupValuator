import { type ValuationFormData } from "../../client/src/lib/validations";
import { getCachedMarketSentiment } from "../lib/marketSentiment";
import { calculateFinancialAssumptions, validateAndAdjustAssumptions, suggestAssumptions, type FinancialAssumptions } from "../lib/financialAssumptions";
import { frameworks, type FrameworkId, validateFrameworkCompliance } from "../lib/compliance/frameworks";
import { db } from "@db";
import { valuations, userActivities } from "@db/schema";
import { eq } from "drizzle-orm";

export interface ValuationInsights {
  financialAssumptions: FinancialAssumptions;
  warnings: string[];
  suggestions: Partial<ValuationFormData>;
  marketSentiment: {
    overallScore: number;
    insights: string[];
    riskFactors: string[];
    opportunities: string[];
  };
  compliance: {
    framework: FrameworkId;
    requirements: Array<{
      name: string;
      status: 'pass' | 'fail';
      details: string[];
    }>;
    recommendations: string[];
  };
  peerAnalysis: {
    comparableFirms: Array<{
      name: string;
      similarity: number;
      metrics: Record<string, number>;
    }>;
    industryAverages: Record<string, number>;
  };
  aiEnhancedMetrics: {
    growthPotential: number;
    marketFit: number;
    competitiveAdvantage: number;
    executionRisk: number;
    overallConfidence: number;
  };
}

export async function generateValuationInsights(data: ValuationFormData): Promise<ValuationInsights> {
  // Get market sentiment data with enhanced caching
  const sentiment = await getCachedMarketSentiment(data);

  // Validate and adjust assumptions with AI
  const { assumptions, warnings } = validateAndAdjustAssumptions(data);

  // Generate AI-driven suggestions for missing data
  const suggestions = suggestAssumptions(data);

  // Enhanced AI metrics calculation
  const aiMetrics = {
    growthPotential: calculateGrowthPotential(data, sentiment),
    marketFit: assessMarketFit(data, sentiment),
    competitiveAdvantage: evaluateCompetitiveAdvantage(data),
    executionRisk: calculateExecutionRisk(data),
    overallConfidence: 0, // Will be calculated below
  };

  // Calculate overall confidence score
  aiMetrics.overallConfidence = (
    aiMetrics.growthPotential * 0.3 +
    aiMetrics.marketFit * 0.3 +
    aiMetrics.competitiveAdvantage * 0.25 +
    (1 - aiMetrics.executionRisk) * 0.15
  );

  // Determine appropriate compliance framework
  let frameworkId: FrameworkId = 'ivs'; // Default to IVS
  if (data.region.toLowerCase() === 'us') {
    frameworkId = '409a';
  } else if (data.region.toLowerCase() === 'india') {
    frameworkId = 'icai';
  }

  const framework = frameworks[frameworkId];
  const complianceResults = validateFrameworkCompliance(framework, data);

  // Transform compliance results into user-friendly format
  const compliance = {
    framework: frameworkId,
    requirements: complianceResults.map(result => ({
      name: result.requirement.name,
      status: result.errors.length === 0 ? 'pass' : 'fail' as 'pass' | 'fail',
      details: result.errors
    })),
    recommendations: complianceResults
      .filter(r => r.errors.length > 0)
      .map(r => `Update ${r.requirement.name.toLowerCase()} information to meet ${frameworkId.toUpperCase()} requirements`)
  };

  // Extract enhanced peer analysis from market sentiment
  const peerAnalysis = {
    comparableFirms: enrichPeerAnalysis(sentiment.peerComparison?.companies ?? []),
    industryAverages: {
      revenueMultiple: sentiment.peerComparison?.averages.revenueMultiple ?? 0,
      growthRate: sentiment.peerComparison?.averages.growthRate ?? 0,
      margins: sentiment.peerComparison?.averages.margins ?? 0,
      marketShare: sentiment.peerComparison?.averages.marketShare ?? 0,
      customerAcquisitionCost: sentiment.peerComparison?.averages.cac ?? 0,
      lifetimeValue: sentiment.peerComparison?.averages.ltv ?? 0
    }
  };

  // Track insights generation for continuous improvement
  await db.insert(userActivities).values({
    userId: data.userId,
    activityType: "valuation_completed",
    metadata: {
      industry: data.industry,
      stage: data.stage,
      aiMetrics: aiMetrics,
      warnings: warnings.length,
      complianceStatus: compliance.requirements.every(r => r.status === 'pass')
    }
  });

  return {
    financialAssumptions: assumptions,
    warnings,
    suggestions,
    marketSentiment: {
      overallScore: sentiment.overallScore,
      insights: sentiment.insights,
      riskFactors: sentiment.riskFactors,
      opportunities: sentiment.opportunities
    },
    compliance,
    peerAnalysis,
    aiEnhancedMetrics: aiMetrics
  };
}

// Helper functions for AI-enhanced metrics

function calculateGrowthPotential(data: ValuationFormData, sentiment: any): number {
  const baseGrowth = data.growthRate || 0;
  const marketGrowth = sentiment.marketGrowthRate || 0;
  const penetration = sentiment.marketPenetration || 0;

  return Math.min(1, Math.max(0,
    (baseGrowth * 0.4) +
    (marketGrowth * 0.3) +
    (penetration * 0.3)
  ));
}

function assessMarketFit(data: ValuationFormData, sentiment: any): number {
  const marketSize = sentiment.totalAddressableMarket || 0;
  const competition = sentiment.competitionIntensity || 0;
  const productReadiness = data.productStage === 'launched' ? 1 : 0.5;

  return Math.min(1, Math.max(0,
    (marketSize * 0.4) +
    ((1 - competition) * 0.3) +
    (productReadiness * 0.3)
  ));
}

function evaluateCompetitiveAdvantage(data: ValuationFormData): number {
  const factors = [
    data.hasPatents,
    data.hasProprietaryTech,
    data.marketLeader,
    data.networkEffects,
    data.switchingCosts
  ].filter(Boolean).length;

  return Math.min(1, factors / 5);
}

function calculateExecutionRisk(data: ValuationFormData): number {
  const risks = [
    !data.hasRevenueStream,
    !data.hasProductMarketFit,
    data.runwayMonths < 12,
    !data.hasExperiencedTeam,
    data.regulatoryRisks
  ].filter(Boolean).length;

  return Math.min(1, risks / 5);
}

function enrichPeerAnalysis(companies: any[]): Array<{
  name: string;
  similarity: number;
  metrics: Record<string, number>;
}> {
  return companies.map(company => ({
    name: company.name,
    similarity: company.similarity,
    metrics: {
      ...company.metrics,
      efficiency: calculateEfficiencyScore(company.metrics),
      scalability: calculateScalabilityScore(company.metrics)
    }
  }));
}

function calculateEfficiencyScore(metrics: Record<string, number>): number {
  const { revenue, costs, employees } = metrics;
  return revenue && costs && employees
    ? (revenue - costs) / (employees * costs)
    : 0;
}

function calculateScalabilityScore(metrics: Record<string, number>): number {
  const { growthRate, margins, cac, ltv } = metrics;
  return growthRate && margins && cac && ltv
    ? (growthRate * margins * (ltv / cac)) / 100
    : 0;
}