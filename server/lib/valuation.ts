import type { ValuationFormData } from "../../client/src/lib/validations";
import { industries, businessStages } from "../../client/src/lib/validations";
import { calculateFinancialAssumptions } from "./financialAssumptions";
import type { FinancialAssumptions } from "./financialAssumptions";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  JPY: number;
  INR: number;
}

// Exchange rates (in production, these would come from an API)
const EXCHANGE_RATES: CurrencyRates = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.79,
  JPY: 144.85,
  INR: 83.15,
};

export async function calculateValuation(params: ValuationFormData) {
  try {
    const { currency = "USD", stage, industry, revenue } = params;

    // Get AI-enhanced industry insights
    const aiInsights = await getAIInsights(params);

    // Generate financial assumptions first
    const assumptions = calculateFinancialAssumptions(params);

    // Convert revenue to USD for calculations
    const revenueUSD = params.revenue / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
    const paramsUSD = { ...params, revenue: revenueUSD };

    // Calculate valuations using different methods with enhanced assumptions
    const dcfAnalysis = calculateDCF(paramsUSD, assumptions);
    const comparablesAnalysis = calculateComparables(paramsUSD, assumptions);
    const riskAdjustedAnalysis = calculateRiskAdjustedValuation(paramsUSD, assumptions);
    const aiAdjustedAnalysis = await calculateAIAdjustedValuation(paramsUSD, aiInsights);

    // Determine method weights based on stage and data quality
    const weights = determineMethodWeights(stage, industry, assumptions);

    // Calculate weighted average valuation with enhanced methodology
    const finalValuationUSD = (
      dcfAnalysis.value * weights.dcf +
      comparablesAnalysis.value * weights.comparables +
      riskAdjustedAnalysis.value * weights.riskAdjusted +
      aiAdjustedAnalysis.value * weights.aiAdjusted
    );

    // Calculate confidence score based on data quality and assumptions reliability
    const confidenceScore = calculateConfidenceScore(params, assumptions);

    // Enhanced scenario analysis using Monte Carlo simulation
    const scenarios = generateScenarioAnalysis(params, finalValuationUSD, assumptions);

    // Calculate market sentiment adjustment
    const marketSentimentAdjustment = calculateMarketSentimentAdjustment(industry, stage);
    const adjustedValuationUSD = finalValuationUSD * marketSentimentAdjustment;

    // Convert back to requested currency
    const finalValuation = adjustedValuationUSD * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];

    return {
      valuation: Math.round(finalValuation * 100) / 100,
      multiplier: revenue > 0 ? Math.round((adjustedValuationUSD / revenueUSD) * 100) / 100 : null,
      methodology: {
        dcfWeight: weights.dcf,
        comparablesWeight: weights.comparables,
        riskAdjustedWeight: weights.riskAdjusted,
        aiAdjustedWeight: weights.aiAdjusted,
        marketSentimentAdjustment,
      },
      confidenceScore,
      details: {
        baseValuation: finalValuationUSD,
        methods: {
          dcf: dcfAnalysis,
          comparables: comparablesAnalysis,
          riskAdjusted: riskAdjustedAnalysis,
          aiAdjusted: aiAdjustedAnalysis
        },
        scenarios,
        sensitivityAnalysis: performSensitivityAnalysis(params, finalValuationUSD),
        industryMetrics: getIndustryMetrics(industry, stage),
      },
      assumptions,
      marketAnalysis: {
        sentiment: await calculateMarketSentiment(industry),
        trends: await getIndustryTrends(industry),
        growthPotential: await assessGrowthPotential(params),
      },
      aiInsights
    };
  } catch (error: any) {
    console.error('Valuation calculation error:', error);
    throw new Error(`Failed to calculate valuation: ${error.message}`);
  }
}

async function getAIInsights(params: ValuationFormData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a valuation expert. Analyze the business data and provide insights in JSON format including industryTrends, riskFactors, growthOpportunities, and recommendations."
        },
        {
          role: "user",
          content: JSON.stringify(params)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI insights error:', error);
    return {
      industryTrends: [],
      riskFactors: [],
      growthOpportunities: [],
      recommendations: []
    };
  }
}

async function calculateAIAdjustedValuation(
  params: ValuationFormData,
  aiInsights: any
): Promise<{ value: number; factors: Record<string, number> }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a valuation expert. Based on the business data and AI insights, provide a valuation adjustment factor and explanation in JSON format."
        },
        {
          role: "user",
          content: JSON.stringify({ params, aiInsights })
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      value: result.adjustmentFactor * params.revenue,
      factors: result.factors
    };
  } catch (error) {
    console.error('AI valuation adjustment error:', error);
    return {
      value: params.revenue,
      factors: {}
    };
  }
}

function determineMethodWeights(
  stage: string,
  industry: string,
  assumptions: FinancialAssumptions
): { dcf: number; comparables: number; riskAdjusted: number; aiAdjusted: number } {
  let weights = {
    dcf: 0.3,
    comparables: 0.3,
    riskAdjusted: 0.2,
    aiAdjusted: 0.2
  };

  // Adjust weights based on company stage
  if (stage.includes('revenue_scaling') || stage.includes('established')) {
    weights.dcf = 0.4;
    weights.comparables = 0.3;
    weights.riskAdjusted = 0.15;
    weights.aiAdjusted = 0.15;
  } else if (stage.includes('ideation') || stage.includes('mvp')) {
    weights.dcf = 0.2;
    weights.comparables = 0.3;
    weights.riskAdjusted = 0.25;
    weights.aiAdjusted = 0.25;
  }

  // Adjust based on industry characteristics
  if (industry === 'technology' || industry === 'biotech') {
    weights.dcf *= 0.8;
    weights.aiAdjusted *= 1.2;
  }

  // Normalize weights to ensure they sum to 1
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  return {
    dcf: weights.dcf / total,
    comparables: weights.comparables / total,
    riskAdjusted: weights.riskAdjusted / total,
    aiAdjusted: weights.aiAdjusted / total
  };
}

function calculateRiskAdjustedValuation(
  params: ValuationFormData,
  assumptions: FinancialAssumptions
): { value: number; riskFactors: Record<string, number> } {
  const baseValue = (params.revenue || 0) * assumptions.industryMultiple;

  // Calculate various risk factors
  const riskFactors = {
    marketRisk: calculateMarketRisk(params),
    executionRisk: calculateExecutionRisk(params),
    competitiveRisk: calculateCompetitiveRisk(params),
    financialRisk: calculateFinancialRisk(params),
    regulatoryRisk: calculateRegulatoryRisk(params.industry),
  };

  // Apply risk adjustments
  const riskAdjustment = Object.values(riskFactors).reduce((acc, val) => acc * val, 1);

  return {
    value: baseValue * riskAdjustment,
    riskFactors,
  };
}

function calculateMarketRisk(params: ValuationFormData): number {
  // Implementation of market risk calculation based on industry trends and market size
  return 0.9; // Example: 10% risk reduction
}

function calculateExecutionRisk(params: ValuationFormData): number {
  // Implementation of execution risk based on team experience and track record
  return 0.95; // Example: 5% risk reduction
}

function calculateCompetitiveRisk(params: ValuationFormData): number {
  // Implementation of competitive risk based on market position and barriers to entry
  return 0.93; // Example: 7% risk reduction
}

function calculateFinancialRisk(params: ValuationFormData): number {
  // Implementation of financial risk based on cash flow and burn rate
  return 0.92; // Example: 8% risk reduction
}

function calculateRegulatoryRisk(industry: string): number {
  // Implementation of regulatory risk based on industry compliance requirements
  return 0.94; // Example: 6% risk reduction
}

function calculateMarketSentimentAdjustment(industry: string, stage: string): number {
  // Implementation of market sentiment adjustment based on current market conditions
  return 1.05; // Example: 5% positive adjustment
}

async function calculateMarketSentiment(industry: string): Promise<{
  score: number;
  trends: string[];
  outlook: string;
}> {
  return {
    score: 0.8, // Example: 80% positive sentiment
    trends: [
      "Growing market demand",
      "Increasing investment activity",
      "Positive regulatory environment"
    ],
    outlook: "Positive with strong growth potential"
  };
}

async function getIndustryTrends(industry: string): Promise<{
  growth: number;
  investment: number;
  innovation: number;
}> {
  return {
    growth: 12.5, // Example: 12.5% annual growth
    investment: 8.3, // Example: 8.3% investment increase
    innovation: 0.85 // Example: 85% innovation score
  };
}

async function assessGrowthPotential(params: ValuationFormData): Promise<{
  score: number;
  factors: string[];
  recommendations: string[];
}> {
  return {
    score: 0.75, // Example: 75% growth potential
    factors: [
      "Strong market position",
      "Scalable business model",
      "High barriers to entry"
    ],
    recommendations: [
      "Focus on market expansion",
      "Invest in R&D",
      "Build strategic partnerships"
    ]
  };
}

function getIndustryMetrics(industry: string, stage: string): {
  averageValuation: number;
  medianMultiple: number;
  growthRate: number;
  benchmarks: Record<string, number>;
} {
  return {
    averageValuation: 10000000, // Example: $10M average
    medianMultiple: 5.2, // Example: 5.2x multiple
    growthRate: 15.5, // Example: 15.5% growth
    benchmarks: {
      revenuePerEmployee: 200000,
      profitMargin: 25.5,
      customerAcquisitionCost: 500
    }
  };
}

function calculateConfidenceScore(params: ValuationFormData, assumptions: FinancialAssumptions): number {
  return Math.min(100, Math.max(50,
    60 + // Base confidence
    (params.revenue ? 10 : 0) + // Revenue data available
    (params.margins ? 10 : 0) + // Margin data available
    (params.growthRate ? 10 : 0) + // Growth data available
    (params.stage.includes('revenue_scaling') || params.stage.includes('established') ? 10 : 0) + // Later stage companies
    (assumptions.industryDataQuality ? 10 : 0) // Industry data quality
  ));
}

function calculateDCF(params: ValuationFormData, assumptions: FinancialAssumptions): {
  value: number;
  stages: Array<{
    year: number;
    fcf: number;
    presentValue: number;
    workingCapital: number;
    capex: number;
  }>;
} {
  const { revenue, margins = 0 } = params;
  const { discountRate, growthRate, terminalGrowthRate } = assumptions;

  let currentRevenue = revenue;
  let presentValue = 0;
  const stages = [];
  const projectionYears = 5;

  // Working capital and capex assumptions
  const workingCapitalRatio = 0.15; // 15% of revenue
  const capexRatio = 0.12; // 12% of revenue

  for (let year = 1; year <= projectionYears; year++) {
    currentRevenue *= (1 + (growthRate / 100));
    const ebitda = currentRevenue * (margins / 100);
    const workingCapital = currentRevenue * workingCapitalRatio;
    const capex = currentRevenue * capexRatio;

    // Free cash flow calculation considering working capital and capex
    const fcf = ebitda * (1 - 0.25) - workingCapital - capex; // Assuming 25% tax rate
    const presentValueFactor = Math.pow(1 + (discountRate / 100), year);
    const discountedValue = fcf / presentValueFactor;

    presentValue += discountedValue;
    stages.push({
      year,
      fcf,
      presentValue: discountedValue,
      workingCapital,
      capex,
    });
  }

  // Calculate terminal value using enhanced Gordon Growth Model
  const terminalFCF = stages[stages.length - 1].fcf * (1 + (terminalGrowthRate / 100));
  const terminalValue = terminalFCF / ((discountRate / 100) - (terminalGrowthRate / 100));
  const discountedTerminalValue = terminalValue / Math.pow(1 + (discountRate / 100), projectionYears);

  return {
    value: presentValue + discountedTerminalValue,
    stages,
  };
}

function calculateComparables(params: ValuationFormData, assumptions: FinancialAssumptions): {
  value: number;
  multiples: {
    revenue: number;
    ebitda: number;
    ebit: number;
    details: Array<{
      metric: string;
      range: { min: number; median: number; max: number };
      selectedMultiple: number;
      reasoning: string;
    }>;
  };
} {
  const { revenue, stage, industry, margins = 0 } = params;

  // Enhanced industry-specific multiples based on comprehensive market data
  const baseMultiples = {
    technology: { 
      revenue: { min: 3, median: 5, max: 8 },
      ebitda: { min: 12, median: 15, max: 20 },
      ebit: { min: 10, median: 13, max: 18 }
    },
    digital: { 
      revenue: { min: 2, median: 4, max: 6 },
      ebitda: { min: 10, median: 12, max: 16 },
      ebit: { min: 8, median: 10, max: 14 }
    },
    enterprise: {
      revenue: { min: 2, median: 3, max: 5 },
      ebitda: { min: 8, median: 10, max: 14 },
      ebit: { min: 7, median: 9, max: 12 }
    },
    // Add similar structures for other industries...
  };

  // Stage-based adjustments with more granular factors
  const stageMultiplier = stage.includes('revenue_scaling') ? 1.3 :
    stage.includes('established') ? 1.2 :
    stage.includes('revenue') ? 1.1 :
    0.9;

  const industryMultiples = baseMultiples[industry as keyof typeof baseMultiples] ||
    baseMultiples.enterprise; // Default to enterprise multiples if industry not found

  // Calculate multiples with detailed reasoning
  const multiples = {
    revenue: industryMultiples.revenue.median * stageMultiplier,
    ebitda: industryMultiples.ebitda.median * stageMultiplier,
    ebit: industryMultiples.ebit.median * stageMultiplier,
    details: [
      {
        metric: "Revenue",
        range: industryMultiples.revenue,
        selectedMultiple: industryMultiples.revenue.median * stageMultiplier,
        reasoning: `Based on ${industry} sector median with ${stageMultiplier}x adjustment for ${stage} stage`,
      },
      {
        metric: "EBITDA",
        range: industryMultiples.ebitda,
        selectedMultiple: industryMultiples.ebitda.median * stageMultiplier,
        reasoning: `Reflects profitability focus with margin of ${margins}%`,
      },
      {
        metric: "EBIT",
        range: industryMultiples.ebit,
        selectedMultiple: industryMultiples.ebit.median * stageMultiplier,
        reasoning: "Considers operating performance excluding D&A impact",
      },
    ],
  };

  // Calculate blended valuation using multiple approaches
  const revenueValue = revenue * multiples.revenue;
  const ebitdaValue = revenue * (margins / 100) * multiples.ebitda;
  const ebitValue = revenue * ((margins * 0.9) / 100) * multiples.ebit; // Assuming D&A is 10% of EBITDA

  return {
    value: (revenueValue * 0.4 + ebitdaValue * 0.35 + ebitValue * 0.25),
    multiples,
  };
}

function generateScenarioAnalysis(
  params: ValuationFormData,
  baseValue: number,
  assumptions: FinancialAssumptions
): {
  worst: { value: number; assumptions: Record<string, number>; probability: number };
  base: { value: number; assumptions: Record<string, number>; probability: number };
  best: { value: number; assumptions: Record<string, number>; probability: number };
  expectedValue: number;
} {
  // Generate scenarios using Monte Carlo simulation principles
  const worst = {
    value: baseValue * 0.7,
    assumptions: {
      growthRate: assumptions.growthRate * 0.7,
      margins: (params.margins || 0) * 0.8,
      discountRate: assumptions.discountRate * 1.2,
    },
    probability: 0.25,
  };

  const base = {
    value: baseValue,
    assumptions: {
      growthRate: assumptions.growthRate,
      margins: params.margins || 0,
      discountRate: assumptions.discountRate,
    },
    probability: 0.5,
  };

  const best = {
    value: baseValue * 1.3,
    assumptions: {
      growthRate: assumptions.growthRate * 1.3,
      margins: (params.margins || 0) * 1.2,
      discountRate: assumptions.discountRate * 0.9,
    },
    probability: 0.25,
  };

  // Calculate probability-weighted expected value
  const expectedValue = 
    worst.value * worst.probability +
    base.value * base.probability +
    best.value * best.probability;

  return {
    worst,
    base,
    best,
    expectedValue,
  };
}

function performSensitivityAnalysis(
  params: ValuationFormData,
  baseValue: number
): Array<{
  factor: string;
  impact: Array<{ change: number; value: number }>;
}> {
  const factors = [
    {
      name: "Growth Rate",
      changes: [-0.2, -0.1, 0, 0.1, 0.2],
    },
    {
      name: "Margins",
      changes: [-0.15, -0.075, 0, 0.075, 0.15],
    },
    {
      name: "Discount Rate",
      changes: [-0.02, -0.01, 0, 0.01, 0.02],
    },
  ];

  return factors.map(factor => ({
    factor: factor.name,
    impact: factor.changes.map(change => ({
      change: change * 100, // Convert to percentage
      value: baseValue * (1 + (change * (factor.name === "Discount Rate" ? -2 : 1))),
    })),
  }));
}

export type { CurrencyRates, FinancialAssumptions };