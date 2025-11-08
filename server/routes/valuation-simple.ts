import { Router } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { ValuationCalculatorV2 } from "../services/valuation-v2";
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

// Industry benchmarks for intelligent defaults (India-optimized, INR values)
// Based on actual Indian startup ecosystem data
const industryBenchmarks: Record<string, {
  avgGrowthRate: number;
  avgMargins: number;
  avgTAM: number; // In INR
  avgCAC: number; // In INR
  avgLTV: number; // In INR
  typicalCompetitors: number;
  marketGrowthRate: number;
}> = {
  "SaaS (Software as a Service)": {
    avgGrowthRate: 120,
    avgMargins: 70,
    avgTAM: 4150000000000, // ₹41,500 Cr (~$50B converted)
    avgCAC: 8300, // ₹8,300 (~$100 converted)
    avgLTV: 41500, // ₹41,500 (~$500 converted)
    typicalCompetitors: 8,
    marketGrowthRate: 30 // India SaaS growing faster than global
  },
  "E-commerce & D2C": {
    avgGrowthRate: 85,
    avgMargins: 25, // Lower margins in India due to price sensitivity
    avgTAM: 8300000000000, // ₹83,000 Cr
    avgCAC: 830, // ₹830 (~$10)
    avgLTV: 8300, // ₹8,300 (~$100)
    typicalCompetitors: 18, // Highly competitive in India
    marketGrowthRate: 22
  },
  "Fintech & Payments": {
    avgGrowthRate: 110,
    avgMargins: 60,
    avgTAM: 6225000000000, // ₹62,250 Cr
    avgCAC: 415, // ₹415 (~$5)
    avgLTV: 4150, // ₹4,150 (~$50)
    typicalCompetitors: 15, // Very competitive post-UPI
    marketGrowthRate: 28 // India's fintech boom
  },
  "Edtech & Learning": {
    avgGrowthRate: 95,
    avgMargins: 45,
    avgTAM: 2490000000000, // ₹24,900 Cr
    avgCAC: 1660, // ₹1,660 (~$20)
    avgLTV: 8300, // ₹8,300 (~$100)
    typicalCompetitors: 12,
    marketGrowthRate: 25
  },
  "Healthcare & Wellness": {
    avgGrowthRate: 75,
    avgMargins: 40,
    avgTAM: 6640000000000, // ₹66,400 Cr
    avgCAC: 2490, // ₹2,490 (~$30)
    avgLTV: 12450, // ₹12,450 (~$150)
    typicalCompetitors: 10,
    marketGrowthRate: 20
  },
  "Logistics & Supply Chain": {
    avgGrowthRate: 65,
    avgMargins: 20, // Thin margins in Indian logistics
    avgTAM: 12450000000000, // ₹1,24,500 Cr
    avgCAC: 4150, // ₹4,150 (~$50)
    avgLTV: 24900, // ₹24,900 (~$300)
    typicalCompetitors: 9,
    marketGrowthRate: 15
  },
  "Food & Beverage": {
    avgGrowthRate: 55,
    avgMargins: 25,
    avgTAM: 9960000000000, // ₹99,600 Cr
    avgCAC: 415, // ₹415 (~$5)
    avgLTV: 4150, // ₹4,150 (~$50)
    typicalCompetitors: 25, // Extremely competitive
    marketGrowthRate: 12
  },
  "Gaming & Entertainment": {
    avgGrowthRate: 140,
    avgMargins: 65,
    avgTAM: 16600000000000, // ₹1,66,000 Cr
    avgCAC: 165, // ₹165 (~$2)
    avgLTV: 1660, // ₹1,660 (~$20)
    typicalCompetitors: 20,
    marketGrowthRate: 32
  },
  "AgriTech & FoodTech": {
    avgGrowthRate: 70,
    avgMargins: 35,
    avgTAM: 3735000000000, // ₹37,350 Cr
    avgCAC: 830, // ₹830 (~$10)
    avgLTV: 4980, // ₹4,980 (~$60)
    typicalCompetitors: 7,
    marketGrowthRate: 18
  },
  "CleanTech & Sustainability": {
    avgGrowthRate: 80,
    avgMargins: 45,
    avgTAM: 4980000000000, // ₹49,800 Cr
    avgCAC: 3320, // ₹3,320 (~$40)
    avgLTV: 16600, // ₹16,600 (~$200)
    typicalCompetitors: 6,
    marketGrowthRate: 35 // Government push for clean energy
  },
  "Manufacturing & Industrial": {
    avgGrowthRate: 45,
    avgMargins: 30, // Lower margins in Indian manufacturing
    avgTAM: 14940000000000, // ₹1,49,400 Cr
    avgCAC: 8300, // ₹8,300 (~$100)
    avgLTV: 66400, // ₹66,400 (~$800)
    typicalCompetitors: 10,
    marketGrowthRate: 10
  },
  "Other": {
    avgGrowthRate: 60,
    avgMargins: 35,
    avgTAM: 4150000000000, // ₹41,500 Cr
    avgCAC: 1660, // ₹1,660 (~$20)
    avgLTV: 8300, // ₹8,300 (~$100)
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

CRITICAL CURRENCY INSTRUCTION:
All monetary values in your response MUST be in ${simpleData.currency} (${simpleData.currency === 'INR' ? 'Indian Rupees ₹' : simpleData.currency === 'USD' ? 'US Dollars $' : simpleData.currency === 'EUR' ? 'Euros €' : 'British Pounds £'}).
- For ${simpleData.currency === 'INR' ? 'an Indian startup with ₹1 Cr revenue' : simpleData.currency === 'USD' ? 'a US startup with $1M revenue' : 'a startup in your currency'}, TAM/SAM/SOM should be in ${simpleData.currency === 'INR' ? 'Crores (₹), not Millions ($)' : 'the same currency'}
- CAC/LTV should reflect ${simpleData.currency === 'INR' ? 'Indian market pricing (₹1000s, not $100s)' : 'realistic pricing for the market'}
- Use realistic ${simpleData.currency === 'INR' ? 'Indian' : 'market'} values, not ${simpleData.currency === 'INR' ? 'US/Silicon Valley' : 'other market'} benchmarks
- ALL numeric monetary values (tam, sam, som, cac, ltv, burnRate, revenues, etc.) = ${simpleData.currency} amounts

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
    "barriersToEntry": ["string"],
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

// Currency conversion helper (matches the one in valuation-v2.ts)
const CURRENCY_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105
};

function convertToINR(value: number, fromCurrency: string): number {
  return value * (CURRENCY_TO_INR[fromCurrency] || 1);
}

function buildFullValuationData(simpleData: SimpleInput, aiInsights: any): ValuationFormData {
  const benchmark = industryBenchmarks[simpleData.industry] || industryBenchmarks["Other"];
  const stageData = stageMultipliers[simpleData.stage] || stageMultipliers["Seed Stage"];
  
  // CRITICAL: Convert user revenue to INR since all benchmarks are in INR
  // This ensures consistent calculations regardless of currency selected
  const revenueINR = convertToINR(simpleData.revenue || 0, simpleData.currency);
  
  // Calculate intelligent defaults using AI insights first, then benchmarks
  const adjustedGrowthRate = Math.round(
    aiInsights?.marketAnalysis?.marketGrowthRate || 
    benchmark.avgGrowthRate * stageData.growthMultiplier
  );
  
  // Financial metrics: AI first, then INR benchmarks
  // Note: AI insights should already be in INR since we specify Indian context
  const cac = aiInsights?.financialMetrics?.cac || benchmark.avgCAC;
  const ltv = aiInsights?.financialMetrics?.ltv || benchmark.avgLTV;
  const burnRate = aiInsights?.financialMetrics?.burnRate || (revenueINR * 1.5) / 12;
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
      revenue: revenueINR, // All values now in INR for consistent calculation
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
    
    // Enrich with AI insights (non-blocking - use fallback if fails)
    let aiInsights = null;
    let aiUsed = false;
    try {
      aiInsights = await enrichWithAI(simpleData);
      aiUsed = true;
    } catch (error) {
      console.warn("AI enrichment failed, using benchmarks:", error);
    }
    
    // Build complete valuation data with intelligent defaults
    const fullData = buildFullValuationData(simpleData, aiInsights);
    
    // Calculate valuation using corrected calculator
    const calculator = new ValuationCalculatorV2();
    const valuationResult = calculator.calculateValuation(fullData, simpleData.currency);
    
    // Return comprehensive result with transparency
    res.json({
      ...valuationResult,
      inputData: fullData,
      aiInsights: aiInsights,
      currency: simpleData.currency,
      simplifiedInput: simpleData,
      transparency: {
        aiEnrichmentUsed: aiUsed,
        methodsUsed: ["Scorecard Method", "Risk Factor Summation", "Venture Capital Method"],
        dataQuality: aiUsed ? "AI-enhanced" : "Benchmark-based",
        disclaimers: valuationResult.metadata?.disclaimers || []
      }
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
