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
            content: "You are an expert startup valuator. Analyze the provided business data and generate a detailed valuation with confidence scores.",
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

// Anthropic-based analysis service
export class AnthropicService {
  async generateValuation(data: ValuationFormData): Promise<AIValuationResponse> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: JSON.stringify(data) }],
        system: "You are an expert startup valuator. Analyze the provided business data and generate a detailed valuation with confidence scores. Output in JSON format matching the AIValuationResponse type.",
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
      system: "You are a risk assessment specialist. Analyze the business data and provide a detailed risk assessment including overall risk score, category breakdown, and mitigation strategies. Output in JSON format.",
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
      system: "You are a talent assessment expert. Analyze the team's expertise, experience, and capabilities. Identify strengths and gaps. Output in JSON format.",
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