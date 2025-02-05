import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { ValuationFormData } from "../../client/src/lib/validations";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Types for responses
export interface AIValuationResponse {
  valuation: {
    base: number;
    low: number;
    high: number;
    confidence: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
  methodology: {
    weights: {
      revenue: number;
      market: number;
      team: number;
      technology: number;
      traction: number;
    };
    adjustments: Record<string, number>;
  };
}

// OpenAI-based analysis service
export class OpenAIService {
  async generateValuation(data: ValuationFormData): Promise<AIValuationResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert startup valuator specializing in comprehensive market analysis and valuation.
                     Analyze the provided business data considering:
                     1. Current market conditions and trends
                     2. Industry-specific growth patterns
                     3. Competitive landscape
                     4. Team capabilities and track record
                     5. Technology differentiation
                     Generate a detailed valuation with confidence scores based on these factors.`,
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
      console.error("OpenAI Valuation error:", error);
      throw new Error("Failed to generate OpenAI valuation");
    }
  }

  async analyzeMarket(data: ValuationFormData) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the market conditions and competitive landscape for this business.
                   Consider:
                   1. Market size and growth potential
                   2. Competitive intensity and barriers to entry
                   3. Regulatory environment
                   4. Technology trends and disruption potential
                   5. Customer segment analysis`,
        },
        {
          role: "user",
          content: JSON.stringify(data),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async generateGrowthProjections(data: ValuationFormData) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate detailed growth projections and financial forecasts considering:
                   1. Historical growth patterns
                   2. Market penetration potential
                   3. Industry growth benchmarks
                   4. Resource scalability
                   5. Market size constraints
                   Provide confidence intervals for projections.`,
        },
        {
          role: "user",
          content: JSON.stringify(data),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }
}

// Anthropic-based analysis service
export class AnthropicService {
  async generateValuation(data: ValuationFormData): Promise<AIValuationResponse> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: JSON.stringify(data) }],
        system: `You are an expert startup valuator specializing in risk assessment and validation.
                Analyze the provided business data considering:
                1. Business model risks
                2. Market timing risks
                3. Technology risks
                4. Team capability gaps
                5. Competitive threats
                Output in JSON format matching the AIValuationResponse type.`,
      });

      const content = typeof response.content === "string" 
        ? response.content 
        : Array.isArray(response.content) 
        ? response.content[0].text 
        : "{}";

      return JSON.parse(content);
    } catch (error) {
      console.error("Anthropic Valuation error:", error);
      throw new Error("Failed to generate Anthropic valuation");
    }
  }

  async analyzeRisks(data: ValuationFormData) {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: JSON.stringify(data) }],
      system: `You are a risk assessment specialist. Analyze the business data and provide:
               1. Overall risk score (0-100)
               2. Category-specific risk breakdown
               3. Risk mitigation strategies
               4. Confidence levels per assessment
               5. Impact severity ratings
               Output in JSON format.`,
    });

    const content = typeof response.content === "string" 
      ? response.content 
      : Array.isArray(response.content) 
      ? response.content[0].text 
      : "{}";

    return JSON.parse(content);
  }

  async analyzeTeam(data: ValuationFormData) {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: JSON.stringify(data) }],
      system: `You are a talent assessment expert. Analyze the team's:
               1. Industry expertise
               2. Technical capabilities
               3. Prior startup experience
               4. Leadership track record
               5. Key skill gaps
               Provide detailed scoring and recommendations. Output in JSON format.`,
    });

    const content = typeof response.content === "string" 
      ? response.content 
      : Array.isArray(response.content) 
      ? response.content[0].text 
      : "{}";

    return JSON.parse(content);
  }
}

export const openAIService = new OpenAIService();
export const anthropicService = new AnthropicService();