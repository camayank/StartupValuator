import OpenAI from "openai";
import type { ValuationFormData } from "../../client/src/lib/validations";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MarketSentiment {
  overallScore: number;
  sentimentByFactor: {
    marketConditions: number;
    industryTrends: number;
    competitiveLandscape: number;
    regulatoryEnvironment: number;
  };
  insights: string[];
  riskFactors: string[];
  opportunities: string[];
  timestamp: string;
  peerComparison?: {
    companies: Array<{
      name: string;
      metrics: {
        revenue?: number;
        growth?: number;
        valuation?: number;
      };
      similarity: number;
    }>;
    averages: {
      revenueMultiple?: number;
      growthRate?: number;
      margins?: number;
    };
  };
  growthAnalysis?: {
    potentialScore: number;
    factors: string[];
    barriers: string[];
    marketSize: {
      tam?: number;
      sam?: number;
      som?: number;
    };
  };
}

export async function analyzeMarketSentiment(data: ValuationFormData): Promise<MarketSentiment> {
  try {
    const prompt = `Analyze the current market sentiment for a ${data.industry} company in the ${data.stage} stage.
    Consider the following aspects:
    1. Market Conditions
      - Current economic indicators
      - Industry-specific trends
      - Regional market dynamics for ${data.region}

    2. Industry Analysis
      - Growth trajectory
      - Technology adoption
      - Innovation landscape

    3. Competitive Assessment
      - Market leaders and challengers
      - Entry barriers
      - Competitive advantages

    4. Growth Potential
      - Market size (TAM, SAM, SOM)
      - Scalability factors
      - Growth barriers

    5. Regulatory Environment
      - Current regulations
      - Upcoming policy changes
      - Compliance requirements

    Provide a detailed analysis in JSON format with the following structure:
    {
      "overallScore": (number between 0-1),
      "sentimentByFactor": {
        "marketConditions": (number between 0-1),
        "industryTrends": (number between 0-1),
        "competitiveLandscape": (number between 0-1),
        "regulatoryEnvironment": (number between 0-1)
      },
      "insights": [array of key insights],
      "riskFactors": [array of risk factors],
      "opportunities": [array of growth opportunities],
      "peerComparison": {
        "companies": [{
          "name": string,
          "metrics": {
            "revenue": number (optional),
            "growth": number (optional),
            "valuation": number (optional)
          },
          "similarity": number
        }],
        "averages": {
          "revenueMultiple": number,
          "growthRate": number,
          "margins": number
        }
      },
      "growthAnalysis": {
        "potentialScore": number (0-1),
        "factors": [positive factors],
        "barriers": [growth barriers],
        "marketSize": {
          "tam": number (optional),
          "sam": number (optional),
          "som": number (optional)
        }
      }
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a market analysis expert specializing in startup valuation, market sentiment analysis, and competitive intelligence. Provide detailed, data-driven insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const sentimentData = JSON.parse(response.choices[0].message.content);

    return {
      ...sentimentData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Market sentiment analysis error:', error);
    // Return neutral sentiment if analysis fails
    return {
      overallScore: 0.5,
      sentimentByFactor: {
        marketConditions: 0.5,
        industryTrends: 0.5,
        competitiveLandscape: 0.5,
        regulatoryEnvironment: 0.5
      },
      insights: ['Unable to analyze market sentiment'],
      riskFactors: ['Market sentiment analysis unavailable'],
      opportunities: ['Consider manual market research'],
      timestamp: new Date().toISOString()
    };
  }
}

// Cache market sentiment results for 1 hour
const sentimentCache = new Map<string, { data: MarketSentiment; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getCachedMarketSentiment(data: ValuationFormData): Promise<MarketSentiment> {
  const cacheKey = `${data.industry}-${data.stage}`;
  const cached = sentimentCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const sentiment = await analyzeMarketSentiment(data);
  sentimentCache.set(cacheKey, { data: sentiment, timestamp: Date.now() });

  return sentiment;
}