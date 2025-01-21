import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ValuationInsights {
  valuation: {
    range: { low: number; high: number };
    justification: string[];
  };
  growth: {
    drivers: string[];
    risks: string[];
  };
  benchmarks: {
    industry: Record<string, number>;
    metrics: Record<string, { low: number; median: number; high: number }>;
  };
  recommendations: string[];
}

export class AIService {
  static async generateValuationInsights(data: any): Promise<ValuationInsights> {
    const prompt = `
      Based on the following startup data, provide a detailed analysis in JSON format:

      Company Info:
      - Industry: ${data.basicInfo.industry}
      - Stage: ${data.basicInfo.stage}
      - Market Size: TAM $${data.marketMetrics.marketSize.tam}
      - Team Size: ${data.basicInfo.teamSize}
      - Market Growth: ${data.marketMetrics.marketGrowth}%

      Financials:
      - Projected Revenue: $${data.financials.projectedRevenue}
      - Burn Rate: $${data.financials.burnRate}
      - Runway: ${data.financials.runwayMonths} months

      Please provide:
      1. Valuation range with detailed justification
      2. Key growth drivers and risks
      3. Industry benchmarks including key metrics
      4. Strategic recommendations

      Format the response as a JSON object with the following structure:
      {
        "valuation": {
          "range": { "low": number, "high": number },
          "justification": string[]
        },
        "growth": {
          "drivers": string[],
          "risks": string[]
        },
        "benchmarks": {
          "industry": Record<string, number>,
          "metrics": Record<string, { low: number, median: number, high: number }>
        },
        "recommendations": string[]
      }
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert startup valuation analyst. Provide detailed, data-driven analysis in JSON format."
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
      return this.validateResponse(response);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Failed to generate AI insights');
    }
  }

  private static validateResponse(response: any): ValuationInsights {
    // Validate valuation range
    if (!response.valuation?.range?.low || !response.valuation?.range?.high) {
      throw new Error('Invalid valuation range in AI response');
    }

    // Validate arrays
    if (!Array.isArray(response.valuation.justification) ||
        !Array.isArray(response.growth?.drivers) ||
        !Array.isArray(response.growth?.risks) ||
        !Array.isArray(response.recommendations)) {
      throw new Error('Invalid array data in AI response');
    }

    // Validate benchmarks
    if (typeof response.benchmarks?.industry !== 'object' ||
        typeof response.benchmarks?.metrics !== 'object') {
      throw new Error('Invalid benchmark data in AI response');
    }

    // Ensure numeric values are valid
    const validateNumber = (n: number) => !isNaN(n) && isFinite(n);
    if (!validateNumber(response.valuation.range.low) ||
        !validateNumber(response.valuation.range.high)) {
      throw new Error('Invalid numeric values in valuation range');
    }

    // Ensure range makes sense
    if (response.valuation.range.low > response.valuation.range.high) {
      throw new Error('Invalid valuation range: low value exceeds high value');
    }

    return response as ValuationInsights;
  }
}