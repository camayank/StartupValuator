import { Router } from "express";
import { z } from "zod";
import { calculateBerkusValuation } from "../services/valuation-methods/berkus-method";
import { calculateScorecard } from "../services/valuation-methods/scorecard-method";

const router = Router();

// Validation schema for quick calculator input
const quickCalculatorSchema = z.object({
  revenue: z.enum(['pre_revenue', '1_25l', '25l_1cr', '1cr_plus']),
  stage: z.enum(['ideation', 'launched', 'growing', 'profitable']),
  sector: z.string().min(1),
  dpiitRecognized: z.boolean(),
  customers: z.number().optional(),
  fundingRaised: z.number().optional(),
});

type QuickCalculatorInput = z.infer<typeof quickCalculatorSchema>;

/**
 * Quick Calculator - Public endpoint (no auth required)
 * Provides instant valuation estimate based on minimal inputs
 */
router.post("/calculate", async (req, res) => {
  try {
    const input = quickCalculatorSchema.parse(req.body);

    // Determine valuation method based on stage
    const useMethod = input.revenue === 'pre_revenue' ? 'berkus' : 'scorecard';

    // Convert input to structured data
    const valuationData = convertToValuationData(input);

    let result;
    if (useMethod === 'berkus') {
      result = await calculateBerkusValuation(valuationData);
    } else {
      result = await calculateScorecard(valuationData);
    }

    // Add additional context for quick calculator
    const response = {
      valuation: {
        conservative: Math.round(result.valuation * 0.85),
        recommended: result.valuation,
        optimistic: Math.round(result.valuation * 1.20),
      },
      method: useMethod,
      methodName: useMethod === 'berkus' ? 'Berkus Method' : 'Scorecard Method',
      confidence: calculateConfidence(input),
      breakdown: result.breakdown || {},
      improvementTips: generateImprovementTips(input),
      nextSteps: [
        {
          title: "Get Detailed Report",
          description: "Comprehensive valuation with multiple methods",
          price: "₹999",
          benefit: "Investor-ready PDF report",
        },
        {
          title: "Create Free Account",
          description: "Save your valuation and track progress",
          price: "Free",
          benefit: "Dashboard access",
        },
      ],
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Quick calculator error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to calculate valuation",
    });
  }
});

/**
 * Convert quick calculator input to full valuation data structure
 */
function convertToValuationData(input: QuickCalculatorInput): any {
  // Map revenue range to numeric value
  const revenueMap = {
    pre_revenue: 0,
    '1_25l': 1200000,      // ₹12 lakhs midpoint
    '25l_1cr': 6250000,    // ₹62.5 lakhs midpoint
    '1cr_plus': 15000000,  // ₹1.5 cr estimate
  };

  // Map stage to funding stage
  const fundingStageMap = {
    ideation: 'pre-seed' as const,
    launched: 'seed' as const,
    growing: 'series-a' as const,
    profitable: 'series-b' as const,
  };

  const revenue = revenueMap[input.revenue];
  const stage = fundingStageMap[input.stage];

  return {
    revenue,
    stage,
    sector: input.sector,

    // Estimated values based on stage
    growthRate: input.stage === 'profitable' ? 0.5 : input.stage === 'growing' ? 0.8 : 1.2,
    margins: revenue > 0 ? 0.15 : 0,

    // Product and team assumptions
    productStage: input.stage === 'ideation' ? 'concept' :
                  input.stage === 'launched' ? 'mvp' : 'launched',
    foundersCount: 2, // Default assumption

    // Use provided data or estimates
    activeCustomers: input.customers || (revenue > 0 ? Math.max(10, Math.round(revenue / 100000)) : 0),
    fundingRaised: input.fundingRaised || 0,

    // DPIIT recognition
    hasDPIIT: input.dpiitRecognized,

    // Default values
    valuation: 0,
    totalAssets: revenue * 0.5,
    totalLiabilities: revenue * 0.2,
  };
}

/**
 * Calculate confidence level based on input completeness
 */
function calculateConfidence(input: QuickCalculatorInput): {
  level: 'low' | 'moderate' | 'high';
  percentage: number;
  description: string;
} {
  let score = 40; // Base score for minimal inputs

  // Add points for optional data
  if (input.customers) score += 15;
  if (input.fundingRaised) score += 15;
  if (input.dpiitRecognized) score += 10;
  if (input.revenue !== 'pre_revenue') score += 20;

  const level = score >= 70 ? 'high' : score >= 50 ? 'moderate' : 'low';

  const descriptions = {
    low: 'Based on limited information. For accurate valuation, provide more details.',
    moderate: 'Good estimate based on key metrics. Detailed report recommended.',
    high: 'Strong estimate with comprehensive inputs. Ready for detailed analysis.',
  };

  return {
    level,
    percentage: score,
    description: descriptions[level],
  };
}

/**
 * Generate personalized improvement tips
 */
function generateImprovementTips(input: QuickCalculatorInput): Array<{
  tip: string;
  impact: string;
  estimatedIncrease: string;
}> {
  const tips = [];

  if (!input.dpiitRecognized) {
    tips.push({
      tip: "Get DPIIT recognition",
      impact: "Credibility boost + government scheme access",
      estimatedIncrease: "+₹15-20 Lakhs",
    });
  }

  if (input.revenue === 'pre_revenue') {
    tips.push({
      tip: "Launch MVP and get first 100 customers",
      impact: "Validates market demand",
      estimatedIncrease: "+₹25-30 Lakhs",
    });
  }

  if (input.revenue === '1_25l') {
    tips.push({
      tip: "Scale to ₹50L annual revenue",
      impact: "Proves business model viability",
      estimatedIncrease: "+₹50-75 Lakhs",
    });
  }

  if (!input.fundingRaised) {
    tips.push({
      tip: "Raise angel or seed funding",
      impact: "External validation of your startup",
      estimatedIncrease: "+₹30-50 Lakhs",
    });
  }

  tips.push({
    tip: "File patents or build IP",
    impact: "Protects competitive advantage",
    estimatedIncrease: "+₹20-25 Lakhs",
  });

  return tips.slice(0, 4); // Return top 4 tips
}

export default router;
