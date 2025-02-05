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
  async analyzeMarket(data: ValuationFormData): Promise<MarketAnalysisResult> {
    try {
      return await openAIService.analyzeMarket(data);
    } catch (error) {
      console.error("Market analysis error:", error);
      throw new Error("Failed to analyze market data");
    }
  }

  async assessRisks(data: ValuationFormData): Promise<RiskAssessmentResult> {
    try {
      return await anthropicService.analyzeRisks(data);
    } catch (error) {
      console.error("Risk assessment error:", error);
      throw new Error("Failed to assess risks");
    }
  }

  async generateGrowthProjections(data: ValuationFormData): Promise<GrowthProjectionResult> {
    try {
      return await openAIService.generateGrowthProjections(data);
    } catch (error) {
      console.error("Growth projections error:", error);
      throw new Error("Failed to generate growth projections");
    }
  }

  async analyzeTeam(data: ValuationFormData): Promise<TeamAnalysisResult> {
    try {
      return await anthropicService.analyzeTeam(data);
    } catch (error) {
      console.error("Team analysis error:", error);
      throw new Error("Failed to analyze team");
    }
  }

  async assessIP(data: ValuationFormData): Promise<IPAssessmentResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an intellectual property expert. Analyze the company's IP assets including patents, trademarks, and technical IP. Provide valuation and recommendations.",
          },
          {
            role: "user",
            content: JSON.stringify(data),
          },
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("IP assessment error:", error);
      throw new Error("Failed to assess IP");
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();