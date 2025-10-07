import { Router } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { ValuationCalculator } from "../services/valuation";
import type { ValuationFormData } from "../../client/src/lib/validations";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const router = Router();

const simpleInputSchema = z.object({
  businessName: z.string().optional(),
  industry: z.string(),
  stage: z.string(),
  revenue: z.number(),
  currency: z.string(),
});

type SimpleInput = z.infer<typeof simpleInputSchema>;

// Industry benchmarks for intelligent defaults
const industryBenchmarks: Record<string, {
  avgGrowthRate: number;
  avgMargins: number;
  avgTAM: number;
  avgCAC: number;
  avgLTV: number;
  typicalCompetitors: number;
  marketGrowthRate: number;
}> = {
  "SaaS (Software as a Service)": {
    avgGrowthRate: 120,
    avgMargins: 75,
    avgTAM: 50000000000,
    avgCAC: 1000,
    avgLTV: 5000,
    typicalCompetitors: 8,
    marketGrowthRate: 25
  },
  "E-commerce & D2C": {
    avgGrowthRate: 80,
    avgMargins: 35,
    avgTAM: 100000000000,
    avgCAC: 50,
    avgLTV: 300,
    typicalCompetitors: 15,
    marketGrowthRate: 18
  },
  "Fintech & Payments": {
    avgGrowthRate: 100,
    avgMargins: 65,
    avgTAM: 75000000000,
    avgCAC: 150,
    avgLTV: 1200,
    typicalCompetitors: 12,
    marketGrowthRate: 22
  },
  "Edtech & Learning": {
    avgGrowthRate: 90,
    avgMargins: 55,
    avgTAM: 30000000000,
    avgCAC: 200,
    avgLTV: 800,
    typicalCompetitors: 10,
    marketGrowthRate: 20
  },
  "Healthcare & Wellness": {
    avgGrowthRate: 70,
    avgMargins: 45,
    avgTAM: 80000000000,
    avgCAC: 300,
    avgLTV: 1500,
    typicalCompetitors: 9,
    marketGrowthRate: 15
  },
  "Logistics & Supply Chain": {
    avgGrowthRate: 60,
    avgMargins: 25,
    avgTAM: 150000000000,
    avgCAC: 500,
    avgLTV: 3000,
    typicalCompetitors: 7,
    marketGrowthRate: 12
  },
  "Food & Beverage": {
    avgGrowthRate: 50,
    avgMargins: 30,
    avgTAM: 120000000000,
    avgCAC: 25,
    avgLTV: 200,
    typicalCompetitors: 20,
    marketGrowthRate: 8
  },
  "Gaming & Entertainment": {
    avgGrowthRate: 150,
    avgMargins: 70,
    avgTAM: 200000000000,
    avgCAC: 5,
    avgLTV: 50,
    typicalCompetitors: 18,
    marketGrowthRate: 28
  },
  "AgriTech & FoodTech": {
    avgGrowthRate: 65,
    avgMargins: 40,
    avgTAM: 45000000000,
    avgCAC: 100,
    avgLTV: 600,
    typicalCompetitors: 6,
    marketGrowthRate: 14
  },
  "CleanTech & Sustainability": {
    avgGrowthRate: 85,
    avgMargins: 50,
    avgTAM: 60000000000,
    avgCAC: 400,
    avgLTV: 2000,
    typicalCompetitors: 5,
    marketGrowthRate: 30
  },
  "Manufacturing & Industrial": {
    avgGrowthRate: 40,
    avgMargins: 35,
    avgTAM: 180000000000,
    avgCAC: 1000,
    avgLTV: 8000,
    typicalCompetitors: 8,
    marketGrowthRate: 6
  },
  "Other": {
    avgGrowthRate: 60,
    avgMargins: 40,
    avgTAM: 50000000000,
    avgCAC: 200,
    avgLTV: 1000,
    typicalCompetitors: 10,
    marketGrowthRate: 15
  }
};

// Stage-based multipliers
const stageMultipliers: Record<string, {
  growthMultiplier: number;
  revenueMultiplier: number;
  teamSize: number;
  runway: number;
  riskLevel: string;
}> = {
  "Pre-seed / Idea Stage": {
    growthMultiplier: 1.5,
    revenueMultiplier: 0,
    teamSize: 3,
    runway: 12,
    riskLevel: "high"
  },
  "Seed Stage": {
    growthMultiplier: 1.3,
    revenueMultiplier: 0.5,
    teamSize: 8,
    runway: 18,
    riskLevel: "high"
  },
  "Series A": {
    growthMultiplier: 1.1,
    revenueMultiplier: 3,
    teamSize: 25,
    runway: 24,
    riskLevel: "medium"
  },
  "Series B": {
    growthMultiplier: 1.0,
    revenueMultiplier: 5,
    teamSize: 75,
    runway: 30,
    riskLevel: "medium"
  },
  "Series C+": {
    growthMultiplier: 0.8,
    revenueMultiplier: 8,
    teamSize: 200,
    runway: 36,
    riskLevel: "low"
  },
  "Revenue-generating (No funding yet)": {
    growthMultiplier: 1.2,
    revenueMultiplier: 1,
    teamSize: 10,
    runway: 24,
    riskLevel: "medium"
  }
};

async function enrichWithAI(simpleData: SimpleInput): Promise<any> {
  try {
    const prompt = `You are a synthesis of the world's top valuation and startup experts: Aswath Damodaran (NYU valuation professor), Sam Altman (OpenAI CEO, Y Combinator), and Elon Musk (first principles thinker).

STARTUP DATA:
- Business: ${simpleData.businessName || "Anonymous Startup"}
- Industry: ${simpleData.industry}
- Stage: ${simpleData.stage}
- Annual Revenue: ${simpleData.currency} ${simpleData.revenue.toLocaleString()}

ANALYSIS FRAMEWORK (combining all three perspectives):

1. DAMODARAN'S VALUATION RIGOR:
   - Calculate industry-specific risk premium (equity risk premium + industry beta)
   - Determine appropriate discount rate (WACC or required return)
   - Estimate terminal value and sustainable growth rate
   - Apply multiple valuation methods: DCF, Revenue Multiple, Comparable Companies
   - Consider country risk premium (especially for India/emerging markets)

2. SAM ALTMAN'S STARTUP INSIGHTS:
   - Assess founder/team quality indicators (proxy from stage and industry)
   - Evaluate network effects and scalability potential (1-10 scale)
   - Analyze market timing (is this the right time for this business?)
   - Estimate TAM/SAM/SOM and realistic market capture over 5 years
   - Identify key growth levers and bottlenecks
   - Evaluate product-market fit indicators

3. ELON MUSK'S FIRST PRINCIPLES:
   - Break down to fundamental value drivers (not industry averages)
   - Assess technology moat and defensibility (1-10 scale)
   - Evaluate exponential growth potential vs linear
   - Analyze execution capability indicators
   - Identify breakthrough potential vs incremental improvement
   - Consider real-world impact and mission clarity

OUTPUT REQUIRED (JSON only, no markdown):
{
  "valuationAnalysis": {
    "discountRate": number (WACC or required return %),
    "industryRiskPremium": number (%),
    "terminalGrowthRate": number (%),
    "revenueMultiple": number (industry typical multiple),
    "confidenceLevel": number (0-1),
    "valuationRange": {
      "conservative": number,
      "base": number,
      "aggressive": number
    }
  },
  "financialMetrics": {
    "cac": number,
    "ltv": number,
    "ltvCacRatio": number,
    "grossMargin": number (%),
    "burnRate": number (monthly),
    "runway": number (months),
    "breakEvenTimeline": number (months)
  },
  "marketAnalysis": {
    "tam": number,
    "sam": number,
    "som": number,
    "marketGrowthRate": number (%),
    "marketShareYear5": number (%),
    "competitiveDynamics": "string (fragmented/consolidated/emerging)",
    "barriers ToEntry": ["string"],
    "networkEffectScore": number (1-10)
  },
  "startupQuality": {
    "founderQualityScore": number (1-10, based on stage/industry signals),
    "teamSizeOptimal": number,
    "executionCapabilityScore": number (1-10),
    "productMarketFitStage": "string (searching/emerging/strong)",
    "technologyMoatScore": number (1-10),
    "scalabilityScore": number (1-10)
  },
  "growthProjections": {
    "year1Revenue": number,
    "year2Revenue": number,
    "year3Revenue": number,
    "year4Revenue": number,
    "year5Revenue": number,
    "growthType": "exponential" | "linear" | "s-curve",
    "keyGrowthDrivers": ["string"]
  },
  "riskAssessment": {
    "overallRiskLevel": "low" | "medium" | "high",
    "marketRisks": ["string"],
    "executionRisks": ["string"],
    "financialRisks": ["string"],
    "competitiveRisks": ["string"],
    "mitigationStrategies": ["string"]
  },
  "strategicInsights": {
    "keyStrengths": ["string"],
    "criticalWeaknesses": ["string"],
    "nextMilestones": ["string"],
    "fundingStrategy": "string",
    "valuationDrivers": ["string"],
    "pivotSuggestions": ["string"]
  },
  "comparableCompanies": {
    "similarCompanies": ["string (company name and brief context)"],
    "typicalValuations": "string (range and reasoning)"
  }
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const content = response.content[0].text;
    // Remove markdown code blocks if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI enrichment failed, using benchmarks:", error);
    return null;
  }
}

function buildFullValuationData(simpleData: SimpleInput, aiInsights: any): ValuationFormData {
  const benchmark = industryBenchmarks[simpleData.industry] || industryBenchmarks["Other"];
  const stageData = stageMultipliers[simpleData.stage] || stageMultipliers["Seed Stage"];
  
  // Calculate intelligent defaults using AI insights first, then benchmarks
  const adjustedGrowthRate = Math.round(
    aiInsights?.marketAnalysis?.marketGrowthRate || 
    benchmark.avgGrowthRate * stageData.growthMultiplier
  );
  const estimatedRevenue = simpleData.revenue || 0;
  
  // Financial metrics: AI first, then benchmarks
  const cac = aiInsights?.financialMetrics?.cac || benchmark.avgCAC;
  const ltv = aiInsights?.financialMetrics?.ltv || benchmark.avgLTV;
  const burnRate = aiInsights?.financialMetrics?.burnRate || (estimatedRevenue * 1.5) / 12;
  const teamSize = aiInsights?.startupQuality?.teamSizeOptimal || stageData.teamSize;
  const runway = aiInsights?.financialMetrics?.runway || stageData.runway;
  
  // Market sizes: Use AI insights if available
  const tam = aiInsights?.marketAnalysis?.tam || benchmark.avgTAM;
  const sam = aiInsights?.marketAnalysis?.sam || tam * 0.1;
  const som = aiInsights?.marketAnalysis?.som || sam * 0.05;

  // Determine product stage and maturity
  const productStage = simpleData.stage.includes("Pre-seed") ? "concept" : 
                      simpleData.stage.includes("Seed") ? "prototype" : "production";
  
  // Use AI-determined risk levels if available
  const overallRisk = aiInsights?.riskAssessment?.overallRiskLevel || stageData.riskLevel;

  return {
    businessInfo: {
      name: simpleData.businessName || "My Startup",
      sector: simpleData.industry.split(" ")[0],
      industry: simpleData.industry,
      location: "India",
      productStage: productStage,
      businessModel: "subscription"
    },
    financialData: {
      revenue: estimatedRevenue,
      cac: cac,
      ltv: ltv,
      burnRate: burnRate,
      runway: runway
    },
    marketData: {
      tam: tam,
      sam: sam,
      som: som,
      growthRate: adjustedGrowthRate,
      competitors: []
    },
    productDetails: {
      maturity: productStage,
      features: [],
      techStack: [],
      deployment: "cloud"
    },
    teamData: {
      size: teamSize,
      roles: [],
      advisors: []
    },
    riskFactors: {
      overall: overallRisk as any,
      market: overallRisk as any,
      execution: overallRisk as any,
      financial: overallRisk as any
    },
    valuationInputs: {
      method: "hybrid",
      expectedROI: aiInsights?.valuationAnalysis?.discountRate || 25,
      timeHorizon: 5,
      discountRate: aiInsights?.valuationAnalysis?.discountRate || 15,
      terminalGrowthRate: aiInsights?.valuationAnalysis?.terminalGrowthRate || 3
    },
    aiInsights: aiInsights
  };
}

router.post("/simple", async (req, res) => {
  try {
    const simpleData = simpleInputSchema.parse(req.body);
    
    // Enrich with AI insights
    const aiInsights = await enrichWithAI(simpleData);
    
    // Build complete valuation data with intelligent defaults
    const fullData = buildFullValuationData(simpleData, aiInsights);
    
    // Calculate valuation using existing calculator
    const calculator = new ValuationCalculator();
    const valuationResult = calculator.calculateValuation(fullData);
    
    // Return comprehensive result
    res.json({
      ...valuationResult,
      inputData: fullData,
      aiInsights: aiInsights,
      currency: simpleData.currency,
      simplifiedInput: simpleData
    });
  } catch (error) {
    console.error("Simple valuation error:", error);
    res.status(500).json({
      error: "Valuation calculation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
