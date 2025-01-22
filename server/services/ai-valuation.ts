import OpenAI from "openai";
import { z } from "zod";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { businessModelEnum, productStageEnum, riskLevelEnum } from "@db/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export class AIValuationService {
  // Market Analysis
  async analyzeMarket(data: ValuationFormData) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert in startup market analysis. Analyze the provided market data and give insights in JSON format."
          },
          {
            role: "user",
            content: JSON.stringify({
              sector: data.businessInfo.sector,
              marketSize: {
                tam: data.marketData.tam,
                sam: data.marketData.sam,
                som: data.marketData.som
              },
              growthRate: data.marketData.growthRate,
              competitors: data.marketData.competitors
            })
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Failed to get response from OpenAI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Market analysis failed:", error);
      return this.getFallbackMarketAnalysis(data);
    }
  }

  // Risk Assessment
  async assessRisks(data: ValuationFormData) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a startup risk assessment expert. Analyze the provided data and identify key risks and mitigation strategies in JSON format."
          },
          {
            role: "user",
            content: JSON.stringify({
              stage: data.businessInfo.productStage,
              model: data.businessInfo.businessModel,
              financials: data.financialData,
              product: data.productDetails
            })
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Failed to get response from OpenAI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Risk assessment failed:", error);
      return this.getFallbackRiskAssessment(data);
    }
  }

  // Auto-complete missing fields
  async autoCompleteMissingFields(partialData: Partial<ValuationFormData>) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert in startup analytics. Based on the provided partial data, suggest reasonable values for missing fields in JSON format."
          },
          {
            role: "user",
            content: JSON.stringify(partialData)
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Failed to get response from OpenAI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Auto-completion failed:", error);
      return this.getFallbackAutoComplete(partialData);
    }
  }

  // Growth Projections
  async generateGrowthProjections(data: ValuationFormData) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert in startup growth modeling. Generate 3-year projections based on the provided data in JSON format."
          },
          {
            role: "user",
            content: JSON.stringify({
              currentRevenue: data.financialData.revenue,
              growth: data.marketData.growthRate,
              market: {
                tam: data.marketData.tam,
                sam: data.marketData.sam,
                som: data.marketData.som
              },
              stage: data.businessInfo.productStage
            })
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Failed to get response from OpenAI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Growth projection failed:", error);
      return this.getFallbackGrowthProjections(data);
    }
  }

  // Fallback mechanisms
  private getFallbackMarketAnalysis(data: ValuationFormData) {
    return {
      marketSizeAnalysis: {
        tamValidation: data.marketData.tam > 0 ? "valid" : "requires verification",
        samValidation: data.marketData.sam > 0 ? "valid" : "requires verification",
        somValidation: data.marketData.som > 0 ? "valid" : "requires verification"
      },
      competitorAnalysis: {
        count: data.marketData.competitors?.length || 0,
        competitiveLandscape: "moderate"
      },
      growthPotential: "moderate",
      recommendations: [
        "Verify market size assumptions",
        "Gather more competitor data",
        "Monitor market trends closely"
      ]
    };
  }

  private getFallbackRiskAssessment(data: ValuationFormData) {
    return {
      riskLevel: "medium",
      keyRisks: [
        "Market competition",
        "Execution risks",
        "Financial sustainability"
      ],
      mitigationStrategies: [
        "Focus on core differentiators",
        "Build strong team",
        "Maintain adequate runway"
      ]
    };
  }

  private getFallbackAutoComplete(partialData: Partial<ValuationFormData>) {
    return {
      suggestedValues: {
        marketData: {
          growthRate: 20,
          tamMultiple: 10,
          samPercentage: 30,
          somPercentage: 10
        },
        financialData: {
          burnRate: 50000,
          runway: 18
        }
      },
      confidence: "low",
      note: "These are conservative estimates based on limited data"
    };
  }

  private getFallbackGrowthProjections(data: ValuationFormData) {
    const baseGrowth = data.marketData.growthRate || 20;
    const currentRevenue = data.financialData.revenue || 0;

    return {
      projections: {
        year1: currentRevenue * (1 + baseGrowth/100),
        year2: currentRevenue * Math.pow(1 + baseGrowth/100, 2),
        year3: currentRevenue * Math.pow(1 + baseGrowth/100, 3)
      },
      assumptions: {
        baseGrowthRate: baseGrowth,
        marketConditions: "normal",
        confidence: "medium"
      }
    };
  }
}