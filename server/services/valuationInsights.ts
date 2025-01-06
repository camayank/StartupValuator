import { type ValuationFormData } from "../../client/src/lib/validations";
import { getCachedMarketSentiment } from "../lib/marketSentiment";
import { calculateFinancialAssumptions, validateAndAdjustAssumptions, suggestAssumptions, type FinancialAssumptions } from "../lib/financialAssumptions";
import { frameworks, type FrameworkId, validateFrameworkCompliance } from "../lib/compliance/frameworks";

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
}

export async function generateValuationInsights(data: ValuationFormData): Promise<ValuationInsights> {
  // Get market sentiment data
  const sentiment = await getCachedMarketSentiment(data);

  // Validate and adjust assumptions with AI
  const { assumptions, warnings } = validateAndAdjustAssumptions(data);

  // Generate AI-driven suggestions for missing data
  const suggestions = suggestAssumptions(data);

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

  // Extract peer analysis from market sentiment
  const peerAnalysis = {
    comparableFirms: sentiment.peerComparison?.companies ?? [],
    industryAverages: {
      revenueMultiple: sentiment.peerComparison?.averages.revenueMultiple ?? 0,
      growthRate: sentiment.peerComparison?.averages.growthRate ?? 0,
      margins: sentiment.peerComparison?.averages.margins ?? 0
    }
  };

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
    peerAnalysis
  };
}