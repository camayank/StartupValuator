import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import NodeCache from 'node-cache';

// Cache configuration
const cache = new NodeCache({
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 600, // Check for expired entries every 10 minutes
  useClones: false,
});

// Enhanced configuration with fallback models and retry logic
const CONFIG = {
  models: {
    primary: {
      openai: "gpt-4o",
      anthropic: "claude-3-5-sonnet-20241022"
    },
    fallback: {
      openai: "gpt-4",
      anthropic: "claude-3"
    }
  },
  maxRetries: 3,
  retryDelay: 1000, // ms
  batchSize: 5,
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Enhanced error handling with retries
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = CONFIG.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      console.warn(`Operation failed, retrying... (${retries} attempts left)`, error.message);
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

// Cached validation to avoid repeated API calls
export async function validateFinancialMetrics(metrics: any) {
  const cacheKey = `validate_metrics_${JSON.stringify(metrics)}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  try {
    const response = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: CONFIG.models.primary.openai,
        messages: [
          {
            role: "system",
            content: "You are a financial analyst validating startup metrics. Provide feedback in JSON format with 'isValid', 'feedback', and 'suggestions' fields."
          },
          {
            role: "user",
            content: `Validate these startup metrics: ${JSON.stringify(metrics)}`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response content received");
    }

    const result = JSON.parse(response.choices[0].message.content);
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error validating metrics:", error);
    throw new Error("Failed to validate financial metrics");
  }
}

// Enhanced valuation report generation with comprehensive analysis
export async function generateValuationReport(data: any) {
  try {
    const response = await retryOperation(async () => {
      return await anthropic.messages.create({
        model: CONFIG.models.primary.anthropic,
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Generate a comprehensive valuation report for this startup data: ${JSON.stringify(data)}. Include executive summary, financial analysis, market analysis, and recommendations.`
        }],
      });
    });

    const reportContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Error: Expected text content';

    return {
      report: reportContent,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate valuation report");
  }
}

// Enhanced market insights with real-time data integration
export async function getMarketInsights(sector: string, businessModel: string) {
  const cacheKey = `market_insights_${sector}_${businessModel}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  try {
    const response = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: CONFIG.models.primary.openai,
        messages: [
          {
            role: "system",
            content: "Provide market insights and benchmarks for the given sector and business model in JSON format."
          },
          {
            role: "user",
            content: `Analyze market conditions for sector: ${sector}, business model: ${businessModel}`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response content received");
    }

    const result = JSON.parse(response.choices[0].message.content);
    cache.set(cacheKey, result, 1800); // 30 minutes TTL for market insights
    return result;
  } catch (error) {
    console.error("Error getting market insights:", error);
    throw new Error("Failed to get market insights");
  }
}

// Enhanced real-time input validation
export async function getInputFeedback(fieldName: string, value: any, context: any) {
  try {
    const response = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: CONFIG.models.primary.openai,
        messages: [
          {
            role: "system",
            content: "You are a startup valuation expert providing real-time feedback on user inputs. Provide concise, actionable feedback."
          },
          {
            role: "user",
            content: `Validate this input - Field: ${fieldName}, Value: ${value}, Context: ${JSON.stringify(context)}`
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response content received");
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error getting input feedback:", error);
    throw new Error("Failed to get input feedback");
  }
}

// Batch processing for multiple insights
export async function batchProcessInsights(requests: Array<{
  type: 'market' | 'financial' | 'competitive',
  data: any
}>) {
  const results = [];

  for (let i = 0; i < requests.length; i += CONFIG.batchSize) {
    const batch = requests.slice(i, i + CONFIG.batchSize);
    const batchPromises = batch.map(async (request) => {
      try {
        switch (request.type) {
          case 'market':
            return await getMarketInsights(request.data.sector, request.data.businessModel);
          case 'financial':
            return await validateFinancialMetrics(request.data);
          case 'competitive':
            return await analyzeCompetitiveLandscape(request.data);
          default:
            throw new Error(`Unknown insight type: ${request.type}`);
        }
      } catch (error) {
        console.error(`Error processing batch item: ${error}`);
        return null;
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

// Enhanced competitive analysis with detailed market positioning
export async function analyzeCompetitiveLandscape(data: any) {
  try {
    const response = await retryOperation(async () => {
      return await anthropic.messages.create({
        model: CONFIG.models.primary.anthropic,
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Analyze the competitive landscape for this startup: ${JSON.stringify(data)}. Focus on market positioning, competitive advantages, and potential threats.`
        }],
      });
    });

    const analysisContent = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Error: Expected text content';

    return {
      analysis: analysisContent,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error analyzing competitive landscape:", error);
    throw new Error("Failed to analyze competitive landscape");
  }
}