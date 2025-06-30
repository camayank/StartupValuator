import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Simple valuation calculation schema
const valuationSchema = z.object({
  businessInfo: z.object({
    companyName: z.string().optional(),
    industry: z.string().optional(),
    stage: z.string().optional(),
    employeeCount: z.number().optional(),
  }).optional(),
  financialMetrics: z.object({
    revenue: z.number().optional(),
    growth: z.number().optional(),
    expenses: z.number().optional(),
    runway: z.number().optional(),
  }).optional(),
  marketAnalysis: z.object({
    marketSize: z.number().optional(),
    targetMarket: z.string().optional(),
    competitors: z.number().optional(),
  }).optional(),
});

// Simple valuation calculation endpoint
router.post('/calculate', async (req, res) => {
  try {
    const data = valuationSchema.parse(req.body);
    
    // Basic valuation calculation logic
    let valuation = 0;
    let confidence = 0.5;
    const methodologies: Record<string, number> = {};

    // Revenue multiple method
    if (data.financialMetrics?.revenue) {
      const revenueMultiple = getRevenueMultiple(data.businessInfo?.industry);
      methodologies.revenueMultiple = data.financialMetrics.revenue * revenueMultiple;
      valuation += methodologies.revenueMultiple * 0.4;
      confidence += 0.2;
    }

    // Market size method
    if (data.marketAnalysis?.marketSize) {
      const marketShare = 0.01; // Assume 1% market share
      methodologies.marketBased = data.marketAnalysis.marketSize * marketShare;
      valuation += methodologies.marketBased * 0.3;
      confidence += 0.15;
    }

    // Team and stage method
    if (data.businessInfo?.employeeCount && data.businessInfo?.stage) {
      const stageMultiplier = getStageMultiplier(data.businessInfo.stage);
      methodologies.teamBased = data.businessInfo.employeeCount * 100000 * stageMultiplier;
      valuation += methodologies.teamBased * 0.2;
      confidence += 0.1;
    }

    // Growth adjustment
    if (data.financialMetrics?.growth) {
      const growthAdjustment = 1 + (data.financialMetrics.growth / 100);
      valuation *= growthAdjustment;
      confidence += 0.1;
    }

    // Ensure minimum valuation
    valuation = Math.max(valuation, 100000);
    confidence = Math.min(confidence, 1);

    const result = {
      valuation: Math.round(valuation),
      confidence: Math.round(confidence * 100) / 100,
      methodologies,
      analysis: {
        summary: generateSummary(data, valuation),
        recommendations: generateRecommendations(data),
        risks: identifyRisks(data),
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Valuation calculation failed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Calculation failed'
    });
  }
});

function getRevenueMultiple(industry?: string): number {
  const multiples: Record<string, number> = {
    'technology': 8,
    'saas': 10,
    'fintech': 6,
    'healthtech': 7,
    'ecommerce': 4,
    'default': 5
  };
  
  return multiples[industry?.toLowerCase() || 'default'] || multiples.default;
}

function getStageMultiplier(stage: string): number {
  const multipliers: Record<string, number> = {
    'ideation': 0.5,
    'mvp': 1,
    'beta': 1.5,
    'revenue': 2,
    'growth': 3,
    'scale': 4
  };
  
  return multipliers[stage.toLowerCase()] || 1;
}

function generateSummary(data: any, valuation: number): string {
  const company = data.businessInfo?.companyName || 'Your startup';
  const industry = data.businessInfo?.industry || 'technology';
  
  return `${company} is a ${industry} company with an estimated valuation of $${valuation.toLocaleString()}. This valuation is based on current financial metrics, market analysis, and industry benchmarks.`;
}

function generateRecommendations(data: any): string[] {
  const recommendations = [];
  
  if (!data.financialMetrics?.revenue || data.financialMetrics.revenue < 100000) {
    recommendations.push('Focus on achieving consistent revenue growth');
  }
  
  if (!data.marketAnalysis?.marketSize || data.marketAnalysis.marketSize < 1000000) {
    recommendations.push('Conduct thorough market size analysis');
  }
  
  if (!data.businessInfo?.employeeCount || data.businessInfo.employeeCount < 5) {
    recommendations.push('Consider expanding your core team');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue executing your growth strategy');
  }
  
  return recommendations;
}

function identifyRisks(data: any): string[] {
  const risks = [];
  
  if (data.financialMetrics?.runway && data.financialMetrics.runway < 12) {
    risks.push('Limited runway - consider fundraising soon');
  }
  
  if (data.marketAnalysis?.competitors && data.marketAnalysis.competitors > 10) {
    risks.push('High competition in market');
  }
  
  if (!data.financialMetrics?.revenue) {
    risks.push('No revenue data provided - valuation has higher uncertainty');
  }
  
  return risks;
}

export default router;