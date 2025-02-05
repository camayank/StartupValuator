import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { ValuationFormData } from "../../client/src/lib/validations";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export class AIService {
  async generateValuation(data: ValuationFormData): Promise<AIValuationResponse> {
    try {
      // Get OpenAI's valuation
      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert startup valuator. Analyze the provided business data and generate a detailed valuation with confidence scores.",
          },
          {
            role: "user",
            content: JSON.stringify(data),
          },
        ],
        response_format: { type: "json_object" },
      });

      // Get Anthropic's valuation
      const anthropicResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: JSON.stringify(data) }],
        system: "You are an expert startup valuator. Analyze the provided business data and generate a detailed valuation with confidence scores. Output in JSON format.",
      });

      // Parse both responses
      const openaiValuation = JSON.parse(openaiResponse.choices[0].message.content || "{}");
      const anthropicValuation = JSON.parse(
        typeof anthropicResponse.content === "string"
          ? anthropicResponse.content
          : anthropicResponse.content[0]?.text || "{}"
      );

      // Combine and average the valuations
      return {
        valuation: {
          base: (openaiValuation.valuation.base + anthropicValuation.valuation.base) / 2,
          low: Math.min(openaiValuation.valuation.low, anthropicValuation.valuation.low),
          high: Math.max(openaiValuation.valuation.high, anthropicValuation.valuation.high),
          confidence: (openaiValuation.valuation.confidence + anthropicValuation.valuation.confidence) / 2,
        },
        analysis: {
          strengths: Array.from(new Set([...openaiValuation.analysis.strengths, ...anthropicValuation.analysis.strengths])),
          weaknesses: Array.from(new Set([...openaiValuation.analysis.weaknesses, ...anthropicValuation.analysis.weaknesses])),
          opportunities: Array.from(new Set([...openaiValuation.analysis.opportunities, ...anthropicValuation.analysis.opportunities])),
          threats: Array.from(new Set([...openaiValuation.analysis.threats, ...anthropicValuation.analysis.threats])),
        },
        recommendations: Array.from(new Set([...openaiValuation.recommendations, ...anthropicValuation.recommendations])),
        methodology: {
          weights: {
            revenue: (openaiValuation.methodology.weights.revenue + anthropicValuation.methodology.weights.revenue) / 2,
            market: (openaiValuation.methodology.weights.market + anthropicValuation.methodology.weights.market) / 2,
            team: (openaiValuation.methodology.weights.team + anthropicValuation.methodology.weights.team) / 2,
            technology: (openaiValuation.methodology.weights.technology + anthropicValuation.methodology.weights.technology) / 2,
            traction: (openaiValuation.methodology.weights.traction + anthropicValuation.methodology.weights.traction) / 2,
          },
          adjustments: {},
        },
      };
    } catch (error) {
      console.error("AI Valuation error:", error);
      throw new Error("Failed to generate AI valuation");
    }
  }

  // Additional AI-powered analysis methods
  async analyzeMarket(data: ValuationFormData) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the market conditions and competitive landscape for this business.",
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

  async assessRisks(data: ValuationFormData) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Identify and assess potential risks and challenges for this business.",
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
          content: "Generate growth projections and financial forecasts for this business.",
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

export const aiService = new AIService();
