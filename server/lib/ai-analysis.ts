import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { growthAnalysisSchema } from "@/lib/validations/ai-analysis";
import { cache } from "./cache";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CACHE_TTL = 3600; // 1 hour

interface MetricsInput {
  mrr?: number;
  cac?: number;
  churnRate?: number;
  ltv?: number;
  aov?: number;
  traffic?: number;
  conversionRate?: number;
  inventoryTurnover?: number;
  cogs?: number;
  productionCapacity?: number;
  assetUtilization?: number;
  transactionVolume?: number;
  revenuePerUser?: number;
  partnerships?: number;
}

interface QualitativeInput {
  teamSize?: number;
  teamExperience?: number;
  intellectualProperty?: string;
  marketValidation?: string;
  competitiveDifferentiation?: string;
}

export async function analyzeGrowth(
  industry: string,
  metrics: MetricsInput
): Promise<any> {
  const cacheKey = `growth-analysis:${industry}:${JSON.stringify(metrics)}`;

  // Try to get from cache first
  const cachedResult = await cache.get(cacheKey, 'ai-analysis');
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const prompt = generateQuantitativePrompt(industry, metrics);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert startup analyst. Analyze the provided metrics and provide insights in JSON format following the specified schema. Focus on actionable insights and realistic growth opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    const result = JSON.parse(content);
    const validatedResult = growthAnalysisSchema.parse(result);

    // Cache the result
    await cache.set(cacheKey, validatedResult, CACHE_TTL, 'ai-analysis');

    return validatedResult;
  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze metrics');
  }
}

export async function analyzeQualitative(
  industry: string, 
  qualitativeData: QualitativeInput
): Promise<any> {
  const cacheKey = `qualitative-analysis:${industry}:${JSON.stringify(qualitativeData)}`;

  const cachedResult = await cache.get(cacheKey, 'ai-analysis');
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const prompt = generateQualitativePrompt(industry, qualitativeData);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: "You are an expert startup advisor specializing in team analysis and market validation. Provide insights in JSON format with detailed qualitative analysis.",
      messages: [{ 
        role: 'user', 
        content: prompt 
      }]
    });

    // Safely access content from the message
    const content = message.content[0];
    if (!content || typeof content.text !== 'string') {
      throw new Error('Anthropic returned invalid response format');
    }

    const result = JSON.parse(content.text);
    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL, 'ai-analysis');

    return result;
  } catch (error) {
    console.error('Anthropic Analysis Error:', error);

    // Fallback to OpenAI if Anthropic fails
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert startup advisor. Analyze the qualitative aspects and provide insights in JSON format."
          },
          {
            role: "user",
            content: generateQualitativePrompt(industry, qualitativeData)
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }

      const result = JSON.parse(content);
      await cache.set(cacheKey, result, CACHE_TTL, 'ai-analysis');
      return result;
    } catch (fallbackError) {
      throw new Error('Failed to analyze qualitative data with both AI services');
    }
  }
}

function generateQuantitativePrompt(industry: string, metrics: MetricsInput): string {
  const metricsList = Object.entries(metrics)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      const formattedValue = typeof value === 'number' && key.toLowerCase().includes('rate')
        ? `${value}%`
        : value;
      return `${formattedKey}: ${formattedValue}`;
    })
    .join('\n');

  return `
Analyze the following ${industry} business metrics:

${metricsList}

Provide a detailed analysis including:
1. Key risks and their severity
2. Growth opportunities and potential impact
3. Metric-specific insights and recommendations
4. Overall confidence score (0-1)
5. Summary of findings

Format the response as a JSON object with the following structure:
{
  "risks": [{ "category": string, "description": string, "severity": "low"|"medium"|"high", "mitigation": string }],
  "opportunities": [{ "category": string, "description": string, "impact": "low"|"medium"|"high", "actionItems": string[] }],
  "insights": [{ "metric": string, "value": string, "analysis": string, "recommendation": string }],
  "confidenceScore": number,
  "summary": string
}`;
}

function generateQualitativePrompt(industry: string, data: QualitativeInput): string {
  const qualitativeList = Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      return `${formattedKey}: ${value}`;
    })
    .join('\n');

  return `
Analyze the following qualitative aspects for ${industry} startup:

${qualitativeList}

Provide a detailed analysis including:
1. Team capability assessment
2. Market readiness evaluation
3. Competitive positioning
4. Growth potential
5. Risk factors

Format the response as a JSON object with the following structure:
{
  "teamAssessment": {
    "strengths": string[],
    "gaps": string[],
    "recommendations": string[]
  },
  "marketReadiness": {
    "status": "early"|"developing"|"ready",
    "factors": { "positive": string[], "negative": string[] },
    "nextSteps": string[]
  },
  "competitiveAnalysis": {
    "advantages": string[],
    "challenges": string[],
    "strategyRecommendations": string[]
  },
  "riskAssessment": {
    "critical": string[],
    "moderate": string[],
    "mitigationStrategies": string[]
  },
  "confidenceScore": number,
  "summary": string
}`;
}