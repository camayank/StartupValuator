import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { cache } from "../lib/cache";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { auditTrailService } from "./audit-trail-service";
import { hybridAIOrchestrator } from "./hybrid-ai-orchestrator";

// Validation schemas for AI responses
const marketAnalysisSchema = z.object({
  qualitativeAnalysis: z.object({
    trends: z.array(z.string()),
    competitiveAdvantages: z.array(z.string()),
    marketPosition: z.string(),
    growthPotential: z.object({
      assessment: z.string(),
      factors: z.array(z.string())
    })
  }),
  quantitativeAnalysis: z.object({
    metrics: z.record(z.number()),
    valuationMultiples: z.record(z.number()),
    growthRates: z.record(z.number()),
    confidenceIntervals: z.record(z.object({
      lower: z.number(),
      upper: z.number()
    }))
  }),
  combinedConfidence: z.number(),
  metadata: z.object({
    modelPerformance: z.array(z.object({
      model: z.string(),
      confidence: z.number(),
      executionTime: z.number()
    }))
  })
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
      // Use hybrid orchestrator for analysis
      const analysis = await hybridAIOrchestrator.routeAnalysis(data, "hybrid");
      marketAnalysisSchema.parse(analysis);

      // Check confidence threshold
      if (analysis.combinedConfidence < CONFIDENCE_THRESHOLD) {
        await this.requestHumanValidation(data, analysis, "low_confidence");
      }

      // Detect anomalies
      const hasAnomalies = this.detectAnomalies(analysis.quantitativeAnalysis.metrics);
      if (hasAnomalies) {
        await this.requestHumanValidation(data, analysis, "anomaly_detected");
      }

      // Cache the validated analysis
      cache.set(cacheKey, analysis, this.CACHE_TTL);

      // Record for audit trail
      await auditTrailService.recordAIAssumption(
        data.userId || "system",
        data.id || "default",
        {
          ...analysis,
          anomalies: hasAnomalies,
          requiresValidation: hasAnomalies || analysis.combinedConfidence < CONFIDENCE_THRESHOLD
        },
        {
          ipAddress: "system",
          userAgent: "EnhancedAIService",
          sessionId: "system"
        }
      );

      return analysis;
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

  private detectAnomalies(metrics: Record<string, number>): boolean {
    const values = Object.values(metrics);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );

    return values.some(value =>
      Math.abs(value - mean) > ANOMALY_THRESHOLD * stdDev
    );
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

  private combineRegulatoryCompliance(gptCompliance: any, claudeCompliance: any): any {
    const combinedCompliance = {
      soc2: gptCompliance.soc2 || claudeCompliance.soc2,
      ifrs: gptCompliance.ifrs || claudeCompliance.ifrs,
      gaap: gptCompliance.gaap || claudeCompliance.gaap,
      details: { ...gptCompliance.details, ...claudeCompliance.details }
    }
    return combinedCompliance;
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
}

export const enhancedAIService = new EnhancedAIService();