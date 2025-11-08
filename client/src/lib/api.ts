import type { ValuationFormData } from "./validations";
import { generateAIValuation } from "./services/aiValuationService";
import { calculateFinancialMetrics, getMetricsInsights } from "./services/financialMetricsService";
import { analyzeMarketComparables } from "./services/marketComparisonService";

export interface ValuationResponse {
  id: number;
  valuation: {
    valuation: number;
    multiplier: number;
    methodology: {
      dcfWeight: number;
      comparablesWeight: number;
      riskAdjustedWeight: number;
      aiAdjustedWeight: number;
      marketSentimentAdjustment: number;
    };
    confidenceScore: number;
    details: {
      baseValuation: number;
      methods: {
        dcf: { value: number; stages: any[] };
        comparables: { value: number; multiples: any };
        riskAdjusted: { value: number; factors: Record<string, number> };
        aiAdjusted: { value: number; factors: Record<string, number> };
      };
      scenarios: {
        worst: { value: number; probability: number };
        base: { value: number; probability: number };
        best: { value: number; probability: number };
        expectedValue: number;
      };
      sensitivityAnalysis: any;
      industryMetrics: any;
    };
    assumptions: any;
    marketAnalysis: {
      sentiment: any;
      trends: any;
      growthPotential: any;
    };
    aiInsights: {
      industryTrends: string[];
      riskFactors: string[];
      growthOpportunities: string[];
      recommendations: string[];
    };
  };
  message: string;
}

export async function calculateValuation(data: ValuationFormData): Promise<ValuationResponse> {
  try {
    // Validate the input data
    if (!data.businessInfo?.name?.trim()) {
      throw new Error("Business name is required");
    }

    console.log('Sending valuation request for:', data.businessInfo.name);

    // Calculate financial metrics
    const financialMetrics = calculateFinancialMetrics(data);
    const metricsInsights = getMetricsInsights(financialMetrics);

    // Get market comparison analysis
    const marketComparison = analyzeMarketComparables(
      data,
      data.businessInfo.sector
    );

    // Get AI-powered valuation
    const aiValuation = await generateAIValuation(data);

    // Combine insights
    const combinedInsights = [
      ...metricsInsights,
      ...aiValuation.recommendations,
      ...marketComparison.analysis.marketPosition.competitiveAdvantages,
    ];

    // Format the response
    const response: ValuationResponse = {
      id: Date.now(), // This will be replaced by the backend
      valuation: {
        valuation: aiValuation.valuation.base,
        multiplier: marketComparison.analysis.recommendedMultiples.revenue,
        methodology: {
          dcfWeight: 0.3,
          comparablesWeight: 0.3,
          riskAdjustedWeight: 0.2,
          aiAdjustedWeight: 0.2,
          marketSentimentAdjustment: financialMetrics.efficiency.cashEfficiencyScore / 100,
        },
        confidenceScore: aiValuation.valuation.confidence,
        details: {
          baseValuation: aiValuation.valuation.base,
          methods: {
            dcf: { 
              value: aiValuation.valuation.base * 0.9,
              stages: [
                {
                  period: "Current",
                  revenue: financialMetrics.revenue.arr,
                  growth: financialMetrics.revenue.growthRate
                }
              ]
            },
            comparables: { 
              value: marketComparison.benchmarks.averageValuation,
              multiples: {
                revenue: marketComparison.analysis.recommendedMultiples.revenue,
                ebitda: marketComparison.analysis.recommendedMultiples.ebitda,
                earningsPotential: financialMetrics.efficiency.grossMargin
              }
            },
            riskAdjusted: { 
              value: aiValuation.valuation.base * 0.95,
              factors: {
                ...aiValuation.methodology.adjustments,
                cashEfficiency: financialMetrics.efficiency.cashEfficiencyScore / 100,
                marketPenetration: financialMetrics.market.penetrationRate / 100
              }
            },
            aiAdjusted: { 
              value: aiValuation.valuation.base,
              factors: aiValuation.methodology.weights
            },
          },
          scenarios: {
            worst: { value: Math.min(aiValuation.valuation.low, marketComparison.benchmarks.valuationRange.min), probability: 0.25 },
            base: { value: aiValuation.valuation.base, probability: 0.5 },
            best: { value: Math.max(aiValuation.valuation.high, marketComparison.benchmarks.valuationRange.max), probability: 0.25 },
            expectedValue: aiValuation.valuation.base,
          },
          sensitivityAnalysis: {
            revenueGrowth: financialMetrics.revenue.growthRate,
            margins: financialMetrics.efficiency.grossMargin,
            burnRate: financialMetrics.ratios.burnRate,
            marketPenetration: financialMetrics.market.penetrationRate,
            competitorValuations: marketComparison.benchmarks
          },
          industryMetrics: {
            ltvCac: financialMetrics.ratios.ltvCacRatio,
            runway: financialMetrics.ratios.runway,
            efficiency: financialMetrics.efficiency.cashEfficiencyScore,
            benchmarks: marketComparison.benchmarks.metrics
          },
        },
        assumptions: {
          growth: financialMetrics.revenue.growthRate,
          margins: financialMetrics.efficiency.grossMargin,
          marketSize: financialMetrics.market.tam,
          competitorMultiples: marketComparison.analysis.recommendedMultiples
        },
        marketAnalysis: {
          sentiment: {
            strengths: aiValuation.analysis.strengths,
            weaknesses: aiValuation.analysis.weaknesses,
            competitivePosition: marketComparison.analysis.marketPosition
          },
          trends: {
            opportunities: aiValuation.analysis.opportunities,
            threats: aiValuation.analysis.threats,
            marketChallenges: marketComparison.analysis.marketPosition.challenges
          },
          growthPotential: {
            tam: financialMetrics.market.tam,
            sam: financialMetrics.market.sam,
            som: financialMetrics.market.som,
            penetrationRate: financialMetrics.market.penetrationRate,
            competitors: marketComparison.competitors
          },
        },
        aiInsights: {
          industryTrends: metricsInsights,
          riskFactors: [
            ...aiValuation.analysis.threats,
            ...marketComparison.analysis.marketPosition.challenges
          ],
          growthOpportunities: [
            ...aiValuation.analysis.opportunities,
            ...marketComparison.analysis.marketPosition.competitiveAdvantages
          ],
          recommendations: combinedInsights,
        },
      },
      message: "Valuation completed successfully",
    };

    console.log('Valuation calculation completed successfully');
    return response;
  } catch (error: any) {
    console.error('Valuation calculation error:', error);
    throw new Error(error.message || 'Failed to calculate valuation');
  }
}

export async function generateReport(valuationId: number): Promise<Blob> {
  try {
    console.log('Generating report for valuation:', valuationId);

    const response = await fetch(`/api/valuations/${valuationId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(`Rate limit exceeded. Please try again in ${errorData.retryAfter} seconds.`);
      }

      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Generated report is empty");
    }

    // Validate the blob content type
    if (!blob.type.includes('pdf') && !blob.type.includes('json') && !blob.type.includes('xlsx')) {
      throw new Error("Invalid report format received");
    }

    console.log('Report generated successfully');
    return blob;
  } catch (error: any) {
    console.error('Report generation error:', error);
    throw new Error(error.message || 'Failed to generate report');
  }
}