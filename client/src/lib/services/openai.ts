import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

// Cache for industry metrics to reduce API calls
const metricsCache = new Map<string, any>();

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
  // Create cache key
  const cacheKey = `${sector}-${industry}-${region}`;

  // Check cache first
  if (metricsCache.has(cacheKey)) {
    return metricsCache.get(cacheKey);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a senior industry analyst with expertise in ${sector}, specifically focusing on market metrics and valuation benchmarks. Provide detailed, research-backed metrics that follow Big 4 consulting standards.`,
        },
        {
          role: "user",
          content: `Generate comprehensive industry metrics for:
            Sector: ${sector}
            Industry: ${industry}
            Region: ${region}

            Required metrics structure:
            1. Total Addressable Market (TAM) in USD
            2. Key performance metrics specific to this industry segment
            3. Industry benchmarks with specific low/median/high values

            Focus on the most relevant metrics for ${industry} such as:
            - Revenue Growth Rate
            - Gross Margin
            - Customer Acquisition Cost (CAC)
            - Lifetime Value (LTV)
            - R&D as % of Revenue
            - Sales Efficiency
            - Market Share

            Ensure all numbers are realistic and backed by current market research.
            Return data in a structured JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent outputs
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Validate and normalize the response
    const normalizedResponse: IndustryMetricsResponse = {
      tam: result.tam || 0,
      metrics: result.metrics || {},
      benchmarks: result.benchmarks || {},
    };

    // Cache the result
    metricsCache.set(cacheKey, normalizedResponse);

    return normalizedResponse;
  } catch (error) {
    console.error("Error fetching industry metrics:", error);
    throw new Error("Failed to fetch industry metrics. Please try again.");
  }
}

interface ValuationReport {
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
}

// Enhanced valuation report generation with focused prompting
export async function generateValuationReport(
  businessData: any,
  industryMetrics: any,
  financials: any,
  assumptions: any
): Promise<ValuationReport> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a senior valuation expert from a Big 4 firm with extensive experience in ${businessData.sector}. Generate a detailed, professional-grade valuation report following ASC 820, IPEV, and IVS standards.`,
        },
        {
          role: "user",
          content: `Generate a comprehensive valuation report for:

            Business Profile:
            ${JSON.stringify(businessData, null, 2)}

            Industry Context:
            ${JSON.stringify(industryMetrics, null, 2)}

            Financial Data:
            ${JSON.stringify(financials, null, 2)}

            Valuation Assumptions:
            ${JSON.stringify(assumptions, null, 2)}

            Required sections:
            1. Executive Summary (concise overview of key findings)
            2. Industry Analysis (market position, competitive landscape)
            3. Financial Analysis (historical performance, projections)
            4. Valuation Methods:
               - DCF Analysis
               - Market Approach
               - Precedent Transactions
            5. Risk Assessment (key risks and mitigating factors)
            6. Growth Projections (scenarios and opportunities)
            7. Sensitivity Analysis (key value drivers)
            8. Recommendations (strategic insights)
            9. Appendix (detailed calculations, comparables)

            Follow Big 4 standards for professional report writing.
            Include specific citations for industry benchmarks and market data.
            Focus on actionable insights and clear analysis.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for professional consistency
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating valuation report:", error);
    throw error;
  }
}

// Real-time metric validation and suggestions
export async function validateMetrics(
  metrics: Record<string, number>,
  industry: string,
  region: string
): Promise<{
  validations: Record<string, { isValid: boolean; suggestion: string }>;
  insights: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial metrics validation expert. Analyze the provided metrics and provide real-time feedback and suggestions.",
        },
        {
          role: "user",
          content: `Validate these metrics for ${industry} in ${region}:
            ${JSON.stringify(metrics, null, 2)}

            For each metric:
            1. Check if it's within reasonable range
            2. Provide specific improvement suggestions
            3. Highlight any potential red flags
            4. Suggest industry-specific optimizations

            Return in JSON format with validations and insights arrays.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error validating metrics:", error);
    throw error;
  }
}

// Business model strength assessment
export async function assessBusinessModel(
  businessModel: any,
  industry: string
): Promise<{
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  competitive_advantages: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a business model analysis expert. Assess the provided business model and provide detailed insights.",
        },
        {
          role: "user",
          content: `Analyze this business model for ${industry}:
            ${JSON.stringify(businessModel, null, 2)}

            Provide:
            1. Overall score (0-100)
            2. Key strengths
            3. Areas for improvement
            4. Specific recommendations
            5. Competitive advantages

            Focus on actionable insights and industry-specific factors.
            Return in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error assessing business model:", error);
    throw error;
  }
}

// Team expertise evaluation
export async function evaluateTeamExpertise(
  team: any[],
  industry: string
): Promise<{
  team_score: number;
  key_strengths: string[];
  skill_gaps: string[];
  recommendations: string[];
  industry_fit: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in team evaluation and organizational development. Assess the team's expertise and provide insights.",
        },
        {
          role: "user",
          content: `Evaluate this team for ${industry}:
            ${JSON.stringify(team, null, 2)}

            Provide:
            1. Overall team score (0-100)
            2. Key strengths
            3. Skill gaps
            4. Development recommendations
            5. Industry fit assessment

            Focus on industry-specific requirements and team dynamics.
            Return in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error evaluating team expertise:", error);
    throw error;
  }
}

// Patent and IP value assessment
export async function assessIntellectualProperty(
  ip: any[],
  industry: string
): Promise<{
  ip_value_score: number;
  key_assets: any[];
  risk_factors: string[];
  protection_strategy: string;
  monetization_opportunities: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an intellectual property valuation expert. Assess the provided IP portfolio and provide detailed insights.",
        },
        {
          role: "user",
          content: `Assess this IP portfolio for ${industry}:
            ${JSON.stringify(ip, null, 2)}

            Provide:
            1. IP value score (0-100)
            2. Key IP assets analysis
            3. Risk factors
            4. Protection strategy
            5. Monetization opportunities

            Focus on industry-specific value drivers and protection needs.
            Return in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error assessing intellectual property:", error);
    throw error;
  }
}

// Market sentiment analysis
export async function analyzeMarketSentiment(
  company: string,
  industry: string
): Promise<{
  sentiment_score: number;
  positive_factors: string[];
  negative_factors: string[];
  trends: string[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a market sentiment analysis expert. Analyze market perception and provide detailed insights.",
        },
        {
          role: "user",
          content: `Analyze market sentiment for ${company} in ${industry}:

            Provide:
            1. Overall sentiment score (-100 to 100)
            2. Positive factors
            3. Negative factors
            4. Current trends
            5. Recommendations

            Focus on market perception and sentiment drivers.
            Return in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing market sentiment:", error);
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
          content: "You are an expert in industry analysis and benchmarking from a Big 4 consulting firm. Provide specific, actionable recommendations based on current market data.",
        },
        {
          role: "user",
          content: `Provide detailed recommendations for:
            Sector: ${sector}
            Industry: ${industry}
            Metric: ${metric}

            Include:
            1. Specific recommendation based on industry best practices
            2. Benchmark values (low, median, high) from current market data
            3. Context for the recommendations

            Focus on actionable insights that drive value.
            Base recommendations on verifiable market data.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error fetching metric recommendations:", error);
    throw error;
  }
}

// Add this after the existing functions

export async function analyzePitchDeck(slides: Array<{ slideNumber: number; content: string; type: string }>): Promise<{
  overallScore: number;
  sections: Array<{
    name: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }>;
  keyStrengths: string[];
  improvementAreas: string[];
  marketAnalysis: string;
  competitiveAdvantage: string;
  presentationStyle: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert pitch deck analyst with extensive experience in startup valuations and venture capital. Analyze the provided pitch deck slides and provide comprehensive feedback.",
        },
        {
          role: "user",
          content: `Analyze this pitch deck:
            ${JSON.stringify(slides, null, 2)}

            Provide:
            1. Overall score (0-100)
            2. Section-by-section analysis with scores and specific suggestions
            3. Key strengths
            4. Areas for improvement
            5. Market analysis insights
            6. Competitive advantage assessment
            7. Presentation style feedback

            Focus on actionable improvements and industry best practices.
            Return in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing pitch deck:", error);
    throw error;
  }
}