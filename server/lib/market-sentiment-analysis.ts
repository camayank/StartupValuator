import { openai } from '../services/ai-service';
import type { MarketSentimentResponse } from '../types/market-analysis';

export async function analyzeMarketSentiment(company: string, industry: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a market analysis expert specializing in ${industry}. 
          Provide a detailed analysis including:
          1. Market sentiment scores (0-1)
          2. Key industry trends
          3. Risk factors
          4. Growth indicators
          5. Competitive position analysis
          Format response as JSON with these exact fields.`,
        },
        {
          role: "user",
          content: JSON.stringify({ company, industry }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate response structure
    const marketSentiment: MarketSentimentResponse = {
      sentiment: {
        overall: result.sentiment?.overall || 0,
        growth: result.sentiment?.growth || 0,
        stability: result.sentiment?.stability || 0,
        innovation: result.sentiment?.innovation || 0,
      },
      trends: result.trends || [],
      risks: result.risks || [],
      growthIndicators: result.growthIndicators || [],
      competitivePosition: {
        strengths: result.competitivePosition?.strengths || [],
        weaknesses: result.competitivePosition?.weaknesses || [],
        opportunities: result.competitivePosition?.opportunities || [],
        threats: result.competitivePosition?.threats || [],
      },
      marketDynamics: {
        marketSize: result.marketDynamics?.marketSize,
        growthRate: result.marketDynamics?.growthRate,
        competitorCount: result.marketDynamics?.competitorCount,
        marketMaturity: result.marketDynamics?.marketMaturity,
      },
    };

    return marketSentiment;
  } catch (error) {
    console.error("Market sentiment analysis failed:", error);
    throw new Error("Failed to analyze market sentiment");
  }
}

// Social media and news sentiment analysis
export async function analyzeSocialMediaSentiment(company: string, timeframe: string = '1m') {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyze social media and news sentiment for the given company. Include sentiment scores, key mentions, and trend analysis.",
        },
        {
          role: "user",
          content: JSON.stringify({ company, timeframe }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Social media sentiment analysis failed:", error);
    throw new Error("Failed to analyze social media sentiment");
  }
}

// Real-time market monitoring
export async function monitorMarketTrends(industry: string, interval: string = '1d') {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Monitor and analyze real-time market trends for the specified industry. Include emerging trends, market shifts, and potential disruptions.",
        },
        {
          role: "user",
          content: JSON.stringify({ industry, interval }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Market trend monitoring failed:", error);
    throw new Error("Failed to monitor market trends");
  }
}