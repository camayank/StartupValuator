// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import OpenAI from "openai";
import type { PitchDeckFormData } from "../../client/src/components/PitchDeckGenerator";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePersonalizedSuggestions(data: PitchDeckFormData) {
  const prompt = `As a startup advisor, provide personalized suggestions to improve this pitch deck:

Company: ${data.companyName}
Tagline: ${data.tagline}
Problem: ${data.problem}
Solution: ${data.solution}
Market Size: ${data.marketSize}
Business Model: ${data.businessModel}
Competition: ${data.competition}
Traction: ${data.traction || "Not provided"}
Team: ${data.team}
Financials: ${data.financials}
Funding Ask: ${data.fundingAsk}
Use of Funds: ${data.useOfFunds}

Provide specific suggestions for improvement in JSON format with the following structure:
{
  "taglineSuggestion": "string",
  "problemRefinement": "string",
  "solutionEnhancement": "string",
  "marketInsights": "string",
  "businessModelOptimization": "string",
  "competitiveAdvantage": "string",
  "teamPresentation": "string",
  "financialNarrative": "string",
  "fundingStrategy": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert pitch deck consultant who provides actionable, specific suggestions to improve pitch decks for different industries and investor types.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function analyzeIndustryFit(industry: string, businessModel: string) {
  const prompt = `Analyze this startup's industry fit and provide recommendations:

Industry: ${industry}
Business Model: ${businessModel}

Provide analysis in JSON format with:
{
  "industryTrends": "string",
  "keyMetrics": ["string"],
  "commonPitfalls": ["string"],
  "successFactors": ["string"],
  "recommendedFocus": "string"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an industry analysis expert who provides specific, actionable insights for startups in different sectors.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}
