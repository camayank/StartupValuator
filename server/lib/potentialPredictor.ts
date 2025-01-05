import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PotentialPrediction {
  score: number;
  growth_potential: string;
  success_probability: number;
  strengths: string[];
  areas_of_improvement: string[];
  market_opportunities: string[];
  five_year_projection: {
    revenue_multiplier: number;
    market_share_potential: string;
    team_size_projection: string;
  };
}

export async function predictStartupPotential(params: {
  revenue: number;
  growthRate: number;
  margins: number;
  industry: string;
  stage: string;
}): Promise<PotentialPrediction> {
  const prompt = `As a startup potential analyzer, evaluate this startup's future potential based on:

Company Profile:
- Industry: ${params.industry}
- Stage: ${params.stage}
- Annual Revenue: $${params.revenue.toLocaleString()}
- Growth Rate: ${params.growthRate}%
- Profit Margins: ${params.margins}%

Provide a comprehensive analysis including:
1. Overall potential score (0-100)
2. Growth potential assessment
3. Success probability (0-100%)
4. Key strengths
5. Areas needing improvement
6. Market opportunities
7. 5-year projections for revenue, market share, and team size

Format the response as JSON with the following structure:
{
  "score": number,
  "growth_potential": "string",
  "success_probability": number,
  "strengths": ["string"],
  "areas_of_improvement": ["string"],
  "market_opportunities": ["string"],
  "five_year_projection": {
    "revenue_multiplier": number,
    "market_share_potential": "string",
    "team_size_projection": "string"
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert startup analyst specializing in future potential assessment. Provide detailed, data-driven predictions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result as PotentialPrediction;
  } catch (error) {
    console.error("Error in potential prediction:", error);
    throw new Error("Failed to generate potential prediction");
  }
}
