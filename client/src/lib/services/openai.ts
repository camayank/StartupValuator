import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

interface IndustryMetricsResponse {
  tam: number;
  metrics: {
    [key: string]: number;
  };
  benchmarks: {
    [key: string]: {
      low: number;
      median: number;
      high: number;
    };
  };
}

export async function getIndustryMetrics(
  sector: string,
  industry: string,
  region: string
): Promise<IndustryMetricsResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in industry analysis and market sizing, with experience from Big 4 consulting firms. Provide detailed metrics and market size information based on the given sector, industry, and region. Focus on delivering high-quality, professional insights while being concise.",
        },
        {
          role: "user",
          content: `Please analyze and provide market metrics for:
            Sector: ${sector}
            Industry: ${industry}
            Region: ${region}

            Return the following in a JSON format:
            1. Total Addressable Market (TAM) in USD based on recent market research
            2. Key industry-specific metrics with reasonable default values and Big 4 benchmarks
            3. Industry benchmarks with low, median, and high values based on market leaders

            Focus on real-world data patterns and current market conditions.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result as IndustryMetricsResponse;
  } catch (error) {
    console.error("Error fetching industry metrics:", error);
    throw error;
  }
}

export async function getMetricRecommendations(
  sector: string,
  industry: string,
  metric: string
): Promise<{
  recommendation: string;
  benchmark: { low: number; median: number; high: number };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in industry analysis and benchmarking from a Big 4 consulting firm. Provide recommendations for specific industry metrics based on extensive market research.",
        },
        {
          role: "user",
          content: `Please provide recommendations and benchmarks for:
            Sector: ${sector}
            Industry: ${industry}
            Metric: ${metric}

            Return in JSON format:
            1. A specific recommendation for this metric based on industry best practices
            2. Benchmark values (low, median, high) from market research`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error fetching metric recommendations:", error);
    throw error;
  }
}