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
  justification: z.array(z.object({
    assumption: z.string(),
    reasoning: z.string(),
    sources: z.array(z.string()),
    confidence: z.number()
  }))
});

const riskAssessmentSchema = z.object({
  score: z.number(),
  factors: z.array(z.object({
    category: z.string(),
    severity: z.number(),
    mitigation: z.array(z.string()),
    justification: z.string(),
    confidence: z.number()
  })),
  regulatoryCompliance: z.object({
    soc2: z.boolean(),
    ifrs: z.boolean(),
    gaap: z.boolean(),
    details: z.record(z.string())
  })
});

const CONFIDENCE_THRESHOLD = 0.8;
const ANOMALY_THRESHOLD = 2.0; // Standard deviations for anomaly detection

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
      // Get analysis from both models with confidence scores
      const [gptAnalysis, claudeAnalysis] = await Promise.all([
        this.getGPTMarketAnalysis(data),
        this.getClaudeMarketAnalysis(data)
      ]);

      // Combine and validate insights
      const combinedAnalysis = this.combineMarketAnalysis(gptAnalysis, claudeAnalysis);
      marketAnalysisSchema.parse(combinedAnalysis);

      // Check confidence threshold
      if (combinedAnalysis.confidence < CONFIDENCE_THRESHOLD) {
        await this.requestHumanValidation(data, combinedAnalysis, "low_confidence");
      }

      // Detect anomalies in valuations
      const hasAnomalies = this.detectAnomalies(combinedAnalysis);
      if (hasAnomalies) {
        await this.requestHumanValidation(data, combinedAnalysis, "anomaly_detected");
      }

      // Cache the validated analysis
      cache.set(cacheKey, combinedAnalysis, this.CACHE_TTL);

      // Record AI-generated assumptions for audit
      await auditTrailService.recordAIAssumption(
        data.userId || "system",
        data.id || "default",
        {
          ...combinedAnalysis,
          anomalies: hasAnomalies,
          requiresValidation: hasAnomalies || combinedAnalysis.confidence < CONFIDENCE_THRESHOLD
        },
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

  private async requestHumanValidation(data: ValuationFormData, analysis: any, reason: string) {
    return auditTrailService.recordExpertValidation(
      "system",
      data.id || "default",
      {
        status: "requires_review",
        comments: `Automated review requested due to ${reason}`,
        adjustments: {}
      },
      {
        ipAddress: "system",
        userAgent: "EnhancedAIService",
        sessionId: "system"
      }
    );
  }

  private detectAnomalies(analysis: any): boolean {
    // Implement anomaly detection using statistical methods
    const values = Object.values(analysis.impact);
    const mean = values.reduce((a, b) => a + (b as number), 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow((b as number) - mean, 2), 0) / values.length
    );

    return values.some(value =>
      Math.abs((value as number) - mean) > ANOMALY_THRESHOLD * stdDev
    );
  }

  private async getGPTMarketAnalysis(data: ValuationFormData) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a market analysis expert specializing in startup valuations.
          Analyze the market conditions, trends, and competitive landscape.
          Provide detailed justification for each assumption using reliable sources.
          Consider IFRS and GAAP compliance requirements.`
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
      system: `You are a market analysis expert specializing in startup valuations.
      Analyze the market conditions, trends, and competitive landscape.
      Provide detailed justification for each assumption using reliable sources.
      Consider IFRS and GAAP compliance requirements.`,
      messages: [{
        role: "user",
        content: JSON.stringify(data)
      }]
    });

    return JSON.parse(message.content[0].text);
  }

  private combineMarketAnalysis(gptAnalysis: any, claudeAnalysis: any) {
    const combined = {
      trends: [...new Set([...gptAnalysis.trends, ...claudeAnalysis.trends])],
      impact: this.combineImpactScores(gptAnalysis.impact, claudeAnalysis.impact),
      confidence: this.calculateCombinedConfidence(gptAnalysis, claudeAnalysis),
      recommendations: this.combineAndRankRecommendations(
        gptAnalysis.recommendations,
        claudeAnalysis.recommendations
      ),
      justification: this.mergeJustifications(
        gptAnalysis.justification,
        claudeAnalysis.justification
      )
    };

    return combined;
  }

  private calculateCombinedConfidence(gptAnalysis: any, claudeAnalysis: any): number {
    // Weight confidences based on model performance and agreement
    const baseConfidence = (gptAnalysis.confidence + claudeAnalysis.confidence) / 2;
    const agreementFactor = this.calculateAgreementFactor(gptAnalysis, claudeAnalysis);
    return baseConfidence * agreementFactor;
  }

  private calculateAgreementFactor(gptAnalysis: any, claudeAnalysis: any): number {
    // Calculate agreement between models' predictions
    const trendAgreement = this.calculateSetOverlap(
      new Set(gptAnalysis.trends),
      new Set(claudeAnalysis.trends)
    );
    const impactAgreement = this.calculateImpactAgreement(
      gptAnalysis.impact,
      claudeAnalysis.impact
    );
    return (trendAgreement + impactAgreement) / 2;
  }

  private calculateSetOverlap(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private calculateImpactAgreement(impact1: Record<string, number>, impact2: Record<string, number>): number {
    const allFactors = new Set([...Object.keys(impact1), ...Object.keys(impact2)]);
    let totalDiff = 0;
    let count = 0;

    for (const factor of allFactors) {
      if (impact1[factor] !== undefined && impact2[factor] !== undefined) {
        totalDiff += Math.abs(impact1[factor] - impact2[factor]);
        count++;
      }
    }

    return count > 0 ? 1 - (totalDiff / count) : 0;
  }

  private mergeJustifications(just1: any[], just2: any[]): any[] {
    const merged = new Map();

    [...just1, ...just2].forEach(j => {
      const key = j.assumption;
      if (!merged.has(key)) {
        merged.set(key, {
          ...j,
          confidence: j.confidence,
          count: 1
        });
      } else {
        const existing = merged.get(key);
        existing.confidence = (existing.confidence * existing.count + j.confidence) / (existing.count + 1);
        existing.sources = [...new Set([...existing.sources, ...j.sources])];
        existing.count++;
      }
    });

    return Array.from(merged.values())
      .map(({ confidence, sources, assumption, reasoning }) => ({
        assumption,
        reasoning,
        sources,
        confidence
      }))
      .sort((a, b) => b.confidence - a.confidence);
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

  private combineRiskAssessments(gptRisks: any, claudeRisks: any) {
    // Implement sophisticated risk combining logic
    // Prioritize higher risk scores and unique insights
    return {
      score: Math.max(gptRisks.score, claudeRisks.score),
      factors: this.combineAndPrioritizeRiskFactors(
        gptRisks.factors,
        claudeRisks.factors
      ),
      regulatoryCompliance: this.combineRegulatoryCompliance(gptRisks.regulatoryCompliance, claudeRisks.regulatoryCompliance)
    };
  }

    private combineRegulatoryCompliance(gptCompliance: any, claudeCompliance: any): any {
        const combinedCompliance = {
            soc2: gptCompliance.soc2 || claudeCompliance.soc2,
            ifrs: gptCompliance.ifrs || claudeCompliance.ifrs,
            gaap: gptCompliance.gaap || claudeCompliance.gaap,
            details: { ...gptCompliance.details, ...claudeCompliance.details }
        }
        return combinedCompliance;
    }
}

export const enhancedAIService = new EnhancedAIService();