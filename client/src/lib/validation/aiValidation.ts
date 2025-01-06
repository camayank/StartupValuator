import { z } from 'zod';
import { type ValuationFormData } from "@/lib/validations";
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

// Industry-Specific Configuration
export interface IndustrySpecificRules {
  churnRate?: {
    expected: number;
    warning: number;
    critical: number;
  };
  seasonality?: {
    peakMonths: string[];
    lowMonths: string[];
    varianceThreshold: number;
  };
  commodityDependence?: {
    commodities: string[];
    priceImpact: number;
  };
}

// Monte Carlo Configuration
export interface MonteCarloConfig {
  iterations: number;
  confidenceIntervals: number[];
  variables: string[];
  distributions: Record<string, {
    type: 'normal' | 'uniform' | 'triangular';
    parameters: Record<string, number>;
  }>;
}

// Peer Comparison Configuration
export interface PeerComparisonConfig {
  metrics: string[];
  weightings: Record<string, number>;
  minimumPeers: number;
  adjustmentFactors: Record<string, number>;
}

// User Feedback Configuration
export interface UserFeedbackConfig {
  categories: string[];
  weightings: Record<string, number>;
  minimumResponses: number;
  confidenceThreshold: number;
}

// Enhanced Sensitivity Configuration
export interface SensitivityConfig {
  variables: string[];
  ranges: Record<string, { min: number; max: number }>;
  steps: number;
  correlations: Record<string, Record<string, number>>;
}

// Report Customization Configuration
export interface ReportConfig {
  templates: string[];
  sections: Record<string, {
    required: boolean;
    customizable: boolean;
  }>;
  branding: {
    allowLogo: boolean;
    allowColors: boolean;
    allowFonts: boolean;
  };
}

// Automation Configuration
export interface AutomationConfig {
  updateFrequency: number;
  dataSources: string[];
  triggers: Record<string, {
    condition: string;
    action: string;
  }>;
}

// AI Enhancement Configuration
export interface AIConfig {
  models: string[];
  tasks: string[];
  confidenceThresholds: Record<string, number>;
  feedbackLoop: boolean;
}


// Add these to the EnhancedRegionRules interface
export interface EnhancedRegionRules extends RegionRules {
  industrySpecific: Record<string, IndustrySpecificRules>;
  monteCarlo: MonteCarloConfig;
  peerComparison: PeerComparisonConfig;
  userFeedback: UserFeedbackConfig;
  sensitivity: SensitivityConfig;
  reporting: ReportConfig;
  automation: AutomationConfig;
  aiEnhancements: AIConfig;
}

// Update region rules with new configurations
export const enhancedRegionRules: Record<string, EnhancedRegionRules> = {
  'US': {
    // ... existing configuration ...
    industrySpecific: {
      'SaaS': {
        churnRate: {
          expected: 0.05,
          warning: 0.10,
          critical: 0.15
        }
      },
      'Retail': {
        seasonality: {
          peakMonths: ['11', '12'],
          lowMonths: ['1', '2'],
          varianceThreshold: 0.3
        }
      }
    },
    monteCarlo: {
      iterations: 1000,
      confidenceIntervals: [0.9, 0.95, 0.99],
      variables: ['revenue', 'margins', 'growth'],
      distributions: {
        revenue: {
          type: 'normal',
          parameters: { mean: 1, stddev: 0.2 }
        }
      }
    },
    peerComparison: {
      metrics: ['revenue', 'margins', 'growth'],
      weightings: {
        revenue: 0.3,
        margins: 0.4,
        growth: 0.3
      },
      minimumPeers: 3,
      adjustmentFactors: {
        size: 0.2,
        geography: 0.1
      }
    },
    userFeedback: {
      categories: ['assumptions', 'methodology', 'results'],
      weightings: {
        assumptions: 0.4,
        methodology: 0.4,
        results: 0.2
      },
      minimumResponses: 5,
      confidenceThreshold: 0.7
    },
    sensitivity: {
      variables: ['growth', 'margins', 'wacc'],
      ranges: {
        growth: { min: -0.5, max: 2 },
        margins: { min: 0.5, max: 1.5 },
        wacc: { min: 0.8, max: 1.2 }
      },
      steps: 5,
      correlations: {
        growth: { margins: -0.2 }
      }
    },
    reporting: {
      templates: ['standard', 'detailed', 'executive'],
      sections: {
        summary: { required: true, customizable: true },
        assumptions: { required: true, customizable: true },
        analysis: { required: true, customizable: true }
      },
      branding: {
        allowLogo: true,
        allowColors: true,
        allowFonts: true
      }
    },
    automation: {
      updateFrequency: 24, // hours
      dataSources: ['crunchbase', 'yahoo_finance', 'bloomberg'],
      triggers: {
        marketChange: {
          condition: 'market_change > 0.05',
          action: 'recalculate_valuation'
        }
      }
    },
    aiEnhancements: {
      models: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
      tasks: ['sentiment', 'risk_analysis', 'peer_comparison'],
      confidenceThresholds: {
        sentiment: 0.8,
        risk_analysis: 0.85,
        peer_comparison: 0.75
      },
      feedbackLoop: true
    }
  }
  // Add similar configurations for other regions
};

// Validation Functions
export function validateIndustrySpecifics(data: ValuationFormData) {
  const warnings: Array<{
    field: keyof ValuationFormData;
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  }> = [];

  const region = enhancedRegionRules[data.region];
  if (!region?.industrySpecific) return warnings;

  const industryRules = region.industrySpecific[data.sector];
  if (!industryRules) return warnings;

  // Validate churn rate for SaaS
  if (industryRules.churnRate && data.churnRate) {
    if (data.churnRate > industryRules.churnRate.critical) {
      warnings.push({
        field: 'churnRate',
        message: 'Churn rate is critically high',
        severity: 'high',
        suggestion: industryRules.churnRate.expected
      });
    } else if (data.churnRate > industryRules.churnRate.warning) {
      warnings.push({
        field: 'churnRate',
        message: 'Churn rate is above industry average',
        severity: 'medium',
        suggestion: industryRules.churnRate.expected
      });
    }
  }

  // Validate seasonality
  if (industryRules.seasonality && data.monthlyRevenue) {
    const variance = calculateSeasonalVariance(data.monthlyRevenue, industryRules.seasonality);
    if (variance > industryRules.seasonality.varianceThreshold) {
      warnings.push({
        field: 'monthlyRevenue',
        message: 'Seasonal variance is higher than expected',
        severity: 'medium',
        suggestion: industryRules.seasonality.varianceThreshold
      });
    }
  }

  return warnings;
}

// Helper function to calculate seasonal variance
function calculateSeasonalVariance(monthlyRevenue: number[], seasonality: { peakMonths: string[]; lowMonths: string[]; varianceThreshold: number; }): number {
  // Implementation of seasonal variance calculation
  // This is a simplified version
  const peakRevenue = Math.max(...monthlyRevenue);
  const lowRevenue = Math.min(...monthlyRevenue);
  return (peakRevenue - lowRevenue) / peakRevenue;
}

export function performMonteCarloSimulation(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  if (!region?.monteCarlo) return null;

  const results = {
    iterations: region.monteCarlo.iterations,
    confidenceIntervals: {} as Record<string, { lower: number; upper: number }>,
    distributions: {} as Record<string, number[]>
  };

  // Simplified Monte Carlo simulation
  // In practice, this would be much more complex
  region.monteCarlo.confidenceIntervals.forEach(interval => {
    results.confidenceIntervals[interval] = {
      lower: calculateConfidenceInterval(data, interval, 'lower'),
      upper: calculateConfidenceInterval(data, interval, 'upper')
    };
  });

  return results;
}

// Helper function for confidence interval calculation
function calculateConfidenceInterval(data: ValuationFormData, interval: number, bound: 'lower' | 'upper'): number {
  // Simplified calculation
  // In practice, this would use proper statistical methods
  const base = data.revenue || 0;
  const factor = bound === 'lower' ? (1 - interval) : (1 + interval);
  return base * factor;
}

export function analyzePeerComparison(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  if (!region?.peerComparison) return null;

  // This would typically fetch peer data from external sources
  // For now, we'll return a simplified analysis structure
  return {
    metrics: region.peerComparison.metrics.map(metric => ({
      name: metric,
      value: data[metric as keyof ValuationFormData],
      peerAverage: 0, // Would be calculated from actual peer data
      percentile: 0 // Would be calculated from actual peer data
    })),
    adjustments: Object.entries(region.peerComparison.adjustmentFactors)
      .map(([factor, weight]) => ({
        factor,
        weight,
        impact: 0 // Would be calculated based on actual peer comparison
      }))
  };
}

export function processUserFeedback(data: ValuationFormData, feedback: Record<string, number>) {
  const region = enhancedRegionRules[data.region];
  if (!region?.userFeedback) return null;

  const results = {
    confidence: 0,
    adjustments: {} as Record<string, number>,
    suggestions: [] as string[]
  };

  // Calculate weighted feedback score
  let totalWeight = 0;
  let weightedScore = 0;

  Object.entries(feedback).forEach(([category, score]) => {
    const weight = region.userFeedback.weightings[category] || 0;
    totalWeight += weight;
    weightedScore += score * weight;
  });

  results.confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;

  return results;
}

export function performSensitivityAnalysis(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  if (!region?.sensitivity) return null;

  const results = {
    variables: {} as Record<string, {
      impact: number;
      scenarios: Array<{ value: number; outcome: number }>;
    }>,
    correlations: region.sensitivity.correlations
  };

  // Analyze each variable's impact
  region.sensitivity.variables.forEach(variable => {
    const range = region.sensitivity.ranges[variable];
    if (!range) return;

    const scenarios = [];
    const steps = region.sensitivity.steps;
    const stepSize = (range.max - range.min) / steps;

    for (let i = 0; i <= steps; i++) {
      const value = range.min + (stepSize * i);
      scenarios.push({
        value,
        outcome: calculateScenarioOutcome(data, variable, value)
      });
    }

    results.variables[variable] = {
      impact: calculateVariableImpact(scenarios),
      scenarios
    };
  });

  return results;
}

// Helper function to calculate scenario outcomes
function calculateScenarioOutcome(data: ValuationFormData, variable: string, value: number): number {
  // This would be a complex calculation based on the valuation model
  // For now, return a simplified calculation
  const baseValue = data.revenue || 0;
  return baseValue * (1 + value);
}

// Helper function to calculate variable impact
function calculateVariableImpact(scenarios: Array<{ value: number; outcome: number }>): number {
  if (scenarios.length < 2) return 0;
  const maxOutcome = Math.max(...scenarios.map(s => s.outcome));
  const minOutcome = Math.min(...scenarios.map(s => s.outcome));
  const baseOutcome = scenarios[Math.floor(scenarios.length / 2)].outcome;
  return (maxOutcome - minOutcome) / baseOutcome;
}

export function generateCustomReport(data: ValuationFormData, template: string) {
  const region = enhancedRegionRules[data.region];
  if (!region?.reporting) return null;

  if (!region.reporting.templates.includes(template)) {
    throw new Error(`Template ${template} not found`);
  }

  // This would generate a comprehensive report based on the template
  // For now, return a simplified structure
  return {
    template,
    sections: Object.entries(region.reporting.sections)
      .filter(([, config]) => config.required)
      .map(([section]) => ({
        name: section,
        content: generateReportSection(data, section)
      }))
  };
}

// Helper function to generate report sections
function generateReportSection(data: ValuationFormData, section: string): string {
  // This would generate detailed content for each section
  // For now, return a placeholder
  return `Content for ${section}`;
}

export function configureAutomation(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  if (!region?.automation) return null;

  // This would set up automated updates and triggers
  // For now, return the configuration
  return {
    schedule: {
      frequency: region.automation.updateFrequency,
      nextUpdate: new Date(Date.now() + region.automation.updateFrequency * 3600000)
    },
    dataSources: region.automation.dataSources,
    triggers: Object.entries(region.automation.triggers).map(([name, config]) => ({
      name,
      ...config
    }))
  };
}

export function applyAIEnhancements(data: ValuationFormData) {
  const region = enhancedRegionRules[data.region];
  if (!region?.aiEnhancements) return null;

  // This would coordinate AI-powered analysis across different aspects
  // For now, return a simplified structure
  return {
    models: region.aiEnhancements.models,
    analysis: Object.fromEntries(
      region.aiEnhancements.tasks.map(task => [
        task,
        {
          confidence: region.aiEnhancements.confidenceThresholds[task],
          result: null // Would be populated by actual AI analysis
        }
      ])
    )
  };
}

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