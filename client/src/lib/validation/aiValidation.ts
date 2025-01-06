import { ValuationFormData } from "../validations";

interface ValidationResult {
  isValid: boolean;
  warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }>;
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
  seed: {
    revenue: {
      metric: "Annual Revenue",
      range: { min: 0, max: 1000000 },
      typical: 100000
    }
  },
  early: {
    revenue: {
      metric: "Annual Revenue",
      range: { min: 100000, max: 5000000 },
      typical: 1000000
    }
  },
  // Add more stage-based validations
};

export function validateFinancialMetrics(data: ValuationFormData): ValidationResult {
  const warnings: ValidationResult['warnings'] = [];

  // Get industry benchmarks
  const industryData = industryBenchmarks[data.sector];
  const stageData = stageBasedValidation[data.stage];

  if (!industryData) {
    warnings.push({
      field: 'sector',
      message: 'Industry benchmarks not available for this sector',
      severity: 'low'
    });
    return { isValid: true, warnings };
  }

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
    if (operatingIncome < 0 && data.stage !== 'seed') {
      warnings.push({
        field: 'margins',
        message: 'Negative operating income may affect valuation accuracy',
        severity: 'high'
      });
    }
  }

  return {
    isValid: warnings.filter(w => w.severity === 'high').length === 0,
    warnings
  };
}

export function getSuggestions(data: ValuationFormData): string[] {
  const suggestions: string[] = [];
  const { warnings } = validateFinancialMetrics(data);

  warnings.forEach(warning => {
    if (warning.suggestion !== undefined) {
      suggestions.push(
        `Consider adjusting ${warning.field} to around ${warning.suggestion} based on industry benchmarks.`
      );
    }
  });

  return suggestions;
}
