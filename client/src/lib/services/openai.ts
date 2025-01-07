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
          content: `You are a senior industry analyst from a Big 4 consulting firm. Provide detailed market sizing and industry metrics based on current market research and industry standards. Focus on ${sector} sector insights.`,
        },
        {
          role: "user",
          content: `Generate comprehensive industry metrics for:
            Sector: ${sector}
            Industry: ${industry}
            Region: ${region}

            Return a JSON object with:
            1. TAM (Total Addressable Market) in USD with latest market research
            2. Key performance metrics specific to ${industry}
            3. Industry benchmarks (low/median/high) from market leaders
            4. Growth rates and market multiples

            Base your analysis on real market data and Big 4 consulting standards.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error fetching industry metrics:", error);
    throw error;
  }
}

export async function generateValuationReport(
  businessData: any,
  industryMetrics: any,
  financials: any,
  assumptions: any
): Promise<{
  executive_summary: string;
  industry_analysis: string;
  financial_analysis: string;
  valuation_methods: {
    dcf_analysis: string;
    market_approach: string;
    precedent_transactions: string;
  };
  risk_assessment: string;
  growth_projections: string;
  sensitivity_analysis: string;
  recommendations: string;
  appendix: {
    financial_tables: string;
    comparable_companies: string;
    methodology_details: string;
  };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a senior valuation expert from a Big 4 consulting firm with extensive experience in ${businessData.sector}. Generate a comprehensive, professional-grade valuation report following industry standards and best practices.`,
        },
        {
          role: "user",
          content: `Generate a detailed 10-12 page valuation report for:

            Business Profile:
            ${JSON.stringify(businessData, null, 2)}

            Industry Metrics:
            ${JSON.stringify(industryMetrics, null, 2)}

            Financial Data:
            ${JSON.stringify(financials, null, 2)}

            Valuation Assumptions:
            ${JSON.stringify(assumptions, null, 2)}

            Requirements:
            1. Executive Summary: Concise overview of valuation conclusions
            2. Industry Analysis: Detailed market analysis and competitive positioning
            3. Financial Analysis: Historical and projected performance analysis
            4. Valuation Methods: DCF, market approach, and precedent transactions
            5. Risk Assessment: Key risks and mitigating factors
            6. Growth Projections: Future growth opportunities and scenarios
            7. Sensitivity Analysis: Impact of key variables on valuation
            8. Recommendations: Strategic insights and next steps
            9. Appendix: Detailed financial tables, comparables, and methodology

            Follow Big 4 consulting standards for professional report writing.
            Focus on actionable insights and clear analysis.
            Include relevant charts and tables in the analysis.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating valuation report:", error);
    throw error;
  }
}

export async function generatePeerAnalysis(
  sector: string,
  industry: string,
  region: string,
  metrics: any
): Promise<{
  comparable_companies: Array<{
    name: string;
    description: string;
    key_metrics: Record<string, number>;
    valuation_multiples: Record<string, number>;
  }>;
  analysis: string;
  recommendations: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior equity research analyst specializing in comparable company analysis and market benchmarking.",
        },
        {
          role: "user",
          content: `Generate a detailed peer analysis for:
            Sector: ${sector}
            Industry: ${industry}
            Region: ${region}
            Company Metrics: ${JSON.stringify(metrics)}

            Provide:
            1. List of relevant comparable companies
            2. Key metrics and multiples for each company
            3. Comparative analysis
            4. Valuation implications

            Base analysis on current market data and industry standards.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating peer analysis:", error);
    throw error;
  }
}

export async function generateRiskAssessment(
  businessData: any,
  industryMetrics: any,
  financials: any
): Promise<{
  key_risks: Array<{
    category: string;
    description: string;
    impact: string;
    mitigation: string;
    severity: "low" | "medium" | "high";
  }>;
  risk_matrix: string;
  mitigation_strategy: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a risk assessment specialist with expertise in business valuation and risk management.",
        },
        {
          role: "user",
          content: `Conduct a comprehensive risk assessment for:
            Business Data: ${JSON.stringify(businessData)}
            Industry Metrics: ${JSON.stringify(industryMetrics)}
            Financials: ${JSON.stringify(financials)}

            Provide:
            1. Key risks identification and analysis
            2. Risk severity and probability matrix
            3. Detailed mitigation strategies
            4. Impact on valuation considerations

            Follow professional risk assessment frameworks.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating risk assessment:", error);
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