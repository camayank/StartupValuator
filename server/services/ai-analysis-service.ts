import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { openAIService, anthropicService } from "./ai-service";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024

export interface MarketAnalysisResult {
  trends: {
    key: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }[];
  competitors: {
    name: string;
    strengths: string[];
    weaknesses: string[];
    marketShare?: number;
  }[];
  opportunities: string[];
  threats: string[];
  marketSize: {
    total: number;
    addressable: number;
    obtainable: number;
    growthRate: number;
    confidence: number;
  };
}

export interface RiskAssessmentResult {
  overall: {
    score: number;
    confidence: number;
    summary: string;
  };
  categories: {
    market: number;
    financial: number;
    operational: number;
    technical: number;
    regulatory: number;
  };
  keyRisks: {
    description: string;
    severity: 'low' | 'medium' | 'high';
    likelihood: 'low' | 'medium' | 'high';
    mitigationStrategies: string[];
  }[];
}

export interface GrowthProjectionResult {
  revenueProjections: {
    period: string;
    conservative: number;
    expected: number;
    optimistic: number;
  }[];
  growthDrivers: {
    driver: string;
    impact: number;
    confidence: number;
  }[];
  assumptions: {
    category: string;
    value: string;
    rationale: string;
  }[];
  sensitivity: {
    factor: string;
    lowImpact: number;
    highImpact: number;
  }[];
}

export interface TeamAnalysisResult {
  overallScore: number;
  expertise: {
    technical: number;
    domain: number;
    business: number;
    leadership: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface IPAssessmentResult {
  score: number;
  analysis: {
    patents: {
      count: number;
      strength: number;
      coverage: string[];
    };
    trademarks: {
      count: number;
      value: number;
      categories: string[];
    };
    technicalIP: {
      description: string;
      complexity: number;
      uniqueness: number;
    };
  };
  recommendations: string[];
  risks: string[];
}

export class AIAnalysisService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI();
    this.anthropic = new Anthropic();
  }

  async analyzeMarket(data: ValuationFormData): Promise<MarketAnalysisResult> {
    try {
      // Multi-model consensus approach
      const [openAIAnalysis, anthropicAnalysis] = await Promise.all([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a market analysis expert. Analyze the startup's market potential, competition, and trends."
            },
            {
              role: "user",
              content: JSON.stringify(data)
            }
          ],
          response_format: { type: "json_object" }
        }),
        this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Analyze this startup's market data and provide insights in JSON format: ${JSON.stringify(data)}`
          }]
        })
      ]);

      // Combine and reconcile insights from both models
      const openAIResults = JSON.parse(openAIAnalysis.choices[0].message.content || "{}");
      const anthropicResults = JSON.parse(anthropicAnalysis.content);

      return this.reconcileMarketAnalysis(openAIResults, anthropicResults);
    } catch (error) {
      console.error("Market analysis error:", error);
      throw new Error("Failed to analyze market data");
    }
  }

  async assessRisks(data: ValuationFormData): Promise<RiskAssessmentResult> {
    try {
      // Multi-model risk assessment
      const [openAIRisks, anthropicRisks] = await Promise.all([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a risk assessment expert. Analyze the startup's risks across all major categories."
            },
            {
              role: "user",
              content: JSON.stringify(data)
            }
          ],
          response_format: { type: "json_object" }
        }),
        this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Provide a comprehensive risk assessment for this startup in JSON format: ${JSON.stringify(data)}`
          }]
        })
      ]);

      const openAIResults = JSON.parse(openAIRisks.choices[0].message.content || "{}");
      const anthropicResults = JSON.parse(anthropicRisks.content);

      return this.reconcileRiskAssessment(openAIResults, anthropicResults);
    } catch (error) {
      console.error("Risk assessment error:", error);
      throw new Error("Failed to assess risks");
    }
  }

  async generateGrowthProjections(data: ValuationFormData): Promise<GrowthProjectionResult> {
    try {
      // Multi-model growth projections
      const [openAIProjections, anthropicProjections] = await Promise.all([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a growth forecasting expert. Generate detailed growth projections for the startup."
            },
            {
              role: "user",
              content: JSON.stringify(data)
            }
          ],
          response_format: { type: "json_object" }
        }),
        this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate detailed growth projections for this startup in JSON format: ${JSON.stringify(data)}`
          }]
        })
      ]);

      const openAIResults = JSON.parse(openAIProjections.choices[0].message.content || "{}");
      const anthropicResults = JSON.parse(anthropicProjections.content);

      return this.reconcileGrowthProjections(openAIResults, anthropicResults);
    } catch (error) {
      console.error("Growth projections error:", error);
      throw new Error("Failed to generate growth projections");
    }
  }

  async analyzeTeam(data: ValuationFormData): Promise<TeamAnalysisResult> {
    try {
      // Multi-model team analysis
      const [openAIAnalysis, anthropicAnalysis] = await Promise.all([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a team assessment expert. Evaluate the startup team's capabilities and potential."
            },
            {
              role: "user",
              content: JSON.stringify(data)
            }
          ],
          response_format: { type: "json_object" }
        }),
        this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Analyze this startup team's capabilities in JSON format: ${JSON.stringify(data)}`
          }]
        })
      ]);

      const openAIResults = JSON.parse(openAIAnalysis.choices[0].message.content || "{}");
      const anthropicResults = JSON.parse(anthropicAnalysis.content);

      return this.reconcileTeamAnalysis(openAIResults, anthropicResults);
    } catch (error) {
      console.error("Team analysis error:", error);
      throw new Error("Failed to analyze team");
    }
  }

  async assessIP(data: ValuationFormData): Promise<IPAssessmentResult> {
    try {
      // Multi-model IP assessment
      const [openAIAssessment, anthropicAssessment] = await Promise.all([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an intellectual property expert. Analyze the startup's IP assets and potential."
            },
            {
              role: "user",
              content: JSON.stringify(data)
            }
          ],
          response_format: { type: "json_object" }
        }),
        this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Assess this startup's intellectual property portfolio in JSON format: ${JSON.stringify(data)}`
          }]
        })
      ]);

      const openAIResults = JSON.parse(openAIAssessment.choices[0].message.content || "{}");
      const anthropicResults = JSON.parse(anthropicAssessment.content);

      return this.reconcileIPAssessment(openAIResults, anthropicResults);
    } catch (error) {
      console.error("IP assessment error:", error);
      throw new Error("Failed to assess IP");
    }
  }

  private reconcileMarketAnalysis(openAIResults: any, anthropicResults: any): MarketAnalysisResult {
    // Combine and average insights from both models
    return {
      trends: this.mergeTrends(openAIResults.trends, anthropicResults.trends),
      competitors: this.mergeCompetitors(openAIResults.competitors, anthropicResults.competitors),
      opportunities: [...new Set([...(openAIResults.opportunities || []), ...(anthropicResults.opportunities || [])])],
      threats: [...new Set([...(openAIResults.threats || []), ...(anthropicResults.threats || [])])],
      marketSize: this.averageMarketSize(openAIResults.marketSize, anthropicResults.marketSize)
    };
  }

  private reconcileRiskAssessment(openAIResults: any, anthropicResults: any): RiskAssessmentResult {
    return {
      overall: this.averageOverallRisk(openAIResults.overall, anthropicResults.overall),
      categories: this.averageRiskCategories(openAIResults.categories, anthropicResults.categories),
      keyRisks: this.mergeKeyRisks(openAIResults.keyRisks, anthropicResults.keyRisks)
    };
  }

  private reconcileGrowthProjections(openAIResults: any, anthropicResults: any): GrowthProjectionResult {
    return {
      revenueProjections: this.averageRevenueProjections(
        openAIResults.revenueProjections,
        anthropicResults.revenueProjections
      ),
      growthDrivers: this.mergeGrowthDrivers(
        openAIResults.growthDrivers,
        anthropicResults.growthDrivers
      ),
      assumptions: this.mergeAssumptions(
        openAIResults.assumptions,
        anthropicResults.assumptions
      ),
      sensitivity: this.mergeSensitivity(
        openAIResults.sensitivity,
        anthropicResults.sensitivity
      )
    };
  }

  private reconcileTeamAnalysis(openAIResults: any, anthropicResults: any): TeamAnalysisResult {
    return {
      overallScore: (openAIResults.overallScore + anthropicResults.overallScore) / 2,
      expertise: this.averageExpertise(openAIResults.expertise, anthropicResults.expertise),
      strengths: [...new Set([...(openAIResults.strengths || []), ...(anthropicResults.strengths || [])])],
      gaps: [...new Set([...(openAIResults.gaps || []), ...(anthropicResults.gaps || [])])],
      recommendations: [...new Set([...(openAIResults.recommendations || []), ...(anthropicResults.recommendations || [])])]
    };
  }

  private reconcileIPAssessment(openAIResults: any, anthropicResults: any): IPAssessmentResult {
    return {
      score: (openAIResults.score + anthropicResults.score) / 2,
      analysis: {
        patents: this.averagePatentAnalysis(openAIResults.analysis?.patents, anthropicResults.analysis?.patents),
        trademarks: this.averageTrademarkAnalysis(openAIResults.analysis?.trademarks, anthropicResults.analysis?.trademarks),
        technicalIP: this.averageTechnicalIP(openAIResults.analysis?.technicalIP, anthropicResults.analysis?.technicalIP)
      },
      recommendations: [...new Set([...(openAIResults.recommendations || []), ...(anthropicResults.recommendations || [])])],
      risks: [...new Set([...(openAIResults.risks || []), ...(anthropicResults.risks || [])])]
    };
  }

  // Helper methods for reconciliation
  private mergeTrends(trends1: any[], trends2: any[]): any[] {
    const mergedTrends = [...(trends1 || []), ...(trends2 || [])];
    return this.deduplicateByKey(mergedTrends, 'key');
  }

  private mergeCompetitors(competitors1: any[], competitors2: any[]): any[] {
    const mergedCompetitors = [...(competitors1 || []), ...(competitors2 || [])];
    return this.deduplicateByKey(mergedCompetitors, 'name');
  }

  private averageMarketSize(size1: any, size2: any): any {
    if (!size1 || !size2) return size1 || size2 || {};
    return {
      total: (size1.total + size2.total) / 2,
      addressable: (size1.addressable + size2.addressable) / 2,
      obtainable: (size1.obtainable + size2.obtainable) / 2,
      growthRate: (size1.growthRate + size2.growthRate) / 2,
      confidence: (size1.confidence + size2.confidence) / 2
    };
  }

  private deduplicateByKey(array: any[], key: string): any[] {
    return Array.from(new Map(array.map(item => [item[key], item])).values());
  }

  private averageExpertise(exp1: any, exp2: any): any {
    if (!exp1 || !exp2) return exp1 || exp2 || {};
    return {
      technical: (exp1.technical + exp2.technical) / 2,
      domain: (exp1.domain + exp2.domain) / 2,
      business: (exp1.business + exp2.business) / 2,
      leadership: (exp1.leadership + exp2.leadership) / 2
    };
  }

  private averageOverallRisk(risk1: any, risk2: any): any {
    if (!risk1 || !risk2) return risk1 || risk2 || {};
    return {
      score: (risk1.score + risk2.score) / 2,
      confidence: (risk1.confidence + risk2.confidence) / 2,
      summary: this.combineTexts(risk1.summary, risk2.summary)
    };
  }

  private combineTexts(text1: string, text2: string): string {
    return [text1, text2].filter(Boolean).join(' ');
  }

  private mergeKeyRisks(risks1: any[], risks2: any[]): any[] {
    const mergedRisks = [...(risks1 || []), ...(risks2 || [])];
    return this.deduplicateByKey(mergedRisks, 'description');
  }

  private averageRiskCategories(cat1: any, cat2: any): any {
    if (!cat1 || !cat2) return cat1 || cat2 || {};
    return {
      market: (cat1.market + cat2.market) / 2,
      financial: (cat1.financial + cat2.financial) / 2,
      operational: (cat1.operational + cat2.operational) / 2,
      technical: (cat1.technical + cat2.technical) / 2,
      regulatory: (cat1.regulatory + cat2.regulatory) / 2
    };
  }

  private averageRevenueProjections(proj1: any[], proj2: any[]): any[] {
    if (!proj1 || !proj2) return proj1 || proj2 || [];
    return proj1.map((p1, index) => {
      const p2 = proj2[index] || {};
      return {
        period: p1.period,
        conservative: (p1.conservative + (p2.conservative || 0)) / 2,
        expected: (p1.expected + (p2.expected || 0)) / 2,
        optimistic: (p1.optimistic + (p2.optimistic || 0)) / 2
      };
    });
  }

  private mergeGrowthDrivers(drivers1: any[], drivers2: any[]): any[] {
    const mergedDrivers = [...(drivers1 || []), ...(drivers2 || [])];
    return this.deduplicateByKey(mergedDrivers, 'driver');
  }

  private mergeAssumptions(assumptions1: any[], assumptions2: any[]): any[] {
    const mergedAssumptions = [...(assumptions1 || []), ...(assumptions2 || [])];
    return this.deduplicateByKey(mergedAssumptions, 'category');
  }

  private mergeSensitivity(sensitivity1: any[], sensitivity2: any[]): any[] {
    const mergedSensitivity = [...(sensitivity1 || []), ...(sensitivity2 || [])];
    return this.deduplicateByKey(mergedSensitivity, 'factor');
  }

  private averagePatentAnalysis(patents1: any, patents2: any): any {
    if (!patents1 || !patents2) return patents1 || patents2 || {};
    return {
      count: Math.floor((patents1.count + patents2.count) / 2),
      strength: (patents1.strength + patents2.strength) / 2,
      coverage: [...new Set([...(patents1.coverage || []), ...(patents2.coverage || [])])]
    };
  }

  private averageTrademarkAnalysis(tm1: any, tm2: any): any {
    if (!tm1 || !tm2) return tm1 || tm2 || {};
    return {
      count: Math.floor((tm1.count + tm2.count) / 2),
      value: (tm1.value + tm2.value) / 2,
      categories: [...new Set([...(tm1.categories || []), ...(tm2.categories || [])])]
    };
  }

  private averageTechnicalIP(tech1: any, tech2: any): any {
    if (!tech1 || !tech2) return tech1 || tech2 || {};
    return {
      description: this.combineTexts(tech1.description, tech2.description),
      complexity: (tech1.complexity + tech2.complexity) / 2,
      uniqueness: (tech1.uniqueness + tech2.uniqueness) / 2
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();