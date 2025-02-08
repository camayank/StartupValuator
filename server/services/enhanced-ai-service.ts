import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { cache } from "../lib/cache";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { auditTrailService } from "./audit-trail-service";

// Validation schemas for AI responses
const marketAnalysisSchema = z.object({
  trends: z.array(z.string()),
  impact: z.record(z.number()),
  confidence: z.number(),
  recommendations: z.array(z.string()),
});

const riskAssessmentSchema = z.object({
  score: z.number(),
  factors: z.array(z.object({
    category: z.string(),
    severity: z.number(),
    mitigation: z.array(z.string()),
  })),
});

export class EnhancedAIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private readonly CACHE_TTL = 3600; // 1 hour cache

  constructor() {
    this.openai = new OpenAI();
    this.anthropic = new Anthropic();
  }

  async analyzeMarket(data: ValuationFormData) {
    const cacheKey = `market_analysis_${JSON.stringify(data)}`;
    const cachedAnalysis = cache.get(cacheKey);

    if (cachedAnalysis) {
      return cachedAnalysis;
    }

    try {
      // Get analysis from both models
      const [gptAnalysis, claudeAnalysis] = await Promise.all([
        this.getGPTMarketAnalysis(data),
        this.getClaudeMarketAnalysis(data)
      ]);

      // Combine and validate insights
      const combinedAnalysis = this.combineMarketAnalysis(gptAnalysis, claudeAnalysis);
      marketAnalysisSchema.parse(combinedAnalysis);

      // Cache the validated analysis
      cache.set(cacheKey, combinedAnalysis, this.CACHE_TTL);

      // Record AI-generated assumptions for audit
      await auditTrailService.recordAIAssumption(
        "system", // Replace with actual user ID in production
        data.businessInfo.id || "default",
        combinedAnalysis,
        {
          ipAddress: "system",
          userAgent: "EnhancedAIService",
          sessionId: "system"
        }
      );

      return combinedAnalysis;
    } catch (error) {
      console.error('Enhanced market analysis error:', error);
      throw new Error('Failed to perform market analysis');
    }
  }

  async assessRisks(data: ValuationFormData) {
    const cacheKey = `risk_assessment_${JSON.stringify(data)}`;
    const cachedAssessment = cache.get(cacheKey);

    if (cachedAssessment) {
      return cachedAssessment;
    }

    try {
      // Get risk assessments from both models
      const [gptRisks, claudeRisks] = await Promise.all([
        this.getGPTRiskAssessment(data),
        this.getClaudeRiskAssessment(data)
      ]);

      // Combine and validate risk assessments
      const combinedRisks = this.combineRiskAssessments(gptRisks, claudeRisks);
      riskAssessmentSchema.parse(combinedRisks);

      // Cache the validated assessment
      cache.set(cacheKey, combinedRisks, this.CACHE_TTL);

      return combinedRisks;
    } catch (error) {
      console.error('Enhanced risk assessment error:', error);
      throw new Error('Failed to assess risks');
    }
  }

  private async getGPTMarketAnalysis(data: ValuationFormData) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a market analysis expert specializing in startup valuations. Analyze the market conditions, trends, and competitive landscape."
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async getClaudeMarketAnalysis(data: ValuationFormData) {
    const message = await this.anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system: "You are a market analysis expert specializing in startup valuations. Analyze the market conditions, trends, and competitive landscape.",
      messages: [{
        role: "user",
        content: JSON.stringify(data)
      }]
    });

    return JSON.parse(message.content[0].text);
  }

  private async getGPTRiskAssessment(data: ValuationFormData) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a risk assessment expert specializing in startup valuations. Analyze potential risks and provide mitigation strategies."
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async getClaudeRiskAssessment(data: ValuationFormData) {
    const message = await this.anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system: "You are a risk assessment expert specializing in startup valuations. Analyze potential risks and provide mitigation strategies.",
      messages: [{
        role: "user",
        content: JSON.stringify(data)
      }]
    });

    return JSON.parse(message.content[0].text);
  }

  private combineMarketAnalysis(gptAnalysis: any, claudeAnalysis: any) {
    // Implement sophisticated combining logic
    // Weight insights based on confidence scores and cross-validation
    return {
      trends: [...new Set([...gptAnalysis.trends, ...claudeAnalysis.trends])],
      impact: this.combineImpactScores(gptAnalysis.impact, claudeAnalysis.impact),
      confidence: (gptAnalysis.confidence + claudeAnalysis.confidence) / 2,
      recommendations: this.combineAndRankRecommendations(
        gptAnalysis.recommendations,
        claudeAnalysis.recommendations
      ),
    };
  }

  private combineRiskAssessments(gptRisks: any, claudeRisks: any) {
    // Implement sophisticated risk combining logic
    // Prioritize higher risk scores and unique insights
    return {
      score: Math.max(gptRisks.score, claudeRisks.score),
      factors: this.combineAndPrioritizeRiskFactors(
        gptRisks.factors,
        claudeRisks.factors
      ),
    };
  }

  private combineImpactScores(gptImpact: Record<string, number>, claudeImpact: Record<string, number>) {
    const combined: Record<string, number> = {};
    const allFactors = new Set([...Object.keys(gptImpact), ...Object.keys(claudeImpact)]);

    for (const factor of allFactors) {
      if (gptImpact[factor] && claudeImpact[factor]) {
        // If both models identified the factor, take weighted average
        combined[factor] = (gptImpact[factor] * 0.6 + claudeImpact[factor] * 0.4);
      } else {
        // If only one model identified it, use that score with a penalty
        combined[factor] = (gptImpact[factor] || claudeImpact[factor]) * 0.8;
      }
    }

    return combined;
  }

  private combineAndRankRecommendations(gptRecs: string[], claudeRecs: string[]) {
    // Combine unique recommendations and sort by frequency
    const recMap = new Map<string, number>();

    [...gptRecs, ...claudeRecs].forEach(rec => {
      recMap.set(rec, (recMap.get(rec) || 0) + 1);
    });

    return Array.from(recMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([rec]) => rec)
      .slice(0, 5); // Return top 5 recommendations
  }

  private combineAndPrioritizeRiskFactors(gptFactors: any[], claudeFactors: any[]) {
    const combinedFactors = new Map();

    // Process factors from both models
    [...gptFactors, ...claudeFactors].forEach(factor => {
      const key = factor.category;
      if (!combinedFactors.has(key)) {
        combinedFactors.set(key, {
          category: factor.category,
          severity: factor.severity,
          mitigation: factor.mitigation,
          count: 1
        });
      } else {
        const existing = combinedFactors.get(key);
        existing.severity = Math.max(existing.severity, factor.severity);
        existing.mitigation = [...new Set([...existing.mitigation, ...factor.mitigation])];
        existing.count++;
      }
    });

    // Convert to array and sort by severity and agreement (count)
    return Array.from(combinedFactors.values())
      .sort((a, b) => b.severity - a.severity || b.count - a.count)
      .map(({ category, severity, mitigation }) => ({
        category,
        severity,
        mitigation
      }));
  }
}

export const enhancedAIService = new EnhancedAIService();