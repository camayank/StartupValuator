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
        id: "keyDrivers",
        title: "Key Value Drivers",
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
  detailedAnalysis: {
    title: "Detailed Analysis",
    sections: [
      {
        id: "methodology",
        title: "Valuation Methodology",
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
        id: "calculations",
        title: "Detailed Calculations",
        enabled: true,
        required: false,
      }
    ]
  },
  visualizations: {
    title: "Visual Analysis",
    sections: [
      {
        id: "revenueGrowth",
        title: "Revenue Growth Trajectory",
        enabled: true,
        required: false,
      },
      {
        id: "marketShare",
        title: "Market Share Analysis",
        enabled: true,
        required: false,
      },
      {
        id: "valuationBreakdown",
        title: "Valuation Components",
        enabled: true,
        required: true,
      }
    ]
  },
  scenarioAnalysis: {
    title: "Scenario Analysis",
    sections: [
      {
        id: "bestCase",
        title: "Optimistic Scenario",
        enabled: true,
        required: false,
      },
      {
        id: "baseCase",
        title: "Base Case",
        enabled: true,
        required: true,
      },
      {
        id: "worstCase",
        title: "Conservative Scenario",
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
}

export const defaultCustomization: ReportCustomization = {
  enabledSections: {
    executiveSummary: true,
    detailedAnalysis: true,
    visualizations: true,
    scenarioAnalysis: true
  },
  format: 'pdf'
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

  return {
    valid: errors.length === 0,
    errors
  };
}
