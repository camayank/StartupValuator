import { generateValuationReport, generatePeerAnalysis, generateRiskAssessment } from './openai';
import type { ValuationFormData } from '@/lib/validations';

export interface ValuationReport {
  executive_summary: string;
  industry_analysis: string;
  financial_analysis: string;
  valuation_methods: {
    dcf_analysis: string;
    market_approach: string;
    precedent_transactions: string;
  };
  risk_assessment: string;
  growth_projections: string;
  sensitivity_analysis: string;
  recommendations: string;
  appendix: {
    financial_tables: string;
    comparable_companies: string;
    methodology_details: string;
  };
}

export async function generateComprehensiveReport(
  formData: ValuationFormData,
  industryMetrics: any,
  financials: any
): Promise<ValuationReport> {
  try {
    // Step 1: Generate the main valuation report
    const mainReport = await generateValuationReport(
      formData,
      industryMetrics,
      financials,
      {
        discountRate: calculateDiscountRate(formData),
        growthAssumptions: deriveGrowthAssumptions(formData),
        marketMultiples: await getPeerMultiples(formData),
      }
    );

    // Step 2: Generate peer analysis for market approach
    const peerAnalysis = await generatePeerAnalysis(
      formData.sector,
      formData.industry,
      formData.region,
      industryMetrics
    );

    // Step 3: Generate detailed risk assessment
    const riskAssessment = await generateRiskAssessment(
      formData,
      industryMetrics,
      financials
    );

    // Step 4: Combine all analyses into a comprehensive report
    return {
      ...mainReport,
      appendix: {
        ...mainReport.appendix,
        comparable_companies: JSON.stringify(peerAnalysis, null, 2),
        risk_matrix: JSON.stringify(riskAssessment, null, 2),
      },
    };
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    throw error;
  }
}

function calculateDiscountRate(formData: ValuationFormData): number {
  const baseRate = formData.region === 'us' ? 0.0368 : 0.04; // Risk-free rate
  const marketRiskPremium = 0.0575; // Market risk premium
  const scalingFactor = getScalingFactor(formData.stage);
  
  return baseRate + (marketRiskPremium * scalingFactor);
}

function deriveGrowthAssumptions(formData: ValuationFormData) {
  return {
    short_term: formData.growthRate,
    medium_term: formData.growthRate * 0.8,
    long_term: Math.min(formData.growthRate * 0.5, 0.03), // Terminal growth rate cap
    margin_evolution: {
      target: formData.margins,
      timeline: 5,
    },
  };
}

async function getPeerMultiples(formData: ValuationFormData) {
  // This could be enhanced with real-time market data APIs
  const baseMultiples = {
    ev_revenue: getIndustryBaseMultiple(formData.industry),
    ev_ebitda: getIndustryEbitdaMultiple(formData.industry),
  };

  return adjustMultiplesForGrowth(baseMultiples, formData.growthRate);
}

function getScalingFactor(stage: string): number {
  const stageFactors: Record<string, number> = {
    'ideation_unvalidated': 2.5,
    'ideation_validated': 2.2,
    'mvp_development': 2.0,
    'mvp_early_traction': 1.8,
    'revenue_early': 1.6,
    'revenue_growing': 1.4,
    'revenue_scaling': 1.2,
    'mature_stable': 1.0,
  };

  return stageFactors[stage] || 1.5;
}

function getIndustryBaseMultiple(industry: string): number {
  const industryMultiples: Record<string, number> = {
    'software_enterprise': 8.5,
    'software_consumer': 7.5,
    'ai_ml': 12.0,
    'biotech': 6.5,
    'fintech': 9.0,
    // Add more industries as needed
  };

  return industryMultiples[industry] || 6.0;
}

function getIndustryEbitdaMultiple(industry: string): number {
  const ebitdaMultiples: Record<string, number> = {
    'software_enterprise': 22.0,
    'software_consumer': 18.0,
    'ai_ml': 25.0,
    'biotech': 16.0,
    'fintech': 20.0,
    // Add more industries as needed
  };

  return ebitdaMultiples[industry] || 15.0;
}

function adjustMultiplesForGrowth(
  baseMultiples: { ev_revenue: number; ev_ebitda: number },
  growthRate: number
) {
  const growthAdjustment = Math.max(0.8, Math.min(1.5, 1 + (growthRate - 0.15)));
  
  return {
    ev_revenue: baseMultiples.ev_revenue * growthAdjustment,
    ev_ebitda: baseMultiples.ev_ebitda * growthAdjustment,
  };
}
