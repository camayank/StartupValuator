import { type ValuationFormData } from "./validations";
import { IndustryValidationEngine } from "./industry-validation";

interface QuickStartData {
  businessName: string;
  industry: string;
  stage: string;
  location: string;
}

interface AutoPopulatedData {
  marketSize?: number;
  competitors?: string[];
  metrics?: Record<string, any>;
  editable: boolean;
}

export const SmartEntrySystem = {
  // Initial Quick Entry configuration
  quickStart: {
    core_fields: {
      businessName: "text",
      industry: "select",
      stage: "select",
      location: "select"
    },
    
    // Background processing flags
    backgroundProcess: {
      marketSizeEstimation: true,
      competitorAnalysis: true,
      industryMetrics: true
    }
  },

  // Smart Form Population
  autoPopulate: async (quickStartData: QuickStartData): Promise<AutoPopulatedData> => {
    const industry = quickStartData.industry;
    const stage = quickStartData.stage;

    // Get industry-specific metrics
    const requiredMetrics = IndustryValidationEngine.getRequiredMetrics(industry as any);
    const recommendedMetrics = IndustryValidationEngine.getRecommendedMetrics(industry as any);

    // Get benchmarks for the industry and stage
    const metrics: Record<string, any> = {};
    [...requiredMetrics, ...recommendedMetrics].forEach(metric => {
      const benchmark = IndustryValidationEngine.getBenchmarks(industry as any, metric);
      if (benchmark) {
        metrics[metric] = {
          target: benchmark[stage]?.target,
          min: benchmark[stage]?.min
        };
      }
    });

    return {
      metrics,
      editable: true
    };
  },

  // Validate quick start data
  validateQuickStart: (data: QuickStartData): string[] => {
    const errors: string[] = [];

    if (!data.businessName?.trim()) {
      errors.push("Business name is required");
    }

    if (!data.industry) {
      errors.push("Industry selection is required");
    }

    if (!data.stage) {
      errors.push("Business stage is required");
    }

    if (!data.location) {
      errors.push("Location is required");
    }

    return errors;
  },

  // Generate suggestions based on quick start data
  generateSuggestions: (data: QuickStartData): Record<string, string[]> => {
    return {
      metrics: IndustryValidationEngine.getRequiredMetrics(data.industry as any),
      recommended: IndustryValidationEngine.getRecommendedMetrics(data.industry as any),
      nextSteps: [
        "Complete company profile",
        "Add financial metrics",
        "Review industry benchmarks",
        "Upload supporting documents"
      ]
    };
  }
};

export default SmartEntrySystem;
