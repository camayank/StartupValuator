import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function validateFinancialMetrics(metrics: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

    if (!response.choices[0].message.content) {
      throw new Error("No response content received");
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error validating metrics:", error);
    throw new Error("Failed to validate financial metrics");
  }
}

export async function generateValuationReport(data: any) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Generate a comprehensive valuation report for this startup data: ${JSON.stringify(data)}. Include executive summary, financial analysis, market analysis, and recommendations.`
      }],
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

export async function getMarketInsights(sector: string, businessModel: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

    if (!response.choices[0].message.content) {
      throw new Error("No response content received");
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error getting market insights:", error);
    throw new Error("Failed to get market insights");
  }
}

// New function for real-time validation feedback
export async function getInputFeedback(fieldName: string, value: any, context: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

    if (!response.choices[0].message.content) {
      throw new Error("No response content received");
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error getting input feedback:", error);
    throw new Error("Failed to get input feedback");
  }
}

// New function for competitive analysis
export async function analyzeCompetitiveLandscape(data: any) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Analyze the competitive landscape for this startup: ${JSON.stringify(data)}. Focus on market positioning, competitive advantages, and potential threats.`
      }],
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