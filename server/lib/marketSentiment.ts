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
  economicIndicators?: {
    inflation: number;
    riskFreeRate: number;
    gdpGrowth: number;
    marketVolatility: number;
    industryIndex: number;
    timestamp: string;
  };
}

export async function analyzeMarketSentiment(data: ValuationFormData): Promise<MarketSentiment> {
  try {
    const economicData = await getEconomicIndicators(data.region);

    const prompt = `Analyze the current market sentiment for a ${data.sector} company in the ${data.stage} stage.
    Consider the following aspects and current economic indicators for ${data.region}:
    1. Market Conditions
      - Current economic indicators: Inflation rate: ${economicData.inflation}%, Risk-free rate: ${economicData.riskFreeRate}%
      - Industry-specific trends
      - Regional market dynamics for ${data.region}

    2. Industry Analysis
      - Growth trajectory considering GDP growth of ${economicData.gdpGrowth}%
      - Technology adoption rates
      - Innovation landscape
      - Industry volatility index: ${economicData.industryIndex}

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
      timestamp: new Date().toISOString(),
      economicIndicators: economicData
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
      timestamp: new Date().toISOString(),
      economicIndicators: await getEconomicIndicators(data.region)
    };
  }
}

async function getEconomicIndicators(region: string) {
  // In a production environment, this would fetch real-time data from APIs
  // For now, we'll use representative data based on region
  const indicators = {
    us: {
      inflation: 3.2,
      riskFreeRate: 4.5,
      gdpGrowth: 2.1,
      marketVolatility: 15.2,
      industryIndex: 105.3
    },
    eu: {
      inflation: 2.8,
      riskFreeRate: 3.5,
      gdpGrowth: 1.8,
      marketVolatility: 16.5,
      industryIndex: 102.1
    },
    uk: {
      inflation: 3.0,
      riskFreeRate: 4.0,
      gdpGrowth: 1.9,
      marketVolatility: 14.8,
      industryIndex: 103.4
    },
    india: {
      inflation: 5.5,
      riskFreeRate: 6.5,
      gdpGrowth: 6.3,
      marketVolatility: 18.5,
      industryIndex: 110.2
    },
    asia: {
      inflation: 4.0,
      riskFreeRate: 5.0,
      gdpGrowth: 4.5,
      marketVolatility: 17.2,
      industryIndex: 106.8
    },
    other: {
      inflation: 4.5,
      riskFreeRate: 5.5,
      gdpGrowth: 3.5,
      marketVolatility: 16.8,
      industryIndex: 104.5
    }
  };

  const regionData = indicators[region.toLowerCase() as keyof typeof indicators] || indicators.other;
  return {
    ...regionData,
    timestamp: new Date().toISOString()
  };
}

// Cache market sentiment results for 1 hour
const sentimentCache = new Map<string, { data: MarketSentiment; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getCachedMarketSentiment(data: ValuationFormData): Promise<MarketSentiment> {
  const cacheKey = `${data.sector}-${data.stage}-${data.region}`;
  const cached = sentimentCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const sentiment = await analyzeMarketSentiment(data);
  sentimentCache.set(cacheKey, { data: sentiment, timestamp: Date.now() });

  return sentiment;
}