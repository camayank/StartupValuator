import { OpenAI } from "openai";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { blockchainService } from "./blockchain-service";
import { aiAnalysisService } from "./ai-analysis-service";
import Decimal from "decimal.js";

interface PatternAnalysisResult {
  successPatterns: Array<{
    pattern: string;
    confidence: number;
    impact: number;
    examples: string[];
  }>;
  riskPatterns: Array<{
    pattern: string;
    riskLevel: 'low' | 'medium' | 'high';
    mitigation: string[];
    examples: string[];
  }>;
  marketPatterns: Array<{
    trend: string;
    correlation: number;
    prediction: string;
    confidence: number;
  }>;
  recommendations: Array<{
    action: string;
    reasoning: string;
    expectedImpact: number;
    timeframe: string;
  }>;
}

export class PatternRecognitionService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async analyzePatterns(data: ValuationFormData): Promise<PatternAnalysisResult> {
    try {
      // Get historical valuation data from blockchain
      const valuationHistory = await blockchainService.getValuationHistory(data.businessInfo.id);
      
      // Get market analysis and risk assessment
      const [marketAnalysis, riskAssessment] = await Promise.all([
        aiAnalysisService.analyzeMarket(data),
        aiAnalysisService.assessRisks(data)
      ]);

      // Prepare dataset for pattern analysis
      const analysisData = {
        historicalValuations: valuationHistory,
        currentData: data,
        marketContext: marketAnalysis,
        riskProfile: riskAssessment
      };

      // Use AI to identify patterns
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a pattern recognition expert specializing in startup valuations. Analyze the data to identify success patterns, risk patterns, and market correlations."
          },
          {
            role: "user",
            content: JSON.stringify(analysisData)
          }
        ],
        response_format: { type: "json_object" }
      });

      const patterns = JSON.parse(response.choices[0].message.content || "{}");

      // Calculate success metrics using Decimal.js for precision
      const successMetrics = this.calculateSuccessMetrics(valuationHistory);

      // Enhance patterns with quantitative analysis
      return this.enhancePatternAnalysis(patterns, successMetrics);
    } catch (error) {
      console.error("Pattern analysis error:", error);
      throw new Error("Failed to analyze patterns");
    }
  }

  private calculateSuccessMetrics(history: any[]): Record<string, Decimal> {
    const metrics: Record<string, Decimal> = {};
    
    if (history.length === 0) return metrics;

    // Calculate growth rates
    const growthRates = history.map((v, i) => {
      if (i === 0) return new Decimal(0);
      const prev = new Decimal(history[i - 1].valuationAmount);
      const curr = new Decimal(v.valuationAmount);
      return curr.div(prev).minus(1).mul(100);
    });

    // Calculate key metrics
    metrics.averageGrowth = growthRates.reduce((a, b) => a.plus(b), new Decimal(0))
      .div(Math.max(1, growthRates.length - 1));
    
    metrics.volatility = this.calculateVolatility(growthRates);
    metrics.momentum = this.calculateMomentum(history);

    return metrics;
  }

  private calculateVolatility(rates: Decimal[]): Decimal {
    if (rates.length < 2) return new Decimal(0);
    
    const mean = rates.reduce((a, b) => a.plus(b), new Decimal(0))
      .div(rates.length);
    
    const squaredDiffs = rates.map(r => r.minus(mean).pow(2));
    return squaredDiffs.reduce((a, b) => a.plus(b), new Decimal(0))
      .div(rates.length - 1)
      .sqrt();
  }

  private calculateMomentum(history: any[]): Decimal {
    if (history.length < 2) return new Decimal(0);
    
    const recentPeriod = history.slice(-3);
    const olderPeriod = history.slice(-6, -3);
    
    const recentAvg = recentPeriod.reduce((a, v) => a.plus(v.valuationAmount), new Decimal(0))
      .div(recentPeriod.length);
    const olderAvg = olderPeriod.reduce((a, v) => a.plus(v.valuationAmount), new Decimal(0))
      .div(olderPeriod.length);
    
    return recentAvg.div(olderAvg).minus(1).mul(100);
  }

  private enhancePatternAnalysis(patterns: any, metrics: Record<string, Decimal>): PatternAnalysisResult {
    // Enhance patterns with quantitative metrics
    return {
      ...patterns,
      successPatterns: patterns.successPatterns.map((p: any) => ({
        ...p,
        confidence: p.confidence * (1 + metrics.momentum.toNumber() / 100),
        impact: p.impact * (1 + metrics.averageGrowth.toNumber() / 100)
      })),
      marketPatterns: patterns.marketPatterns.map((p: any) => ({
        ...p,
        correlation: p.correlation * (1 - metrics.volatility.toNumber() / 200)
      }))
    };
  }
}

export const patternRecognitionService = new PatternRecognitionService();
