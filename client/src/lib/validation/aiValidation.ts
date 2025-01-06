import { ValuationFormData } from "../validations";
import { aiValidationService } from "@/services/aiValidation";

interface ValidationResult {
  isValid: boolean;
  warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }>;
  suggestions?: string[];
  industryInsights?: string[];
}

interface IndustryBenchmark {
  metric: string;
  range: {
    min: number;
    max: number;
  };
  typical: number;
}

const industryBenchmarks: Record<string, Record<string, IndustryBenchmark>> = {
  technology: {
    growthRate: {
      metric: "Annual Growth Rate",
      range: { min: 20, max: 200 },
      typical: 40
    },
    margins: {
      metric: "Operating Margins",
      range: { min: 10, max: 40 },
      typical: 20
    }
  },
  ecommerce: {
    growthRate: {
      metric: "Annual Growth Rate",
      range: { min: 15, max: 100 },
      typical: 30
    },
    margins: {
      metric: "Operating Margins",
      range: { min: 5, max: 20 },
      typical: 10
    }
  },
  // Add more industry benchmarks as needed
};

const stageBasedValidation: Record<string, Record<string, IndustryBenchmark>> = {
  ideation_unvalidated: {
    revenue: {
      metric: "Annual Revenue",
      range: { min: 0, max: 100000 },
      typical: 0
    }
  },
  mvp_early_traction: {
    revenue: {
      metric: "Annual Revenue",
      range: { min: 0, max: 1000000 },
      typical: 100000
    }
  },
  revenue_early: {
    revenue: {
      metric: "Annual Revenue",
      range: { min: 100000, max: 5000000 },
      typical: 1000000
    }
  }
  // Add more stage-based validations
};

export async function validateFinancialMetrics(data: ValuationFormData): Promise<ValidationResult> {
  const warnings: ValidationResult['warnings'] = [];

  // Get industry benchmarks
  const industryData = industryBenchmarks[data.sector];
  const stageData = stageBasedValidation[data.stage];

  // Rule-based validation
  if (industryData) {
    // Validate growth rate
    if (data.growthRate !== undefined) {
      const growthBenchmark = industryData.growthRate;
      if (data.growthRate > growthBenchmark.range.max) {
        warnings.push({
          field: 'growthRate',
          message: `Growth rate of ${data.growthRate}% is unusually high for ${data.sector} sector`,
          severity: 'high',
          suggestion: growthBenchmark.typical
        });
      } else if (data.growthRate < growthBenchmark.range.min) {
        warnings.push({
          field: 'growthRate',
          message: `Growth rate of ${data.growthRate}% is below average for ${data.sector} sector`,
          severity: 'medium',
          suggestion: growthBenchmark.typical
        });
      }
    }

    // Validate margins
    if (data.margins !== undefined) {
      const marginBenchmark = industryData.margins;
      if (data.margins > marginBenchmark.range.max) {
        warnings.push({
          field: 'margins',
          message: `Operating margin of ${data.margins}% is unusually high for ${data.sector} sector`,
          severity: 'high',
          suggestion: marginBenchmark.typical
        });
      } else if (data.margins < marginBenchmark.range.min) {
        warnings.push({
          field: 'margins',
          message: `Operating margin of ${data.margins}% is below average for ${data.sector} sector`,
          severity: 'medium',
          suggestion: marginBenchmark.typical
        });
      }
    }
  }

  // Stage-based revenue validation
  if (data.revenue !== undefined && stageData?.revenue) {
    const revenueBenchmark = stageData.revenue;
    if (data.revenue > revenueBenchmark.range.max) {
      warnings.push({
        field: 'revenue',
        message: `Revenue of ${data.revenue} is unusually high for ${data.stage} stage`,
        severity: 'medium'
      });
    } else if (data.revenue < revenueBenchmark.range.min) {
      warnings.push({
        field: 'revenue',
        message: `Revenue of ${data.revenue} is below typical range for ${data.stage} stage`,
        severity: 'low'
      });
    }
  }

  // Cross-field validation
  if (data.revenue && data.margins) {
    const operatingIncome = (data.revenue * data.margins) / 100;
    if (operatingIncome < 0 && data.stage !== 'ideation_unvalidated') {
      warnings.push({
        field: 'margins',
        message: 'Negative operating income may affect valuation accuracy',
        severity: 'high'
      });
    }
  }

  // Get AI-powered validation results
  try {
    const aiValidation = await aiValidationService.validateInput(data);
    warnings.push(...aiValidation.warnings);

    return {
      isValid: warnings.filter(w => w.severity === 'high').length === 0,
      warnings,
      suggestions: aiValidation.suggestions,
      industryInsights: aiValidation.industryInsights
    };
  } catch (error) {
    console.error('AI validation error:', error);
    // Fallback to rule-based validation only
    return {
      isValid: warnings.filter(w => w.severity === 'high').length === 0,
      warnings
    };
  }
}

export async function getSuggestions(data: ValuationFormData): Promise<string[]> {
  try {
    return await aiValidationService.getSuggestions(data);
  } catch (error) {
    console.error('Failed to get AI suggestions:', error);
    return [];
  }
}

export async function predictPotentialIssues(data: ValuationFormData): Promise<string[]> {
  try {
    return await aiValidationService.predictPotentialIssues(data);
  } catch (error) {
    console.error('Failed to predict potential issues:', error);
    return [];
  }
}