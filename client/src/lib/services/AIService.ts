import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ValuationInsights {
  market: {
    opportunities: string[];
    risks: string[];
    growth: {
      drivers: string[];
      barriers: string[];
    };
  };
  technology: {
    innovations: string[];
    risks: string[];
    scalability: {
      factors: string[];
      score: number;
    };
  };
  recommendations: {
    strategic: string[];
    operational: string[];
    financial: string[];
    timeline: Array<{
      phase: string;
      actions: string[];
      timeline: string;
      impact: string;
    }>;
  };
}

export class AIService {
  static async generateValuationInsights(data: any): Promise<ValuationInsights> {
    const prompt = `
      Based on the following startup data, provide a detailed analysis in JSON format:

      Company Info:
      - Industry: ${data.basicInfo.industry}
      - Stage: ${data.basicInfo.stage}
      - Market Size: TAM $${data.marketMetrics?.marketSize?.tam}
      - Team Size: ${data.basicInfo.teamSize}
      - Market Growth: ${data.marketMetrics?.marketGrowth}%

      Financials:
      - Revenue: $${data.financials?.revenue || 0}
      - Growth Rate: ${data.financials?.growthRate || 0}%
      - Burn Rate: $${data.financials?.burnRate || 0}
      - Runway: ${data.financials?.runwayMonths || 0} months

      Please provide:
      1. Market analysis with opportunities and risks
      2. Technology assessment including innovation potential
      3. Comprehensive recommendations with timeline
      4. Growth drivers and barriers

      Format the response as a JSON object with the following structure:
      {
        "market": {
          "opportunities": string[],
          "risks": string[],
          "growth": {
            "drivers": string[],
            "barriers": string[]
          }
        },
        "technology": {
          "innovations": string[],
          "risks": string[],
          "scalability": {
            "factors": string[],
            "score": number
          }
        },
        "recommendations": {
          "strategic": string[],
          "operational": string[],
          "financial": string[],
          "timeline": Array<{
            phase: string,
            actions: string[],
            timeline: string,
            impact: string
          }>
        }
      }
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert startup valuation analyst with deep expertise in market analysis, technology assessment, and strategic planning. Provide detailed, data-driven analysis in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      if (!completion.choices[0].message.content) {
        throw new Error('No content in AI response');
      }

      const response = JSON.parse(completion.choices[0].message.content);
      return this.validateAIResponse(response);
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      throw new Error(`Failed to generate AI insights: ${error.message}`);
    }
  }

  private static validateAIResponse(response: any): ValuationInsights {
    // Validate market section
    if (!response.market?.opportunities || !Array.isArray(response.market.opportunities) ||
        !response.market?.risks || !Array.isArray(response.market.risks) ||
        !response.market?.growth?.drivers || !Array.isArray(response.market.growth.drivers) ||
        !response.market?.growth?.barriers || !Array.isArray(response.market.growth.barriers)) {
      throw new Error('Invalid market analysis structure in AI response');
    }

    // Validate technology section
    if (!response.technology?.innovations || !Array.isArray(response.technology.innovations) ||
        !response.technology?.risks || !Array.isArray(response.technology.risks) ||
        !response.technology?.scalability?.factors || !Array.isArray(response.technology.scalability.factors) ||
        typeof response.technology?.scalability?.score !== 'number') {
      throw new Error('Invalid technology assessment structure in AI response');
    }

    // Validate recommendations section
    if (!response.recommendations?.strategic || !Array.isArray(response.recommendations.strategic) ||
        !response.recommendations?.operational || !Array.isArray(response.recommendations.operational) ||
        !response.recommendations?.financial || !Array.isArray(response.recommendations.financial) ||
        !response.recommendations?.timeline || !Array.isArray(response.recommendations.timeline)) {
      throw new Error('Invalid recommendations structure in AI response');
    }

    // Validate timeline entries
    response.recommendations.timeline.forEach((entry: any, index: number) => {
      if (!entry.phase || typeof entry.phase !== 'string' ||
          !entry.actions || !Array.isArray(entry.actions) ||
          !entry.timeline || typeof entry.timeline !== 'string' ||
          !entry.impact || typeof entry.impact !== 'string') {
        throw new Error(`Invalid timeline entry at index ${index}`);
      }
    });

    return response as ValuationInsights;
  }
}