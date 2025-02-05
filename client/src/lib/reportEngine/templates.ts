import { SectionConfig } from "./types";
import type { ValuationFormData } from "@/lib/validations";

export const defaultReportTemplate = {
  executiveSummary: {
    title: "Executive Summary",
    sections: [
      {
        id: "valuationRange",
        title: "Valuation Range",
        enabled: true,
        required: true,
      },
      {
        id: "keyHighlights",
        title: "Key Business Highlights",
        enabled: true,
        required: true,
      },
      {
        id: "keyMetrics",
        title: "Key Performance Metrics",
        enabled: true,
        required: true,
      },
      {
        id: "confidenceScores",
        title: "Confidence Metrics",
        enabled: true,
        required: false,
      }
    ]
  },
  financialAnalysis: {
    title: "Financial Analysis",
    sections: [
      {
        id: "revenueAnalysis",
        title: "Revenue and Growth Analysis",
        enabled: true,
        required: true,
      },
      {
        id: "unitEconomics",
        title: "Unit Economics",
        enabled: true,
        required: true,
      },
      {
        id: "cashFlow",
        title: "Cash Flow and Runway",
        enabled: true,
        required: true,
      },
      {
        id: "projections",
        title: "Financial Projections",
        enabled: true,
        required: false,
      }
    ]
  },
  marketAnalysis: {
    title: "Market Analysis",
    sections: [
      {
        id: "marketSize",
        title: "Market Size (TAM, SAM, SOM)",
        enabled: true,
        required: true,
      },
      {
        id: "competitorAnalysis",
        title: "Competitor Analysis",
        enabled: true,
        required: true,
      },
      {
        id: "marketTrends",
        title: "Market Trends and Growth",
        enabled: true,
        required: true,
      },
      {
        id: "barriers",
        title: "Entry Barriers & Opportunities",
        enabled: true,
        required: false,
      }
    ]
  },
  riskAssessment: {
    title: "Risk Assessment",
    sections: [
      {
        id: "riskMatrix",
        title: "Risk Matrix",
        enabled: true,
        required: true,
      },
      {
        id: "mitigationStrategies",
        title: "Risk Mitigation Strategies",
        enabled: true,
        required: true,
      },
      {
        id: "sensitivityAnalysis",
        title: "Sensitivity Analysis",
        enabled: true,
        required: false,
      }
    ]
  },
  valuationMethodology: {
    title: "Valuation Methodology",
    sections: [
      {
        id: "methodology",
        title: "Applied Methods",
        enabled: true,
        required: true,
      },
      {
        id: "assumptions",
        title: "Key Assumptions",
        enabled: true,
        required: true,
      },
      {
        id: "comparables",
        title: "Comparable Analysis",
        enabled: true,
        required: true,
      },
      {
        id: "aiInsights",
        title: "AI-Powered Insights",
        enabled: true,
        required: false,
      }
    ]
  },
  appendices: {
    title: "Appendices",
    sections: [
      {
        id: "detailedFinancials",
        title: "Detailed Financial Statements",
        enabled: true,
        required: false,
      },
      {
        id: "marketData",
        title: "Market Research Data",
        enabled: true,
        required: false,
      },
      {
        id: "modelAssumptions",
        title: "Detailed Model Assumptions",
        enabled: true,
        required: false,
      }
    ]
  }
};

export type ReportTemplate = typeof defaultReportTemplate;
export type ReportSection = keyof typeof defaultReportTemplate;

export interface ReportCustomization {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
  };
  enabledSections: Partial<Record<ReportSection, boolean>>;
  format: 'pdf' | 'excel' | 'html';
  outputPreferences?: {
    includeCharts: boolean;
    includeTables: boolean;
    includeExecutiveSummary: boolean;
    includeAppendices: boolean;
    chartStyle: 'minimal' | 'detailed';
    colorScheme: 'light' | 'dark' | 'print';
  };
}

export const defaultCustomization: ReportCustomization = {
  enabledSections: {
    executiveSummary: true,
    financialAnalysis: true,
    marketAnalysis: true,
    riskAssessment: true,
    valuationMethodology: true,
    appendices: false
  },
  format: 'pdf',
  outputPreferences: {
    includeCharts: true,
    includeTables: true,
    includeExecutiveSummary: true,
    includeAppendices: false,
    chartStyle: 'detailed',
    colorScheme: 'light'
  }
};

export function validateReportConfig(config: ReportCustomization): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if at least one section is enabled
  const hasEnabledSection = Object.values(config.enabledSections).some(enabled => enabled);
  if (!hasEnabledSection) {
    errors.push("At least one report section must be enabled");
  }

  // Validate format
  if (!['pdf', 'excel', 'html'].includes(config.format)) {
    errors.push("Invalid export format specified");
  }

  // Validate branding if provided
  if (config.branding) {
    if (config.branding.logo && !config.branding.logo.startsWith('data:image/')) {
      errors.push("Logo must be a valid base64 encoded image");
    }

    if (config.branding.primaryColor && !/^#[0-9A-F]{6}$/i.test(config.branding.primaryColor)) {
      errors.push("Primary color must be a valid hex color code");
    }
  }

  // Validate output preferences if provided
  if (config.outputPreferences) {
    if (config.outputPreferences.chartStyle && !['minimal', 'detailed'].includes(config.outputPreferences.chartStyle)) {
      errors.push("Invalid chart style specified");
    }

    if (config.outputPreferences.colorScheme && !['light', 'dark', 'print'].includes(config.outputPreferences.colorScheme)) {
      errors.push("Invalid color scheme specified");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}