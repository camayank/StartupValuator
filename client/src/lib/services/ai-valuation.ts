import OpenAI from 'openai';
import { type ValuationFormData } from '../validations';

interface AIValuationResponse {
  valuation: number;
  rationale: string;
  confidenceScore: number;
  recommendations: string[];
}

export class AIValuationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });
  }

  async generateValuation(data: ValuationFormData): Promise<AIValuationResponse> {
    const prompt = this.constructPrompt(data);

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are an expert startup valuation analyst. Analyze the provided business data and generate a detailed valuation response."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return this.parseResponse(content || '');
    } catch (error) {
      console.error('AI Valuation Error:', error);
      throw new Error('Failed to generate AI-powered valuation');
    }
  }

  private constructPrompt(data: ValuationFormData): string {
    return `
      Please analyze this startup and provide a valuation with detailed rationale:

      Business Information:
      - Name: ${data.businessInfo.name}
      - Sector: ${data.businessInfo.sector}
      - Industry: ${data.businessInfo.industry}
      - Stage: ${data.businessInfo.productStage}

      Market Data:
      - TAM: ${data.marketData.tam}
      - SAM: ${data.marketData.sam}
      - SOM: ${data.marketData.som}
      - Growth Rate: ${data.marketData.growthRate}%

      Financial Data:
      - Revenue: ${data.financialData.revenue}
      - CAC: ${data.financialData.cac}
      - LTV: ${data.financialData.ltv}
      - Burn Rate: ${data.financialData.burnRate}

      Please provide:
      1. Estimated valuation range
      2. Key factors influencing the valuation
      3. Confidence score (0-100)
      4. Strategic recommendations
    `;
  }

  private parseResponse(response: string): AIValuationResponse {
    try {
      // Extract valuation range
      const valuationMatch = response.match(/\$(\d+(?:\.\d+)?)\s*(?:million|M|-\s*\$\d+(?:\.\d+)?M)?/);
      const valuation = valuationMatch ? parseFloat(valuationMatch[1]) * 1000000 : 1000000;

      // Extract confidence score
      const confidenceMatch = response.match(/confidence(?:\s+score)?[:]\s*(\d+)/i);
      const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

      // Extract recommendations
      const recommendationsMatch = response.match(/recommendations?:?\n((?:[-*]\s*.+\n?)+)/i);
      const recommendations = recommendationsMatch 
        ? recommendationsMatch[1].split('\n').filter(r => r.trim())
            .map(r => r.replace(/^[-*]\s*/, '').trim())
        : ["Focus on reducing CAC", "Expand market presence", "Invest in product development"];

      // Extract rationale
      const rationaleMatch = response.match(/factors?:?\n((?:[-*]\s*.+\n?)+)/i);
      const rationale = rationaleMatch 
        ? rationaleMatch[1].replace(/[-*]\s*/g, '').trim()
        : "Based on market comparables and growth metrics";

      return {
        valuation,
        rationale,
        confidenceScore,
        recommendations
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return fallback values if parsing fails
      return {
        valuation: 1000000,
        rationale: "Based on market comparables and growth metrics",
        confidenceScore: 85,
        recommendations: [
          "Focus on reducing CAC",
          "Expand market presence",
          "Invest in product development"
        ]
      };
    }
  }
}

export const aiValuationService = new AIValuationService();