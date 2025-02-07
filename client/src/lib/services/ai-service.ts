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
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      openai: "gpt-4o",
      // the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
      anthropic: "claude-3-5-sonnet-20241022"
    },
    fallback: {
      openai: "gpt-4",
      anthropic: "claude-3"
    }
  },
  maxRetries: 3,
  retryDelay: 1000,
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

// Module 1: Financial Data Input & Validation
export async function validateFinancialMetrics(metrics: {
  revenue?: number[],
  expenses?: number[],
  industry?: string,
  stage?: string
}) {
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
            content: "You are a financial analyst validating startup metrics. Provide feedback in JSON format with 'isValid', 'feedback', 'suggestions', and 'industryComparison' fields."
          },
          {
            role: "user",
            content: `Analyze these startup metrics for ${metrics.industry || 'general'} industry:
            Revenue (3 years): ${JSON.stringify(metrics.revenue)}
            Expenses: ${JSON.stringify(metrics.expenses)}
            Stage: ${metrics.stage}

            Compare with industry standards and provide detailed feedback.`
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

// Module 2: Market Intelligence
export async function getMarketInsights(
  sector: string,
  businessModel: string,
  targetMarket?: string
) {
  const cacheKey = `market_insights_${sector}_${businessModel}_${targetMarket}`;
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
            content: "Analyze market conditions and provide TAM/SAM estimates, competitive landscape, and growth opportunities in JSON format."
          },
          {
            role: "user",
            content: `Analyze market for:
            Sector: ${sector}
            Business Model: ${businessModel}
            Target Market: ${targetMarket || 'Global'}

            Include:
            1. TAM/SAM/SOM estimates
            2. Key competitors
            3. Market growth rate
            4. Entry barriers
            5. Opportunities`
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

// Module 3: Risk Assessment
export async function assessRisks(data: {
  industry: string,
  businessModel: string,
  financials: any,
  marketData: any
}) {
  try {
    const response = await retryOperation(async () => {
      return await anthropic.messages.create({
        model: CONFIG.models.primary.anthropic,
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Perform a comprehensive risk assessment for this startup:
          Industry: ${data.industry}
          Business Model: ${data.businessModel}

          Include analysis of:
          1. Market risks
          2. Financial risks
          3. Operational risks
          4. Competitive risks
          5. Regulatory risks

          Data: ${JSON.stringify(data)}

          Provide specific mitigation strategies for each identified risk.`
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
    console.error("Error in risk assessment:", error);
    throw new Error("Failed to complete risk assessment");
  }
}

// Module 4: Valuation Simulation
export async function runValuationSimulation(data: {
  financials: any,
  marketData: any,
  riskAnalysis: any,
  method: 'DCF' | 'Market Comps' | 'Monte Carlo' | 'AI Recommend'
}) {
  try {
    const response = await retryOperation(async () => {
      return await openai.chat.completions.create({
        model: CONFIG.models.primary.openai,
        messages: [
          {
            role: "system",
            content: "You are a valuation expert. Analyze the data and provide valuation estimates with detailed explanations in JSON format."
          },
          {
            role: "user",
            content: `Run valuation simulation using ${data.method} method.

            Data: ${JSON.stringify(data)}

            Include:
            1. Base valuation
            2. Optimistic scenario
            3. Conservative scenario
            4. Key assumptions
            5. Sensitivity analysis`
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
    console.error("Error in valuation simulation:", error);
    throw new Error("Failed to run valuation simulation");
  }
}

// Module 5: Report Generation
export async function generateReport(data: any, type: 'full' | 'executive' | 'pitch') {
  try {
    const response = await retryOperation(async () => {
      return await anthropic.messages.create({
        model: CONFIG.models.primary.anthropic,
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Generate a ${type} report for this startup valuation:

          Data: ${JSON.stringify(data)}

          Include:
          1. Executive Summary
          2. Financial Analysis
          3. Market Position
          4. Risk Assessment
          5. Valuation Results
          6. Recommendations`
        }],
      });
    });

    const reportContent = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Error: Expected text content';

    return {
      report: reportContent,
      timestamp: new Date().toISOString(),
      type
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report");
  }
}

export const aiService = {
  validateFinancialMetrics,
  getMarketInsights,
  assessRisks,
  runValuationSimulation,
  generateReport
};

export default aiService;