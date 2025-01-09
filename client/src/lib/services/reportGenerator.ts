import { getIndustryMetrics, generateValuationReport, generatePeerAnalysis, generateRiskAssessment } from "./openai";
import type { ValuationFormData } from "@/lib/validations";

export async function generateCompleteValuationReport(formData: ValuationFormData) {
  try {
    // Step 1: Get Industry Metrics
    const industryMetrics = await getIndustryMetrics(
      formData.sector,
      formData.industry,
      formData.region
    );

    // Step 2: Generate Peer Analysis
    const peerAnalysis = await generatePeerAnalysis(
      formData.sector,
      formData.industry,
      formData.region,
      formData
    );

    // Step 3: Generate Risk Assessment
    const riskAssessment = await generateRiskAssessment(
      formData,
      industryMetrics,
      {
        revenue: formData.revenue,
        growthRate: formData.growthRate,
        margins: formData.margins,
      }
    );

    // Step 4: Generate Complete Valuation Report
    const valuationReport = await generateValuationReport(
      formData,
      industryMetrics,
      {
        revenue: formData.revenue,
        growthRate: formData.growthRate,
        margins: formData.margins,
      },
      {
        industryBenchmarks: industryMetrics.benchmarks,
        peerAnalysis: peerAnalysis,
        riskAssessment: riskAssessment,
      }
    );

    return {
      summary: {
        businessName: formData.businessName,
        sector: formData.sector,
        industry: formData.industry,
        region: formData.region,
        currentValuation: formData.valuation,
      },
      industryMetrics,
      peerAnalysis,
      riskAssessment,
      valuationReport,
    };
  } catch (error) {
    console.error("Error generating complete valuation report:", error);
    throw error;
  }
}

export function formatValuationReport(reportData: any) {
  return {
    title: `Valuation Report - ${reportData.summary.businessName}`,
    sections: [
      {
        title: "Executive Summary",
        content: reportData.valuationReport.executive_summary,
      },
      {
        title: "Industry Analysis",
        content: reportData.valuationReport.industry_analysis,
        subsections: [
          {
            title: "Market Overview",
            content: `Total Addressable Market: $${(reportData.industryMetrics.tam / 1000000000).toFixed(2)}B`,
          },
          {
            title: "Peer Analysis",
            content: reportData.peerAnalysis.analysis,
          },
        ],
      },
      {
        title: "Financial Analysis",
        content: reportData.valuationReport.financial_analysis,
      },
      {
        title: "Valuation Methods",
        content: Object.entries(reportData.valuationReport.valuation_methods)
          .map(([method, analysis]) => `${method.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}\n${analysis}`)
          .join('\n\n'),
      },
      {
        title: "Risk Assessment",
        content: reportData.valuationReport.risk_assessment,
        subsections: reportData.riskAssessment.key_risks.map((risk: any) => ({
          title: risk.category,
          content: `Impact: ${risk.impact}\nMitigation: ${risk.mitigation}\nSeverity: ${risk.severity}`,
        })),
      },
      {
        title: "Growth Projections",
        content: reportData.valuationReport.growth_projections,
      },
      {
        title: "Sensitivity Analysis",
        content: reportData.valuationReport.sensitivity_analysis,
      },
      {
        title: "Recommendations",
        content: reportData.valuationReport.recommendations,
      },
      {
        title: "Appendix",
        subsections: [
          {
            title: "Financial Tables",
            content: reportData.valuationReport.appendix.financial_tables,
          },
          {
            title: "Comparable Companies",
            content: reportData.valuationReport.appendix.comparable_companies,
          },
          {
            title: "Methodology Details",
            content: reportData.valuationReport.appendix.methodology_details,
          },
        ],
      },
    ],
  };
}
