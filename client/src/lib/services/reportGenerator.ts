// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import {
  generateValuationReport,
  generatePeerAnalysis,
  generateRiskAssessment,
  getIndustryMetrics,
  getMetricRecommendations
} from './openai';
import type { ValuationFormData } from '@/lib/validations';

export interface ValuationReport {
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
  peer_analysis?: {
    comparable_companies: Array<{
      name: string;
      description: string;
      key_metrics: Record<string, number>;
      valuation_multiples: Record<string, number>;
    }>;
    analysis: string;
    recommendations: string;
  };
  risk_matrix?: {
    key_risks: Array<{
      category: string;
      description: string;
      impact: string;
      mitigation: string;
      severity: "low" | "medium" | "high";
    }>;
    risk_matrix: string;
    mitigation_strategy: string;
  };
  metric_recommendations?: Array<{
    metric: string;
    current_value: number;
    recommendation: string;
    improvement_potential: string;
    industry_context: string;
  }>;
}

export async function generateFullValuationReport(
  formData: ValuationFormData
): Promise<ValuationReport> {
  try {
    // 1. Get industry metrics first
    const industryMetrics = await getIndustryMetrics(
      formData.sector,
      formData.industry,
      formData.region
    );

    // 2. Generate the main valuation report
    const mainReport = await generateValuationReport(
      formData,
      industryMetrics,
      {
        revenue: formData.revenue,
        margins: formData.margins,
        growthRate: formData.growthRate,
      },
      {
        stage: formData.stage,
        intellectualProperty: formData.intellectualProperty,
        teamExperience: formData.teamExperience,
        customerBase: formData.customerBase,
        competitiveDifferentiation: formData.competitiveDifferentiation,
        regulatoryCompliance: formData.regulatoryCompliance,
        scalability: formData.scalability,
      }
    );

    // 3. Generate peer analysis
    const peerAnalysis = await generatePeerAnalysis(
      formData.sector,
      formData.industry,
      formData.region,
      formData.industryMetrics
    );

    // 4. Generate risk assessment
    const riskAssessment = await generateRiskAssessment(
      formData,
      industryMetrics,
      {
        revenue: formData.revenue,
        margins: formData.margins,
        growthRate: formData.growthRate,
      }
    );

    // 5. Generate metric-specific recommendations
    const metricRecommendations = await Promise.all(
      Object.entries(formData.industryMetrics || {}).map(async ([metric, value]) => {
        const recommendation = await getMetricRecommendations(
          formData.sector,
          formData.industry,
          metric
        );
        return {
          metric,
          current_value: value,
          recommendation: recommendation.recommendation,
          improvement_potential: `${Math.round((recommendation.benchmark.high - value) / value * 100)}%`,
          industry_context: `Current value (${value}) compared to industry benchmark: Low (${recommendation.benchmark.low}) - High (${recommendation.benchmark.high})`
        };
      })
    );

    // 6. Combine all sections into a comprehensive report
    return {
      ...mainReport,
      peer_analysis: peerAnalysis,
      risk_matrix: riskAssessment,
      metric_recommendations: metricRecommendations
    };
  } catch (error) {
    console.error("Error generating full valuation report:", error);
    throw error;
  }
}

// Format the report for display
export function formatReport(report: ValuationReport): string {
  // Convert the report object into a properly formatted document
  const sections = [
    {
      title: "Executive Summary",
      content: report.executive_summary,
    },
    {
      title: "Industry Analysis",
      content: report.industry_analysis,
    },
    {
      title: "Financial Analysis",
      content: report.financial_analysis,
    },
    {
      title: "Valuation Methods",
      subsections: [
        {
          title: "DCF Analysis",
          content: report.valuation_methods.dcf_analysis,
        },
        {
          title: "Market Approach",
          content: report.valuation_methods.market_approach,
        },
        {
          title: "Precedent Transactions",
          content: report.valuation_methods.precedent_transactions,
        },
      ],
    },
    {
      title: "Risk Assessment",
      content: report.risk_assessment,
    },
    {
      title: "Growth Projections",
      content: report.growth_projections,
    },
    {
      title: "Sensitivity Analysis",
      content: report.sensitivity_analysis,
    },
    {
      title: "Recommendations",
      content: report.recommendations,
    },
    {
      title: "Metric Optimization Recommendations",
      content: report.metric_recommendations?.map(rec => 
        `### ${rec.metric}\n\n` +
        `**Current Status**: ${rec.current_value}\n` +
        `**Recommendation**: ${rec.recommendation}\n` +
        `**Improvement Potential**: ${rec.improvement_potential}\n` +
        `**Industry Context**: ${rec.industry_context}\n`
      ).join('\n\n') || '',
    },
    {
      title: "Appendix",
      subsections: [
        {
          title: "Financial Tables",
          content: report.appendix.financial_tables,
        },
        {
          title: "Comparable Companies Analysis",
          content: report.appendix.comparable_companies,
        },
        {
          title: "Methodology Details",
          content: report.appendix.methodology_details,
        },
      ],
    },
  ];

  // Format the document with proper sections and styling
  return sections
    .map((section) => {
      if (section.subsections) {
        return `# ${section.title}\n\n${section.subsections
          .map((sub) => `## ${sub.title}\n\n${sub.content}`)
          .join("\n\n")}`;
      }
      return `# ${section.title}\n\n${section.content}`;
    })
    .join("\n\n");
}