import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RiskAssessmentResult {
  overallRisk: string;
  riskScore: number;
  categories: {
    market: string;
    financial: string;
    operational: string;
    competitive: string;
  };
  recommendations: string[];
}

export async function assessStartupRisk(params: {
  revenue: number;
  growthRate: number;
  margins: number;
  industry: string;
  stage: string;
}): Promise<RiskAssessmentResult> {
  const prompt = `As a startup risk assessment expert, analyze the following startup data and provide a detailed risk assessment:

Company Profile:
- Industry: ${params.industry}
- Stage: ${params.stage}
- Annual Revenue: $${params.revenue.toLocaleString()}
- Growth Rate: ${params.growthRate}%
- Profit Margins: ${params.margins}%

Please provide a comprehensive risk assessment including:
1. Overall risk level (Low/Medium/High) and a risk score (0-100)
2. Specific risks in these categories: Market, Financial, Operational, and Competitive
3. Key recommendations for risk mitigation

Format the response as JSON with the following structure:
{
  "overallRisk": "string",
  "riskScore": number,
  "categories": {
    "market": "string",
    "financial": "string",
    "operational": "string",
    "competitive": "string"
  },
  "recommendations": ["string"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: "You are an expert startup risk analyst. Provide detailed, actionable risk assessments.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result as RiskAssessmentResult;
  } catch (error) {
    console.error("Error in risk assessment:", error);
    throw new Error("Failed to generate risk assessment");
  }
}