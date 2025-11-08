// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import {
  generateValuationReport,
  validateMetrics,
  assessBusinessModel,
  evaluateTeamExpertise,
  assessIntellectualProperty,
  analyzeMarketSentiment
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
  business_model_assessment?: {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    competitive_advantages: string[];
  };
  team_evaluation?: {
    team_score: number;
    key_strengths: string[];
    skill_gaps: string[];
    recommendations: string[];
    industry_fit: string;
  };
  ip_assessment?: {
    ip_value_score: number;
    key_assets: any[];
    risk_factors: string[];
    protection_strategy: string;
    monetization_opportunities: string[];
  };
  market_sentiment?: {
    sentiment_score: number;
    positive_factors: string[];
    negative_factors: string[];
    trends: string[];
    recommendations: string[];
  };
  metric_validations?: {
    validations: Record<string, { isValid: boolean; suggestion: string }>;
    insights: string[];
  };
}

export async function generateFullValuationReport(
  formData: ValuationFormData
): Promise<ValuationReport> {
  try {
    // 1. Validate metrics first
    const metricValidations = await validateMetrics(
      formData.industryMetrics || {},
      formData.industry,
      formData.region
    );

    // 2. Assess business model
    const businessModelAssessment = await assessBusinessModel(
      {
        stage: formData.stage,
        revenue: formData.revenue,
        margins: formData.margins,
        growthRate: formData.growthRate,
      },
      formData.industry
    );

    // 3. Evaluate team expertise
    const teamEvaluation = await evaluateTeamExpertise(
      formData.teamExperience || [],
      formData.industry
    );

    // 4. Assess intellectual property
    const ipAssessment = await assessIntellectualProperty(
      formData.intellectualProperty || [],
      formData.industry
    );

    // 5. Analyze market sentiment
    const marketSentiment = await analyzeMarketSentiment(
      formData.businessName,
      formData.industry
    );

    // 6. Generate the main valuation report
    const mainReport = await generateValuationReport(
      formData,
      formData.industryMetrics,
      {
        revenue: formData.revenue,
        margins: formData.margins,
        growthRate: formData.growthRate,
      },
      {
        stage: formData.stage,
        intellectualProperty: formData.intellectualProperty,
        teamExperience: formData.teamExperience,
        businessModel: businessModelAssessment,
        marketSentiment: marketSentiment,
      }
    );

    // 7. Combine all sections into a comprehensive report
    return {
      ...mainReport,
      business_model_assessment: businessModelAssessment,
      team_evaluation: teamEvaluation,
      ip_assessment: ipAssessment,
      market_sentiment: marketSentiment,
      metric_validations: metricValidations,
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
      title: "Business Model Assessment",
      content: report.business_model_assessment ? `
        Overall Score: ${report.business_model_assessment.overall_score}/100

        Key Strengths:
        ${report.business_model_assessment.strengths.map(s => `• ${s}`).join('\n')}

        Areas for Improvement:
        ${report.business_model_assessment.weaknesses.map(w => `• ${w}`).join('\n')}

        Competitive Advantages:
        ${report.business_model_assessment.competitive_advantages.map(a => `• ${a}`).join('\n')}

        Recommendations:
        ${report.business_model_assessment.recommendations.map(r => `• ${r}`).join('\n')}
      ` : '',
    },
    {
      title: "Team Expertise Evaluation",
      content: report.team_evaluation ? `
        Team Score: ${report.team_evaluation.team_score}/100
        Industry Fit: ${report.team_evaluation.industry_fit}

        Key Strengths:
        ${report.team_evaluation.key_strengths.map(s => `• ${s}`).join('\n')}

        Skill Gaps:
        ${report.team_evaluation.skill_gaps.map(g => `• ${g}`).join('\n')}

        Recommendations:
        ${report.team_evaluation.recommendations.map(r => `• ${r}`).join('\n')}
      ` : '',
    },
    {
      title: "Intellectual Property Assessment",
      content: report.ip_assessment ? `
        IP Value Score: ${report.ip_assessment.ip_value_score}/100

        Key Assets:
        ${report.ip_assessment.key_assets.map(a => `• ${a}`).join('\n')}

        Risk Factors:
        ${report.ip_assessment.risk_factors.map(r => `• ${r}`).join('\n')}

        Protection Strategy:
        ${report.ip_assessment.protection_strategy}

        Monetization Opportunities:
        ${report.ip_assessment.monetization_opportunities.map(o => `• ${o}`).join('\n')}
      ` : '',
    },
    {
      title: "Market Sentiment Analysis",
      content: report.market_sentiment ? `
        Sentiment Score: ${report.market_sentiment.sentiment_score}

        Positive Factors:
        ${report.market_sentiment.positive_factors.map(f => `• ${f}`).join('\n')}

        Negative Factors:
        ${report.market_sentiment.negative_factors.map(f => `• ${f}`).join('\n')}

        Current Trends:
        ${report.market_sentiment.trends.map(t => `• ${t}`).join('\n')}

        Recommendations:
        ${report.market_sentiment.recommendations.map(r => `• ${r}`).join('\n')}
      ` : '',
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
      title: "Key Metrics Validation",
      content: report.metric_validations ? `
        Insights:
        ${report.metric_validations.insights.map(i => `• ${i}`).join('\n')}

        Metric-Specific Validations:
        ${Object.entries(report.metric_validations.validations)
          .map(([metric, validation]) => 
            `${metric}:\n${validation.isValid ? '✓' : '⚠'} ${validation.suggestion}`
          )
          .join('\n\n')}
      ` : '',
    },
    {
      title: "Recommendations",
      content: report.recommendations,
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
      if (!section.content && (!section.subsections || section.subsections.length === 0)) {
        return '';
      }

      if (section.subsections) {
        return `# ${section.title}\n\n${section.subsections
          .map((sub) => `## ${sub.title}\n\n${sub.content}`)
          .join("\n\n")}`;
      }
      return `# ${section.title}\n\n${section.content}`;
    })
    .filter(Boolean)
    .join("\n\n");
}